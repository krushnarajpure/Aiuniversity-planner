"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Is AI University Planner really free?",
    a: "Yes — there's no credit card and no trial countdown. It's built as a student final-year project and is free to use.",
  },
  {
    q: "Does the AI make up assignments or exams?",
    a: "No. The AI Study Planner only ever reasons over courses, assignments, and exams you've actually entered — it never invents data.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Every course, assignment, and exam is scoped to your account only — other users can never see or edit your data.",
  },
  {
    q: "Can I use this on my phone?",
    a: "Yes, the whole app is fully responsive, including a mobile navigation menu.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="border-t border-[#e1e8f3] bg-white py-20">
      <div className="max-w-2xl mx-auto px-6 sm:px-8">
        <div className="mb-12 text-center">
          <span className="text-small font-semibold uppercase tracking-[0.25em] text-[#1672f5]">FAQ</span>
          <h2 className="mt-3 text-3xl font-bold text-[#10234b] sm:text-4xl">Common questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={faq.q} className="overflow-hidden rounded-xl border border-[#dbe7f7] bg-white shadow-sm">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left font-medium text-[#20365f]"
                >
                  {faq.q}
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[#7b8aa5] transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-4 text-small leading-relaxed text-[#657493]">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
