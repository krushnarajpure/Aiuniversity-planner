import { prisma } from "@/lib/prisma";

export const COPILOT_MODES = [
  "study-coach",
  "tutor",
  "academic-analyst",
  "exam-coach",
  "career-mentor",
  "doubt-solver",
  "productivity-coach",
] as const;

export type CopilotMode = (typeof COPILOT_MODES)[number];

export type CopilotContext = {
  student: { name: string; university: string | null; department: string | null; semester: string | null; cgpa: number | null };
  courses: { name: string; code: string; grade: string | null }[];
  assignments: { title: string; course: string; deadline: string; difficulty: string; estimatedHours: number; status: string }[];
  exams: { course: string; type: string; date: string; time: string }[];
  timetable: { subject: string; date: string; startTime: string; endTime: string; type: string; status: string }[];
  studyMaterials: { name: string; subject: string; unit: string; notes: string | null; tags: string[] }[];
  latestStudyPlan: unknown;
};

const toDate = (value: Date) => value.toISOString().slice(0, 10);

export async function getCopilotContext(userId: string): Promise<CopilotContext> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [student, courses, assignments, exams, timetable, studyMaterials, latestStudyPlan] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.course.findMany({ where: { userId }, orderBy: { courseName: "asc" } }),
    prisma.assignment.findMany({ where: { userId, status: { not: "COMPLETED" } }, include: { course: true }, orderBy: { deadline: "asc" }, take: 20 }),
    prisma.exam.findMany({ where: { userId, date: { gte: today } }, include: { course: true }, orderBy: { date: "asc" }, take: 10 }),
    prisma.timetable.findMany({ where: { userId, date: { gte: today } }, orderBy: [{ date: "asc" }, { startTime: "asc" }], take: 20 }),
    prisma.studyMaterial.findMany({ where: { userId, isDeleted: false }, orderBy: { updatedAt: "desc" }, take: 20 }),
    prisma.studyPlan.findFirst({ where: { userId }, orderBy: { generatedAt: "desc" } }),
  ]);

  return {
    student: { name: student.name, university: student.university, department: student.department, semester: student.semester, cgpa: student.cgpa },
    courses: courses.map((course) => ({ name: course.courseName, code: course.courseCode, grade: course.currentGrade })),
    assignments: assignments.map((assignment) => ({ title: assignment.title, course: assignment.course.courseName, deadline: toDate(assignment.deadline), difficulty: assignment.difficulty, estimatedHours: assignment.estimatedHours, status: assignment.status })),
    exams: exams.map((exam) => ({ course: exam.course.courseName, type: exam.examType, date: toDate(exam.date), time: exam.time })),
    timetable: timetable.map((item) => ({ subject: item.subjectName, date: toDate(item.date), startTime: item.startTime, endTime: item.endTime, type: item.sessionType, status: item.status })),
    studyMaterials: studyMaterials.map((material) => ({ name: material.materialName, subject: material.subject, unit: material.unit, notes: material.notesContent?.slice(0, 4000) ?? null, tags: material.tags })),
    latestStudyPlan: latestStudyPlan?.plan ?? null,
  };
}

export function buildCopilotPrompt(message: string, context: CopilotContext, mode: CopilotMode, history: { role: "user" | "assistant"; content: string }[] = []) {
  const modeInstruction = {
    "study-coach": "Be practical and encouraging. Turn priorities into a realistic schedule.",
    tutor: "Teach clearly from first principles, with examples and a short revision recap.",
    "academic-analyst": "Analyze the supplied academic data, call out patterns and uncertainty, and recommend priorities.",
    "exam-coach": "Focus on exam date, high-yield topics, practice, and spaced revision.",
    "career-mentor": "Connect academic work to skills and career direction without inventing personal facts.",
    "doubt-solver": "Resolve the student's question step by step and check likely misconceptions.",
    "productivity-coach": "Help reduce friction, prioritize deadlines, and make the next action obvious.",
  }[mode];

  return [
    { role: "system" as const, content: `You are AI University Copilot inside an academic planning app. ${modeInstruction}
Use only the supplied student data when making personal recommendations. Never invent courses, deadlines, marks, or events. If data is missing, say so and still answer generally. Do not submit assignments or claim to perform actions you cannot perform. Format responses with concise headings and bullets when useful. Today's date is ${toDate(new Date())}.
Student context (JSON): ${JSON.stringify(context)}` },
    ...history.slice(-8),
    { role: "user" as const, content: message },
  ];
}
