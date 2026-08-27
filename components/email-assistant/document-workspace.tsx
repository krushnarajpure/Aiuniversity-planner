"use client";

import { useState } from "react";
import { Download, FileText, ImagePlus, LoaderCircle, Search, X } from "lucide-react";

type WorkspaceFile = { name: string; type: string; size: number; url: string; text: string };
type Props = { profile: { name: string; department: string; semester: string; university: string }; onUseInRequest: (value: string) => void };
const accepted = ".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg";
const maxSize = 20 * 1024 * 1024;

function formatSize(size: number) { return `${(size / 1024 / 1024).toFixed(1)} MB`; }
function detectFields(text: string, name: string) {
  const fields = ["Recipient", "Date", "Student Name", "Department", "Class", "Roll Number", "Subject", "Reason", "From Date", "To Date", "Signature"];
  const source = `${name} ${text}`.toLowerCase();
  return fields.filter((field) => source.includes(field.toLowerCase()) || /application|leave|letter|form/i.test(name));
}

export function DocumentWorkspace({ profile, onUseInRequest }: Props) {
  const [tab, setTab] = useState("Communication");
  const [file, setFile] = useState<WorkspaceFile | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [fields, setFields] = useState<string[]>([]);

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    const extension = selected.name.toLowerCase().match(/\.[^.]+$/)?.[0] || "";
    if (![".pdf", ".doc", ".docx", ".txt", ".png", ".jpg", ".jpeg"].includes(extension)) { setError("This file format is not supported. Use PDF, DOCX, DOC, TXT, PNG, JPG, or JPEG."); return; }
    if (selected.size > maxSize) { setError("The document is too large. Please upload a file smaller than 20 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      const text = extension === ".txt" ? atob(url.split(",")[1] || "") : "";
      setFile({ name: selected.name, type: selected.type, size: selected.size, url, text });
      setFields(detectFields(text, selected.name));
      setStatus("Original template preserved. A working copy is ready.");
      setError("");
    };
    reader.onerror = () => setError("Unable to read this document. Please upload a valid file.");
    reader.readAsDataURL(selected);
  }

  async function analyze() {
    if (!file) return;
    setStatus("Analyzing template...");
    if (file.type.startsWith("image/")) {
      try {
        const response = await fetch("/api/ai/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ situation: "Analyze this uploaded college template. Identify its visible structure and editable fields. Preserve the original format.", targetChannel: "Formal Application", name: profile.name, inputLanguage: "English", language: "English", details: { department: profile.department, semester: profile.semester, college: profile.university }, imageDataUrl: file.url }) });
        if (!response.ok) throw new Error();
        const data = await response.json();
        setFields((current) => Array.from(new Set([...current, ...(data.result?.missingInformation || [])])));
        setStatus("Template detected. Review the fields, then describe what to add.");
      } catch { setStatus("Some text could not be detected accurately. Please edit the detected fields manually."); }
      return;
    }
    if (/\.(pdf|docx?)$/i.test(file.name)) setStatus("Preview ready. Text extraction for this format needs a server document parser; the original file remains unchanged.");
    else setStatus("Template detected. Review the fields, then describe what to add.");
  }

  return <section className="card mb-6">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="flex items-center gap-2 text-small font-medium text-primary"><FileText className="h-4 w-4" /> AI DOCUMENT &amp; COMMUNICATION WORKSPACE</p><h2 className="mt-1 text-card-title font-semibold">Create, understand, and reuse your college documents</h2></div><label className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-3 py-2 text-small font-medium text-white"><ImagePlus className="h-4 w-4" /> Upload My Format<input type="file" accept={accepted} onChange={handleFile} className="sr-only" /></label></div>
    <div className="mb-4 flex gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-700">{["Communication", "Applications", "Documents", "PDF Editor", "Templates", "History"].map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`shrink-0 border-b-2 px-3 py-2 text-small ${tab === item ? "border-primary text-primary" : "border-transparent text-slate-500"}`}>{item}</button>)}</div>
    {tab === "Communication" ? <p className="text-small text-slate-500 dark:text-slate-400">Your existing email, Gmail, WhatsApp, SMS, Teams, PDF, and copy workflows remain below. Upload a format here whenever a message needs to follow an existing document.</p> : !file ? <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center dark:border-slate-600"><FileText className="mx-auto mb-2 h-8 w-8 text-slate-300" /><p className="text-body font-medium">No documents yet.</p><p className="mt-1 text-small text-slate-500">Upload a PDF, DOCX, DOC, TXT, PNG, JPG, or JPEG to start a working copy.</p></div> : <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]"><div className="min-h-[320px] rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">{file.name.toLowerCase().endsWith(".pdf") ? <iframe title={`${file.name} preview`} src={file.url} className="h-[420px] w-full rounded border bg-white" /> : file.type.startsWith("image/") ? <img src={file.url} alt={`Preview of ${file.name}`} className="mx-auto max-h-[420px] max-w-full object-contain" /> : file.text ? <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap bg-white p-4 text-small dark:bg-slate-950">{file.text}</pre> : <div className="flex h-[280px] items-center justify-center text-center text-small text-slate-500">Preview unavailable for this file type. The original template is preserved for download.</div>}</div><div className="space-y-3 text-small"><div className="flex items-start gap-2"><FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><div className="min-w-0"><p className="truncate font-medium">{file.name}</p><p className="text-xs text-slate-500">{formatSize(file.size)} · Working Copy</p></div><button type="button" aria-label="Remove document" onClick={() => { setFile(null); setFields([]); setStatus(""); }} className="ml-auto text-slate-400"><X className="h-4 w-4" /></button></div><div className="rounded-lg bg-primary/10 p-3"><p className="font-semibold">Template detected</p><p className="mt-1 text-xs">Original Template is protected. AI can work only on the copy.</p></div><div><p className="mb-2 font-semibold">Detected fields</p>{fields.length ? fields.map((field) => <span key={field} className="mr-1 mb-1 inline-block rounded-full bg-slate-100 px-2 py-1 text-xs dark:bg-slate-700">{field}</span>) : <p className="text-xs text-slate-500">No confident fields detected yet.</p>}</div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => void analyze()} className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-small font-medium text-white"><Search className="h-4 w-4" /> Analyze template</button><a href={file.url} download={file.name} className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-small dark:border-slate-600"><Download className="h-4 w-4" /> Original</a></div><button type="button" onClick={() => onUseInRequest(`Use my uploaded format: ${file.name}. Keep the original formatting and fill only the detected fields.`)} className="w-full rounded-lg border border-primary px-3 py-2 text-small font-medium text-primary">Use in AI request</button>{status && <p className="text-xs text-slate-500" role="status">{status}</p>}{error && <p className="rounded-lg bg-danger/10 p-3 text-xs text-danger" role="alert">{error}</p>}</div></div>}
    {tab !== "Communication" && !file && <p className="mt-3 flex items-center gap-2 text-xs text-slate-400"><LoaderCircle className="h-3.5 w-3.5" /> Upload a source document to activate this workspace.</p>}
  </section>;
}