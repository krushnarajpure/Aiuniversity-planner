import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getRoadmapData } from "@/actions/roadmap";
import { AppShell } from "@/components/layout/app-shell";
import { RoadmapClient } from "@/components/placement/roadmap-client";

export default async function PlacementRoadmapPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    let data;
    try {
        data = await getRoadmapData();
    } catch {
        redirect("/login?callbackUrl=/placement/roadmap");
    }
    return <AppShell userName={session.user?.name}><RoadmapClient data={data} view="overview" /></AppShell>;
}
