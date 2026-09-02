"use client";

import { useMemo, useState, useEffect } from "react";
import { Building2, CheckCircle2, Clock3, Search, ShieldAlert, XCircle, RefreshCw, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" });
}

type Organization = {
  id: string;
  companyName: string;
  industry: string | null;
  location: string | null;
  recruiterName: string | null;
  recruiterDesignation: string | null;
  verificationStatus: string;
  verificationMessage: string | null;
  user: { email: string; name: string; emailVerified: string | Date | null; createdAt: string | Date };
  _count: { jobs: number };
};

const statuses = ["ALL", "PENDING", "APPROVED", "REJECTED", "SUSPENDED"] as const;
type Filter = (typeof statuses)[number];
const metricIcons: { label: string; key: "all" | "pending" | "approved" | "rejected" | "suspended"; icon: LucideIcon }[] = [
  { label: "Total", key: "all", icon: Building2 },
  { label: "Pending", key: "pending", icon: Clock3 },
  { label: "Approved", key: "approved", icon: CheckCircle2 },
  { label: "Rejected", key: "rejected", icon: XCircle },
  { label: "Suspended", key: "suspended", icon: ShieldAlert },
];

function statusStyle(status: string) {
  if (status === "APPROVED" || status === "VERIFIED") return "bg-emerald-100 text-emerald-700";
  if (status === "REJECTED" || status === "SUSPENDED") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}

export function OrganizationApprovals({ organizations: initial }: { organizations: Organization[] }) {
  const [organizations, setOrganizations] = useState(initial);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<Organization | null>(null);
  const [reason, setReason] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const counts = useMemo(() => ({ all: organizations.length, pending: organizations.filter((item) => item.verificationStatus === "PENDING").length, approved: organizations.filter((item) => item.verificationStatus === "APPROVED" || item.verificationStatus === "VERIFIED").length, rejected: organizations.filter((item) => item.verificationStatus === "REJECTED").length, suspended: organizations.filter((item) => item.verificationStatus === "SUSPENDED").length }), [organizations]);
  const visible = organizations.filter((item) => (filter === "ALL" || item.verificationStatus === filter || (filter === "APPROVED" && item.verificationStatus === "VERIFIED")) && `${item.companyName} ${item.user.email} ${item.recruiterName ?? ""} ${item.industry ?? ""}`.toLowerCase().includes(query.toLowerCase()));

  async function changeStatus(id: string, nextStatus: "APPROVED" | "REJECTED" | "SUSPENDED", message?: string) {
    setBusy(id);
    try {
      const response = await fetch("/api/admin/organizations", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ organizationId: id, status: nextStatus, message }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to update organization status.");
      setOrganizations((items) => items.map((item) => item.id === id ? { ...item, verificationStatus: nextStatus, verificationMessage: message || (nextStatus === "APPROVED" ? "Organization approved by administrator." : nextStatus === "SUSPENDED" ? "Organization suspended by administrator." : "Registration requires changes.") } : item));
      setRejecting(null); setReason(""); toast.success(`Organization ${nextStatus.toLowerCase()}.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to update organization status."); } finally { setBusy(null); }
  }

  async function refreshOrganizations() {
    setRefreshing(true);
    try {
      const response = await fetch("/api/admin/organizations-list");
      if (!response.ok) throw new Error("Failed to refresh organizations");
      const data = await response.json();
      setOrganizations(data.organizations);
      toast.success("Organizations refreshed successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to refresh organizations");
    } finally {
      setRefreshing(false);
    }
  }

  // Auto-refresh every 10 seconds to catch email verification updates
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch("/api/admin/organizations-list");
        if (response.ok) {
          const data = await response.json();
          setOrganizations(data.organizations);
        }
      } catch (error) {
        console.error("Auto-refresh failed:", error);
      }
    }, 10000); // 10 seconds

    return () => clearInterval(pollInterval);
  }, []);

  return <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{metricIcons.map(({ label, key, icon: Icon }) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><p className="text-sm text-slate-500">{label}</p><Icon className="h-4 w-4 text-primary" /></div><p className="mt-3 text-2xl font-semibold">{counts[key]}</p></div>)}</div>
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-1 overflow-x-auto">{statuses.map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium ${filter === item ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>{item}</button>)}</div><div className="flex items-center gap-2"><div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"><Search className="h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search company or recruiter" className="w-full bg-transparent text-sm outline-none" /></div><button type="button" disabled={refreshing} onClick={refreshOrganizations} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /></button></div></div>
    {visible.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">No organizations match this filter.</div> : <div className="space-y-4">{visible.map((organization) => <article key={organization.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex flex-col gap-4 lg:flex-row lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold">{organization.companyName}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle(organization.verificationStatus)}`}>{organization.verificationStatus}</span></div><p className="mt-1 text-sm text-slate-500">{organization.industry || "Industry not provided"} · {organization.location || "Location not provided"}</p><p className="mt-3 text-sm">{organization.recruiterName || organization.user.name} · {organization.recruiterDesignation || "Recruiter"}</p><p className="mt-1 break-all text-xs text-slate-500">{organization.user.email} · {organization.user.emailVerified ? "Email verified" : "Email not verified"}</p></div><div className="flex flex-wrap gap-2"><button type="button" disabled={busy === organization.id || organization.verificationStatus === "APPROVED"} onClick={() => changeStatus(organization.id, "APPROVED")} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-50">Approve</button>{organization.verificationStatus === "APPROVED" && <button type="button" disabled={busy === organization.id} onClick={() => changeStatus(organization.id, "SUSPENDED")} className="rounded-lg bg-orange-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-50">Suspend</button>}{organization.verificationStatus === "SUSPENDED" && <button type="button" disabled={busy === organization.id} onClick={() => changeStatus(organization.id, "APPROVED")} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-50">Reactivate</button>}{organization.verificationStatus !== "REJECTED" && <button type="button" disabled={busy === organization.id} onClick={() => { setRejecting(organization); setReason(""); }} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-50">Reject</button>}</div></div><div className="mt-4 flex flex-col gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300 sm:flex-row sm:justify-between"><span>{organization.verificationMessage || "Awaiting administrator review."}</span><span>{organization._count.jobs} jobs · Registered {formatDate(organization.user.createdAt)}</span></div></article>)}</div>}
    {rejecting && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4"><div role="dialog" aria-modal="true" className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900"><h2 className="text-lg font-semibold">Reject organization registration</h2><p className="mt-1 text-sm text-slate-500">Add a reason for the recruiter.</p><textarea autoFocus value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason for rejection" className="mt-4 min-h-28 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-600" /><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setRejecting(null)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">Cancel</button><button type="button" disabled={!reason.trim() || busy === rejecting.id} onClick={() => changeStatus(rejecting.id, "REJECTED", reason.trim())} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50">Confirm rejection</button></div></div></div>}
  </div>;
}
