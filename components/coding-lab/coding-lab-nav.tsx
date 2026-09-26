"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Overview", href: "/placement/coding-practice" },
  { label: "Problems", href: "/placement/coding-practice/problems" },
  { label: "DSA", href: "/placement/coding-practice/dsa" },
  { label: "Companies", href: "/placement/coding-practice/company" },
  { label: "Interview", href: "/placement/coding-practice/interview" },
  { label: "Projects", href: "/placement/coding-practice/projects" },
  { label: "Submissions", href: "/placement/coding-practice/submissions" },
  { label: "Progress", href: "/placement/coding-practice/progress" },
  { label: "Saved", href: "/placement/coding-practice/saved" },
  { label: "Settings", href: "/placement/coding-practice/settings" },
] as const;

export function CodingLabNav() {
  const pathname = usePathname() ?? "";

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                isActive
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-slate-200 bg-transparent text-slate-600 hover:border-primary/40 hover:text-primary dark:border-slate-700 dark:text-slate-300"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
