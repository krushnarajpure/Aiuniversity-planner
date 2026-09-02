/**
 * AI Interview HR Lab
 * Practice HR and HR-focused interview questions
 */

"use client";

import { AppShell } from "@/components/layout/app-shell";
import { InterviewCard } from "@/components/ai-interview/interview-card";
import { Users, Briefcase, Lightbulb } from "lucide-react";

export default function HRLabPage() {
  const hrTopics = [
    {
      id: 1,
      title: "Tell Me About Yourself",
      icon: <Users className="h-6 w-6" />,
      questions: 8,
      difficulty: "easy" as const,
      duration: 10,
    },
    {
      id: 2,
      title: "Career Goals & Motivation",
      icon: <Lightbulb className="h-6 w-6" />,
      questions: 12,
      difficulty: "medium" as const,
      duration: 15,
    },
    {
      id: 3,
      title: "Strengths & Weaknesses",
      icon: <Briefcase className="h-6 w-6" />,
      questions: 10,
      difficulty: "medium" as const,
      duration: 12,
    },
    {
      id: 4,
      title: "Why This Company?",
      icon: <Users className="h-6 w-6" />,
      questions: 6,
      difficulty: "medium" as const,
      duration: 10,
    },
    {
      id: 5,
      title: "Salary & Benefits",
      icon: <Briefcase className="h-6 w-6" />,
      questions: 5,
      difficulty: "hard" as const,
      duration: 8,
    },
    {
      id: 6,
      title: "Relocation & Availability",
      icon: <Lightbulb className="h-6 w-6" />,
      questions: 4,
      difficulty: "easy" as const,
      duration: 5,
    },
  ];

  return (
    <AppShell userName="User">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div>
            <p className="text-sm font-medium text-primary">PRACTICE LAB</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
              HR Interview Studio
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Master HR questions and ace your interviews
            </p>
          </div>

          {/* Topics Grid */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hrTopics.map((topic) => (
              <InterviewCard
                key={topic.id}
                title={topic.title}
                icon={topic.icon}
                difficulty={topic.difficulty}
                duration={topic.duration}
                tags={[`${topic.questions} questions`]}
                layout="detailed"
                actionText="Practice"
              />
            ))}
          </div>

          {/* Tips Section */}
          <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-900/20">
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              Tips for HR Interviews
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>• Keep answers concise but informative (2-3 minutes max)</li>
              <li>• Use the STAR method for behavioral questions</li>
              <li>• Research the company beforehand</li>
              <li>• Prepare thoughtful questions about the role and company</li>
              <li>• Be honest but strategic about weaknesses</li>
              <li>• Demonstrate enthusiasm and cultural fit</li>
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
