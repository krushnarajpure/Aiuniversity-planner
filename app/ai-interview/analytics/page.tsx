/**
 * AI Interview Analytics Dashboard
 * Performance analytics and insights
 */

import { AppShell } from "@/components/layout/app-shell";
import { LineChart, BarChart3, TrendingUp } from "lucide-react";

export default async function AnalyticsPage() {
  const performanceData = [
    { week: "Week 1", score: 65, technical: 68, communication: 62, behavioral: 63 },
    { week: "Week 2", score: 68, technical: 70, communication: 65, behavioral: 68 },
    { week: "Week 3", score: 72, technical: 75, communication: 70, behavioral: 70 },
    { week: "Week 4", score: 75, technical: 78, communication: 74, behavioral: 73 },
    { week: "Week 5", score: 78, technical: 81, communication: 76, behavioral: 76 },
  ];

  return (
    <AppShell userName="User">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div>
            <p className="text-sm font-medium text-primary">ANALYTICS</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
              Performance Analytics
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Track your interview preparation progress
            </p>
          </div>

          {/* Key Stats */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Score Improvement", value: "13%", icon: "📈" },
              { label: "Interviews Completed", value: "12", icon: "✅" },
              { label: "Hours Practiced", value: "24.5", icon: "⏱️" },
              { label: "Questions Attempted", value: "127", icon: "❓" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Performance Trend */}
          <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <LineChart className="h-5 w-5 text-primary" />
              Performance Trend
            </h2>
            <div className="mt-6">
              <div className="space-y-4">
                {performanceData.map((data) => (
                  <div key={data.week}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {data.week}: {data.score}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${data.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Performance */}
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {[
              {
                title: "Skills Performance",
                categories: [
                  { name: "Problem Solving", score: 85 },
                  { name: "Communication", score: 78 },
                  { name: "System Design", score: 72 },
                  { name: "Coding", score: 75 },
                ],
              },
              {
                title: "Interview Type Performance",
                categories: [
                  { name: "Technical", score: 81 },
                  { name: "Behavioral", score: 76 },
                  { name: "Coding", score: 75 },
                  { name: "System Design", score: 68 },
                ],
              },
            ].map((section, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900"
              >
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  {section.title}
                </h2>
                <div className="mt-6 space-y-4">
                  {section.categories.map((cat) => (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {cat.name}
                        </span>
                        <span className="font-bold text-primary">{cat.score}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${cat.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Insights */}
          <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-900/20">
            <div className="flex gap-3">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400 shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  Key Insights
                </h3>
                <ul className="mt-2 space-y-1 text-sm text-green-800 dark:text-green-200">
                  <li>✓ 13% improvement in overall score over 5 weeks</li>
                  <li>✓ Strongest in Problem Solving (85%) - keep practicing</li>
                  <li>✓ Focus on System Design (68%) - needs improvement</li>
                  <li>✓ Communication skills consistently improving (62% → 76%)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
