import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { buildCopilotPrompt, COPILOT_MODES, getCopilotContext, type CopilotMode } from "@/lib/copilot";

const requestSchema = z.object({
    message: z.string().trim().min(1).max(4000),
    mode: z.enum(COPILOT_MODES).default("study-coach"),
    history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(6000) })).max(12).default([]),
});

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Please sign in to use AI Copilot." }, { status: 401 });

    const parsed = requestSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ success: false, error: "Please enter a message under 4,000 characters." }, { status: 400 });

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return NextResponse.json({ success: false, error: "AI Copilot is not configured yet. Add GROQ_API_KEY to the server environment." }, { status: 503 });

    try {
        const context = await getCopilotContext(session.user.id);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
                messages: buildCopilotPrompt(parsed.data.message, context, parsed.data.mode as CopilotMode, parsed.data.history),
                temperature: 0.5,
                max_tokens: 1200,
            }),
            signal: controller.signal,
        }).finally(() => clearTimeout(timeout));

        if (!response.ok) {
            if (response.status === 429) return NextResponse.json({ success: false, error: "The AI is busy right now. Please try again in a moment." }, { status: 429 });
            return NextResponse.json({ success: false, error: "The AI service is temporarily unavailable. Please try again." }, { status: 502 });
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;
        if (typeof reply !== "string" || !reply.trim()) throw new Error("Empty AI response");
        return NextResponse.json({ success: true, reply: reply.trim() });
    } catch (error) {
        const message = error instanceof Error && error.name === "AbortError" ? "The AI took too long to respond. Please try again." : "I couldn't reach the AI right now. Please try again.";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
