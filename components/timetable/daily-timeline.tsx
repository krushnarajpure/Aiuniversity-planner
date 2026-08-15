"use client";

import { CheckCircle2, Clock, AlertCircle, Zap, BookOpen } from "lucide-react";
import type { Timetable } from "@prisma/client";
import { format } from "date-fns";

interface DailyTimelineProps {
  sessions: Timetable[];
  onEdit?: (session: Timetable) => void;
  onDelete?: (session: Timetable) => void;
  onMarkComplete?: (session: Timetable) => void;
}

function getStatusIcon(status: string, isBreak: boolean) {
  if (isBreak) return <Clock className="w-4 h-4" />;
  if (status === "COMPLETED") return <CheckCircle2 className="w-4 h-4 text-success" />;
  if (status === "MISSED") return <AlertCircle className="w-4 h-4 text-danger" />;
  if (status === "IN_PROGRESS") return <Zap className="w-4 h-4 text-primary" />;
  return <Clock className="w-4 h-4 text-slate-400" />;
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "HIGH":
      return "border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/20";
    case "MEDIUM":
      return "border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-900/20";
    default:
      return "border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20";
  }
}

function getSessionTypeColor(sessionType: string) {
  const colors: Record<string, string> = {
    LECTURE: "bg-primary/10 text-primary",
    REVISION: "bg-success/10 text-success",
    PRACTICE: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    ASSIGNMENT: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    PRACTICAL: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
    PROJECT: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
    READING: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
    EXAM_PREPARATION:
      "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    MOCK_TEST: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
    BREAK: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  };
  return colors[sessionType] || "bg-slate-100 dark:bg-slate-800";
}

export function DailyTimeline({
  sessions,
  onEdit,
  onDelete,
  onMarkComplete,
}: DailyTimelineProps) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 dark:text-slate-400">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-body font-medium">No study sessions scheduled for today</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session, index) => (
        <div
          key={session.id}
          className={`rounded-lg p-4 space-y-3 ${getPriorityColor(session.priority)}`}
        >
          {/* Header Row */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex flex-col items-center gap-1">
                <div className="text-center">
                  <div className="text-body font-bold text-primary">
                    {session.startTime}
                  </div>
                  <div className="text-small text-slate-500">↓</div>
                  <div className="text-body font-bold text-primary">
                    {session.endTime}
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-card-title font-semibold">{session.subjectName}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-small font-medium ${getSessionTypeColor(
                      session.sessionType
                    )}`}
                  >
                    {session.sessionType.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  {getStatusIcon(session.status, session.isBreak)}
                  <span className="text-small font-medium text-slate-600 dark:text-slate-400">
                    {session.isBreak
                      ? "Break"
                      : session.status === "IN_PROGRESS"
                      ? "In Progress"
                      : session.status === "COMPLETED"
                      ? "Completed"
                      : session.status === "MISSED"
                      ? "Missed"
                      : "Pending"}
                  </span>
                </div>

                {/* Lecture Progress (if not break) */}
                {!session.isBreak && session.totalLectures > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-small">
                      <span className="text-slate-600 dark:text-slate-400">Progress</span>
                      <span className="font-medium">
                        {session.completedLectures}/{session.totalLectures}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5">
                      <div
                        className="bg-primary rounded-full h-1.5"
                        style={{
                          width: `${(session.completedLectures / session.totalLectures) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Pending Work */}
                {session.pendingWork && (
                  <div className="mt-2 flex items-start gap-2 text-small text-slate-600 dark:text-slate-400">
                    <BookOpen className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{session.pendingWork}</span>
                  </div>
                )}

                {/* Notes */}
                {session.notes && (
                  <p className="mt-2 text-small text-slate-600 dark:text-slate-400 italic">
                    {session.notes}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            {session.status !== "COMPLETED" && session.status !== "MISSED" && !session.isBreak && (
              <button
                onClick={() => onMarkComplete?.(session)}
                className="px-3 py-1 text-small font-medium bg-success/10 text-success rounded hover:bg-success/20"
              >
                Mark Done
              </button>
            )}
            <button
              onClick={() => onEdit?.(session)}
              className="px-3 py-1 text-small font-medium bg-primary/10 text-primary rounded hover:bg-primary/20"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete?.(session)}
              className="px-3 py-1 text-small font-medium bg-danger/10 text-danger rounded hover:bg-danger/20"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
