"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, Sparkles, ShieldCheck, Zap, UserCheck, ArrowRight } from "lucide-react";
import { AIPreviewWidget } from "./ai-preview-widget";

const badges = [
  { icon: Sparkles, label: "AI Powered" },
  { icon: ShieldCheck, label: "Secure" },
  { icon: Zap, label: "Fast" },
  { icon: UserCheck, label: "Personalized" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#f8fbff] text-[#10234b]">
      <div className="pointer-events-none absolute -right-24 -top-32 h-[420px] w-[520px] rounded-full bg-[#dfe8ff] opacity-80" />
      <div className="pointer-events-none absolute right-[20%] top-[30%] h-[360px] w-[360px] rounded-full bg-[#edf5ff] opacity-90" />

      <div className="relative mx-auto max-w-6xl px-6 pb-7 pt-5 sm:px-8 sm:pb-8">
        <header className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#10234b] text-white"><GraduationCap className="h-5 w-5" /></div>
          <div><p className="text-base font-bold leading-tight">AI University Planner</p><p className="text-[11px] text-[#627397]">Plan Smarter. Study Better. Achieve More.</p></div>
        </header>

        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
        {/* Left column */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d7e7ff] bg-[#eaf3ff] px-4 py-1 text-small font-medium text-[#1769e8]">
            <Sparkles className="w-3.5 h-3.5" />
            AI Powered Academic Planning
          </span>

          <h1 className="mb-4 text-5xl font-extrabold leading-[1.02] tracking-[-0.04em] sm:text-5xl">
            Plan Smarter.
            <br />
            Study Better.
            <br />
            <span className="text-[#146ee8]">
              Achieve More.
            </span>
          </h1>

          <p className="mb-5 max-w-md text-base leading-relaxed text-[#617293]">
            One intelligent workspace for your courses, assignments, and exams — with an AI
            planner that turns your real deadlines into a study plan you&apos;ll actually follow.
          </p>

          <div className="mb-6 flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="group flex items-center gap-2 rounded-lg bg-[#1672f5] px-7 py-3 font-medium text-white shadow-[0_8px_20px_rgba(22,114,245,0.2)] transition hover:bg-[#0b5ed7]"
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="rounded-lg border border-[#b9c9e6] px-7 py-3 font-medium text-[#153b83] transition hover:bg-white"
            >
              Learn More
            </Link>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {badges.map((b) => (
              <span key={b.label} className="flex items-center gap-1.5 text-small text-[#627397]">
                <b.icon className="h-4 w-4 text-[#1672f5]" />
                {b.label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Right column — animated preview */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <AIPreviewWidget />
        </motion.div>
        </div>
      </div>
    </section>
  );
}
