"use client";

import { useState } from "react";
import { Download, Eye, FileDown, Printer, Share2, X } from "lucide-react";
import { jsPDF } from "jspdf";

type PdfResult = {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  greeting: string;
  body: string;
  signature: string;
  recipientRole: string;
  category: string;
  channelMessages?: Record<string, string>;
};
type PdfProfile = {
  name: string;
  email: string;
  department: string;
  semester: string;
  university: string;
};
type Props = {
  result: PdfResult;
  channel: string;
  profile: PdfProfile;
  onActivity: (action: string) => void;
  onPrimary: () => void;
};

function safePart(value: string) {
  return value.trim().replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "").slice(0, 70) || "Communication";
}

function fileName(result: PdfResult, profile: PdfProfile, channel: string) {
  const subject = result.subject || (channel === "Formal Application" ? "College_Application" : `${channel}_Communication`);
  return `${safePart(subject)}_${safePart(profile.name || "Student")}.pdf`;
}

function linesFor(result: PdfResult, profile: PdfProfile, channel: string) {
  const date = new Date().toLocaleDateString();
  if (channel === "Formal Application") {
    return [
      `To: ${result.to || result.recipientRole || "[Recipient]"}`,
      `Recipient name: ${result.recipientRole || "[Recipient name]"}`,
      `Department: ${profile.department || "[Department]"}`,
      `Date: ${date}`,
      `Subject: ${result.subject || "[Subject]"}`,
      "",
      result.greeting,
      "",
      result.body,
      "",
      result.signature,
      "",
      `Student name: ${profile.name || "[Student name]"}`,
      `Course: ${profile.department || "[Course]"}`,
      `Branch: ${profile.department || "[Branch]"}`,
      `Year: ${profile.semester || "[Year]"}`,
      "Division: [Division]",
      "Roll number: [Roll number]",
      `College name: ${profile.university || "[College name]"}`,
      "",
      "Signature: ______________________________",
    ];
  }
  if (channel === "Email") {
    return [`To: ${result.to}`, `CC: ${result.cc}`, `BCC: ${result.bcc}`, `Subject: ${result.subject}`, "", result.greeting, "", result.body, "", result.signature];
  }
  if (channel === "WhatsApp" || channel === "SMS" || channel === "LinkedIn" || channel === "Teams") {
    return [`Recipient: ${result.to || result.recipientRole || "[Recipient]"}`, `Date: ${date}`, "", "Message:", result.channelMessages?.[channel] || `${result.body}\n\n${result.signature}`];
  }
  return [`Communication: ${channel}`, `Recipient: ${result.to || result.recipientRole || "[Recipient]"}`, `Date: ${date}`, "", result.body, "", result.signature];
}

function makePdf(result: PdfResult, profile: PdfProfile, channel: string) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 18;
  const maxWidth = pageWidth - margin * 2;
  let y = 22;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text(channel === "Formal Application" ? "FORMAL APPLICATION" : `${channel.toUpperCase()} COMMUNICATION`, margin, y);
  y += 10;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  for (const block of linesFor(result, profile, channel)) {
    const wrapped = pdf.splitTextToSize(block || " ", maxWidth) as string[];
    for (const line of wrapped) {
      if (y > pageHeight - 18) {
        pdf.addPage();
        y = 22;
      }
      pdf.text(line, margin, y);
      y += 6;
    }
    y += 1;
  }
  return pdf;
}

export function CommunicationPdfActions({ result, channel, profile, onActivity, onPrimary }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const makeBlob = () => makePdf(result, profile, channel).output("blob");
  function download() {
    const url = URL.createObjectURL(makeBlob());
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName(result, profile, channel);
    anchor.click();
    URL.revokeObjectURL(url);
    onActivity("PDF Downloaded");
  }
  function preview() {
    const url = URL.createObjectURL(makeBlob());
    setPreviewUrl(url);
    onActivity("PDF Previewed");
  }
  async function share() {
    const blob = makeBlob();
    const file = new File([blob], fileName(result, profile, channel), { type: "application/pdf" });
    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({ title: result.subject || `${channel} communication`, text: "Generated communication PDF", files: [file] });
        onActivity("PDF Shared");
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
    await navigator.clipboard?.writeText(linesFor(result, profile, channel).join("\n"));
    download();
    onActivity("PDF Share Fallback");
  }
  function print() {
    const url = URL.createObjectURL(makeBlob());
    const popup = window.open(url, "_blank", "noopener,noreferrer");
    if (popup) {
      popup.addEventListener("load", () => popup.print(), { once: true });
      onActivity("Printed");
    }
  }
  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2" data-print-hide>
        <button type="button" onClick={download} className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-small dark:border-slate-600"><Download className="h-4 w-4" /> Download PDF</button>
        <button type="button" onClick={preview} className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-small dark:border-slate-600"><Eye className="h-4 w-4" /> Preview PDF</button>
        <button type="button" onClick={() => void share()} className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-small dark:border-slate-600"><Share2 className="h-4 w-4" /> Share PDF</button>
        {channel === "Formal Application" && <button type="button" onClick={print} className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-small dark:border-slate-600"><Printer className="h-4 w-4" /> Print</button>}
        {(channel === "Email" || channel === "Formal Application") && <button type="button" onClick={onPrimary} className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-small font-medium text-white"><FileDown className="h-4 w-4" /> Open in Gmail</button>}
        {["WhatsApp", "Teams", "LinkedIn"].includes(channel) && <button type="button" onClick={onPrimary} className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-small font-medium text-white"><FileDown className="h-4 w-4" /> Open {channel}</button>}
      </div>
      {previewUrl && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-label="PDF preview"><div className="flex h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-white p-3"><div className="flex items-center justify-between pb-2"><strong>PDF Preview</strong><button type="button" aria-label="Close PDF preview" onClick={() => { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }}><X className="h-5 w-5" /></button></div><iframe title="PDF preview" src={previewUrl} className="min-h-0 flex-1 rounded border" /><div className="flex flex-wrap gap-2 pt-2"><button type="button" onClick={download} className="rounded-lg bg-primary px-3 py-2 text-small text-white">Download</button><button type="button" onClick={() => void share()} className="rounded-lg border px-3 py-2 text-small">Share</button><button type="button" onClick={print} className="rounded-lg border px-3 py-2 text-small">Print</button></div></div></div>}
    </>
  );
}
