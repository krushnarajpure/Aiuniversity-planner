"use client";

import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { useEffect, useState } from "react";
import { presentationSchema } from "@/lib/ppt";
import { SlideElement } from "./slide-element";

export function PptPreview({ initial }: { initial: unknown }) {
  const parsed = presentationSchema.safeParse(initial);
  const presentation = parsed.success ? parsed.data : null;
  const [index, setIndex] = useState(0);
  useEffect(() => { const handler = (event: KeyboardEvent) => { if (event.key === "ArrowRight") setIndex((value) => Math.min((presentation?.slides.length ?? 1) - 1, value + 1)); if (event.key === "ArrowLeft") setIndex((value) => Math.max(0, value - 1)); }; window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler); }, [presentation?.slides.length]);
  if (!presentation) return null;
  const slide = presentation.slides[index];
  return <main className="flex min-h-screen flex-col bg-slate-950 p-4 text-white sm:p-8"><header className="mb-5 flex items-center justify-between"><Link href="/ai-tools/ppt-generator" title="Back" aria-label="Back" className="rounded-lg p-2 hover:bg-white/10"><ArrowLeft className="h-5 w-5" /></Link><span className="text-sm text-slate-400">{index + 1} / {presentation.slides.length}</span><button onClick={() => document.documentElement.requestFullscreen?.()} title="Fullscreen" aria-label="Fullscreen" className="rounded-lg p-2 hover:bg-white/10"><Maximize2 className="h-5 w-5" /></button></header><section className="mx-auto flex aspect-video w-full max-w-6xl items-center justify-center overflow-hidden rounded-2xl shadow-2xl" style={{ background: slide.background, position: "relative" }}>{slide.elements.map((element) => <SlideElement key={element.id} element={element} />)}</section><footer className="mx-auto mt-5 flex items-center gap-4"><button onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0} title="Previous slide" aria-label="Previous slide" className="rounded-full bg-white/10 p-3 disabled:opacity-30"><ChevronLeft className="h-5 w-5" /></button><button onClick={() => setIndex((value) => Math.min(presentation.slides.length - 1, value + 1))} disabled={index === presentation.slides.length - 1} title="Next slide" aria-label="Next slide" className="rounded-full bg-cyan-400 p-3 text-slate-950 disabled:opacity-30"><ChevronRight className="h-5 w-5" /></button></footer></main>;
}
