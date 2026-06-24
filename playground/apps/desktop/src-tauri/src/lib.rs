use std::io::{Read, Write};
use std::sync::Mutex;
use tauri::{command, Emitter, Manager};
use portable_pty::{native_pty_system, PtySize, CommandBuilder, MasterPty};

struct AppState {
    master: Option<Box<dyn MasterPty + Send>>,
    writer: Option<Box<dyn Write + Send>>,
}

struct AppPtyState(Mutex<AppState>);

#[command]
fn pty_write(state: tauri::State<'_, AppPtyState>, data: String) -> Result<(), String> {
    eprintln!("[pty_write] received {} bytes: {:?}", data.len(), data);
    let mut pty = state.0.lock().map_err(|e| e.to_string())?;
    if let Some(writer) = pty.writer.as_mut() {
        writer.write_all(data.as_bytes()).map_err(|e| e.to_string())?;
        writer.flush().map_err(|e| e.to_string())?;
        eprintln!("[pty_write] wrote {} bytes to PTY", data.len());
    } else {
        eprintln!("[pty_write] ERROR: no writer available (PTY not initialized?)");
        return Err("PTY writer not initialized".to_string());
    }
    Ok(())
}

#[command]
fn pty_resize(state: tauri::State<'_, AppPtyState>, rows: u16, cols: u16) -> Result<(), String> {
    eprintln!("[pty_resize] rows={} cols={}", rows, cols);
    let pty = state.0.lock().map_err(|e| e.to_string())?;
    if let Some(master) = pty.master.as_ref() {
        master.resize(PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        }).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to Innate Playground.", name)
}

#[command]
fn get_platform() -> String {
    let os = std::env::consts::OS.to_string();
    let arch = std::env::consts::ARCH.to_string();
    format!("{}-{}", os, arch)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            eprintln!("[setup] spawning PTY...");
            let pty_system = native_pty_system();

            let pair = pty_system.openpty(PtySize {
                rows: 24,
                cols: 80,
                pixel_width: 0,
                pixel_height: 0,
            }).map_err(|e| {
                eprintln!("[setup] openpty failed: {}", e);
                e
            }).expect("Failed to open PTY");

            let cmd = if cfg!(windows) {
                CommandBuilder::new("cmd")
            } else {
                CommandBuilder::new("sh")
            };

            let _child = pair.slave.spawn_command(cmd)
                .map_err(|e| {
                    eprintln!("[setup] spawn_command failed: {}", e);
                    e
                })
                .expect("Failed to spawn shell");
            eprintln!("[setup] PTY shell spawned");

            let mut reader = pair.master.try_clone_reader()
                .expect("Failed to clone PTY reader");
            let writer = pair.master.take_writer()
                .expect("Failed to take PTY writer");
            let master = pair.master;

            app.manage(AppPtyState(Mutex::new(AppState {
                master: Some(master),
                writer: Some(writer),
            })));
            eprintln!("[setup] PTY state registered");

            let app_handle = app.handle().clone();
            std::thread::spawn(move || {
                let mut buf = [0u8; 4096];
                loop {
                    match reader.read(&mut buf) {
                        Ok(0) => {
                            eprintln!("[reader] EOF, exiting");
                            break;
                        }
                        Ok(n) => {
                            let data = String::from_utf8_lossy(&buf[..n]);
                            // Strip the BOM on first read so cmd's initial mode-switch sequence
                            // doesn't clobber the terminal's title/colors.
                            let cleaned = data.trim_start_matches('\u{FEFF}').to_string();
                            eprintln!("[reader] read {} bytes", n);
                            let _ = app_handle.emit("pty-output", cleaned);
                        }
                        Err(e) => {
                            if e.kind() == std::io::ErrorKind::BrokenPipe
                                || e.kind() == std::io::ErrorKind::UnexpectedEof
                            {
                                eprintln!("[reader] pipe closed: {}", e);
                                break;
                            }
                            eprintln!("[reader] error: {}", e);
                            let _ = app_handle.emit("pty-output", format!("\r\n[read error: {}]\r\n", e));
                            std::thread::sleep(std::time::Duration::from_millis(100));
                        }
                    }
                }
                let _ = app_handle.emit("pty-exit", "session ended");
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, get_platform, pty_write, pty_resize])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
