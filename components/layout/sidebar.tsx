"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  CalendarClock,
  Brain,
  Clock,
  BarChart3,
  Bell,
  User,
  Settings,
  X,
  Library,
  Bot,
  Mail,
  Video,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/exams", label: "Exams", icon: CalendarClock },
  { href: "/study-planner", label: "Study Timetable", icon: Clock },
  { href: "/planner", label: "Study Planner", icon: Brain },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/study-material", label: "Study Material", icon: Library },
  { href: "/ai-copilot", label: "AI Copilot", icon: Bot },
  { href: "/email-assistant", label: "Email Assistant", icon: Mail },
  { href: "/ai-interview", label: "AI Interview", icon: Video },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

function SidebarLinks({ onNavigate, collapsed = false }: { onNavigate?: () => void; collapsed?: boolean }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-label={collapsed ? link.label : undefined}
            title={collapsed ? link.label : undefined}
            className={`flex items-center ${collapsed ? "justify-center" : ""} gap-3 px-3 py-2 rounded-lg text-small font-medium transition ${isActive
              ? "bg-primary/10 text-primary"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
          >
            <link.icon className="w-4 h-4" />
            {!collapsed && link.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2 px-2 mb-8">
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-small">
        AI
      </div>
      <span className="font-semibold text-body">Uni Planner</span>
    </div>
  );
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }: { collapsed: boolean; onToggle: () => void; mobileOpen: boolean; onCloseMobile: () => void }) {
  return (
    <>
      {/* Desktop sidebar — always visible */}
      <aside className={`hidden md:flex md:flex-col shrink-0 border-r border-slate-200 dark:border-slate-700 bg-card-light dark:bg-card-dark h-screen sticky top-0 py-6 px-4 transition-[width,padding,border-color] duration-300 ${collapsed ? "w-0 overflow-hidden border-transparent px-0" : "w-60"}`}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} mb-8`}>
          {!collapsed && <Logo />}
          {!collapsed && <button type="button" onClick={onToggle} aria-label="Collapse sidebar" title="Collapse sidebar" className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary dark:hover:bg-slate-700"><PanelLeftClose className="h-4 w-4" /></button>}
        </div>
        <SidebarLinks collapsed={collapsed} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed top-0 left-0 h-screen w-64 bg-card-light dark:bg-card-dark z-50 py-6 px-4 md:hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <Logo />
                <button onClick={onCloseMobile} aria-label="Close menu">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <SidebarLinks onNavigate={onCloseMobile} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
