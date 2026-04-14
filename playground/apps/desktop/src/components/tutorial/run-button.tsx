"use client";

import { Button } from "@innate/ui";
import { Play, Terminal } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function RunButton({ command }: { command: string }) {
  const executeCommandInTerminal = useAppStore((s) => s.executeCommandInTerminal);

  return (
    <div className="my-3 rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => executeCommandInTerminal(command)}
          className="gap-2 h-9 px-4"
        >
          <Play className="size-4 fill-current" />
          运行
          <Terminal className="size-3.5 opacity-60" />
        </Button>
        <code className="text-sm text-muted-foreground font-mono flex-1 truncate select-all">
          $ {command}
        </code>
      </div>
    </div>
  );
}
