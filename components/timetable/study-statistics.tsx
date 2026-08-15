"use client";

import { BarChart3, TrendingUp, Calendar, Clock, Target, Zap, AlertCircle } from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import type { Timetable } from "@prisma/client";

interface StatisticsCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  color?: "primary" | "success" | "warning" | "danger";
  trend?: { value: number; direction: "up" | "down" };
}

function StatCard({
  label,
  value,
  unit,
  icon,
  color = "primary",
  trend,
}: StatisticsCardProps) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
  };

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-small text-slate-600 dark:text-slate-400 mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-subheading font-bold">{value}</span>
            {unit && <span className="text-small text-slate-500">{unit}</span>}
          </div>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp
                className={`w-3 h-3 ${
                  trend.direction === "up" ? "text-success rotate-0" : "text-danger rotate-180"
                }`}
              />
              <span className="text-small font-medium">
                {trend.direction === "up" ? "+" : "-"}
                {trend.value}%
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

interface StudyStatisticsProps {
  sessions: Timetable[];
  todaySummary: {
    plannedHours: number;
    completedHours: number;
    pendingHours: number;
    totalSessions: number;
    completedSessions: number;
    missedSessions: number;
  };
  weeklyStats?: {
    totalStudyHours: number;
    completedSessions: number;
    missedSessions: number;
    subjects: Record<string, any>;
  };
  goalProgress?: {
    goal: any;
    studyHours: number;
    remaining: number;
    progress: number;
  };
  streak?: number;
}

export function StudyStatistics({
  sessions,
  todaySummary,
  weeklyStats,
  goalProgress,
  streak = 0,
}: StudyStatisticsProps) {
  // Calculate overall statistics
  const totalLectures = sessions.reduce((sum, s) => sum + s.totalLectures, 0);
  const completedLectures = sessions.reduce((sum, s) => sum + s.completedLectures, 0);
  const pendingLectures = totalLectures - completedLectures;
  const missedSessions = sessions.filter((s) => s.status === "MISSED").length;

  const overallProgress = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Study Streak */}
      {streak > 0 && (
        <div className="card bg-gradient-to-r from-primary/10 to-success/10 p-4 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🔥</div>
            <div>
              <p className="font-semibold text-body">{streak} Day Study Streak</p>
              <p className="text-small text-slate-600 dark:text-slate-400">
                Keep the momentum going!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Today's Summary */}
      <div>
        <h3 className="text-card-title font-semibold mb-4">Today's Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Planned Hours"
            value={todaySummary.plannedHours.toFixed(1)}
            unit="hrs"
            icon={<Clock className="w-4 h-4" />}
            color="primary"
          />
          <StatCard
            label="Completed Hours"
            value={todaySummary.completedHours.toFixed(1)}
            unit="hrs"
            icon={<TrendingUp className="w-4 h-4" />}
            color="success"
          />
          <StatCard
            label="Sessions"
            value={todaySummary.completedSessions}
            unit={`/ ${todaySummary.totalSessions}`}
            icon={<Calendar className="w-4 h-4" />}
            color="primary"
          />
          {todaySummary.missedSessions > 0 && (
            <StatCard
              label="Missed Sessions"
              value={todaySummary.missedSessions}
              icon={<AlertCircle className="w-4 h-4" />}
              color="danger"
            />
          )}
        </div>
      </div>

      {/* Daily Goal Progress */}
      {goalProgress && (
        <div>
          <h3 className="text-card-title font-semibold mb-4">Daily Goal</h3>
          <div className="card p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-small text-slate-600 dark:text-slate-400">Target</p>
                <p className="text-body font-semibold">{goalProgress.goal.targetHours} Hours</p>
              </div>
              <div className="text-right">
                <p className="text-small text-slate-600 dark:text-slate-400">Completed</p>
                <p className="text-body font-semibold">{goalProgress.studyHours.toFixed(1)} Hours</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                <div
                  className={`rounded-full h-3 transition-all ${
                    goalProgress.progress >= 100 ? "bg-success" : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(goalProgress.progress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-small">
                <span className="font-medium">{goalProgress.progress}%</span>
                <span className="text-slate-600 dark:text-slate-400">
                  {goalProgress.remaining.toFixed(1)} hrs remaining
                </span>
              </div>
            </div>

            {goalProgress.progress >= 100 && (
              <div className="p-2 bg-success/10 border border-success/30 rounded-lg text-small font-medium text-success">
                ✓ Goal Completed!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overall Progress */}
      <div>
        <h3 className="text-card-title font-semibold mb-4">Overall Progress</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Total Lectures"
            value={totalLectures}
            icon={<BarChart3 className="w-4 h-4" />}
            color="primary"
          />
          <StatCard
            label="Completed"
            value={completedLectures}
            unit={`(${overallProgress}%)`}
            icon={<TrendingUp className="w-4 h-4" />}
            color="success"
          />
          <StatCard
            label="Pending"
            value={pendingLectures}
            icon={<Clock className="w-4 h-4" />}
            color="warning"
          />
          <StatCard
            label="Missed"
            value={missedSessions}
            icon={<AlertCircle className="w-4 h-4" />}
            color={missedSessions > 0 ? "danger" : "primary"}
          />
        </div>
      </div>

      {/* Subject Breakdown */}
      {weeklyStats?.subjects && Object.keys(weeklyStats.subjects).length > 0 && (
        <div>
          <h3 className="text-card-title font-semibold mb-4">Subject Progress</h3>
          <div className="space-y-3">
            {Object.entries(weeklyStats.subjects).map(([subject, stats]: any) => {
              const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
              return (
                <div key={subject} className="card p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-body">{subject}</p>
                      <p className="text-small text-slate-600 dark:text-slate-400">
                        {stats.completed} / {stats.total} Lectures • {stats.sessions} Sessions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{progress}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weekly Summary */}
      {weeklyStats && (
        <div className="card p-4 bg-slate-50 dark:bg-slate-900">
          <h3 className="text-body font-semibold mb-4">This Week</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-small text-slate-600 dark:text-slate-400">Study Hours</p>
              <p className="text-subheading font-bold text-primary">
                {weeklyStats.totalStudyHours.toFixed(1)}h
              </p>
            </div>
            <div>
              <p className="text-small text-slate-600 dark:text-slate-400">Completed</p>
              <p className="text-subheading font-bold text-success">
                {weeklyStats.completedSessions}
              </p>
            </div>
            <div>
              <p className="text-small text-slate-600 dark:text-slate-400">Missed</p>
              <p className="text-subheading font-bold text-danger">
                {weeklyStats.missedSessions}
              </p>
            </div>
            <div>
              <p className="text-small text-slate-600 dark:text-slate-400">Subjects</p>
              <p className="text-subheading font-bold">
                {Object.keys(weeklyStats.subjects).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
