import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft, Download, ExternalLink, FileText } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getOrganizationApplication } from "@/actions/organization";
import { AppShell } from "@/components/layout/app-shell";

type FormData = { answers?: Record<string, unknown>; documents?: Record<string, { name?: string; type?: string; size?: number; dataUrl?: string }> };

function date(value: Date | string | null | undefined) {
    return value ? new Date(value).toLocaleString() : "Not provided";
}

function value(value: unknown) {
    if (value === null || value === undefined || value === "") return "Not provided";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
}

export default async function OrganizationApplicantPage({ params }: { params: Promise<{ applicationId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    if (session.user?.role !== "ORGANIZATION") redirect("/dashboard");
    const application = await getOrganizationApplication((await params).applicationId);
    if (!application) notFound();

    const formData = application.formData && typeof application.formData === "object" && !Array.isArray(application.formData) ? application.formData as FormData : {};
    const documents = Object.values(formData.documents ?? {});
    const answers = Object.entries(formData.answers ?? {});

    return <AppShell userName={application.job.organization.companyName}><div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <Link href="/organization/applicants" className="inline-flex items-center gap-2 text-small text-primary"><ArrowLeft className="h-4 w-4" /> Applicants</Link>
        <header className="card space-y-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-small font-medium text-primary">Applicant profile</p><h1 className="text-heading font-semibold">{application.student.name}</h1><p className="mt-1 text-small text-slate-500">{application.job.title} · {application.job.organization.companyName}</p></div><span className="rounded-full bg-primary/10 px-3 py-1 text-small text-primary">{application.status.replaceAll("_", " ")}</span></div><div className="grid gap-3 text-small sm:grid-cols-3"><Info label="Application ID" value={application.id} /><Info label="Applied" value={date(application.appliedAt)} /><Info label="Last updated" value={date(application.updatedAt)} /></div></header>
        <section className="card"><h2 className="text-card-title font-semibold">Personal and academic information</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Info label="Email" value={application.student.email} /><Info label="University" value={application.student.university} /><Info label="Department" value={application.student.department} /><Info label="CGPA" value={value(application.student.cgpa)} /><Info label="Profile skills" value={value(application.student.placementProfile?.skills)} /><Info label="Resume score" value={value(application.student.placementProfile?.resumeScore)} /></div></section>
        <section className="card"><h2 className="text-card-title font-semibold">Application form responses</h2>{answers.length ? <div className="mt-4 space-y-3">{answers.map(([label, answer]) => <div key={label} className="border-b border-slate-100 pb-3 text-small dark:border-slate-700"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 whitespace-pre-wrap">{value(answer)}</p></div>)}</div> : <p className="mt-3 text-small text-slate-500">No additional responses were submitted.</p>}</section>
        <section className="card"><h2 className="text-card-title font-semibold">Submitted documents</h2>{documents.length ? <div className="mt-4 space-y-3">{documents.map((document, index) => <div key={`${document.name}-${index}`} className="flex flex-col gap-3 border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700"><div className="flex items-center gap-3"><FileText className="h-5 w-5 text-primary" /><div><p className="text-small font-medium">{document.name || "Document"}</p><p className="text-xs text-slate-500">{document.type || "File"}{document.size ? ` · ${Math.round(document.size / 1024)} KB` : ""}</p></div></div>{document.dataUrl && <div className="flex gap-3 text-small"><a href={document.dataUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary"><ExternalLink className="h-4 w-4" /> View</a><a href={document.dataUrl} download={document.name || "document"} className="inline-flex items-center gap-1 text-primary"><Download className="h-4 w-4" /> Download</a></div>}</div>)}</div> : <p className="mt-3 text-small text-slate-500">No documents submitted.</p>}</section>
        {application.interviews.length > 0 && <section className="card"><h2 className="text-card-title font-semibold">Interview history</h2><div className="mt-4 space-y-3">{application.interviews.map((interview) => <div key={interview.id} className="border-l-2 border-primary pl-3 text-small"><p className="font-medium">{interview.title} · {interview.status}</p><p className="text-slate-500">{date(interview.scheduledDate)} · {interview.mode}</p></div>)}</div></section>}
    </div></AppShell>;
}

function Info({ label, value: content }: { label: string; value: unknown }) { return <div className="border border-slate-200 p-3 dark:border-slate-700"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 break-words text-small font-medium">{value(content)}</p></div>; }