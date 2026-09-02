import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ sessionId: string; questionNumber: string }> }
) {
    const { sessionId, questionNumber } = await params;
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
            include: {
                test: {
                    include: {
                        questions: {
                            orderBy: { displayOrder: "asc" },
                            include: { options: { orderBy: { displayOrder: "asc" } } },
                        },
                    },
                },
            },
        });

        if (!testSession || testSession.userId !== user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const questionNo = parseInt(questionNumber);
        if (questionNo < 1 || questionNo > testSession.totalQuestions) {
            return NextResponse.json({ error: "Invalid question number" }, { status: 400 });
        }

        const question = testSession.test.questions[questionNo - 1];

        if (!question) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 });
        }

        return NextResponse.json({
            id: question.id,
            questionText: question.questionText,
            type: question.type,
            options: question.options.map((opt) => ({
                id: opt.id,
                optionLabel: opt.optionLabel,
                optionText: opt.optionText,
            })),
        });
    } catch (error) {
        console.error("Error fetching question:", error);
        return NextResponse.json(
            { error: "Failed to fetch question" },
            { status: 500 }
        );
    }
}
