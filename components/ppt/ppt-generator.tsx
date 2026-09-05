"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, ImagePlus, Presentation, Sparkles } from "lucide-react";
import { toast } from "sonner";

const types = ["Academic Presentation", "Seminar", "Project Presentation", "Final Year Project", "Assignment", "Research Presentation", "Business Presentation", "Pitch Deck", "Workshop", "Technical Presentation", "Case Study", "Conference Presentation"];
const styles = ["Modern", "Minimal", "Corporate", "Technology", "Education", "Dark", "Light", "Gradient", "Creative", "Professional"];

export function PptGenerator() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState(types[0]);
  const [slideCount, setSlideCount] = useState("10");
  const [audience, setAudience] = useState("College Student");
  const [language, setLanguage] = useState("English");
  const [tone, setTone] = useState("Professional");
  const [style, setStyle] = useState("Modern");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("Ready when you are");

  async function generate() {
    if (prompt.trim().length < 10) { toast.error("Describe your presentation topic in a little more detail."); return; }
    setLoading(true);
    const stages = ["Analyzing your topic...", "Planning slides...", "Writing content...", "Designing layouts...", "Almost ready..."];
    let index = 0;
    const timer = window.setInterval(() => { setStage(stages[index++ % stages.length]); }, 700);
    try {
      const response = await fetch("/api/ai/ppt", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: `${type}: ${prompt}`, slideCount: Number(slideCount), audience, language, tone, style }) });
      const result = await response.json() as { presentationId?: string; error?: string };
      if (!response.ok || !result.presentationId) throw new Error(result.error || "Something went wrong while generating your presentation.");
      router.push(`/ai-tools/ppt-generator/plan/${result.presentationId}`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Something went wrong while generating your presentation."); }
    finally { window.clearInterval(timer); setStage("Ready when you are"); setLoading(false); }
  }

  return <main className="min-h-[calc(100vh-73px)] bg-[#f5f7fb] px-4 py-8 dark:bg-slate-950 sm:px-8"><div className="mx-auto max-w-6xl space-y-8"><section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10"><div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-cyan-100/70 blur-3xl dark:bg-cyan-500/10" /><div className="relative max-w-3xl"><div className="flex items-center gap-2 text-sm font-semibold text-cyan-700 dark:text-cyan-300"><Presentation className="h-5 w-5" /> AI Tools / PPT Generator</div><h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">Create presentations with AI</h1><p className="mt-3 text-base text-slate-500 dark:text-slate-400">Describe your idea and let AI build a complete, editable presentation.</p><textarea maxLength={20000} value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={4} placeholder="Create a 12-slide professional presentation on Artificial Intelligence for 3rd year Information Technology students..." className="mt-7 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-700 dark:bg-slate-950" /><div className="mt-4 flex items-center justify-between gap-3"><span className="text-xs text-slate-400">{prompt.length}/20000</span><button onClick={() => void generate()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-60 dark:bg-cyan-400 dark:text-slate-950">{loading ? <Sparkles className="h-4 w-4 animate-pulse" /> : <Sparkles className="h-4 w-4" />}{loading ? stage : "Generate Presentation"}<ChevronRight className="h-4 w-4" /></button></div></div></section><section><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Start with a purpose</h2><div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">{types.map((item) => <button key={item} onClick={() => setType(item)} className={`flex items-center justify-between rounded-xl border p-4 text-left text-sm transition ${type === item ? "border-cyan-500 bg-cyan-50 text-cyan-800 dark:bg-cyan-500/10 dark:text-cyan-200" : "border-slate-200 bg-white hover:border-cyan-300 dark:border-slate-800 dark:bg-slate-900"}`}>{item}{type === item && <Check className="h-4 w-4" />}</button>)}</div></section><section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2 lg:grid-cols-4"><Field label="Slides"><select value={slideCount} onChange={(event) => setSlideCount(event.target.value)}>{[5, 8, 10, 12, 15, 20, 25, 30].map((value) => <option key={value}>{value}</option>)}</select></Field><Field label="Audience"><select value={audience} onChange={(event) => setAudience(event.target.value)}>{["School Student", "College Student", "Engineering Student", "IT Student", "Teacher", "Professional", "Researcher", "General Audience"].map((value) => <option key={value}>{value}</option>)}</select></Field><Field label="Language"><select value={language} onChange={(event) => setLanguage(event.target.value)}>{["English", "Marathi", "Hindi", "Mixed"].map((value) => <option key={value}>{value}</option>)}</select></Field><Field label="Tone"><select value={tone} onChange={(event) => setTone(event.target.value)}>{["Academic", "Professional", "Corporate", "Creative", "Technical", "Formal", "Storytelling"].map((value) => <option key={value}>{value}</option>)}</select></Field><div className="md:col-span-2 lg:col-span-4"><p className="mb-3 text-sm font-medium">Choose a visual style</p><div className="flex flex-wrap gap-2">{styles.map((item) => <button key={item} onClick={() => setStyle(item)} className={`rounded-full border px-3 py-2 text-xs font-medium ${style === item ? "border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-200" : "border-slate-200 text-slate-500 dark:border-slate-700"}`}>{item}</button>)}</div></div></section><div className="flex items-center gap-2 text-xs text-slate-500"><ImagePlus className="h-4 w-4" /> Your slides are structured for editing, visuals, speaker notes and real PowerPoint export.</div></div></main>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="text-sm font-medium">{label}<div className="mt-2">{children}</div></label>; }
