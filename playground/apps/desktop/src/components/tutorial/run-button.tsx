"use client";

import { Button } from "@innate/ui";
import { Play, Terminal, Check, Loader2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useState, useCallback } from "react";

export function RunButton({ command }: { command: string }) {
  const executeCommandInTerminal = useAppStore((s) => s.executeCommandInTerminal);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleRun = useCallback(() => {
    setStatus("sending");
    executeCommandInTerminal(command);
    // Show sending state briefly, then confirm sent
    setTimeout(() => setStatus("sent"), 200);
    setTimeout(() => setStatus("idle"), 2000);
  }, [command, executeCommandInTerminal]);

  return (
    <div className="my-3 rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={handleRun}
          className="gap-2 h-9 px-4"
          disabled={status === "sending"}
        >
          {status === "sending" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : status === "sent" ? (
            <Check className="size-4 text-emerald-500" />
          ) : (
            <Play className="size-4 fill-current" />
          )}
          {status === "sending" ? "发送中" : status === "sent" ? "已发送" : "运行"}
          <Terminal className="size-3.5 opacity-60" />
        </Button>
        <code className="text-sm text-muted-foreground font-mono flex-1 truncate select-all">
          $ {command}
        </code>
      </div>
    </div>
  );
}
