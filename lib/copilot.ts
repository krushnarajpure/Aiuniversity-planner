import { prisma } from "@/lib/prisma";
import { z } from "zod";

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

const responseBase = z.object({ title: z.string().optional() });
export const copilotResponseSchema = z.discriminatedUnion("type", [
    responseBase.extend({ type: z.literal("text"), message: z.string(), bullets: z.array(z.string()).optional() }),
    responseBase.extend({ type: z.literal("study_plan"), message: z.string(), summary: z.object({ totalStudyHours: z.number().nonnegative(), subjects: z.array(z.string()), highPriorityTopics: z.array(z.string()), revisionSessions: z.number().int().nonnegative(), mockTests: z.number().int().nonnegative() }), sessions: z.array(z.object({ time: z.string(), subject: z.string(), topic: z.string(), duration: z.number().positive(), studyType: z.string(), priority: z.enum(["HIGH", "MEDIUM", "LOW"]) })) }),
    responseBase.extend({ type: z.literal("weekly_timetable"), message: z.string(), sessions: z.array(z.object({ day: z.string(), time: z.string(), subject: z.string(), topic: z.string(), duration: z.number().positive(), studyType: z.string(), priority: z.enum(["HIGH", "MEDIUM", "LOW"]) })) }),
    responseBase.extend({ type: z.literal("quiz"), message: z.string(), questions: z.array(z.object({ question: z.string(), options: z.array(z.string()).min(2), answer: z.string(), explanation: z.string(), difficulty: z.enum(["EASY", "MEDIUM", "HARD"]) })) }),
    responseBase.extend({ type: z.literal("flashcards"), message: z.string(), cards: z.array(z.object({ question: z.string(), answer: z.string(), difficulty: z.enum(["EASY", "MEDIUM", "HARD"]) })) }),
    responseBase.extend({ type: z.literal("focus_session"), message: z.string(), duration: z.number().int().positive().max(180), subject: z.string(), topic: z.string() }),
    responseBase.extend({ type: z.literal("image"), message: z.string(), prompt: z.string(), imageUrl: z.string().url().nullable() }),
]);
export type CopilotResponse = z.infer<typeof copilotResponseSchema>;

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
        studyMaterials: studyMaterials.map((material) => ({ name: material.materialName, subject: material.subject, unit: material.unit, notes: material.notesContent?.slice(0, 10000) ?? null, tags: material.tags })),
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
        {
            role: "system" as const, content: `You are AI University Copilot inside an academic planning app. ${modeInstruction}
Use only the supplied student data when making personal recommendations. Never invent courses, deadlines, marks, or events. If data is missing, say so and still answer generally. Do not submit assignments or claim to perform actions you cannot perform. Format responses with concise headings and bullets when useful. Today's date is ${toDate(new Date())}.
    Student context (JSON): ${JSON.stringify(context)}

    Return ONLY valid JSON matching one of these response types. Use text for normal questions, study_plan for daily plans, weekly_timetable for weekly schedules, quiz for quizzes, flashcards for revision cards, focus_session for a timer request, and image only when the user asks for an image or diagram. There is no image provider configured, so imageUrl must be null and clearly explain that configuration is required. Do not invent unavailable performance metrics. The exact shapes are:
    text {type, title?, message, bullets?}; study_plan {type, title?, message, summary:{totalStudyHours,subjects,highPriorityTopics,revisionSessions,mockTests},sessions:[{time,subject,topic,duration,studyType,priority}]}; weekly_timetable {type,title?,message,sessions:[{day,time,subject,topic,duration,studyType,priority}]}; quiz {type,title?,message,questions:[{question,options,answer,explanation,difficulty}]}; flashcards {type,title?,message,cards:[{question,answer,difficulty}]}; focus_session {type,title?,message,duration,subject,topic}; image {type,title?,message,prompt,imageUrl:null}.`
        },
        ...history.slice(-8),
        { role: "user" as const, content: message },
    ];
}
