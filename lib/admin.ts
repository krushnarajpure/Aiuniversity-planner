import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/login");
    if (session.user.role !== "ADMIN") redirect("/dashboard");
    return session;
}

export async function getAdminMetrics() {
    const [students, activeStudents, newStudents, premiumStudents, courses, assignments, exams, certificates, aiUsage] = await Promise.all([
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.user.count({ where: { role: "STUDENT", updatedAt: { gte: new Date(Date.now() - 30 * 86400000) } } }),
        prisma.user.count({ where: { role: "STUDENT", createdAt: { gte: new Date(Date.now() - 30 * 86400000) } } }),
        Promise.resolve(null),
        prisma.course.count(),
        prisma.assignment.count(),
        prisma.exam.count(),
        Promise.resolve(null),
        prisma.copilotMessage.count(),
    ]);
    return { students, activeStudents, newStudents, premiumStudents, courses, assignments, exams, certificates, aiUsage };
}

export function formatDate(value: Date) {
    return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(value);
}
