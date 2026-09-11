"use client";

import { ArrowUp, ImagePlus, Mic, Paperclip, Square, X } from "lucide-react";
import type { RefObject } from "react";

export function AIWorkspaceComposer({
  input,
  mode,
  isLoading,
  selectedImage,
  imageName,
  voiceSupported,
  isListening,
  onInput,
  onSend,
  onStop,
  onVoice,
  onImage,
  onPaste,
  onRemoveImage,
  textareaRef,
}: {
  input: string;
  mode: "study" | "placement" | "general";
  isLoading: boolean;
  selectedImage: string | null;
  imageName: string;
  voiceSupported: boolean;
  isListening: boolean;
  onInput: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  onVoice: () => void;
  onImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPaste: (event: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onRemoveImage: () => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}) {
  const placeholder = mode === "study" ? "Ask about your studies..." : mode === "placement" ? "Ask about your career..." : "Ask anything...";
  return (
    <div className="shrink-0 bg-gradient-to-t from-slate-50 via-slate-50/98 to-transparent px-3 pb-3 pt-4 dark:from-slate-950 dark:via-slate-950/98 sm:px-6 sm:pb-4">
      <div className="mx-auto max-w-[840px]">
        <div className="overflow-hidden rounded-[20px] border border-slate-300 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.08)] transition focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20">
          {selectedImage && (
            <div className="flex gap-2 overflow-x-auto border-b border-slate-100 px-3 pb-2 pt-3 dark:border-slate-800">
              <div className="relative shrink-0">
                <img src={selectedImage} alt={imageName || "Attachment preview"} className="h-16 w-16 rounded-lg object-cover" />
                <button type="button" onClick={onRemoveImage} aria-label="Remove image" className="absolute -right-1.5 -top-1.5 rounded-full bg-slate-900 p-0.5 text-white"><X className="h-3 w-3" /></button>
              </div>
              <span className="self-center truncate text-xs text-slate-500">{imageName || "Image attached"}</span>
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => onInput(event.target.value)}
            onPaste={onPaste}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
            rows={2}
            placeholder={selectedImage ? "Ask about this image..." : placeholder}
            aria-label="Message AI Copilot"
            className="block max-h-48 min-h-[52px] w-full resize-none bg-transparent px-4 pt-3 text-[15px] leading-6 text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
          />
          <div className="flex items-center justify-between gap-2 px-3 pb-2.5">
            <div className="flex items-center gap-1">
              <label htmlFor="workspace-image" title="Attach image" className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800">
                <ImagePlus className="h-4 w-4" />
                <span className="sr-only">Attach image</span>
              </label>
              <input id="workspace-image" type="file" accept="image/*" onChange={onImage} className="sr-only" />
              <button type="button" title="Attach files" aria-label="Attach files" onClick={() => document.getElementById("workspace-image")?.click()} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"><Paperclip className="h-4 w-4" /></button>
              <span className="ml-2 hidden text-xs font-medium text-slate-400 sm:inline">{mode === "study" ? "Academic" : mode === "placement" ? "Placement" : "General"}</span>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={onVoice} disabled={!voiceSupported} aria-label="Voice input" title={isListening ? "Listening" : "Voice input"} className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${isListening ? "bg-rose-100 text-rose-600" : "text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"}`}><Mic className="h-4 w-4" /></button>
              {isLoading ? <button type="button" onClick={onStop} aria-label="Stop generation" title="Stop generation" className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500 text-white"><Square className="h-3.5 w-3.5 fill-current" /></button> : <button type="button" onClick={onSend} disabled={!input.trim() && !selectedImage} aria-label="Send message" title="Send message" className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800"><ArrowUp className="h-4 w-4" /></button>}
            </div>
          </div>
        </div>
        <p className="pt-2 text-center text-[11px] text-slate-500 dark:text-slate-400">AI may make mistakes. Check important information.</p>
      </div>
    </div>
  );
}
