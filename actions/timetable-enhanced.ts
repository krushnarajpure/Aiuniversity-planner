"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SessionType, Priority, TimetableStatus } from "@prisma/client";
import { toast } from "sonner";

async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("You must be logged in to do this");
  }
  return session.user.id;
}

// ============== Utility Functions ==============

function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function calculateDuration(startTime: string, endTime: string): number {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  return Math.max(0, (end - start) / 60); // Returns hours
}

function timeToString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

// ============== Overlap Detection ==============

export async function detectOverlap(
  date: Date,
  startTime: string,
  endTime: string,
  excludeId?: string
) {
  const userId = await requireUserId();
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const sessions = await prisma.timetable.findMany({
    where: {
      userId,
      date: { gte: startOfDay, lte: endOfDay },
      NOT: excludeId ? { id: excludeId } : undefined,
      isBreak: false,
    },
  });

  const newStart = parseTime(startTime);
  const newEnd = parseTime(endTime);

  for (const session of sessions) {
    const existStart = parseTime(session.startTime);
    const existEnd = parseTime(session.endTime);

    // Check for overlap
    if (newStart < existEnd && newEnd > existStart) {
      return {
        hasConflict: true,
        conflictWith: session,
        message: `Overlaps with ${session.subjectName} (${session.startTime} – ${session.endTime})`,
      };
    }
  }

  return { hasConflict: false };
}

// ============== Current/Next Session Tracking ==============

export async function getCurrentSession() {
  const userId = await requireUserId();
  const now = new Date();
  const currentTime = parseTime(
    `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
  );

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const sessions = await prisma.timetable.findMany({
    where: {
      userId,
      date: { gte: startOfDay, lte: endOfDay },
      isBreak: false,
    },
    orderBy: { startTime: "asc" },
  });

  for (const session of sessions) {
    const start = parseTime(session.startTime);
    const end = parseTime(session.endTime);
    if (currentTime >= start && currentTime < end) {
      return { current: session, status: "CURRENT" };
    }
  }

  return { current: null, status: null };
}

export async function getNextSession() {
  const userId = await requireUserId();
  const now = new Date();
  const currentTime = parseTime(
    `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
  );

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const sessions = await prisma.timetable.findMany({
    where: {
      userId,
      date: { gte: startOfDay, lte: endOfDay },
      isBreak: false,
    },
    orderBy: { startTime: "asc" },
  });

  for (const session of sessions) {
    const start = parseTime(session.startTime);
    if (start > currentTime) {
      return { next: session };
    }
  }

  return { next: null };
}

// ============== Upcoming Sessions ==============

export async function getUpcomingSessions(days: number = 7) {
  const userId = await requireUserId();
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + days);

  return prisma.timetable.findMany({
    where: {
      userId,
      date: { gte: now, lte: futureDate },
      isBreak: false,
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    take: 5,
  });
}

// ============== Missed Sessions ==============

export async function getMissedSessions() {
  const userId = await requireUserId();
  const now = new Date();

  return prisma.timetable.findMany({
    where: {
      userId,
      date: { lt: now },
      status: { in: ["PENDING", "IN_PROGRESS"] },
      isBreak: false,
    },
    orderBy: { date: "desc" },
  });
}

// ============== Today's Schedule ==============

export async function getTodaySchedule() {
  const userId = await requireUserId();
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  return prisma.timetable.findMany({
    where: {
      userId,
      date: { gte: startOfDay, lte: endOfDay },
    },
    orderBy: { startTime: "asc" },
  });
}

// ============== Weekly Statistics ==============

