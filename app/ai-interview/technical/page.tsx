/**
 * AI Interview Technical Lab
 * Practice technical interview questions
 */

"use client";

import { AppShell } from "@/components/layout/app-shell";
import { InterviewCard } from "@/components/ai-interview/interview-card";
import { Code, Database, Cloud, Zap } from "lucide-react";

export default function TechnicalLabPage() {
  const topics = [
    { id: 1, name: "JavaScript", icon: <Code className="h-6 w-6" />, questions: 45, completed: 12 },
    { id: 2, name: "React", icon: <Code className="h-6 w-6" />, questions: 38, completed: 8 },
    { id: 3, name: "Node.js", icon: <Zap className="h-6 w-6" />, questions: 32, completed: 5 },
    { id: 4, name: "Databases", icon: <Database className="h-6 w-6" />, questions: 28, completed: 2 },
    { id: 5, name: "System Design", icon: <Cloud className="h-6 w-6" />, questions: 25, completed: 1 },
    { id: 6, name: "APIs & REST", icon: <Zap className="h-6 w-6" />, questions: 22, completed: 4 },
  ];

  return (
    <AppShell userName="User">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div>
            <p className="text-sm font-medium text-primary">PRACTICE LAB</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
              Technical Interview Lab
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Master technical concepts through targeted practice
            </p>
          </div>

          {/* Topics Grid */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="rounded-lg border border-slate-200 bg-white p-6 transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between">
                  <div className="text-primary">{topic.icon}</div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {topic.completed}/{topic.questions}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                  {topic.name}
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {topic.questions} questions available
                </p>

                {/* Progress Bar */}
                <div className="mt-4 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Progress</span>
                    <span className="font-semibold text-primary">
                      {Math.round((topic.completed / topic.questions) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${(topic.completed / topic.questions) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <button className="mt-4 w-full rounded-lg bg-primary py-2 font-medium text-white transition-all hover:bg-primary/90">
                  Continue Practice
                </button>
              </div>
            ))}
          </div>

          {/* Recommended Questions */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Recommended for You
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Based on your weak areas
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Database Optimization",
                  description: "Your weakest area - start here",
                  difficulty: "medium" as const,
                  duration: 30,
                },
                {
                  title: "API Design Patterns",
                  description: "Essential for backend roles",
                  difficulty: "medium" as const,
                  duration: 40,
                },
              ].map((q, idx) => (
                <InterviewCard
                  key={idx}
                  title={q.title}
                  description={q.description}
                  difficulty={q.difficulty}
                  duration={q.duration}
                  layout="compact"
                  actionText="Start"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
