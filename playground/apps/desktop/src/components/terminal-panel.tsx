"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@innate/ui";
import {
  Minimize2,
  PanelRight,
  PanelBottom,
  Trash2,
  Terminal,
  Square,
  GripHorizontal,
  ZoomIn,
  ZoomOut,
  Search,
  X,
} from "lucide-react";

const FONT_SIZE_KEY = "innate-terminal-font-size";
const FONT_SIZES = [10, 11, 12, 13, 14, 15, 16, 18, 20];

function getSavedFontSize(): number {
  if (typeof window === "undefined") return 13;
  const saved = localStorage.getItem(FONT_SIZE_KEY);
  if (saved) {
    const parsed = parseInt(saved, 10);
    if (!Number.isNaN(parsed) && FONT_SIZES.includes(parsed)) return parsed;
  }
  return 13;
}

export function TerminalPanel({ isMobile = false }: { isMobile?: boolean }) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);
  const fitAddonRef = useRef<any>(null);
  const initializedRef = useRef(false);

  const [fontSize, setFontSize] = useState<number>(getSavedFontSize);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    terminalPosition,
    terminalVisible,
    isExecuting,
    hideTerminal,
    toggleTerminalPosition,
    clearTerminal,
    killRunningCommand,
    currentWorkspace,
    workspaces,
    defaultWorkspaceId,
    setTerminalReady,
    flushPendingCommands,
  } = useAppStore();

  // Resizable dimensions
  const [width, setWidth] = useState(480);
  const [height, setHeight] = useState(320);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0, size: 0 });

  // Mobile: clamp height to 40% of viewport on initial load
  useEffect(() => {
    if (isMobile && typeof window !== "undefined") {
      const maxH = window.innerHeight * 0.4;
      if (height > maxH) {
        setHeight(Math.min(320, maxH));
      }
    }
  }, [isMobile]);

  // Get workspace path
  const workspacePath =
    currentWorkspace?.path ||
    (defaultWorkspaceId ? workspaces.find((w) => w.id === defaultWorkspaceId)?.path : undefined);

  // Theme that matches the app's color scheme
  const theme = {
    background: "var(--color-background, #09090b)",
    foreground: "var(--color-foreground, #fafafa)",
    cursor: "var(--color-primary, #6366f1)",
    selectionBackground: "var(--color-primary, #6366f133)",
    selectionForeground: "var(--color-foreground, #fafafa)",
    black: "#18181b",
    red: "#ef4444",
    green: "#22c55e",
    yellow: "#eab308",
    blue: "#3b82f6",
    magenta: "#a855f7",
    cyan: "#06b6d4",
    white: "#fafafa",
    brightBlack: "#52525b",
    brightRed: "#f87171",
    brightGreen: "#4ade80",
    brightYellow: "#facc15",
    brightBlue: "#60a5fa",
    brightMagenta: "#c084fc",
    brightCyan: "#22d3ee",
    brightWhite: "#f4f4f5",
  };

  // Force bottom mode on mobile
  const isRight = !isMobile && terminalPosition === "right";

  // Resize handlers (mouse)
  const handleResizeStart = useCallback((e: React.MouseEvent, direction: "right" | "bottom") => {
    e.preventDefault();
    isDragging.current = true;
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      size: direction === "right" ? width : height,
    };

    const handleMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      if (direction === "right") {
        const delta = startPos.current.x - ev.clientX;
        const newWidth = Math.max(280, Math.min(800, startPos.current.size + delta));
        setWidth(newWidth);
      } else {
        const delta = ev.clientY - startPos.current.y;
        const maxH = isMobile ? window.innerHeight * 0.4 : 600;
        const newHeight = Math.max(150, Math.min(maxH, startPos.current.size + delta));
        setHeight(newHeight);
      }
    };

    const handleUp = () => {
      isDragging.current = false;
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
      setTimeout(() => {
        try { fitAddonRef.current?.fit(); } catch {}
      }, 50);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
  }, [width, height, isMobile]);

  // Touch resize handlers
  const handleTouchResizeStart = useCallback((e: React.TouchEvent, direction: "right" | "bottom") => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    isDragging.current = true;
    startPos.current = {
      x: touch.clientX,
      y: touch.clientY,
      size: direction === "right" ? width : height,
    };

    const handleTouchMove = (ev: TouchEvent) => {
      if (!isDragging.current || ev.touches.length !== 1) return;
      const t = ev.touches[0];
      if (direction === "right") {
        const delta = startPos.current.x - t.clientX;
        const newWidth = Math.max(280, Math.min(800, startPos.current.size + delta));
        setWidth(newWidth);
      } else {
        const delta = t.clientY - startPos.current.y;
        const maxH = isMobile ? window.innerHeight * 0.4 : 600;
        const newHeight = Math.max(150, Math.min(maxH, startPos.current.size + delta));
        setHeight(newHeight);
      }
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      setTimeout(() => {
        try { fitAddonRef.current?.fit(); } catch {}
      }, 50);
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
  }, [width, height, isMobile]);

  // Initialize xterm.js and connect to PTY
  const initTerminal = useCallback(async () => {
    if (!terminalRef.current) {
      console.warn("[initTerminal] terminalRef.current is null, aborting");
      return;
    }
    if (initializedRef.current) {
      console.log("[initTerminal] already initialized, skipping");
      return;
    }
    console.log("[initTerminal] starting...", { inTauri: "__TAURI_INTERNALS__" in window });

    const currentFontSize = fontSize;

    const term = new (await import("@xterm/xterm")).Terminal({
      cursorBlink: true,
      fontSize: currentFontSize,
      lineHeight: 1.4,
      fontFamily: "'Geist Mono', 'Cascadia Code', 'Fira Code', 'Consolas', monospace",
      theme,
      convertEol: true,
      scrollback: 5000,
    });

    const fitAddon = new (await import("@xterm/addon-fit")).FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    if ("__TAURI_INTERNALS__" in window) {
      const { listen } = await import("@tauri-apps/api/event");
      const { invoke } = await import("@tauri-apps/api/core");

      // Set up the listener FIRST, before marking initialized, so that any
      // command that fires from a queued flush is guaranteed to have a sink.
      const unlistenOutput = await listen<string>("pty-output", (event) => {
        term.write(event.payload);
      });
      console.log("[initTerminal] pty-output listener registered, unlisten type:", typeof unlistenOutput);

      await listen<string>("pty-exit", () => {
        term.writeln("\r\n\x1b[33m[Session ended]\x1b[0m");
      });

      term.onData((data) => {
        invoke("pty_write", { data });
      });

      term.onResize(({ cols, rows }) => {
        invoke("pty_resize", { rows, cols });
      });

      // Smoke-test the invoke path so the user sees a clear error if the
      // backend command is missing/blocked (no more silent failures).
      try {
        await invoke("pty_resize", { rows: 24, cols: 80 });
        console.log("[initTerminal] pty_resize smoke-test ok");
      } catch (err) {
        console.error("[initTerminal] pty_resize smoke-test FAILED:", err);
        term.writeln(`\r\n\x1b[31m[terminal] cannot reach PTY backend: ${err}\x1b[0m`);
      }

      term.writeln(`\x1b[1m\x1b[36mInnate Playground\x1b[0m - Desktop Terminal`);
      term.writeln(`\x1b[2mConnected to PTY. Run buttons in tutorials will write here.\x1b[0m`);

      // Note: cd to workspace path is handled by executeCommandInTerminal
      // so it doesn't race with user commands from RunButton
    } else {
      // Web mode: simulate a shell
      let cwd = workspacePath || "~/";
      let lineBuffer = "";

      const displayPath = cwd.startsWith("/Users/") ? cwd.replace(/\/Users\/[^/]+/, "~") : cwd;

      term.writeln(`\x1b[1m\x1b[36mInnate Playground\x1b[0m - Web Terminal`);
      term.writeln(`Workspace: ${displayPath}`);
      term.writeln("");
      term.write(`\x1b[32m${displayPath}\x1b[0m $ `);

      function handleLine(cmd: string) {
        if (!cmd) {
          term.write(`\x1b[32m${displayPath}\x1b[0m $ `);
          return;
        }
        simulateCommand(term, cmd, cwd, (newCwd) => {
          cwd = newCwd;
        }, displayPath);
      }

      // Listen for commands from RunButton via store's writeToPty
      const handleWebPty = (e: Event) => {
        const data = (e as CustomEvent).detail as string;
        if (!data) return;

        // Split by \r to handle command+enter sent by RunButton
        const parts = data.split("\r");
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          if (part) {
            lineBuffer += part;
            term.write(part);
          }
          // If this isn't the last part (or data ends with \r), it means Enter was pressed
          if (i < parts.length - 1 || data.endsWith("\r")) {
            const cmd = lineBuffer.trim();
            term.writeln("");
            lineBuffer = "";
            handleLine(cmd);
          }
        }
      };

      window.addEventListener("web-pty-write", handleWebPty);

      term.onData((data) => {
        if (data === "\r") {
          const cmd = lineBuffer.trim();
          term.writeln("");
          lineBuffer = "";
          handleLine(cmd);
        } else if (data === "\x7f") {
          if (lineBuffer.length > 0) {
            lineBuffer = lineBuffer.slice(0, -1);
            term.write("\b \b");
          }
        } else if (data === "\x03") {
          term.writeln("^C");
          lineBuffer = "";
          term.write(`\x1b[32m${displayPath}\x1b[0m $ `);
        } else {
          lineBuffer += data;
          term.write(data);
        }
      });
    }

    term.focus();

    // Mark initialized only after listeners are set up and xterm is open,
    // so a retry can happen on failure (and a stale ref doesn't mask it).
    initializedRef.current = true;
    console.log("[initTerminal] initialization complete, marking ready");

    // Brief delay to ensure xterm.js rendering and PTY listener are fully settled
    // before marking ready and flushing queued commands
    await new Promise<void>((resolve) => setTimeout(resolve, 100));

    // Mark terminal as ready and flush any queued commands
    setTerminalReady(true);
    flushPendingCommands();
  }, [workspacePath, fontSize, setTerminalReady, flushPendingCommands]);

  // Font size helpers
  const increaseFontSize = useCallback(() => {
    const idx = FONT_SIZES.indexOf(fontSize);
    const next = idx >= 0 && idx < FONT_SIZES.length - 1 ? FONT_SIZES[idx + 1] : Math.min(20, fontSize + 1);
    setFontSize(next);
    localStorage.setItem(FONT_SIZE_KEY, String(next));
  }, [fontSize]);

  const decreaseFontSize = useCallback(() => {
    const idx = FONT_SIZES.indexOf(fontSize);
    const prev = idx > 0 ? FONT_SIZES[idx - 1] : Math.max(10, fontSize - 1);
    setFontSize(prev);
    localStorage.setItem(FONT_SIZE_KEY, String(prev));
  }, [fontSize]);

  // Initialize once when the DOM ref is available. We intentionally
  // do NOT gate this on `terminalVisible` — the panel handles its own
  // visibility via `display:none`, and the xterm + PTY listener must
  // be alive from the start so we don't lose early shell output (and
  // so a queued command's flush actually has a sink to write to).
  useEffect(() => {
    if (terminalRef.current && !initializedRef.current) {
      initTerminal();
    }
  }, [initTerminal]);

  // Fit terminal when position or size changes
  useEffect(() => {
    if (fitAddonRef.current) {
      const timer = setTimeout(() => {
        try { fitAddonRef.current?.fit(); } catch {}
        xtermRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [terminalPosition, terminalVisible, width, height, isMobile]);

  // Handle container resize
  useEffect(() => {
    if (!terminalRef.current) return;
    const observer = new ResizeObserver(() => {
      try { fitAddonRef.current?.fit(); } catch {}
    });
    observer.observe(terminalRef.current);
    return () => observer.disconnect();
  }, []);

  // Font size change: update xterm options, re-fit, notify PTY
  useEffect(() => {
    if (!xtermRef.current) return;
    xtermRef.current.options.fontSize = fontSize;
    const timer = setTimeout(() => {
      try {
        fitAddonRef.current?.fit();
      } catch {}
      // Notify PTY backend of new dimensions if connected
      if (xtermRef.current && "__TAURI_INTERNALS__" in window) {
        const { cols, rows } = xtermRef.current;
        if (cols && rows) {
          import("@tauri-apps/api/core")
            .then(({ invoke }) => invoke("pty_resize", { rows, cols }))
            .catch(() => {});
        }
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [fontSize]);

  // Search visibility: focus input when shown
  useEffect(() => {
    if (searchVisible) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [searchVisible]);

  // Keyboard shortcut: Ctrl+Shift+F toggles search, Esc closes it
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setSearchVisible((v) => !v);
      }
      if (e.key === "Escape" && searchVisible) {
        setSearchVisible(false);
        xtermRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [searchVisible]);

  // Clear terminal
  const handleClear = useCallback(() => {
    if (xtermRef.current) {
      xtermRef.current.clear();
      xtermRef.current.focus();
    }
    clearTerminal();
  }, [clearTerminal]);

  // Keep the panel mounted even when hidden so the xterm instance and the
  // pty-output listener survive hide/show cycles. Hiding via display:none
  // avoids the React unmount/remount race that previously left the listener
  // unregistered after the first hide.

  // Mobile button/icon size
  const btnSize = isMobile ? "size-8 min-h-[44px] min-w-[44px]" : "size-6";
  const iconSize = isMobile ? 14 : 12;
  const mobileMaxHeight = typeof window !== "undefined" ? window.innerHeight * 0.4 : 320;

  return (
    <div
      className={`flex flex-col shrink-0 border-t overflow-hidden bg-card relative ${
        isRight ? "border-l" : ""
      }`}
      style={{
        ...(isRight ? { width } : { height }),
        ...(terminalVisible ? {} : { display: "none" }),
        ...(isMobile && !isRight ? { maxHeight: `${mobileMaxHeight}px` } : {}),
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 md:px-3 py-1.5 bg-muted/30 border-b shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
            <Terminal className="text-primary" size={12} />
          </div>
          <span className="text-xs font-medium text-muted-foreground">终端</span>
          {isExecuting && (
            <span className="flex items-center gap-1 text-xs text-primary">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              执行中
            </span>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          {/* Font size controls */}
          <div className="flex items-center rounded-md border bg-muted/40 px-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={decreaseFontSize}
              disabled={fontSize <= 10}
              title="缩小字体"
              className={`${isMobile ? "size-8 min-h-[44px] min-w-[44px]" : "size-5"} hover:bg-muted`}
            >
              <ZoomOut size={iconSize} />
            </Button>
            <span className="text-[10px] tabular-nums text-muted-foreground w-8 text-center select-none">
              {fontSize}px
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={increaseFontSize}
              disabled={fontSize >= 20}
              title="放大字体"
              className={`${isMobile ? "size-8 min-h-[44px] min-w-[44px]" : "size-5"} hover:bg-muted`}
            >
              <ZoomIn size={iconSize} />
            </Button>
          </div>

          <div className="w-px h-4 bg-border mx-1" />

          {/* Search toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchVisible((v) => !v)}
            title="搜索 (Ctrl+Shift+F)"
            className={`${btnSize} ${searchVisible ? "bg-muted text-primary" : ""}`}
          >
            <Search size={iconSize} />
          </Button>

          <div className="w-px h-4 bg-border mx-1" />

          {isExecuting && (
            <Button variant="ghost" size="icon" onClick={killRunningCommand} title="停止" className={btnSize}>
              <Square size={iconSize} />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleClear} title="清除" className={btnSize}>
            <Trash2 size={iconSize} />
          </Button>

          <div className="w-px h-4 bg-border mx-1" />

          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTerminalPosition}
              title={isRight ? "切换到底部" : "切换到右侧"}
              className={btnSize}
            >
              {isRight ? <PanelBottom size={iconSize} /> : <PanelRight size={iconSize} />}
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={hideTerminal} title="关闭" className={btnSize}>
            <Minimize2 size={iconSize} />
          </Button>
        </div>
      </div>

      {/* Search bar */}
      {searchVisible && (
        <div className={`flex items-center gap-2 px-2 md:px-3 py-1.5 bg-muted/20 border-b shrink-0 ${isMobile ? "flex-wrap" : ""}`}>
          <Search size={iconSize} className="text-muted-foreground shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索终端内容..."
            className="flex-1 min-w-0 bg-transparent text-xs outline-none placeholder:text-muted-foreground/50 text-foreground"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // TODO: trigger search next when @xterm/addon-search is installed
                // searchAddonRef.current?.findNext(searchQuery);
              }
              if (e.key === "Escape") {
                setSearchVisible(false);
                xtermRef.current?.focus();
              }
            }}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearchQuery("");
                searchInputRef.current?.focus();
              }}
              title="清除"
              className={isMobile ? "size-8 min-h-[44px] min-w-[44px]" : "size-5"}
            >
              <X size={iconSize} />
            </Button>
          )}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                // TODO: search previous when @xterm/addon-search is installed
                // searchAddonRef.current?.findPrevious(searchQuery);
              }}
              title="上一个"
              className={isMobile ? "size-8 min-h-[44px] min-w-[44px]" : "size-6"}
              disabled
            >
              <span className="text-xs leading-none">↑</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                // TODO: search next when @xterm/addon-search is installed
                // searchAddonRef.current?.findNext(searchQuery);
              }}
              title="下一个"
              className={isMobile ? "size-8 min-h-[44px] min-w-[44px]" : "size-6"}
              disabled
            >
              <span className="text-xs leading-none">↓</span>
            </Button>
          </div>
          <span className="text-[10px] text-muted-foreground/60 select-none hidden md:inline">Ctrl+Shift+F</span>
        </div>
      )}

      {/* xterm.js container */}
      <div ref={terminalRef} className="flex-1 min-h-0" />

      {/* Resize handle */}
      {isRight ? (
        <div
          className={`absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/30 active:bg-primary/50 z-10 transition-colors ${isMobile ? "hidden" : ""}`}
          onMouseDown={(e) => handleResizeStart(e, "right")}
        />
      ) : (
        <div
          className={`cursor-row-resize hover:bg-primary/30 active:bg-primary/50 z-10 transition-colors flex items-center justify-center ${isMobile ? "h-3" : "h-1.5"}`}
          onMouseDown={(e) => handleResizeStart(e, "bottom")}
          onTouchStart={(e) => handleTouchResizeStart(e, "bottom")}
        >
          <GripHorizontal size={isMobile ? 18 : 12} className="text-muted-foreground/50" />
        </div>
      )}
    </div>
  );
}

