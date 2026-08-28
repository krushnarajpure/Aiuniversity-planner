"use client";

import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { createTimetable, updateTimetable } from "@/actions/timetable";
import { detectOverlap } from "@/actions/timetable-enhanced";
import { useTransition } from "react";
import { toast } from "sonner";
import { X, AlertCircle, Clock } from "lucide-react";
import type { Timetable, SessionType, Priority, TimetableStatus } from "@prisma/client";

const SESSION_TYPES: { label: string; value: SessionType }[] = [
  { label: "Lecture", value: "LECTURE" },
  { label: "Revision", value: "REVISION" },
  { label: "Practice", value: "PRACTICE" },
  { label: "Assignment", value: "ASSIGNMENT" },
  { label: "Practical", value: "PRACTICAL" },
  { label: "Project", value: "PROJECT" },
  { label: "Reading", value: "READING" },
  { label: "Exam Preparation", value: "EXAM_PREPARATION" },
  { label: "Mock Test", value: "MOCK_TEST" },
  { label: "Break", value: "BREAK" },
];

const PRIORITIES: { label: string; value: Priority; color: string }[] = [
  { label: "Low", value: "LOW", color: "bg-blue-100 dark:bg-blue-900" },
  { label: "Medium", value: "MEDIUM", color: "bg-amber-100 dark:bg-amber-900" },
  { label: "High", value: "HIGH", color: "bg-red-100 dark:bg-red-900" },
];

const STATUSES: { label: string; value: TimetableStatus }[] = [
  { label: "Pending", value: "PENDING" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Missed", value: "MISSED" },
];

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface TimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  session?: Timetable | null;
  onSuccess?: () => void;
  courses: { id: string; courseName: string }[];
}

function calculateDuration(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return "";
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);
  const start = startHour * 60 + startMin;
  const end = endHour * 60 + endMin;
  const diff = end - start;
  if (diff <= 0) return "";
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}

