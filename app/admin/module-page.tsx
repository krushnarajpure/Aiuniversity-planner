import { prisma } from "@/lib/prisma";

const configured: Record<string, string> = { courses: "Courses", assignments: "Assignments", exams: "Exams", results: "Results", timetable: "Study timetable", planner: "Study planner", "ai-usage": "AI usage", analytics: "Analytics" };
const unconfigured: Record<string, string> = { subscriptions: "Subscriptions", payments: "Payments", certificates: "Certificates", notifications: "Notifications", reports: "Reports", settings: "Settings" };

export async function AdminModulePage({ module }: { module: string }) {
    const title = configured[module] || unconfigured[module] || "Admin module";
    const counts = module === "courses" ? await prisma.course.count() : module === "assignments" ? await prisma.assignment.count() : module === "exams" ? await prisma.exam.count() : module === "timetable" ? await prisma.timetable.count() : module === "planner" ? await prisma.studyPlan.count() : module === "ai-usage" ? await prisma.copilotMessage.count() : null;
    return <section className="p-6 lg:p-8"><p className="text-sm font-medium text-primary">Admin module</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h1>{counts !== null ? <div className="mt-8 max-w-sm rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><p className="text-sm text-slate-500">Records available</p><p className="mt-2 text-3xl font-semibold">{counts}</p><p className="mt-3 text-sm text-slate-500">This module is connected to the existing Prisma schema. Detailed CRUD can be added without changing student routes.</p></div> : <div className="mt-8 max-w-2xl rounded-xl border border-dashed border-slate-300 bg-white p-8 dark:border-slate-700 dark:bg-slate-900"><h2 className="font-semibold">Data source not configured</h2><p className="mt-2 text-sm text-slate-500">The current schema has no {title.toLowerCase()} table, so this screen does not invent records or metrics.</p></div>}</section>;
}
