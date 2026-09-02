"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createHash, randomBytes } from "crypto";
import { sendOrganizationVerificationEmail } from "@/lib/email";

const jobSchema = z.object({
    title: z.string().min(2),
    description: z.string().min(20),
    location: z.string().min(2),
    jobType: z.string().min(2),
    recruitmentTitle: z.string().optional(),
    jobCode: z.string().optional(),
    department: z.string().optional(),
    jobSummary: z.string().optional(),
    employmentType: z.string().optional(),
    workMode: z.string().optional(),
    salaryRange: z.string().optional(),
    requiredSkills: z.array(z.string()).default([]),
    preferredSkills: z.array(z.string()).default([]),
    minCgpa: z.number().min(0).max(10).nullable().optional(),
    maxCgpa: z.number().min(0).max(10).nullable().optional(),
    openings: z.number().int().min(1).max(10000).default(1),
    applicationStartDate: z.string().datetime().nullable().optional(),
    applicationDeadline: z.string().datetime().nullable().optional(),
    expectedJoiningDate: z.string().datetime().nullable().optional(),
    eligibility: z.record(z.unknown()).optional(),
    benefits: z.array(z.string()).default([]),
    recruitmentRounds: z.array(z.record(z.unknown())).default([]),
    applicationForm: z.record(z.unknown()).optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "PAUSED", "CLOSED", "ARCHIVED"]).default("DRAFT"),
});

async function requireOrganization() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Authentication required");
    const user = await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase().trim() }, include: { organization: true } });
    if (!user || user.role !== "ORGANIZATION" || !user.organization) throw new Error("Organization access required");
    if (user.organization.verificationStatus !== "APPROVED" && user.organization.verificationStatus !== "VERIFIED") throw new Error("Organization approval is still pending.");
    return user;
}

async function requireOrganizationRegistered() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Authentication required");
    const user = await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase().trim() }, include: { organization: true } });
    if (!user || user.role !== "ORGANIZATION" || !user.organization) throw new Error("Organization access required");
    return user;
}

export async function deleteOrganizationJob(jobId: string) {
    const user = await requireOrganization();
    const job = await prisma.placementJob.findFirst({ where: { id: jobId, organizationId: user.organization!.id } });
    if (!job) throw new Error("Job not found");

    await prisma.placementApplication.deleteMany({ where: { jobId: job.id } });
    await prisma.interview.deleteMany({ where: { jobId: job.id } });
    await prisma.placementJob.delete({ where: { id: job.id } });

    return { success: true };
}

export async function getOrganizationDashboard() {
    const user = await requireOrganization();
    const organizationId = user.organization!.id;
    const [organization, jobs, applications, notifications] = await Promise.all([
        prisma.organization.findUnique({ where: { id: organizationId } }),
        prisma.placementJob.findMany({ where: { organizationId }, include: { _count: { select: { applications: true } } }, orderBy: { createdAt: "desc" }, take: 50 }),
        prisma.placementApplication.findMany({ where: { job: { organizationId } }, include: { student: { select: { id: true, name: true, university: true, cgpa: true, placementProfile: { select: { skills: true, resumeScore: true } } } }, job: { select: { id: true, title: true } } }, orderBy: { appliedAt: "desc" }, take: 100 }),
        prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 10 }),
    ]);
    return { organization, jobs, applications, notifications, metrics: { totalJobs: jobs.length, activeJobs: jobs.filter((job) => job.isActive).length, totalApplications: applications.length, shortlisted: applications.filter((application) => application.status === "SHORTLISTED").length, interviews: applications.filter((application) => application.status === "INTERVIEW").length, selected: applications.filter((application) => application.status === "SELECTED").length } };
}

