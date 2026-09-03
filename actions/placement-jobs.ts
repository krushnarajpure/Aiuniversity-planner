"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

async function requireStudent() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("You must be logged in to apply");
  if (session.user.role !== "STUDENT") throw new Error("Only students can apply for jobs");
  return session.user.id;
}

function normalizedSkills(skills: string[]) {
  return skills.map((skill) => skill.trim().toLowerCase()).filter(Boolean);
}

function scoreJob(job: { requiredSkills: string[]; minCgpa: number | null }, studentSkills: string[], studentCgpa: number) {
  const requiredSkills = normalizedSkills(job.requiredSkills);
  const matchedSkills = requiredSkills.filter((required) => studentSkills.some((student) => student.includes(required) || required.includes(student)));
  const missingSkills = requiredSkills.filter((required) => !matchedSkills.includes(required)).slice(0, 3);
  const skillMatch = requiredSkills.length ? Math.round((matchedSkills.length / requiredSkills.length) * 100) : 50;
  const minCgpa = job.minCgpa ?? 0;
  const cgpaEligible = studentCgpa >= minCgpa;
  const cgpaScore = cgpaEligible ? 100 : Math.max(0, 100 - ((minCgpa - studentCgpa) * 20));
  return { matchedSkills, missingSkills, skillMatch, cgpaEligible, matchScore: Math.trunc((skillMatch * 0.65) + (cgpaScore * 0.35)) };
}

export async function getPlacementJobs(query?: string, experience?: string, minCgpa?: number) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const [jobs, profile, student, applications] = await Promise.all([
    prisma.placementJob.findMany({ where: { isActive: true, status: "PUBLISHED", organization: { verified: true } }, include: { organization: true }, orderBy: { createdAt: "desc" }, take: 100 }),
    userId ? prisma.placementProfile.findUnique({ where: { userId } }) : null,
    userId ? prisma.user.findUnique({ where: { id: userId }, select: { cgpa: true } }) : null,
    userId ? prisma.placementApplication.findMany({ where: { studentId: userId }, select: { jobId: true } }) : [],
  ]);
  const appliedJobIds = new Set(applications.map((application) => application.jobId));
  const search = query?.trim().toLowerCase();
  const studentSkills = normalizedSkills(profile?.skills ?? []);
  const filteredJobs = jobs.filter((job) => {
    if (job.applicationDeadline && new Date(job.applicationDeadline).getTime() < Date.now()) return false;
    if (search && ![job.title, job.description, job.location, job.organization.companyName, ...job.requiredSkills].filter(Boolean).join(" ").toLowerCase().includes(search)) return false;
    if (experience && job.experienceLevel !== experience) return false;
    if (typeof minCgpa === "number" && minCgpa > 0 && (job.minCgpa ?? 0) > minCgpa) return false;
    return true;
  });

  return filteredJobs.map((job) => {
    const score = scoreJob(job, studentSkills, student?.cgpa ?? 0);
    return { ...job, ...score, hasApplied: appliedJobIds.has(job.id) };
  });
}

export async function getPlacementRecommendations() {
  const studentId = await requireStudent();
  const [profile, student, applications, jobs] = await Promise.all([
    prisma.placementProfile.findUnique({ where: { userId: studentId } }),
    prisma.user.findUnique({ where: { id: studentId }, select: { cgpa: true } }),
    prisma.placementApplication.findMany({ where: { studentId }, select: { jobId: true } }),
    prisma.placementJob.findMany({ where: { isActive: true, status: "PUBLISHED", organization: { verified: true } }, include: { organization: true }, orderBy: { createdAt: "desc" }, take: 50 }),
  ]);
  const appliedIds = new Set(applications.map((application) => application.jobId));
  return jobs
    .filter((job) => !appliedIds.has(job.id) && (!job.applicationDeadline || new Date(job.applicationDeadline).getTime() >= Date.now()))
    .map((job) => ({ ...job, ...scoreJob(job, normalizedSkills(profile?.skills ?? []), student?.cgpa ?? 0), hasApplied: false }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);
}

export async function getPlacementJob(jobId: string) {
  return prisma.placementJob.findFirst({ where: { id: jobId, isActive: true, status: "PUBLISHED", organization: { verified: true } }, include: { organization: true } });
}

export async function applyToPlacementJob(
  jobId: string,
  applicationForm?: {
    coverLetter?: string;
    portfolioUrl?: string;
    phone?: string;
    noticePeriod?: string;
    expectedSalary?: string;
    availability?: string;
    source?: string;
    customAnswers?: Record<string, string>;
    documents?: Record<string, { name: string; type: string; size: number; dataUrl: string }>;
  },
) {
  const studentId = await requireStudent();
  const [job, applicationCount] = await Promise.all([
    prisma.placementJob.findFirst({ where: { id: jobId, isActive: true, status: "PUBLISHED", organization: { verified: true } } }),
    prisma.placementApplication.count({ where: { studentId } }),
  ]);
  if (!job) return { success: false, message: "Job not found or no longer active" };
  if (job.applicationDeadline && new Date(job.applicationDeadline).getTime() < Date.now()) {
    return { success: false, message: "This job application deadline has passed." };
  }
  if (applicationCount >= 20) return { success: false, message: "Application limit reached (max 20). Withdraw an existing application to apply to new jobs." };
  const existing = await prisma.placementApplication.findUnique({ where: { studentId_jobId: { studentId, jobId } } });
  if (existing) return { success: false, message: "You already applied for this job." };

  const details = [
    applicationForm?.coverLetter ? `Cover letter: ${applicationForm.coverLetter.slice(0, 600)}` : null,
    applicationForm?.portfolioUrl ? `Portfolio: ${applicationForm.portfolioUrl}` : null,
    applicationForm?.phone ? `Phone: ${applicationForm.phone}` : null,
    applicationForm?.noticePeriod ? `Notice period: ${applicationForm.noticePeriod}` : null,
    applicationForm?.expectedSalary ? `Expected salary: ${applicationForm.expectedSalary}` : null,
    applicationForm?.availability ? `Availability: ${applicationForm.availability}` : null,
    applicationForm?.source ? `Source: ${applicationForm.source}` : null,
  ].filter(Boolean).join(" | ");

  const created = await prisma.placementApplication.create({
    data: {
      studentId,
      jobId,
      nextStep: details || "Application under review",
      formData: { answers: applicationForm?.customAnswers ?? {}, documents: applicationForm?.documents ?? {} } as Prisma.InputJsonValue,
      status: "APPLIED"
    },
    include: { job: { include: { organization: true } }, student: { select: { name: true } } }
  });
  await prisma.$transaction([
    prisma.notification.create({
      data: {
        userId: studentId,
        title: "✅ Application Submitted",
        message: `Your application to ${created.job.organization.companyName} for "${created.job.title}" was received.`,
        type: "TASK_COMPLETED"
      }
    }),
    prisma.notification.create({
      data: {
        userId: created.job.organization.userId,
        title: "📋 New Application",
        message: `${created.student.name} applied for "${created.job.title}".`,
        type: "ASSIGNMENT_DUE"
      }
    }),
  ]);
  revalidatePath("/placement");
  revalidatePath("/placement/jobs");
  return { success: true, message: "Application submitted successfully!" };
}

export async function getMyPlacementApplications() {
  const studentId = await requireStudent();
  return prisma.placementApplication.findMany({ where: { studentId }, include: { job: { include: { organization: true } } }, orderBy: { appliedAt: "desc" } });
}
