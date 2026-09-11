import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { AIWorkspace } from "@/components/ai-copilot/ai-workspace";

export default async function AICopilotPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/login");
    return (
        <AppShell userName={session.user.name}>
            <AIWorkspace userName={session.user.name ?? "there"} />
        </AppShell>
    );
}
