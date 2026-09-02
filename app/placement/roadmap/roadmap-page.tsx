import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getRoadmapData } from "@/actions/roadmap";
import { AppShell } from "@/components/layout/app-shell";
import { RoadmapClient } from "@/components/placement/roadmap-client";

export async function RoadmapPage({ view, phaseId }: { view: string; phaseId?: string }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    let data;
    try {
        data = await getRoadmapData();
    } catch {
        redirect(`/login?callbackUrl=/placement/roadmap/${view}`);
    }
    return <AppShell userName={session.user?.name}><RoadmapClient data={data} view={view} phaseId={phaseId} /></AppShell>;
}
