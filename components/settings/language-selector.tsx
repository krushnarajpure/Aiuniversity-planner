"use client";

import { useMemo, useState, useTransition } from "react";
import { Languages, Search } from "lucide-react";
import { toast } from "sonner";
import { updatePreferredLanguage } from "@/actions/profile";
import { languageOptions } from "@/lib/languages";

export function LanguageSelector({ selectedLanguage }: { selectedLanguage: string }) {
  const [language, setLanguage] = useState(selectedLanguage || "en");
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const filteredLanguages = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return languageOptions;
    return languageOptions.filter((option) => `${option.name} ${option.nativeName} ${option.code}`.toLowerCase().includes(normalizedQuery));
  }, [query]);

  function handleChange(value: string) {
    setLanguage(value);
    startTransition(async () => {
      const result = await updatePreferredLanguage(value);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  return (
    <div className="card">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Languages className="h-5 w-5" /></div>
        <div><p className="font-medium">Dashboard Language</p><p className="mt-1 text-small text-slate-500 dark:text-slate-400">Choose from 100+ languages for your student experience.</p></div>
      </div>
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search language or native name" className="w-full rounded-lg border border-slate-300 bg-transparent py-2 pl-9 pr-3 text-small outline-none focus:border-primary dark:border-slate-600" />
      </div>
      <select value={language} onChange={(event) => handleChange(event.target.value)} disabled={isPending} size={Math.min(7, Math.max(4, filteredLanguages.length))} className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-small outline-none focus:border-primary dark:border-slate-600">
        {filteredLanguages.map((option) => <option key={`${option.code}-${option.name}`} value={option.code}>{option.nativeName} - {option.name}</option>)}
      </select>
      <p className="mt-2 text-xs text-slate-400">{filteredLanguages.length} languages available{isPending ? " · Saving..." : ""}</p>
    </div>
  );
}
