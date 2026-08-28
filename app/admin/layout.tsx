import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await requireAdmin();
    return <AdminShell name={session.user.name} email={session.user.email}>{children}</AdminShell>;
}