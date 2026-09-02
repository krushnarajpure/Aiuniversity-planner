/**
 * AI Interview Settings Page
 */

"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Settings, Bell, Lock, Palette } from "lucide-react";

export default function SettingsPage() {
  return (
    <AppShell userName="User">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          <div>
            <p className="text-sm font-medium text-primary">SETTINGS</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
              Preferences & Settings
            </h1>
          </div>

          <div className="mt-8 space-y-6">
            {[
              { icon: <Palette className="h-6 w-6" />, title: "Display", desc: "Theme and language" },
              { icon: <Bell className="h-6 w-6" />, title: "Notifications", desc: "Alerts and reminders" },
              { icon: <Settings className="h-6 w-6" />, title: "Interview Settings", desc: "Interview preferences" },
              { icon: <Lock className="h-6 w-6" />, title: "Privacy", desc: "Data and security" },
            ].map((section, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex items-center gap-3">
                  <div className="text-primary">{section.icon}</div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{section.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{section.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
