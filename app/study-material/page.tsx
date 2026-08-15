import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getStudyMaterials, getStatistics, getSubjects } from "@/actions/study-material";
import { StudyMaterialClient } from "@/components/study-material/study-material-client";
import { AppShell } from "@/components/layout/app-shell";

export default async function StudyMaterialPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const [materials, stats, subjects] = await Promise.all([
        getStudyMaterials(),
        getStatistics(),
        getSubjects(),
    ]);

    return (
        <AppShell userName={session.user?.name}>
            <StudyMaterialClient
                initialMaterials={materials}
                subjects={subjects}
                stats={stats}
            />
        </AppShell>
    );
}