export function TimetableSessionModal({
  isOpen,
  onClose,
  session,
  onSuccess,
  courses,
}: TimetableModalProps) {
  const [isPending, startTransition] = useTransition();
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subjectName: session?.subjectName || "",
    date: session?.date ? session.date.toISOString().split("T")[0] : "",
    startTime: session?.startTime || "09:00",
    endTime: session?.endTime || "10:00",
    sessionType: session?.sessionType || "LECTURE",
    priority: session?.priority || "MEDIUM",
    totalLectures: session?.totalLectures || 1,
    completedLectures: session?.completedLectures || 0,
    pendingWork: session?.pendingWork || "",
    notes: session?.notes || "",
    status: session?.status || "PENDING",
    isBreak: session?.isBreak || false,
  });
  const [selectedDay, setSelectedDay] = useState(() => {
    const date = session?.date ? new Date(session.date) : new Date();
    return DAYS[date.getDay()];
  });

  const duration = calculateDuration(formData.startTime, formData.endTime);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (name === "date" && value) {
        setSelectedDay(DAYS[new Date(`${value}T00:00:00`).getDay()]);
      }
    }
    setConflictError(null);
  };

  const handleDayChange = (day: string) => {
    setSelectedDay(day);
    const targetDay = DAYS.indexOf(day);
    const currentDate = formData.date ? new Date(`${formData.date}T00:00:00`) : new Date();
    const daysUntilTarget = (targetDay - currentDate.getDay() + 7) % 7;
    currentDate.setDate(currentDate.getDate() + daysUntilTarget);
    const date = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
    setFormData((prev) => ({ ...prev, date }));
    setConflictError(null);
  };

  const handleCheckOverlap = async () => {
    if (!formData.date || !formData.startTime || !formData.endTime) return;

    try {
      const response = await fetch("/api/timetable/check-overlap", {
        method: "POST",
        body: JSON.stringify({
          date: new Date(formData.date),
          startTime: formData.startTime,
          endTime: formData.endTime,
          excludeId: session?.id,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.hasConflict) {
          setConflictError(result.message);
        } else {
          setConflictError(null);
          toast.success("No conflicts detected");
        }
      }
    } catch (error) {
      console.error("Error checking overlap:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.date || !formData.startTime || !formData.endTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.isBreak && formData.totalLectures < formData.completedLectures) {
      toast.error("Completed lectures cannot exceed total lectures");
      return;
    }

    startTransition(async () => {
      try {
        const formDataObj = new FormData();
        formDataObj.append("subjectName", formData.subjectName);
        formDataObj.append("date", formData.date);
        formDataObj.append("startTime", formData.startTime);
        formDataObj.append("endTime", formData.endTime);
        formDataObj.append("sessionType", formData.sessionType);
        formDataObj.append("priority", formData.priority);
        formDataObj.append("totalLectures", String(formData.totalLectures));
        formDataObj.append("completedLectures", String(formData.completedLectures));
        formDataObj.append("pendingWork", formData.pendingWork);
        formDataObj.append("notes", formData.notes);
        formDataObj.append("status", formData.status);
        formDataObj.append("isBreak", String(formData.isBreak));

        const result = session
          ? await updateTimetable(session.id, { success: false, message: "" }, formDataObj)
          : await createTimetable({ success: false, message: "" }, formDataObj);

        if (result.success) {
          toast.success(result.message);
          onClose();
          onSuccess?.();
        } else {
          toast.error(result.message || "Failed to save session");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to save session");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card-light dark:bg-card-dark rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-card-light dark:bg-card-dark">
          <h2 className="text-card-title font-semibold">
            {session ? "Edit Study Session" : "New Study Session"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Conflict Alert */}
          {conflictError && (
            <div className="flex items-start gap-3 bg-red-100/50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">Schedule Conflict</p>
                <p className="text-small text-red-700 dark:text-red-300">{conflictError}</p>
              </div>
            </div>
          )}

          {/* Subject Name */}
          <div>
            <label className="block text-small font-medium mb-2">Subject Name *</label>
            <select
              name="subjectName"
              value={formData.subjectName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-body"
              required
            >
              <option value="" disabled>
                Select a course
              </option>
              {courses.map((course) => (
                <option key={course.id} value={course.courseName}>
                  {course.courseName}
                </option>
              ))}
              {formData.subjectName && !courses.some((course) => course.courseName === formData.subjectName) && (
                <option value={formData.subjectName}>{formData.subjectName}</option>
              )}
            </select>
            {courses.length === 0 && <p className="mt-2 text-xs text-warning">Add a course first to select it here.</p>}
          </div>

          {/* Day, Date & Time Row */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-small font-medium mb-2">Day *</label>
              <select
                value={selectedDay}
                onChange={(event) => handleDayChange(event.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-body"
                required
              >
                {DAYS.slice(1).concat(DAYS[0]).map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-small font-medium mb-2">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-body"
                required
              />
            </div>

            <div>
              <label className="block text-small font-medium mb-2">Start Time *</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-body"
                required
              />
            </div>

            <div>
              <label className="block text-small font-medium mb-2">End Time *</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-body"
                required
              />
            </div>
          </div>

          {/* Duration Display */}
          {duration && (
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-small font-medium text-primary">Duration: {duration}</span>
            </div>
          )}

          {/* Conflict Check */}
          <button
            type="button"
            onClick={handleCheckOverlap}
            className="w-full px-3 py-2 text-small font-medium border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Check for Conflicts
          </button>

          {/* Session Type */}
          <div>
            <label className="block text-small font-medium mb-2">Session Type</label>
            <select
              name="sessionType"
              value={formData.sessionType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-body"
            >
              {SESSION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-small font-medium mb-2">Priority</label>
            <div className="grid grid-cols-3 gap-3">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, priority: p.value }))}
                  className={`px-3 py-2 rounded-lg font-medium text-small transition ${
                    formData.priority === p.value
                      ? `${p.color} ring-2 ring-primary`
                      : `${p.color} opacity-50 hover:opacity-75`
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Is Break Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isBreak"
              id="isBreak"
              checked={formData.isBreak}
              onChange={handleInputChange}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="isBreak" className="text-small font-medium cursor-pointer">
              Mark as Break (won't count toward study statistics)
            </label>
          </div>

          {/* Lectures Section (hidden for breaks) */}
          {!formData.isBreak && (
            <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <h3 className="font-medium">Lecture Progress</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-small font-medium mb-2">Total Lectures</label>
                  <input
                    type="number"
                    name="totalLectures"
                    value={formData.totalLectures}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-body"
                  />
                </div>

                <div>
                  <label className="block text-small font-medium mb-2">Completed Lectures</label>
                  <input
                    type="number"
                    name="completedLectures"
                    value={formData.completedLectures}
                    onChange={handleInputChange}
                    min="0"
                    max={formData.totalLectures}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-body"
                  />
                </div>
              </div>

              {/* Progress Bar */}
              {formData.totalLectures > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-small">
                    <span>Progress</span>
                    <span className="font-medium">
                      {Math.round((formData.completedLectures / formData.totalLectures) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{
                        width: `${(formData.completedLectures / formData.totalLectures) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pending Work */}
          <div>
            <label className="block text-small font-medium mb-2">Pending Work</label>
            <textarea
              name="pendingWork"
              value={formData.pendingWork}
              onChange={handleInputChange}
              placeholder="e.g., Complete CSS Grid exercises"
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-body"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-small font-medium mb-2">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional notes..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-body"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-small font-medium mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-body"
            >
              {STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending ? "Saving..." : session ? "Update Session" : "Create Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
