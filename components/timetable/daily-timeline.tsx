"use client";

import { CheckCircle2, Clock, AlertCircle, Zap, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import type { Timetable } from "@prisma/client";
import { format } from "date-fns";
import { useState, useMemo } from "react";

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
    LECTURE: "bg-primary/10 text-primary border-primary/30",
    REVISION: "bg-success/10 text-success border-success/30",
    PRACTICE: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700",
    ASSIGNMENT: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700",
    PRACTICAL: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700",
    PROJECT: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700",
    READING: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700",
    EXAM_PREPARATION: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700",
    MOCK_TEST: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-300 dark:border-pink-700",
    BREAK: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700",
  };
  return colors[sessionType] || "bg-slate-100 dark:bg-slate-800";
}

function calculateDuration(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return "";
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);
  const start = startHour * 60 + startMin;
  const end = endHour * 60 + endMin;
  const duration = Math.max(0, (end - start) / 60);
  const hours = Math.floor(duration);
  const mins = Math.round((duration - hours) * 60);
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function DailyTimeline({
  sessions,
  onEdit,
  onDelete,
  onMarkComplete,
}: DailyTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Sort sessions by start time
  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [sessions]);

  if (sortedSessions.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 dark:text-slate-400">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-body font-medium">No study sessions scheduled for today</p>
      </div>
    );
  }

  // Group sessions by hour for better visualization
  const sessionsByHour = useMemo(() => {
    const grouped: Record<string, Timetable[]> = {};
    sortedSessions.forEach((session) => {
      const hour = session.startTime.split(":")[0];
      if (!grouped[hour]) grouped[hour] = [];
      grouped[hour].push(session);
    });
    return grouped;
  }, [sortedSessions]);

  return (
    <div className="space-y-2">
      {/* Professional Timeline Header */}
      <div className="bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10 rounded-lg p-4 mb-6 border border-primary/10 dark:border-primary/20">
        <h3 className="text-body font-semibold text-slate-800 dark:text-slate-200 mb-2">
          📅 Daily Study Timeline
        </h3>
        <p className="text-small text-slate-600 dark:text-slate-400">
          {sortedSessions.length} session{sortedSessions.length !== 1 ? 's' : ''} scheduled
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {sortedSessions.map((session, index) => (
        <div key={session.id} className="relative mb-4">
          {/* Time marker on left */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center w-20 flex-shrink-0">
              <div className="text-body font-bold text-primary bg-primary/10 rounded-lg p-2 text-center min-w-16">
                {session.startTime}
              </div>
              <div className="text-slate-400 text-small mt-1 mb-1">↓</div>
              <div className="text-body font-bold text-slate-600 dark:text-slate-400">
                {session.endTime}
              </div>
            </div>

            {/* Session card */}
            <div
              className={`flex-1 rounded-lg p-4 space-y-3 cursor-pointer hover:shadow-md transition ${getPriorityColor(session.priority)}`}
              onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
            >
              {/* Title row */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-card-title font-semibold text-slate-900 dark:text-slate-100">
                      {session.subjectName}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-small font-medium border ${getSessionTypeColor(session.sessionType)}`}>
                      {session.sessionType.replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* Quick info row */}
                  <div className="flex items-center gap-4 text-small">
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      {getStatusIcon(session.status, session.isBreak)}
                      <span className="font-medium">
                        {session.isBreak
                          ? "Break"
                          : session.status === "IN_PROGRESS"
                          ? "In Progress"
                          : session.status === "COMPLETED"
                          ? "✓ Completed"
                          : session.status === "MISSED"
                          ? "✗ Missed"
                          : "Pending"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{calculateDuration(session.startTime, session.endTime)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId(expandedId === session.id ? null : session.id);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {expandedId === session.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {/* Expanded content */}
              {expandedId === session.id && (
                <div className="border-t border-current border-opacity-10 pt-3 space-y-3">
                  {/* Lecture Progress */}
                  {!session.isBreak && session.totalLectures > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-small">
                        <span className="text-slate-600 dark:text-slate-400">Progress</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {session.completedLectures}/{session.totalLectures} ({Math.round((session.completedLectures / session.totalLectures) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{
                            width: `${(session.completedLectures / session.totalLectures) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Pending Work */}
                  {session.pendingWork && (
                    <div className="bg-white/50 dark:bg-slate-800/50 rounded p-2 space-y-1">
                      <div className="flex items-start gap-2">
                        <BookOpen className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                        <div className="flex-1">
                          <p className="text-small font-medium text-slate-700 dark:text-slate-300">Pending:</p>
                          <p className="text-small text-slate-600 dark:text-slate-400">{session.pendingWork}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {session.notes && (
                    <div className="bg-white/50 dark:bg-slate-800/50 rounded p-2">
                      <p className="text-small italic text-slate-600 dark:text-slate-400">
                        📝 {session.notes}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {session.status !== "COMPLETED" && session.status !== "MISSED" && !session.isBreak && (
                      <button
                        onClick={() => onMarkComplete?.(session)}
                        className="px-3 py-1.5 text-small font-medium bg-success/20 text-success rounded-lg hover:bg-success/30 transition"
                      >
                        ✓ Done
                      </button>
                    )}
                    <button
                      onClick={() => onEdit?.(session)}
                      className="px-3 py-1.5 text-small font-medium bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition"
                    >
                      ✎ Edit
                    </button>
                    <button
                      onClick={() => onDelete?.(session)}
                      className="px-3 py-1.5 text-small font-medium bg-danger/20 text-danger rounded-lg hover:bg-danger/30 transition"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}
