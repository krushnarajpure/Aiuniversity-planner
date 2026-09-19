"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah A.",
    role: "Computer Science, Sophomore",
    quote: "I stopped juggling five different apps. Now I just check my plan every morning and go.",
  },
  {
    name: "Hamza K.",
    role: "Business Administration, Junior",
    quote: "The exam countdown alone saved me from missing a deadline this semester.",
  },
  {
    name: "Aisha R.",
    role: "Electrical Engineering, Senior",
    quote: "Seeing the reason behind every study block actually made me trust the plan.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="border-t border-[#e1e8f3] bg-[#f8fbff] py-20">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="mx-auto mb-4 max-w-xl text-center">
          <span className="text-small font-semibold uppercase tracking-[0.25em] text-[#1672f5]">Testimonials</span>
          <h2 className="mt-3 text-3xl font-bold text-[#10234b] sm:text-4xl">What students say</h2>
        </div>
        <p className="mb-14 text-center text-small text-[#7b8aa5]">
          Sample quotes for demonstration purposes
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="rounded-2xl border border-[#dbe7f7] bg-white p-6 shadow-sm"
            >
              <Quote className="mb-3 h-5 w-5 text-[#1672f5]/50" />
              <p className="mb-5 text-sm leading-relaxed text-[#405477]">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className="text-sm font-medium text-[#10234b]">{t.name}</p>
                <p className="text-small text-[#657493]">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
