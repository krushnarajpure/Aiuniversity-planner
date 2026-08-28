"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Users, BookOpen, ClipboardList, CalendarClock, BarChart3, Brain, Bell, Award, CreditCard, FileBarChart, Settings, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

const navigation = [
    ["Workspace", [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }, { href: "/admin/users", label: "Users", icon: Users }]],
    ["Academics", [{ href: "/admin/courses", label: "Courses", icon: BookOpen }, { href: "/admin/assignments", label: "Assignments", icon: ClipboardList }, { href: "/admin/exams", label: "Exams", icon: CalendarClock }, { href: "/admin/results", label: "Results", icon: BarChart3 }, { href: "/admin/timetable", label: "Study timetable", icon: CalendarClock }, { href: "/admin/planner", label: "Study planner", icon: Brain }]],
    ["Insights", [{ href: "/admin/ai-usage", label: "AI usage", icon: Brain }, { href: "/admin/analytics", label: "Analytics", icon: BarChart3 }, { href: "/admin/certificates", label: "Certificates", icon: Award }]],
    ["Operations", [{ href: "/admin/notifications", label: "Notifications", icon: Bell }, { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard }, { href: "/admin/payments", label: "Payments", icon: CreditCard }, { href: "/admin/reports", label: "Reports", icon: FileBarChart }, { href: "/admin/settings", label: "Settings", icon: Settings }]],
] as const;

export function AdminShell({ children, name }: { children: React.ReactNode; name?: string | null }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    return <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <button type="button" aria-label="Open admin navigation" onClick={() => setOpen(true)} className="fixed left-4 top-4 z-30 rounded-lg border border-slate-200 bg-white p-2 shadow-sm md:hidden dark:border-slate-800 dark:bg-slate-900"><Menu className="h-5 w-5" /></button>
        {open && <button aria-label="Close navigation overlay" onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-slate-950/40 md:hidden" />}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white px-4 py-6 transition-transform md:translate-x-0 dark:border-slate-800 dark:bg-slate-900 ${open ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="mb-8 flex items-center justify-between px-2"><Link href="/admin" className="flex items-center gap-2 font-semibold"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm text-white">AI</span> Admin console</Link><button className="md:hidden" aria-label="Close admin navigation" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button></div>
            <nav className="space-y-6">{navigation.map(([heading, items]) => <div key={heading}><p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{heading}</p><div className="space-y-1">{items.map(({ href, label, icon: Icon }) => <Link onClick={() => setOpen(false)} key={href} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${pathname === href ? "bg-primary/10 text-primary" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"}`}><Icon className="h-4 w-4" />{label}</Link>)}</div></div>)}</nav>
            <button type="button" onClick={() => signOut({ callbackUrl: "/login" })} className="absolute bottom-6 left-4 right-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"><LogOut className="h-4 w-4" />Log out</button>
        </aside>
        <main className="min-h-screen md:pl-64"><header className="flex h-16 items-center justify-end border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900"><div className="text-right"><p className="text-sm font-semibold">{name || "Administrator"}</p><p className="text-xs text-slate-500">Administrator</p></div></header>{children}</main>
    </div>;
}
