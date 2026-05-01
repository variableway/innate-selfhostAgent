"use client";

import { Button } from "@innate/ui";
import { Play, Terminal, Copy, Check } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";

interface RunnableCodeBlockProps {
  code: string;
  language?: string;
  runnable?: boolean;
}

export function RunnableCodeBlock({ code, language = "bash", runnable = true }: RunnableCodeBlockProps) {
  const executeCommandInTerminal = useAppStore((s) => s.executeCommandInTerminal);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    // 如果代码是多行的，可能需要特殊处理
    // 简单起见，逐行执行或执行整个脚本
    const lines = code.split("\n").filter((l) => l.trim() && !l.trim().startsWith("#") && !l.trim().startsWith("echo"));
    if (lines.length === 1) {
      executeCommandInTerminal(lines[0].trim());
    } else {
      // 多行脚本：保存为临时文件后执行
      executeCommandInTerminal(`cat << 'EOF' > /tmp/run-tutorial.sh\n${code}\nEOF\nbash /tmp/run-tutorial.sh`);
    }
  };

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
          {runnable && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRun}
              className="gap-1.5 h-7 text-xs"
            >
              <Play className="size-3 fill-current" />
              运行
            </Button>
          )}
        </div>
      </div>
      {/* Code */}
      <pre className="p-3 overflow-x-auto text-sm m-0">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}
