"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Brain, BriefcaseBusiness, Check, Clipboard, Copy, GraduationCap, Lightbulb, Mic, Paperclip, RefreshCw, Send, Sparkles, StopCircle, Target, ThumbsDown, ThumbsUp, Trash2, UserRound, X } from "lucide-react";
import type { CopilotContext, CopilotMode } from "@/lib/copilot";

type Message = { id: string; role: "user" | "assistant"; content: string; createdAt: Date; helpful?: boolean };
const modes: { id: CopilotMode; label: string; icon: typeof Brain }[] = [
  { id: "study-coach", label: "Study Coach", icon: GraduationCap }, { id: "tutor", label: "Tutor", icon: Brain }, { id: "academic-analyst", label: "Analyst", icon: Target }, { id: "exam-coach", label: "Exam Coach", icon: Clipboard }, { id: "career-mentor", label: "Career Mentor", icon: BriefcaseBusiness }, { id: "doubt-solver", label: "Doubt Solver", icon: Lightbulb }, { id: "productivity-coach", label: "Productivity", icon: Sparkles },
];
const actions = [
  ["Create Study Plan", "Make a practical study plan for today using my deadlines, exams, timetable, and available priorities."], ["Exam Preparation", "Prepare me for my next exam with a focused topic and revision plan."], ["Analyze My Performance", "Analyze my academic performance and tell me where to focus."], ["Find My Weak Subjects", "Identify my strongest, average, and weakest subjects from my available data."], ["Generate Quiz", "Generate a short mixed-difficulty quiz for my weakest subject, including answers and explanations."], ["Analyze Study Material", "Summarize and extract the most important topics from my available study material."], ["Create Revision Plan", "Create a 7-day revision plan around my upcoming exams and existing schedule."], ["Manage My Deadlines", "Help me prioritize my pending assignments and create a completion plan."], ["Explain a Topic", "Explain my weakest topic simply, then give an example and exam-ready notes."], ["Interview Preparation", "Help me prepare for a technical university interview using my courses and goals."], ["Career Guidance", "Suggest career directions and skills I can explore based on my academic context."], ["Daily Study Plan", "What should I study today? Give me a realistic daily plan."],
] as const;
const suggestions = ["Plan my study day", "Which subject should I study first?", "Prepare me for my next exam", "Analyze my academic performance", "Explain my weakest topic", "Create a 7-day revision plan"];

