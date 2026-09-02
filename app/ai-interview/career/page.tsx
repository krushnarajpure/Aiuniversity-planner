/**
 * AI Interview Career Intelligence Page
 */

import { AppShell } from "@/components/layout/app-shell";
import { Target, TrendingUp, Calendar, BookOpen } from "lucide-react";

export default async function CareerPage() {
  return (
    <AppShell userName="User">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <div>
            <p className="text-sm font-medium text-primary">CAREER</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
              Career Readiness Assessment
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Your personalized path to career success
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Overall Readiness", value: "72%", icon: <Target className="h-6 w-6" /> },
              { label: "Target Role", value: "Senior Dev", icon: <TrendingUp className="h-6 w-6" /> },
              { label: "Estimated Timeline", value: "8 weeks", icon: <Calendar className="h-6 w-6" /> },
              { label: "Learning Hours", value: "24.5", icon: <BookOpen className="h-6 w-6" /> },
            ].map((metric, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="text-primary">{metric.icon}</div>
                <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">{metric.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">8-Week Roadmap</h2>
            <div className="mt-4 space-y-3">
              {[
                { week: "Week 1-2", focus: "Fundamentals", progress: 100 },
                { week: "Week 3-4", focus: "Intermediate Topics", progress: 75 },
                { week: "Week 5-6", focus: "Advanced Concepts", progress: 40 },
                { week: "Week 7-8", focus: "Interview Simulation", progress: 0 },
              ].map((item) => (
                <div key={item.week} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-900 dark:text-white">{item.week}</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">{item.focus}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full bg-primary" style={{ width: `${item.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
