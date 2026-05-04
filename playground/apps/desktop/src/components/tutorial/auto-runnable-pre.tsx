"use client";

import { Button } from "@innate/ui";
import { Play, Terminal, Copy, Check, Loader2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useState, useCallback, ReactNode } from "react";

// Languages that can be executed directly
const RUNNABLE_LANGS = new Set([
  "bash", "sh", "zsh", "shell",
  "python", "python3",
  "powershell", "ps1",
]);

// Map language to execution command prefix
function getRunCommand(code: string, lang: string): string {
  const trimmed = code.trim();

  switch (lang) {
    case "python":
    case "python3":
      // Write to temp file and run — handles multi-line, functions, imports
      return `python3 << 'PYEOF'\n${trimmed}\nPYEOF`;

    case "powershell":
    case "ps1":
      return trimmed;

    case "bash":
    case "sh":
    case "zsh":
    case "shell":
    default: {
      // For shell: single line → direct, multi-line → temp script
      const lines = trimmed.split("\n").filter((l) => l.trim());
      if (lines.length <= 1) {
        return trimmed;
      }
      return `cat << 'EOF' > /tmp/run-tutorial.sh\n${trimmed}\nEOF\nbash /tmp/run-tutorial.sh`;
    }
  }
}

// Extract text from React children (handles MDX nested elements)
function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return extractText((node as any).props?.children);
  }
  return "";
}

interface AutoRunnablePreProps {
  children?: ReactNode;
}

export function AutoRunnablePre({ children }: AutoRunnablePreProps) {
  const executeCommandInTerminal = useAppStore((s) => s.executeCommandInTerminal);
  const [copied, setCopied] = useState(false);
  const [runStatus, setRunStatus] = useState<"idle" | "sending" | "sent">("idle");

  // Parse the code block structure from MDX
  // MDX renders fenced code blocks as: <pre><code className="language-xxx">content</code></pre>
  let lang = "";
  let codeText = "";

  if (children && typeof children === "object" && "props" in children) {
    const codeEl = children as any;
    const className: string = codeEl.props?.className || "";
    const langMatch = /language-(\w+)/.exec(className);
    lang = langMatch ? langMatch[1] : "";
    codeText = extractText(codeEl.props?.children);
  } else {
    codeText = extractText(children);
  }

  const displayCode = codeText.replace(/\n$/, ""); // remove trailing newline from MDX
  const isRunnable = RUNNABLE_LANGS.has(lang);
  const hasContent = displayCode.trim().length > 0;

  const handleCopy = useCallback(async () => {
    if (!displayCode) return;
    await navigator.clipboard.writeText(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [displayCode]);

  const handleRun = useCallback(() => {
    if (!displayCode.trim()) return;
    setRunStatus("sending");
    const cmd = getRunCommand(displayCode, lang);
    executeCommandInTerminal(cmd);
    setTimeout(() => setRunStatus("sent"), 200);
    setTimeout(() => setRunStatus("idle"), 2000);
  }, [displayCode, lang, executeCommandInTerminal]);

  // Simple code block (no language, not runnable) — plain rendering
  if (!lang && !isRunnable) {
    return (
      <div className="my-3 rounded-lg border bg-muted/50 overflow-hidden">
        <pre className="p-3 overflow-x-auto text-sm">{children}</pre>
      </div>
    );
  }

  // Runnable or language-tagged code block
  return (
    <div className="my-3 rounded-lg border bg-muted/30 overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/40">
        <div className="flex items-center gap-2">
          <Terminal className="size-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-mono">{lang || "text"}</span>
        </div>
        <div className="flex items-center gap-1">
          {hasContent && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-7 w-7"
              title="复制"
            >
              {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            </Button>
          )}
          {isRunnable && hasContent && (
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
      {/* Code content */}
      <pre className="p-3 overflow-x-auto text-sm m-0">
        <code className="font-mono whitespace-pre">{displayCode}</code>
      </pre>
    </div>
  );
}
