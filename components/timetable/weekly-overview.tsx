"use client";

import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import type { Timetable } from "@prisma/client";
import { Clock, BookOpen } from "lucide-react";

interface WeeklyOverviewProps {
  sessions: Timetable[];
  onSelectDay?: (date: Date) => void;
}

function calculateDuration(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);
  const start = startHour * 60 + startMin;
  const end = endHour * 60 + endMin;
  return Math.max(0, (end - start) / 60);
}

function getSessionTypeColor(sessionType: string) {
  const colors: Record<string, string> = {
    LECTURE: "bg-primary/10 text-primary",
    REVISION: "bg-success/10 text-success",
    PRACTICE: "bg-blue-100/50 text-blue-700 dark:text-blue-300",
    ASSIGNMENT: "bg-purple-100/50 text-purple-700 dark:text-purple-300",
    PRACTICAL: "bg-green-100/50 text-green-700 dark:text-green-300",
    PROJECT: "bg-orange-100/50 text-orange-700 dark:text-orange-300",
    READING: "bg-indigo-100/50 text-indigo-700 dark:text-indigo-300",
    EXAM_PREPARATION: "bg-red-100/50 text-red-700 dark:text-red-300",
    MOCK_TEST: "bg-pink-100/50 text-pink-700 dark:text-pink-300",
    BREAK: "bg-slate-100/50 text-slate-700 dark:text-slate-300",
  };
  return colors[sessionType] || "bg-slate-100/50 text-slate-700 dark:text-slate-300";
}

export function WeeklyOverview({ sessions, onSelectDay }: WeeklyOverviewProps) {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  return (
    <div className="space-y-4">
      <h3 className="text-body font-semibold text-slate-800 dark:text-slate-200">📊 Weekly Overview</h3>

      <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
        {days.map((day, index) => {
          const daySessions = sessions.filter(
            (s) => isSameDay(new Date(s.date), day) && !s.isBreak
          );
          const totalHours = daySessions.reduce((sum, s) => sum + calculateDuration(s.startTime, s.endTime), 0);
          const completedSessions = daySessions.filter((s) => s.status === "COMPLETED").length;
          const isToday = isSameDay(day, today);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDay?.(day)}
              className={`p-3 rounded-lg border-2 transition ${
                isToday
                  ? "border-primary bg-primary/5 dark:bg-primary/10"
                  : "border-slate-200 dark:border-slate-700 hover:border-primary/50"
              }`}
            >
              <div className="text-small font-bold text-slate-700 dark:text-slate-300 mb-1">
                {dayNames[index]}
              </div>
              <div className="text-tiny text-slate-500 dark:text-slate-400 mb-2">
                {format(day, "d MMM")}
              </div>
              {daySessions.length > 0 ? (
                <>
                  <div className="flex items-center gap-1 text-tiny font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <BookOpen className="w-3 h-3" />
                    {daySessions.length} session{daySessions.length !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-1 text-tiny font-medium text-primary">
                    <Clock className="w-3 h-3" />
                    {totalHours.toFixed(1)}h
                  </div>
                  {completedSessions > 0 && (
                    <div className="mt-2 text-tiny text-success font-medium">
                      ✓ {completedSessions}/{daySessions.length}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-tiny text-slate-400 italic">No sessions</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Weekly Stats */}
      <div className="bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10 rounded-lg p-4 border border-primary/10 dark:border-primary/20">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-small text-slate-600 dark:text-slate-400">Total Sessions</p>
            <p className="text-heading font-bold text-slate-900 dark:text-slate-100">
              {sessions.length}
            </p>
          </div>
          <div>
            <p className="text-small text-slate-600 dark:text-slate-400">Study Hours</p>
            <p className="text-heading font-bold text-primary">
              {sessions.reduce((sum, s) => sum + (s.isBreak ? 0 : calculateDuration(s.startTime, s.endTime)), 0).toFixed(1)}h
            </p>
          </div>
          <div>
            <p className="text-small text-slate-600 dark:text-slate-400">Completed</p>
            <p className="text-heading font-bold text-success">
              {sessions.filter((s) => s.status === "COMPLETED").length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
