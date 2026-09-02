import { getOrganizationApprovals } from "@/actions/organization-admin";
import { OrganizationApprovals } from "@/components/admin/organization-approvals";

export default async function AdminOrganizationsPage() {
    const organizations = await getOrganizationApprovals();
    return <section className="p-6 lg:p-8"><div className="mb-8"><p className="text-sm font-medium text-primary">Administration</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Organization approvals</h1><p className="mt-2 text-sm text-slate-500">Review and approve recruiter registrations before they can access organization tools.</p></div><OrganizationApprovals organizations={organizations} /></section>;
}