"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      toast.error("Please enter your email address.");
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: normalizedEmail }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Unable to send reset email. Please try again.");
      setSent(true);
      toast.success("Password reset email sent. Check your inbox or spam folder.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send reset email. Please try again.";
      console.error("Password reset request failed:", message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  }
  return <form onSubmit={submit} className="space-y-4"><div><label className="text-small font-medium block mb-1">Email</label><input type="email" required value={email} onChange={(event) => { setEmail(event.target.value); setSent(false); }} placeholder="you@university.edu" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary" /></div>{sent && <p className="text-small text-success">Check your inbox and spam/junk folder for the reset link.</p>}<button type="submit" disabled={pending || sent} className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 font-medium hover:opacity-90 transition disabled:opacity-50">{pending ? "Sending reset email..." : sent ? "Email sent" : "Send reset link"}</button><p className="text-small text-center mt-6 text-slate-500 dark:text-slate-400"><Link href="/login" className="text-primary hover:underline">Back to Login</Link></p></form>;
}
