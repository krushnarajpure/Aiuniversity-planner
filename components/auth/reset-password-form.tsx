"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    try {
      getSupabaseBrowser().auth.getSession().then(({ data }) => setHasSession(Boolean(data.session)));
    } catch {
      setHasSession(false);
    }
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setPending(true);
    try {
      const { error } = await getSupabaseBrowser().auth.updateUser({ password });
      if (error) {
        toast.error("Could not update your password. The reset link may be invalid or expired.");
        return;
      }
      setSuccess(true);
      toast.success("Password updated successfully. You can now log in.");
    } catch {
      toast.error("Could not update your password. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (success) return <p className="text-small text-center text-slate-500 dark:text-slate-400">Your password was updated successfully. <Link href="/login" className="text-primary hover:underline">Back to Login</Link></p>;
  if (hasSession === false) return <div className="space-y-4"><p className="text-small text-center text-danger">This password reset link is invalid or expired.</p><p className="text-small text-center text-slate-500 dark:text-slate-400"><Link href="/forgot-password" className="text-primary hover:underline">Request a new link</Link></p></div>;
  return <form onSubmit={submit} className="space-y-4"><div><label className="text-small font-medium block mb-1">New Password</label><input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary" /></div><div><label className="text-small font-medium block mb-1">Confirm Password</label><input type="password" required minLength={8} value={confirm} onChange={(event) => setConfirm(event.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary" /></div><button type="submit" disabled={pending || hasSession !== true} className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 font-medium hover:opacity-90 transition disabled:opacity-50">{pending ? "Updating..." : "Reset Password"}</button><p className="text-small text-center mt-6 text-slate-500 dark:text-slate-400"><Link href="/login" className="text-primary hover:underline">Back to Login</Link></p></form>;
}
