/**
 * AI Interview Behavioral Lab
 * Practice STAR-based behavioral interview questions
 */

import { AppShell } from "@/components/layout/app-shell";
import { Trophy, Target, Heart, Zap } from "lucide-react";

export default async function BehavioralLabPage() {
  const categories = [
    {
      id: 1,
      title: "Teamwork & Collaboration",
      icon: <Trophy className="h-6 w-6" />,
      questions: 15,
      examples: [
        "Tell me about a time you worked with a difficult team member",
        "Describe a project where you had to collaborate cross-functionally",
      ],
    },
    {
      id: 2,
      title: "Leadership & Initiative",
      icon: <Target className="h-6 w-6" />,
      questions: 12,
      examples: [
        "Tell me about a time you led a team or project",
        "Describe when you took ownership of a problem",
      ],
    },
    {
      id: 3,
      title: "Conflict & Challenges",
      icon: <Heart className="h-6 w-6" />,
      questions: 10,
      examples: [
        "Tell me about a time you disagreed with your manager",
        "Describe your biggest professional failure",
      ],
    },
    {
      id: 4,
      title: "Adaptability & Learning",
      icon: <Zap className="h-6 w-6" />,
      questions: 9,
      examples: [
        "Tell me about a time you learned something new quickly",
        "Describe how you handle change and uncertainty",
      ],
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
              Behavioral Interview Lab
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Master the STAR framework and behavioral questions
            </p>
          </div>

          {/* STAR Framework Explainer */}
          <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              STAR Framework
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-4">
              {[
                {
                  letter: "S",
                  word: "Situation",
                  desc: "Set the context and background",
                },
                {
                  letter: "T",
                  word: "Task",
                  desc: "Explain the challenge or objective",
                },
                {
                  letter: "A",
                  word: "Action",
                  desc: "Describe what you specifically did",
                },
                {
                  letter: "R",
                  word: "Result",
                  desc: "Share the outcome and impact",
                },
              ].map((item) => (
                <div
                  key={item.letter}
                  className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-4"
                >
                  <div className="text-2xl font-bold text-primary">{item.letter}</div>
                  <h3 className="mt-2 font-semibold text-slate-900 dark:text-white">
                    {item.word}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="mt-8 space-y-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="text-primary">{category.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {category.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {category.questions} questions available
                      </p>
                    </div>
                  </div>
                  <button className="rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary/90">
                    Practice
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  {category.examples.map((example, idx) => (
                    <div
                      key={idx}
                      className="rounded bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      • {example}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Best Practices */}
          <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-900/20">
            <h2 className="text-lg font-semibold text-green-900 dark:text-green-100">
              Best Practices
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-green-800 dark:text-green-200">
              <li>✓ Always use the STAR framework for behavioral questions</li>
              <li>✓ Focus on YOUR actions, not team actions</li>
              <li>✓ Include quantifiable results when possible</li>
              <li>✓ Keep stories to 2-3 minutes</li>
              <li>✓ Prepare 5-7 strong stories covering different competencies</li>
              <li>✓ Practice out loud before the interview</li>
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
