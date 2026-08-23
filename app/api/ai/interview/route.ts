import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getCopilotContext } from "@/lib/copilot";

const setupSchema = z.object({ role: z.string().trim().min(1).max(100), experience: z.string().max(40), difficulty: z.enum(["easy", "medium", "hard", "expert"]), type: z.enum(["technical", "hr", "behavioral", "coding", "mixed", "full"]), duration: z.number().int().min(10).max(60), questionCount: z.number().int().min(1).max(20), company: z.string().max(100), jobDescription: z.string().max(12000), resume: z.string().max(12000), personality: z.enum(["professional", "friendly", "strict", "technical", "hr", "startup", "faang"]), });
const answerSchema = z.object({ question: z.string().max(4000), answer: z.string().max(10000), transcriptMetrics: z.object({ words: z.number().int().nonnegative(), durationSeconds: z.number().nonnegative(), fillers: z.number().int().nonnegative() }), setup: setupSchema, history: z.array(z.object({ question: z.string().max(4000), answer: z.string().max(10000), score: z.number().min(0).max(100) })).max(20) });
const requestSchema = z.discriminatedUnion("action", [z.object({ action: z.literal("start"), setup: setupSchema }), answerSchema.extend({ action: z.literal("answer") }), z.object({ action: z.literal("report"), setup: setupSchema, history: z.array(z.object({ question: z.string().max(4000), answer: z.string().max(10000), score: z.number().min(0).max(100) })).max(20) })]);

function systemPrompt(setup: z.infer<typeof setupSchema>, context: Awaited<ReturnType<typeof getCopilotContext>>) {
    return `You are a ${setup.personality} AI interviewer for a student. Target role: ${setup.role}. Experience: ${setup.experience}. Difficulty: ${setup.difficulty}. Interview type: ${setup.type}. Company: ${setup.company || "not specified"}. Use only supplied profile, courses, resume and job description. Never invent resume facts. Ask connected, role-relevant questions, adapt difficulty, and avoid repeating previous questions. Profile context: ${JSON.stringify(context)} Resume: ${setup.resume || "not provided"} Job description: ${setup.jobDescription || "not provided"}`;
}

async function askGroq(messages: { role: "system" | "user" | "assistant"; content: string }[]) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("AI Interview is not configured. Add GROQ_API_KEY to the server environment.");
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model: process.env.GROQ_MODEL || "openai/gpt-oss-20b", messages, temperature: 0.4, max_tokens: 1600, response_format: { type: "json_object" } }), signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error("AI provider request failed");
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("AI returned no content");
    return JSON.parse(content) as unknown;
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Please sign in to use AI Interview." }, { status: 401 });
    const parsed = requestSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ success: false, error: "Please check the interview setup and try again." }, { status: 400 });
    try {
        const context = await getCopilotContext(session.user.id);
        if (parsed.data.action === "start") {
            const result = await askGroq([{ role: "system", content: systemPrompt(parsed.data.setup, context) }, { role: "user", content: `Start the interview with a brief welcome and the first question. Return JSON: {"round":"Introduction|Resume Discussion|Technical Round|Coding Round|Behavioral Round|HR Round","difficulty":"easy|medium|hard|expert","question":string,"expectedTopics":string[]}` }]);
            const valid = z.object({ round: z.string(), difficulty: z.string(), question: z.string(), expectedTopics: z.array(z.string()).default([]) }).safeParse(result);
            if (!valid.success) throw new Error("Invalid interview question");
            return NextResponse.json({ success: true, question: valid.data });
        }
        if (parsed.data.action === "answer") {
            const result = await askGroq([{ role: "system", content: systemPrompt(parsed.data.setup, context) }, { role: "user", content: `Evaluate this answer and choose a relevant next question. Previous interview: ${JSON.stringify(parsed.data.history)} Current question: ${parsed.data.question} Answer: ${parsed.data.answer} Measured transcript metrics: ${JSON.stringify(parsed.data.transcriptMetrics)} Return JSON: {"score":number 0-100,"technical":number,"communication":number,"structure":number,"strengths":string[],"improvements":string[],"evidence":string[],"starMissing":string[],"feedback":string,"nextQuestion":string,"round":string,"difficulty":"easy|medium|hard|expert","expectedTopics":string[]}. Scores must be based on answer evidence and metrics; do not infer mental state from camera.` }]);
            const valid = z.object({ score: z.number().min(0).max(100), technical: z.number().min(0).max(100), communication: z.number().min(0).max(100), structure: z.number().min(0).max(100), strengths: z.array(z.string()), improvements: z.array(z.string()), evidence: z.array(z.string()), starMissing: z.array(z.string()), feedback: z.string(), nextQuestion: z.string(), round: z.string(), difficulty: z.enum(["easy", "medium", "hard", "expert"]), expectedTopics: z.array(z.string()).default([]) }).safeParse(result);
            if (!valid.success) throw new Error("Invalid answer feedback");
            return NextResponse.json({ success: true, feedback: valid.data });
        }
        const result = await askGroq([{ role: "system", content: systemPrompt(parsed.data.setup, context) }, { role: "user", content: `Create a final report from these completed answers: ${JSON.stringify(parsed.data.history)}. Return JSON: {"overall":number,"technical":number,"communication":number,"behavioral":number,"problemSolving":number,"clarity":number,"structure":number,"strengths":string[],"improvements":string[],"plan":string[],"readiness":number,"skillGaps":string[],"nextAction":string}. Use only evidence in the answers and scores.` }]);
        const valid = z.object({ overall: z.number().min(0).max(100), technical: z.number().min(0).max(100), behavioral: z.number().min(0).max(100), communication: z.number().min(0).max(100), problemSolving: z.number().min(0).max(100), clarity: z.number().min(0).max(100), structure: z.number().min(0).max(100), strengths: z.array(z.string()), improvements: z.array(z.string()), plan: z.array(z.string()), readiness: z.number().min(0).max(100), skillGaps: z.array(z.string()), nextAction: z.string() }).safeParse(result);
        if (!valid.success) throw new Error("Invalid interview report");
        return NextResponse.json({ success: true, report: valid.data });
    } catch (error) { const message = error instanceof Error && error.name.includes("Timeout") ? "The AI took too long to respond. Please try again." : "AI Interview is temporarily unavailable. Please try again."; return NextResponse.json({ success: false, error: message }, { status: 502 }); }
}
