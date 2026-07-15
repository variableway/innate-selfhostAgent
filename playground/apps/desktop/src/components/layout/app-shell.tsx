"use client";

import { ReactNode, Suspense, useEffect, useState } from "react";
import { SidebarProvider, SidebarInset, useIsMobile } from "@innate/ui";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MenuBar } from "@/components/layout/menu-bar";
import { StatusBar } from "@/components/layout/status-bar";
import { TerminalPanel } from "@/components/terminal-panel";
import { useAppStore } from "@/store/useAppStore";

function AppShellContent({ children }: { children: ReactNode }) {
  const { terminalPosition } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Disable default right-click context menu in Tauri desktop app
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handler);
    return () => document.removeEventListener("contextmenu", handler);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary animate-pulse" />
          <div className="h-4 w-24 bg-muted/60 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  // Force terminal to bottom on mobile
  const effectiveTerminalPosition = isMobile ? "bottom" : terminalPosition;

  return (
    <SidebarProvider>
      <Suspense>
        <AppSidebar />
      </Suspense>
      <SidebarInset className="overflow-hidden">
        {/* Menu Bar */}
        <MenuBar />

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          <div className="flex-1 overflow-auto min-h-0">{children}</div>

          {/* Terminal - Right Side (desktop only) */}
          {!isMobile && effectiveTerminalPosition === "right" && <TerminalPanel />}
        </div>

        {/* Terminal - Bottom */}
        {effectiveTerminalPosition === "bottom" && <TerminalPanel isMobile={isMobile} />}

        <StatusBar />
      </SidebarInset>
    </SidebarProvider>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return <AppShellContent>{children}</AppShellContent>;
}
