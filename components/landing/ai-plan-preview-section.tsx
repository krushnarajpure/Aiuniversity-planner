"use client";

import { motion } from "framer-motion";
import { Sparkles, Clock } from "lucide-react";

const mockPlan = [
  { time: "9:00 AM", course: "Database Systems", task: "Review Chapter 5 — Normalization", priority: "High" },
  { time: "1:00 PM", course: "AI Fundamentals", task: "Practice search algorithms", priority: "Medium" },
  { time: "6:00 PM", course: "Linear Algebra", task: "Problem set 4", priority: "Medium" },
];

const priorityColor: Record<string, string> = {
  High: "bg-danger/10 text-danger",
  Medium: "bg-warning/10 text-warning",
  Low: "bg-success/10 text-success",
};

export function AIPlanPreviewSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-14 px-6 sm:px-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 text-small font-semibold uppercase tracking-[0.25em] text-[#1672f5]">
            <Sparkles className="h-3.5 w-3.5" />
            AI Preview
          </span>
          <h2 className="mb-5 mt-3 text-3xl font-bold text-[#10234b] sm:text-4xl">
            See what a real plan looks like
          </h2>
          <p className="max-w-md leading-relaxed text-[#657493]">
            Every recommendation comes with a reason — nearest deadlines, harder subjects, and
            your own weak spots all factor into the plan, so it always makes sense.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-[#dbe7f7] bg-[#f4f8ff] p-6 shadow-[0_18px_40px_rgba(40,94,180,0.1)]"
        >
          <div className="mb-5 flex items-center gap-2 text-small font-medium text-[#23365e]">
            <Clock className="h-4 w-4 text-[#1672f5]" />
            Today&apos;s Study Plan
          </div>
          <div className="space-y-3">
            {mockPlan.map((item) => (
              <div key={item.time} className="rounded-xl border border-white bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-small font-medium text-[#1672f5]">{item.time}</span>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${priorityColor[item.priority]}`}>
                    {item.priority}
                  </span>
                </div>
                <p className="text-sm font-medium text-[#15284e]">{item.course}</p>
                <p className="text-small text-[#657493]">{item.task}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
