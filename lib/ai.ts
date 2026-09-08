import { z } from "zod";

// Schema for what we ask the AI to return — keeps the output predictable
// so we can safely render it in the UI.
const studyPlanSchema = z.object({
  durationValue: z.number().int().positive().optional(),
  durationUnit: z.enum(["DAYS", "WEEKS", "MONTHS"]).optional(),
  selectedSubjects: z.array(z.string()).optional(),
  todayPlan: z.array(
    z.object({
      time: z.string(),
      course: z.string(),
      task: z.string(),
      reason: z.string(),
      priority: z.enum(["High", "Medium", "Low"]),
    })
  ),
  weeklyPlan: z.array(
    z.object({
      day: z.string(),
      focus: z.string(),
      hours: z.number(),
      reason: z.string(),
    })
  ),
  tips: z.array(z.string()),
});

export type StudyPlanOutput = z.infer<typeof studyPlanSchema>;

export type PlannerInput = {
  availableHours: number;
  preferredTime: string;
  selectedSubjects: string[];
  durationValue: number;
  durationUnit: "DAYS" | "WEEKS" | "MONTHS";
  weakSubjects: string[];
  courses: { courseName: string; courseCode: string; currentGrade: string | null }[];
  assignments: {
    title: string;
    courseName: string;
    deadline: string;
    difficulty: string;
    estimatedHours: number;
  }[];
  exams: { courseName: string; examType: string; date: string }[];
};

const SYSTEM_PROMPT = `You are the AI Study Planner inside a university planning app.

Rules you must always follow:
- Prioritize the nearest deadlines first.
- Prioritize difficult courses and subjects the student marked as weak.
- Balance each day within the student's available study hours — never exceed them.
- Generate the plan across the requested duration. Use recurring revision, practice, and checkpoint sessions for multi-week or multi-month plans.
- Prioritize courses with upcoming exams.
- NEVER invent assignments, exams, or courses that were not given to you in the data. Only use what's provided.
- Briefly explain the reason behind each recommendation.
- Today's date is provided in the data — use it to calculate urgency.

Respond with ONLY valid JSON matching this exact shape, and nothing else (no markdown fences, no preamble):
{
  "todayPlan": [{ "time": string, "course": string, "task": string, "reason": string, "priority": "High" | "Medium" | "Low" }],
  "weeklyPlan": [{ "day": string, "focus": string, "hours": number, "reason": string }],
  "tips": [string]
}`;

export async function generateStudyPlan(input: PlannerInput): Promise<StudyPlanOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Add it to your server environment.");
  }

  const userPrompt = `Today's date: ${new Date().toISOString().slice(0, 10)}

Study plan duration: ${input.durationValue} ${input.durationUnit.toLowerCase()}
Student's available study hours per day: ${input.availableHours}
Preferred study time: ${input.preferredTime}
Selected subjects: ${input.selectedSubjects.join(", ")}
Subjects the student finds weak: ${input.weakSubjects.length ? input.weakSubjects.join(", ") : "none specified"}

Courses:
${input.courses.map((c) => `- ${c.courseName} (${c.courseCode})${c.currentGrade ? `, current grade: ${c.currentGrade}` : ""}`).join("\n") || "None"}

Pending assignments:
${input.assignments.map((a) => `- "${a.title}" for ${a.courseName}, deadline: ${a.deadline}, difficulty: ${a.difficulty}, estimated hours: ${a.estimatedHours}`).join("\n") || "None"}

Upcoming exams:
${input.exams.map((e) => `- ${e.examType} for ${e.courseName} on ${e.date}`).join("\n") || "None"}

Generate a practical plan covering the full requested duration. Keep today's plan useful, and use the weeklyPlan entries as a repeatable roadmap for the remaining duration.`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-3.6-flash"}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }] }], generationConfig: { temperature: 0.4, responseMimeType: "application/json", maxOutputTokens: 3000 } }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText.slice(0, 300)}`);
  }

  const data = await response.json();
  const rawContent = data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("");

  if (!rawContent) {
    throw new Error("AI did not return any content");
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawContent);
  } catch {
    throw new Error("AI response was not valid JSON");
  }

  const validated = studyPlanSchema.safeParse(parsedJson);
  if (!validated.success) {
    throw new Error("AI response did not match the expected format");
  }

  return validated.data;
}
