import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ArrowLeft, Presentation } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MyPresentationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const presentations = await prisma.presentation.findMany({ where: { userId: session.user.id }, orderBy: { updatedAt: "desc" } });
  return <main className="min-h-screen bg-[#f5f7fb] px-4 py-8 dark:bg-slate-950"><div className="mx-auto max-w-6xl"><Link href="/ai-tools/ppt-generator" className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft className="h-4 w-4" />PPT Generator</Link><div className="mt-8 flex items-end justify-between"><div><p className="text-sm font-medium text-cyan-700">Your workspace</p><h1 className="mt-1 text-3xl font-semibold dark:text-white">My Presentations</h1></div><Link href="/ai-tools/ppt-generator" className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white dark:bg-cyan-400 dark:text-slate-950">New presentation</Link></div>{presentations.length ? <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{presentations.map((presentation) => { const document = presentation.slides as { slides?: unknown[] }; return <Link key={presentation.id} href={`/ai-tools/ppt-generator/editor/${presentation.id}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-cyan-400 dark:border-slate-800 dark:bg-slate-900"><div className="flex aspect-video items-center justify-center bg-gradient-to-br from-cyan-50 to-slate-100 text-cyan-700 dark:from-cyan-950 dark:to-slate-800"><Presentation className="h-10 w-10 transition group-hover:scale-110" /></div><div className="p-4"><h2 className="truncate font-semibold dark:text-white">{presentation.title}</h2><p className="mt-1 text-xs text-slate-500">{document.slides?.length ?? 0} slides · Edited {presentation.updatedAt.toLocaleDateString()}</p></div></Link>})}</div> : <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">No presentations yet. Start with an idea and let AI shape it.</div>}</div></main>;
}
