"use client";

import { deleteUser, toggleUserSuspension } from "@/actions/admin";

export function UserActions({ userId, isSuspended }: { userId: string; isSuspended: boolean }) {
  return <div className="flex flex-wrap gap-2"><form action={toggleUserSuspension}><input type="hidden" name="userId" value={userId} /><button type="submit" className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950">{isSuspended ? "Enable" : "Suspend"}</button></form><form action={deleteUser} onSubmit={(event) => { if (!window.confirm("Delete this student and all associated data?")) event.preventDefault(); }}><input type="hidden" name="userId" value={userId} /><button type="submit" className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950">Delete</button></form></div>;
}