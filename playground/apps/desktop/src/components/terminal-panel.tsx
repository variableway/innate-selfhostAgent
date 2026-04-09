"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card, Button, ScrollArea } from "@innate/ui";
import { X, Minimize2, PanelRight, PanelBottom, Trash2, Terminal } from "lucide-react";

export function TerminalPanel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    terminalPosition,
    terminalVisible,
    terminalOutput,
    isExecuting,
    hideTerminal,
    toggleTerminalPosition,
    clearTerminal,
  } = useAppStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  if (!terminalVisible) return null;

  const renderOutput = (line: string, index: number) => {
    if (line.startsWith("$")) {
      return (
        <div key={index} className="flex items-center gap-2 py-0.5">
          <span className="text-primary font-bold">➜</span>
          <span className="text-cyan-400">~</span>
          <span className="text-foreground">{line.slice(2)}</span>
        </div>
      );
    }

    const parts = line.split(/(\x1b\[\d+m)/g);
    const elements: React.ReactNode[] = [];
    let currentColor = "";

    parts.forEach((part, i) => {
      if (part.startsWith("\x1b[")) {
        const code = part.slice(2, -1);
        switch (code) {
          case "32m":
            currentColor = "text-emerald-400";
            break;
          case "31m":
            currentColor = "text-rose-400";
            break;
          case "33m":
            currentColor = "text-amber-400";
            break;
          case "36m":
            currentColor = "text-cyan-400";
            break;
          case "35m":
            currentColor = "text-fuchsia-400";
            break;
          case "0m":
            currentColor = "";
            break;
        }
      } else if (part) {
        elements.push(
          <span key={i} className={currentColor}>
            {part}
          </span>
        );
      }
    });

    return <div key={index} className="py-0.5">{elements.length > 0 ? elements : line}</div>;
  };

  return (
    <Card
      className={`border-t ${
        terminalPosition === "right"
          ? "w-[450px] border-l"
          : "h-[350px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Terminal className="text-primary-foreground" size={16} />
          </div>
          <div>
            <span className="text-sm font-semibold">终端</span>
            {isExecuting && (
              <span className="flex items-center gap-1.5 text-xs text-primary ml-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                执行中
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={clearTerminal} title="清除输出">
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

      {/* Output */}
      <ScrollArea className="flex-1 h-[calc(100%-60px)]" ref={scrollRef}>
        <div className="p-4 font-mono text-sm space-y-1">
          {terminalOutput.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-8">
              <Terminal size={48} className="mb-4 opacity-20" />
              <p className="text-sm">点击教程中的&quot;运行&quot;按钮开始执行命令</p>
            </div>
          ) : (
            terminalOutput.map((line, index) => renderOutput(line, index))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
