"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const stats = [
  { value: 100, suffix: "%", label: "AI Powered" },
  { value: 1, suffix: "-Click", label: "Personalized Plans" },
  { value: 3, suffix: "+", label: "Assignments Managed / Semester" },
  { value: 40, suffix: "%", label: "Less Time Spent Scheduling" },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(reducedMotion ? value : 0);

  useEffect(() => {
    if (!isInView || reducedMotion) return;
    const duration = 1200;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(progress * value));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [isInView, value, reducedMotion]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section className="mt-10 border-y border-[#e1e8f3] bg-white sm:mt-14">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-0 px-6 py-3 sm:px-8 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="border-r border-[#d8e1ef] py-2 text-center last:border-r-0"
          >
            <p className="text-xl font-bold text-[#0871f9] sm:text-2xl">
              <Counter value={s.value} suffix={s.suffix} />
            </p>
            <p className="mt-0.5 text-[11px] text-[#657493] sm:text-small">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
