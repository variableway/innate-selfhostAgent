"use client";

import { Button } from "@innate/ui";
import { Play, Terminal, Copy, Check, Loader2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useState, useCallback, ReactNode } from "react";
import { getRunCommand } from "@/lib/run-command";

interface RunnableCodeBlockProps {
  code?: string;
  language?: string;
  runnable?: boolean;
  children?: ReactNode;
}

function extractTextContent(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractTextContent).join("");
  if (node && typeof node === "object" && "props" in node) {
    const child = (node as any).props?.children;
    return extractTextContent(child);
  }
  return "";
}

export function RunnableCodeBlock({
  code,
  language = "bash",
  runnable = true,
  children,
}: RunnableCodeBlockProps) {
  const executeCommandInTerminal = useAppStore((s) => s.executeCommandInTerminal);
  const ptyShell = useAppStore((s) => s.ptyShell);
  const [copied, setCopied] = useState(false);
  const [runStatus, setRunStatus] = useState<"idle" | "sending" | "sent">("idle");

  // Support both `code` prop and `children`
  // MDX template literals require escaping backticks with \`, so we unescape them
  const rawContent = (code || extractTextContent(children) || "").replace(/\\`/g, "`");
  const displayContent = rawContent.trim();

  // Whether to show the "运行" button at all: the `{executable}` marker opts
  // the block in, and the language must be one we know how to run.
  const hasContent = displayContent.length > 0;
  const showRun = runnable && hasContent;

  const handleCopy = async () => {
    if (!displayContent) return;
    await navigator.clipboard.writeText(displayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = useCallback(() => {
    if (!displayContent) return;
    setRunStatus("sending");
    // Delegate to the shared language-aware command builder. `ptyShell`
    // tells it whether the actual PTY is bash-like (use heredoc) or
    // cmd.exe (write a .bat / .ps1 first).
    executeCommandInTerminal(getRunCommand(displayContent, language, ptyShell));
    setTimeout(() => setRunStatus("sent"), 200);
    setTimeout(() => setRunStatus("idle"), 2000);
  }, [displayContent, language, ptyShell, executeCommandInTerminal]);

  return (
    <div className="my-3 rounded-lg border bg-muted/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/40">
        <div className="flex items-center gap-2">
          <Terminal className="size-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-mono">{language}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-7 w-7"
            title="复制"
          >
            {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
          </Button>
          {showRun && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRun}
              className="gap-1.5 h-7 text-xs"
              disabled={runStatus === "sending"}
            >
              {runStatus === "sending" ? (
                <Loader2 className="size-3 animate-spin" />
              ) : runStatus === "sent" ? (
                <Check className="size-3 text-emerald-500" />
              ) : (
                <Play className="size-3 fill-current" />
              )}
              {runStatus === "sending" ? "发送中" : runStatus === "sent" ? "已发送" : "运行"}
            </Button>
          )}
        </div>
      </div>
      {/* Code */}
      <pre className="p-3 overflow-x-auto text-sm m-0">
        <code className="font-mono whitespace-pre">{displayContent}</code>
      </pre>
    </div>
  );
}
