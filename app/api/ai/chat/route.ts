import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getCopilotContext } from "@/lib/copilot";
import { prisma } from "@/lib/prisma";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(12000),
});
const requestSchema = z.object({
  conversationId: z.string().cuid().optional(),
  message: z.string().trim().min(1).max(12000),
});

type ChatMessage = { role: "user" | "assistant"; content: string };

function systemPrompt(context: Awaited<ReturnType<typeof getCopilotContext>>) {
  return `You are the AI Co-pilot inside a modern University Planner application. You are a helpful, intelligent, friendly and professional general-purpose AI assistant. Answer the user's actual question directly. Do not restrict yourself to university topics: answer general knowledge, programming, study, writing, planning, productivity and everyday questions. Use conversation history for context. Ask a concise clarification only when necessary; otherwise make a reasonable assumption. Give accurate, useful, well-structured answers with examples when helpful. For coding questions, provide clean working code and explain it. Do not pretend to know current facts or capabilities you do not have. Current date: ${new Date().toISOString().slice(0, 10)}. Personal planner context, for recommendations only: ${JSON.stringify(context)}`;
}

async function getUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Please sign in to use AI Copilot." }, { status: 401 });
  const conversations = await prisma.copilotConversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: { id: true, title: true, updatedAt: true },
  });
  return NextResponse.json({ conversations });
}

export async function DELETE(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Conversation id is required." }, { status: 400 });
  await prisma.copilotConversation.deleteMany({ where: { id, userId } });
  return NextResponse.json({ success: true });
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Please sign in to use AI Copilot." }, { status: 401 });
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please enter a message under 12,000 characters." }, { status: 400 });
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI Copilot is not configured yet." }, { status: 503 });

  try {
    const conversation = parsed.data.conversationId
      ? await prisma.copilotConversation.findFirst({ where: { id: parsed.data.conversationId, userId } })
      : await prisma.copilotConversation.create({ data: { userId, title: parsed.data.message.slice(0, 60) } });
    if (!conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });

    await prisma.copilotMessage.create({ data: { conversationId: conversation.id, role: "user", content: parsed.data.message } });
    const stored = await prisma.copilotMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
      take: 12,
      select: { role: true, content: true },
    });
    const provider = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
        messages: [{ role: "system", content: systemPrompt(await getCopilotContext(userId)) }, ...stored.map((item) => ({ role: item.role as "user" | "assistant", content: item.content }))],
        temperature: 0.6,
        max_tokens: 1400,
        stream: true,
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!provider.ok || !provider.body) {
      const errorMessage = provider.status === 401 || provider.status === 403
        ? "AI Copilot configuration is invalid. Please check the server API key."
        : provider.status === 404
          ? "The configured AI model is unavailable. Please update GROQ_MODEL."
          : provider.status === 429
            ? "The AI is busy right now. Please try again in a moment."
            : "The AI service is temporarily unavailable. Please try again.";
      return NextResponse.json({ error: errorMessage }, { status: provider.status === 429 ? 429 : 502 });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let reply = "";
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = provider.body!.getReader();
          let buffer = "";
          const processLine = (line: string) => {
            if (!line.startsWith("data: ") || line === "data: [DONE]") return;
            const content = JSON.parse(line.slice(6)).choices?.[0]?.delta?.content;
            if (typeof content === "string") {
              reply += content;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          };
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) processLine(line);
          }
          if (buffer.trim()) processLine(buffer.trim());
          if (reply) await prisma.copilotMessage.create({ data: { conversationId: conversation.id, role: "assistant", content: reply } });
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, conversationId: conversation.id })}\n\n`));
          controller.close();
        } catch {
          controller.error(new Error("AI stream failed"));
        }
      },
    });
    return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" } });
  } catch (error) {
    const message = error instanceof Error && error.name === "TimeoutError"
      ? "The AI took too long to respond. Please try a shorter question."
      : "The AI service is temporarily unavailable. Please try again.";
    console.error("Copilot request failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
