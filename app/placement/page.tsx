import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { BarChart3, BookOpen, BriefcaseBusiness, CalendarDays, CheckCircle2, FileText, Flame, GraduationCap, MessageSquare, Target, Upload } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getPlacementDashboardData } from "@/actions/placement";
import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/dashboard/stat-card";

const moduleLinks = [
  ["Jobs", "/placement/jobs", BriefcaseBusiness],
  ["Resume Analyzer", "/placement/resume-analyzer", FileText],
  ["Resume Builder", "/placement/resume-builder", FileText],
  ["Aptitude", "/placement/aptitude", GraduationCap],
  ["Roadmap", "/placement/roadmap", Target],
  ["Mock meetings", "/placement/meetings", MessageSquare],
] as const;

const preparationAreas = [
  ["Aptitude", "/placement/aptitude"],
  ["Logical reasoning", "/placement/aptitude"],
  ["Quantitative aptitude", "/placement/aptitude"],
  ["Coding", "/placement/roadmap/skills"],
  ["Technical interview", "/ai-interview/technical"],
  ["HR interview", "/ai-interview/hr"],
  ["Group discussion", "/ai-interview/communication"],
  ["Resume preparation", "/placement/resume-builder"],
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
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p className="text-small font-medium text-primary">Placement workspace</p><h1 className="text-subheading font-semibold">Your placement journey</h1><p className="mt-1 text-small text-slate-500 dark:text-slate-400">A focused view of preparation, opportunities, and progress.</p></div><Link href="/ai-copilot" className="inline-flex items-center gap-2 self-start rounded-lg bg-primary px-3 py-2 text-small font-semibold text-white transition hover:opacity-90"><MessageSquare className="h-4 w-4" /> Ask Placement Copilot</Link></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Target} label="Readiness score" value={data.readinessScore === null ? "Not set" : `${data.readinessScore}%`} accent="primary" />
          <StatCard icon={BriefcaseBusiness} label="Applications" value={applications.length} accent="secondary" />
          <StatCard icon={GraduationCap} label="Shortlisted" value={shortlisted} accent="success" />
          <StatCard icon={Flame} label="Preparation streak" value={data.streak?.currentStreak ?? 0} accent="warning" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="card lg:col-span-2"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-card-title font-semibold">Placement overview</h2><p className="text-small text-slate-500 dark:text-slate-400">Keep your strongest signals moving together.</p></div><Link href="/placement/roadmap/readiness" className="text-small text-primary hover:underline">View readiness</Link></div><div className="grid grid-cols-3 gap-3 text-center"><div className="rounded-lg bg-slate-100 p-4 dark:bg-slate-700"><p className="text-heading font-semibold">{shortlisted}</p><p className="text-small text-slate-500 dark:text-slate-400">Shortlisted</p></div><div className="rounded-lg bg-slate-100 p-4 dark:bg-slate-700"><p className="text-heading font-semibold">{interviews}</p><p className="text-small text-slate-500 dark:text-slate-400">Interviews</p></div><div className="rounded-lg bg-slate-100 p-4 dark:bg-slate-700"><p className="text-heading font-semibold">{offers}</p><p className="text-small text-slate-500 dark:text-slate-400">Offers</p></div></div><div className="mt-5 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3"><div className="rounded-lg bg-primary/10 p-2 text-primary"><Target className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="text-small font-semibold">{data.profile ? "Your profile is ready for targeted preparation." : "Complete your placement profile to unlock recommendations."}</p><p className="text-xs text-slate-500 dark:text-slate-400">{data.profile?.skills?.length ? `${data.profile.skills.length} skills, ${data.profile.projects} projects, and ${data.profile.internships} internships recorded.` : "Start with your resume and skill profile."}</p></div><Link href="/placement/resume-analyzer" className="shrink-0 text-xs font-semibold text-primary hover:underline">Improve profile</Link></div></section>
          <section className="card"><h2 className="text-card-title font-semibold mb-4">Placement modules</h2><div className="space-y-2">{moduleLinks.map(([label, href, Icon]) => <Link key={href} href={href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-small hover:bg-slate-100 dark:hover:bg-slate-700"><Icon className="w-4 h-4 text-primary" />{label}</Link>)}</div></section>
        </div>
        <section className="card"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-card-title font-semibold">Preparation hub</h2><p className="text-small text-slate-500 dark:text-slate-400">Build confidence across the full placement loop.</p></div><Link href="/placement/roadmap" className="text-small text-primary hover:underline">Open roadmap</Link></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{preparationAreas.map(([label, href]) => <Link key={label} href={href} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-3 text-small transition hover:border-primary/40 hover:bg-primary/5 dark:border-slate-700"><CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />{label}</Link>)}</div></section>
        <section className="card"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-card-title font-semibold">Companies and upcoming drives</h2><p className="text-small text-slate-500 dark:text-slate-400">Review open roles, eligibility, and application deadlines.</p></div><Link href="/placement/jobs" className="text-small text-primary hover:underline">Browse all</Link></div>{data.recommendedJobs.length === 0 ? <p className="text-small text-slate-500 dark:text-slate-400">No active jobs are available yet.</p> : <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{data.recommendedJobs.map((job) => <div key={job.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">{job.organization.companyName.slice(0, 2).toUpperCase()}</div><div className="min-w-0"><h3 className="truncate font-medium">{job.title}</h3><p className="text-small text-slate-500 dark:text-slate-400">{job.organization.companyName} · {job.location ?? "Location flexible"}</p></div></div><span className="shrink-0 rounded-full bg-success/10 px-2 py-1 text-[10px] font-semibold text-success">{job.openings} openings</span></div><div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400"><span>CGPA {job.minCgpa ?? "Any"}+</span><span>{job.salaryRange ?? "Package disclosed in role"}</span><span>{job.applicationDeadline ? `Deadline ${job.applicationDeadline.toLocaleDateString()}` : "Rolling drive"}</span><span>{job.experienceLevel}</span></div><div className="mt-3 flex items-center justify-between"><span className="text-xs text-slate-400">{job.requiredSkills.slice(0, 3).join(" · ") || "Skills listed in role"}</span><Link href={`/placement/jobs/${job.id}`} className="text-small font-semibold text-primary hover:underline">View details</Link></div></div>)}</div>}</section>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><section className="card"><div className="mb-4 flex items-center gap-2"><div className="rounded-lg bg-primary/10 p-2 text-primary"><Upload className="h-4 w-4" /></div><div><h2 className="text-card-title font-semibold">Resume center</h2><p className="text-xs text-slate-500 dark:text-slate-400">Upload, score, and improve your resume.</p></div></div><div className="grid grid-cols-2 gap-2"><Link href="/placement/resume-analyzer" className="rounded-lg border border-slate-200 p-3 text-small hover:border-primary/40 dark:border-slate-700">Analyze resume</Link><Link href="/placement/resume-builder" className="rounded-lg border border-slate-200 p-3 text-small hover:border-primary/40 dark:border-slate-700">Build resume</Link></div></section><section className="card"><div className="mb-4 flex items-center gap-2"><div className="rounded-lg bg-primary/10 p-2 text-primary"><BookOpen className="h-4 w-4" /></div><div><h2 className="text-card-title font-semibold">Skill analysis</h2><p className="text-xs text-slate-500 dark:text-slate-400">{data.profile?.skills.length ? `${data.profile.skills.length} current skills on your profile.` : "Add skills to identify gaps."}</p></div></div><div className="flex flex-wrap gap-2">{(data.profile?.skills.length ? data.profile.skills : ["JavaScript", "Problem solving", "Communication"]).slice(0, 8).map((skill) => <span key={skill} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300">{skill}</span>)}</div><Link href="/placement/roadmap/skills" className="mt-4 inline-block text-small font-semibold text-primary hover:underline">Explore recommended skills</Link></section></div>
      </div>
    </AppShell>
  );
}
