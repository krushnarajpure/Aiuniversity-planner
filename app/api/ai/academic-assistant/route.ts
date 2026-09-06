import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";

const requestSchema = z.object({ message: z.string().trim().min(1), imageDataUrl: z.string().max(12000000).optional(), language: z.string().max(40).default("English") });
const extractionSchema = z.object({ intent: z.enum(["course", "timetable", "exam", "assignment", "study_material", "unclear"]), reply: z.string(), records: z.array(z.record(z.unknown())).max(100), missing: z.array(z.string()).default([]) });

const systemPrompt = `You are the AI Academic Assistant inside a university planner. Understand the user's natural-language request in any language and route it to exactly one academic section: course, timetable, exam, assignment, study_material, or unclear. Extract only information actually visible in the text/image. Never guess unreadable values; use "Unclear" or null and list important missing fields. If the user did not clearly ask to add/update academic records, use unclear and ask which section they want.
Return ONLY JSON: {"intent":"course|timetable|exam|assignment|study_material|unclear","reply":"natural response in the user's language","records":[{...}],"missing":["field"]}.
Record shapes:
course: courseName, courseCode, instructor, creditHours
 timetable: courseName, courseCode, facultyName, day, startTime, endTime, room
exam: courseName, courseCode, examType, date (ISO if readable), time, location, notes
assignment: title, courseName, courseCode, description, deadline (ISO if readable), difficulty EASY|MEDIUM|HARD, estimatedHours, notes
study_material: materialName, subject, unit, description, notesContent, tags array.
For multiple rows return multiple records. Preserve all readable rows. User language: `;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "Please sign in to use AI Academic Assistant." }, { status: 401 });
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: "Please enter a request or attach an image." }, { status: 400 });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ success: false, error: "AI Academic Assistant is not configured. Add GEMINI_API_KEY on the server." }, { status: 503 });
  try {
    const parts: Array<Record<string, unknown>> = [{ text: `${systemPrompt}${parsed.data.language}\n\nUser request:\n${parsed.data.message}` }];
    if (parsed.data.imageDataUrl) parts.push({ inline_data: { mime_type: parsed.data.imageDataUrl.match(/^data:([^;]+);/)?.[1] || "image/jpeg", data: parsed.data.imageDataUrl.replace(/^data:[^;]+;base64,/, "") } });
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-3.6-flash"}:generateContent?key=${key}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ role: "user", parts }], generationConfig: { temperature: 0.15, responseMimeType: "application/json", maxOutputTokens: 5000 } }) });
    if (!response.ok) { console.error("Academic assistant Gemini error", response.status, (await response.text()).slice(0, 500)); return NextResponse.json({ success: false, error: "Gemini could not analyze this request. Check the image quality or try again." }, { status: 502 }); }
    const data = await response.json();
    const raw = data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("");
    if (!raw) throw new Error(data.promptFeedback?.blockReason || "Empty Gemini response");
    const result = extractionSchema.safeParse(JSON.parse(raw));
    if (!result.success) throw new Error("Gemini returned an invalid academic record format");
    return NextResponse.json({ success: true, ...result.data });
  } catch (error) {
    console.error("Academic assistant failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ success: false, error: "I could not understand that academic request. Please clarify the section or use a clearer image." }, { status: 500 });
  }
}
