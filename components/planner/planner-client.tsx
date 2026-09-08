"use client";

import { useActionState, useEffect, useState } from "react";
import { Brain, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { Course } from "@prisma/client";
import { generatePlan, type PlannerState } from "@/actions/planner";
import { PlanResult } from "./plan-result";
import type { StudyPlanOutput } from "@/lib/ai";

const plannerInitialState: PlannerState = { success: false, message: "" };

export function PlannerClient({
  courses,
  existingPlan,
}: {
  courses: Course[];
  existingPlan: StudyPlanOutput | null;
}) {
  const uniqueCourses = courses.filter((course, index, list) => list.findIndex((item) => item.courseCode.trim().toLowerCase() === course.courseCode.trim().toLowerCase() || item.courseName.trim().toLowerCase() === course.courseName.trim().toLowerCase()) === index);
  const [state, formAction, isPending] = useActionState(generatePlan, plannerInitialState);
  const [displayedPlan, setDisplayedPlan] = useState<StudyPlanOutput | null>(existingPlan);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(uniqueCourses.map((course) => course.courseName));
  const [weakSubjects, setWeakSubjects] = useState<string[]>([]);

  useEffect(() => {
    if (state.message && state.success && state.plan) {
      toast.success(state.message);
      setDisplayedPlan(state.plan);
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state]);

  if (courses.length === 0) {
    return (
      <div className="card text-center py-12">
        <Brain className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-body font-medium mb-1">Add a course first</p>
        <p className="text-small text-slate-500 dark:text-slate-400">
          The AI needs at least one course to generate a study plan from your real data.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Input form */}
      <div className="card lg:col-span-1 h-fit">
        <h2 className="text-card-title font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Plan My Study
        </h2>
        <form action={formAction} className="space-y-4">
          <div className="rounded-xl bg-primary/5 p-3 dark:bg-primary/10">
            <p className="text-small font-semibold">Create one focused study plan</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Select all the subjects you want in this plan. Generating again replaces your previous plan.</p>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-small font-medium">Subjects for this plan</label>
              <button type="button" onClick={() => setSelectedSubjects(selectedSubjects.length === uniqueCourses.length ? [] : uniqueCourses.map((course) => course.courseName))} className="text-xs font-medium text-primary">{selectedSubjects.length === uniqueCourses.length ? "Clear all" : "Select all"}</button>
            </div>
            <div className="max-h-44 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              {uniqueCourses.map((course) => <label key={course.id} className="flex items-center gap-2 text-small"><input type="checkbox" name="selectedSubjects" value={course.courseName} checked={selectedSubjects.includes(course.courseName)} onChange={(event) => setSelectedSubjects((current) => event.target.checked ? [...new Set([...current, course.courseName])] : current.filter((name) => name !== course.courseName))} className="rounded" />{course.courseName}<span className="ml-auto text-xs text-slate-400">{course.courseCode}</span></label>)}
            </div>
          </div>
          <div>
            <label className="text-small font-medium block mb-1">Plan duration</label>
            <div className="grid grid-cols-[1fr_1.5fr] gap-2"><input name="durationValue" type="number" min="1" max="365" defaultValue="7" required className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-body dark:border-slate-600" /><select name="durationUnit" defaultValue="DAYS" className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-body dark:border-slate-600"><option value="DAYS">Days</option><option value="WEEKS">Weeks</option><option value="MONTHS">Months</option></select></div>
          </div>
          <div>
            <label className="text-small font-medium block mb-1">Available Study Hours Today</label>
            <input
              name="availableHours"
              type="number"
              min="1"
              max="24"
              step="0.5"
              defaultValue={4}
              required
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-small font-medium block mb-1">Preferred Study Time</label>
            <select
              name="preferredTime"
              defaultValue="MORNING"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="MORNING">Morning</option>
              <option value="AFTERNOON">Afternoon</option>
              <option value="EVENING">Evening</option>
              <option value="NIGHT">Night</option>
            </select>
          </div>

          <div>
            <label className="text-small font-medium block mb-2">Weak Subjects (optional)</label>
            <div className="space-y-2">
              {uniqueCourses.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-small">
                  <input type="checkbox" name="weakSubjects" value={c.courseName} checked={weakSubjects.includes(c.courseName)} onChange={(event) => setWeakSubjects((current) => event.target.checked ? [...current, c.courseName] : current.filter((name) => name !== c.courseName))} className="rounded" />
                  {c.courseName}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-2.5 font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {isPending ? "Generating plan..." : "Generate Plan"}
          </button>
        </form>
      </div>

      {/* Result */}
      <div className="lg:col-span-2">
        {isPending ? (
          <div className="card text-center py-16">
            <Sparkles className="w-8 h-8 text-primary mx-auto mb-3 animate-pulse" />
            <p className="text-body text-slate-500 dark:text-slate-400">
              Analyzing your courses, assignments, and exams...
            </p>
          </div>
        ) : displayedPlan ? (
          <PlanResult plan={displayedPlan} />
        ) : (
          <div className="card text-center py-16">
            <Brain className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-body text-slate-500 dark:text-slate-400">
              Fill in the form and generate your first AI study plan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
