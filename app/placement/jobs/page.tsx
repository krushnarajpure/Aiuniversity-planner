import { getMyPlacementApplications, getPlacementJobs, getPlacementRecommendations } from "@/actions/placement-jobs";
import { JobsPortalClient, type JobPortalApplication, type JobPortalJob } from "@/components/placement/jobs-portal-client";
import { AppShell } from "@/components/layout/app-shell";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

function serializeJob(job: any): JobPortalJob {
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    requiredSkills: job.requiredSkills ?? [],
    location: job.location ?? null,
    jobType: job.jobType ?? null,
    salaryRange: job.salaryRange ?? null,
    minCgpa: job.minCgpa ?? null,
    maxCgpa: job.maxCgpa ?? null,
    experienceLevel: job.experienceLevel ?? "Entry",
    applicationDeadline: job.applicationDeadline?.toISOString?.() ?? null,
    companyName: job.organization?.companyName ?? "Company",
    organizationUserId: job.organization?.userId ?? "",
    matchedSkills: job.matchedSkills ?? [],
    missingSkills: job.missingSkills ?? [],
    skillMatch: job.skillMatch ?? 0,
    cgpaEligible: job.cgpaEligible ?? false,
    matchScore: job.matchScore ?? job.skillMatch ?? 0,
    hasApplied: job.hasApplied ?? false,
  };
}

export default async function PlacementJobsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  const [jobs, recommendations, rawApplications] = await Promise.all([
    getPlacementJobs(),
    getPlacementRecommendations(),
    getMyPlacementApplications(),
  ]);

  const serializedJobs = jobs.map(serializeJob);
  const serializedRecommendations = recommendations.map(serializeJob);
  const jobById = new Map(serializedJobs.map((job) => [job.id, job]));

  const applications: JobPortalApplication[] = rawApplications.map((application: any) => ({
    id: application.id,
    status: application.status.toLowerCase(),
    appliedAt: application.appliedAt.toISOString(),
    interviewAt: application.interviewAt?.toISOString?.() ?? null,
    job: jobById.get(application.jobId) ?? serializeJob(application.job),
  }));

  return (
    <AppShell userName={session.user?.name}>
      <JobsPortalClient
        jobs={serializedJobs}
        recommendations={serializedRecommendations}
        applications={applications}
      />
    </AppShell>
  );
}
