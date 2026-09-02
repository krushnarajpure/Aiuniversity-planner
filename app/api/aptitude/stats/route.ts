import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
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

    // Fetch stats separately
    const stats = await prisma.aptitudeStats.findUnique({
      where: { userId: user.id },
    });

    // Return stats or default empty stats
    const response = stats || {
      userId: user.id,
      totalTests: 0,
      completedTests: 0,
      bestScore: null,
      averageScore: null,
      averageAccuracy: null,
      currentStreak: 0,
      longestStreak: 0,
      totalQuestionsAttempted: 0,
      totalCorrect: 0,
      totalWrong: 0,
      totalTimeSeconds: 0,
      updatedAt: new Date(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching aptitude stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch aptitude statistics" },
      { status: 500 }
    );
  }
}
