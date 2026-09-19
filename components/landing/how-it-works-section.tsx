"use client";

import { motion } from "framer-motion";
import { UserPlus, BookOpen, ClipboardList, Sparkles } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "Create Account", desc: "Sign up free in seconds — no credit card needed." },
  { icon: BookOpen, title: "Add Courses", desc: "Enter your courses with instructor, credits, and grades." },
  { icon: ClipboardList, title: "Add Assignments", desc: "Log assignments and exams as they're announced." },
  { icon: Sparkles, title: "Generate AI Study Plan", desc: "Get a personalized plan built from your real deadlines." },
];

export function HowItWorksSection() {
  return (
    <section className="border-t border-[#e1e8f3] bg-[#f8fbff] py-20">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="mx-auto mb-14 max-w-xl text-center">
          <span className="text-small font-semibold uppercase tracking-[0.25em] text-[#1672f5]">How It Works</span>
          <h2 className="mt-3 text-3xl font-bold text-[#10234b] sm:text-4xl">Four steps to your first plan</h2>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Connector line on desktop */}
          <div className="absolute left-[12.5%] right-[12.5%] top-6 hidden h-px bg-[#c9dcfa] lg:block" />

          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="relative text-center"
            >
              <div className="relative z-10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1672f5] font-semibold text-white shadow-[0_6px_14px_rgba(22,114,245,0.2)]">
                {i + 1}
              </div>
              <s.icon className="mx-auto mb-3 h-5 w-5 text-[#1672f5]" />
              <h3 className="mb-1.5 font-semibold text-[#10234b]">{s.title}</h3>
              <p className="text-small text-[#657493]">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
