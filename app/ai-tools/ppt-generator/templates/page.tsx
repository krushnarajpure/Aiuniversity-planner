import Link from "next/link";
import { ArrowLeft, Check, LayoutTemplate } from "lucide-react";

const templates = [
  ["Academic Blue", "A structured academic layout for seminars and assignments."],
  ["Modern Tech", "Clean contrast and generous space for technology topics."],
  ["Research Light", "Quiet typography for reports, findings and references."],
  ["Dark Professional", "A confident dark canvas for project demos and pitches."],
  ["Engineering", "Diagram-friendly layouts for systems and architecture."],
  ["Creative Gradient", "A bold student portfolio style with expressive blocks."],
];

export default function PptTemplatesPage() {
  return <main className="min-h-screen bg-[#f5f7fb] px-4 py-8 dark:bg-slate-950"><div className="mx-auto max-w-6xl"><Link href="/ai-tools/ppt-generator" className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft className="h-4 w-4" />PPT Generator</Link><div className="mt-8"><p className="text-sm font-medium text-cyan-700">Start with a system</p><h1 className="mt-1 text-3xl font-semibold dark:text-white">Presentation Templates</h1><p className="mt-2 text-sm text-slate-500">Choose a visual direction, then generate content around it.</p></div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{templates.map(([name, description]) => <article key={name} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="flex aspect-video items-center justify-center bg-slate-950 text-cyan-300"><LayoutTemplate className="h-10 w-10" /></div><div className="p-5"><h2 className="font-semibold dark:text-white">{name}</h2><p className="mt-2 text-sm text-slate-500">{description}</p><Link href={`/ai-tools/ppt-generator?style=${encodeURIComponent(name)}`} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium dark:border-slate-700"><Check className="h-3.5 w-3.5 text-cyan-600" />Use template</Link></div></article>)}</div></div></main>;
}
