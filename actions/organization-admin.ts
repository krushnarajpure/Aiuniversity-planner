"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  sendOrganizationApprovedEmail,
  sendOrganizationRejectedEmail,
} from "@/lib/email";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN")
    throw new Error("Admin access required");
}

export async function getOrganizationApprovals() {
  await requireAdmin();
  return prisma.organization.findMany({
    include: {
      user: {
        select: {
          email: true,
          name: true,
          emailVerified: true,
          createdAt: true,
          hostedMeetings: {
            select: {
              meetingCode: true,
              title: true,
              status: true,
              startedAt: true,
              endedAt: true,
              participants: { select: { userId: true } },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
      _count: { select: { jobs: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteOrganization(organizationId: string) {
  await requireAdmin();
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { user: true },
  });
  if (!organization) throw new Error("Organization not found");

  await prisma.interview.deleteMany({
    where: { organizationId: organization.id },
  });
  await prisma.placementApplication.deleteMany({
    where: { job: { organizationId: organization.id } },
  });
  await prisma.placementJob.deleteMany({
    where: { organizationId: organization.id },
  });
  await prisma.organization.delete({ where: { id: organization.id } });
  await prisma.user.delete({ where: { id: organization.userId } });

  return { success: true };
}

export async function updateOrganizationVerification(
  organizationId: string,
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED",
  message?: string,
) {
  await requireAdmin();
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { user: true },
  });
  if (!organization) throw new Error("Organization not found");

  // Email verification is no longer required for approval
  // Admin can approve organizations even if email hasn't been verified

  const updated = await prisma.organization.update({
    where: { id: organization.id },
    data: {
      verificationStatus: status,
      verified: status === "APPROVED",
      verificationMessage:
        message?.trim() ||
        (status === "APPROVED"
          ? "Organization approved by administrator."
          : status === "REJECTED"
            ? "Organization registration requires changes. Please contact support."
            : status === "SUSPENDED"
              ? "Organization account has been suspended."
              : "Registration is under review."),
    },
  });

  // Send approval or rejection email
  try {
    if (status === "APPROVED") {
      await sendOrganizationApprovedEmail({
        email: organization.user.email,
        companyName: organization.companyName,
        recruiterName: organization.recruiterName || organization.user.name,
      });
    } else if (status === "REJECTED") {
      await sendOrganizationRejectedEmail({
        email: organization.user.email,
        companyName: organization.companyName,
        recruiterName: organization.recruiterName || organization.user.name,
        reason: message?.trim(),
      });
    }
  } catch (error) {
    console.error("Failed to send organization status email:", error);
    // Don't fail the status update if email fails
  }

  return updated;
}
