import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
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

        if (testSession.status !== "IN_PROGRESS") {
            return NextResponse.json({ error: "This test session is no longer active." }, { status: 409 });
        }

        if (new Date() > new Date(testSession.expiresAt)) {
            await prisma.aptitudeTestSession.update({ where: { id: testSession.id }, data: { status: "EXPIRED" } });
            return NextResponse.json({ error: "This test session has expired." }, { status: 410 });
        }

        const { questionNumber, answer } = await request.json();

        const questionNo = parseInt(questionNumber);
        if (questionNo < 1 || questionNo > testSession.totalQuestions) {
            return NextResponse.json({ error: "Invalid question number" }, { status: 400 });
        }

        // Get the question
        const test = await prisma.aptitudeTest.findUnique({
            where: { id: testSession.testId },
            include: {
                questions: {
                    orderBy: { displayOrder: "asc" },
                    include: { options: true },
                },
            },
        });

        if (!test) {
            return NextResponse.json({ error: "Test not found" }, { status: 404 });
        }

        const question = test.questions[questionNo - 1];
        if (!question) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 });
        }

        // Check if answer is correct
        const selectedOption = question.options.find((opt) => opt.id === answer);
        const isCorrect = selectedOption?.isCorrect || false;

        if (answer) {
            await prisma.aptitudeAnswer.upsert({
                where: {
                    sessionId_questionId: {
                        sessionId: testSession.id,
                        questionId: question.id,
                    },
                },
                create: {
                    sessionId: testSession.id,
                    questionId: question.id,
                    selectedOption: answer,
                    isCorrect,
                },
                update: {
                    selectedOption: answer,
                    isCorrect,
                },
            });
        } else {
            await prisma.aptitudeAnswer.deleteMany({
                where: {
                    sessionId: testSession.id,
                    questionId: question.id,
                },
            });
        }

        await prisma.aptitudeTestSession.update({
            where: { id: testSession.id },
            data: { currentQuestionNo: Math.min(testSession.totalQuestions, Math.max(testSession.currentQuestionNo, questionNo + 1)) },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving answer:", error);
        return NextResponse.json(
            { error: "Failed to save answer" },
            { status: 500 }
        );
    }
}
