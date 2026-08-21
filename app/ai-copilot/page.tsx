import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getCopilotContext } from "@/lib/copilot";
import { AppShell } from "@/components/layout/app-shell";
import { CopilotClient } from "@/components/ai-copilot/copilot-client";

export default async function AICopilotPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/login");
    const context = await getCopilotContext(session.user.id);

    return (
        <AppShell userName={session.user.name}>
            <CopilotClient context={context} userName={session.user.name ?? "there"} />
        </AppShell>
    );
}
