"use client";

import { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@innate/ui";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { StatusBar } from "@/components/layout/status-bar";
import { TerminalPanel } from "@/components/terminal-panel";
import { useAppStore } from "@/store/useAppStore";

export function AppShellInner({ children }: { children: ReactNode }) {
  const { terminalVisible, terminalPosition } = useAppStore();

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          <SidebarInset className="flex-1 overflow-hidden">
            <div className="flex-1 overflow-auto">{children}</div>
          </SidebarInset>
          
          {/* Terminal - Right Side */}
          {terminalVisible && terminalPosition === "right" && (
            <TerminalPanel />
          )}
        </div>
        
        {/* Terminal - Bottom */}
        {terminalVisible && terminalPosition === "bottom" && (
          <TerminalPanel />
        )}
        
        <StatusBar />
      </div>
    </SidebarProvider>
  );
}
