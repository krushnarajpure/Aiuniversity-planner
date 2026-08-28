import Link from "next/link";
import { ArrowRight, FileCheck2, FileText, MessageSquareText, ShieldCheck } from "lucide-react";

const capabilities = [
  { icon: FileText, title: "Create documents", text: "Applications, letters, reports, and formal requests from your real details." },
  { icon: ShieldCheck, title: "Protect your format", text: "Upload your college template and keep the original separate from the working copy." },
  { icon: FileCheck2, title: "Review before export", text: "Edit the generated content, inspect the PDF preview, and download when ready." },
  { icon: MessageSquareText, title: "Communicate clearly", text: "Open a reviewed draft in Gmail or copy a channel-ready version for messaging." },
];

export function DocumentWorkspaceSection() {
  return (
    <section className="bg-background-dark py-24 text-slate-100">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <span className="text-small font-medium uppercase tracking-wider text-primary">New workspace</span>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Your college documents deserve the same clarity as your study plan.</h2>
          <p className="mt-5 max-w-lg leading-relaxed text-slate-400">
            Draft an email, build an application, or understand an uploaded format. AI assists with the writing while you stay in control of every fact and final edit.
          </p>
          <Link href="/email-assistant" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground transition hover:opacity-90">
            Open Document Workspace <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {capabilities.map((item) => (
            <div key={item.title} className="rounded-xl border border-white/10 bg-white/[0.05] p-5">
              <item.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-4 font-semibold">{item.title}</h3>
              <p className="mt-2 text-small leading-relaxed text-slate-400">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}