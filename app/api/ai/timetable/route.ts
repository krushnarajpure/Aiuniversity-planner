import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { addCollegeTimetableEntries, type CollegeTimetableEntryInput } from "@/actions/college-timetable";

const entrySchema = z.object({
  courseName: z.string().trim().default("Unclear"),
  courseCode: z.string().trim().default("Unclear"),
  facultyName: z.string().trim().nullable().default(null),
  day: z.string().trim(),
  startTime: z.string().trim(),
  endTime: z.string().trim(),
  room: z.string().trim().nullable().default(null),
});
const requestSchema = z.object({ action: z.enum(["analyze", "save"]), imageDataUrl: z.string().max(12000000).optional(), entries: z.array(entrySchema).max(100).optional(), language: z.string().max(40).default("English") });

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "Please sign in to use timetable import." }, { status: 401 });
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: "Please provide a valid timetable image." }, { status: 400 });
  if (parsed.data.action === "save") {
    try {
      const result = await addCollegeTimetableEntries((parsed.data.entries || []) as CollegeTimetableEntryInput[]);
      return NextResponse.json({ success: true, ...result, message: result.added ? "College timetable added successfully." : "These timetable entries already exist." });
    } catch (error) {
      return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Could not save timetable." }, { status: 500 });
    }
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ success: false, error: "Timetable analysis is not configured. Add GEMINI_API_KEY on the server." }, { status: 503 });
  if (!parsed.data.imageDataUrl) return NextResponse.json({ success: false, error: "Please attach a timetable image." }, { status: 400 });
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-3.6-flash"}:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: `Analyze the complete college timetable image. Read every visible row and cell. Do not guess. If a field is unreadable, use "Unclear" or null. Return ONLY JSON in this shape: {"entries":[{"courseName":"...","courseCode":"...","facultyName":"... or null","day":"Monday","startTime":"10:00 AM","endTime":"11:00 AM","room":"... or null"}]}. Include all distinct lectures. Answer language: ${parsed.data.language}.` }, { inline_data: { mime_type: parsed.data.imageDataUrl.match(/^data:([^;]+);/)?.[1] || "image/jpeg", data: parsed.data.imageDataUrl.replace(/^data:[^;]+;base64,/, "") } }] }], generationConfig: { temperature: 0.1, responseMimeType: "application/json", maxOutputTokens: 4000 } }),
    });
    if (!response.ok) {
      console.error("Timetable Gemini failure", response.status, (await response.text()).slice(0, 500));
      return NextResponse.json({ success: false, error: "Unable to analyze the timetable. Please check the image quality and try again." }, { status: 502 });
    }
    const data = await response.json();
    const raw = data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("");
    const json = JSON.parse(raw || "{}");
    const entries = z.object({ entries: z.array(entrySchema).max(100) }).parse(json).entries;
    return NextResponse.json({ success: true, entries, message: "Timetable detected successfully." });
  } catch (error) {
    console.error("Timetable analysis failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ success: false, error: "Unable to analyze the timetable. Please check the image quality and try again." }, { status: 500 });
  }
}
