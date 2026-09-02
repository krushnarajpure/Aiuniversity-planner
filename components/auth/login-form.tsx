"use client";

import { useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { GoogleButton } from "./google-button";
import { Building2, Eye, EyeOff, ShieldCheck, UserRound } from "lucide-react";
import { type LucideIcon } from "lucide-react";

const accountOptions: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "STUDENT", label: "Student", icon: UserRound },
  { value: "ORGANIZATION", label: "Organization", icon: Building2 },
  { value: "ADMIN", label: "Admin", icon: ShieldCheck },
];

export function LoginForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [accountType, setAccountType] = useState("STUDENT");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const nextErrors: { email?: string; password?: string } = {};
    if (!email.trim()) nextErrors.email = "Please enter your email address.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Invalid email format.";
    if (!password) nextErrors.password = "Password is required.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setIsPending(true);

    const result = await signIn("credentials", {
      email,
      password,
      accountType,
      redirect: false,
    });

    setIsPending(false);

    if (result?.error) {
      toast.error(result.error === "CredentialsSignin" ? "Invalid email, password, or account type." : result.error);
      return;
    }

    const session = await getSession();
    toast.success("Welcome back!");
    router.push(session?.user?.role === "ADMIN" ? "/admin" : session?.user?.role === "ORGANIZATION" ? "/organization" : "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="mb-4 text-center">
        <h2 className="text-[38px] font-semibold tracking-[-0.04em] text-slate-900">Welcome Back</h2>
        <p className="mt-2 text-[17px] text-slate-500">Log in to continue planning</p>
      </div>

      <div>
        <label className="mb-2 block text-[15px] font-medium text-slate-700">Account Type</label>
        <div className="grid grid-cols-3 gap-2">
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
              {label}
            </button>
          ))}
        </div>
        <input type="hidden" name="accountType" value={accountType} />
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[15px] font-medium text-slate-700">Email</label>
          <input
            type="email"
            name="email"
            required
            placeholder="Enter your email"
            className="w-full rounded-xl border border-[#dfe5ef] bg-[#dfeaf9] px-3.5 py-3 text-[15px] text-slate-800 outline-none transition focus:border-[#1b50d6] focus:bg-white"
          />
          {errors.email && <p className="mt-1.5 text-xs text-red-600" role="alert">{errors.email}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-[15px] font-medium text-slate-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              placeholder="Enter your password"
              className="w-full rounded-xl border border-[#dfe5ef] bg-[#dfeaf9] px-3.5 py-3 pr-11 text-[15px] text-slate-800 outline-none transition focus:border-[#1b50d6] focus:bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-[#1b50d6]"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1.5 text-xs text-red-600" role="alert">{errors.password}</p>}
          <div className="mt-3 text-center">
            <Link href="/forgot-password" className="text-[15px] font-medium text-[#1b50d6] transition hover:underline">
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-gradient-to-r from-[#0a5ad7] to-[#1a74ff] py-3 text-[18px] font-semibold text-white shadow-[0_12px_20px_rgba(31,90,232,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Logging in..." : "Login"}
      </button>

      <div className="relative my-2 text-center text-[13px] text-slate-400">
        <span className="relative z-10 bg-[#f7f8fa] px-2">or</span>
        <span className="absolute inset-x-0 top-1/2 -z-10 h-px -translate-y-1/2 bg-[#dfe5ef]" />
      </div>

      <GoogleButton />

      <p className="pt-2 text-center text-[15px] text-slate-500">
        Don&apos;t have an account? <Link href="/register" className="font-medium text-[#1b50d6] hover:underline">Register</Link>
      </p>
    </form>
  );
}
