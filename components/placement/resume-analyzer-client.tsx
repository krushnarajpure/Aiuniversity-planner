"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Download, Sparkles, Target, Upload, UserCircle2 } from "lucide-react";

type ResumeAnalysis = {
    summary: {
        overallScore: number;
        atsScore: number;
        readability: number;
        strength: string;
        keyGap: string;
        recommendedAction: string;
    };
    jobMatch: {
        score: number;
        matchedSkills: string[];
        missingSkills: string[];
        fitSummary: string;
    };
    skills: {
        technical: string[];
        soft: string[];
        missing: string[];
    };
    experience: {
        impactScore: number;
        highlights: string[];
        improvements: string[];
    };
    projects: Array<{ name: string; impact: string; status: "Strong" | "Average" | "Needs work" }>;
    contentStudio: {
        headline: string;
        summary: string;
        achievements: string[];
        keywords: string[];
    };
    interviewInsights: {
        strengths: string[];
        gaps: string[];
        questions: string[];
    };
    roadmap: string[];
    validation: {
        hasContact: boolean;
        hasSummary: boolean;
        hasExperience: boolean;
        hasProjects: boolean;
        warnings: string[];
    };
    report: {
        title: string;
        conclusion: string;
    };
};

type HistoryItem = {
    id: string;
    title: string;
    score: number;
    timestamp: string;
    source: string;
};

const historyKey = "resume-analyzer-history";

function ScoreRing({ value, label, accent = "primary" }: { value: number; label: string; accent?: "primary" | "success" | "warning" }) {
    const colorMap = {
        primary: "from-primary to-purple-500",
        success: "from-emerald-500 to-green-500",
        warning: "from-amber-500 to-orange-500",
    };

    return (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <div className={`relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${colorMap[accent]}`}>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-base font-semibold text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                    {Math.round(value)}
                </div>
            </div>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
        </div>
    );
}

