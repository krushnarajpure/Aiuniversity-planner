/**
 * AI Interview Job Description Intelligence
 * Analyze job descriptions for preparation
 */

"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Briefcase, Target, TrendingUp } from "lucide-react";

export default function JobDescriptionPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [analyzed, setAnalyzed] = useState(false);

  return (
    <AppShell userName="User">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div>
            <p className="text-sm font-medium text-primary">INTELLIGENCE</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
              Job Description Intelligence
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Paste a job description to get customized interview prep
            </p>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
            {/* Main Content */}
            <div className="space-y-4">
              {/* Input Section */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Paste Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here..."
                  className="mt-3 h-64 w-full rounded-lg border border-slate-200 bg-white p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <button
                  onClick={() => setAnalyzed(true)}
                  className="mt-4 rounded-lg bg-primary px-6 py-2 font-medium text-white hover:bg-primary/90"
                >
                  Analyze Job Description
                </button>
              </div>

              {analyzed && (
                <>
                  {/* Required Skills */}
                  <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                      <Target className="h-5 w-5 text-primary" />
                      Required Skills
                    </h3>
                    <div className="mt-4 grid gap-2">
                      {["React", "JavaScript", "Node.js", "SQL", "AWS", "Docker"].map((skill) => (
                        <div
                          key={skill}
                          className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800"
                        >
                          <span className="font-medium text-slate-900 dark:text-white">
                            {skill}
                          </span>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                            MUST HAVE
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preparation Plan */}
                  <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Preparation Plan
                    </h3>
                    <div className="mt-4 space-y-3">
                      {[
                        { day: "Days 1-3", focus: "Review React fundamentals and advanced patterns" },
                        { day: "Days 4-5", focus: "Practice system design with case studies" },
                        { day: "Days 6-7", focus: "Behavioral and HR interview prep" },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800"
                        >
                          <div className="font-medium text-slate-900 dark:text-white">
                            {item.day}
                          </div>
                          <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {item.focus}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interview Insights */}
                  <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-900/20">
                    <h3 className="font-semibold text-green-900 dark:text-green-100">
                      Interview Insights
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm text-green-800 dark:text-green-200">
                      <li>✓ Expect technical questions on React and Node.js</li>
                      <li>✓ System design round likely (5+ years experience)</li>
                      <li>✓ Behavioral questions focused on teamwork</li>
                      <li>✓ Estimated 3-4 interview rounds</li>
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                  <Briefcase className="h-5 w-5" />
                  Job Summary
                </h3>
                {analyzed ? (
                  <div className="mt-4 space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Title</p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        Senior React Developer
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Level</p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        Senior (5+ years)
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Match Score
                      </p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div className="h-full w-2/3 bg-green-500" />
                      </div>
                      <p className="mt-1 text-xs font-semibold text-green-600">
                        66% Match
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                    Paste a JD to see analysis
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
