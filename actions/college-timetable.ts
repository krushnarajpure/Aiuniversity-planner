"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type CollegeTimetableEntryInput = {
  courseName: string;
  courseCode: string;
  facultyName?: string | null;
  day: string;
  startTime: string;
  endTime: string;
  room?: string | null;
};

async function userId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Please sign in to manage your college timetable.");
  return session.user.id;
}

export async function getCollegeTimetable() {
  const id = await userId();
  return prisma.collegeTimetable.findMany({ where: { userId: id }, orderBy: [{ day: "asc" }, { startTime: "asc" }] });
}

export async function addCollegeTimetableEntries(entries: CollegeTimetableEntryInput[]) {
  const id = await userId();
  const clean = entries.filter((entry) => entry.courseName.trim() && entry.courseCode.trim() && entry.day.trim() && entry.startTime.trim() && entry.endTime.trim());
  if (!clean.length) throw new Error("No complete timetable entries were found.");
  let added = 0;
  for (const entry of clean) {
    const course = await prisma.course.findFirst({ where: { userId: id, courseCode: entry.courseCode.trim() } });
    const result = await prisma.collegeTimetable.createMany({
      data: [{ ...entry, userId: id, courseId: course?.id ?? null, courseName: entry.courseName.trim(), courseCode: entry.courseCode.trim(), facultyName: entry.facultyName?.trim() || null, room: entry.room?.trim() || null }],
      skipDuplicates: true,
    });
    added += result.count;
  }
  revalidatePath("/college-timetable");
  revalidatePath("/study-planner");
  return { added, skipped: clean.length - added };
}

export async function addCourseFromCollegeTimetable(entry: CollegeTimetableEntryInput) {
  const id = await userId();
  const existing = await prisma.course.findFirst({ where: { userId: id, OR: [{ courseCode: entry.courseCode }, { courseName: entry.courseName }] } });
  if (existing) return { status: "existing" as const, course: existing };
  const course = await prisma.course.create({ data: { userId: id, courseName: entry.courseName, courseCode: entry.courseCode, instructor: entry.facultyName || null, creditHours: 3 } });
  revalidatePath("/courses");
  revalidatePath("/college-timetable");
  return { status: "created" as const, course };
}
