/**
 * AI Interview Resume Intelligence
 * Upload and analyze resume for interview prep
 */

"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";

export default function ResumeIntelligencePage() {
  const [resumeUploaded, setResumeUploaded] = useState(false);

  return (
    <AppShell userName="User">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div>
            <p className="text-sm font-medium text-primary">INTELLIGENCE</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
              Resume Intelligence
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Upload your resume to get personalized interview questions
            </p>
          </div>

          {/* Upload Section */}
          <div className="mt-8 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-600 dark:bg-slate-900">
            <Upload className="mx-auto h-12 w-12 text-slate-400" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              Upload Your Resume
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              PDF or DOCX format, up to 5MB
            </p>
            <button className="mt-4 rounded-lg bg-primary px-6 py-2 font-medium text-white hover:bg-primary/90">
              Choose File
            </button>
          </div>

          {/* Features */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: <FileText className="h-6 w-6" />,
                title: "Parse & Extract",
                description: "Automatically extract skills, experience, and projects",
              },
              {
                icon: <CheckCircle2 className="h-6 w-6" />,
                title: "Generate Questions",
                description: "Create interview questions based on your resume",
              },
              {
                icon: <AlertCircle className="h-6 w-6" />,
                title: "Identify Gaps",
                description: "Highlight potential weaknesses and inconsistencies",
              },
              {
                icon: <FileText className="h-6 w-6" />,
                title: "Career Insights",
                description: "Get recommendations for your career growth",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="text-primary">{feature.icon}</div>
                <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {resumeUploaded && (
            <>
              {/* Resume Analysis */}
              <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Resume Analysis
                </h2>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {[
                    { label: "Overall Score", value: "78/100" },
                    { label: "Clarity", value: "8/10" },
                    { label: "Completeness", value: "7/10" },
                    { label: "Impact", value: "8/10" },
                  ].map((metric, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800"
                    >
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {metric.label}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-primary">
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extracted Information */}
              <div className="mt-6 space-y-4">
                <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Skills Found
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["React", "JavaScript", "Node.js", "Databases", "AWS"].map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Projects Identified
                  </h3>
                  <div className="mt-3 space-y-2">
                    {["E-commerce Platform", "Social Media App", "Analytics Dashboard"].map((project) => (
                      <div
                        key={project}
                        className="rounded bg-slate-50 p-3 text-sm dark:bg-slate-800"
                      >
                        {project}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interview Questions */}
              <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-900/20">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Interview Questions Generated
                </h3>
                <p className="mt-2 text-sm text-blue-800 dark:text-blue-200">
                  Based on your resume, we've created 12 practice questions
                </p>
                <button className="mt-4 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700">
                  Start Resume-Based Interview →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
