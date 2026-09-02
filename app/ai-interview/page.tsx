/**
 * AI Interview Home Page
 * Main landing page for the AI Interview module
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { Play, Zap, BookOpen, Target, Award } from "lucide-react";
import Link from "next/link";

export default async function AIInterviewPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const quickActions = [
    {
      icon: <Play className="h-6 w-6" />,
      title: "Start Full Interview",
      description: "Complete interview simulation",
      href: "/ai-interview/start",
      color: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Quick Practice",
      description: "Practice 10 random questions",
      href: "/ai-interview/practice",
      color: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Resume Interview",
      description: "Interview from your resume",
      href: "/ai-interview/resume",
      color: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Job-Based Interview",
      description: "Practice for specific role",
      href: "/ai-interview/job-description",
      color: "bg-green-50 dark:bg-green-900/20",
    },
  ];

  return (
    <AppShell userName={session.user.name}>
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Hero Section */}
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 sm:p-12">
            <p className="text-sm font-medium text-primary">
              🎯 AI CAREER PREPARATION
            </p>
            <h1 className="mt-2 text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white">
              Your Personal AI Interview Coach
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
              Practice. Improve. Simulate. Get Hired.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
            Quick Start
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`group rounded-lg border border-slate-200 p-6 transition-all hover:shadow-lg dark:border-slate-700 ${action.color}`}
              >
                <div className="text-primary mb-3 group-hover:scale-110 transition-transform">
                  {action.icon}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {action.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {action.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Dashboard Overview */}
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
            Your Progress
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Interview Readiness", value: "72%", trend: "↑ 5%" },
              { label: "Current Streak", value: "7 days", trend: "🔥" },
              { label: "Interviews Complete", value: "12", trend: "📊" },
              { label: "Questions Answered", value: "127", trend: "✨" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
              >
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {stat.label}
                </p>
                <div className="mt-2 flex items-end justify-between">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-lg">{stat.trend}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Navigation Sections */}
        <div className="mx-auto max-w-6xl space-y-8">
          {[
            {
              title: "Practice Labs",
              items: [
                { label: "Technical Lab", href: "/ai-interview/technical" },
                { label: "Coding Lab", href: "/ai-interview/coding" },
                { label: "Behavioral Lab", href: "/ai-interview/behavioral" },
                { label: "HR Lab", href: "/ai-interview/hr" },
              ],
            },
            {
              title: "Intelligence",
              items: [
                { label: "Resume Analysis", href: "/ai-interview/resume" },
                { label: "Job Analysis", href: "/ai-interview/job-description" },
                { label: "Communication Coach", href: "/ai-interview/communication" },
                { label: "Career Path", href: "/ai-interview/career" },
              ],
            },
            {
              title: "Learning & Analytics",
              items: [
                { label: "Question Bank", href: "/ai-interview/question-bank" },
                { label: "Analytics", href: "/ai-interview/analytics" },
                { label: "Achievements", href: "/ai-interview/achievements" },
                { label: "Learning Center", href: "/ai-interview/learning" },
              ],
            },
          ].map((section) => (
            <div key={section.title}>
              <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                {section.title}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-lg border border-slate-200 bg-white p-4 text-center transition-all hover:border-primary hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="font-medium text-slate-900 dark:text-white">
                      {item.label}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mx-auto max-w-6xl">
          <div className="rounded-lg bg-primary/10 p-8 text-center dark:bg-primary/20">
            <Award className="mx-auto h-12 w-12 text-primary" />
            <h3 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
              Ready to Interview?
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Start your first full interview and get personalized feedback
            </p>
            <Link
              href="/ai-interview/start"
              className="mt-6 inline-flex items-center rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90 transition-all"
            >
              Start Interview Now →
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
