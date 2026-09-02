/**
 * AI Interview Dashboard
 * Overview of interview progress and statistics
 */

"use client";

import { AppShell } from "@/components/layout/app-shell";
import { BarChart3, TrendingUp, Zap, Target, Calendar, Award } from "lucide-react";
import { ProgressRing, SkillBar, StatsGrid } from "@/components/ai-interview/stats-components";

export default function DashboardPage() {
  return (
    <AppShell userName="User">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div>
            <p className="text-sm font-medium text-primary">DASHBOARD</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
              Interview Performance
            </h1>
          </div>

          {/* Key Metrics */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <Target className="h-6 w-6" />, label: "Readiness Score", value: "72%", change: "+5%" },
              { icon: <Zap className="h-6 w-6" />, label: "Current Streak", value: "7", unit: "days", change: "🔥" },
              { icon: <Calendar className="h-6 w-6" />, label: "Interviews", value: "12", unit: "complete", change: "↑ 2" },
              { icon: <Award className="h-6 w-6" />, label: "Avg Score", value: "78%", change: "↑ 3%" },
            ].map((metric, idx) => (
              <div key={idx} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-start justify-between">
                  <div className="text-primary">{metric.icon}</div>
                  <span className="text-sm font-medium text-green-600">{metric.change}</span>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-slate-600 dark:text-slate-400">{metric.label}</p>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{metric.value}</span>
                    {metric.unit && (
                      <span className="text-xs text-slate-600 dark:text-slate-400">{metric.unit}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {/* Left Column - Readiness Score */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Interview Readiness</h2>
              <div className="mt-6 flex justify-center">
                <ProgressRing score={72} size={150} label="Ready to Interview" />
              </div>
              <div className="mt-6 space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Based on 12 interviews with an average score of 78%
                </p>
              </div>
            </div>

            {/* Middle Column - Skills */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Top Skills</h2>
              <div className="mt-6 space-y-4">
                <SkillBar skill="Problem Solving" percentage={85} level="expert" />
                <SkillBar skill="Communication" percentage={78} level="advanced" />
                <SkillBar skill="System Design" percentage={65} level="intermediate" />
                <SkillBar skill="Coding" percentage={72} level="advanced" />
              </div>
            </div>

            {/* Right Column - Weak Areas */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Areas to Improve</h2>
              <div className="mt-6 space-y-3">
                {[
                  { skill: "Database Design", current: 45 },
                  { skill: "API Security", current: 52 },
                  { skill: "Cloud Architecture", current: 58 },
                ].map((item) => (
                  <div key={item.skill} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {item.skill}
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-400">{item.current}%</span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div className="h-full bg-warning" style={{ width: `${item.current}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Activity */}
          <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Weekly Activity</h2>
            <div className="mt-6 grid gap-2 sm:grid-cols-7">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => {
                const activities = [2, 3, 1, 4, 2, 0, 1];
                return (
                  <div key={day} className="text-center">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                      {day}
                    </p>
                    <div className="h-8 rounded bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-full rounded bg-green-500"
                        style={{ opacity: (activities[idx] || 0) / 4 }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      {activities[idx]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-900/20">
            <div className="flex gap-3">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Recommended Next Steps</h3>
                <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <li>• Complete 2 more full interviews to reach 75% readiness</li>
                  <li>• Focus on Database Design topics (currently at 45%)</li>
                  <li>• Practice System Design with coding components</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