export async function getWeeklyStats(startDate?: Date) {
  const userId = await requireUserId();
  const weekStart = startDate || new Date();
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const sessions = await prisma.timetable.findMany({
    where: {
      userId,
      date: { gte: weekStart, lte: weekEnd },
    },
  });

  const stats = {
    totalStudyHours: 0,
    completedSessions: 0,
    missedSessions: 0,
    pendingSessions: 0,
    subjects: new Map<string, { hours: number; sessions: number; completed: number }>(),
  };

  for (const session of sessions) {
    if (!session.isBreak) {
      const duration = calculateDuration(session.startTime, session.endTime);
      stats.totalStudyHours += duration;

      if (session.status === "COMPLETED") {
        stats.completedSessions++;
      } else if (session.status === "MISSED") {
        stats.missedSessions++;
      } else {
        stats.pendingSessions++;
      }

      if (!stats.subjects.has(session.subjectName)) {
        stats.subjects.set(session.subjectName, {
          hours: 0,
          sessions: 0,
          completed: 0,
        });
      }

      const subjectStats = stats.subjects.get(session.subjectName)!;
      subjectStats.hours += duration;
      subjectStats.sessions++;
      if (session.status === "COMPLETED") {
        subjectStats.completed++;
      }
    }
  }

  return {
    ...stats,
    subjects: Object.fromEntries(stats.subjects),
  };
}

// ============== Study Goals ==============

export async function getOrCreateStudyGoal(type: "DAILY" | "WEEKLY") {
  const userId = await requireUserId();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let goal = await prisma.studyGoal.findFirst({
    where: {
      userId,
      goalType: type,
      startDate: { lte: today },
      OR: [{ endDate: null }, { endDate: { gte: today } }],
    },
  });

  if (!goal) {
    const endDate = new Date(today);
    if (type === "DAILY") {
      endDate.setHours(23, 59, 59, 999);
    } else {
      endDate.setDate(endDate.getDate() + 7);
    }

    goal = await prisma.studyGoal.create({
      data: {
        userId,
        goalType: type,
        targetHours: type === "DAILY" ? 6 : 30,
        startDate: today,
        endDate,
      },
    });
  }

  return goal;
}

export async function updateStudyGoal(goalId: string, targetHours: number) {
  const userId = await requireUserId();

  const goal = await prisma.studyGoal.findUnique({
    where: { id: goalId },
  });

  if (!goal || goal.userId !== userId) {
    throw new Error("Goal not found");
  }

  return prisma.studyGoal.update({
    where: { id: goalId },
    data: { targetHours },
  });
}

export async function getProgressTowardGoal(type: "DAILY" | "WEEKLY") {
  const userId = await requireUserId();
  const goal = await getOrCreateStudyGoal(type);
  const stats = await getWeeklyStats(goal.startDate);

  return {
    goal,
    studyHours: stats.totalStudyHours,
    remaining: Math.max(0, goal.targetHours - stats.totalStudyHours),
    progress: Math.round((stats.totalStudyHours / goal.targetHours) * 100),
  };
}

// ============== Subject Progress ==============

export async function getSubjectProgress() {
  const userId = await requireUserId();

  const timetables = await prisma.timetable.findMany({
    where: { userId, isBreak: false },
  });

  const subjects = new Map<
    string,
    { total: number; completed: number; sessions: number }
  >();

  for (const timetable of timetables) {
    if (!subjects.has(timetable.subjectName)) {
      subjects.set(timetable.subjectName, {
        total: 0,
        completed: 0,
        sessions: 0,
      });
    }

    const subject = subjects.get(timetable.subjectName)!;
    subject.total += timetable.totalLectures;
    subject.completed += timetable.completedLectures;
    subject.sessions++;
  }

  return Array.from(subjects.entries()).map(([name, data]) => ({
    subject: name,
    totalLectures: data.total,
    completedLectures: data.completed,
    pendingLectures: data.total - data.completed,
    progress: Math.round((data.completed / data.total) * 100),
    sessions: data.sessions,
  }));
}

// ============== Study Streak ==============

