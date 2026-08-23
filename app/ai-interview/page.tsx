import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getCopilotContext } from "@/lib/copilot";
import { AppShell } from "@/components/layout/app-shell";
import { InterviewClient } from "@/components/ai-interview/interview-client";

export default async function AIInterviewPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/login");
    const context = await getCopilotContext(session.user.id);
    return <AppShell userName={session.user.name}><InterviewClient context={context} userName={session.user.name ?? "there"} /></AppShell>;
}
