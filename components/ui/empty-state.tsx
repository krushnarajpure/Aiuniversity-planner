"use client";

import { type LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <p className="text-body font-medium text-slate-600 dark:text-slate-300 mb-2">{title}</p>
      {subtitle && (
        <p className="text-small text-slate-500 dark:text-slate-400 mb-4 max-w-md">{subtitle}</p>
      )}
      <button
        onClick={onAction}
        className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
      >
        {actionLabel}
      </button>
    </div>
  );
}
