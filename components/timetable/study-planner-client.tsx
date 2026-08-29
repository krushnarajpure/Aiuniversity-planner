"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, CheckCircle2, Clock3, Edit3, Flag, Plus, Trash2 } from "lucide-react";
import type { Timetable } from "@prisma/client";
import { toast } from "sonner";
import { createTimetable, deleteTimetable, getTimetables } from "@/actions/timetable";
import { markSessionComplete } from "@/actions/timetable-enhanced";
import { TimetableSessionModal } from "./timetable-session-modal";

type Course = { id: string; courseName: string };
type QuickSession = { subjectName: string; topic: string; date: string; startTime: string; duration: string; priority: "LOW" | "MEDIUM" | "HIGH" };

function toDateInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function minutes(time: string) {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

function endTime(startTime: string, duration: string) {
  const end = minutes(startTime) + Number(duration || 0);
  return `${String(Math.floor(end / 60) % 24).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
}

function durationInHours(session: Timetable) {
  return Math.max(0, (minutes(session.endTime) - minutes(session.startTime)) / 60);
}

function isSameDay(first: Date, second: Date) {
  return first.toDateString() === second.toDateString();
}

function statusFor(session: Timetable, now: Date) {
  if (session.status === "COMPLETED") return "completed";
  if (session.status === "MISSED") return "missed";
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  if (isSameDay(session.date, now) && minutes(session.startTime) <= currentMinutes && minutes(session.endTime) > currentMinutes) return "ongoing";
  return "upcoming";
}

function labelForStatus(status: string) {
  return status === "ongoing" ? "In progress" : status.charAt(0).toUpperCase() + status.slice(1);
}

export function StudyPlannerClient({ courses }: { courses: Course[] }) {
  const [sessions, setSessions] = useState<Timetable[]>([]);
  const [quickSession, setQuickSession] = useState<QuickSession>({ subjectName: "", topic: "", date: toDateInput(new Date()), startTime: "09:00", duration: "60", priority: "MEDIUM" });
  const [editingSession, setEditingSession] = useState<Timetable | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const now = new Date();

  async function loadSessions() {
    try { setSessions(await getTimetables()); } catch { toast.error("Could not load your study sessions."); } finally { setLoading(false); }
  }

  useEffect(() => { void loadSessions(); }, []);

  const todaySessions = useMemo(() => sessions.filter((session) => isSameDay(session.date, now) && !session.isBreak).sort((a, b) => a.startTime.localeCompare(b.startTime)), [sessions, now]);
  const weekStart = useMemo(() => { const date = new Date(now); date.setDate(date.getDate() - date.getDay()); date.setHours(0, 0, 0, 0); return date; }, [now]);
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7);
  const weekSessions = useMemo(() => sessions.filter((session) => session.date >= weekStart && session.date < weekEnd && !session.isBreak), [sessions, weekStart, weekEnd]);
  const plannedToday = todaySessions.reduce((total, session) => total + durationInHours(session), 0);
  const completedToday = todaySessions.filter((session) => session.status === "COMPLETED").reduce((total, session) => total + durationInHours(session), 0);
  const completedWeek = weekSessions.filter((session) => session.status === "COMPLETED").length;
  const weeklyPercent = weekSessions.length ? Math.round((completedWeek / weekSessions.length) * 100) : 0;
  const weekHours = Array.from({ length: 7 }, (_, index) => { const date = new Date(weekStart); date.setDate(date.getDate() + index); return { date, hours: weekSessions.filter((session) => isSameDay(session.date, date)).reduce((total, session) => total + durationInHours(session), 0) }; });
  const maxWeekHours = Math.max(...weekHours.map((day) => day.hours), 1);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const upcoming = sessions.filter((session) => !session.isBreak && (session.date > now || (isSameDay(session.date, now) && minutes(session.startTime) >= currentMinutes))).sort((a, b) => a.date.getTime() - b.date.getTime() || a.startTime.localeCompare(b.startTime)).slice(0, 5);

  async function addQuickSession(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!quickSession.subjectName) { toast.error("Select a subject first."); return; }
    setSaving(true);
    const formData = new FormData();
    formData.set("subjectName", quickSession.subjectName); formData.set("date", quickSession.date); formData.set("startTime", quickSession.startTime); formData.set("endTime", endTime(quickSession.startTime, quickSession.duration)); formData.set("sessionType", "LECTURE"); formData.set("priority", quickSession.priority); formData.set("totalLectures", "1"); formData.set("completedLectures", "0"); formData.set("pendingWork", quickSession.topic); formData.set("notes", quickSession.topic); formData.set("status", "PENDING"); formData.set("isBreak", "false");
    try { const result = await createTimetable({ success: false, message: "" }, formData); if (!result.success) throw new Error(result.message); toast.success("Study session added."); setQuickSession({ subjectName: quickSession.subjectName, topic: "", date: toDateInput(new Date()), startTime: "09:00", duration: "60", priority: "MEDIUM" }); await loadSessions(); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not add session."); } finally { setSaving(false); }
  }

  async function completeSession(session: Timetable) {
    try { await markSessionComplete(session.id, true); toast.success("Session completed."); await loadSessions(); } catch { toast.error("Could not update this session."); }
  }

  async function removeSession(session: Timetable) {
    if (!window.confirm(`Delete ${session.subjectName} session?`)) return;
    try { await deleteTimetable(session.id); toast.success("Session deleted."); await loadSessions(); } catch { toast.error("Could not delete this session."); }
  }

  if (loading) return <div className="py-16 text-center text-small text-slate-500">Loading your study plan...</div>;

  return <div className="space-y-6 pb-8">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-small font-medium text-primary">STUDY PLANNER</p><h1 className="mt-1 text-heading font-semibold">Study Planner</h1><p className="mt-2 text-small text-slate-500 dark:text-slate-400">Plan your studies. Stay on track.</p></div><button type="button" onClick={() => { setEditingSession(null); setModalOpen(true); }} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-small font-semibold text-white"><Plus className="h-4 w-4" /> Add session</button></header>
    <section className="grid gap-4 sm:grid-cols-3"><div className="card"><div className="flex items-center justify-between"><p className="text-small text-slate-500">Today</p><CalendarDays className="h-4 w-4 text-primary" /></div><p className="mt-3 text-card-title font-semibold">{now.toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}</p></div><Metric label="Hours planned" value={`${plannedToday.toFixed(1)}h`} icon={<Clock3 className="h-4 w-4 text-primary" />} /><Metric label="Completed" value={`${completedToday.toFixed(1)}h`} icon={<CheckCircle2 className="h-4 w-4 text-success" />} /></section>
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]"><div className="card"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-card-title font-semibold">Today&apos;s schedule</h2><p className="mt-1 text-small text-slate-500">{todaySessions.length} study session{todaySessions.length === 1 ? "" : "s"}</p></div><span className="text-small font-medium text-primary">{plannedToday.toFixed(1)}h total</span></div>{todaySessions.length ? <div className="space-y-3">{todaySessions.map((session) => <SessionRow key={session.id} session={session} status={statusFor(session, now)} onComplete={() => void completeSession(session)} onEdit={() => { setEditingSession(session); setModalOpen(true); }} onDelete={() => void removeSession(session)} />)}</div> : <EmptySchedule onAdd={() => { setEditingSession(null); setModalOpen(true); }} />}</div><QuickAddForm value={quickSession} saving={saving} courses={courses} onChange={setQuickSession} onSubmit={addQuickSession} /></section>
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]"><div className="card"><div className="mb-6 flex items-center justify-between"><div><h2 className="text-card-title font-semibold">Weekly overview</h2><p className="mt-1 text-small text-slate-500">Planned hours by day</p></div><span className="text-small text-slate-500">{weekSessions.reduce((total, session) => total + durationInHours(session), 0).toFixed(1)}h planned</span></div><div className="grid grid-cols-7 items-end gap-2 sm:gap-4">{weekHours.map((day) => <div key={day.date.toISOString()} className="text-center"><div className="flex h-32 items-end justify-center"><div className={`w-full max-w-10 rounded-t-md ${isSameDay(day.date, now) ? "bg-primary" : "bg-primary/20 dark:bg-primary/30"}`} style={{ height: `${Math.max(day.hours ? 12 : 4, (day.hours / maxWeekHours) * 100)}%` }} /></div><p className={`mt-2 text-xs font-medium ${isSameDay(day.date, now) ? "text-primary" : "text-slate-500"}`}>{day.date.toLocaleDateString("en", { weekday: "short" }).slice(0, 2)}</p><p className="mt-1 text-xs text-slate-400">{day.hours.toFixed(1)}h</p></div>)}</div></div><ProgressCard percent={weeklyPercent} completed={completedWeek} total={weekSessions.length} /></section>
    <section className="card"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-card-title font-semibold">Upcoming study tasks</h2><p className="mt-1 text-small text-slate-500">Your next important sessions</p></div><Flag className="h-5 w-5 text-primary" /></div>{upcoming.length ? <div className="grid gap-3 md:grid-cols-2">{upcoming.map((session) => <button type="button" key={session.id} onClick={() => { setEditingSession(session); setModalOpen(true); }} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-left hover:border-primary/50 dark:border-slate-700"><span className="min-w-0"><strong className="block truncate text-small">{session.subjectName}</strong><span className="mt-1 block truncate text-xs text-slate-500">{session.pendingWork || session.notes || session.sessionType.replace(/_/g, " ")}</span><span className="mt-1 block text-xs text-slate-400">{session.date.toLocaleDateString("en", { month: "short", day: "numeric" })} · {session.startTime}</span></span><Priority value={session.priority} /></button>)}</div> : <p className="text-small text-slate-500">No upcoming sessions. Add one above to plan your next block.</p>}</section>
    <TimetableSessionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} session={editingSession} onSuccess={() => void loadSessions()} courses={courses} />
  </div>;
}

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) { return <div className="card"><div className="flex items-center justify-between"><p className="text-small text-slate-500">{label}</p>{icon}</div><p className="mt-3 text-2xl font-semibold">{value}</p></div>; }
function SessionRow({ session, status, onComplete, onEdit, onDelete }: { session: Timetable; status: string; onComplete: () => void; onEdit: () => void; onDelete: () => void }) { return <div className={`flex gap-3 rounded-lg border p-3 ${status === "completed" ? "border-success/30 bg-success/5" : status === "ongoing" ? "border-primary/40 bg-primary/5" : "border-slate-200 dark:border-slate-700"}`}><div className="w-16 shrink-0 pt-1 text-xs font-semibold text-slate-500">{session.startTime}<span className="block mt-1 font-normal text-slate-400">{session.endTime}</span></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-small font-semibold">{session.subjectName}</h3><Status value={status} /></div><p className="mt-1 truncate text-xs text-slate-500">{session.pendingWork || session.notes || session.sessionType.replace(/_/g, " ")}</p><p className="mt-1 text-xs text-slate-400">{durationInHours(session).toFixed(1)}h · {session.priority.toLowerCase()} priority</p></div><div className="flex shrink-0 items-start gap-1"><button type="button" aria-label="Edit session" title="Edit session" onClick={onEdit} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800"><Edit3 className="h-4 w-4" /></button><button type="button" aria-label="Delete session" title="Delete session" onClick={onDelete} className="rounded p-1.5 text-slate-400 hover:bg-danger/10 hover:text-danger"><Trash2 className="h-4 w-4" /></button>{status !== "completed" && <button type="button" aria-label="Mark session complete" title="Mark session complete" onClick={onComplete} className="rounded p-1.5 text-slate-400 hover:bg-success/10 hover:text-success"><Check className="h-4 w-4" /></button>}</div></div>; }
function Status({ value }: { value: string }) { return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${value === "completed" ? "bg-success/10 text-success" : value === "ongoing" ? "bg-primary/10 text-primary" : value === "missed" ? "bg-danger/10 text-danger" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}>{labelForStatus(value)}</span>; }
function Priority({ value }: { value: string }) { return <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-medium ${value === "HIGH" ? "bg-danger/10 text-danger" : value === "MEDIUM" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"}`}>{value.toLowerCase()}</span>; }
function EmptySchedule({ onAdd }: { onAdd: () => void }) { return <div className="rounded-lg border border-dashed border-slate-300 py-10 text-center dark:border-slate-700"><Clock3 className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-small font-medium">No study sessions today</p><button type="button" onClick={onAdd} className="mt-3 text-small font-medium text-primary hover:underline">Add your first session</button></div>; }
function ProgressCard({ percent, completed, total }: { percent: number; completed: number; total: number }) { return <div className="card"><div className="flex items-center justify-between"><div><h2 className="text-card-title font-semibold">Progress</h2><p className="mt-1 text-small text-slate-500">Weekly completion</p></div><span className="text-2xl font-semibold text-primary">{percent}%</span></div><div className="mt-6 h-3 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-3 rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} /></div><p className="mt-4 text-small text-slate-500">{completed} of {total} sessions completed</p></div>; }
function QuickAddForm({ value, saving, courses, onChange, onSubmit }: { value: QuickSession; saving: boolean; courses: Course[]; onChange: (value: QuickSession) => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) { const update = (key: keyof QuickSession, next: string) => onChange({ ...value, [key]: next }); return <form onSubmit={onSubmit} className="card"><div className="mb-5"><h2 className="text-card-title font-semibold">Quick add</h2><p className="mt-1 text-small text-slate-500">Schedule a focused study block.</p></div><div className="space-y-3"><Field label="Subject"><select required value={value.subjectName} onChange={(event) => update("subjectName", event.target.value)}><option value="">Select subject</option>{courses.map((course) => <option key={course.id} value={course.courseName}>{course.courseName}</option>)}</select></Field><Field label="Topic"><input value={value.topic} onChange={(event) => update("topic", event.target.value)} placeholder="What will you study?" /></Field><div className="grid grid-cols-2 gap-3"><Field label="Date"><input required type="date" value={value.date} onChange={(event) => update("date", event.target.value)} /></Field><Field label="Start time"><input required type="time" value={value.startTime} onChange={(event) => update("startTime", event.target.value)} /></Field></div><div className="grid grid-cols-2 gap-3"><Field label="Duration"><select value={value.duration} onChange={(event) => update("duration", event.target.value)}><option value="30">30 min</option><option value="45">45 min</option><option value="60">1 hour</option><option value="90">1.5 hours</option><option value="120">2 hours</option></select></Field><Field label="Priority"><select value={value.priority} onChange={(event) => update("priority", event.target.value as QuickSession["priority"])}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></Field></div><button disabled={saving} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-small font-semibold text-white disabled:opacity-50"><Plus className="h-4 w-4" />{saving ? "Adding..." : "Add session"}</button></div></form>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">{label}<span className="mt-1 block [&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-slate-200 [&>input]:bg-transparent [&>input]:px-3 [&>input]:py-2 [&>input]:text-small [&>select]:w-full [&>select]:rounded-lg [&>select]:border [&>select]:border-slate-200 [&>select]:bg-transparent [&>select]:px-3 [&>select]:py-2 [&>select]:text-small dark:[&>input]:border-slate-700 dark:[&>select]:border-slate-700">{children}</span></label>; }
