import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return <main className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-4"><div className="card w-full max-w-sm"><h1 className="text-card-title font-semibold text-center mb-1">Reset Password</h1><p className="text-small text-center text-slate-500 dark:text-slate-400 mb-6">Choose a new password for your account</p><Suspense fallback={<p className="text-small text-center text-slate-500">Loading...</p>}><ResetPasswordForm /></Suspense></div></main>;
}
