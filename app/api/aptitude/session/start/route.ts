import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const SAMPLE_QUESTIONS = [
    {
        text: "What is 25% of 200?",
        type: "SINGLE_CHOICE" as const,
        category: "quantitative",
        difficulty: "EASY" as const,
        options: ["25", "50", "75", "100"],
        correctIndex: 1,
        explanation: "25% of 200 = 0.25 × 200 = 50",
    },
    {
        text: "If a car travels 100 km in 2 hours, what is its average speed?",
        type: "SINGLE_CHOICE" as const,
        category: "quantitative",
        difficulty: "EASY" as const,
        options: ["25 km/h", "50 km/h", "75 km/h", "100 km/h"],
        correctIndex: 1,
        explanation: "Average speed = Distance / Time = 100 / 2 = 50 km/h",
    },
    {
        text: "Complete the series: 2, 4, 8, 16, ?",
        type: "SINGLE_CHOICE" as const,
        category: "reasoning",
        difficulty: "EASY" as const,
        options: ["20", "24", "32", "48"],
        correctIndex: 2,
        explanation: "Each number is doubled. 16 × 2 = 32",
    },
    {
        text: "Select the synonym of 'ephemeral':",
        type: "SINGLE_CHOICE" as const,
        category: "verbal",
        difficulty: "MEDIUM" as const,
        options: ["Permanent", "Temporary", "Continuous", "Lasting"],
        correctIndex: 1,
        explanation: "Ephemeral means lasting for a short time; temporary.",
    },
    {
        text: "What percentage of 500 is 125?",
        type: "SINGLE_CHOICE" as const,
        category: "quantitative",
        difficulty: "MEDIUM" as const,
        options: ["20%", "25%", "30%", "35%"],
        correctIndex: 1,
        explanation: "(125 / 500) × 100 = 25%",
    },
];

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized", message: "Please sign in to start a test." },
                { status: 401 }
            );
        }

        const { category, difficulty, questionCount, randomize, adaptive } =
            await request.json();

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found", message: "Your account could not be found. Please sign in again." },
                { status: 404 }
            );
        }

        const normalizedCategory = category?.toString().trim().toLowerCase();
        if (!normalizedCategory) {
            return NextResponse.json(
                { error: "Invalid category", message: "Please choose a valid test category." },
                { status: 400 }
            );
        }

        const normalizedDifficulty = String(difficulty || "MEDIUM").toUpperCase() as
            | "EASY"
            | "MEDIUM"
            | "HARD"
            | "EXPERT";

        // Get or create category
        let categoryRecord = await prisma.aptitudeCategory.findFirst({
            where: { name: { contains: normalizedCategory, mode: "insensitive" } },
        });

        if (!categoryRecord) {
            categoryRecord = await prisma.aptitudeCategory.create({
                data: {
                    name: normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1).replace(/-/g, " "),
                    description: `${normalizedCategory} questions for aptitude testing`,
                },
            });
        }

        const now = new Date();
        await prisma.aptitudeTestSession.updateMany({
            where: {
                userId: user.id,
                status: "IN_PROGRESS",
                expiresAt: { lte: now },
            },
            data: { status: "EXPIRED" },
        });

        const existingActiveSession = await prisma.aptitudeTestSession.findFirst({
            where: {
                userId: user.id,
                status: "IN_PROGRESS",
                expiresAt: { gt: now },
            },
            orderBy: { startedAt: "desc" },
            include: { test: true },
        });

        if (existingActiveSession && existingActiveSession.test.categoryId === categoryRecord.id) {
            return NextResponse.json({ sessionId: existingActiveSession.id });
        }

        const questionsData = SAMPLE_QUESTIONS.filter(
            (q) => q.category === normalizedCategory
        ).slice(0, questionCount);

        if (questionsData.length === 0) {
            return NextResponse.json(
                { error: "No questions found", message: `No questions are available for ${normalizedCategory}.` },
                { status: 400 }
            );
        }

        const test = await prisma.aptitudeTest.create({
            data: {
                categoryId: categoryRecord.id,
                title: `${categoryRecord.name} - ${normalizedDifficulty} - ${new Date().toISOString()}`,
                description: `Test your ${categoryRecord.name} skills`,
                difficulty: normalizedDifficulty,
                questionCount: questionCount,
                durationMinutes: Math.max(5, Math.round((questionCount / 20) * 30)),
                isActive: true,
                isPublished: true,
            },
        });

        const createdTest = await prisma.aptitudeTest.findUnique({
            where: { id: test.id },
            include: {
                questions: {
                    orderBy: { displayOrder: "asc" },
                    include: { options: { orderBy: { displayOrder: "asc" } } },
                },
            },
        });

        if (!createdTest) {
            return NextResponse.json(
                { error: "Test not created", message: "The aptitude test could not be created." },
                { status: 500 }
            );
        }

        await prisma.aptitudeQuestion.createMany({
            data: questionsData.map((q, idx) => ({
                testId: test.id,
                categoryId: categoryRecord.id,
                questionText: q.text,
                type: q.type,
                difficulty: q.difficulty,
                displayOrder: idx,
                isActive: true,
                explanation: q.explanation,
            })),
        });

        const createdQuestions = await prisma.aptitudeQuestion.findMany({
            where: { testId: test.id },
            orderBy: { displayOrder: "asc" },
        });

        const optionRecords = createdQuestions.flatMap((question, idx) => {
            const source = questionsData[idx];
            return source.options.map((opt, optIdx) => ({
                questionId: question.id,
                optionText: opt,
                optionLabel: String.fromCharCode(65 + optIdx),
                isCorrect: optIdx === source.correctIndex,
                displayOrder: optIdx,
            }));
        });

        if (optionRecords.length > 0) {
            await prisma.aptitudeOption.createMany({ data: optionRecords });
        }

        const finalTest = await prisma.aptitudeTest.findUnique({
            where: { id: test.id },
            include: {
                questions: {
                    orderBy: { displayOrder: "asc" },
                    include: { options: { orderBy: { displayOrder: "asc" } } },
                },
            },
        });

        if (!finalTest) {
            return NextResponse.json(
                { error: "Test not available", message: "The question set could not be loaded." },
                { status: 500 }
            );
        }

        let selectedQuestions = finalTest.questions;
        if (randomize) {
            selectedQuestions = [...selectedQuestions].sort(() => Math.random() - 0.5);
        }
        selectedQuestions = selectedQuestions.slice(0, questionCount);

        const testSession = await prisma.aptitudeTestSession.create({
            data: {
                userId: user.id,
                testId: test.id,
                totalQuestions: selectedQuestions.length,
                expiresAt: new Date(Date.now() + test.durationMinutes * 60 * 1000),
            },
        });

        return NextResponse.json({ sessionId: testSession.id });
    } catch (error) {
        console.error("Error starting test session:", error);
        return NextResponse.json(
            { error: "Failed to start test session", message: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
