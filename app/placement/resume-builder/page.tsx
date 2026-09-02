import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { ResumeBuilderClient } from "@/components/placement/resume-builder-client";

export default async function ResumeBuilderPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return (
        <AppShell userName={session.user?.name}>
            <ResumeBuilderClient />
        </AppShell>
    );
}
