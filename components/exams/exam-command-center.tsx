"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock3,
  MapPin,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import type { Course, Exam } from "@prisma/client";
import { formatDate } from "@/lib/utils";

type ExamWithCourse = Exam & { course: Course };

type Props = {
  exams: ExamWithCourse[];
  onAdd: () => void;
  onEdit: (exam: Exam) => void;
};

type Countdown = { days: number; hours: number; minutes: number; seconds: number; state: "upcoming" | "progress" | "completed" };

function getCountdown(exam: ExamWithCourse | undefined): Countdown {
  if (!exam) return { days: 0, hours: 0, minutes: 0, seconds: 0, state: "completed" };
  const target = new Date(exam.date);
  const [hours, minutes] = exam.time.split(":").map(Number);
  target.setHours(hours || 0, minutes || 0, 0, 0);
  const difference = target.getTime() - Date.now();
  if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, state: "completed" };
  const totalSeconds = Math.floor(difference / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    state: "upcoming",
  };
}

function Stat({ value, label }: { value: string; label: string }) {
  return <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-700"><p className="text-lg font-semibold">{value}</p><p className="text-xs text-slate-500 dark:text-slate-400">{label}</p></div>;
}

export function ExamCommandCenter({ exams, onAdd, onEdit }: Props) {
  const [selectedId, setSelectedId] = useState(exams[0]?.id || "");
  const [search, setSearch] = useState("");
  const [, setTick] = useState(0);
  useEffect(() => { const timer = window.setInterval(() => setTick((value) => value + 1), 1000); return () => window.clearInterval(timer); }, []);

  const selectedExam = exams.find((exam) => exam.id === selectedId) || exams[0];
  const countdown = getCountdown(selectedExam);
  const filteredExams = useMemo(() => exams.filter((exam) => `${exam.course.courseName} ${exam.course.courseCode} ${exam.examType}`.toLowerCase().includes(search.toLowerCase())), [exams, search]);
  const upcoming = exams.filter((exam) => getCountdown(exam).state === "upcoming");
  const examLabel = countdown.state === "completed" ? "Exam completed" : countdown.days > 0 ? `${countdown.days} day${countdown.days === 1 ? "" : "s"} left` : "Exam in less than a day";

  if (exams.length === 0) {
    return <section className="card mb-6"><div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center"><div><p className="flex items-center gap-2 text-small font-medium text-primary"><Sparkles className="h-4 w-4" /> AI EXAM COMMAND CENTER</p><h2 className="mt-2 text-card-title font-semibold">Your exam preparation workspace starts here</h2><p className="mt-2 max-w-xl text-small text-slate-500 dark:text-slate-400">Add your first exam to unlock live countdowns, preparation views, and quick study actions based on your actual schedule.</p></div><button type="button" onClick={onAdd} className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-small font-medium text-primary-foreground"><Plus className="h-4 w-4" /> Create Your First Exam</button></div></section>;
  }

  return <section className="mb-6 space-y-4">
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="flex items-center gap-2 text-small font-medium text-primary"><Sparkles className="h-4 w-4" /> AI EXAM COMMAND CENTER</p><h2 className="mt-2 text-subheading font-semibold">Your complete exam preparation workspace</h2><p className="mt-1 text-small text-slate-500 dark:text-slate-400">Live schedule signals from your saved exams. Preparation metrics become available as study data is recorded.</p></div><div className="w-full md:w-72"><label className="text-small font-medium">Current exam<select value={selectedExam?.id || ""} onChange={(event) => setSelectedId(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 font-normal dark:border-slate-600"><option value="">All exams</option>{exams.map((exam) => <option key={exam.id} value={exam.id}>{exam.course.courseName} ({exam.course.courseCode})</option>)}</select></label></div></div>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
      <div className="card border-primary/20 bg-primary/[0.03] dark:bg-primary/[0.06]"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-small font-medium text-primary">Next Exam</p><h3 className="mt-1 text-xl font-semibold">{selectedExam?.course.courseName}</h3><p className="text-small text-slate-500 dark:text-slate-400">{selectedExam?.course.courseCode} · {selectedExam?.examType}</p></div><button type="button" onClick={() => selectedExam && onEdit(selectedExam)} className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-small dark:border-slate-600"><Pencil className="h-3.5 w-3.5" /> Edit exam</button></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><Stat value={selectedExam ? formatDate(selectedExam.date) : "-"} label="Exam date" /><Stat value={selectedExam?.time || "-"} label="Start time" /><Stat value={selectedExam?.location || "Not set"} label="Hall / location" /></div><div className="mt-5 flex flex-wrap gap-2"><Link href="/study-planner" className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-small font-medium text-primary-foreground"><Target className="h-4 w-4" /> Start preparation</Link><Link href="/study-material" className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-small dark:border-slate-600"><BookOpen className="h-4 w-4" /> Open study material</Link></div></div>
      <div className="card"><div className="flex items-center justify-between"><div><p className="text-small font-medium text-slate-500 dark:text-slate-400">Live countdown</p><p className="mt-1 font-semibold">{examLabel}</p></div><CalendarClock className="h-5 w-5 text-primary" /></div>{countdown.state === "upcoming" ? <div className="mt-5 grid grid-cols-4 gap-2 text-center"><div><p className="text-2xl font-semibold text-primary">{String(countdown.days).padStart(2, "0")}</p><p className="text-xs text-slate-500">Days</p></div><div><p className="text-2xl font-semibold">{String(countdown.hours).padStart(2, "0")}</p><p className="text-xs text-slate-500">Hours</p></div><div><p className="text-2xl font-semibold">{String(countdown.minutes).padStart(2, "0")}</p><p className="text-xs text-slate-500">Minutes</p></div><div><p className="text-2xl font-semibold">{String(countdown.seconds).padStart(2, "0")}</p><p className="text-xs text-slate-500">Seconds</p></div></div> : <div className="mt-8 rounded-lg bg-slate-100 p-4 text-center text-small dark:bg-slate-700">This exam is completed. Add another upcoming exam to keep planning.</div>}<p className="mt-5 flex items-center gap-2 text-small text-slate-500 dark:text-slate-400"><CheckCircle2 className="h-4 w-4 text-success" /> Focus on the next confirmed deadline.</p></div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat value={String(exams.length)} label="Saved exams" /><Stat value={String(upcoming.length)} label="Upcoming" /><Stat value="Not tracked" label="Readiness score" /><Stat value="Add sessions" label="Study target" /></div>
    <div className="grid gap-4 lg:grid-cols-[1.05fr_1fr_1fr]">
      <div className="card"><div className="flex items-center justify-between"><h3 className="text-card-title font-semibold">AI Exam Insights</h3><Sparkles className="h-4 w-4 text-primary" /></div><div className="mt-4 space-y-3 text-small"><p className="rounded-lg bg-primary/5 p-3 dark:bg-primary/10">{upcoming.length ? `You have ${upcoming.length} upcoming exam${upcoming.length === 1 ? "" : "s"}. Start with the nearest confirmed deadline.` : "No upcoming exams are currently scheduled."}</p><p className="flex items-center gap-2 text-slate-500 dark:text-slate-400"><CheckCircle2 className="h-4 w-4 text-success" /> Your schedule is based on saved exam data only.</p><p className="flex items-center gap-2 text-slate-500 dark:text-slate-400"><Target className="h-4 w-4 text-warning" /> Add study sessions to unlock readiness insights.</p></div><Link href="/planner" className="mt-4 inline-flex items-center gap-1 text-small font-medium text-primary">Open AI Study Plan <ArrowRight className="h-3.5 w-3.5" /></Link></div>
      <div className="card"><div className="flex items-center justify-between"><h3 className="text-card-title font-semibold">Overall Preparation</h3><Target className="h-4 w-4 text-primary" /></div><div className="mt-5 flex items-center gap-5"><div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-8 border-slate-200 text-center dark:border-slate-700"><span className="text-xs font-semibold text-slate-500">Not<br />tracked</span></div><div><p className="text-small font-medium">Readiness is not estimated yet</p><p className="mt-1 text-xs leading-relaxed text-slate-500">Syllabus, mock tests, revision and study sessions are not stored for this exam yet.</p></div></div><Link href="/study-planner" className="mt-5 inline-flex items-center gap-1 text-small font-medium text-primary">Start tracking progress <ArrowRight className="h-3.5 w-3.5" /></Link></div>
      <div className="card"><div className="flex items-center justify-between"><h3 className="text-card-title font-semibold">Quick Actions</h3><Sparkles className="h-4 w-4 text-primary" /></div><div className="mt-4 grid grid-cols-2 gap-2"><Link href="/planner" className="rounded-lg bg-primary/10 px-3 py-3 text-center text-xs font-medium text-primary">AI Study Plan</Link><Link href="/study-material" className="rounded-lg bg-slate-100 px-3 py-3 text-center text-xs font-medium dark:bg-slate-700">Study Material</Link><Link href="/timetable" className="rounded-lg bg-slate-100 px-3 py-3 text-center text-xs font-medium dark:bg-slate-700">Calendar View</Link><button type="button" onClick={onAdd} className="rounded-lg bg-slate-100 px-3 py-3 text-xs font-medium dark:bg-slate-700">Create Exam</button></div></div>
    </div>
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="card"><div className="flex items-center justify-between"><div><h3 className="text-card-title font-semibold">Subject Preparation Overview</h3><p className="mt-1 text-small text-slate-500 dark:text-slate-400">Preparation becomes available when syllabus and study progress are tracked.</p></div><Link href="/study-material" className="text-xs font-medium text-primary">View materials</Link></div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-small"><thead className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-700"><tr><th className="pb-3 font-medium">Subject</th><th className="pb-3 font-medium">Exam date</th><th className="pb-3 font-medium">Preparation</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Action</th></tr></thead><tbody>{filteredExams.slice(0, 5).map((exam) => <tr key={exam.id} className="border-b border-slate-100 dark:border-slate-800"><td className="py-3 font-medium">{exam.course.courseName}</td><td className="py-3 text-slate-500">{formatDate(exam.date)}</td><td className="py-3 text-slate-500">Not tracked</td><td className="py-3"><span className="rounded-md bg-warning/10 px-2 py-1 text-xs text-warning">Needs setup</span></td><td className="py-3"><button type="button" onClick={() => onEdit(exam)} className="text-xs font-medium text-primary">Open</button></td></tr>)}</tbody></table></div></div>
      <div className="card"><div className="flex items-center justify-between"><h3 className="text-card-title font-semibold">Today&apos;s AI Study Plan</h3><Clock3 className="h-4 w-4 text-primary" /></div><div className="mt-4 rounded-lg border border-dashed border-slate-300 p-4 text-center dark:border-slate-600"><p className="text-small font-medium">No study sessions recorded</p><p className="mt-1 text-xs text-slate-500">Generate a plan from your real courses and deadlines.</p><Link href="/planner" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">Create study plan <ArrowRight className="h-3.5 w-3.5" /></Link></div><div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-100 p-3 text-xs text-slate-500 dark:bg-slate-700"><CheckCircle2 className="h-4 w-4 text-success" /> No invented tasks or preparation scores.</div></div>
    </div>
    <div className="card"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h3 className="text-card-title font-semibold">Upcoming exams</h3><p className="text-small text-slate-500 dark:text-slate-400">Select an exam to update the command center.</p></div><div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600"><Search className="h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search exams or subjects" className="min-w-0 bg-transparent text-small outline-none" aria-label="Search exams or subjects" /></div></div><div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-3">{filteredExams.slice(0, 6).map((exam) => { const itemCountdown = getCountdown(exam); return <button type="button" key={exam.id} onClick={() => setSelectedId(exam.id)} className={`flex items-center justify-between rounded-lg border p-3 text-left transition ${selectedExam?.id === exam.id ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/50 dark:border-slate-700"}`}><span className="min-w-0"><span className="block truncate text-small font-medium">{exam.course.courseName}</span><span className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Clock3 className="h-3 w-3" /> {formatDate(exam.date)} · {exam.time}</span>{exam.location && <span className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3 w-3" /> {exam.location}</span>}</span><span className="ml-2 shrink-0 text-xs font-medium text-primary">{itemCountdown.state === "upcoming" ? `${itemCountdown.days}d` : "Done"}</span></button>; })}</div>{filteredExams.length === 0 && <p className="mt-4 text-small text-slate-500">No exams match your search.</p>}<div className="mt-4 flex flex-wrap gap-3"><Link href="/planner" className="flex items-center gap-1 text-small font-medium text-primary">AI Study Plan <ArrowRight className="h-3.5 w-3.5" /></Link><Link href="/assignments" className="flex items-center gap-1 text-small font-medium text-primary">Review deadlines <ClipboardList className="h-3.5 w-3.5" /></Link><Link href="/timetable" className="flex items-center gap-1 text-small font-medium text-primary">Calendar view <CalendarClock className="h-3.5 w-3.5" /></Link></div></div>
    <div className="grid gap-4 md:grid-cols-3"><div className="card"><h3 className="text-card-title font-semibold">Quick Practice</h3><div className="mt-3 space-y-2 text-small"><Link href="/study-material" className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-700">Study material <ArrowRight className="h-3.5 w-3.5" /></Link><Link href="/planner" className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-700">Revision plan <ArrowRight className="h-3.5 w-3.5" /></Link></div></div><div className="card"><h3 className="text-card-title font-semibold">Exam Day Checklist</h3><div className="mt-3 space-y-2 text-small text-slate-500 dark:text-slate-400"><p>□ Hall ticket</p><p>□ Student ID card</p><p>□ Pens and stationery</p></div><p className="mt-3 text-xs text-slate-400">Checklist persistence will be enabled with exam-day data.</p></div><div className="card"><h3 className="text-card-title font-semibold">Exam Analytics</h3><div className="mt-3 space-y-2 text-small text-slate-500 dark:text-slate-400"><p>Mock performance: Not tracked</p><p>Study hours: Not tracked</p><p>Question accuracy: Not tracked</p></div><Link href="/analytics" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">Open analytics <ArrowRight className="h-3.5 w-3.5" /></Link></div></div>
  </section>;
}
