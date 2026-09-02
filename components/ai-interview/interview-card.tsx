/**
 * AI Interview Card Component
 * Reusable card for interview sessions, questions, etc.
 */

"use client";

import { ArrowRight, BookmarkIcon, Clock, Zap } from "lucide-react";

interface InterviewCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  difficulty?: "beginner" | "easy" | "medium" | "hard" | "advanced" | "expert" | "elite";
  duration?: number;
  score?: number;
  progress?: number;
  onClick?: () => void;
  actionText?: string;
  isFavorite?: boolean;
  tags?: string[];
  stats?: { label: string; value: string }[];
  layout?: "compact" | "detailed" | "minimal";
}

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  easy: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  hard: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  expert: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  elite: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
};

export function InterviewCard({
  title,
  description,
  icon,
  difficulty,
  duration,
  score,
  progress,
  onClick,
  actionText = "Start",
  isFavorite = false,
  tags = [],
  stats = [],
  layout = "detailed",
}: InterviewCardProps) {
  if (layout === "minimal") {
    return (
      <div
        onClick={onClick}
        className="group cursor-pointer rounded-lg border border-slate-200 p-4 transition-all hover:border-primary hover:shadow-md dark:border-slate-700"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-slate-900 dark:text-white">
              {title}
            </h3>
            {duration && (
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <Clock className="h-3 w-3" />
                {duration} min
              </p>
            )}
          </div>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-slate-400" />
        </div>
      </div>
    );
  }

  if (layout === "compact") {
    return (
      <div
        onClick={onClick}
        className="group cursor-pointer rounded-lg border border-slate-200 p-4 transition-all hover:shadow-md dark:border-slate-700"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {icon && <div className="text-primary">{icon}</div>}
              <h3 className="font-medium text-slate-900 dark:text-white">
                {title}
              </h3>
            </div>
            {description && (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 line-clamp-1">
                {description}
              </p>
            )}
          </div>
          {score !== undefined && (
            <div className="text-right">
              <div className="text-lg font-semibold text-primary">{score}%</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-white transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-900"
    >
      {/* Header with icon */}
      {icon && (
        <div className="border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div className="text-primary text-xl">{icon}</div>
            {isFavorite && (
              <BookmarkIcon className="h-4 w-4 text-primary fill-current" />
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>

        {description && (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
            {description}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Difficulty badge */}
        {difficulty && (
          <div className="mt-3">
            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${difficultyColors[difficulty]}`}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
          </div>
        )}

        {/* Stats */}
        {stats.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-xs text-slate-500">{stat.label}</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Progress bar */}
        {progress !== undefined && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300">Progress</span>
              <span className="font-semibold text-primary">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Duration */}
        {duration && (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Clock className="h-4 w-4" />
            <span>{duration} minutes</span>
          </div>
        )}

        {/* Score */}
        {score !== undefined && (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Last Score
            </span>
            <span className="text-lg font-bold text-primary">{score}%</span>
          </div>
        )}

        {/* Action button */}
        {actionText && (
          <button className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-medium text-white transition-all hover:bg-primary/90 active:scale-95">
            <Zap className="h-4 w-4" />
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
}
