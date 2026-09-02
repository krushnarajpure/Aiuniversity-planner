"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    BookOpen,
    Zap,
    Clock,
    Trophy,
    Flame,
    ArrowRight,
    Play,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";

interface AptitudeStats {
    totalTests: number;
    bestScore: number | null;
    averageScore: number | null;
    averageAccuracy: number | null;
    currentStreak: number;
    longestStreak: number;
}

interface AptitudeCategory {
    id: string;
    name: string;
    description: string;
    questionCount: number;
    estimatedTime: number;
    difficulty: string;
    icon: string;
}

const categories: AptitudeCategory[] = [
    {
        id: "quantitative",
        name: "Quantitative Aptitude",
        description: "Numbers, percentages, algebra, geometry, and more",
        questionCount: 20,
        estimatedTime: 30,
        difficulty: "Mixed",
        icon: "📊",
    },
    {
        id: "reasoning",
        name: "Logical Reasoning",
        description: "Puzzles, series, syllogisms, and pattern recognition",
        questionCount: 20,
        estimatedTime: 25,
        difficulty: "Mixed",
        icon: "🧩",
    },
    {
        id: "verbal",
        name: "Verbal Ability",
        description: "Reading comprehension, grammar, and vocabulary",
        questionCount: 20,
        estimatedTime: 20,
        difficulty: "Mixed",
        icon: "📚",
    },
    {
        id: "data-interpretation",
        name: "Data Interpretation",
        description: "Charts, graphs, tables, and data analysis",
        questionCount: 20,
        estimatedTime: 25,
        difficulty: "Mixed",
        icon: "📈",
    },
    {
        id: "mixed-placement",
        name: "Mixed Placement Test",
        description: "Complete placement test with all topics combined",
        questionCount: 50,
        estimatedTime: 90,
        difficulty: "Expert",
        icon: "🎯",
    },
];

export function AptitudeDashboard({ userEmail }: { userEmail: string }) {
    const [stats, setStats] = useState<AptitudeStats>({
        totalTests: 0,
        bestScore: null,
        averageScore: null,
        averageAccuracy: null,
        currentStreak: 0,
        longestStreak: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch user's aptitude stats from the API
                const response = await fetch("/api/aptitude/stats");
                if (!response.ok) {
                    throw new Error("Failed to load aptitude statistics");
                }
                const data = await response.json();
                setStats(data);
            } catch (err) {
                console.error("Error fetching aptitude stats:", err);
                setError(err instanceof Error ? err.message : "Failed to load statistics");
                // Set default empty stats on error
                setStats({
                    totalTests: 0,
                    bestScore: null,
                    averageScore: null,
                    averageAccuracy: null,
                    currentStreak: 0,
                    longestStreak: 0,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Trophy}
                    label="Tests Completed"
                    value={stats.totalTests}
                    accent="primary"
                />
                <StatCard
                    icon={Zap}
                    label="Best Score"
                    value={
                        stats.bestScore !== null
                            ? `${Math.round(stats.bestScore)}%`
                            : "Not started"
                    }
                    accent="secondary"
                />
                <StatCard
                    icon={BookOpen}
                    label="Average Accuracy"
                    value={
                        stats.averageAccuracy !== null
                            ? `${Math.round(stats.averageAccuracy)}%`
                            : "N/A"
                    }
                    accent="success"
                />
                <StatCard
                    icon={Flame}
                    label="Current Streak"
                    value={stats.currentStreak}
                    accent="warning"
                />
            </div>

            {/* Category Cards */}
            <section className="card">
                <div className="mb-6">
                    <h2 className="text-card-title font-semibold">Available Tests</h2>
                    <p className="text-small text-slate-500 dark:text-slate-400 mt-1">
                        Choose a category or take a complete placement test
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/placement/aptitude/start?category=${category.id}`}
                            className="group rounded-2xl border border-slate-200 dark:border-slate-700 p-4 transition hover:border-primary hover:shadow-lg dark:hover:border-primary/50"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="text-2xl">{category.icon}</div>
                                <Play className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition" />
                            </div>

                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                                {category.name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                                {category.description}
                            </p>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                                <div className="text-xs text-slate-600 dark:text-slate-300">
                                    <span className="font-medium">{category.questionCount}</span> Q
                                    <span className="mx-2">·</span>
                                    <span className="font-medium">{category.estimatedTime}</span> min
                                </div>
                                <span className="text-xs font-medium text-primary">
                                    {category.difficulty}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Empty State Info */}
            {stats.totalTests === 0 && !loading && (
                <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-small text-amber-800 dark:text-amber-200">
                        <p className="font-medium mb-1">No tests attempted yet</p>
                        <p>
                            Start with Quantitative Aptitude or choose any category to begin
                            your placement preparation!
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