export async function createOrganizationJob(input: unknown) {
    const user = await requireOrganization();
    const parsed = jobSchema.parse(input);
    return prisma.placementJob.create({ data: { ...parsed, eligibility: parsed.eligibility as Prisma.InputJsonValue | undefined, recruitmentRounds: parsed.recruitmentRounds as Prisma.InputJsonValue, applicationForm: parsed.applicationForm as Prisma.InputJsonValue | undefined, applicationStartDate: parsed.applicationStartDate ? new Date(parsed.applicationStartDate) : null, applicationDeadline: parsed.applicationDeadline ? new Date(parsed.applicationDeadline) : null, expectedJoiningDate: parsed.expectedJoiningDate ? new Date(parsed.expectedJoiningDate) : null, organizationId: user.organization!.id } });
}

export async function updateOrganizationJob(jobId: string, input: unknown) {
    const user = await requireOrganization();
    const parsed = jobSchema.partial().parse(input);
    const job = await prisma.placementJob.findFirst({ where: { id: jobId, organizationId: user.organization!.id } });
    if (!job) throw new Error("Job not found");
    return prisma.placementJob.update({ where: { id: job.id }, data: { ...parsed, eligibility: parsed.eligibility as Prisma.InputJsonValue | undefined, recruitmentRounds: parsed.recruitmentRounds as Prisma.InputJsonValue, applicationForm: parsed.applicationForm as Prisma.InputJsonValue | undefined, applicationStartDate: parsed.applicationStartDate === undefined ? undefined : parsed.applicationStartDate ? new Date(parsed.applicationStartDate) : null, applicationDeadline: parsed.applicationDeadline === undefined ? undefined : parsed.applicationDeadline ? new Date(parsed.applicationDeadline) : null, expectedJoiningDate: parsed.expectedJoiningDate === undefined ? undefined : parsed.expectedJoiningDate ? new Date(parsed.expectedJoiningDate) : null } });
}

export async function updateOrganizationApplication(applicationId: string, status: "APPLIED" | "UNDER_REVIEW" | "SHORTLISTED" | "APTITUDE" | "INTERVIEW" | "SELECTED" | "REJECTED") {
    const user = await requireOrganization();
    const application = await prisma.placementApplication.findFirst({ where: { id: applicationId, job: { organizationId: user.organization!.id } } });
    if (!application) throw new Error("Application not found");
    return prisma.placementApplication.update({ where: { id: application.id }, data: { status, interviewAt: status === "INTERVIEW" ? application.interviewAt ?? new Date() : application.interviewAt } });
}

export async function getOrganizationInterviews() {
    const user = await requireOrganization();
    const organizationId = user.organization!.id;
    const [interviews, applications] = await Promise.all([
        prisma.interview.findMany({
            where: { organizationId },
            include: {
                student: { select: { id: true, name: true, email: true, university: true, department: true } },
                job: { select: { id: true, title: true } },
                application: { select: { id: true, status: true, nextStep: true } },
            },
            orderBy: { scheduledDate: "asc" },
        }),
        prisma.placementApplication.findMany({
            where: { job: { organizationId } },
            include: {
                student: { select: { id: true, name: true, university: true, department: true, email: true } },
                job: { select: { id: true, title: true } },
            },
            orderBy: { appliedAt: "desc" },
        }),
    ]);

    return { organization: user.organization, interviews, applications };
}

