"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Activity, BarChart3, BookOpen, Brain, CalendarClock, ClipboardList, FileBarChart, LayoutDashboard, LogOut, Menu, Settings, Users, X } from "lucide-react";

const sections = [
  { label: "Overview", links: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  { label: "Students", links: [{ href: "/admin/users", label: "All students", icon: Users }, { href: "/admin/activity", label: "Student activity", icon: Activity }] },
  { label: "Academics", links: [{ href: "/admin/courses", label: "Courses", icon: BookOpen }, { href: "/admin/assignments", label: "Assignments", icon: ClipboardList }, { href: "/admin/exams", label: "Exams", icon: CalendarClock }, { href: "/admin/timetable", label: "Timetable", icon: CalendarClock }, { href: "/admin/study-plans", label: "Study plans", icon: Brain }] },
  { label: "AI", links: [{ href: "/admin/copilot", label: "AI Copilot", icon: Brain }, { href: "/admin/ai-usage", label: "AI usage", icon: BarChart3 }] },
  { label: "Management", links: [{ href: "/admin/reports", label: "Reports", icon: FileBarChart }, { href: "/admin/notifications", label: "Notifications", icon: Activity }, { href: "/admin/settings", label: "Settings", icon: Settings }] },
] as const;

export function AdminShell({ children, name, email }: { children: React.ReactNode; name?: string | null; email?: string | null }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  return <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <button type="button" aria-label="Open admin navigation" onClick={() => setMobileOpen(true)} className="fixed left-4 top-4 z-30 rounded-lg border border-slate-200 bg-white p-2 shadow-sm md:hidden dark:border-slate-800 dark:bg-slate-900"><Menu className="h-5 w-5" /></button>
    {mobileOpen && <button type="button" aria-label="Close navigation overlay" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-slate-950/40 md:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 transition-transform md:translate-x-0 dark:border-slate-800 dark:bg-slate-900 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="mb-7 flex items-center justify-between px-2"><Link href="/admin" className="flex items-center gap-2 font-semibold"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm text-white">AI</span> University Admin</Link><button type="button" aria-label="Close admin navigation" onClick={() => setMobileOpen(false)} className="md:hidden"><X className="h-5 w-5" /></button></div>
      <nav className="flex-1 space-y-5 overflow-y-auto">{sections.map(section => <div key={section.label}><p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{section.label}</p><div className="space-y-1">{section.links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${pathname === href ? "bg-primary/10 text-primary" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"}`}><Icon className="h-4 w-4" />{label}</Link>)}</div></div>)}</nav>
      <div className="border-t border-slate-200 pt-4 dark:border-slate-800"><p className="truncate px-2 text-sm font-semibold">{name || "Administrator"}</p><p className="mb-3 truncate px-2 text-xs text-slate-500">{email || "Admin account"}</p><button type="button" onClick={() => signOut({ callbackUrl: "/login" })} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"><LogOut className="h-4 w-4" />Log out</button></div>
    </aside>
    <main className="min-h-screen md:pl-64"><header className="flex h-16 items-center justify-end border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900"><div className="text-right"><p className="text-sm font-semibold">{name || "Administrator"}</p><p className="text-xs text-slate-500">ADMIN</p></div></header>{children}</main>
  </div>;
}
