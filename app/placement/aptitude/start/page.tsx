import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { AptitudeStartTest } from "@/components/placement/aptitude-start-test";

export default async function AptitudeStartTestPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        redirect("/login");
    }

    return (
        <AppShell userName={session.user?.name}>
            <div className="p-6">
                <AptitudeStartTest userEmail={session.user.email} />
            </div>
        </AppShell>
    );
}
