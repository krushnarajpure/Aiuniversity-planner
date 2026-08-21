"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { PageFade } from "./page-fade";
import Link from "next/link";
import { Bot } from "lucide-react";

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

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
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
