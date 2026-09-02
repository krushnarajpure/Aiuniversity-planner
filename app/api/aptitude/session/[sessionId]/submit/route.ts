import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;
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
            include: {
                test: true,
                answers: true,
            },
        });

        if (!testSession || testSession.userId !== user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Calculate score
        const correctAnswers = testSession.answers.filter((a) => a.isCorrect).length;
        const wrongAnswers = testSession.answers.filter((a) => !a.isCorrect && a.selectedOption).length;
        const unanswered = testSession.totalQuestions - testSession.answers.length;

        const correctMarks = correctAnswers * testSession.test.correctMarkPerQ;
        const negativeMarks = wrongAnswers * testSession.test.negativeMarkPerQ;
        const totalScore = Math.max(0, correctMarks - negativeMarks);
        const accuracy =
            testSession.answers.length > 0
                ? (correctAnswers / testSession.answers.length) * 100
                : 0;

        const timeTaken = Math.floor(
            (new Date().getTime() - testSession.startedAt.getTime()) / 1000
        );

        // Update session
        const completedSession = await prisma.aptitudeTestSession.update({
            where: { id: sessionId },
            data: {
                status: "COMPLETED",
                completedAt: new Date(),
                correctAnswers,
                wrongAnswers,
                unansweredCount: unanswered,
                score: totalScore,
                accuracy,
                timeTakenSeconds: timeTaken,
            },
        });

        // Create result record
        await prisma.aptitudeResult.create({
            data: {
                userId: user.id,
                testId: testSession.testId,
                score: totalScore,
                totalQuestions: testSession.totalQuestions,
                category: testSession.test.difficulty,
            },
        });

        // Update or create user stats
        const stats = await prisma.aptitudeStats.findUnique({
            where: { userId: user.id },
        });

        if (stats) {
            const newTotalTests = stats.completedTests + 1;
            const newBestScore = stats.bestScore ? Math.max(stats.bestScore, totalScore) : totalScore;
            const prevAvgScore = stats.averageScore || 0;
            const prevAvgAccuracy = stats.averageAccuracy || 0;

            const newAverageScore =
                (prevAvgScore * stats.completedTests + totalScore) / newTotalTests;
            const newAverageAccuracy =
                (prevAvgAccuracy * stats.completedTests + accuracy) / newTotalTests;

            await prisma.aptitudeStats.update({
                where: { userId: user.id },
                data: {
                    completedTests: newTotalTests,
                    bestScore: newBestScore,
                    averageScore: newAverageScore,
                    averageAccuracy: newAverageAccuracy,
                    totalQuestionsAttempted: stats.totalQuestionsAttempted + testSession.totalQuestions,
                    totalCorrect: stats.totalCorrect + correctAnswers,
                    totalWrong: stats.totalWrong + wrongAnswers,
                    totalTimeSeconds: stats.totalTimeSeconds + timeTaken,
                },
            });
        } else {
            await prisma.aptitudeStats.create({
                data: {
                    userId: user.id,
                    totalTests: 1,
                    completedTests: 1,
                    bestScore: totalScore,
                    averageScore: totalScore,
                    averageAccuracy: accuracy,
                    totalQuestionsAttempted: testSession.totalQuestions,
                    totalCorrect: correctAnswers,
                    totalWrong: wrongAnswers,
                    totalTimeSeconds: timeTaken,
                },
            });
        }

        return NextResponse.json({
            sessionId: completedSession.id,
            score: totalScore,
            accuracy,
            correctAnswers,
            wrongAnswers,
            unanswered,
        });
    } catch (error) {
        console.error("Error submitting test:", error);
        return NextResponse.json(
            { error: "Failed to submit test" },
            { status: 500 }
        );
    }
}
