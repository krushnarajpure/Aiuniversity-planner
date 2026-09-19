"use client";

import { motion } from "framer-motion";
import { CalendarDays, FileText, BarChart3, ShieldCheck } from "lucide-react";

const features = [
  { icon: CalendarDays, title: "Smart Planning", desc: "Turn your deadlines into a clear study plan." },
  { icon: ShieldCheck, title: "Track Progress", desc: "Stay on top of assignments and exams." },
  { icon: BarChart3, title: "AI Insights", desc: "Get personalized suggestions to study smarter." },
  { icon: FileText, title: "All in One Place", desc: "Manage your courses, notes and resources." },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-white py-5 sm:py-6">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="mx-auto mb-7 max-w-xl text-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#1672f5]">Features</span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#10234b] sm:text-3xl">Everything you need to stay ahead</h2>
          <div className="mx-auto mt-2 h-0.5 w-11 bg-[#1672f5]" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="group flex gap-4 border-r-0 border-[#e1e8f3] px-0 py-2 lg:border-r lg:px-5 lg:first:pl-0 lg:last:border-r-0"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e9f5ff] transition-colors group-hover:bg-[#dcecff]">
                <f.icon className="h-5 w-5 text-[#1672f5]" />
              </div>
              <div><h3 className="mb-1 text-sm font-semibold text-[#10234b]">{f.title}</h3>
              <p className="text-xs leading-relaxed text-[#657493]">{f.desc}</p></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
