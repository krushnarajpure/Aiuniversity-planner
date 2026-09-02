import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { AptitudeTestSession } from "@/components/placement/aptitude-test-session";
import { prisma } from "@/lib/prisma";

export default async function TestSessionPage({
    params,
}: {
    params: Promise<{ sessionId: string }>;
}) {
    const { sessionId } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        redirect("/login");
    }

    // Verify the session belongs to this user
    const testSession = await prisma.aptitudeTestSession.findUnique({
        where: { id: sessionId },
    });

    if (!testSession || testSession.userId !== user.id) {
        redirect("/placement/aptitude");
    }

    return (
        <AppShell userName={session.user?.name}>
            <div className="p-6">
                <AptitudeTestSession sessionId={sessionId} />
            </div>
        </AppShell>
    );
}
