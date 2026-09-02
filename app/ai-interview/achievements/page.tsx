/**
 * Template pages for AI Interview module
 * These routes complete the comprehensive AI Interview platform
 */

// app/ai-interview/achievements/page.tsx
import { AppShell } from "@/components/layout/app-shell";
import { Trophy, Medal, Zap, Award } from "lucide-react";

export default function AchievementsPage() {
  const achievements = [
    { id: 1, name: "First Interview", icon: "🎯", earned: true, date: "Jan 5, 2025" },
    { id: 2, name: "5 Interviews", icon: "🚀", earned: true, date: "Jan 15, 2025" },
    { id: 3, name: "10 Day Streak", icon: "🔥", earned: false, days: 3 },
    { id: 4, name: "Expert Level", icon: "⭐", earned: false, points: 200 },
    { id: 5, name: "All-Rounder", icon: "🏆", earned: false, points: 500 },
  ];

  return (
    <AppShell userName="User">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <div>
            <p className="text-sm font-medium text-primary">GAMIFICATION</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
              Achievements & Badges
            </h1>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`rounded-lg border-2 p-4 text-center transition-all ${
                  ach.earned
                    ? "border-primary bg-primary/10"
                    : "border-dashed border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800"
                }`}
              >
                <div className="text-4xl">{ach.icon}</div>
                <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">
                  {ach.name}
                </h3>
                {ach.earned ? (
                  <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                    ✓ Earned {ach.date}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                    {("days" in ach ? `${ach.days} days left` : `${ach.points} points needed`)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
