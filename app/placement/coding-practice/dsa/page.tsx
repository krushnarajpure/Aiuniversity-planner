import { AppShell } from "@/components/layout/app-shell";
import { CodingLabNav } from "@/components/coding-lab/coding-lab-nav";
import { ArrowRight, ChartNoAxesCombined } from "lucide-react";

const topics = [
  { name: "Arrays", progress: 72 },
  { name: "Strings", progress: 58 },
  { name: "Trees", progress: 34 },
  { name: "Graphs", progress: 27 },
  { name: "DP", progress: 41 },
  { name: "Greedy", progress: 63 },
  { name: "Hashing", progress: 79 },
];

export default function CodingPracticeDsaPage() {
  return (
    <AppShell userName="Student">
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-small font-medium text-primary">Placement / DSA</p>
            <h1 className="text-subheading font-semibold">DSA Practice</h1>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-small font-semibold text-white">
            Start practice <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <CodingLabNav />

        <div className="grid gap-6 lg:grid-cols-2">
          {topics.map((topic) => (
            <div key={topic.name} className="card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-card-title font-semibold">{topic.name}</h2>
                <div className="flex items-center gap-2 text-primary">
                  <ChartNoAxesCombined className="h-4 w-4" />
                  <span className="text-small font-medium">{topic.progress}%</span>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-full rounded-full bg-primary" style={{ width: `${topic.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
