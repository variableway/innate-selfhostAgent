"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Minimize2, PanelRight, PanelBottom, Trash2, TerminalIcon, Command } from "lucide-react";
import { Button } from "@innate/ui";

export function TerminalView() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const {
    terminalPosition,
    terminalVisible,
    isExecuting,
    hideTerminal,
    toggleTerminalPosition,
    clearTerminal,
    setIsExecuting,
    terminalEntries,
  } = useAppStore();

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalEntries]);

  // Focus input when terminal becomes visible
  useEffect(() => {
    if (terminalVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [terminalVisible]);

  const handleExecute = useCallback(() => {
    if (!input.trim()) return;

    const command = input.trim();
    const { addTerminalEntry, showTerminal } = useAppStore.getState();
    addTerminalEntry({ type: "command", text: `$ ${command}` });
    setCommandHistory((prev) => [...prev, command]);
    setHistoryIndex(-1);

    setIsExecuting(true);
    setTimeout(() => {
      addTerminalEntry({ type: "stdout", text: "" });
      addTerminalEntry({ type: "stdout", text: "  \x1b[36mℹ\x1b[0m  正在执行命令..." });
      addTerminalEntry({ type: "stdout", text: "" });

      setTimeout(() => {
        addTerminalEntry({ type: "stdout", text: "  \x1b[32m✓\x1b[0m  命令执行成功！" });
        addTerminalEntry({ type: "stdout", text: "" });
        setIsExecuting(false);
      }, 800);
    }, 300);

    setInput("");
  }, [input, setIsExecuting]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleExecute();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    }
  };

  const renderOutput = (entry: { type: string; text: string }, index: number) => {
    const line = entry.text;

    if (line.startsWith("$")) {
      return (
        <div key={index} className="flex items-center gap-2 py-0.5">
          <span className="text-primary font-bold">➜</span>
          <span className="text-cyan-400">~</span>
          <span className="text-foreground">{line.slice(2)}</span>
        </div>
      );
    }

    // Parse ANSI colors
    const parts = line.split(/(\x1b\[\d+m)/g);
    const elements: React.ReactNode[] = [];
    let currentColor = "";

    parts.forEach((part, i) => {
      if (part.startsWith("\x1b[")) {
        const code = part.slice(2, -1);
        switch (code) {
          case "32m": currentColor = "text-emerald-400"; break;
          case "31m": currentColor = "text-rose-400"; break;
          case "33m": currentColor = "text-amber-400"; break;
          case "36m": currentColor = "text-cyan-400"; break;
          case "35m": currentColor = "text-fuchsia-400"; break;
          case "0m": currentColor = ""; break;
          default: currentColor = "";
        }
      } else if (part) {
        elements.push(
          <span key={i} className={currentColor}>
            {part}
          </span>
        );
      }
    });

    return (
      <div key={index} className="py-0.5">
        {elements.length > 0 ? elements : line}
      </div>
    );
  };

  if (!terminalVisible) return null;

  return (
    <div
      className={`bg-background flex flex-col border-border animate-in slide-in-from-bottom-2 ${
        terminalPosition === "right" ? "w-[450px] border-l" : "h-[350px] border-t"
      }`}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-md">
            <TerminalIcon size={16} className="text-primary-foreground" />
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

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={clearTerminal}
            title="清除输出"
            className="h-8 w-8"
          >
            <Trash2 size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTerminalPosition}
            title={terminalPosition === "right" ? "切换到底部" : "切换到右侧"}
            className="h-8 w-8"
          >
            {terminalPosition === "right" ? <PanelBottom size={14} /> : <PanelRight size={14} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={hideTerminal}
            title="最小化"
            className="h-8 w-8"
          >
            <Minimize2 size={14} />
          </Button>
        </div>
      </div>

      {/* Terminal Output */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-auto p-4 font-mono text-sm space-y-1 bg-background"
        style={{ fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace", fontSize: 13 }}
      >
        {terminalEntries.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <Command size={48} className="mb-4 opacity-20" />
            <p className="text-sm">点击教程中的"运行"按钮开始执行命令</p>
            <p className="text-xs mt-2 opacity-60">或直接在此输入命令</p>
          </div>
        ) : (
          terminalEntries.map((entry, index) => renderOutput(entry, index))
        )}
      </div>

      {/* Terminal Input */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-t border-border bg-muted/30">
        <div className="flex items-center gap-2 text-primary shrink-0">
          <span className="font-bold">➜</span>
          <span className="text-cyan-400">~</span>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入命令..."
          disabled={isExecuting}
          className="flex-1 bg-transparent text-foreground font-mono text-sm placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
        />
        {isExecuting && (
          <div className="flex items-center gap-1 text-primary text-xs">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            执行中
          </div>
        )}
      </div>
    </div>
  );
}
