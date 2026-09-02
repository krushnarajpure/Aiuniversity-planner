import { getMyPlacementApplications, getPlacementJobs, getPlacementRecommendations } from "@/actions/placement-jobs";
import { JobsPortalClient, type JobPortalApplication, type JobPortalJob } from "@/components/placement/jobs-portal-client";
import { AppShell } from "@/components/layout/app-shell";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

type PlacementJobLike = {
  id: string;
  title: string;
  description: string;
  requiredSkills?: string[] | null;
  location?: string | null;
  jobType?: string | null;
  salaryRange?: string | null;
  minCgpa?: number | null;
  maxCgpa?: number | null;
  experienceLevel?: string | null;
  applicationDeadline?: Date | string | null;
  organization?: { companyName?: string | null; userId?: string | null } | null;
  matchedSkills?: string[] | null;
  missingSkills?: string[] | null;
  skillMatch?: number | null;
  cgpaEligible?: boolean | null;
  matchScore?: number | null;
  hasApplied?: boolean | null;
  applicationForm?: unknown;
};

type RawPlacementApplication = {
  id: string;
  status: string;
  appliedAt: Date | string;
  interviewAt?: Date | string | null;
  jobId: string;
  job?: PlacementJobLike | null;
};

function toIsoString(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : value;
}

function serializeJob(job: PlacementJobLike): JobPortalJob {
  const applicationForm = job.applicationForm && typeof job.applicationForm === "object" && !Array.isArray(job.applicationForm)
    ? job.applicationForm as JobPortalJob["applicationForm"]
    : null;
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
    applicationDeadline: toIsoString(job.applicationDeadline),
    companyName: job.organization?.companyName ?? "Company",
    organizationUserId: job.organization?.userId ?? "",
    matchedSkills: job.matchedSkills ?? [],
    missingSkills: job.missingSkills ?? [],
    skillMatch: job.skillMatch ?? 0,
    cgpaEligible: job.cgpaEligible ?? false,
    matchScore: job.matchScore ?? job.skillMatch ?? 0,
    hasApplied: job.hasApplied ?? false,
    applicationForm,
  };
}

export default async function PlacementJobsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  const [jobsResult, recommendationsResult, rawApplicationsResult] = await Promise.allSettled([
    getPlacementJobs(),
    getPlacementRecommendations(),
    getMyPlacementApplications(),
  ]);

  const jobs = jobsResult.status === "fulfilled" ? jobsResult.value : [];
  const recommendations = recommendationsResult.status === "fulfilled" ? recommendationsResult.value : [];
  const rawApplications = rawApplicationsResult.status === "fulfilled" ? rawApplicationsResult.value : [];

  const serializedJobs = jobs.map(serializeJob);
  const serializedRecommendations = recommendations.map(serializeJob);
  const jobById = new Map(serializedJobs.map((job) => [job.id, job]));

  const applications: JobPortalApplication[] = rawApplications.map((application: RawPlacementApplication) => ({
    id: application.id,
    status: String(application.status ?? "APPLIED").toLowerCase(),
    appliedAt: application.appliedAt instanceof Date ? application.appliedAt.toISOString() : String(application.appliedAt ?? new Date().toISOString()),
    interviewAt: application.interviewAt ? (application.interviewAt instanceof Date ? application.interviewAt.toISOString() : String(application.interviewAt)) : null,
    job: jobById.get(application.jobId) ?? (application.job ? serializeJob(application.job) : {
      id: application.jobId,
      title: "Unavailable job",
      description: "This role is no longer available.",
      requiredSkills: [],
      location: null,
      jobType: null,
      salaryRange: null,
      minCgpa: null,
      maxCgpa: null,
      experienceLevel: "Entry",
      applicationDeadline: null,
      companyName: "Company",
      organizationUserId: "",
      matchedSkills: [],
      missingSkills: [],
      skillMatch: 0,
      cgpaEligible: true,
      matchScore: 0,
      hasApplied: true,
      applicationForm: null,
    }),
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
