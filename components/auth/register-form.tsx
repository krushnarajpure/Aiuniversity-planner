"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { GoogleButton } from "./google-button";
import { registerUser, type RegisterState } from "@/actions/auth";
import { Building2, UserRound } from "lucide-react";

const fields = [
  { name: "name", label: "Full Name", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "password", label: "Password", type: "password" },
  { name: "confirmPassword", label: "Confirm Password", type: "password" },
];

const studentFields = [
  { name: "university", label: "University", type: "text" },
  { name: "department", label: "Department", type: "text" },
  { name: "semester", label: "Semester", type: "text" },
];

const initialState: RegisterState = { success: false, message: "" };

const accountOptions = [
  { value: "STUDENT", label: "Student", icon: UserRound },
  { value: "ORGANIZATION", label: "Organization / Recruiter", icon: Building2 },
];

export function RegisterForm() {
  const router = useRouter();
  const [accountType, setAccountType] = useState("STUDENT");
  const [state, formAction, isPending] = useActionState(registerUser, initialState);

  useEffect(() => {
    if (state.message && state.success) {
      toast.success(state.message);
      router.push("/login");
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-5">
      <div className="mb-4 text-center">
        <h2 className="text-[38px] font-semibold tracking-[-0.04em] text-slate-900">Create Account</h2>
        <p className="mt-2 text-[17px] text-slate-500">Start planning your semester</p>
      </div>

      <div>
        <div className="grid grid-cols-2 gap-2">
          {accountOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setAccountType(value)}
              className={`flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-xl border px-2 py-2 text-[13px] font-medium transition ${
                accountType === value
                  ? "border-[#1b50d6] bg-[#edf3ff] text-[#1b50d6] shadow-sm"
                  : "border-[#dfe5ef] bg-white text-slate-500 hover:border-[#bfcbe9] hover:text-slate-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="leading-tight">{label}</span>
            </button>
          ))}
        </div>
        <input type="hidden" name="accountType" value={accountType} />
      </div>

      <div className="grid gap-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="mb-1.5 block text-[15px] font-medium text-slate-700">{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              required={["name", "email", "password", "confirmPassword"].includes(field.name)}
              className="w-full rounded-xl border border-[#dfe5ef] bg-[#dfeaf9] px-3.5 py-3 text-[15px] text-slate-800 outline-none transition focus:border-[#1b50d6] focus:bg-white"
            />
            {state.errors?.[field.name] && (
              <p className="mt-1.5 text-xs text-red-600">{state.errors[field.name][0]}</p>
            )}
          </div>
        ))}
      </div>

      {accountType === "STUDENT" && (
        <div className="space-y-4 rounded-2xl border border-[#dfe5ef] bg-[#eef5ff] p-4">
          <p className="text-[15px] font-semibold text-slate-700">Academic Information</p>
          {studentFields.map((field) => (
            <div key={field.name}>
              <label className="mb-1.5 block text-[15px] font-medium text-slate-700">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                className="w-full rounded-xl border border-[#dfe5ef] bg-white px-3.5 py-3 text-[15px] text-slate-800 outline-none transition focus:border-[#1b50d6]"
              />
            </div>
          ))}
        </div>
      )}

      {accountType === "ORGANIZATION" && (
        <div className="space-y-4 rounded-2xl border border-[#dfe7ff] bg-[#f5f8ff] p-4">
          <p className="text-sm font-semibold text-[#1b50d6]">Organization details</p>
          {[
            ["companyName", "Registered company name", "text"],
            ["recruiterName", "Recruiter name", "text"],
            ["recruiterDesignation", "Recruiter designation", "text"],
            ["phone", "Official phone", "tel"],
            ["website", "Company website", "url"],
            ["industry", "Industry", "text"],
            ["location", "Company location", "text"],
            ["companySize", "Company size", "text"],
          ].map(([name, label, type]) => (
            <div key={String(name)}>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{String(label)}</label>
              <input
                name={String(name)}
                type={String(type)}
                required={!["website", "industry", "location", "companySize"].includes(String(name))}
                placeholder={String(name) === "website" ? "https://company.com" : ""}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#1b50d6] focus:ring-2 focus:ring-[#dfeaff]"
              />
            </div>
          ))}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Company description</label>
            <textarea
              name="companyDescription"
              required
              minLength={20}
              className="min-h-[100px] w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#1b50d6] focus:ring-2 focus:ring-[#dfeaff]"
            />
          </div>
          <p className="text-xs text-slate-500">Your organization will remain pending until an administrator reviews it.</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-gradient-to-r from-[#0a5ad7] to-[#1a74ff] py-3 text-[18px] font-semibold text-white shadow-[0_12px_20px_rgba(31,90,232,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Creating account..." : "Register"}
      </button>

      <div className="relative my-2 text-center text-[13px] text-slate-400">
        <span className="relative z-10 bg-[#f7f8fa] px-2">or</span>
        <span className="absolute inset-x-0 top-1/2 -z-10 h-px -translate-y-1/2 bg-[#dfe5ef]" />
      </div>

      <GoogleButton label="Continue with Google" />

      <p className="pt-2 text-center text-[15px] text-slate-500">
        Already have an account? <Link href="/login" className="font-medium text-[#1b50d6] hover:underline">Login</Link>
      </p>
    </form>
  );
}
