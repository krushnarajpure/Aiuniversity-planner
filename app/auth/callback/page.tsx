"use client";

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function completeSignIn() {
      try {
        const session = await getSession();
        if (!session?.user?.id) throw new Error("NextAuth session was not created.");
        router.replace(session?.user?.role === "ADMIN" ? "/admin" : "/dashboard");
        router.refresh();
      } catch (caught) {
        if (active) {
          const oauthError = new URLSearchParams(window.location.search).get("error");
          setError(oauthError ? `Google sign-in failed: ${oauthError}` : "Google sign-in could not be completed. Please try again.");
        }
      }
    }
    void completeSignIn();
    return () => { active = false; };
  }, [router]);

  return <main className="flex min-h-screen items-center justify-center bg-background-light px-4 dark:bg-background-dark"><div className="card w-full max-w-sm text-center"><p className="text-small text-slate-500 dark:text-slate-400">{error || "Completing Google sign-in..."}</p>{error && <button type="button" onClick={() => router.replace("/login")} className="mt-4 rounded-xl bg-primary px-4 py-2 text-small font-medium text-white">Back to Login</button>}</div></main>;
}