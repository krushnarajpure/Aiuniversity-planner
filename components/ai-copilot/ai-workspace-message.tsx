"use client";

import { Check, Copy, RefreshCw, Sparkles, ThumbsDown, ThumbsUp, UserRound } from "lucide-react";
import type { CopilotResponse } from "@/lib/copilot";
import { StructuredResponse } from "./structured-response";

export type WorkspaceMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  response?: CopilotResponse;
  imageDataUrl?: string;
  imageName?: string;
  helpful?: boolean;
};

function MarkdownText({ content }: { content: string }) {
  return (
    <div className="space-y-3 whitespace-pre-wrap text-[15px] leading-7 text-slate-700 dark:text-slate-200">
      {content.split(/(```[\s\S]*?```)/g).map((part, index) =>
        part.startsWith("```") ? (
          <pre key={index} className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs leading-6 text-slate-100">
            <code>{part.replace(/^```\w*\n?/, "").replace(/```$/, "")}</code>
          </pre>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </div>
  );
}

export function AIWorkspaceMessage({
  message,
  copied,
  onCopy,
  onFeedback,
  onRegenerate,
}: {
  message: WorkspaceMessage;
  copied: boolean;
  onCopy: () => void;
  onFeedback: (helpful: boolean) => void;
  onRegenerate: () => void;
}) {
  const assistant = message.role === "assistant";
  return (
    <article className={`flex w-full gap-3 ${assistant ? "justify-start" : "justify-end"}`}>
      <div className={`flex min-w-0 gap-3 ${assistant ? "w-full" : "max-w-[76%] flex-row-reverse"}`}>
        <span className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${assistant ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
          {assistant ? <Sparkles className="h-3.5 w-3.5" /> : <UserRound className="h-3.5 w-3.5" />}
        </span>
        <div className={`min-w-0 ${assistant ? "w-full" : "max-w-full"}`}>
          <div className={assistant ? "" : "rounded-2xl rounded-tr-md bg-indigo-600 px-4 py-3 text-white shadow-sm"}>
            {message.imageDataUrl && (
              <img src={message.imageDataUrl} alt={message.imageName || "Attached image"} className="mb-3 max-h-56 max-w-full rounded-xl object-contain" />
            )}
            {assistant && message.response ? (
              message.response.type === "image" ? <><MarkdownText content={message.content} /><img src={message.response.imageUrl || ""} alt={message.response.prompt} className="mt-3 max-h-72 rounded-xl object-contain" /></> : <StructuredResponse response={message.response} onReadAloud={() => undefined} />
            ) : (
              <MarkdownText content={message.content} />
            )}
          </div>
          <div className={`mt-2 flex items-center gap-2 text-[11px] text-slate-400 ${assistant ? "" : "justify-end"}`}>
            <span>{message.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            {assistant && <>
              <button type="button" onClick={onCopy} aria-label="Copy response" title={copied ? "Copied" : "Copy response"} className="rounded p-1 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800">{copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}</button>
              <button type="button" onClick={onRegenerate} aria-label="Regenerate response" title="Regenerate response" className="rounded p-1 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"><RefreshCw className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => onFeedback(true)} aria-label="Helpful" title="Helpful" className="rounded p-1 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800"><ThumbsUp className={`h-3.5 w-3.5 ${message.helpful === true ? "text-emerald-500" : ""}`} /></button>
              <button type="button" onClick={() => onFeedback(false)} aria-label="Not helpful" title="Not helpful" className="rounded p-1 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800"><ThumbsDown className={`h-3.5 w-3.5 ${message.helpful === false ? "text-rose-500" : ""}`} /></button>
            </>}
          </div>
        </div>
      </div>
    </article>
  );
}
