"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Check, Clock3, RotateCcw, Volume2 } from "lucide-react";
import type { CopilotResponse } from "@/lib/copilot";

const priorityClass = { HIGH: "text-danger", MEDIUM: "text-warning", LOW: "text-success" };

function FocusSession({ response }: { response: Extract<CopilotResponse, { type: "focus_session" }> }) {
    const [remaining, setRemaining] = useState(response.duration * 60);
    const [running, setRunning] = useState(false);
    useEffect(() => { if (!running || remaining <= 0) return; const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000); return () => window.clearInterval(timer); }, [running, remaining]);
    const minutes = Math.floor(remaining / 60).toString().padStart(2, "0");
    const seconds = (remaining % 60).toString().padStart(2, "0");
    return <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-4"><div className="flex items-center justify-between"><div><p className="font-semibold">{response.subject}</p><p className="text-small text-slate-500 dark:text-slate-400">{response.topic}</p></div><Clock3 className="h-5 w-5 text-primary" /></div><p className="my-4 text-center text-3xl font-semibold tabular-nums text-primary">{minutes}:{seconds}</p><div className="flex gap-2"><button type="button" onClick={() => setRunning((value) => !value)} className="rounded-lg bg-primary px-3 py-2 text-small font-medium text-white">{remaining === 0 ? "Completed" : running ? "Pause" : "Start Session"}</button><button type="button" onClick={() => { setRemaining(response.duration * 60); setRunning(false); }} aria-label="Reset focus session" title="Reset focus session" className="rounded-lg border border-slate-200 p-2 dark:border-slate-700"><RotateCcw className="h-4 w-4" /></button></div></div>;
}

function Quiz({ response }: { response: Extract<CopilotResponse, { type: "quiz" }> }) {
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const score = response.questions.reduce((total, question, index) => total + (answers[index] === question.answer ? 1 : 0), 0);
    return <div className="mt-3 space-y-3">{response.questions.map((question, index) => <div key={`${question.question}-${index}`} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"><p className="font-medium">{index + 1}. {question.question}</p><div className="mt-3 grid gap-2">{question.options.map((option) => <button key={option} type="button" onClick={() => setAnswers((current) => ({ ...current, [index]: option }))} className={`rounded-lg border p-2 text-left text-small ${answers[index] === option ? option === question.answer ? "border-success bg-success/10" : "border-danger bg-danger/10" : "border-slate-200 dark:border-slate-700"}`}>{option}</button>)}</div>{answers[index] && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{question.explanation}</p>}</div>)}{response.questions.length > 0 && <p className="text-small font-medium text-primary">Score: {score}/{response.questions.length}</p>}</div>;
}

function Flashcards({ response }: { response: Extract<CopilotResponse, { type: "flashcards" }> }) {
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const card = response.cards[index];
    if (!card) return null;
    return <div className="mt-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700"><button type="button" onClick={() => setFlipped((value) => !value)} className="min-h-28 w-full rounded-lg bg-slate-100 p-5 text-center dark:bg-slate-800"><p className="text-xs font-medium uppercase text-primary">{flipped ? "Answer" : "Question"}</p><p className="mt-2 font-medium">{flipped ? card.answer : card.question}</p></button><div className="mt-3 flex items-center justify-between text-small text-slate-500"><button type="button" disabled={index === 0} onClick={() => { setIndex((value) => value - 1); setFlipped(false); }} className="disabled:opacity-40">Previous</button><span>{index + 1} / {response.cards.length}</span><button type="button" disabled={index === response.cards.length - 1} onClick={() => { setIndex((value) => value + 1); setFlipped(false); }} className="disabled:opacity-40">Next</button></div></div>;
}

export function StructuredResponse({ response, onReadAloud }: { response: CopilotResponse; onReadAloud?: (text: string) => void }) {
    return <div className="space-y-2">{response.title && <h3 className="font-semibold">{response.title}</h3>}<p>{response.message}</p>{response.type === "text" && response.bullets && <ul className="list-disc space-y-1 pl-5">{response.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}{response.type === "study_plan" && <div className="mt-3 space-y-2">{response.sessions.map((session) => <div key={`${session.time}-${session.subject}`} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"><div className="flex items-center justify-between text-small"><span className="flex items-center gap-1 text-primary"><Clock3 className="h-3.5 w-3.5" />{session.time}</span><span className={priorityClass[session.priority]}>{session.priority}</span></div><p className="mt-1 font-medium">{session.subject} | {session.topic}</p><p className="text-xs text-slate-500">{session.duration} min | {session.studyType}</p></div>)}</div>}{response.type === "weekly_timetable" && <div className="mt-3 overflow-x-auto"><div className="min-w-[620px] space-y-2">{response.sessions.map((session) => <div key={`${session.day}-${session.time}-${session.subject}`} className="grid grid-cols-[90px_90px_1fr_70px] gap-2 rounded-lg border border-slate-200 p-3 text-small dark:border-slate-700"><span className="flex items-center gap-1 text-primary"><CalendarDays className="h-3.5 w-3.5" />{session.day}</span><span>{session.time}</span><span><strong>{session.subject}</strong><br /><span className="text-xs text-slate-500">{session.topic} | {session.studyType}</span></span><span className={priorityClass[session.priority]}>{session.duration}m</span></div>)}</div></div>}{response.type === "quiz" && <Quiz response={response} />}{response.type === "flashcards" && <Flashcards response={response} />}{response.type === "focus_session" && <FocusSession response={response} />}{response.type === "image" && <div className="rounded-lg bg-warning/10 p-3 text-small">{response.message}</div>}{onReadAloud && <button type="button" onClick={() => onReadAloud(response.message)} className="mt-2 flex items-center gap-1 text-xs text-primary"><Volume2 className="h-3.5 w-3.5" /> Read aloud</button>}</div>;
}
