"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, BriefcaseBusiness, Globe2, Menu, Plus, Search, Sparkles, X } from "lucide-react";
import type { CopilotInteractionMode, CopilotResponse } from "@/lib/copilot";
import { AIWorkspaceComposer } from "./ai-workspace-composer";
import { AIWorkspaceMessage, type WorkspaceMessage } from "./ai-workspace-message";
import { AIWorkspaceSidebar, type Conversation } from "./ai-workspace-sidebar";

type PersistedMessage = { id: string; role: "user" | "assistant"; content: string; createdAt: string };
type TimetableEntry = { courseName: string; courseCode: string; facultyName: string | null; day: string; startTime: string; endTime: string; room: string | null };

const modes: { id: CopilotInteractionMode; label: string; icon: typeof BookOpen; description: string }[] = [
  { id: "study", label: "Academic", icon: BookOpen, description: "Learn, revise, solve, and prepare." },
  { id: "placement", label: "Placement", icon: BriefcaseBusiness, description: "Prepare for interviews and your career." },
  { id: "general", label: "General", icon: Globe2, description: "Ask, create, plan, or explore anything." },
];

const suggestions: Record<CopilotInteractionMode, string[]> = {
  study: ["Explain a topic", "Create notes", "Prepare viva", "Revision plan", "Solve a question"],
  placement: ["Mock interview", "Resume review", "Practice aptitude", "HR questions", "Coding round"],
  general: ["Explain something", "Write", "Brainstorm", "Plan", "Ask anything"],
};

function parseResponse(value: unknown): CopilotResponse | undefined {
  if (!value || typeof value !== "object" || typeof (value as { type?: unknown }).type !== "string") return undefined;
  return value as CopilotResponse;
}

function toWorkspaceMessages(messages: PersistedMessage[]): WorkspaceMessage[] {
  return messages.map((message) => ({ ...message, createdAt: new Date(message.createdAt) }));
}

