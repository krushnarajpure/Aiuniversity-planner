"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { timetableSchema } from "@/lib/validations";

async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("You must be logged in to do this");
  }
  return session.user.id;
}

export type TimetableState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

function extractRaw(formData: FormData) {
  return {
    subjectName: formData.get("subjectName"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    totalLectures: formData.get("totalLectures"),
    completedLectures: formData.get("completedLectures"),
    pendingWork: formData.get("pendingWork") || undefined,
    notes: formData.get("notes") || undefined,
    status: formData.get("status") || "PENDING",
  };
}

export async function getTimetables() {
  const userId = await requireUserId();
  return prisma.timetable.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });
}

export async function getTimetablesForDate(date: Date) {
  const userId = await requireUserId();
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return prisma.timetable.findMany({
    where: {
      userId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: { startTime: "asc" },
  });
}

export async function getTimetablesForWeek(startDate: Date) {
  const userId = await requireUserId();
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(startDate);
  end.setDate(end.getDate() + 7);
  end.setHours(23, 59, 59, 999);

  return prisma.timetable.findMany({
    where: {
      userId,
      date: {
        gte: start,
        lte: end,
      },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
}

export async function createTimetable(
  _prevState: TimetableState,
  formData: FormData
): Promise<TimetableState> {
  const userId = await requireUserId();
  const parsed = timetableSchema.safeParse(extractRaw(formData));

  if (!parsed.success) {
    return { success: false, message: "Please fix the errors below", errors: parsed.error.flatten().fieldErrors };
  }

  await prisma.timetable.create({
    data: { ...parsed.data, userId },
  });

  // Create notification
  const subject = parsed.data.subjectName;
  const time = `${parsed.data.startTime} – ${parsed.data.endTime}`;
  await prisma.notification.create({
    data: {
      userId,
      title: "Study timetable saved successfully!",
      message: `${subject} study session scheduled for ${time}.`,
      type: "TIMETABLE_CREATED",
    },
  });

  revalidatePath("/study-planner");
  return { success: true, message: "Timetable added successfully" };
}

export async function updateTimetable(
  timetableId: string,
  _prevState: TimetableState,
  formData: FormData
): Promise<TimetableState> {
  const userId = await requireUserId();
  const parsed = timetableSchema.safeParse(extractRaw(formData));

  if (!parsed.success) {
    return { success: false, message: "Please fix the errors below", errors: parsed.error.flatten().fieldErrors };
  }

  const timetable = await prisma.timetable.findUnique({ where: { id: timetableId } });
  if (!timetable || timetable.userId !== userId) {
    return { success: false, message: "Timetable not found" };
  }

  await prisma.timetable.update({
    where: { id: timetableId },
    data: parsed.data,
  });

  revalidatePath("/study-planner");
  return { success: true, message: "Timetable updated successfully" };
}

export async function deleteTimetable(timetableId: string) {
  const userId = await requireUserId();

  const timetable = await prisma.timetable.findUnique({ where: { id: timetableId } });
  if (!timetable || timetable.userId !== userId) {
    throw new Error("Timetable not found");
  }

  await prisma.timetable.delete({ where: { id: timetableId } });
  revalidatePath("/study-planner");
}

export async function getTimetableStats() {
  const userId = await requireUserId();
  
  const timetables = await prisma.timetable.findMany({
    where: { userId },
  });

  const totalStudyTime = timetables.reduce((acc, t) => {
    // Calculate minutes between start and end time
    const [startHour, startMin] = t.startTime.split(":").map(Number);
    const [endHour, endMin] = t.endTime.split(":").map(Number);
    const startTotal = startHour * 60 + startMin;
    const endTotal = endHour * 60 + endMin;
    const duration = (endTotal - startTotal) / 60; // Convert to hours
    return acc + duration;
  }, 0);

  const totalLectures = timetables.reduce((acc, t) => acc + t.totalLectures, 0);
  const completedLectures = timetables.reduce((acc, t) => acc + t.completedLectures, 0);
  const pendingLectures = totalLectures - completedLectures;

  return {
    totalStudyTime: parseFloat(totalStudyTime.toFixed(1)),
    totalLectures,
    completedLectures,
    pendingLectures,
    overallProgress: totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0,
  };
}
