"use client";

import { useState, useMemo } from "react";
import { Plus, Search, BookOpen, Building2, Check } from "lucide-react";
import { toast } from "sonner";
import type { Course } from "@prisma/client";
import { CourseCard } from "./course-card";
import { CourseModal } from "./course-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { deleteCourse } from "@/actions/courses";
import { addCourseFromCollegeTimetable } from "@/actions/college-timetable";

type CollegeEntry = { id: string; courseName: string; courseCode: string; facultyName: string | null; day: string; startTime: string; endTime: string; room: string | null };

export function CoursesClient({ initialCourses, collegeTimetable = [] }: { initialCourses: Course[]; collegeTimetable?: CollegeEntry[] }) {
  const [courses, setCourses] = useState(initialCourses);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [addedFromTimetable, setAddedFromTimetable] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return courses.filter(
      (c) =>
        c.courseName.toLowerCase().includes(q) ||
        c.courseCode.toLowerCase().includes(q) ||
        (c.instructor ?? "").toLowerCase().includes(q)
    );
  }, [courses, search]);

  function openAdd() {
    setEditingCourse(null);
    setModalOpen(true);
  }

  function openEdit(course: Course) {
    setEditingCourse(course);
    setModalOpen(true);
  }

  async function handleDelete(course: Course) {
    const confirmed = window.confirm(`Delete "${course.courseName}"? This cannot be undone.`);
    if (!confirmed) return;

    const previous = courses;
    setCourses((c) => c.filter((x) => x.id !== course.id));

    try {
      await deleteCourse(course.id);
      toast.success("Course deleted");
    } catch {
      setCourses(previous);
      toast.error("Failed to delete course");
    }
  }

  // Re-sync local state when modal closes (server action revalidates the page,
  // but since this is a client component holding its own copy, we refresh on close)
  function handleModalClose() {
    setModalOpen(false);
    // Full data refresh happens via router.refresh() triggered by revalidatePath server-side;
    // Next.js will re-render the server component wrapper and pass fresh initialCourses.
    window.location.reload();
  }

  async function addDetectedCourse(entry: CollegeEntry) {
    try {
      const result = await addCourseFromCollegeTimetable(entry);
      setAddedFromTimetable((current) => ({ ...current, [entry.id]: true }));
      toast.success(result.status === "existing" ? "Already Added" : "Course added successfully");
      if (result.status === "created") window.location.reload();
    } catch { toast.error("Could not add detected course"); }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-subheading font-semibold">Courses</h1>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-body focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </button>
        </div>
      </div>

      {collegeTimetable.length > 0 && <section className="card mb-6"><div className="mb-4 flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /><div><h2 className="font-semibold">Detected Courses</h2><p className="text-small text-slate-500">Add courses found in your college timetable without typing them again.</p></div></div><div className="grid gap-3 sm:grid-cols-2">{collegeTimetable.filter((entry, index, list) => list.findIndex((item) => item.courseCode === entry.courseCode) === index).map((entry) => <div key={entry.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700"><div><p className="text-small font-semibold">{entry.courseName}</p><p className="text-xs text-primary">{entry.courseCode} · {entry.facultyName || "Faculty unclear"}</p></div><button type="button" onClick={() => void addDetectedCourse(entry)} disabled={addedFromTimetable[entry.id]} className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white disabled:bg-success">{addedFromTimetable[entry.id] ? <><Check className="h-3 w-3" />Already Added</> : "Add"}</button></div>)}</div></section>}

      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={courses.length === 0 ? "No Courses Yet" : "No courses match your search"}
          actionLabel="Add Your First Course"
          onAction={openAdd}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={() => openEdit(course)}
              onDelete={() => handleDelete(course)}
            />
          ))}
        </div>
      )}

      <CourseModal open={modalOpen} onClose={handleModalClose} course={editingCourse} />
    </div>
  );
}
