import { RoadmapPage } from "../../roadmap-page";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <RoadmapPage view="phase" phaseId={id} />;
}