export async function getStudyStreak() {
  const userId = await requireUserId();
  const today = new Date();

  let streak = 0;
  let checkDate = new Date(today);

  while (true) {
    const startOfDay = new Date(checkDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(checkDate);
    endOfDay.setHours(23, 59, 59, 999);

    const sessionsOnDay = await prisma.timetable.findMany({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
        status: "COMPLETED",
        isBreak: false,
      },
    });

    if (sessionsOnDay.length === 0) break;

    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

// ============== Productivity Insights ==============

export async function getProductivityInsights() {
  const userId = await requireUserId();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);

  const sessions = await prisma.timetable.findMany({
    where: {
      userId,
      date: { gte: weekStart },
      status: "COMPLETED",
      isBreak: false,
    },
  });

  if (sessions.length === 0) {
    return {
      insights: [
        "Start by scheduling your first study session to track productivity.",
      ],
    };
  }

  const insights: string[] = [];

  // Most productive hour
  const hourMap = new Map<number, number>();
  sessions.forEach((s) => {
    const hour = parseInt(s.startTime.split(":")[0]);
    hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
  });
  const mostProductiveHour = Array.from(hourMap.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0];
  if (mostProductiveHour) {
    const hour = mostProductiveHour[0];
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    insights.push(
      `You studied most effectively between ${displayHour}:00 ${ampm} and ${(displayHour % 12) + 1}:00 ${ampm} this week.`
    );
  }

  // Completion rate
  const total = sessions.length;
  const completed = sessions.filter((s) => s.status === "COMPLETED").length;
  const rate = Math.round((completed / total) * 100);
  insights.push(
    `You completed ${rate}% of your planned study sessions this week.`
  );

  // Favorite subject
  const subjectMap = new Map<string, number>();
  sessions.forEach((s) => {
    subjectMap.set(s.subjectName, (subjectMap.get(s.subjectName) || 0) + 1);
  });
  const favoriteSubject = Array.from(subjectMap.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0];
  if (favoriteSubject) {
    insights.push(
      `You focused most on ${favoriteSubject[0]} with ${favoriteSubject[1]} study sessions.`
    );
  }

  return { insights };
}

// ============== Reschedule Session ==============

export async function rescheduleSession(
  sessionId: string,
  newDate: Date,
  newStartTime: string,
  newEndTime: string
) {
  const userId = await requireUserId();

  const session = await prisma.timetable.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.userId !== userId) {
    throw new Error("Session not found");
  }

  // Check for overlap
  const overlap = await detectOverlap(newDate, newStartTime, newEndTime, sessionId);
  if (overlap.hasConflict) {
    throw new Error(overlap.message);
  }

  return prisma.timetable.update({
    where: { id: sessionId },
    data: {
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      status: "PENDING",
    },
  });
}

// ============== Mark Session Complete/Incomplete ==============

export async function markSessionComplete(sessionId: string, completed: boolean) {
  const userId = await requireUserId();

  const session = await prisma.timetable.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.userId !== userId) {
    throw new Error("Session not found");
  }

  return prisma.timetable.update({
    where: { id: sessionId },
    data: {
      status: completed ? "COMPLETED" : "PENDING",
    },
  });
}

// ============== Update Lecture Progress ==============

export async function updateLectureProgress(
  sessionId: string,
  completedCount: number
) {
  const userId = await requireUserId();

  const session = await prisma.timetable.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.userId !== userId) {
    throw new Error("Session not found");
  }

  if (completedCount > session.totalLectures) {
    throw new Error("Cannot complete more lectures than total");
  }

  return prisma.timetable.update({
    where: { id: sessionId },
    data: {
      completedLectures: completedCount,
    },
  });
}

// ============== Today's Summary ==============

export async function getTodaysSummary() {
  const userId = await requireUserId();
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const sessions = await prisma.timetable.findMany({
    where: {
      userId,
      date: { gte: startOfDay, lte: endOfDay },
    },
  });

  const stats = {
    plannedHours: 0,
    completedHours: 0,
    pendingHours: 0,
    totalSessions: 0,
    completedSessions: 0,
    missedSessions: 0,
  };

  for (const session of sessions) {
    if (!session.isBreak) {
      const duration = calculateDuration(session.startTime, session.endTime);
      stats.plannedHours += duration;
      stats.totalSessions++;

      if (session.status === "COMPLETED") {
        stats.completedHours += duration;
        stats.completedSessions++;
      } else if (session.status === "MISSED") {
        stats.missedSessions++;
      } else {
        stats.pendingHours += duration;
      }
    }
  }

  return stats;
}
