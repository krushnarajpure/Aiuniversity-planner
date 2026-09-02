"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
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
  BriefcaseBusiness,
  Sparkles,
  Map,
  X,
  Library,
  Bot,
  Video,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  CheckCircle2,
  Activity,
} from "lucide-react";

const dashboardLink = { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard };

const academicsLinks = [
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/exams", label: "Exams", icon: CalendarClock },
  { href: "/study-planner", label: "Study Timetable", icon: Clock },
  { href: "/planner", label: "Study Planner", icon: Brain },
  { href: "/study-material", label: "Study Material", icon: Library },
  { href: "/analytics", label: "Academic Analytics", icon: BarChart3 },
];

const aiToolsLinks = [
  { href: "/ai-copilot", label: "AI Copilot", icon: Bot },
  { href: "/ai-interview", label: "AI Interview", icon: Video },
];

const placementLinks = [
  { href: "/placement/jobs", label: "Job Portal", icon: BriefcaseBusiness },
  { href: "/placement/resume-builder", label: "Resume Builder", icon: FileText },
  { href: "/placement/resume-analyzer", label: "Resume Analyzer", icon: Sparkles },
  { href: "/placement/aptitude", label: "Aptitude Test", icon: Brain },
  { href: "/placement/roadmap", label: "Roadmap", icon: Map },
];

const bottomLinks = [
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

function SidebarLinks({ onNavigate, collapsed = false }: { onNavigate?: () => void; collapsed?: boolean }) {
  const pathname = usePathname() ?? "";
  const { data: session } = useSession();

  // Auto-open groups based on current pathname
  const [academicsOpen, setAcademicsOpen] = useState(
    academicsLinks.some((link) => pathname.startsWith(link.href))
  );
  const [aiToolsOpen, setAiToolsOpen] = useState(
    aiToolsLinks.some((link) => pathname.startsWith(link.href))
  );
  const [placementOpen, setPlacementOpen] = useState(
    placementLinks.some((link) => pathname.startsWith(link.href))
  );

  if (session?.user?.role === "ORGANIZATION") {
    const organizationLinks = [
      ["/organization", "Dashboard", LayoutDashboard],
      ["/organization/profile", "Company Profile", User],
      ["/organization/jobs", "Jobs", BriefcaseBusiness],
      ["/organization/applicants", "Applicants", ClipboardList],
      ["/organization/shortlisted", "Shortlisted", CheckCircle2],
      ["/organization/aptitude", "Aptitude Tests", Brain],
      ["/organization/interviews", "Interviews", CalendarClock],
      ["/organization/pipeline", "Recruitment Pipeline", Activity],
      ["/organization/analytics", "Analytics", BarChart3],
      ["/organization/notifications", "Notifications", Bell],
      ["/organization/settings", "Settings", Settings],
    ] as const;

    return (
      <nav className="flex flex-col gap-1">
        {organizationLinks.map(([href, label, Icon]) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-label={collapsed ? label : undefined}
            title={collapsed ? label : undefined}
            className={`flex items-center ${collapsed ? "justify-center" : ""} gap-3 rounded-lg px-3 py-2 text-small font-medium transition ${pathname === href || (href !== "/organization" && pathname.startsWith(href))
              ? "bg-primary/10 text-primary"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
          >
            <Icon className="h-4 w-4" />
            {!collapsed && label}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-1">
      {/* Dashboard */}
      <Link
        href={dashboardLink.href}
        onClick={onNavigate}
        aria-label={collapsed ? dashboardLink.label : undefined}
        title={collapsed ? dashboardLink.label : undefined}
        className={`flex items-center ${collapsed ? "justify-center" : ""} gap-3 px-3 py-2 rounded-lg text-small font-medium transition ${pathname === dashboardLink.href
          ? "bg-primary/10 text-primary"
          : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
      >
        <dashboardLink.icon className="w-4 h-4" />
        {!collapsed && dashboardLink.label}
      </Link>

      {/* Academics Group */}
      <div>
        <button
          type="button"
          onClick={() => setAcademicsOpen((open) => !open)}
          aria-expanded={academicsOpen}
          aria-controls="academics-navigation"
          aria-label={collapsed ? "Academics" : undefined}
          title={collapsed ? "Academics" : undefined}
          className={`flex w-full items-center ${collapsed ? "justify-center" : "justify-between"} gap-3 px-3 py-2 rounded-lg text-small font-medium transition ${academicsLinks.some((link) => pathname.startsWith(link.href))
            ? "bg-primary/10 text-primary"
            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
        >
          <span className="flex items-center gap-3">
            <BookOpen className="h-4 w-4" />
            {!collapsed && "Academics"}
          </span>
          {!collapsed && (academicsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
        </button>

        {academicsOpen && !collapsed && (
          <div id="academics-navigation" className="ml-4 mt-1 border-l border-slate-200 pl-3 dark:border-slate-700">
            {academicsLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-small font-medium transition ${pathname.startsWith(link.href)
                  ? "bg-primary/10 text-primary"
                  : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                  }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* AI Tools Group */}
      <div>
        <button
          type="button"
          onClick={() => setAiToolsOpen((open) => !open)}
          aria-expanded={aiToolsOpen}
          aria-controls="ai-tools-navigation"
          aria-label={collapsed ? "AI Tools" : undefined}
          title={collapsed ? "AI Tools" : undefined}
          className={`flex w-full items-center ${collapsed ? "justify-center" : "justify-between"} gap-3 px-3 py-2 rounded-lg text-small font-medium transition ${aiToolsLinks.some((link) => pathname.startsWith(link.href))
            ? "bg-primary/10 text-primary"
            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
        >
          <span className="flex items-center gap-3">
            <Bot className="h-4 w-4" />
            {!collapsed && "AI Tools"}
          </span>
          {!collapsed && (aiToolsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
        </button>

        {aiToolsOpen && !collapsed && (
          <div id="ai-tools-navigation" className="ml-4 mt-1 border-l border-slate-200 pl-3 dark:border-slate-700">
            {aiToolsLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-small font-medium transition ${pathname.startsWith(link.href)
                  ? "bg-primary/10 text-primary"
                  : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                  }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Placement Group */}
      <div>
        <button
          type="button"
          onClick={() => setPlacementOpen((open) => !open)}
          aria-expanded={placementOpen}
          aria-controls="placement-navigation"
          aria-label={collapsed ? "Placement" : undefined}
          title={collapsed ? "Placement" : undefined}
          className={`flex w-full items-center ${collapsed ? "justify-center" : "justify-between"} gap-3 px-3 py-2 rounded-lg text-small font-medium transition ${placementLinks.some((link) => pathname.startsWith(link.href))
            ? "bg-primary/10 text-primary"
            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
        >
          <span className="flex items-center gap-3">
            <BriefcaseBusiness className="h-4 w-4" />
            {!collapsed && "Placement"}
          </span>
          {!collapsed && (placementOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
        </button>

        {placementOpen && !collapsed && (
          <div id="placement-navigation" className="ml-4 mt-1 border-l border-slate-200 pl-3 dark:border-slate-700">
            {placementLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-small font-medium transition ${pathname.startsWith(link.href)
                  ? "bg-primary/10 text-primary"
                  : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                  }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Links (Notifications, Profile, Settings) */}
      {bottomLinks.map((link) => {
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
      <span className="font-semibold text-body">Study Planner</span>
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
