"use client";

import { useState } from "react";
import { Button } from "@innate/ui";
import { Apple, Monitor } from "lucide-react";

type Platform = "unix" | "windows";

interface PlatformTabsProps {
  unix: React.ReactNode;
  windows: React.ReactNode;
  defaultPlatform?: Platform;
}

export function PlatformTabs({ unix, windows, defaultPlatform = "unix" }: PlatformTabsProps) {
  const [platform, setPlatform] = useState<Platform>(defaultPlatform);

  return (
    <div className="my-4 rounded-lg border border-border overflow-hidden">
      <div className="flex items-center gap-1 px-2 py-1.5 border-b bg-muted/50">
        <Button
          variant={platform === "unix" ? "default" : "ghost"}
          size="sm"
          onClick={() => setPlatform("unix")}
          className={`gap-1.5 h-7 text-xs rounded-md ${platform === "unix" ? "bg-primary/10 text-primary hover:bg-primary/15" : "text-muted-foreground"}`}
        >
          <Apple className="size-3.5" />
          macOS / Linux
        </Button>
        <Button
          variant={platform === "windows" ? "default" : "ghost"}
          size="sm"
          onClick={() => setPlatform("windows")}
          className={`gap-1.5 h-7 text-xs rounded-md ${platform === "windows" ? "bg-primary/10 text-primary hover:bg-primary/15" : "text-muted-foreground"}`}
        >
          <Monitor className="size-3.5" />
          Windows
        </Button>
      </div>
      <div className="[&_>_*]:my-0 [&_>_*]:rounded-none [&_>_*]:border-0">
        {platform === "unix" ? unix : windows}
      </div>
    </div>
  );
}
