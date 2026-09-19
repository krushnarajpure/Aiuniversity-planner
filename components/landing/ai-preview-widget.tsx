"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BookOpen, ClipboardList, CalendarClock, Sparkles, CheckCircle2 } from "lucide-react";

const steps = ["courses", "assignments", "exams", "generating", "plan"] as const;
type Step = (typeof steps)[number];

const STEP_DURATION = 2200;

const courses = ["Database Systems", "Linear Algebra", "AI Fundamentals"];
const assignments = ["DB Assignment 3", "Calc Problem Set", "AI Research Paper"];
const exams = ["Database Midterm — 3 days", "AI Finals — 9 days"];
const weeklyPlan = [
  { day: "Mon", task: "Database Systems", hours: "2h" },
  { day: "Tue", task: "AI Fundamentals", hours: "1.5h" },
  { day: "Wed", task: "Linear Algebra", hours: "2h" },
  { day: "Thu", task: "Database Systems", hours: "1h" },
];

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/70 bg-white/65 px-4 py-3 text-sm text-[#15234b] shadow-sm backdrop-blur-md">
      {children}
    </div>
  );
}

export function AIPreviewWidget() {
  const [stepIndex, setStepIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % steps.length);
    }, STEP_DURATION);
    return () => clearInterval(interval);
  }, [reducedMotion]);

  const step: Step = reducedMotion ? "plan" : steps[stepIndex];

  return (
    <div className="relative">
      {/* Glow behind the card */}
      <div className="absolute -inset-8 rounded-full bg-[#cfe0ff]/70 blur-3xl" />

      <motion.div
        animate={reducedMotion ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative mx-auto w-full max-w-md rounded-2xl border border-white/80 bg-white/55 p-6 shadow-[0_20px_50px_rgba(40,94,180,0.14)] backdrop-blur-xl"
      >
        <div className="flex items-center justify-between mb-5">
          <span className="text-small font-medium text-[#18264c]">AI Study Planner</span>
          <span className="flex items-center gap-1.5 text-small text-[#0a9f62]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0a9f62]" />
            Live
          </span>
        </div>

        <div className="min-h-[220px]">
          <AnimatePresence mode="wait">
            {step === "courses" && (
              <motion.div
                key="courses"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="space-y-2"
              >
                <p className="mb-3 text-small text-[#687895]">Loading your courses...</p>
                {courses.map((c, i) => (
                  <motion.div key={c} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}>
                    <Card>
                      <BookOpen className="w-4 h-4 text-primary shrink-0" />
                      {c}
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {step === "assignments" && (
              <motion.div
                key="assignments"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="space-y-2"
              >
                <p className="text-small text-slate-400 mb-3">Pulling in assignments…</p>
                {assignments.map((a, i) => (
                  <motion.div key={a} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}>
                    <Card>
                      <ClipboardList className="w-4 h-4 text-warning shrink-0" />
                      {a}
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {step === "exams" && (
              <motion.div
                key="exams"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="space-y-2"
              >
                <p className="text-small text-slate-400 mb-3">Checking upcoming exams…</p>
                {exams.map((e, i) => (
                  <motion.div key={e} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}>
                    <Card>
                      <CalendarClock className="w-4 h-4 text-danger shrink-0" />
                      {e}
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {step === "generating" && (
              <motion.div
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="h-full flex flex-col items-center justify-center gap-4 py-12"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-8 h-8 text-primary" />
                </motion.div>
                <p className="text-slate-300 font-medium">Generating AI Study Plan…</p>
              </motion.div>
            )}

            {step === "plan" && (
              <motion.div
                key="plan"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
              >
                <p className="text-small text-slate-400 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  Your weekly plan is ready
                </p>
                <div className="space-y-2">
                  {weeklyPlan.map((p, i) => (
                    <motion.div
                      key={p.day}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.12 }}
                      className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 backdrop-blur-md px-4 py-2.5 text-sm"
                    >
                      <span className="text-primary font-medium w-10">{p.day}</span>
                      <span className="flex-1 text-slate-200 px-2 truncate">{p.task}</span>
                      <span className="text-slate-400 text-small">{p.hours}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
