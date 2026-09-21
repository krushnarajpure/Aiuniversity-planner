import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { createAvishuLiveToken } from "@/lib/avishu-live-token";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Please sign in to use Avishu Live." }, { status: 401 });

  const requestedId = new URL(request.url).searchParams.get("conversationId");
  const existing = requestedId
    ? await prisma.copilotConversation.findFirst({ where: { id: requestedId, userId }, select: { id: true } })
    : null;
  const conversation = existing || await prisma.copilotConversation.create({ data: { userId, title: "Avishu voice chat" }, select: { id: true } });

  try {
    return NextResponse.json({
      token: createAvishuLiveToken(userId, conversation.id),
      conversationId: conversation.id,
      liveUrl: process.env.AVISHU_LIVE_WS_URL || "ws://localhost:8787/live",
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Avishu Live is not configured." }, { status: 503 });
  }
}
