"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Eye,
  Plus,
  Save,
  Trash2,
  Type,
  Undo2,
  Redo2,
} from "lucide-react";
import { toast } from "sonner";
import {
  presentationSchema,
  type PresentationDocument,
  type PptElement,
} from "@/lib/ppt";
import { SlideElement } from "./slide-element";

export function PptEditor({
  presentationId,
  initial,
  title,
}: {
  presentationId: string;
  initial: unknown;
  title: string;
}) {
  const parsed = presentationSchema.safeParse(initial);
  const [document, setDocument] = useState<PresentationDocument>(
    parsed.success
      ? parsed.data
      : { title, subtitle: "", theme: "modern", slides: [] },
  );
  const [selected, setSelected] = useState(0);
  const [saved, setSaved] = useState(true);
  const [past, setPast] = useState<PresentationDocument[]>([]);
  const [future, setFuture] = useState<PresentationDocument[]>([]);
  const slide = document.slides[selected];
  function record(next: PresentationDocument | ((current: PresentationDocument) => PresentationDocument)) {
    setDocument((current) => {
      const updated = typeof next === "function" ? next(current) : next;
      setPast((history) => [...history.slice(-29), current]);
      setFuture([]);
      return updated;
    });
    setSaved(false);
  }
  function updateSlide(patch: Partial<PresentationDocument["slides"][number]>) {
    record((current) => ({
      ...current,
      slides: current.slides.map((item, index) =>
        index === selected ? { ...item, ...patch } : item,
      ),
    }));
    setSaved(false);
  }
  function updateElement(id: string, patch: Partial<PptElement>) {
    updateSlide({
      elements: slide.elements.map((element) =>
        element.id === id ? { ...element, ...patch } : element,
      ),
    });
  }
  function addSlide() {
    record((current) => ({
      ...current,
      slides: [
        ...current.slides,
        {
          id: `slide-${Date.now()}`,
          title: "New slide",
          description: "",
          layout: "title-content",
          visualType: "content",
          background: "#f7f9fc",
          notes: "",
          elements: [
            {
              id: `text-${Date.now()}`,
              type: "text",
              content: "New slide",
              x: 8,
              y: 12,
              width: 80,
              height: 15,
              fontSize: 32,
              color: "#172033",
              background: null,
              bold: true,
              align: "left",
              variant: "default",
              items: [],
              labels: [],
              values: [],
              columns: [],
              rows: [],
            },
          ],
        },
      ],
    }));
    setSelected(document.slides.length);
    setSaved(false);
  }
  function deleteSlide() {
    if (document.slides.length <= 1) return;
    record((current) => ({
      ...current,
      slides: current.slides.filter((_, index) => index !== selected),
    }));
    setSelected(Math.max(0, selected - 1));
    setSaved(false);
  }
  function undo() {
    const previous = past[past.length - 1];
    if (!previous) return;
    setPast((history) => history.slice(0, -1));
    setFuture((history) => [document, ...history].slice(0, 30));
    setDocument(previous);
    setSaved(false);
  }
  function redo() {
    const next = future[0];
    if (!next) return;
    setFuture((history) => history.slice(1));
    setPast((history) => [...history.slice(-29), document]);
    setDocument(next);
    setSaved(false);
  }
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key.toLowerCase() === "z") { event.preventDefault(); if (event.shiftKey) redo(); else undo(); }
      if (event.key.toLowerCase() === "y") { event.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });
  async function save() {
    const response = await fetch(`/api/ai/ppt/${presentationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document }),
    });
    if (!response.ok) {
      toast.error("Your work could not be saved.");
      return;
    }
    setSaved(true);
    toast.success("Presentation saved");
  }
  const exportUrl = `/api/ai/ppt/${presentationId}/export`;
  if (!slide) return null;
  return (
    <div className="flex h-screen flex-col bg-[#eef1f6] text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900 sm:px-5">
        <div className="flex items-center gap-3">
          <Link
            href="/ai-tools/ppt-generator"
            title="Back"
            aria-label="Back"
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="max-w-40 truncate text-sm font-semibold sm:max-w-none">
            {document.title}
          </span>
          <span className="text-xs text-slate-400">
            {saved ? "Saved" : "Unsaved changes"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!past.length}
            title="Undo"
            aria-label="Undo"
            className="rounded-lg p-2 text-slate-400 disabled:opacity-30"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={redo}
            disabled={!future.length}
            title="Redo"
            aria-label="Redo"
            className="rounded-lg p-2 text-slate-400 disabled:opacity-30"
          >
            <Redo2 className="h-4 w-4" />
          </button>
          <Link
            href={`/ai-tools/ppt-generator/preview/${presentationId}`}
            title="Preview"
            aria-label="Preview"
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <button
            onClick={() => void save()}
            title="Save"
            aria-label="Save"
            className="rounded-lg p-2 text-cyan-700 hover:bg-cyan-50"
          >
            <Save className="h-4 w-4" />
          </button>
          <a
            href={exportUrl}
            title="Download PPTX"
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-white"
          >
            <Download className="h-4 w-4" />
            PPTX
          </a>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 md:block">
          <button
            onClick={addSlide}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 p-2 text-xs font-medium text-slate-500"
          >
            <Plus className="h-4 w-4" />
            Add slide
          </button>
          {document.slides.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setSelected(index)}
              className={`mb-2 w-full rounded-lg border p-2 text-left ${selected === index ? "border-cyan-500 ring-2 ring-cyan-500/20" : "border-slate-200 dark:border-slate-700"}`}
            >
              <div className="flex aspect-video items-center justify-center rounded bg-slate-50 text-[10px] font-semibold dark:bg-slate-800">
                {String(index + 1).padStart(2, "0")}
              </div>
              <p className="mt-2 truncate text-xs">{item.title}</p>
            </button>
          ))}
        </aside>
        <main className="flex min-w-0 flex-1 items-center justify-center overflow-auto p-4 sm:p-8">
          <div
            className="aspect-video w-full max-w-4xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700"
            style={{ background: slide.background, position: "relative" }}
          >
            {slide.elements.map((element) => <SlideElement key={element.id} element={element} editing onTextChange={(content) => updateElement(element.id, { content })} />)}
          </div>
        </main>
        <aside className="hidden w-72 shrink-0 overflow-y-auto border-l border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:block">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Slide properties
          </p>
          <label className="mt-5 block text-xs font-medium">
            Title
            <input
              value={slide.title}
              onChange={(event) => updateSlide({ title: event.target.value })}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
          <label className="mt-4 block text-xs font-medium">
            Background
            <input
              type="color"
              value={
                slide.background.startsWith("#") ? slide.background : "#f7f9fc"
              }
              onChange={(event) =>
                updateSlide({ background: event.target.value })
              }
              className="mt-2 h-10 w-full rounded-lg"
            />
          </label>
          <div className="mt-6 flex items-center justify-between">
            <span className="text-xs font-semibold">Elements</span>
            <button
              onClick={() =>
                updateSlide({
                  elements: [
                    ...slide.elements,
                    {
                      id: `text-${Date.now()}`,
                      type: "text",
                      content: "Edit me",
                      x: 10,
                      y: 70,
                      width: 70,
                      height: 12,
                      fontSize: 20,
                      color: "#526078",
                      background: null,
                      bold: false,
                      align: "left",
                      variant: "default",
                      items: [],
                      labels: [],
                      values: [],
                      columns: [],
                      rows: [],
                    },
                  ],
                })
              }
              title="Add text"
              aria-label="Add text"
              className="rounded-lg p-2 text-cyan-700 hover:bg-cyan-50"
            >
              <Type className="h-4 w-4" />
            </button>
          </div>
          {slide.elements.map((element) => (
            <div
              key={element.id}
              className="mt-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{element.type}</span>
                <button
                  onClick={() =>
                    updateSlide({
                      elements: slide.elements.filter(
                        (item) => item.id !== element.id,
                      ),
                    })
                  }
                  title="Delete element"
                  aria-label="Delete element"
                  className="text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {element.type === "text" && (
                <input
                  value={element.content}
                  onChange={(event) =>
                    updateElement(element.id, { content: event.target.value })
                  }
                  className="mt-2 w-full rounded border border-slate-200 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-950"
                />
              )}
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