function formatDate(date: Date) { return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
function briefing(context: CopilotContext) {
  const assignment = context.assignments[0];
  const exam = context.exams[0];
  if (exam) return `Your ${exam.course} exam is on ${exam.date}. Give it your next focused block, then use your timetable to protect that revision time.`;
  if (assignment) return `Your next deadline is ${assignment.title} for ${assignment.course} on ${assignment.deadline}. Start with a ${Math.min(2, Math.max(1, assignment.estimatedHours))}-hour block today.`;
  return context.courses.length ? `You have ${context.courses.length} active course${context.courses.length === 1 ? "" : "s"}. Choose one clear subject goal for your next study block.` : "Add a course, assignment, or exam and I will turn it into a focused plan.";
}

export function CopilotClient({ context, userName }: { context: CopilotContext; userName: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<CopilotMode>("study-coach");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => { setVoiceSupported(typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  async function sendMessage(rawMessage = input, messageHistory = messages) {
    const message = rawMessage.trim();
    if (!message || isLoading) return;
    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content: message, createdAt: new Date() };
    const previous = messageHistory;
    setMessages((current) => [...current, userMessage]); setInput(""); setError(""); setIsLoading(true);
    const controller = new AbortController(); abortRef.current = controller;
    try {
      const response = await fetch("/api/ai/copilot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, mode, history: previous.map(({ role, content }) => ({ role, content })) }), signal: controller.signal });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "The AI could not answer right now.");
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: data.reply, createdAt: new Date() }]);
    } catch (caught) { if ((caught as Error).name !== "AbortError") setError(caught instanceof Error ? caught.message : "Something went wrong."); }
    finally { setIsLoading(false); abortRef.current = null; }
  }

  function regenerate() { const lastUserIndex = [...messages].map((message) => message.role).lastIndexOf("user"); const lastUser = lastUserIndex >= 0 ? messages[lastUserIndex] : null; if (lastUser) { const priorMessages = messages.slice(0, lastUserIndex); setMessages(priorMessages); void sendMessage(lastUser.content, priorMessages); } }
  function copyResponse(message: Message) { navigator.clipboard.writeText(message.content); setCopied(message.id); setTimeout(() => setCopied(null), 1400); }
  function startVoice() { if (!voiceSupported) return; const speechWindow = window as Window & { SpeechRecognition?: new () => { lang: string; start: () => void; onresult: (event: { results: { 0: { 0: { transcript: string } } } }) => void; onerror: () => void }; webkitSpeechRecognition?: new () => { lang: string; start: () => void; onresult: (event: { results: { 0: { 0: { transcript: string } } } }) => void; onerror: () => void } }; const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition; if (!SpeechRecognition) return; const recognition = new SpeechRecognition(); recognition.lang = "en-US"; recognition.onresult = (event) => setInput((value) => `${value}${value ? " " : ""}${event.results[0][0].transcript}`); recognition.onerror = () => setError("Voice input is unavailable right now."); recognition.start(); }

  return <div className="p-4 sm:p-6 lg:p-8">
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div><div className="mb-2 flex items-center gap-2 text-small font-medium text-primary"><Bot className="h-4 w-4" /> AI ACADEMIC ASSISTANT</div><h1 className="text-subheading font-semibold sm:text-heading">AI University Copilot</h1><p className="mt-2 max-w-2xl text-small text-slate-500 dark:text-slate-400">Your intelligent academic assistant for planning, learning, revision and university success.</p><p className="mt-4 text-body font-medium">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {userName} <span aria-hidden="true">👋</span></p></div>
        <button type="button" onClick={() => { setMessages([]); setError(""); }} className="flex items-center gap-2 self-start rounded-lg border border-slate-200 px-3 py-2 text-small font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"><Trash2 className="h-4 w-4" /> Clear conversation</button>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="min-w-0 space-y-4">
          <div className="card overflow-hidden p-0">
            <div className="flex gap-2 overflow-x-auto border-b border-slate-200 p-3 dark:border-slate-700">{modes.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setMode(id)} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-small font-medium transition ${mode === id ? "bg-primary/10 text-primary" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"}`}><Icon className="h-4 w-4" />{label}</button>)}</div>
            <div className="min-h-[430px] p-4 sm:p-6">
              {messages.length === 0 && !isLoading ? <div className="flex min-h-[370px] flex-col items-center justify-center text-center"><div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Sparkles className="h-7 w-7" /></div><h2 className="text-card-title font-semibold">How can I help you today?</h2><p className="mt-2 max-w-md text-small text-slate-500 dark:text-slate-400">Ask about your courses, deadlines, exams, study material, or the next best use of your time.</p><div className="mt-6 flex max-w-2xl flex-wrap justify-center gap-2">{suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => sendMessage(suggestion)} className="rounded-full border border-slate-200 px-3 py-2 text-small text-slate-600 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-300">{suggestion}</button>)}</div></div> : <div className="space-y-5">{messages.map((message) => <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`flex max-w-[88%] gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}><div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${message.role === "user" ? "bg-slate-100 text-slate-500 dark:bg-slate-700" : "bg-primary/10 text-primary"}`}>{message.role === "user" ? <UserRound className="h-4 w-4" /> : <Bot className="h-4 w-4" />}</div><div><div className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-small leading-6 ${message.role === "user" ? "rounded-tr-sm bg-primary text-white" : "rounded-tl-sm bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}>{message.content}</div><div className={`mt-2 flex items-center gap-2 text-xs text-slate-400 ${message.role === "user" ? "justify-end" : ""}`}><span>{formatDate(message.createdAt)}</span>{message.role === "assistant" && <><button type="button" aria-label="Copy response" title="Copy response" onClick={() => copyResponse(message)}>{copied === message.id ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}</button><button type="button" aria-label="Helpful" title="Helpful" onClick={() => setMessages((current) => current.map((item) => item.id === message.id ? { ...item, helpful: true } : item))}><ThumbsUp className={`h-3.5 w-3.5 ${message.helpful === true ? "text-success" : ""}`} /></button><button type="button" aria-label="Not helpful" title="Not helpful" onClick={() => setMessages((current) => current.map((item) => item.id === message.id ? { ...item, helpful: false } : item))}><ThumbsDown className={`h-3.5 w-3.5 ${message.helpful === false ? "text-danger" : ""}`} /></button><button type="button" aria-label="Continue response" title="Continue response" onClick={() => sendMessage("Continue your last answer with the next useful details.")}><RefreshCw className="h-3.5 w-3.5" /></button></>}</div></div></div></motion.div>)}{isLoading && <div className="flex items-center gap-3 text-small text-slate-500"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Bot className="h-4 w-4" /></div><span className="flex gap-1" aria-label="AI is typing"><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:150ms]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:300ms]" /></span></div>}<div ref={bottomRef} /></div>}
            </div>
            {error && <div role="alert" className="mx-4 mb-3 flex items-center justify-between rounded-lg bg-danger/10 px-3 py-2 text-small text-danger"><span>{error}</span><button type="button" aria-label="Dismiss error" onClick={() => setError("")}><X className="h-4 w-4" /></button></div>}
            <div className="border-t border-slate-200 p-3 dark:border-slate-700"><div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 focus-within:border-primary dark:border-slate-700 dark:bg-slate-900"><Paperclip className="mb-2 ml-1 h-4 w-4 text-slate-400" /><textarea ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} rows={1} placeholder="Ask your Copilot anything..." aria-label="Message AI Copilot" className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-small outline-none placeholder:text-slate-400" /><button type="button" onClick={startVoice} disabled={!voiceSupported} aria-label={voiceSupported ? "Use voice input" : "Voice input unavailable"} title={voiceSupported ? "Use voice input" : "Voice input unavailable"} className="mb-1 rounded-lg p-2 text-slate-400 transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"><Mic className="h-4 w-4" /></button>{isLoading ? <button type="button" onClick={() => abortRef.current?.abort()} aria-label="Stop generation" title="Stop generation" className="mb-1 rounded-lg bg-danger p-2 text-white"><StopCircle className="h-4 w-4" /></button> : <button type="button" onClick={() => sendMessage()} disabled={!input.trim()} aria-label="Send message" title="Send message" className="mb-1 rounded-lg bg-primary p-2 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"><Send className="h-4 w-4" /></button>}</div><p className="mt-2 px-2 text-xs text-slate-400">Enter to send, Shift + Enter for a new line</p></div>
          </div>
        </section>
        <aside className="space-y-4">
          <div className="card"><div className="mb-4 flex items-center gap-2"><div className="rounded-lg bg-warning/10 p-2 text-warning"><Target className="h-4 w-4" /></div><div><h2 className="text-card-title font-semibold">Today&apos;s Academic Briefing</h2><p className="text-xs text-slate-400">Personalized from your planner</p></div></div><p className="text-small leading-6 text-slate-600 dark:text-slate-300">{briefing(context)}</p><div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-700"><strong className="block text-body text-slate-800 dark:text-slate-100">{context.courses.length}</strong>courses</div><div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-700"><strong className="block text-body text-slate-800 dark:text-slate-100">{context.assignments.length}</strong>tasks</div><div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-700"><strong className="block text-body text-slate-800 dark:text-slate-100">{context.exams.length}</strong>exams</div></div></div>
          <div className="card"><div className="mb-4 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><h2 className="text-card-title font-semibold">Quick AI Actions</h2></div><div className="grid grid-cols-2 gap-2">{actions.map(([label, prompt]) => <button key={label} type="button" onClick={() => sendMessage(prompt)} className="rounded-lg bg-slate-100 p-3 text-left text-xs font-medium text-slate-600 transition hover:bg-primary/10 hover:text-primary dark:bg-slate-700 dark:text-slate-300">{label}</button>)}</div></div>
        </aside>
      </div>
    </div>
  </div>;
}
