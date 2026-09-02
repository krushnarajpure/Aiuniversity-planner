/**
 * AI Interview Coding Lab
 * Practice coding interview questions
 */

import { AppShell } from "@/components/layout/app-shell";
import { CodingLabContent } from "@/components/ai-interview/coding-lab-content";

export default async function CodingLabPage() {
  return (
    <AppShell userName="User">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div>
            <p className="text-sm font-medium text-primary">PRACTICE</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
              Coding Interview Lab
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Practice coding problems with real-time feedback
            </p>
          </div>

          {/* Coding Lab */}
          <div className="mt-8">
            <CodingLabContent />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
