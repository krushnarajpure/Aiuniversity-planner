"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getPlacementDashboardData() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) throw new Error("You must be logged in to view placement data");

  const [profile, applications, aptitudeResults, streak, recommendedJobs] = await Promise.all([
    prisma.placementProfile.findUnique({ where: { userId } }),
    prisma.placementApplication.findMany({ where: { studentId: userId }, include: { job: { include: { organization: true } } }, orderBy: { updatedAt: "desc" }, take: 8 }),
    prisma.aptitudeResult.findMany({ where: { userId }, orderBy: { takenAt: "desc" }, take: 5 }),
    prisma.placementStreak.findUnique({ where: { userId } }),
    prisma.placementJob.findMany({ where: { isActive: true }, include: { organization: true }, orderBy: { createdAt: "desc" }, take: 4 }),
  ]);

  const latestAptitude = aptitudeResults[0]?.score ?? 0;
  const readinessParts = [profile?.resumeScore, profile?.interviewScore, latestAptitude].filter((score): score is number => typeof score === "number");
  const readinessScore = readinessParts.length ? Math.round(readinessParts.reduce((sum, score) => sum + score, 0) / readinessParts.length) : null;

  return { profile, applications, aptitudeResults, streak, recommendedJobs, readinessScore };
}

