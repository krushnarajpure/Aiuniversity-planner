import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enrichPresentation, fallbackPresentation, generationInputSchema, presentationSchema } from "@/lib/ppt";

const systemPrompt = `You are a senior presentation designer and academic tutor. Create a complete, study-material-quality presentation with a logical story. Return ONLY JSON with this shape: {title,subtitle,theme,slides:[{id,title,description,layout,visualType,background,notes,elements:[{id,type:"text"|"shape"|"image"|"diagram"|"chart"|"table"|"icon",content,x,y,width,height,fontSize,color,background,bold,align,variant,items,labels,values,columns,rows}]}]}. Use percentage coordinates from 0 to 100. Generate 3-6 useful points per content slide, vary layouts, use tasteful emojis in short labels when they improve recall, and use real structured diagrams, tables, charts and image elements when appropriate. Image element content may be a relevant public image URL. Never return placeholders, "insert image" text, blank slides, or repeated title-plus-paragraph layouts. Charts must be marked example data unless supplied by the user. Do not use markdown.`;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in to create a presentation." }, { status: 401 });
  const parsed = generationInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please provide a longer presentation prompt." }, { status: 400 });

  let document = fallbackPresentation(parsed.data);
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  if (geminiKey || groqKey) {
    try {
      const response = geminiKey
        ? await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-3.6-flash"}:generateContent?key=${geminiKey}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nPresentation brief:\n${JSON.stringify(parsed.data)}` }] }], generationConfig: { temperature: 0.35, responseMimeType: "application/json", maxOutputTokens: 7000 } }) })
        : await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` }, body: JSON.stringify({ model: process.env.GROQ_MODEL || "openai/gpt-oss-20b", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: JSON.stringify(parsed.data) }], temperature: 0.35, response_format: { type: "json_object" } }) });
      if (response.ok) {
        const data = await response.json();
        const raw = geminiKey ? data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("") : data.choices?.[0]?.message?.content;
        const validated = presentationSchema.safeParse(raw ? JSON.parse(raw) : null);
        if (validated.success) document = enrichPresentation(validated.data);
      }
    } catch { /* Keep the deterministic local draft when AI is unavailable. */ }
  }

  const presentation = await prisma.presentation.create({ data: { userId: session.user.id, title: document.title, prompt: parsed.data.prompt, theme: document.theme, slides: document } });
  return NextResponse.json({ presentationId: presentation.id });
}
