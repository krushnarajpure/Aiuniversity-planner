import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { BarChart3, BriefcaseBusiness, FileText, Flame, GraduationCap, Target } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getPlacementDashboardData } from "@/actions/placement";
import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/dashboard/stat-card";

const moduleLinks = [
  ["Jobs", "/placement/jobs", BriefcaseBusiness],
  ["My Applications", "/placement/applications", Target],
  ["Resume Analyzer", "/placement/resume-analyzer", FileText],
  ["Resume Builder", "/placement/resume-builder", FileText],
  ["Aptitude", "/placement/aptitude", GraduationCap],
  ["Roadmap", "/placement/roadmap", Target],
] as const;

export default async function PlacementPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const data = await getPlacementDashboardData();
  const applications = data.applications;
  const shortlisted = applications.filter((application) => application.status === "SHORTLISTED").length;
  const interviews = applications.filter((application) => application.status === "INTERVIEW").length;
  const offers = applications.filter((application) => application.status === "SELECTED").length;

  return (
    <AppShell userName={session.user?.name}>
      <div className="p-6 space-y-6">
        <div><p className="text-small text-primary font-medium">Placement workspace</p><h1 className="text-subheading font-semibold">Your placement journey</h1><p className="text-small text-slate-500 dark:text-slate-400 mt-1">A focused view of preparation, opportunities, and progress.</p></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Target} label="Readiness score" value={data.readinessScore === null ? "Not set" : `${data.readinessScore}%`} accent="primary" />
          <StatCard icon={BriefcaseBusiness} label="Applications" value={applications.length} accent="secondary" />
          <StatCard icon={GraduationCap} label="Shortlisted" value={shortlisted} accent="success" />
          <StatCard icon={Flame} label="Preparation streak" value={data.streak?.currentStreak ?? 0} accent="warning" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="card lg:col-span-2"><div className="flex items-center justify-between mb-4"><div><h2 className="text-card-title font-semibold">Placement overview</h2><p className="text-small text-slate-500 dark:text-slate-400">Keep your strongest signals moving together.</p></div><Link href="/placement/analytics" className="text-small text-primary hover:underline">View analytics</Link></div><div className="grid grid-cols-3 gap-3 text-center"><div className="rounded-lg bg-slate-100 dark:bg-slate-700 p-4"><p className="text-heading font-semibold">{shortlisted}</p><p className="text-small text-slate-500 dark:text-slate-400">Shortlisted</p></div><div className="rounded-lg bg-slate-100 dark:bg-slate-700 p-4"><p className="text-heading font-semibold">{interviews}</p><p className="text-small text-slate-500 dark:text-slate-400">Interviews</p></div><div className="rounded-lg bg-slate-100 dark:bg-slate-700 p-4"><p className="text-heading font-semibold">{offers}</p><p className="text-small text-slate-500 dark:text-slate-400">Offers</p></div></div></section>
          <section className="card"><h2 className="text-card-title font-semibold mb-4">Placement modules</h2><div className="space-y-2">{moduleLinks.map(([label, href, Icon]) => <Link key={href} href={href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-small hover:bg-slate-100 dark:hover:bg-slate-700"><Icon className="w-4 h-4 text-primary" />{label}</Link>)}</div></section>
        </div>
        <section className="card"><div className="flex items-center justify-between mb-4"><h2 className="text-card-title font-semibold">Recommended jobs</h2><Link href="/placement/jobs" className="text-small text-primary hover:underline">Browse all</Link></div>{data.recommendedJobs.length === 0 ? <p className="text-small text-slate-500 dark:text-slate-400">No active jobs are available yet.</p> : <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{data.recommendedJobs.map((job) => <div key={job.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-medium">{job.title}</h3><p className="text-small text-slate-500 dark:text-slate-400">{job.organization.companyName} · {job.location ?? "Location flexible"}</p></div><span className="text-small text-primary">{job.experienceLevel}</span></div><Link href={`/placement/jobs/${job.id}`} className="inline-block mt-3 text-small text-primary hover:underline">View role</Link></div>)}</div>}</section>
      </div>
    </AppShell>
  );
}
