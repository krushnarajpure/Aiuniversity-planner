import { prisma } from "@/lib/prisma";
import { UserActions } from "@/components/admin/user-actions";

export const dynamic = "force-dynamic";

export default async function ManageUsersPage() {
  const users = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true, name: true, email: true, isSuspended: true },
    orderBy: { createdAt: "desc" },
  });

  return <section className="p-6 lg:p-8"><div className="mb-8"><p className="text-sm font-medium text-primary">Account controls</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Manage students</h1><p className="mt-2 text-sm text-slate-500">Suspend access temporarily or permanently delete student accounts.</p></div><div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">{users.length === 0 ? <p className="p-6 text-sm text-slate-500">No student accounts found.</p> : <div className="divide-y divide-slate-100 dark:divide-slate-800">{users.map(user => <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4" key={user.id}><div><p className="font-medium">{user.name}</p><p className="text-sm text-slate-500">{user.email}</p><p className={`mt-1 text-xs ${user.isSuspended ? "text-red-600" : "text-emerald-600"}`}>{user.isSuspended ? "Suspended" : "Active"}</p></div><UserActions userId={user.id} isSuspended={user.isSuspended} /></div>)}</div>}</div></section>;
}
