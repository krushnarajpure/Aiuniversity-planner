"use client";

import type { CopilotResponse } from "@/lib/copilot";

type TextResponse = Extract<CopilotResponse, { type: "text" }>;

function inlineMarkdown(text: string) {
    return text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^\)]+\))/g).filter(Boolean).map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
        if (part.startsWith("`") && part.endsWith("`")) return <code key={index} className="rounded bg-slate-200 px-1 py-0.5 text-xs dark:bg-slate-700">{part.slice(1, -1)}</code>;
        const link = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
        if (link) return <a key={index} href={link[2]} target="_blank" rel="noreferrer" className="text-primary underline">{link[1]}</a>;
        return <span key={index}>{part}</span>;
    });
}

function MarkdownBlocks({ text }: { text: string }) {
    const blocks = text.replace(/\r/g, "").split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
    return <div className="space-y-4">{blocks.map((block, blockIndex) => {
        const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
        if (lines.every((line) => /^[-*•]\s+/.test(line))) return <ul key={blockIndex} className="list-disc space-y-1 pl-5">{lines.map((line) => <li key={line}>{inlineMarkdown(line.replace(/^[-*•]\s+/, ""))}</li>)}</ul>;
        if (lines.every((line) => /^\d+[.)]\s+/.test(line))) return <ol key={blockIndex} className="space-y-2">{lines.map((line, index) => <li key={line} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{String(index + 1).padStart(2, "0")}</span><span>{inlineMarkdown(line.replace(/^\d+[.)]\s+/, ""))}</span></li>)}</ol>;
        if (lines[0].startsWith(">")) return <blockquote key={blockIndex} className="border-l-2 border-primary/50 bg-primary/5 px-4 py-3 text-small italic">{inlineMarkdown(lines.map((line) => line.replace(/^>\s?/, "")).join(" "))}</blockquote>;
        if (lines[0].startsWith("```")) return <pre key={blockIndex} className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100"><code>{lines.slice(1, -1).join("\n")}</code></pre>;
        if (lines.length === 1 && /^#{2,3}\s+/.test(lines[0])) return <h4 key={blockIndex} className="font-semibold text-primary">{inlineMarkdown(lines[0].replace(/^#{2,3}\s+/, ""))}</h4>;
        const paragraph = lines.join(" ");
        if (paragraph.length <= 260) return <p key={blockIndex}>{inlineMarkdown(paragraph)}</p>;
        const sentences = paragraph.match(/[^.!?]+[.!?]+/g) ?? [paragraph];
        const chunks: string[] = []; let current = "";
        sentences.forEach((sentence) => { if (current.length + sentence.length > 220 && current) { chunks.push(current.trim()); current = ""; } current += sentence; });
        if (current.trim()) chunks.push(current.trim());
        return <div key={blockIndex} className="space-y-2">{chunks.map((chunk) => <p key={chunk}>{inlineMarkdown(chunk)}</p>)}</div>;
    })}</div>;
}

export function AITextResponse({ response }: { response: TextResponse }) {
    return <div className="space-y-4"><MarkdownBlocks text={response.message} />{response.bullets && <section><h4 className="mb-2 font-semibold">Important Points</h4><ul className="list-disc space-y-1 pl-5">{response.bullets.map((bullet) => <li key={bullet}>{inlineMarkdown(bullet)}</li>)}</ul></section>}{response.sections?.map((section) => <section key={section.heading} className={`rounded-xl p-4 ${section.kind === "example" ? "border-l-2 border-primary bg-primary/5" : section.kind === "warning" ? "border-l-2 border-warning bg-warning/10" : section.kind === "recommendation" ? "border border-primary/20 bg-primary/5" : "bg-slate-50 dark:bg-slate-900/50"}`}><h4 className="mb-2 font-semibold">{section.heading}</h4>{section.body && <MarkdownBlocks text={section.body} />}{section.bullets && <ul className="mt-2 list-disc space-y-1 pl-5">{section.bullets.map((bullet) => <li key={bullet}>{inlineMarkdown(bullet)}</li>)}</ul>}</section>)}{response.recommendation && <section className="rounded-xl border border-primary/20 bg-primary/5 p-4"><h4 className="font-semibold">AI Recommendation</h4><p className="mt-1">{inlineMarkdown(response.recommendation)}</p></section>}</div>;
}
