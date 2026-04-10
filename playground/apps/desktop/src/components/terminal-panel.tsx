"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card, Button } from "@innate/ui";
import { Minimize2, PanelRight, PanelBottom, Trash2, Terminal, Square } from "lucide-react";

export function TerminalPanel() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);
  const fitAddonRef = useRef<any>(null);
  const initializedRef = useRef(false);

  const {
    terminalPosition,
    terminalVisible,
    isExecuting,
    hideTerminal,
    toggleTerminalPosition,
    clearTerminal,
    killRunningCommand,
  } = useAppStore();

  // Initialize xterm.js and connect to PTY
  const initTerminal = useCallback(async () => {
    if (!terminalRef.current || initializedRef.current) return;
    initializedRef.current = true;

    // Dynamically import xterm.js (only in browser)
    const { Terminal } = await import("@xterm/xterm");
    const { FitAddon } = await import("@xterm/addon-fit");

    // Import CSS
    await import("@xterm/xterm/css/xterm.css");

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
      theme: {
        background: "#1a1a2e",
        foreground: "#e0e0e0",
        cursor: "#569cd6",
        selectionBackground: "#264f78",
        black: "#1a1a2e",
        red: "#f44747",
        green: "#6a9955",
        yellow: "#d7ba7d",
        blue: "#569cd6",
        magenta: "#c586c0",
        cyan: "#4ec9b0",
        white: "#e0e0e0",
        brightBlack: "#666666",
        brightRed: "#f44747",
        brightGreen: "#6a9955",
        brightYellow: "#d7ba7d",
        brightBlue: "#569cd6",
        brightMagenta: "#c586c0",
        brightCyan: "#4ec9b0",
        brightWhite: "#e0e0e0",
      },
      convertEol: true,
      scrollback: 5000,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Connect to Tauri PTY backend
    if ("__TAURI_INTERNALS__" in window) {
      const { listen } = await import("@tauri-apps/api/event");
      const { invoke } = await import("@tauri-apps/api/core");

      // Listen for PTY output
      await listen<string>("pty-output", (event) => {
        term.write(event.payload);
      });

      await listen<string>("pty-exit", () => {
        term.writeln("\r\n\x1b[33m[Session ended]\x1b[0m");
      });

      // Send user input to PTY
      term.onData((data) => {
        invoke("pty_write", { data });
      });

      // Handle resize
      term.onResize(({ cols, rows }) => {
        invoke("pty_resize", { rows, cols });
      });
    } else {
      // Web fallback
      term.writeln("\x1b[33m[Web Mode]\x1b[0m Terminal is available only in the desktop app.");
      term.writeln("");
      term.onData((data) => {
        if (data === "\r") {
          term.write("\r\n");
          term.writeln("\x1b[33m[Web Mode] Commands run only in the Tauri desktop app.\x1b[0m");
          term.write("\r\n");
        } else {
          term.write(data);
        }
      });
    }

    term.focus();
  }, []);

  // Initialize when visible
  useEffect(() => {
    if (terminalVisible && terminalRef.current && !initializedRef.current) {
      initTerminal();
    }
  }, [terminalVisible, initTerminal]);

  // Fit terminal when position changes
  useEffect(() => {
    if (fitAddonRef.current) {
      // Delay to let the container resize first
      const timer = setTimeout(() => {
        try {
          fitAddonRef.current.fit();
        } catch {}
        xtermRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [terminalPosition, terminalVisible]);

  // Handle container resize
  useEffect(() => {
    if (!terminalRef.current) return;

    const observer = new ResizeObserver(() => {
      try {
        fitAddonRef.current?.fit();
      } catch {}
    });
    observer.observe(terminalRef.current);
    return () => observer.disconnect();
  }, []);

  // Clear terminal
  const handleClear = useCallback(() => {
    if (xtermRef.current) {
      xtermRef.current.clear();
      xtermRef.current.focus();
    }
    clearTerminal();
  }, [clearTerminal]);

  // Write command to PTY (used by store)
  useEffect(() => {
    // Expose terminal write function globally for store to use
    (window as any).__ptyWrite = (data: string) => {
      if (xtermRef.current) {
        // Ensure terminal is visible first
        xtermRef.current.focus();
      }
    };
  }, []);

  if (!terminalVisible) return null;

  return (
    <Card
      className={`flex flex-col border-t overflow-hidden ${
        terminalPosition === "right"
          ? "w-[450px] border-l"
          : "h-[350px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Terminal className="text-primary-foreground" size={14} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">终端</span>
            {isExecuting && (
              <span className="flex items-center gap-1.5 text-xs text-primary">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                执行中
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isExecuting && (
            <Button variant="ghost" size="icon" onClick={killRunningCommand} title="停止">
              <Square size={14} />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleClear} title="清除输出">
            <Trash2 size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTerminalPosition}
            title={terminalPosition === "right" ? "切换到底部" : "切换到右侧"}
          >
            {terminalPosition === "right" ? <PanelBottom size={14} /> : <PanelRight size={14} />}
          </Button>
          <Button variant="ghost" size="icon" onClick={hideTerminal} title="最小化">
            <Minimize2 size={14} />
          </Button>
        </div>
      </div>

      {/* xterm.js container */}
      <div ref={terminalRef} className="flex-1 min-h-0" />
    </Card>
  );
}
