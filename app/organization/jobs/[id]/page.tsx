import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/app-shell";

export default async function OrganizationJobPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    if (session.user?.role !== "ORGANIZATION") redirect("/dashboard");
    const organization = await prisma.organization.findUnique({ where: { userId: session.user.id } });
    if (!organization) redirect("/organization");
    const job = await prisma.placementJob.findFirst({ where: { id: (await params).id, organizationId: organization.id }, include: { _count: { select: { applications: true } } } });
    if (!job) notFound();

    return <AppShell userName={organization.companyName}><div className="space-y-6 p-4 sm:p-6 lg:p-8"><div><p className="text-small font-medium text-primary">Organization workspace</p><h1 className="text-heading font-semibold">{job.title}</h1><p className="mt-1 text-small text-slate-500">{job.location ?? "Location flexible"} · {job.jobType ?? "Role"}</p></div><section className="card max-w-3xl space-y-5"><div className="flex flex-wrap gap-2"><span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">{job.isActive ? "Active" : "Closed"}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{job._count.applications} applications</span></div><div><h2 className="text-card-title font-semibold">Description</h2><p className="mt-2 whitespace-pre-wrap text-small text-slate-600 dark:text-slate-300">{job.description}</p></div><div className="grid gap-3 sm:grid-cols-2"><div><p className="text-xs text-slate-500">Required skills</p><p className="mt-1 text-small">{job.requiredSkills.join(", ") || "Not specified"}</p></div><div><p className="text-xs text-slate-500">Salary</p><p className="mt-1 text-small">{job.salaryRange || "Not specified"}</p></div></div></section></div></AppShell>;
}
