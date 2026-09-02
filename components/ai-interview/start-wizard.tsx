/**
 * AI Interview Start Wizard - Client Component
 * Interactive multi-step form for interview setup
 */

"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import type {
  InterviewPurpose,
  Role,
  Difficulty,
  InterviewType,
  PersonalityStyle,
} from "@/types/ai-interview";

const steps = [
  { id: 1, title: "Purpose", description: "Why are you interviewing?" },
  { id: 2, title: "Role", description: "What role are you targeting?" },
  { id: 3, title: "Experience", description: "What's your experience level?" },
  { id: 4, title: "Difficulty", description: "What difficulty level?" },
  { id: 5, title: "Interview Type", description: "What type of interview?" },
  { id: 6, title: "Duration", description: "How much time?" },
  { id: 7, title: "Personality", description: "Interviewer style?" },
  { id: 8, title: "Mode", description: "Text, voice, or video?" },
  { id: 9, title: "Resume", description: "Upload your resume (optional)" },
  { id: 10, title: "Job Description", description: "Add job description (optional)" },
];

export function StartInterviewWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState({
    purpose: "job" as InterviewPurpose,
    role: "fullstack" as Role,
    experience: "junior",
    difficulty: "medium" as Difficulty,
    types: ["technical", "behavioral"] as InterviewType[],
    duration: 30,
    personality: "professional" as PersonalityStyle,
    mode: "text",
    resume: null,
    jobDescription: "",
  });

  const handleNext = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="grid gap-3">
            {(["internship", "campus", "job", "career-switch", "promotion", "practice"] as InterviewPurpose[]).map(
              (p) => (
                <button
                  key={p}
                  onClick={() => setConfig({ ...config, purpose: p })}
                  className={`rounded-lg border-2 p-4 text-left font-medium transition ${
                    config.purpose === p
                      ? "border-primary bg-primary/10"
                      : "border-slate-200 hover:border-primary dark:border-slate-700"
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1).replace("-", " ")}
                </button>
              )
            )}
          </div>
        );
      case 2:
        return (
          <div className="grid gap-3">
            {(["frontend", "backend", "fullstack", "react", "nodejs", "python", "data-scientist", "devops"] as Role[]).map(
              (r) => (
                <button
                  key={r}
                  onClick={() => setConfig({ ...config, role: r })}
                  className={`rounded-lg border-2 p-4 text-left font-medium transition ${
                    config.role === r
                      ? "border-primary bg-primary/10"
                      : "border-slate-200 hover:border-primary dark:border-slate-700"
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1).replace("-", " ")}
                </button>
              )
            )}
          </div>
        );
      case 3:
        return (
          <div className="grid gap-3">
            {["fresher", "junior", "mid-level", "senior"].map((exp) => (
              <button
                key={exp}
                onClick={() => setConfig({ ...config, experience: exp })}
                className={`rounded-lg border-2 p-4 text-left font-medium transition ${
                  config.experience === exp
                    ? "border-primary bg-primary/10"
                    : "border-slate-200 hover:border-primary dark:border-slate-700"
                }`}
              >
                {exp.charAt(0).toUpperCase() + exp.slice(1)}
              </button>
            ))}
          </div>
        );
      case 4:
        return (
          <div className="grid gap-3">
            {(["beginner", "easy", "medium", "hard", "advanced", "expert"] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setConfig({ ...config, difficulty: d })}
                className={`rounded-lg border-2 p-4 text-left font-medium transition ${
                  config.difficulty === d
                    ? "border-primary bg-primary/10"
                    : "border-slate-200 hover:border-primary dark:border-slate-700"
                }`}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        );
      case 5:
        return (
          <div className="grid gap-3">
            {["technical", "hr", "behavioral", "coding", "system-design", "full"].map((type) => (
              <label key={type} className="flex items-center gap-3 rounded-lg border-2 border-slate-200 p-4 hover:border-primary dark:border-slate-700">
                <input
                  type="checkbox"
                  checked={config.types.includes(type as InterviewType)}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...config.types, type as InterviewType]
                      : config.types.filter((t) => t !== type);
                    setConfig({ ...config, types: newTypes });
                  }}
                  className="h-5 w-5"
                />
                <span className="font-medium text-slate-900 dark:text-white">
                  {type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ")}
                </span>
              </label>
            ))}
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <div className="text-2xl font-bold text-primary">{config.duration} minutes</div>
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={config.duration}
              onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="grid grid-cols-3 gap-2">
              {[15, 30, 60].map((dur) => (
                <button
                  key={dur}
                  onClick={() => setConfig({ ...config, duration: dur })}
                  className="rounded-lg border border-slate-200 py-2 font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  {dur}m
                </button>
              ))}
            </div>
          </div>
        );
      case 7:
        return (
          <div className="grid gap-3">
            {["professional", "friendly", "strict", "technical", "supportive"].map((style) => (
              <button
                key={style}
                onClick={() => setConfig({ ...config, personality: style as PersonalityStyle })}
                className={`rounded-lg border-2 p-4 text-left font-medium transition ${
                  config.personality === style
                    ? "border-primary bg-primary/10"
                    : "border-slate-200 hover:border-primary dark:border-slate-700"
                }`}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        );
      case 8:
        return (
          <div className="grid gap-3">
            {["text", "voice", "video"].map((m) => (
              <button
                key={m}
                onClick={() => setConfig({ ...config, mode: m })}
                className={`rounded-lg border-2 p-4 text-left font-medium transition ${
                  config.mode === m
                    ? "border-primary bg-primary/10"
                    : "border-slate-200 hover:border-primary dark:border-slate-700"
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        );
      case 9:
        return (
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-dashed border-slate-300 p-6 text-center dark:border-slate-600">
              <div className="text-4xl">📄</div>
              <p className="mt-2 font-medium text-slate-900 dark:text-white">Drop resume here</p>
              <input type="file" className="mt-3" accept=".pdf,.doc,.docx" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Optional - helps us personalize questions</p>
          </div>
        );
      case 10:
        return (
          <div className="space-y-4">
            <textarea
              value={config.jobDescription}
              onChange={(e) => setConfig({ ...config, jobDescription: e.target.value })}
              placeholder="Paste job description here..."
              className="h-40 w-full rounded-lg border border-slate-200 bg-white p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <button className="w-full rounded-lg bg-primary px-6 py-2 font-medium text-white hover:bg-primary/90">
              Start Interview →
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>

      {/* Step Indicator */}
      <div>
        <p className="text-sm font-medium text-primary">
          Step {currentStep} of {steps.length}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
          {steps[currentStep - 1].title}
        </h2>
        <p className="mt-1 text-slate-600 dark:text-slate-300">
          {steps[currentStep - 1].description}
        </p>
      </div>

      {/* Content */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between gap-4">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-6 py-2 font-medium disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {currentStep === steps.length ? "Start" : "Next"}
          {currentStep !== steps.length && <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
