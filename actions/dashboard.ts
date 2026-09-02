"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("You must be logged in to do this");
  return session.user.id;
}

function getStartOfWeek(date: Date) {
  const monday = new Date(date);
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getEndOfWeek(date: Date) {
  const end = new Date(date);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function getDurationMinutes(startTime: string, endTime: string) {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const startTotal = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;
  return Math.max(0, endTotal - startTotal);
}

export async function getDashboardData() {
  const userId = await requireUserId();
  const now = new Date();

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const startOfWeek = getStartOfWeek(now);
  const endOfWeek = getEndOfWeek(startOfWeek);

  const [
    user,
    courses,
    assignments,
    upcomingExams,
    latestPlan,
    todayTimetable,
    studyMaterials,
    unreadNotifications,
    activeGoal,
    placementProfile,
    placementJobs,
    roadmapTasks,
    aptitudeResults,
    thisWeekTimetable,
  ] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.course.findMany({ where: { userId }, orderBy: { courseName: "asc" } }),
    prisma.assignment.findMany({ where: { userId }, include: { course: true }, orderBy: { deadline: "asc" } }),
    prisma.exam.findMany({
      where: { userId, date: { gte: now } },
      include: { course: true },
      orderBy: { date: "asc" },
      take: 6,
    }),
    prisma.studyPlan.findFirst({ where: { userId }, orderBy: { generatedAt: "desc" } }),
    prisma.timetable.findMany({
      where: { userId, date: { gte: startOfDay, lte: endOfDay } },
      orderBy: { startTime: "asc" },
      take: 10,
    }),
    prisma.studyMaterial.findMany({
      where: { userId, isDeleted: false },
      select: { id: true, materialName: true, subject: true, type: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.notification.count({ where: { userId, isRead: false } }),
    prisma.studyGoal.findFirst({ where: { userId, isActive: true }, orderBy: { createdAt: "desc" } }),
    prisma.placementProfile.findUnique({ where: { userId } }),
    prisma.placementJob.findMany({ where: { isActive: true }, select: { id: true }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.placementRoadmapTask.findMany({ where: { userId }, orderBy: { dueDate: "asc" }, take: 8 }),
    prisma.aptitudeResult.findMany({ where: { userId }, orderBy: { takenAt: "desc" }, take: 5 }),
    prisma.timetable.findMany({
      where: { userId, date: { gte: startOfWeek, lte: endOfWeek } },
      orderBy: { date: "asc" },
    }),
  ]);

  const pendingAssignments = assignments.filter((assignment) => assignment.status !== "COMPLETED");
  const completedAssignments = assignments.filter((assignment) => assignment.status === "COMPLETED");
  const overdueAssignments = pendingAssignments.filter((assignment) => assignment.deadline.getTime() < now.getTime());
  const upcomingAssignments = [...pendingAssignments].sort((a, b) => a.deadline.getTime() - b.deadline.getTime()).slice(0, 5);
  const assignmentCompletionRate = assignments.length > 0 ? Math.round((completedAssignments.length / assignments.length) * 100) : 0;

  const thisWeekStudyHours = thisWeekTimetable
    .filter((session) => !session.isBreak)
    .reduce((sum, session) => sum + getDurationMinutes(session.startTime, session.endTime), 0) / 60;

  const overdueExamCount = upcomingExams.filter((exam) => exam.date.getTime() < now.getTime()).length;

  return {
    user,
    assignments,
    pendingAssignments,
    completedAssignments,
    overdueAssignments,
    upcomingAssignments,
    upcomingExams,
    latestPlan,
    todayTimetable,
    thisWeekTimetable,
    studyMaterials,
    unreadNotifications,
    activeGoal,
    placementProfile,
    placementJobs,
    roadmapTasks,
    aptitudeResults,
    courses,
    stats: {
      coursesCount: courses.length,
      pendingAssignmentsCount: pendingAssignments.length,
      completedAssignmentsCount: completedAssignments.length,
      upcomingExamsCount: upcomingExams.length,
      overdueAssignmentsCount: overdueAssignments.length,
      completionRate: assignmentCompletionRate,
      studyHoursThisWeek: Number(thisWeekStudyHours.toFixed(1)),
      todaySessionsCount: todayTimetable.filter((session) => !session.isBreak).length,
      completedSessionsCount: todayTimetable.filter((session) => session.status === "COMPLETED").length,
      studyMaterialsCount: studyMaterials.length,
      unreadNotifications,
      activeGoalHours: activeGoal?.targetHours ?? null,
      latestAptitudeScore: aptitudeResults[0]?.score ?? null,
      activeRoadmapCount: roadmapTasks.filter((task) => task.status !== "PENDING").length,
      activeJobCount: placementJobs.length,
      upcomingExamCount: upcomingExams.length,
      overdueExamCount,
    },
  };
}
