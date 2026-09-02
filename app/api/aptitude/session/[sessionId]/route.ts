import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const { sessionId } = await params;
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const testSession = await prisma.aptitudeTestSession.findUnique({
            where: { id: sessionId },
        });

        if (!testSession || testSession.userId !== user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if session expired
        if (new Date() > new Date(testSession.expiresAt) && testSession.status === "IN_PROGRESS") {
            await prisma.aptitudeTestSession.update({
                where: { id: sessionId },
                data: { status: "EXPIRED" },
            });
            return NextResponse.json({ error: "Session expired" }, { status: 410 });
        }

        const durationSeconds = Math.max(
            1,
            Math.floor(
                (new Date(testSession.expiresAt).getTime() - new Date(testSession.startedAt).getTime()) / 1000
            )
        );

        return NextResponse.json({
            id: testSession.id,
            totalQuestions: testSession.totalQuestions,
            currentQuestionNo: testSession.currentQuestionNo,
            expiresAt: new Date(testSession.expiresAt).toISOString(),
            startedAt: new Date(testSession.startedAt).toISOString(),
            durationSeconds,
            status: testSession.status,
        });
    } catch (error) {
        console.error("Error fetching session:", error);
        return NextResponse.json(
            { error: "Failed to fetch session" },
            { status: 500 }
        );
    }
}