export function ResumeAnalyzerClient({ userName, userEmail }: { userName: string; userEmail: string }) {
    const [resumeText, setResumeText] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ResumeAnalysis | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const stored = window.localStorage.getItem(historyKey);
        if (stored) {
            try {
                setHistory(JSON.parse(stored) as HistoryItem[]);
            } catch {
                // no-op
            }
        }
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            setResumeText((current) => current || text);
        } catch {
            setError("Unable to read the selected file. Please paste the content manually.");
        }
    };

    const handleAnalyze = async () => {
        if (!resumeText.trim()) {
            setError("Paste a resume or upload a file before analyzing.");
            return;
        }

        setAnalyzing(true);
        setError(null);

        try {
            const response = await fetch("/api/resume-analyzer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resumeText,
                    jobDescription: jobDescription.trim() || undefined,
                    source: "resume-upload",
                }),
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.error || "Resume analysis failed.");
            }

            setResult(data.analysis);

            const nextHistory: HistoryItem[] = [
                {
                    id: new Date().toISOString(),
                    title: data.analysis.report.title,
                    score: data.analysis.summary.overallScore,
                    timestamp: new Date().toLocaleString(),
                    source: jobDescription.trim() ? "Targeted application" : "General review",
                },
                ...history,
            ].slice(0, 5);

            setHistory(nextHistory);
            localStorage.setItem(historyKey, JSON.stringify(nextHistory));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unexpected error while analyzing the resume.");
        } finally {
            setAnalyzing(false);
        }
    };

    const exportReport = () => {
        if (!result) return;

        const content = [
            result.report.title,
            "",
            `Overall Score: ${result.summary.overallScore}`,
            `ATS Score: ${result.summary.atsScore}`,
            `Fit Score: ${result.jobMatch.score}`,
            "",
            "Highlights:",
            ...result.experience.highlights,
            "",
            "Improvement Roadmap:",
            ...result.roadmap,
        ].join("\n");

        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${result.report.title.toLowerCase().replace(/\s+/g, "-")}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-small font-medium text-primary">Placement intelligence</p>
                    <h1 className="text-subheading font-semibold">Resume Analyzer</h1>
                    <p className="text-small text-slate-500 dark:text-slate-400">
                        Review ATS quality, skills fit, and interview readiness for {userName}.
                    </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-small text-primary">
                    <UserCircle2 className="h-4 w-4" />
                    {userEmail || "Student profile"}
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <section className="card space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-card-title font-semibold">Resume intake</h2>
                            <p className="text-small text-slate-500 dark:text-slate-400">Upload a file or paste the resume text directly.</p>
                        </div>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-small font-medium text-white shadow-sm hover:opacity-90">
                            <Upload className="h-4 w-4" />
                            Upload file
                        </button>
                        <input ref={fileInputRef} type="file" accept=".txt,.pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} />
                    </div>

                    <textarea
                        value={resumeText}
                        onChange={(event) => setResumeText(event.target.value)}
                        placeholder="Paste your resume here..."
                        className="min-h-[260px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-small text-slate-700 outline-none ring-0 transition focus:border-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />

                    <div className="space-y-2">
                        <label className="text-small font-medium text-slate-700 dark:text-slate-200">Optional job description</label>
                        <textarea
                            value={jobDescription}
                            onChange={(event) => setJobDescription(event.target.value)}
                            placeholder="Paste the target role description to compare skills and alignment..."
                            className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-small text-slate-700 outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-small text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                            <AlertCircle className="mt-0.5 h-4 w-4" />
                            <span>{error}</span>
                        </div>
                    )}

                    <button type="button" onClick={handleAnalyze} disabled={analyzing} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-small font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70">
                        <Sparkles className="h-4 w-4" />
                        {analyzing ? "Analyzing resume..." : "Analyze Resume"}
                    </button>
                </section>

                <aside className="card space-y-4">
                    <div>
                        <h2 className="text-card-title font-semibold">Recent history</h2>
                        <p className="text-small text-slate-500 dark:text-slate-400">Latest resume reviews.</p>
                    </div>

                    {history.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-small text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                            No reviewed resumes yet. Run your first analysis to build a history.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((item) => (
                                <div key={item.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-medium">{item.title}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{item.source}</p>
                                        </div>
                                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{item.score}</span>
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.timestamp}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </aside>
            </div>

            {result && (
                <div className="space-y-6">
                    <div className="card space-y-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-small font-medium text-primary">AI report</p>
                                <h2 className="text-card-title font-semibold">{result.report.title}</h2>
                            </div>
                            <button type="button" onClick={exportReport} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-small font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                                <Download className="h-4 w-4" />
                                Download report
                            </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-4">
                            <ScoreRing value={result.summary.overallScore} label="Overall" accent="primary" />
                            <ScoreRing value={result.summary.atsScore} label="ATS" accent="success" />
                            <ScoreRing value={result.jobMatch.score} label="Job fit" accent="warning" />
                            <ScoreRing value={result.experience.impactScore} label="Impact" accent="primary" />
                        </div>

                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-small text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
                            <p className="font-semibold">Summary</p>
                            <p className="mt-1">{result.summary.strength}</p>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <section className="card space-y-4">
                            <h3 className="text-card-title font-semibold">ATS & role alignment</h3>
                            <div className="space-y-3">
                                <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                                    <p className="text-small text-slate-500 dark:text-slate-400">Fit summary</p>
                                    <p className="mt-1 text-small font-medium">{result.jobMatch.fitSummary}</p>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                                        <p className="text-small text-slate-500 dark:text-slate-400">Matched skills</p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {result.jobMatch.matchedSkills.length ? result.jobMatch.matchedSkills.map((skill) => (
                                                <span key={skill} className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">{skill}</span>
                                            )) : <span className="text-xs text-slate-500">No obvious matches</span>}
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                                        <p className="text-small text-slate-500 dark:text-slate-400">Missing skills</p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {result.jobMatch.missingSkills.length ? result.jobMatch.missingSkills.map((skill) => (
                                                <span key={skill} className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">{skill}</span>
                                            )) : <span className="text-xs text-slate-500">No major gaps detected</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                                    <p className="text-small text-slate-500 dark:text-slate-400">Recommended action</p>
                                    <p className="mt-2 text-small font-medium">{result.summary.recommendedAction}</p>
                                </div>
                            </div>
                        </section>

                        <section className="card space-y-4">
                            <h3 className="text-card-title font-semibold">Skills & profile health</h3>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                                    <p className="text-small font-medium">Technical</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {result.skills.technical.map((skill) => <span key={skill} className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">{skill}</span>)}
                                    </div>
                                </div>
                                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                                    <p className="text-small font-medium">Soft skills</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {result.skills.soft.map((skill) => <span key={skill} className="rounded-full bg-violet-100 px-2 py-1 text-xs text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">{skill}</span>)}
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                                <p className="text-small font-medium text-amber-800 dark:text-amber-200">Key gaps</p>
                                <ul className="mt-2 space-y-1 text-small text-amber-700 dark:text-amber-300">
                                    {result.skills.missing.length ? result.skills.missing.map((skill) => <li key={skill}>• {skill}</li>) : <li>• No large skill gaps detected.</li>}
                                </ul>
                            </div>
                        </section>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <section className="card space-y-4">
                            <h3 className="text-card-title font-semibold">Experience & impact</h3>
                            <div className="space-y-3">
                                <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                                    <p className="text-small text-slate-500 dark:text-slate-400">Impact highlights</p>
                                    <ul className="mt-2 list-disc space-y-1 pl-5 text-small">
                                        {result.experience.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
                                    </ul>
                                </div>
                                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                                    <p className="text-small text-slate-500 dark:text-slate-400">Recommended improvements</p>
                                    <ul className="mt-2 list-disc space-y-1 pl-5 text-small">
                                        {result.experience.improvements.map((item) => <li key={item}>{item}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section className="card space-y-4">
                            <h3 className="text-card-title font-semibold">Project strength</h3>
                            <div className="space-y-3">
                                {result.projects.map((project) => (
                                    <div key={project.name} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="font-medium">{project.name}</p>
                                            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">{project.status}</span>
                                        </div>
                                        <p className="mt-2 text-small text-slate-600 dark:text-slate-300">{project.impact}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <section className="card space-y-4">
                            <h3 className="text-card-title font-semibold">Content Studio</h3>
                            <div className="space-y-3">
                                <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                                    <p className="text-small text-slate-500 dark:text-slate-400">Headline</p>
                                    <p className="mt-1 font-medium">{result.contentStudio.headline}</p>
                                </div>
                                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                                    <p className="text-small text-slate-500 dark:text-slate-400">Summary</p>
                                    <p className="mt-2 text-small">{result.contentStudio.summary}</p>
                                </div>
                                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                                    <p className="text-small text-slate-500 dark:text-slate-400">Top keywords</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {result.contentStudio.keywords.map((keyword) => <span key={keyword} className="rounded-full bg-sky-100 px-2 py-1 text-xs text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">{keyword}</span>)}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="card space-y-4">
                            <h3 className="text-card-title font-semibold">Interview insights</h3>
                            <div className="space-y-3">
                                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                                    <p className="text-small text-slate-500 dark:text-slate-400">Strengths</p>
                                    <ul className="mt-2 list-disc space-y-1 pl-5 text-small">
                                        {result.interviewInsights.strengths.map((item) => <li key={item}>{item}</li>)}
                                    </ul>
                                </div>
                                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                                    <p className="text-small text-slate-500 dark:text-slate-400">Likely questions</p>
                                    <ul className="mt-2 list-disc space-y-1 pl-5 text-small">
                                        {result.interviewInsights.questions.map((item) => <li key={item}>{item}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <section className="card space-y-4">
                            <h3 className="text-card-title font-semibold">Improvement roadmap</h3>
                            <ol className="space-y-3">
                                {result.roadmap.map((item, index) => (
                                    <li key={item} className="flex gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">{index + 1}</span>
                                        <span className="text-small">{item}</span>
                                    </li>
                                ))}
                            </ol>
                        </section>

                        <section className="card space-y-4">
                            <h3 className="text-card-title font-semibold">Validation & warnings</h3>
                            <div className="space-y-3">
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-2 dark:border-slate-700">
                                        {result.validation.hasContact ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
                                        <span className="text-small">Contact details</span>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-2 dark:border-slate-700">
                                        {result.validation.hasSummary ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
                                        <span className="text-small">Professional summary</span>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-2 dark:border-slate-700">
                                        {result.validation.hasExperience ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
                                        <span className="text-small">Experience section</span>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-2 dark:border-slate-700">
                                        {result.validation.hasProjects ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
                                        <span className="text-small">Projects</span>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30">
                                    <p className="text-small font-medium text-red-700 dark:text-red-200">Warnings</p>
                                    <ul className="mt-2 space-y-1 text-small text-red-600 dark:text-red-300">
                                        {result.validation.warnings.length ? result.validation.warnings.map((warning) => <li key={warning}>• {warning}</li>) : <li>• No critical warnings detected.</li>}
                                    </ul>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="card border-primary/20 bg-primary/5">
                        <div className="flex items-start gap-3">
                            <Target className="mt-0.5 h-5 w-5 text-primary" />
                            <div>
                                <p className="text-small font-medium text-primary">Final conclusion</p>
                                <p className="mt-1 text-small text-slate-700 dark:text-slate-200">{result.report.conclusion}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
