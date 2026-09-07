"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  Bot,
  CalendarDays,
  ClipboardCheck,
  FileText,
  ImagePlus,
  MessageSquareText,
  Presentation,
  Rocket,
} from "lucide-react";

const tools = [
  { icon: Bot, label: "AI Academic Assistant", detail: "Route academic work from a natural-language request.", href: "/register", tone: "bg-cyan-50 text-cyan-700" },
  { icon: MessageSquareText, label: "AI Copilot", detail: "Ask, learn, plan, analyze images, and speak naturally.", href: "/register", tone: "bg-violet-50 text-violet-700" },
  { icon: CalendarDays, label: "College Timetable", detail: "Keep lectures separate from your personal study plan.", href: "/register", tone: "bg-amber-50 text-amber-700" },
  { icon: Presentation, label: "AI PPT Generator", detail: "Turn a brief into editable, visual presentation slides.", href: "/register", tone: "bg-rose-50 text-rose-700" },
];

const workflow = [
  { icon: ClipboardCheck, label: "Academic control center", value: "Courses · Assignments · Exams" },
  { icon: BarChart3, label: "Progress you can act on", value: "Analytics · Study plans · Deadlines" },
  { icon: Rocket, label: "Career-ready workspace", value: "Interviews · Jobs · Roadmaps" },
];

export function WorkspacePreviewSection() {
  return (
    <section className="relative overflow-hidden bg-[#f4f7f8] py-24 dark:bg-slate-950">
      <div className="absolute inset-x-0 top-0 h-px bg-slate-200 dark:bg-slate-800" />
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
            <span className="text-small font-medium uppercase tracking-[0.18em] text-primary">Your academic command center</span>
            <h2 className="mt-4 max-w-lg text-3xl font-bold leading-tight text-slate-950 dark:text-white sm:text-4xl">
              One dashboard for the work between classes.
            </h2>
            <p className="mt-5 max-w-md text-small leading-7 text-slate-600 dark:text-slate-400">
              Bring your academic records, AI tools, documents, career preparation, and real college timetable into one calm workspace.
            </p>
            <Link href="/register" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-small font-semibold text-white transition hover:bg-primary dark:bg-white dark:text-slate-950 dark:hover:bg-cyan-300">
              Explore the workspace <ArrowUpRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="relative">
            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_24px_70px_-30px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-rose-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></div>
                <span className="text-xs font-medium text-slate-400">AI University Planner / workspace</span>
              </div>
              <div className="grid gap-5 p-5 sm:grid-cols-[0.9fr_1.1fr] sm:p-7">
                <div className="rounded-2xl bg-slate-950 p-5 text-white dark:bg-slate-800">
                  <div className="flex items-center justify-between"><span className="text-xs uppercase tracking-[0.15em] text-cyan-300">Today</span><Bot className="h-4 w-4 text-cyan-300" /></div>
                  <p className="mt-8 text-2xl font-semibold">Make progress visible.</p>
                  <p className="mt-2 text-xs leading-5 text-slate-400">Your next best action, deadlines, and study rhythm in one glance.</p>
                  <div className="mt-8 h-2 rounded-full bg-white/10"><div className="h-2 w-[72%] rounded-full bg-cyan-300" /></div>
                  <p className="mt-2 text-xs text-slate-400">72% weekly momentum</p>
                </div>
                <div className="space-y-3">
                  {tools.map((tool, index) => <Link key={tool.label} href={tool.href} className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm dark:border-slate-700"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tool.tone}`}><tool.icon className="h-4 w-4" /></span><span className="min-w-0"><strong className="block text-small font-semibold text-slate-800 dark:text-slate-100">{tool.label}</strong><span className="mt-0.5 block text-xs leading-4 text-slate-500 dark:text-slate-400">{tool.detail}</span></span><ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-primary" /></Link>)}
                </div>
              </div>
              <div className="grid border-t border-slate-200 sm:grid-cols-3 dark:border-slate-800">{workflow.map((item) => <div key={item.label} className="flex gap-3 border-b border-slate-200 p-4 last:border-0 sm:border-b-0 sm:border-r sm:last:border-0 dark:border-slate-800"><item.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span><strong className="block text-xs font-semibold text-slate-700 dark:text-slate-200">{item.label}</strong><span className="mt-1 block text-[11px] leading-4 text-slate-400">{item.value}</span></span></div>)}</div>
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-xs font-semibold text-cyan-800 shadow-sm sm:flex sm:items-center sm:gap-2 dark:border-cyan-900 dark:bg-cyan-950 dark:text-cyan-200"><ImagePlus className="h-4 w-4" /> Image-to-action academic workflows</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
