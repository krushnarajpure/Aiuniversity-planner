"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Bot, BookOpen, Check, Clipboard, Copy, FileImage, Library, Mic, Send, X } from "lucide-react";
import { toast } from "sonner";
import { saveAcademicAssistantRecord } from "@/actions/ai-academic-assistant";

type RecordData = Record<string, unknown>;
type AssistantResult = { intent: string; reply: string; records: RecordData[]; missing: string[] };
const links: Record<string, string> = { course: "/courses", timetable: "/study-planner", exam: "/exams", assignment: "/assignments", study_material: "/study-material" };
const labels: Record<string, string> = { course: "Courses", timetable: "Study Timetable", exam: "Exams", assignment: "Assignments", study_material: "Study Material" };

function displayValue(value: unknown) { return Array.isArray(value) ? value.join(", ") : value == null || value === "" ? "Unclear" : String(value); }
function titleFor(intent: string, record: RecordData) { return displayValue(record.courseName || record.title || record.materialName || labels[intent] || "Academic record"); }

export function AcademicAssistantClient({ userName }: { userName: string }) {
  const [input, setInput] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [result, setResult] = useState<AssistantResult | null>(null);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function chooseImage(file: File) {
    if (!file.type.startsWith("image/")) return toast.error("Please choose a PNG, JPG, JPEG or WEBP image.");
    if (file.size > 8 * 1024 * 1024) return toast.error("Please choose an image smaller than 8 MB.");
    const reader = new FileReader(); reader.onload = () => { setImage(typeof reader.result === "string" ? reader.result : null); setImageName(file.name); }; reader.readAsDataURL(file);
  }
  function startVoice() {
    const SpeechRecognition = (window as Window & { SpeechRecognition?: new () => { lang: string; start: () => void; onresult: (event: { results: { 0: { 0: { transcript: string } } } }) => void; onend: () => void; onerror: () => void } }).SpeechRecognition;
    if (!SpeechRecognition) return toast.error("Voice input is unavailable in this browser.");
    const recognition = new SpeechRecognition(); recognition.lang = "en-IN"; setListening(true); recognition.onresult = (event) => setInput((value) => `${value}${value ? " " : ""}${event.results[0][0].transcript}`); recognition.onend = () => setListening(false); recognition.onerror = () => { setListening(false); toast.error("Could not hear your voice."); }; recognition.start();
  }
  async function send() {
    if ((!input.trim() && !image) || loading) return;
    const message = input.trim() || "Analyze this academic image and identify the correct section.";
    setMessages((current) => [...current, { role: "user", text: message }]); setInput(""); setLoading(true); setResult(null);
    try {
      const response = await fetch("/api/ai/academic-assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, imageDataUrl: image, language: "English" }) });
      const data = await response.json(); if (!response.ok || !data.success) throw new Error(data.error || "Could not analyze your academic request.");
      const next = data as AssistantResult; setResult(next); setMessages((current) => [...current, { role: "assistant", text: next.reply }]);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not reach the academic assistant."); }
    finally { setLoading(false); }
  }
  async function addRecord(record: RecordData, index: number) {
    if (!result || result.intent === "unclear") return;
    setSaving(index);
    try { const saved = await saveAcademicAssistantRecord(result.intent, record); toast.success(saved.message); setResult((current) => current ? { ...current, records: current.records.filter((_, currentIndex) => currentIndex !== index) } : current); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save this record."); }
    finally { setSaving(null); }
  }
  function copyRecord(record: RecordData) { void navigator.clipboard.writeText(Object.entries(record).map(([key, value]) => `${key}: ${displayValue(value)}`).join("\n")); toast.success("Academic information copied."); }

  return <div className="p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl"><header className="mb-6"><div className="flex items-center gap-2 text-small font-medium text-primary"><Bot className="h-4 w-4" /> ACADEMICS / AI ASSISTANT</div><h1 className="mt-2 text-subheading font-semibold sm:text-heading">AI Academic Assistant</h1><p className="mt-2 text-small text-slate-500 dark:text-slate-400">Hi {userName}, tell me what academic information you want to understand or add.</p></header><div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]"><section className="card overflow-hidden p-0"><div className="min-h-[430px] space-y-4 p-4 sm:p-6">{messages.length === 0 && !loading ? <div className="flex min-h-[350px] flex-col items-center justify-center text-center"><div className="rounded-2xl bg-primary/10 p-4 text-primary"><BookOpen className="h-8 w-8" /></div><h2 className="mt-4 text-card-title font-semibold">Your central academic AI</h2><p className="mt-2 max-w-lg text-small text-slate-500">Ask me to add courses, exams, assignments, study material or timetable data from text or an image.</p><div className="mt-5 flex flex-wrap justify-center gap-2">{["Add this timetable to my Study Timetable", "Add this exam timetable to Exams", "Add these courses", "Create assignments from this image"].map((suggestion) => <button key={suggestion} type="button" onClick={() => setInput(suggestion)} className="rounded-full border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-300">{suggestion}</button>)}</div></div> : <>{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-small ${message.role === "user" ? "bg-primary text-white" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}>{message.text}</div></div>)}{loading && <div className="text-small text-slate-500">Analyzing your academic request...</div>}</>}</div>{result && <div className="border-t border-slate-200 p-4 dark:border-slate-700"><div className="mb-3 flex items-center justify-between"><div><h2 className="font-semibold">{result.intent === "unclear" ? "Choose an academic section" : `${labels[result.intent] || "Academic records"} detected`}</h2>{result.missing.length > 0 && <p className="mt-1 text-xs text-warning">Needs review: {result.missing.join(", ")}</p>}</div><button type="button" onClick={() => setResult(null)} aria-label="Cancel preview" title="Cancel preview"><X className="h-4 w-4" /></button></div>{result.records.length > 0 && <div className="space-y-3">{result.records.map((record, index) => <article key={index} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-small">{titleFor(result.intent, record)}</h3><p className="mt-1 text-xs text-slate-500">{Object.entries(record).filter(([key]) => !["courseName", "title", "materialName"].includes(key)).map(([key, value]) => `${key}: ${displayValue(value)}`).join(" · ")}</p></div><button type="button" onClick={() => copyRecord(record)} aria-label="Copy academic record" title="Copy academic record"><Copy className="h-4 w-4 text-slate-400" /></button></div><button type="button" onClick={() => void addRecord(record, index)} disabled={saving === index || result.intent === "unclear"} className="mt-3 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{saving === index ? "Adding..." : `Add to ${labels[result.intent] || "Academic records"}`}</button></article>)}</div>}</div>}{image && <div className="border-t border-slate-200 p-3 dark:border-slate-700"><div className="flex items-center gap-2 text-xs text-slate-500"><img src={image} alt="Selected academic document" className="h-12 w-16 rounded object-cover" /><span className="flex-1 truncate">{imageName}</span><button type="button" onClick={() => { setImage(null); setImageName(""); }} aria-label="Remove image" title="Remove image"><X className="h-4 w-4" /></button></div></div>}<div className="border-t border-slate-200 p-3 dark:border-slate-700"><div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 focus-within:border-primary dark:border-slate-700 dark:bg-slate-900"><button type="button" onClick={() => fileRef.current?.click()} aria-label="Upload academic image" title="Upload academic image" className="rounded-lg p-2 text-slate-400 hover:text-primary"><FileImage className="h-4 w-4" /></button><input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) chooseImage(file); }} /><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }} rows={1} placeholder="Tell your Academic Assistant what to add..." className="min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-small outline-none" /><button type="button" onClick={startVoice} aria-label="Use voice input" title="Use voice input" className={`rounded-lg p-2 ${listening ? "text-danger" : "text-slate-400 hover:text-primary"}`}><Mic className="h-4 w-4" /></button><button type="button" onClick={() => void send()} disabled={loading || (!input.trim() && !image)} aria-label="Send academic request" title="Send academic request" className="rounded-lg bg-primary p-2 text-white disabled:opacity-40"><Send className="h-4 w-4" /></button></div><p className="mt-2 text-xs text-slate-400">Gemini AI · Text and image understanding · {input.length} characters</p></div></section><aside className="space-y-4"><div className="card"><div className="mb-3 flex items-center gap-2"><Clipboard className="h-4 w-4 text-primary" /><h2 className="font-semibold">Academic sections</h2></div><div className="space-y-2">{Object.entries(labels).map(([intent, label]) => <Link key={intent} href={links[intent]} className="flex items-center gap-2 rounded-lg px-3 py-2 text-small text-slate-600 hover:bg-primary/10 hover:text-primary dark:text-slate-300"><Library className="h-4 w-4" />{label}</Link>)}</div></div><div className="card"><h2 className="font-semibold">How it works</h2><p className="mt-2 text-small leading-6 text-slate-500">Upload an image or describe your request. Review the detected information, then confirm before anything is saved.</p><div className="mt-4 flex items-center gap-2 text-xs text-success"><Check className="h-4 w-4" />Confirmation required</div></div></aside></div></div></div>;
}
