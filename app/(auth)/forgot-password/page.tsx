import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return <main className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-4"><div className="card w-full max-w-sm"><h1 className="text-card-title font-semibold text-center mb-1">Forgot Password?</h1><p className="text-small text-center text-slate-500 dark:text-slate-400 mb-6">Enter your email to receive a reset link</p><ForgotPasswordForm /></div></main>;
}
