"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function completeSignIn() {
      try {
        const supabase = getSupabaseBrowser();
        const code = new URLSearchParams(window.location.search).get("code");
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !data.session) throw sessionError || new Error("Google session was not created.");
        window.history.replaceState(window.history.state, document.title, window.location.pathname);
        const result = await signIn("supabase-google", { accessToken: data.session.access_token, redirect: false });
        if (result?.error) throw new Error("Google account could not be connected to this application.");
        router.replace("/dashboard");
        router.refresh();
      } catch (caught) {
        console.error("Google callback failed:", caught instanceof Error ? caught.message : caught);
        if (active) setError("Google sign-in could not be completed. Please try again.");
      }
    }
    void completeSignIn();
    return () => { active = false; };
  }, [router]);

  return <main className="flex min-h-screen items-center justify-center bg-background-light px-4 dark:bg-background-dark"><div className="card w-full max-w-sm text-center"><p className="text-small text-slate-500 dark:text-slate-400">{error || "Completing Google sign-in..."}</p>{error && <button type="button" onClick={() => router.replace("/login")} className="mt-4 rounded-xl bg-primary px-4 py-2 text-small font-medium text-white">Back to Login</button>}</div></main>;
}