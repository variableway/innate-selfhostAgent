@echo off
REM Run the desktop app (Tauri dev mode) from the repo root.
REM
REM Equivalent to: pnpm desktop:dev
REM Cross-platform: this .bat works in cmd.exe / PowerShell on Windows;
REM see run-desktop.sh for the bash equivalent on macOS / Linux / Git Bash.
REM
REM What it does:
REM   1. Regenerates the tutorial manifest from public/tutorials/
REM   2. Starts `tauri dev` which:
REM        - Runs the Next.js dev server on http://localhost:5001
REM        - Compiles the Rust backend (src-tauri/) - first build ~1-3 min
REM        - Opens a native Tauri window pointing at the dev server
REM
REM Logs:
REM   - Rust eprintln! / panic output  -> stdout of this script
REM   - Frontend console.log           -> DevTools inside the Tauri window (F12)
REM
REM Usage (from the repo root):
REM   scripts\run-desktop.bat
REM   .\scripts\run-desktop.bat
REM   cmd /c scripts\run-desktop.bat

setlocal

REM Resolve repo root from this script's location.
set "SCRIPT_DIR=%~dp0"
set "REPO_ROOT=%SCRIPT_DIR%.."
set "DESKTOP_DIR=%REPO_ROOT%\playground\apps\desktop"

if not exist "%DESKTOP_DIR%\package.json" (
  echo [x] Desktop app not found at: %DESKTOP_DIR%
  exit /b 1
)

if not exist "%DESKTOP_DIR%\node_modules\.bin\tauri.cmd" (
  echo [x] Tauri CLI not installed. Run "pnpm install" at the repo root first.
  echo     Looked for: %DESKTOP_DIR%\node_modules\.bin\tauri.cmd
  exit /b 1
)

REM (1) Regenerate the tutorial manifest so newly added MDX files are picked up.
echo [1/2] Regenerating tutorial manifest...
node "%DESKTOP_DIR%\scripts\generate-tutorials-manifest.mjs"
if errorlevel 1 (
  echo [x] manifest generation failed
  exit /b 1
)

REM (2) Hand off to `tauri dev` with stdio passed through.
echo [2/2] Starting Tauri dev mode (Ctrl+C to stop)...
cd /d "%DESKTOP_DIR%"
call "%DESKTOP_DIR%\node_modules\.bin\tauri.cmd" dev
endlocal
