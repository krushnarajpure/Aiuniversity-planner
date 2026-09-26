import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Code2,
  Flame,
  FolderOpen,
  Play,
  Search,
  Settings2,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

const tabs = [
  { label: "Overview", href: "/placement/coding-practice" },
  { label: "Problems", href: "/placement/coding-practice/problems" },
  { label: "DSA", href: "/placement/coding-practice/dsa" },
  { label: "Companies", href: "/placement/coding-practice/company" },
  { label: "Interview", href: "/placement/coding-practice/interview" },
  { label: "Projects", href: "/placement/coding-practice/projects" },
  { label: "Submissions", href: "/placement/coding-practice/submissions" },
  { label: "Progress", href: "/placement/coding-practice/progress" },
  { label: "Saved", href: "/placement/coding-practice/saved" },
  { label: "Settings", href: "/placement/coding-practice/settings" },
] as const;

const stats = [
  { label: "Day streak", value: "12 days", icon: Flame, tone: "warning" },
  { label: "Solved", value: "86", icon: Trophy, tone: "primary" },
  { label: "Current rank", value: "#157", icon: Target, tone: "success" },
  { label: "Accuracy", value: "78%", icon: BarChart3, tone: "secondary" },
] as const;

const recentSubmissions = [
  { title: "Two Sum", language: "Python", verdict: "Accepted", time: "42 ms" },
  { title: "Valid Parentheses", language: "JavaScript", verdict: "Wrong Answer", time: "60 ms" },
  { title: "Merge Intervals", language: "Java", verdict: "Accepted", time: "68 ms" },
];

const recommendedProblems = [
  { title: "Longest Substring Without Repeating Characters", difficulty: "Medium", topic: "Strings", time: "24 min" },
  { title: "Course Schedule", difficulty: "Hard", topic: "Graphs", time: "40 min" },
  { title: "Top K Frequent Elements", difficulty: "Medium", topic: "Heap", time: "18 min" },
];

const languageUsage = [
  { name: "Python", value: 52 },
  { name: "JavaScript", value: 28 },
  { name: "Java", value: 14 },
  { name: "C++", value: 6 },
] as const;

const projects = [
  { name: "Campus Planner", language: "Python", files: 8, updated: "Today" },
  { name: "Interview Prep Tracker", language: "TypeScript", files: 14, updated: "2 days ago" },
  { name: "DSA Notebook", language: "Java", files: 6, updated: "1 week ago" },
] as const;

export default function CodingPracticeOverviewPage() {
  return (
    <AppShell userName="Student">
      <div className="space-y-6 p-4 sm:p-6">
        <div className="card p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-small font-medium text-primary">Placement / Coding Practice Lab</p>
              <h1 className="mt-2 text-subheading font-semibold">Coding Lab</h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/placement/coding-practice/workspace" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-small font-semibold text-white transition hover:opacity-90">
                <Play className="h-4 w-4" />
                Start Coding
              </Link>
              <Link href="/placement/coding-practice/problems" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-small font-semibold text-slate-700 transition hover:border-primary/50 hover:text-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                <BookOpen className="h-4 w-4" />
                Continue Practice
              </Link>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const isActive = tab.href === "/placement/coding-practice";
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    isActive
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-slate-200 bg-transparent text-slate-600 hover:border-primary/40 hover:text-primary dark:border-slate-700 dark:text-slate-300"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-small text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="mt-2 text-subheading font-semibold">{value}</p>
                </div>
                <div className={`rounded-xl p-2 ${tone === "warning" ? "bg-amber-500/10 text-amber-500" : tone === "primary" ? "bg-primary/10 text-primary" : tone === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-sky-500/10 text-sky-500"}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <section className="card p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-card-title font-semibold">Recent submissions</h2>
                <p className="text-small text-slate-500 dark:text-slate-400">Latest coding runs and verdicts.</p>
              </div>
              <Link href="/placement/coding-practice/submissions" className="inline-flex items-center gap-1 text-small font-medium text-primary hover:underline">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentSubmissions.map((item) => (
                <div key={item.title} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{item.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.language} • {item.time}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.verdict === "Accepted" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : item.verdict === "Wrong Answer" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"}`}>
                    {item.verdict}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-card-title font-semibold">Continue where you left off</h2>
              </div>
              <Link href="/placement/coding-practice/workspace" className="text-small font-medium text-primary hover:underline">Open</Link>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-small text-slate-500 dark:text-slate-400">Current challenge</p>
                  <h3 className="mt-2 text-lg font-semibold">Two Sum</h3>
                </div>
                <div className="rounded-lg bg-white p-2 text-primary shadow-sm dark:bg-slate-900">
                  <Code2 className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-small text-slate-600 dark:text-slate-300">
                <Target className="h-4 w-4 text-primary" />
                Arrays • Easy • 20 min
              </div>

              <Link href="/placement/coding-practice/workspace" className="mt-4 inline-flex items-center gap-2 text-small font-semibold text-primary hover:underline">
                Resume solution <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="card p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-card-title font-semibold">Recommended problems</h2>
                <p className="text-small text-slate-500 dark:text-slate-400">Curated for your upcoming placement rounds.</p>
              </div>
              <Link href="/placement/coding-practice/problems" className="text-small font-medium text-primary hover:underline">Browse all</Link>
            </div>

            <div className="space-y-3">
              {recommendedProblems.map((problem) => (
                <div key={problem.title} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-primary/40 dark:border-slate-700">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{problem.title}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{problem.topic} • {problem.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${problem.difficulty === "Medium" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : problem.difficulty === "Hard" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}`}>
                      {problem.difficulty}
                    </span>
                    <button className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-primary/40 hover:text-primary dark:border-slate-700">
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-card-title font-semibold">Language usage</h2>
              </div>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>

            <div className="space-y-4">
              {languageUsage.map((item) => (
                <div key={item.name}>
                  <div className="mb-1 flex items-center justify-between text-small text-slate-600 dark:text-slate-300">
                    <span>{item.name}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="card p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-card-title font-semibold">Recent projects</h2>
              </div>
              <Link href="/placement/coding-practice/projects" className="text-small font-medium text-primary hover:underline">Open all</Link>
            </div>

            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.name} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                      <FolderOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-100">{project.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{project.language} • {project.files} files</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{project.updated}</p>
                    <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">Open</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-card-title font-semibold">Quick actions</h2>
              </div>
              <Zap className="h-4 w-4 text-primary" />
            </div>

            <div className="space-y-3">
              <Link href="/placement/coding-practice/problems" className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-small font-medium text-slate-700 transition hover:border-primary/40 hover:text-primary dark:border-slate-700 dark:text-slate-200">
                Practice problems <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/placement/coding-practice/workspace" className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-small font-medium text-slate-700 transition hover:border-primary/40 hover:text-primary dark:border-slate-700 dark:text-slate-200">
                Code editor <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/placement/coding-practice/progress" className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-small font-medium text-slate-700 transition hover:border-primary/40 hover:text-primary dark:border-slate-700 dark:text-slate-200">
                Progress analytics <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/placement/coding-practice/settings" className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-small font-medium text-slate-700 transition hover:border-primary/40 hover:text-primary dark:border-slate-700 dark:text-slate-200">
                Editor settings <Settings2 className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
