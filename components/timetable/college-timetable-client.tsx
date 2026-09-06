"use client";

import { useMemo, useState } from "react";
import { BookOpen, Check, Clock3, UserRound } from "lucide-react";
import { toast } from "sonner";
import { addCourseFromCollegeTimetable } from "@/actions/college-timetable";

type Entry = { id: string; courseName: string; courseCode: string; facultyName: string | null; day: string; startTime: string; endTime: string; room: string | null };
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function CollegeTimetableClient({ initialEntries }: { initialEntries: Entry[] }) {
  const [entries] = useState(initialEntries);
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const grouped = useMemo(() => Object.fromEntries(days.map((day) => [day, entries.filter((entry) => entry.day.toLowerCase() === day.toLowerCase())])), [entries]);
  async function addCourse(entry: Entry) {
    try {
      const result = await addCourseFromCollegeTimetable(entry);
      setAdded((current) => ({ ...current, [entry.id]: true }));
      toast.success(result.status === "existing" ? "Already Added" : "Course added successfully.");
    } catch { toast.error("Could not add this course."); }
  }
  return <div className="space-y-6 p-6"><header><p className="text-small font-medium text-primary">COLLEGE TIMETABLE</p><h1 className="mt-1 text-heading font-semibold">College Timetable</h1><p className="mt-2 text-small text-slate-500 dark:text-slate-400">Your actual college lectures, separate from personal study sessions.</p></header>{!entries.length ? <div className="card py-16 text-center"><BookOpen className="mx-auto h-9 w-9 text-slate-300" /><p className="mt-3 font-medium">No college timetable entries yet</p><p className="mt-1 text-small text-slate-500">Upload a timetable image in AI Copilot to import it.</p></div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{days.map((day) => <section key={day} className="card min-h-40"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">{day}</h2><span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">{grouped[day].length}</span></div><div className="space-y-3">{grouped[day].length ? grouped[day].map((entry) => <article key={entry.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"><div className="flex items-start justify-between gap-2"><div><h3 className="font-semibold text-small">{entry.courseName}</h3><p className="mt-1 text-xs text-primary">{entry.courseCode}</p></div><Clock3 className="h-4 w-4 shrink-0 text-primary" /></div><p className="mt-2 text-xs text-slate-500">{entry.startTime} - {entry.endTime}</p>{entry.facultyName && <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><UserRound className="h-3 w-3" />{entry.facultyName}</p>}{entry.room && <p className="mt-1 text-xs text-slate-400">Room: {entry.room}</p>}<button type="button" onClick={() => void addCourse(entry)} disabled={added[entry.id]} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary disabled:text-success">{added[entry.id] ? <><Check className="h-3 w-3" />Already Added</> : "Add Course"}</button></article>) : <p className="text-xs text-slate-400">No lectures detected.</p>}</div></section>)}</div>}</div>;
}
