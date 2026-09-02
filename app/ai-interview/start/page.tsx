/**
 * AI Interview - Start Interview Page
 * Multi-step setup wizard for creating interviews
 */

import { AppShell } from "@/components/layout/app-shell";
import { StartInterviewWizard } from "@/components/ai-interview/start-wizard";

export default async function StartInterviewPage() {
  return (
    <AppShell userName="User">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div>
            <p className="text-sm font-medium text-primary">GET STARTED</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
              Create Your Interview
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Customize your interview experience in just 10 steps
            </p>
          </div>

          {/* Wizard */}
          <div className="mt-8">
            <StartInterviewWizard />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
