"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { toast } from "sonner";

export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  const [pending, setPending] = useState(false);

  async function handleGoogleLogin() {
    setPending(true);
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || window.location.origin;
      const redirectTo = new URL("/auth/callback", siteUrl).toString();
      const { error } = await getSupabaseBrowser().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) throw error;
    } catch (error) {
      toast.error("Google sign-in could not be started. Please try again.");
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={pending}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white py-2.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      <span aria-hidden="true" className="text-base font-bold">G</span>
      {pending ? "Connecting to Google..." : label}
    </button>
  );
}
