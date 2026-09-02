import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const resumeAnalysisSchema = z.object({
    summary: z.object({
        overallScore: z.number().min(0).max(100),
        atsScore: z.number().min(0).max(100),
        readability: z.number().min(0).max(100),
        strength: z.string(),
        keyGap: z.string(),
        recommendedAction: z.string(),
    }),
    jobMatch: z.object({
        score: z.number().min(0).max(100),
        matchedSkills: z.array(z.string()),
        missingSkills: z.array(z.string()),
        fitSummary: z.string(),
    }),
    skills: z.object({
        technical: z.array(z.string()),
        soft: z.array(z.string()),
        missing: z.array(z.string()),
    }),
    experience: z.object({
        impactScore: z.number().min(0).max(100),
        highlights: z.array(z.string()),
        improvements: z.array(z.string()),
    }),
    projects: z.array(
        z.object({
            name: z.string(),
            impact: z.string(),
            status: z.enum(["Strong", "Average", "Needs work"]),
        })
    ),
    contentStudio: z.object({
        headline: z.string(),
        summary: z.string(),
        achievements: z.array(z.string()),
        keywords: z.array(z.string()),
    }),
    interviewInsights: z.object({
        strengths: z.array(z.string()),
        gaps: z.array(z.string()),
        questions: z.array(z.string()),
    }),
    roadmap: z.array(z.string()),
    validation: z.object({
        hasContact: z.boolean(),
        hasSummary: z.boolean(),
        hasExperience: z.boolean(),
        hasProjects: z.boolean(),
        warnings: z.array(z.string()),
    }),
    report: z.object({
        title: z.string(),
        conclusion: z.string(),
    }),
});

function buildResumeSystemPrompt(jobDescription?: string) {
    const context = jobDescription
        ? `The student is targeting this role:\n${jobDescription}`
        : "The student is applying generally and the tool should give a general-purpose ATS and skill review.";

    return `You are an elite placement intelligence engine for university students.
Analyze the resume and produce honest, evidence-based feedback.

Rules:
- Infer only from the resume data provided. Do not invent details.
- Keep the result concise but professional and actionable.
- Use a realistic ATS-oriented scoring system for university students.
- If the resume is weak or sparse, say so clearly.
- Current date is provided by system context.

${context}

Return valid JSON only, matching this exact shape:
{
  "summary": {
    "overallScore": number,
    "atsScore": number,
    "readability": number,
    "strength": string,
    "keyGap": string,
    "recommendedAction": string
  },
  "jobMatch": {
    "score": number,
    "matchedSkills": [string],
    "missingSkills": [string],
    "fitSummary": string
  },
  "skills": {
    "technical": [string],
    "soft": [string],
    "missing": [string]
  },
  "experience": {
    "impactScore": number,
    "highlights": [string],
    "improvements": [string]
  },
  "projects": [{ "name": string, "impact": string, "status": "Strong" | "Average" | "Needs work" }],
  "contentStudio": {
    "headline": string,
    "summary": string,
    "achievements": [string],
    "keywords": [string]
  },
  "interviewInsights": {
    "strengths": [string],
    "gaps": [string],
    "questions": [string]
  },
  "roadmap": [string],
  "validation": {
    "hasContact": boolean,
    "hasSummary": boolean,
    "hasExperience": boolean,
    "hasProjects": boolean,
    "warnings": [string]
  },
  "report": {
    "title": string,
    "conclusion": string
  }
}

Do not wrap in markdown fences and do not add comments.`;
}

async function askGroqForResumeAnalysis(resumeText: string, jobDescription?: string) {
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

    if (!apiKey) {
        throw new Error("GROQ_API_KEY is not configured.");
    }

    const compactResume = resumeText.length > 5000
        ? `${resumeText.slice(0, 3800)}\n\n[Middle omitted]\n\n${resumeText.slice(-1000)}`
        : resumeText;
    const compactJobDescription = jobDescription && jobDescription.length > 1200
        ? jobDescription.slice(0, 1200)
        : jobDescription;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            temperature: 0.4,
            max_tokens: 2200,
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: buildResumeSystemPrompt(compactJobDescription) },
                { role: "user", content: `Resume content:\n${compactResume}` },
            ],
        }),
        signal: AbortSignal.timeout(45000),
    });

    if (!response.ok) {
        await response.text();
        if (response.status === 413 || response.status === 429) {
            throw new Error("AI analysis is temporarily busy. Please try again with a shorter resume or job description.");
        }
        if (response.status === 401 || response.status === 403) {
            throw new Error("AI analysis is temporarily unavailable. Please contact the administrator.");
        }
        throw new Error("AI analysis is temporarily unavailable. Please try again.");
    }

    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error("AI did not return any analysis content.");
    }

    return JSON.parse(content);
}

async function saveAnalysis(userId: string, analysis: z.infer<typeof resumeAnalysisSchema>, source: string) {
    try {
        const { error } = await supabase.from("resume_analyses").insert({
            user_id: userId,
            source,
            title: analysis.report.title,
            ats_score: analysis.summary.atsScore,
            overall_score: analysis.summary.overallScore,
            data: analysis,
            created_at: new Date().toISOString(),
        });

        if (error) {
            console.warn("resume_analyses insert failed:", error.message);
            return { saved: false, reason: error.message };
        }

        return { saved: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown save error";
        console.warn("Supabase resume save failed:", message);
        return { saved: false, reason: message };
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    try {
        const body = await request.json();
        const resumeText = typeof body?.resumeText === "string" ? body.resumeText.trim() : "";
        const jobDescription = typeof body?.jobDescription === "string" ? body.jobDescription.trim() : undefined;
        const source = typeof body?.source === "string" ? body.source : "manual";

        if (!resumeText) {
            return NextResponse.json({ success: false, error: "Please paste or upload a resume to analyze." }, { status: 400 });
        }

        const rawAnalysis = await askGroqForResumeAnalysis(resumeText, jobDescription);
        const parsed = resumeAnalysisSchema.parse(rawAnalysis);
        const saveResult = await saveAnalysis(session.user.id, parsed, source);

        return NextResponse.json({
            success: true,
            analysis: parsed,
            savedToSupabase: saveResult.saved,
            saveNote: saveResult.saved ? "Saved to your placement history." : `Saved locally only: ${saveResult.reason ?? "Supabase unavailable."}`,
        });
    } catch (error) {
        const rawMessage = error instanceof Error ? error.message : "";
        const message = rawMessage.includes("timed out") || rawMessage.includes("aborted")
            ? "AI analysis took too long. Please try again with a shorter resume."
            : rawMessage || "Resume analysis failed. Please try again.";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
