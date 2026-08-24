"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export function ResetPasswordForm() {
  const router = useRouter(); const params = useSearchParams(); const token = params.get("token") || ""; const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState(""); const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); if (password !== confirm) { toast.error("Passwords do not match."); return; } setPending(true); try { const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) }); const data = await response.json(); if (!response.ok || !data.success) { toast.error(data.message || "Could not reset password."); return; } toast.success(data.message); router.push("/login"); } catch { toast.error("Could not reset password. Please try again."); } finally { setPending(false); } }
  return <form onSubmit={submit} className="space-y-4"><div><label className="text-small font-medium block mb-1">New Password</label><input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary" /></div><div><label className="text-small font-medium block mb-1">Confirm Password</label><input type="password" required minLength={8} value={confirm} onChange={(event) => setConfirm(event.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary" /></div><button type="submit" disabled={pending || !token} className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 font-medium hover:opacity-90 transition disabled:opacity-50">{pending ? "Resetting..." : "Reset Password"}</button><p className="text-small text-center mt-6 text-slate-500 dark:text-slate-400"><Link href="/login" className="text-primary hover:underline">Back to Login</Link></p></form>;
}