// Simulate common commands for web mode
function simulateCommand(
  term: any,
  cmd: string,
  cwd: string,
  setCwd: (newCwd: string) => void,
  displayPath: string
) {
  const commands: Record<string, string[]> = {
    "node --version": ["v22.0.0"],
    "node -v": ["v22.0.0"],
    "npm --version": ["10.5.0"],
    "npm -v": ["10.5.0"],
    "python --version": ["Python 3.12.0"],
    "python3 --version": ["Python 3.12.0"],
    "git --version": ["git version 2.45.0"],
    "echo hello": ["hello"],
    "whoami": ["user"],
    "ls": ["node_modules  package.json  src  README.md"],
    "date": [new Date().toString()],
    "uname -a": ["Darwin Kernel Version 24.0.0"],
    "which node": ["/usr/local/bin/node"],
    "brew --version": ["Homebrew 4.2.0"],
  };

  setTimeout(() => {
    let matched = false;
    for (const [pattern, output] of Object.entries(commands)) {
      if (cmd === pattern) {
        output.forEach((line) => term.writeln(line));
        matched = true;
        break;
      }
    }

    if (!matched) {
      if (cmd.startsWith("echo ")) {
        term.writeln(cmd.slice(5));
      } else if (cmd === "pwd") {
        term.writeln(cwd);
      } else if (cmd.startsWith("cd ")) {
        const target = cmd.slice(3).trim();
        if (target === "~" || target === "") {
          setCwd("~/");
          term.write(`\x1b[32m~\x1b[0m $ `);
          return;
        }
        setCwd(target);
        const dp = target.startsWith("/Users/") ? target.replace(/\/Users\/[^/]+/, "~") : target;
        term.write(`\x1b[32m${dp}\x1b[0m $ `);
        return;
      } else if (cmd.startsWith("cat ")) {
        term.writeln(`\x1b[33m[Web Mode]\x1b[0m File reading requires the desktop app.`);
      } else if (cmd.startsWith("mkdir ") || cmd.startsWith("touch ")) {
        term.writeln(`\x1b[32m[Web Mode]\x1b[0m Simulated: ${cmd}`);
      } else if (cmd.includes("install")) {
        term.writeln(`\x1b[36m⠋\x1b[0m Installing...`);
        setTimeout(() => {
          term.writeln(`\x1b[32m✔\x1b[0m Installation complete (simulated)`);
          term.write(`\x1b[32m${displayPath}\x1b[0m $ `);
        }, 800);
        return;
      } else {
        term.writeln(`\x1b[33m[Web Mode]\x1b[0m ${cmd}`);
      }
    }

    term.write(`\x1b[32m${displayPath}\x1b[0m $ `);
  }, 150);
}
