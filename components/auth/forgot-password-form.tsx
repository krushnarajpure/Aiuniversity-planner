"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      toast.error("Please enter your email address.");
      return;
    }
    setPending(true);
    try {
      const { error } = await getSupabaseBrowser().auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        console.error("Supabase password reset error:", {
          message: error.message,
          name: error.name,
          status: error.status,
          code: error.code,
        });
        toast.error(error.message || "Could not send the reset link. Please try again.");
        return;
      }
      toast.success("If an account exists for that email, a password reset link has been sent.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not request a password reset.";
      console.error("Supabase password reset request failed:", message);
      toast.error(message || "Could not request a password reset. Please try again.");
    } finally {
      setPending(false);
    }
  }
  return <form onSubmit={submit} className="space-y-4"><div><label className="text-small font-medium block mb-1">Email</label><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@university.edu" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary" /></div><button type="submit" disabled={pending} className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 font-medium hover:opacity-90 transition disabled:opacity-50">{pending ? "Sending..." : "Send reset link"}</button><p className="text-small text-center mt-6 text-slate-500 dark:text-slate-400"><Link href="/login" className="text-primary hover:underline">Back to Login</Link></p></form>;
}