export function AIWorkspace({ userName }: { userName: string }) {
  const [messages, setMessages] = useState<WorkspaceMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState("new");
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<CopilotInteractionMode>("study");
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [detectedTimetable, setDetectedTimetable] = useState<TimetableEntry[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setVoiceSupported("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
    void fetch("/api/ai/chat")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setConversations(data?.conversations?.map((item: { id: string; title: string; updatedAt: string }) => ({ ...item, updatedAt: new Date(item.updatedAt) })) || []))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (messages.length) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "o") {
        event.preventDefault();
        newChat();
      }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  });

  useEffect(() => () => {
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
  }, []);

  function newChat() {
    setMessages([]);
    setActiveId("new");
    setInput("");
    setSelectedImage(null);
    setImageName("");
    setError("");
    setMobileOpen(false);
    window.setTimeout(() => composerRef.current?.focus(), 0);
  }

  async function loadConversation(conversation: Conversation) {
    setActiveId(conversation.id);
    setMobileOpen(false);
    setError("");
    const response = await fetch(`/api/ai/chat/${conversation.id}`);
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.messages) {
      setError("Could not load that conversation.");
      return;
    }
    setMessages(toWorkspaceMessages(data.messages));
  }

  async function deleteConversation(conversation: Conversation) {
    if (!window.confirm("Delete this conversation? This cannot be undone.")) return;
    const response = await fetch(`/api/ai/chat?id=${conversation.id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Could not delete that conversation.");
      return;
    }
    setConversations((current) => current.filter((item) => item.id !== conversation.id));
    if (activeId === conversation.id) newChat();
  }

  function selectImage(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Only image attachments are supported here.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("File is too large. Choose an image under 8 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(typeof reader.result === "string" ? reader.result : null);
      setImageName(file.name || "Pasted image");
    };
    reader.readAsDataURL(file);
  }

  function handlePaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
    const image = Array.from(event.clipboardData.items).find((item) => item.type.startsWith("image/"))?.getAsFile();
    if (!image) return;
    event.preventDefault();
    selectImage(image);
  }

  async function sendMessage(raw = input, history = messages, attachment = selectedImage) {
    const message = raw.trim();
    if ((!message && !attachment) || isLoading) return;
    const userMessage: WorkspaceMessage = { id: crypto.randomUUID(), role: "user", content: message || "Please analyze this image.", createdAt: new Date(), imageDataUrl: attachment || undefined, imageName: attachment ? imageName : undefined };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setSelectedImage(null);
    setImageName("");
    setError("");
    setIsLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const timetableImage = Boolean(attachment && (/timetable|schedule|lecture|college|class|समयावली|कॉलेज/i.test(message) || /analy[sz]e.*image/i.test(message)));
      if (timetableImage) {
        const response = await fetch("/api/ai/timetable", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "analyze", imageDataUrl: attachment, language: "English" }),
          signal: controller.signal,
        });
        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.success) throw new Error(data?.error || "Unable to analyze the timetable.");
        setDetectedTimetable(data.entries as TimetableEntry[]);
        setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: "Timetable detected. Review the extracted entries below.", createdAt: new Date() }]);
        return;
      }
      if (/\b(ppt|powerpoint|presentation|slide deck|slides)\b/i.test(message)) {
        const response = await fetch("/api/ai/ppt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: `${message}. Create a complete visual presentation with polished design and readable fonts.`, slideCount: 10, audience: "College Student", language: "English", tone: "Professional", style: "Creative" }),
          signal: controller.signal,
        });
        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.presentationId) throw new Error(data?.error || "I could not create the presentation.");
        setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: `Your presentation is ready. [Open the editable slide plan](/ai-tools/ppt-generator/plan/${data.presentationId})`, createdAt: new Date() }]);
        return;
      }
      const response = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: activeId === "new" ? undefined : activeId,
          interactionMode: mode,
          mode: mode === "placement" ? "career-mentor" : mode === "general" ? "doubt-solver" : "tutor",
          history: history.map(({ role, content }) => ({ role, content })),
          language: "Auto",
          imageDataUrl: attachment || undefined,
        }),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) throw new Error(data?.error || "Could not generate a response.");
      const reply = typeof data.reply === "string" ? data.reply : "I received an empty response. Please try again.";
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: reply, response: parseResponse(data.response), createdAt: new Date() }]);
      if (data.conversationId) {
        setActiveId(data.conversationId);
        setConversations((current) => [{ id: data.conversationId, title: current.find((item) => item.id === data.conversationId)?.title || userMessage.content.slice(0, 48), updatedAt: new Date() }, ...current.filter((item) => item.id !== data.conversationId)]);
      }
    } catch (caught) {
      if ((caught as Error).name !== "AbortError") setError(caught instanceof Error ? caught.message : "Could not generate a response.");
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }

  function regenerate() {
    const lastUser = [...messages].reverse().find((message) => message.role === "user");
    if (!lastUser) return;
    const index = messages.findIndex((message) => message.id === lastUser.id);
    setMessages(messages.slice(0, index));
    void sendMessage(lastUser.content, messages.slice(0, index), lastUser.imageDataUrl);
  }

  function copyMessage(message: WorkspaceMessage) {
    void navigator.clipboard.writeText(message.content);
    setCopied(message.id);
    window.setTimeout(() => setCopied(null), 1400);
  }

  function startVoice() {
    if (!voiceSupported || isListening) return;
    const speechWindow = window as Window & { SpeechRecognition?: new () => { lang: string; start: () => void; stop: () => void; onresult: (event: { results: { 0: { 0: { transcript: string } } } }) => void; onend: () => void; onerror: () => void }; webkitSpeechRecognition?: new () => { lang: string; start: () => void; stop: () => void; onresult: (event: { results: { 0: { 0: { transcript: string } } } }) => void; onend: () => void; onerror: () => void } };
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) return;
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.onresult = (event) => setInput((current) => `${current}${current ? " " : ""}${event.results[0][0].transcript}`);
    recognition.onend = () => { setIsListening(false); recognitionRef.current = null; };
    recognition.onerror = () => { setIsListening(false); recognitionRef.current = null; setError("Voice input is unavailable."); };
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }

  const currentMode = modes.find((item) => item.id === mode) || modes[0];
  const ModeIcon = currentMode.icon;

  return (
    <div className="flex h-[calc(100dvh-72px)] min-h-0 min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-950">
      <AIWorkspaceSidebar conversations={conversations} activeId={activeId} query={query} collapsed={collapsed} mobileOpen={mobileOpen} searchRef={searchRef} onQuery={setQuery} onNew={newChat} onLoad={loadConversation} onDelete={deleteConversation} onToggle={() => setCollapsed((value) => !value)} onCloseMobile={() => setMobileOpen(false)} />
      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open chat history" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-900"><Menu className="h-4 w-4" /></button>
            <Sparkles className="h-4 w-4 shrink-0 text-indigo-600" />
            <h1 className="truncate text-[17px] font-semibold text-slate-900 dark:text-white">AI Copilot</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900 sm:flex">
              {modes.map((item) => {
                const Icon = item.icon;
                return <button key={item.id} type="button" onClick={() => setMode(item.id)} aria-pressed={mode === item.id} className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition ${mode === item.id ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"}`}><Icon className="h-3.5 w-3.5" />{item.label}</button>;
              })}
            </div>
            <select value={mode} onChange={(event) => setMode(event.target.value as CopilotInteractionMode)} aria-label="AI mode" className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 sm:hidden">
              {modes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
            <button type="button" onClick={newChat} aria-label="New chat" title="New chat" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-900"><Plus className="h-4 w-4" /></button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto flex min-h-full w-full max-w-[920px] flex-col px-4 sm:px-6">
            {messages.length === 0 ? (
              <div className="flex min-h-full flex-col items-center justify-center py-8 text-center sm:py-12">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300"><ModeIcon className="h-5 w-5" /></div>
                <h2 className="text-[26px] font-semibold tracking-tight text-slate-900 dark:text-white sm:text-[30px]">What are we working on?</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{currentMode.description}</p>
                <div className="mt-7 flex max-w-[760px] flex-wrap justify-center gap-2">
                  {suggestions[mode].map((suggestion) => <button key={suggestion} type="button" onClick={() => { setInput(suggestion); window.setTimeout(() => composerRef.current?.focus(), 0); }} className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-300">{suggestion}</button>)}
                </div>
              </div>
            ) : (
              <div className="space-y-8 py-8">
                {messages.map((message) => <AIWorkspaceMessage key={message.id} message={message} copied={copied === message.id} onCopy={() => copyMessage(message)} onFeedback={(helpful) => setMessages((current) => current.map((item) => item.id === message.id ? { ...item, helpful } : item))} onRegenerate={regenerate} />)}
                {isLoading && <div className="flex items-center gap-2 text-sm text-slate-500"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white"><Sparkles className="h-3.5 w-3.5" /></span>Thinking<span className="animate-pulse">...</span></div>}
                {error && <div role="alert" className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"><span>{error}</span><button type="button" onClick={() => setError("")} aria-label="Dismiss error"><X className="h-4 w-4" /></button></div>}
                {detectedTimetable.length > 0 && <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-left dark:border-indigo-900/50 dark:bg-indigo-950/30"><div className="mb-2 flex items-center justify-between"><p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">Timetable detected</p><button type="button" onClick={() => setDetectedTimetable([])} aria-label="Close timetable preview"><X className="h-4 w-4 text-slate-400" /></button></div><div className="overflow-x-auto"><table className="w-full min-w-[560px] text-xs"><thead><tr className="text-left text-slate-500"><th className="px-2 py-1">Subject</th><th className="px-2 py-1">Day</th><th className="px-2 py-1">Time</th><th className="px-2 py-1">Room</th></tr></thead><tbody>{detectedTimetable.map((entry, index) => <tr key={`${entry.courseCode}-${index}`} className="border-t border-indigo-100 dark:border-indigo-900/40"><td className="px-2 py-1.5">{entry.courseName}</td><td className="px-2 py-1.5">{entry.day}</td><td className="px-2 py-1.5">{entry.startTime} - {entry.endTime}</td><td className="px-2 py-1.5">{entry.room || "Unclear"}</td></tr>)}</tbody></table></div></div>}
                <div ref={bottomRef} />
              </div>
            )}
          </div>
        </div>
        <AIWorkspaceComposer input={input} mode={mode} isLoading={isLoading} selectedImage={selectedImage} imageName={imageName} voiceSupported={voiceSupported} isListening={isListening} onInput={setInput} onSend={() => void sendMessage()} onStop={() => abortRef.current?.abort()} onVoice={startVoice} onImage={(event) => { const file = event.target.files?.[0]; if (file) selectImage(file); }} onPaste={handlePaste} onRemoveImage={() => { setSelectedImage(null); setImageName(""); }} textareaRef={composerRef} />
      </section>
    </div>
  );
}
