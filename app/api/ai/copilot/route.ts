import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import {
  buildCopilotPrompt,
  copilotResponseSchema,
  COPILOT_MODES,
  getCopilotContext,
  type CopilotMode,
} from "@/lib/copilot";

const requestSchema = z.object({
  message: z.string().trim().min(1).max(10000),
  mode: z.enum(COPILOT_MODES).default("study-coach"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(6000),
      }),
    )
    .max(12)
    .default([]),
  language: z.string().trim().max(40).default("English"),
  imageDataUrl: z.string().max(12000000).optional(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json(
      { success: false, error: "Please sign in to use AI Copilot." },
      { status: 401 },
    );

  const parsed = requestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      {
        success: false,
        error: "Please enter a message under 10,000 characters.",
      },
      { status: 400 },
    );

  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  if (!geminiKey && !groqKey)
    return NextResponse.json(
      {
        success: false,
        error:
          "AI Copilot is not configured yet. Add GEMINI_API_KEY to the server environment.",
      },
      { status: 503 },
    );

  try {
    const context = await getCopilotContext(session.user.id);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const copilotMessages = buildCopilotPrompt(
      parsed.data.message,
      context,
      parsed.data.mode as CopilotMode,
      parsed.data.history,
      parsed.data.language,
    );
    const response = geminiKey
      ? await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-2.0-flash"}:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: copilotMessages
                        .map((item) => `${item.role}: ${item.content}`)
                        .join("\n\n"),
                    },
                    ...(parsed.data.imageDataUrl
                      ? [
                          {
                            inline_data: {
                              mime_type:
                                parsed.data.imageDataUrl.match(
                                  /^data:([^;]+);/,
                                )?.[1] || "image/jpeg",
                              data: parsed.data.imageDataUrl.replace(
                                /^data:[^;]+;base64,/,
                                "",
                              ),
                            },
                          },
                        ]
                      : []),
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.5,
                responseMimeType: "application/json",
                maxOutputTokens: 1800,
              },
            }),
            signal: controller.signal,
          },
        )
      : await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
            messages: copilotMessages,
            temperature: 0.5,
            max_tokens: 1800,
            response_format: { type: "json_object" },
          }),
          signal: controller.signal,
        }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      if (response.status === 429)
        return NextResponse.json(
          {
            success: false,
            error: "The AI is busy right now. Please try again in a moment.",
          },
          { status: 429 },
        );
      return NextResponse.json(
        {
          success: false,
          error: "The AI service is temporarily unavailable. Please try again.",
        },
        { status: 502 },
      );
    }

    const data = await response.json();
    const rawReply = geminiKey
      ? data.candidates?.[0]?.content?.parts
          ?.map((part: { text?: string }) => part.text || "")
          .join("")
      : data.choices?.[0]?.message?.content;
    if (typeof rawReply !== "string" || !rawReply.trim())
      throw new Error("Empty AI response");
    let parsedReply: unknown;
    try {
      parsedReply = JSON.parse(rawReply);
    } catch {
      parsedReply = null;
    }
    const structured = copilotResponseSchema.safeParse(parsedReply);
    if (structured.success)
      return NextResponse.json({
        success: true,
        response: structured.data,
        reply: structured.data.message,
      });
    const readableReply =
      parsedReply &&
      typeof parsedReply === "object" &&
      "message" in parsedReply &&
      typeof parsedReply.message === "string"
        ? parsedReply.message
        : rawReply.trim().startsWith("{")
          ? "I received a structured response I could not safely display. Please try again."
          : rawReply.trim();
    return NextResponse.json({
      success: true,
      response: { type: "text", message: readableReply },
      reply: readableReply,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "The AI took too long to respond. Please try again."
        : "I couldn't reach the AI right now. Please try again.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
