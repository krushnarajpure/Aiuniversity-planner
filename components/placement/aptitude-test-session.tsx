"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    ChevronRight,
    Flag,
    Trash2,
    Clock,
    Loader2,
    AlertCircle,
    Send,
} from "lucide-react";

interface Question {
    id: string;
    questionText: string;
    type: string;
    options: Array<{
        id: string;
        optionLabel: string;
        optionText: string;
    }>;
}

interface SessionData {
    id: string;
    totalQuestions: number;
    currentQuestionNo: number;
    expiresAt: string;
    startedAt: string;
    durationSeconds: number;
    status: string;
}

export function AptitudeTestSession({ sessionId }: { sessionId: string }) {
    const router = useRouter();
    const [sessionData, setSessionData] = useState<SessionData | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [markedQuestions, setMarkedQuestions] = useState<Set<string>>(new Set());
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Load session data and current question
    useEffect(() => {
        const fetchSessionData = async () => {
            try {
                const response = await fetch(`/api/aptitude/session/${sessionId}`);
                if (!response.ok) {
                    const payload = await response.json().catch(() => ({}));
                    throw new Error(payload?.error || "Failed to load test session");
                }
                const data = await response.json();
                setSessionData(data);

                const expiresAt = new Date(data.expiresAt);
                const now = new Date();
                setTimeRemaining(
                    Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))
                );

                setLoading(false);
            } catch (err) {
                console.error("Error fetching session:", err);
                setError(err instanceof Error ? err.message : "Failed to load test session");
                setLoading(false);
            }
        };

        fetchSessionData();
    }, [sessionId]);

    // Load current question
    useEffect(() => {
        if (!sessionData) return;

        const fetchQuestion = async () => {
            try {
                setError(null);
                const response = await fetch(
                    `/api/aptitude/session/${sessionId}/question/${sessionData.currentQuestionNo}`
                );
                if (!response.ok) {
                    const payload = await response.json().catch(() => ({}));
                    throw new Error(payload?.error || "Failed to load question");
                }

                const data = await response.json();
                setCurrentQuestion(data);
                setSelectedAnswer(null);
            } catch (err) {
                console.error("Error fetching question:", err);
                setError(err instanceof Error ? err.message : "Failed to load question");
            }
        };

        fetchQuestion();
    }, [sessionId, sessionData?.currentQuestionNo]);

    // Timer countdown
    useEffect(() => {
        if (!sessionData || timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    handleSubmitTest();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [sessionData, timeRemaining]);

    const handleNextQuestion = async () => {
        if (!sessionData) return;
        if (sessionData.currentQuestionNo >= sessionData.totalQuestions) return;

        try {
            // Save current answer
            if (selectedAnswer) {
                await fetch(`/api/aptitude/session/${sessionId}/answer`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        questionNumber: sessionData.currentQuestionNo,
                        answer: selectedAnswer,
                    }),
                });
            }

            setSessionData((prev) =>
                prev ? { ...prev, currentQuestionNo: prev.currentQuestionNo + 1 } : null
            );
        } catch (err) {
            console.error("Error saving answer:", err);
            setError("Failed to save answer");
        }
    };

    const handlePreviousQuestion = async () => {
        if (!sessionData) return;
        if (sessionData.currentQuestionNo <= 1) return;

        setSessionData((prev) =>
            prev ? { ...prev, currentQuestionNo: prev.currentQuestionNo - 1 } : null
        );
    };

    const handleMarkForReview = () => {
        const newMarked = new Set(markedQuestions);
        if (newMarked.has(`q${sessionData?.currentQuestionNo}`)) {
            newMarked.delete(`q${sessionData?.currentQuestionNo}`);
        } else {
            newMarked.add(`q${sessionData?.currentQuestionNo}`);
        }
        setMarkedQuestions(newMarked);
    };

    const handleClearAnswer = () => {
        setSelectedAnswer(null);
    };

    const handleSubmitTest = async () => {
        if (submitting) return;
        setSubmitting(true);

        try {
            // Save final answer
            if (selectedAnswer && sessionData) {
                await fetch(`/api/aptitude/session/${sessionId}/answer`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        questionNumber: sessionData.currentQuestionNo,
                        answer: selectedAnswer,
                    }),
                });
            }

            // Submit test
            const response = await fetch(`/api/aptitude/session/${sessionId}/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error("Failed to submit test");
            }

            router.push(`/placement/aptitude/result/${sessionId}`);
        } catch (err) {
            console.error("Error submitting test:", err);
            setError("Failed to submit test");
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!sessionData || !currentQuestion) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                <AlertCircle className="w-5 h-5 inline mr-2" />
                {error || "Test session unavailable"}
            </div>
        );
    }

    const isLastQuestion = sessionData.currentQuestionNo === sessionData.totalQuestions;
    const totalDurationSeconds = sessionData.durationSeconds || 1;
    const timePercentage = (timeRemaining / totalDurationSeconds) * 100;
    const formattedTime = `${Math.floor(timeRemaining / 60)}:${String(timeRemaining % 60).padStart(2, "0")}`;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header with Timer */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-small text-primary font-medium">
                            Question {sessionData.currentQuestionNo} of {sessionData.totalQuestions}
                        </p>
                        <h1 className="text-heading font-semibold">Aptitude Test</h1>
                    </div>
                    <div className="text-center">
                        <div className={`text-2xl font-bold ${timeRemaining < 60 ? "text-red-600" : "text-primary"}`}>
                            {formattedTime}
                        </div>
                        <p className="text-xs text-slate-500">Time Remaining</p>
                        <div className="mt-2 h-2 w-32 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all ${timeRemaining < 60 ? "bg-red-500" : "bg-primary"}`}
                                style={{ width: `${Math.min(100, timePercentage)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">Progress</span>
                        <span className="font-medium">
                            {Math.round((sessionData.currentQuestionNo / sessionData.totalQuestions) * 100)}%
                        </span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all"
                            style={{
                                width: `${(sessionData.currentQuestionNo / sessionData.totalQuestions) * 100}%`,
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Question Section */}
            <div className="card">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                        {currentQuestion.questionText}
                    </h2>

                    {/* Options */}
                    <div className="space-y-3">
                        {currentQuestion.options.map((option, idx) => (
                            <button
                                key={option.id}
                                onClick={() => setSelectedAnswer(option.id)}
                                className={`w-full text-left p-4 rounded-lg border-2 transition ${selectedAnswer === option.id
                                        ? "border-primary bg-primary/10"
                                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedAnswer === option.id
                                                ? "border-primary bg-primary text-white"
                                                : "border-slate-300"
                                            }`}
                                    >
                                        {selectedAnswer === option.id && "✓"}
                                    </div>
                                    <div>
                                        <span className="font-medium">{option.optionLabel}.</span>{" "}
                                        {option.optionText}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap pt-6 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={handleClearAnswer}
                        disabled={!selectedAnswer}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear Answer
                    </button>
                    <button
                        onClick={handleMarkForReview}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${markedQuestions.has(`q${sessionData.currentQuestionNo}`)
                                ? "border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300"
                                : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                            }`}
                    >
                        <Flag className="w-4 h-4" />
                        {markedQuestions.has(`q${sessionData.currentQuestionNo}`) ? "Marked" : "Mark for Review"}
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-4">
                <button
                    onClick={handlePreviousQuestion}
                    disabled={sessionData.currentQuestionNo === 1}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                </button>

                {isLastQuestion ? (
                    <button
                        onClick={handleSubmitTest}
                        disabled={submitting}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Submit Test
                            </>
                        )}
                    </button>
                ) : (
                    <button
                        onClick={handleNextQuestion}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 font-medium transition"
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-small">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    {error}
                </div>
            )}
        </div>
    );
}
