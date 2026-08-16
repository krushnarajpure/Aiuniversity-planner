"use client";

import { BarChart3, Zap, Target, TrendingUp, Calendar } from "lucide-react";
import type { Timetable } from "@prisma/client";

interface GoalsAndInsightsProps {
  sessions: Timetable[];
  dailyGoal?: number;
  weeklyGoal?: number;
}

function calculateDuration(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);
  const start = startHour * 60 + startMin;
  const end = endHour * 60 + endMin;
  return Math.max(0, (end - start) / 60);
}

export function GoalsAndInsights({
  sessions,
  dailyGoal = 6,
  weeklyGoal = 30,
}: GoalsAndInsightsProps) {
  // Calculate today's study time
  const today = new Date();
  const todaySessions = sessions.filter(
    (s) =>
      new Date(s.date).toDateString() === today.toDateString() &&
      !s.isBreak
  );
  const todayStudyHours = todaySessions.reduce(
    (sum, s) => sum + calculateDuration(s.startTime, s.endTime),
    0
  );

  // Calculate this week's study time
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const weekSessions = sessions.filter((s) => {
    const sDate = new Date(s.date);
    return sDate >= weekStart && sDate <= weekEnd && !s.isBreak;
  });
  const weekStudyHours = weekSessions.reduce(
    (sum, s) => sum + calculateDuration(s.startTime, s.endTime),
    0
  );

  // Calculate insights
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s) => s.status === "COMPLETED").length;
  const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
  const missedSessions = sessions.filter((s) => s.status === "MISSED").length;

  // Most productive hours
  const hourStats: Record<string, number> = {};
  sessions.forEach((s) => {
    const hour = s.startTime.split(":")[0];
    hourStats[hour] = (hourStats[hour] || 0) + calculateDuration(s.startTime, s.endTime);
  });
  const mostProductiveHour = Object.entries(hourStats).sort(([, a], [, b]) => b - a)[0];

  // Most studied subject
  const subjectStats: Record<string, number> = {};
  sessions.forEach((s) => {
    subjectStats[s.subjectName] = (subjectStats[s.subjectName] || 0) + calculateDuration(s.startTime, s.endTime);
  });
  const mostStudiedSubject = Object.entries(subjectStats).sort(([, a], [, b]) => b - a)[0];

  return (
    <div className="space-y-6">
      {/* Daily Goal */}
      <div className="card p-6 bg-gradient-to-br from-primary/5 to-transparent dark:from-primary/10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-small text-slate-600 dark:text-slate-400 mb-1">Daily Study Goal</p>
            <div className="flex items-baseline gap-2">
              <span className="text-heading font-bold text-slate-900 dark:text-slate-100">
                {todayStudyHours.toFixed(1)}h
              </span>
              <span className="text-body text-slate-600 dark:text-slate-400">/ {dailyGoal}h</span>
            </div>
          </div>
          <Target className="w-8 h-8 text-primary/60" />
        </div>
        
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5">
            <div
              className="bg-primary rounded-full h-2.5 transition-all"
              style={{
                width: `${Math.min((todayStudyHours / dailyGoal) * 100, 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-small">
            <span className="text-slate-600 dark:text-slate-400">Progress</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {Math.round((todayStudyHours / dailyGoal) * 100)}%
            </span>
          </div>
        </div>

        {/* Status message */}
        <div className="mt-4 p-3 rounded-lg bg-white/50 dark:bg-slate-800/50">
          {todayStudyHours >= dailyGoal ? (
            <p className="text-small font-medium text-success">✓ Goal Achieved! Great work!</p>
          ) : (
            <p className="text-small text-slate-600 dark:text-slate-400">
              {(dailyGoal - todayStudyHours).toFixed(1)}h to go
            </p>
          )}
        </div>
      </div>

      {/* Weekly Goal */}
      <div className="card p-6 bg-gradient-to-br from-success/5 to-transparent dark:from-success/10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-small text-slate-600 dark:text-slate-400 mb-1">Weekly Study Goal</p>
            <div className="flex items-baseline gap-2">
              <span className="text-heading font-bold text-slate-900 dark:text-slate-100">
                {weekStudyHours.toFixed(1)}h
              </span>
              <span className="text-body text-slate-600 dark:text-slate-400">/ {weeklyGoal}h</span>
            </div>
          </div>
          <Calendar className="w-8 h-8 text-success/60" />
        </div>

        <div className="space-y-2">
          <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5">
            <div
              className="bg-success rounded-full h-2.5 transition-all"
              style={{
                width: `${Math.min((weekStudyHours / weeklyGoal) * 100, 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-small">
            <span className="text-slate-600 dark:text-slate-400">Progress</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {Math.round((weekStudyHours / weeklyGoal) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="card p-6">
        <h4 className="text-body font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Productivity Insights
        </h4>

        <div className="space-y-3">
          {/* Completion Rate */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <p className="text-small text-slate-600 dark:text-slate-400 mb-1">Completion Rate</p>
            <p className="text-body font-bold text-slate-900 dark:text-slate-100">
              {completionRate}% of sessions completed
            </p>
          </div>

          {/* Most Productive Hours */}
          {mostProductiveHour && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <p className="text-small text-slate-600 dark:text-slate-400 mb-1">Most Productive Time</p>
              <p className="text-body font-bold text-primary">
                {mostProductiveHour[0]}:00 – {String(parseInt(mostProductiveHour[0]) + 1).padStart(2, "0")}:00
              </p>
              <p className="text-small text-slate-600 dark:text-slate-400">
                {mostProductiveHour[1].toFixed(1)}h studied
              </p>
            </div>
          )}

          {/* Most Studied Subject */}
          {mostStudiedSubject && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <p className="text-small text-slate-600 dark:text-slate-400 mb-1">Top Subject</p>
              <p className="text-body font-bold text-primary">
                {mostStudiedSubject[0]}
              </p>
              <p className="text-small text-slate-600 dark:text-slate-400">
                {mostStudiedSubject[1].toFixed(1)}h total
              </p>
            </div>
          )}

          {/* Missed Sessions Alert */}
          {missedSessions > 0 && (
            <div className="p-3 bg-danger/10 dark:bg-danger/20 rounded-lg border border-danger/30">
              <p className="text-small text-danger font-medium">
                ⚠️ {missedSessions} missed session{missedSessions !== 1 ? 's' : ''}
              </p>
              <p className="text-small text-slate-600 dark:text-slate-400">Consider rescheduling</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
