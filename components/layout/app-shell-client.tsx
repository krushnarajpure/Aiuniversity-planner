"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { PageFade } from "./page-fade";
import Link from "next/link";
import { Bot, PanelLeftClose, PanelLeftOpen } from "lucide-react";

export function AppShellClient({
  children,
  userName,
  unreadCount,
}: {
  children: React.ReactNode;
  userName?: string | null;
  unreadCount: number;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setSidebarCollapsed(window.localStorage.getItem("uni-planner-sidebar-collapsed") === "true");
  }, []);

  function toggleSidebar() {
    setSidebarCollapsed((collapsed) => {
      const nextCollapsed = !collapsed;
      window.localStorage.setItem("uni-planner-sidebar-collapsed", String(nextCollapsed));
      return nextCollapsed;
    });
  }

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      {sidebarCollapsed && <button type="button" onClick={toggleSidebar} aria-label="Expand sidebar" title="Expand sidebar" className="fixed left-0 top-1/2 z-30 hidden -translate-y-1/2 rounded-r-lg border border-l-0 border-slate-200 bg-card-light p-2 text-slate-500 shadow-sm transition hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-card-dark md:block"><PanelLeftOpen className="h-4 w-4" /></button>}
      <div className="flex-1 min-w-0">
        <Navbar userName={userName} unreadCount={unreadCount} onMenuClick={() => setMobileOpen(true)} />
        <main>
          <PageFade>{children}</PageFade>
        </main>
      </div>
      <Link
        href="/ai-copilot"
        aria-label="Ask AI Copilot"
        title="Ask AI Copilot"
        className="fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900"
      >
        <Bot className="h-5 w-5" />
      </Link>
    </div>
  );
}
