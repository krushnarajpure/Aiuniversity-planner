"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";

type Difficulty = "EASY" | "MEDIUM" | "HARD" | "EXPERT";

const categories = [
    { id: "quantitative", name: "Quantitative Aptitude" },
    { id: "reasoning", name: "Logical Reasoning" },
    { id: "verbal", name: "Verbal Ability" },
    { id: "data-interpretation", name: "Data Interpretation" },
    { id: "mixed-placement", name: "Mixed Placement Test" },
];

const difficulties: Difficulty[] = ["EASY", "MEDIUM", "HARD", "EXPERT"];
const questionCounts = [10, 15, 20, 30, 40, 50];

export function AptitudeStartTest({ userEmail }: { userEmail: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const categoryFromUrl = searchParams?.get("category") || "quantitative";

    const [category, setCategory] = useState(categoryFromUrl);
    const [difficulty, setDifficulty] = useState<Difficulty>("MEDIUM");
    const [questionCount, setQuestionCount] = useState(20);
    const [enableRandom, setEnableRandom] = useState(true);
    const [enableAdaptive, setEnableAdaptive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleStartTest = async () => {
        setLoading(true);
        setError(null);

        try {
            // Create a test session
            const response = await fetch("/api/aptitude/session/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category,
                    difficulty,
                    questionCount,
                    randomize: enableRandom,
                    adaptive: enableAdaptive,
                }),
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                const message = payload?.message || payload?.error || "Failed to start test";
                throw new Error(message);
            }

            const { sessionId } = await response.json();
            router.push(`/placement/aptitude/test/${sessionId}`);
        } catch (err) {
            console.error("Error starting test:", err);
            setError(
                err instanceof Error ? err.message : "Failed to start test. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const categoryName =
        categories.find((c) => c.id === category)?.name || "Test";

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-subheading font-semibold">Configure Your Test</h1>
                <p className="text-small text-slate-500 dark:text-slate-400 mt-2">
                    Customize your aptitude test settings
                </p>
            </div>

            <div className="card space-y-6">
                {/* Category Selection */}
                <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
                        Test Category
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setCategory(cat.id)}
                                className={`p-3 rounded-lg border transition text-sm font-medium ${category === cat.id
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                                    }`}
                            >
                                {cat.name.split(" ")[0]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Difficulty Selection */}
                <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
                        Difficulty Level
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {difficulties.map((diff) => (
                            <button
                                key={diff}
                                onClick={() => setDifficulty(diff)}
                                className={`p-3 rounded-lg border transition text-sm font-medium ${difficulty === diff
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                                    }`}
                            >
                                {diff}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Number of Questions */}
                <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
                        Number of Questions: <span className="text-primary">{questionCount}</span>
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {questionCounts.map((count) => (
                            <button
                                key={count}
                                onClick={() => setQuestionCount(count)}
                                className={`p-2 rounded-lg border transition text-sm font-medium ${questionCount === count
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                                    }`}
                            >
                                {count}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Randomize & Adaptive Modes */}
                <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={enableRandom}
                            onChange={(e) => setEnableRandom(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300"
                        />
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            Randomize questions
                        </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={enableAdaptive}
                            onChange={(e) => setEnableAdaptive(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300"
                        />
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            Adaptive difficulty (adjust based on performance)
                        </span>
                    </label>
                </div>

                {/* Test Summary */}
                <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-4">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                        Test Summary
                    </h3>
                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        <div className="flex justify-between">
                            <span>Category:</span>
                            <span className="font-medium">{categoryName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Difficulty:</span>
                            <span className="font-medium">{difficulty}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Questions:</span>
                            <span className="font-medium">{questionCount}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-300 dark:border-slate-600">
                            <span>Estimated Time:</span>
                            <span className="font-medium">
                                {Math.round((questionCount / 20) * 30)} minutes
                            </span>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-200">
                        {error}
                    </div>
                )}

                {/* Start Button */}
                <button
                    onClick={handleStartTest}
                    disabled={loading}
                    className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Starting Test...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-4 h-4" />
                            Start Test
                        </>
                    )}
                </button>

                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    ⏱️ Timer will start when you begin. Full screen recommended.
                </p>
            </div>
        </div>
    );
}
