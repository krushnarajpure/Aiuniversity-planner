"use client";

import { useState, useTransition } from "react";
import { Megaphone, Send } from "lucide-react";
import { toast } from "sonner";
import { sendAdminNotification } from "@/actions/admin";

export function AdminNotificationComposer() {
  const [isPending, startTransition] = useTransition();
  const [audience, setAudience] = useState("STUDENT");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await sendAdminNotification(formData);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      form.reset();
      setAudience("STUDENT");
    });
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Megaphone className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold">Send a notification</h2>
          <p className="mt-1 text-sm text-slate-500">Send an announcement directly to users&apos; notification inboxes.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
          <label className="text-sm font-medium">
            Title
            <input name="title" required maxLength={160} placeholder="Important campus update" className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-950" />
          </label>
          <label className="text-sm font-medium">
            Audience
            <select name="audience" value={audience} onChange={(event) => setAudience(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-950">
              <option value="STUDENT">Students</option>
              <option value="ORGANIZATION">Organizations</option>
              <option value="ALL">Everyone</option>
            </select>
          </label>
        </div>
        <label className="block text-sm font-medium">
          Message
          <textarea name="message" required maxLength={2000} rows={4} placeholder="Write the announcement..." className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-950" />
        </label>
        <button type="submit" disabled={isPending} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
          <Send className="h-4 w-4" />
          {isPending ? "Sending..." : "Send notification"}
        </button>
      </form>
    </section>
  );
}
