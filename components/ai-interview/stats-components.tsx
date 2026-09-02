/**
 * AI Interview Stats and Display Components
 */

"use client";

import { TrendingUp, TrendingDown, Target, Activity } from "lucide-react";

interface ScoreDisplayProps {
  score: number;
  label: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "success" | "warning" | "danger";
  showTrend?: boolean;
  trend?: "up" | "down" | "stable";
}

export function ScoreDisplay({
  score,
  label,
  size = "md",
  variant = "primary",
  showTrend = false,
  trend = "stable",
}: ScoreDisplayProps) {
  const sizeClasses = {
    sm: "p-2",
    md: "p-4",
    lg: "p-6",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const variantClasses = {
    primary: "bg-blue-50 text-blue-900 dark:bg-blue-900 dark:text-blue-50",
    success: "bg-green-50 text-green-900 dark:bg-green-900 dark:text-green-50",
    warning: "bg-yellow-50 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-50",
    danger: "bg-red-50 text-red-900 dark:bg-red-900 dark:text-red-50",
  };

  return (
    <div className={`rounded-lg ${variantClasses[variant]} ${sizeClasses[size]}`}>
      <p className="text-xs font-medium opacity-75">{label}</p>
      <div className="mt-2 flex items-end gap-2">
        <div className={`font-bold ${textSizes[size]}`}>{score}%</div>
        {showTrend && (
          <div className="mb-1">
            {trend === "up" && (
              <TrendingUp className="h-4 w-4 text-green-600" />
            )}
            {trend === "down" && (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            {trend === "stable" && (
              <Activity className="h-4 w-4 text-slate-600" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface ProgressRingProps {
  score: number;
  size?: number;
  label?: string;
}

export function ProgressRing({ score, size = 120, label }: ProgressRingProps) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-slate-200 dark:text-slate-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-primary transition-all"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-900 dark:text-white">
          {score}%
        </span>
        {label && (
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

interface SkillBarProps {
  skill: string;
  percentage: number;
  level?: "beginner" | "intermediate" | "advanced" | "expert";
}

export function SkillBar({
  skill,
  percentage,
  level = "intermediate",
}: SkillBarProps) {
  const levelColors = {
    beginner: "bg-green-500",
    intermediate: "bg-blue-500",
    advanced: "bg-orange-500",
    expert: "bg-purple-500",
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {skill}
        </span>
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {percentage}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={`h-full ${levelColors[level]} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface StatsGridProps {
  stats: { label: string; value: string | number; icon?: React.ReactNode }[];
  columns?: number;
}

export function StatsGrid({ stats, columns = 4 }: StatsGridProps) {
  return (
    <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns}`}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            {stat.icon && <div className="text-primary text-lg">{stat.icon}</div>}
            <div className="text-right">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {stat.label}
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface BadgeProps {
  text: string;
  variant?: "primary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
}

export function Badge({ text, variant = "primary", size = "md" }: BadgeProps) {
  const variantClasses = {
    primary: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    info: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {text}
    </span>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="rounded-lg border-2 border-dashed border-slate-300 py-12 px-4 text-center dark:border-slate-600">
      {icon && (
        <div className="flex justify-center text-slate-400 text-4xl mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
