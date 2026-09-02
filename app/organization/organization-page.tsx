import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrganizationDashboard } from "@/actions/organization";
import { AppShell } from "@/components/layout/app-shell";
import { OrganizationClient } from "@/components/organization/organization-client";

export async function OrganizationPage({ view }: { view: string }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    if (session.user?.role !== "ORGANIZATION") redirect("/dashboard");
    let data;
    try {
        data = await getOrganizationDashboard();
    } catch {
        redirect("/login?callbackUrl=/organization");
    }
    return <AppShell userName={data.organization?.companyName ?? session.user.name}><OrganizationClient data={data} view={view} /></AppShell>;
}
