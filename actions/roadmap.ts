"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { roadmapPhases, roadmapTaskTemplates } from "@/lib/roadmap";

async function requireUser() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id && !session?.user?.email) throw new Error("Authentication required");

    const user = session.user.email
        ? await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase().trim() }, select: { id: true } })
        : await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true } });

    if (!user) throw new Error("Your account could not be found. Please sign in again.");
    return user.id;
}

export async function getRoadmapData() {
    const userId = await requireUser();
    const templates = roadmapTaskTemplates.map(([phaseId, title, description, priority, estimatedMinutes], index) => ({
        userId,
        phaseId,
        taskKey: `${phaseId}-${index + 1}`,
        title,
        description,
        priority,
        estimatedMinutes,
    }));

    await prisma.placementRoadmapTask.createMany({ data: templates, skipDuplicates: true });

    const [tasks, profile, aptitude, applications, user] = await Promise.all([
        prisma.placementRoadmapTask.findMany({ where: { userId }, orderBy: [{ phaseId: "asc" }, { createdAt: "asc" }] }),
        prisma.placementProfile.findUnique({ where: { userId } }),
        prisma.aptitudeStats.findUnique({ where: { userId } }),
        prisma.placementApplication.count({ where: { studentId: userId } }),
        prisma.user.findUnique({ where: { id: userId }, select: { name: true, cgpa: true, department: true } }),
    ]);

    const phases = roadmapPhases.map((phase) => {
        const phaseTasks = tasks.filter((task) => task.phaseId === phase.id);
        const completed = phaseTasks.filter((task) => task.status === "COMPLETED").length;
        const inProgress = phaseTasks.filter((task) => task.status === "IN_PROGRESS").length;
        return {
            ...phase,
            tasks: phaseTasks,
            completed,
            inProgress,
            total: phaseTasks.length,
            progress: phaseTasks.length ? Math.round((completed / phaseTasks.length) * 100) : 0,
            status: completed === phaseTasks.length && phaseTasks.length > 0 ? "COMPLETED" : inProgress > 0 || completed > 0 ? "IN_PROGRESS" : "PENDING",
        };
    });

    const completedTasks = tasks.filter((task) => task.status === "COMPLETED").length;
    const inProgressTasks = tasks.filter((task) => task.status === "IN_PROGRESS").length;
    const roadmapProgress = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
    const currentPhase = phases.find((phase) => phase.status === "IN_PROGRESS") ?? phases.find((phase) => phase.status === "PENDING") ?? phases[0];
    const readinessInputs = [
        profile?.resumeScore,
        profile?.atsScore,
        profile?.interviewScore,
        aptitude?.averageScore,
        profile?.projects ? Math.min(100, profile.projects * 25) : undefined,
        applications ? Math.min(100, applications * 20) : undefined,
    ].filter((value): value is number => typeof value === "number");
    const readiness = readinessInputs.length ? Math.round(readinessInputs.reduce((sum, value) => sum + value, 0) / readinessInputs.length) : null;

    return { user, tasks, phases, currentPhase, completedTasks, inProgressTasks, roadmapProgress, readiness, profile, aptitude, applications };
}

export async function updateRoadmapTask(taskId: string, status: "PENDING" | "IN_PROGRESS" | "COMPLETED", notes?: string) {
    const userId = await requireUser();
    const task = await prisma.placementRoadmapTask.findFirst({ where: { id: taskId, userId } });
    if (!task) throw new Error("Task not found");

    return prisma.placementRoadmapTask.update({
        where: { id: task.id },
        data: { status, notes, completedAt: status === "COMPLETED" ? new Date() : null },
    });
}
