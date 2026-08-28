import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const { id } = await params;
  const conversation = await prisma.copilotConversation.findFirst({ where: { id, userId: session.user.id }, include: { messages: { orderBy: { createdAt: "asc" }, select: { id: true, role: true, content: true, createdAt: true } } } });
  if (!conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  return NextResponse.json({ messages: conversation.messages });
}
