"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type AssistantRecord = Record<string, unknown>;

async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Please sign in to update academic records.");
  return session.user.id;
}

function nextDate(day: string) {
  const names = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const target = names.indexOf(day.toLowerCase());
  const date = new Date();
  if (target >= 0) {
    const delta = (target - date.getDay() + 7) % 7;
    date.setDate(date.getDate() + delta);
  }
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function saveAcademicAssistantRecord(intent: string, record: AssistantRecord) {
  const userId = await requireUserId();
  if (intent === "course") {
    const courseName = String(record.courseName || "").trim();
    const courseCode = String(record.courseCode || "").trim();
    if (!courseName || !courseCode) throw new Error("Course name and course code are required.");
    const existing = await prisma.course.findFirst({ where: { userId, OR: [{ courseCode }, { courseName }] } });
    if (existing) return { status: "existing", message: "Already Added", id: existing.id };
    const course = await prisma.course.create({ data: { userId, courseName, courseCode, instructor: String(record.instructor || "") || null, creditHours: Number(record.creditHours) || 3 } });
    revalidatePath("/courses");
    return { status: "created", message: "Course added successfully.", id: course.id };
  }
  if (intent === "timetable") {
    const courseName = String(record.courseName || "").trim();
    const courseCode = String(record.courseCode || "").trim();
    const day = String(record.day || "").trim();
    const startTime = String(record.startTime || "").trim();
    const endTime = String(record.endTime || "").trim();
    if (!courseName || !day || !startTime || !endTime) throw new Error("Subject, day and lecture time are required.");
    const course = courseCode ? await prisma.course.findFirst({ where: { userId, courseCode } }) : null;
    const existing = await prisma.timetable.findFirst({ where: { userId, subjectName: courseName, date: nextDate(day), startTime, endTime } });
    if (existing) return { status: "existing", message: "This timetable entry already exists.", id: existing.id };
    const session = await prisma.timetable.create({ data: { userId, subjectName: courseName, date: nextDate(day), startTime, endTime, sessionType: "LECTURE", priority: "MEDIUM", totalLectures: 1, pendingWork: courseCode || null, notes: String(record.facultyName || record.room || "") || null } });
    revalidatePath("/study-planner");
    return { status: "created", message: "Successfully added to Study Timetable.", id: session.id };
  }
  if (intent === "exam") {
    const courseName = String(record.courseName || "").trim();
    const courseCode = String(record.courseCode || "").trim();
    const course = await prisma.course.findFirst({ where: { userId, OR: [{ courseCode }, { courseName }] } });
    if (!course) throw new Error("Add the matching course first, then add this exam.");
    const date = new Date(String(record.date));
    if (Number.isNaN(date.getTime())) throw new Error("A readable exam date is required.");
    const existing = await prisma.exam.findFirst({ where: { userId, courseId: course.id, date, time: String(record.time || "") } });
    if (existing) return { status: "existing", message: "This exam already exists.", id: existing.id };
    const exam = await prisma.exam.create({ data: { userId, courseId: course.id, examType: String(record.examType || "Exam"), date, time: String(record.time || "Unclear"), location: String(record.location || "") || null, notes: String(record.notes || "") || null } });
    revalidatePath("/exams");
    return { status: "created", message: "Exam added successfully.", id: exam.id };
  }
  if (intent === "assignment") {
    const courseName = String(record.courseName || "").trim();
    const courseCode = String(record.courseCode || "").trim();
    const course = await prisma.course.findFirst({ where: { userId, OR: [{ courseCode }, { courseName }] } });
    if (!course) throw new Error("Add the matching course first, then add this assignment.");
    const deadline = new Date(String(record.deadline));
    if (!String(record.title || "") || Number.isNaN(deadline.getTime())) throw new Error("Assignment title and readable due date are required.");
    const assignment = await prisma.assignment.create({ data: { userId, courseId: course.id, title: String(record.title), description: String(record.description || "") || null, deadline, difficulty: record.difficulty === "HARD" ? "HARD" : record.difficulty === "EASY" ? "EASY" : "MEDIUM", estimatedHours: Number(record.estimatedHours) || 1, notes: String(record.notes || "") || null } });
    revalidatePath("/assignments");
    return { status: "created", message: "Assignment added successfully.", id: assignment.id };
  }
  if (intent === "study_material") {
    const materialName = String(record.materialName || record.title || "").trim();
    const subject = String(record.subject || record.courseName || "").trim();
    const notesContent = String(record.notesContent || record.description || "").trim();
    if (!materialName || !subject || !notesContent) throw new Error("Material title, subject and readable content are required.");
    const material = await prisma.studyMaterial.create({ data: { userId, materialName, subject, unit: String(record.unit || "General"), type: "NOTES", notesContent, description: String(record.description || "") || null, tags: Array.isArray(record.tags) ? record.tags.map(String) : [] } });
    revalidatePath("/study-material");
    return { status: "created", message: "Study material added successfully.", id: material.id };
  }
  throw new Error("I could not identify the academic section. Choose Courses, Assignments, Exams, Study Timetable or Study Material.");
}