export async function scheduleOrganizationInterview(input: {
    applicationId: string;
    title?: string;
    round?: string;
    scheduledDate: string;
    startTime: string;
    endTime: string;
    timezone?: string;
    mode?: "ONLINE" | "OFFLINE" | "HYBRID";
    platform?: string | null;
    meetingLink?: string | null;
    venueName?: string | null;
    venueAddress?: string | null;
    venueRoom?: string | null;
    interviewerName?: string | null;
    interviewerDesignation?: string | null;
    interviewerEmail?: string | null;
    interviewerPhone?: string | null;
    instructions?: string | null;
    documentsRequired?: string | null;
}) {
    const user = await requireOrganization();
    const organizationId = user.organization!.id;
    const scheduled = new Date(input.scheduledDate);
    if (Number.isNaN(scheduled.getTime())) throw new Error("Invalid interview date");

    const application = await prisma.placementApplication.findFirst({
        where: { id: input.applicationId, job: { organizationId } },
        include: { student: true, job: { include: { organization: true } } },
    });

    if (!application) throw new Error("Application not found");

    const interview = await prisma.interview.create({
        data: {
            applicationId: application.id,
            organizationId,
            studentId: application.studentId,
            jobId: application.jobId,
            title: input.title || `${application.job.title} Interview`,
            round: input.round || "Round 1",
            status: "SCHEDULED",
            scheduledDate: scheduled,
            startTime: input.startTime,
            endTime: input.endTime,
            timezone: input.timezone || "UTC",
            mode: input.mode || "ONLINE",
            platform: input.platform || (input.mode === "ONLINE" ? "Google Meet" : null),
            meetingLink: input.meetingLink || null,
            venueName: input.venueName || null,
            venueAddress: input.venueAddress || null,
            venueRoom: input.venueRoom || null,
            interviewerName: input.interviewerName || user.organization?.recruiterName || user.name,
            interviewerDesignation: input.interviewerDesignation || user.organization?.recruiterDesignation || "Recruiter",
            interviewerEmail: input.interviewerEmail || user.email,
            interviewerPhone: input.interviewerPhone || user.organization?.phone || null,
            instructions: input.instructions || null,
            documentsRequired: input.documentsRequired || null,
        },
        include: {
            student: { select: { id: true, name: true, email: true, university: true, department: true } },
            job: { select: { id: true, title: true } },
            application: { select: { id: true, status: true, nextStep: true } },
        },
    });

    await prisma.$transaction([
        prisma.placementApplication.update({
            where: { id: application.id },
            data: {
                status: "INTERVIEW",
                interviewAt: scheduled,
                nextStep: `Interview scheduled for ${scheduled.toLocaleDateString()} at ${input.startTime}`,
            },
        }),
        prisma.notification.create({
            data: {
                userId: application.studentId,
                title: "📅 Interview Scheduled",
                message: `${user.organization?.companyName || "Your interview team"} scheduled your ${interview.round.toLowerCase()} interview for ${application.job.title} on ${scheduled.toLocaleDateString()} at ${input.startTime}.`,
                type: "INTERVIEW_SCHEDULED",
            },
        }),
    ]);

    return interview;
}

export async function updateOrganizationInterviewStatus(interviewId: string, status: "SCHEDULED" | "CONFIRMED" | "RESCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW") {
    const user = await requireOrganization();
    const interview = await prisma.interview.findFirst({ where: { id: interviewId, organizationId: user.organization!.id } });
    if (!interview) throw new Error("Interview not found");

    const updated = await prisma.interview.update({
        where: { id: interview.id },
        data: { status },
    });

    if (status === "COMPLETED") {
        await prisma.placementApplication.update({
            where: { id: interview.applicationId },
            data: { status: "SELECTED", nextStep: "Interview completed" },
        });
    }

    return updated;
}

export async function resendOrganizationVerificationEmail() {
    const user = await requireOrganizationRegistered();
    
    if (!user.emailVerified) {
        const organization = user.organization;
        if (!organization) throw new Error("Organization not found");
        
        // Delete existing tokens
        await prisma.verificationToken.deleteMany({
            where: { userId: user.id, tokenType: "EMAIL_VERIFICATION" },
        });
        
        // Create a new token
        const rawToken = randomBytes(32).toString("hex");
        const tokenHash = createHash("sha256").update(rawToken).digest("hex");
        
        await prisma.verificationToken.create({
            data: {
                userId: user.id,
                tokenHash,
                tokenType: "EMAIL_VERIFICATION",
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
        });

        try {
            await sendOrganizationVerificationEmail({
                email: user.email,
                companyName: organization.companyName,
                recruiterName: organization.recruiterName || user.name,
                token: rawToken,
            });
            return { success: true, message: "Verification email sent successfully. Please check your inbox." };
        } catch (error) {
            console.error("Failed to send verification email:", error);
            throw new Error("Failed to send verification email. Please try again later.");
        }
    }
    
    throw new Error("Organization email is already verified.");
}
