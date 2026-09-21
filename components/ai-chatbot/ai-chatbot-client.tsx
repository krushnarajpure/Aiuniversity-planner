"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, MessageCircle, Mic, Plus, Send, Sparkles, Square, Trash2, Volume2, X } from "lucide-react";
import { AIWorkspaceSidebar, type Conversation } from "@/components/ai-copilot/ai-workspace-sidebar";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
};

type VoiceState = "idle" | "listening" | "thinking" | "speaking";
type SpeechResult = { results: { 0: { 0: { transcript: string } } } };
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechResult) => void;
  onend: () => void;
  onerror: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function parseStoredMessages(value: Array<{ id: string; role: "user" | "assistant"; content: string; createdAt: string }>) {
  return value.map((message) => ({ ...message, createdAt: new Date(message.createdAt) }));
}

export function AIChatbotClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState("new");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [error, setError] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const lastVoiceTranscriptRef = useRef("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const speechWindow = window as Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor };
    setVoiceSupported(Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition));
    void fetch("/api/ai/chat")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setConversations(data?.conversations?.map((item: { id: string; title: string; updatedAt: string }) => ({ ...item, updatedAt: new Date(item.updatedAt) })) || []))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => () => {
    abortRef.current?.abort();
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
  }, []);

  function newChat() {
    abortRef.current?.abort();
    setMessages([]);
    setActiveId("new");
    setInput("");
    setError("");
    setVoiceState("idle");
    setMobileOpen(false);
    window.setTimeout(() => inputRef.current?.focus(), 0);
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
    setMessages(parseStoredMessages(data.messages));
  }

  async function deleteConversation(conversation: Conversation) {
    const response = await fetch(`/api/ai/chat?id=${conversation.id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Could not delete that conversation.");
      return;
    }
    setConversations((current) => current.filter((item) => item.id !== conversation.id));
    if (activeId === conversation.id) newChat();
  }

  function speak(text: string) {
    if (!window.speechSynthesis || !text.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = /[\u0900-\u097F]/.test(text) ? "hi-IN" : "en-IN";
    utterance.onend = () => setVoiceState("idle");
    utterance.onerror = () => setVoiceState("idle");
    setVoiceState("speaking");
    window.speechSynthesis.speak(utterance);
  }

  function startListening() {
    if (!voiceSupported || isLoading || voiceState === "listening") return;
    const speechWindow = window as Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor };
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) return;
    const recognition = new Recognition();
    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      if (!transcript || transcript === lastVoiceTranscriptRef.current) return;
      lastVoiceTranscriptRef.current = transcript;
      setInput((current) => `${current}${current ? " " : ""}${transcript}`);
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setVoiceState("idle");
    };
    recognition.onerror = () => {
      recognitionRef.current = null;
      setVoiceState("idle");
      setError("Microphone input is unavailable. Please check browser microphone permission.");
    };
    recognitionRef.current = recognition;
    setVoiceState("listening");
    recognition.start();
  }

  async function sendMessage() {
    const message = input.trim();
    if (!message || isLoading) return;
    setInput("");
    setError("");
    setIsLoading(true);
    setVoiceState("thinking");
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: message, createdAt: new Date() };
    const assistantId = crypto.randomUUID();
    setMessages((current) => [...current, userMessage]);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, conversationId: activeId === "new" ? undefined : activeId }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "The AI assistant is temporarily unavailable.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let reply = "";
      const addChunk = (chunk: string) => {
        reply += chunk;
        setMessages((current) => {
          const existing = current.some((item) => item.id === assistantId);
          return existing
            ? current.map((item) => item.id === assistantId ? { ...item, content: reply } : item)
            : [...current, { id: assistantId, role: "assistant", content: reply, createdAt: new Date() }];
        });
      };
      const processEvent = (event: string) => {
        const line = event.split("\n").find((item) => item.startsWith("data: "));
        if (!line) return;
        const data = JSON.parse(line.slice(6)) as { content?: string; done?: boolean; conversationId?: string };
        if (data.content) addChunk(data.content);
        if (data.done && data.conversationId) {
          setActiveId(data.conversationId);
          setConversations((current) => [{ id: data.conversationId!, title: current.find((item) => item.id === data.conversationId)?.title || message.slice(0, 60), updatedAt: new Date() }, ...current.filter((item) => item.id !== data.conversationId)]);
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";
        events.forEach(processEvent);
        if (done) break;
      }
      if (buffer.trim()) processEvent(buffer);
      if (reply) speak(reply);
      else setVoiceState("idle");
    } catch (caught) {
      if ((caught as Error).name !== "AbortError") {
        setError(caught instanceof Error ? caught.message : "The AI assistant could not respond.");
        setVoiceState("idle");
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }

  function stopGeneration() {
    abortRef.current?.abort();
    window.speechSynthesis?.cancel();
    setIsLoading(false);
    setVoiceState("idle");
  }

  function clearChat() {
    stopGeneration();
    setMessages([]);
    setActiveId("new");
    setError("");
  }

  const voiceLabel = voiceState === "listening" ? "Listening" : voiceState === "thinking" ? "Thinking" : voiceState === "speaking" ? "Speaking" : "Ready";

  return (
    <div className="flex h-[calc(100dvh-72px)] min-h-0 min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-950">
      <AIWorkspaceSidebar conversations={conversations} activeId={activeId} query="" collapsed={collapsed} mobileOpen={mobileOpen} searchRef={{ current: null }} onQuery={() => undefined} onNew={newChat} onLoad={loadConversation} onDelete={deleteConversation} onToggle={() => setCollapsed((value) => !value)} onCloseMobile={() => setMobileOpen(false)} brandName="Avishu" />
      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open chat history" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-900"><MessageCircle className="h-4 w-4" /></button>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white"><Sparkles className="h-4 w-4" /></span>
            <div className="min-w-0"><h1 className="truncate text-base font-semibold text-slate-900 dark:text-white">Avishu</h1><p className="text-[11px] text-slate-500 dark:text-slate-400">Your personal university voice assistant</p></div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold sm:flex ${voiceState === "idle" ? "border-slate-200 text-slate-500 dark:border-slate-800" : "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300"}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{voiceLabel}</span>
            <button type="button" onClick={newChat} title="New chat" aria-label="New chat" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-900"><Plus className="h-4 w-4" /></button>
            <button type="button" onClick={clearChat} title="Clear chat" aria-label="Clear chat" className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"><Trash2 className="h-4 w-4" /></button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col px-4 py-6 sm:px-8 sm:py-10">
            {!messages.length ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"><MessageCircle className="h-7 w-7" /></div>
                <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">How can I help today?</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">Ask about your courses, timetable, assignments, planning, writing, or anything you are working through.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-2"><button type="button" onClick={() => setInput("Create my study timetable for tomorrow.")} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">Create a study timetable</button><button type="button" onClick={() => setInput("Help me plan my assignments for this week.")} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">Plan my assignments</button></div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => <article key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] ${message.role === "user" ? "rounded-2xl rounded-tr-md bg-indigo-600 px-4 py-3 text-white" : "flex gap-3"}`}>{message.role === "assistant" && <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white"><Sparkles className="h-3.5 w-3.5" /></span>}<div><p className="whitespace-pre-wrap text-sm leading-7">{message.content}</p><div className={`mt-1 flex items-center gap-2 text-[10px] ${message.role === "user" ? "justify-end text-indigo-100" : "text-slate-400"}`}><span>{formatTime(message.createdAt)}</span>{message.role === "assistant" && <button type="button" onClick={() => speak(message.content)} aria-label="Read response aloud" title="Read response aloud" className="rounded p-1 hover:text-indigo-600"><Volume2 className="h-3.5 w-3.5" /></button>}</div></div></div></article>)}
                {isLoading && <div className="flex items-center gap-2 text-sm text-slate-500"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white"><LoaderCircle className="h-4 w-4 animate-spin" /></span>Thinking...</div>}
                {error && <div role="alert" className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"><span>{error}</span><button type="button" onClick={() => setError("")} aria-label="Dismiss error"><X className="h-4 w-4" /></button></div>}
                <div ref={bottomRef} />
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 bg-white/90 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-sm focus-within:border-indigo-300 dark:border-slate-800 dark:bg-slate-900">
              <textarea ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} placeholder="Message your AI assistant..." rows={1} className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100" />
              <button type="button" onClick={startListening} disabled={!voiceSupported || isLoading} aria-label={voiceState === "listening" ? "Listening" : "Use microphone"} title={voiceSupported ? "Use microphone" : "Voice input is not supported in this browser"} className={`rounded-xl p-2.5 transition ${voiceState === "listening" ? "bg-rose-100 text-rose-600 dark:bg-rose-950/40" : "text-slate-500 hover:bg-white hover:text-indigo-600 dark:hover:bg-slate-800"}`}><Mic className="h-4 w-4" /></button>
              {isLoading ? <button type="button" onClick={stopGeneration} aria-label="Stop generation" title="Stop generation" className="rounded-xl bg-rose-600 p-2.5 text-white transition hover:bg-rose-700"><Square className="h-4 w-4" /></button> : <button type="button" onClick={() => void sendMessage()} disabled={!input.trim()} aria-label="Send message" title="Send message" className="rounded-xl bg-indigo-600 p-2.5 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"><Send className="h-4 w-4" /></button>}
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-400">AI responses may contain mistakes. Review important information.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
