import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await requireAdmin();
    return <AdminShell name={session.user.name}>{children}</AdminShell>;
}
