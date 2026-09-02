import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { ResumeAnalyzerClient } from "@/components/placement/resume-analyzer-client";

export default async function ResumeAnalyzerPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return (
        <AppShell userName={session.user?.name}>
            <ResumeAnalyzerClient userName={session.user?.name ?? "Student"} userEmail={session.user?.email ?? ""} />
        </AppShell>
    );
}
