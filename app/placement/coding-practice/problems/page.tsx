import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { CodingLabNav } from "@/components/coding-lab/coding-lab-nav";
import { ArrowRight, Search, Star } from "lucide-react";

const problems = [
  { title: "Two Sum", difficulty: "Easy", topic: "Arrays", acceptance: "79%", company: "Amazon", time: "20 min" },
  { title: "Valid Parentheses", difficulty: "Medium", topic: "Stack", acceptance: "68%", company: "Microsoft", time: "18 min" },
  { title: "Merge Intervals", difficulty: "Medium", topic: "Sorting", acceptance: "62%", company: "Google", time: "25 min" },
  { title: "Course Schedule", difficulty: "Hard", topic: "Graphs", acceptance: "46%", company: "Meta", time: "40 min" },
  { title: "Top K Frequent Elements", difficulty: "Medium", topic: "Heap", acceptance: "59%", company: "Amazon", time: "22 min" },
  { title: "Longest Substring", difficulty: "Medium", topic: "Strings", acceptance: "67%", company: "Uber", time: "20 min" },
];

export default function CodingPracticeProblemsPage() {
  return (
    <AppShell userName="Student">
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-small font-medium text-primary">Placement / Problems</p>
            <h1 className="text-subheading font-semibold">Practice Problems</h1>
          </div>
          <Link href="/placement/coding-practice/workspace" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-small font-semibold text-white">
            Start solving <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <CodingLabNav />

        <div className="card p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
              <Search className="h-4 w-4 text-slate-400" />
              <input className="w-full bg-transparent text-small text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200" placeholder="Search problem, topic, company..." />
            </div>
            <div className="flex flex-wrap gap-2">
              {['Easy','Medium','Hard'].map((level) => (
                <button key={level} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-primary/40 hover:text-primary dark:border-slate-700 dark:text-slate-300">
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {problems.map((problem) => (
              <div key={problem.title} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-primary/40 dark:border-slate-700 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{problem.title}</p>
                    <button className="text-slate-400 hover:text-primary" aria-label={`Favourite ${problem.title}`}>
                      <Star className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-700">{problem.topic}</span>
                    <span>{problem.company}</span>
                    <span>{problem.time}</span>
                    <span>{problem.acceptance} acceptance</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${problem.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : problem.difficulty === "Medium" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"}`}>
                    {problem.difficulty}
                  </span>
                  <Link href="/placement/coding-practice/workspace" className="rounded-lg bg-primary px-3 py-2 text-small font-medium text-white">Solve</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
