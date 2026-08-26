import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";

const emailSchema = z.object({
  situation: z.string().trim().min(1).max(10000),
  action: z.enum(["generate", "improve", "shorten", "expand", "formalize", "polite", "check", "translate", "followup", "reply", "convert"]).default("generate"),
  recipientRole: z.string().trim().max(100).default("Professor"),
  recipientEmail: z.string().trim().max(200).default(""),
  name: z.string().trim().max(120).default(""),
  tone: z.string().max(40).default("Professional"),
  length: z.string().max(20).default("Medium"),
  language: z.enum(["English", "Marathi", "Hindi"]).default("English"),
  details: z.record(z.string().max(500)).default({}),
  currentEmail: z.object({ to: z.string().max(200), cc: z.string().max(200), bcc: z.string().max(200), subject: z.string().max(300), body: z.string().max(20000) }).optional(),
  followupAfter: z.string().max(30).optional(),
  recipientName: z.string().trim().max(120).default(""),
  inputLanguage: z.enum(["English", "Marathi", "Hindi", "Mixed"]).default("English"),
  targetChannel: z.string().max(40).default("Email"),
});

const resultSchema = z.object({
  to: z.string(), cc: z.string(), bcc: z.string(), subject: z.string(), greeting: z.string(), body: z.string(), signature: z.string(),
  recipientRole: z.string(), category: z.string(), priority: z.enum(["Low", "Normal", "High", "Urgent"]), confidence: z.enum(["Low", "Medium", "High"]),
  attachments: z.array(z.string()), missingInformation: z.array(z.string()), recommendations: z.array(z.string()),
  health: z.object({ professionalism: z.number().min(0).max(100), clarity: z.number().min(0).max(100), grammar: z.number().min(0).max(100), tone: z.string() }),
  recommendedService: z.string().default("Gmail"),
  recommendedReason: z.string().default("Formal college requests are best reviewed in email."),
  questions: z.array(z.object({ question: z.string(), options: z.array(z.string()).default([]) })).default([]),
  channelMessages: z.record(z.string()).default({}),
});

function fallback(input: z.infer<typeof emailSchema>) {
  const name = input.name || "[Student Name]";
  const recipient = input.recipientRole || "Professor";
  const subject = input.action === "reply" ? "Re: Response to Your Email" : "Request Regarding [Topic]";
  const body = `I am writing to you regarding the following matter:\n\n${input.situation}\n\nI kindly request you to consider my request. Please let me know if any additional information or documents are required.`;
  return { to: input.recipientEmail, cc: "", bcc: "", subject, greeting: recipient.toLowerCase().includes("hod") ? "Respected Sir/Madam," : `Dear ${recipientName(input)},`, body, signature: `Regards,\n${name}`, recipientRole: recipient, category: "Other", priority: "Normal" as const, confidence: "Medium" as const, attachments: [], missingInformation: ["Subject or specific request"], recommendations: ["Review the placeholders before opening Gmail."], health: { professionalism: 82, clarity: 78, grammar: 94, tone: "Appropriate" }, recommendedService: "Gmail", recommendedReason: "Formal college requests are best reviewed in email.", questions: [], channelMessages: { Email: body, WhatsApp: `${input.situation}\n\nCould you please help me with this?`, Teams: `${input.situation}\n\nPlease let me know how to proceed.` } };
}

function recipientName(input: z.infer<typeof emailSchema>) { return input.recipientName || input.recipientRole || "Professor"; }

function prompt(input: z.infer<typeof emailSchema>) {
  return `Create a concise, professional college communication. Use only facts supplied below; never invent names, dates, percentages, rules, diagnoses, deadlines, or email addresses. Use placeholders like [Date] when needed. Recipient style: ${input.recipientRole}. Tone: ${input.tone}. Length: ${input.length}. Input language: ${input.inputLanguage}. Output language: ${input.language}. Action: ${input.action}. Target channel: ${input.targetChannel}. Additional fields: ${JSON.stringify(input.details)}. Student name: ${input.name || "not provided"}. Recipient name: ${input.recipientName || "not provided"}. Recipient email: ${input.recipientEmail || "not provided"}. Situation: ${input.situation}. ${input.currentEmail ? `Current email to edit: ${JSON.stringify(input.currentEmail)}` : ""} ${input.followupAfter ? `Follow-up timing: ${input.followupAfter}` : ""}
Return ONLY JSON with this exact shape: ${JSON.stringify({ to: "", cc: "", bcc: "", subject: "", greeting: "", body: "", signature: "", recipientRole: "", category: "Academic", priority: "Normal", confidence: "High", attachments: [], missingInformation: [], recommendations: [], health: { professionalism: 0, clarity: 0, grammar: 0, tone: "Appropriate" }, recommendedService: "Gmail", recommendedReason: "", questions: [], channelMessages: { Email: "", WhatsApp: "", Teams: "", LinkedIn: "", SMS: "", "Formal Application": "" } })}`;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "Please sign in to use Email Assistant." }, { status: 401 });
  const parsed = emailSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: "Please enter what you would like to say." }, { status: 400 });
  const input = parsed.data;
  const fallbackResult = fallback(input);
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ success: true, fallback: true, result: fallbackResult });
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model: process.env.GROQ_MODEL || "openai/gpt-oss-20b", messages: [{ role: "system", content: "You are a fact-grounded college email assistant. Never fabricate facts." }, { role: "user", content: prompt(input) }], temperature: 0.3, max_tokens: 1800, response_format: { type: "json_object" } }), signal: AbortSignal.timeout(30000) });
    if (!response.ok) return NextResponse.json({ success: true, fallback: true, result: fallbackResult });
    const data = await response.json();
    const valid = resultSchema.safeParse(JSON.parse(data.choices?.[0]?.message?.content || "{}"));
    return NextResponse.json({ success: true, fallback: !valid.success, result: valid.success ? valid.data : fallbackResult });
  } catch {
    return NextResponse.json({ success: true, fallback: true, result: fallbackResult });
  }
}