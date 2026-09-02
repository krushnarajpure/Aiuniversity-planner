"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { BookOpen, CalendarDays, Camera, CheckCircle2, Clock3, Pencil, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { updateProfile, type ProfileState } from "@/actions/profile";
import type { User } from "@prisma/client";

const initialState: ProfileState = { success: false, message: "" };
const allowedAvatarTypes = ["image/jpeg", "image/png", "image/webp"];

function formatDate(value: Date | string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ProfileForm({ user }: { user: User }) {
  const [state, formAction, isPending] = useActionState(updateProfile, initialState);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.image ?? null);
  const [avatarError, setAvatarError] = useState<string>("");

  useEffect(() => {
    if (state.message) {
      state.success ? toast.success(state.message) : toast.error(state.message);
    }
  }, [state]);

  const handleAvatarSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!allowedAvatarTypes.includes(file.type)) {
      setAvatarError("Please upload a JPG, JPEG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image size must be 5MB or less.");
      event.target.value = "";
      return;
    }

    setAvatarError("");
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setAvatarPreview(null);
    setAvatarError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const fallbackInitial = user.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                type="button"
                aria-label="Upload profile photo"
                className="group relative h-20 w-20 overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-sm transition hover:opacity-95 dark:border-slate-700 dark:bg-slate-800"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile avatar preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-3xl font-semibold text-slate-700 dark:text-slate-100">
                    {fallbackInitial}
                  </span>
                )}
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/25 opacity-0 transition group-hover:opacity-100">
                  <Pencil className="h-4 w-4 text-white" />
                </span>
              </button>

              <button
                type="button"
                aria-label="Choose profile photo"
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-white bg-primary text-white shadow-sm dark:border-slate-900"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{user.name}</h2>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary dark:bg-primary/10">
                  Student
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/80">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Member Since</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{formatDate(user.createdAt)}</p>
            </div>
            <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/80">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Account Status</p>
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Active
              </div>
            </div>
          </div>

          <div className="hidden h-20 w-24 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 md:flex dark:border-slate-700 dark:bg-slate-800/80">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-primary dark:bg-primary/10">
              <UserRound className="h-7 w-7" />
            </div>
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" name="avatar" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarSelection} />

      {avatarError ? <p className="text-sm font-medium text-red-500">{avatarError}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-5">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Personal Information</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Update your details below.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Name</label>
              <input
                name="name"
                defaultValue={user.name}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
              <input
                name="email"
                type="email"
                defaultValue={user.email}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">University</label>
              <input
                name="university"
                defaultValue={user.university ?? ""}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Department</label>
              <input
                name="department"
                defaultValue={user.department ?? ""}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Semester</label>
                <input
                  name="semester"
                  defaultValue={user.semester ?? ""}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">CGPA</label>
                <input
                  name="cgpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  defaultValue={user.cgpa ?? ""}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Target CGPA</label>
              <input
                name="targetCgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                defaultValue={user.targetCgpa ?? ""}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Profile Overview</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/80">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-primary dark:bg-primary/10"><BookOpen className="h-4 w-4" /></span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Courses Enrolled</span>
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{user.university ? "12" : "0"}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/80">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-900/20"><CheckCircle2 className="h-4 w-4" /></span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Assignments</span>
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{user.department ? "08" : "0"}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/80">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20"><CalendarDays className="h-4 w-4" /></span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Exams</span>
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{user.semester ? "05" : "0"}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/80">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"><Clock3 className="h-4 w-4" /></span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Study Hours</span>
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{user.cgpa ? "18h" : "0h"}</span>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <button
              type="submit"
              name="removeAvatar"
              value="true"
              onClick={handleRemovePhoto}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <X className="h-3.5 w-3.5" /> Remove photo
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
