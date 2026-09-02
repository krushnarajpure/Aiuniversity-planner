/**
 * AI Interview Practice Center
 * Quick practice sessions and question sets
 */

"use client";

import { AppShell } from "@/components/layout/app-shell";
import { InterviewCard } from "@/components/ai-interview/interview-card";
import { Zap, Brain, Code, Users } from "lucide-react";

export default function PracticeCenterPage() {
  const practiceSessions = [
    {
      id: 1,
      title: "Quick 10 Questions",
      description: "Random questions from all categories",
      icon: <Zap className="h-6 w-6" />,
      difficulty: "medium" as const,
      duration: 15,
      tags: ["Quick", "All Topics"],
    },
    {
      id: 2,
      title: "React Deep Dive",
      description: "Master React fundamentals and advanced patterns",
      icon: <Code className="h-6 w-6" />,
      difficulty: "hard" as const,
      duration: 45,
      tags: ["Technical", "React"],
    },
    {
      id: 3,
      title: "Behavioral Practice",
      description: "STAR framework and behavioral questions",
      icon: <Users className="h-6 w-6" />,
      difficulty: "medium" as const,
      duration: 30,
      tags: ["Behavioral", "STAR"],
    },
    {
      id: 4,
      title: "System Design Basics",
      description: "Learn system design fundamentals",
      icon: <Brain className="h-6 w-6" />,
      difficulty: "hard" as const,
      duration: 60,
      tags: ["System Design", "Architecture"],
    },
    {
      id: 5,
      title: "Weak Skills Focus",
      description: "Practice on your identified weak areas",
      icon: <Zap className="h-6 w-6" />,
      difficulty: "easy" as const,
      duration: 20,
      tags: ["Personalized"],
    },
    {
      id: 6,
      title: "Company Questions",
      description: "Practice with FAANG-style questions",
      icon: <Code className="h-6 w-6" />,
      difficulty: "expert" as const,
      duration: 90,
      tags: ["Advanced", "FAANG"],
    },
  ];

  return (
    <AppShell userName="User">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div>
            <p className="text-sm font-medium text-primary">PRACTICE</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
              Practice Center
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Choose a practice session to improve specific skills
            </p>
          </div>

          {/* Filter Options */}
          <div className="mt-6 flex flex-wrap gap-2">
            {["All", "Quick", "Technical", "Behavioral", "System Design"].map((filter) => (
              <button
                key={filter}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-300"
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Practice Sessions Grid */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {practiceSessions.map((session) => (
              <InterviewCard
                key={session.id}
                title={session.title}
                description={session.description}
                icon={session.icon}
                difficulty={session.difficulty}
                duration={session.duration}
                tags={session.tags}
                layout="detailed"
                actionText="Start Practice"
              />
            ))}
          </div>

          {/* Recommended Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Recommended for You
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Based on your weak areas and learning goals
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Database Design Bootcamp",
                  description: "Your weakest area - focus here for improvement",
                  difficulty: "easy" as const,
                  duration: 50,
                  score: 45,
                },
                {
                  title: "API Security Mastery",
                  description: "Build expertise in secure API design",
                  difficulty: "hard" as const,
                  duration: 60,
                  score: 52,
                },
                {
                  title: "Microservices Architecture",
                  description: "Learn distributed system patterns",
                  difficulty: "advanced" as const,
                  duration: 90,
                  score: null,
                },
              ].map((rec, idx) => (
                <InterviewCard
                  key={idx}
                  title={rec.title}
                  description={rec.description}
                  difficulty={rec.difficulty}
                  duration={rec.duration}
                  score={rec.score || undefined}
                  layout="detailed"
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
