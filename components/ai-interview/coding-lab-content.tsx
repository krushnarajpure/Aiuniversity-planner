/**
 * Coding Lab Content - Client Component
 */

"use client";

import { useState } from "react";
import { Code2, Play, RotateCcw, Check, Copy } from "lucide-react";

const codingProblems = [
  {
    id: 1,
    title: "Reverse a String",
    difficulty: "easy",
    description: "Given a string, return it reversed.",
    examples: [
      { input: '"hello"', output: '"olleh"' },
      { input: '"world"', output: '"dlrow"' },
    ],
  },
  {
    id: 2,
    title: "Two Sum",
    difficulty: "medium",
    description: "Find two numbers that add up to a target",
    examples: [
      { input: "[2, 7, 11, 15], 9", output: "[0, 1]" },
      { input: "[3, 3], 6", output: "[0, 1]" },
    ],
  },
  {
    id: 3,
    title: "Longest Substring",
    difficulty: "medium",
    description: "Find longest substring without repeating characters",
    examples: [
      { input: '"abcabcbb"', output: "3" },
      { input: '"au"', output: "2" },
    ],
  },
  {
    id: 4,
    title: "Merge K Sorted Lists",
    difficulty: "hard",
    description: "Merge k sorted linked lists into one sorted list",
    examples: [
      { input: "[[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]" },
    ],
  },
];

export function CodingLabContent() {
  const [selectedProblem, setSelectedProblem] = useState(codingProblems[0]);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("// Start coding here\n");
  const [output, setOutput] = useState("");

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      {/* Problem List */}
      <div className="space-y-2">
        {codingProblems.map((problem) => (
          <button
            key={problem.id}
            onClick={() => setSelectedProblem(problem)}
            className={`w-full rounded-lg border-2 p-3 text-left transition ${
              selectedProblem.id === problem.id
                ? "border-primary bg-primary/10"
                : "border-slate-200 hover:border-primary dark:border-slate-700"
            }`}
          >
            <div className="font-medium text-slate-900 dark:text-white">
              {problem.title}
            </div>
            <div className={`text-xs font-semibold ${
              problem.difficulty === "easy" ? "text-green-600" :
              problem.difficulty === "medium" ? "text-yellow-600" :
              "text-red-600"
            }`}>
              {problem.difficulty.toUpperCase()}
            </div>
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="space-y-4">
        {/* Problem Details */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {selectedProblem.title}
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {selectedProblem.description}
          </p>
          <div className="mt-3 space-y-2">
            {selectedProblem.examples.map((ex, idx) => (
              <div key={idx} className="text-xs text-slate-600 dark:text-slate-400">
                <span className="font-medium">Input:</span> {ex.input}
                <br />
                <span className="font-medium">Output:</span> {ex.output}
              </div>
            ))}
          </div>
        </div>

        {/* Language & Editor */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
            >
              {["javascript", "python", "java", "cpp"].map((lang) => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            rows={10}
          />
          <div className="mt-3 flex gap-2">
            <button className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700">
              <Play className="h-4 w-4" />
              Run
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 font-medium dark:border-slate-700">
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 font-medium dark:border-slate-700">
              <Check className="h-4 w-4" />
              Submit
            </button>
          </div>
        </div>

        {/* Output */}
        {output && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
            <h4 className="font-semibold text-slate-900 dark:text-white">Output</h4>
            <pre className="mt-2 font-mono text-sm text-slate-600 dark:text-slate-300">
              {output}
            </pre>
          </div>
        )}

        {/* Test Cases */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h4 className="font-semibold text-slate-900 dark:text-white">Test Cases</h4>
          <div className="mt-3 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  Test Case {i}
                </span>
                <Check className="h-4 w-4 text-green-600" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
