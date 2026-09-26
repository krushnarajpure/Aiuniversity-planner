"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { CodingLabNav } from "@/components/coding-lab/coding-lab-nav";
import { Play, Save, Settings2, TerminalSquare, TestTube2 } from "lucide-react";

const languages = ["Python", "JavaScript", "Java", "C++", "TypeScript", "C#"];
const files = [
  { name: "main.py", active: true },
  { name: "utils.py", active: false },
  { name: "README.md", active: false },
];

const starterCode = `def two_sum(nums, target):
    seen = {}
    for index, value in enumerate(nums):
        need = target - value
        if need in seen:
            return [seen[need], index]
        seen[value] = index
    return []

print(two_sum([2, 7, 11, 15], 9))`;

export default function CodingPracticeWorkspacePage() {
  const [selectedLanguage, setSelectedLanguage] = useState("Python");
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState("Program finished with no output.");
  const [tab, setTab] = useState("Output");

  const runCode = () => {
    setTab("Output");
    setOutput("Accepted\nRuntime: 42 ms\nMemory: 18.2 MB\nOutput: [0, 1]");
  };

  return (
    <AppShell userName="Student">
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-small font-medium text-primary">Placement / Workspace</p>
            <h1 className="text-subheading font-semibold">Problem Workspace</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={runCode} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-small font-semibold text-white">
              <Play className="h-4 w-4" /> Run
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-small font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-100">
              <Save className="h-4 w-4" /> Save
            </button>
          </div>
        </div>

        <CodingLabNav />

        <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_340px]">
          <aside className="card p-3">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-card-title font-semibold">Explorer</h2>
              <span className="text-xs text-slate-500">3 files</span>
            </div>
            <div className="space-y-2">
              {files.map((file) => (
                <button key={file.name} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-small ${file.active ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}>
                  <span>{file.name}</span>
                  {file.active && <span className="h-2 w-2 rounded-full bg-primary" />}
                </button>
              ))}
            </div>
          </aside>

          <section className="card overflow-hidden p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-small text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                  {languages.map((language) => (
                    <option key={language} value={language}>{language}</option>
                  ))}
                </select>
                <button className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs dark:border-slate-700">A-</button>
                <button className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs dark:border-slate-700">A+</button>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-lg border border-slate-200 px-3 py-2 text-small text-slate-600 dark:border-slate-700 dark:text-slate-200">
                  <Settings2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <textarea value={code} onChange={(e) => setCode(e.target.value)} className="min-h-[420px] w-full resize-none bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100 outline-none" spellCheck={false} />

            <div className="border-t border-slate-200 p-4 dark:border-slate-700">
              <div className="mb-3 flex gap-2 text-small">
                {['Output','Test Cases','Terminal','Submission'].map((item) => (
                  <button key={item} onClick={() => setTab(item)} className={`rounded-full border px-3 py-1.5 ${tab === item ? 'border-primary/30 bg-primary/10 text-primary' : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'}`}>
                    {item}
                  </button>
                ))}
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-2 flex items-center gap-2 text-primary">
                  {tab === 'Output' ? <TerminalSquare className="h-4 w-4" /> : <TestTube2 className="h-4 w-4" />}
                  <span className="font-medium">{tab}</span>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">{output}</pre>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="card p-4">
              <h2 className="text-card-title font-semibold">Problem</h2>
              <p className="mt-3 text-small text-slate-600 dark:text-slate-300">Two Sum</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Easy</span>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">Arrays</span>
              </div>
              <p className="mt-4 text-small text-slate-500 dark:text-slate-400">Given an array of integers and a target value, find the pair that sums to the target.</p>
            </div>

            <div className="card p-4">
              <h2 className="text-card-title font-semibold">Test cases</h2>
              <div className="mt-3 space-y-2 text-small text-slate-600 dark:text-slate-300">
                <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <p className="font-medium text-slate-800 dark:text-slate-100">Case 1</p>
                  <p className="mt-1">Input: [2,7,11,15], target = 9</p>
                  <p>Expected: [0,1]</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <p className="font-medium text-slate-800 dark:text-slate-100">Case 2</p>
                  <p className="mt-1">Input: [3,2,4], target = 6</p>
                  <p>Expected: [1,2]</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
