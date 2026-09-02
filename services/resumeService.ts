/**
 * Resume Service
 * Handles resume parsing, analysis, and question generation
 */

import type {
  ResumeAnalysis,
  ParsedResume,
  ResumeIntelligence,
} from "@/types/ai-interview";

/**
 * Parse and analyze resume
 */
export async function analyzeResume(
  resumeText: string,
  userId: string
): Promise<ResumeAnalysis> {
  // TODO: Replace with real resume parsing API
  const parsedData = parseResume(resumeText);
  const analysis = generateResumeIntelligence(parsedData, resumeText);
  const questionsGenerated = generateInterviewQuestionsFromResume(
    parsedData,
    analysis
  );

  return {
    id: `resume-${Date.now()}`,
    userId,
    resumeText,
    parsedData,
    analysis,
    questionsGenerated,
    createdAt: new Date(),
  };
}

/**
 * Parse resume text
 */
function parseResume(resumeText: string): ParsedResume {
  // Simplified parsing - in production use NLP/ML
  const lines = resumeText.split("\n");

  // Extract skills (look for "skills" section)
  const skillsSection = resumeText.toLowerCase().indexOf("skills");
  const skills: string[] = [];

  if (skillsSection !== -1) {
    const skillsText = resumeText.substring(skillsSection, skillsSection + 500);
    const skillMatches = skillsText.match(/\b(javascript|react|nodejs|python|java|sql|aws|docker|git)\b/gi);
    if (skillMatches) {
      skills.push(...new Set(skillMatches.map((s) => s.toLowerCase())));
    }
  }

  // Extract email
  const emailMatch = resumeText.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
  const email = emailMatch ? emailMatch[0] : undefined;

  // Extract phone
  const phoneMatch = resumeText.match(/\+?[\d\s\-()]{10,}/);
  const phone = phoneMatch ? phoneMatch[0] : undefined;

  // Extract first line as name
  const name = lines[0]?.trim();

  return {
    name,
    email,
    phone,
    education: [
      {
        institution: "Example University",
        degree: "Bachelor",
        field: "Computer Science",
      },
    ],
    experience: [
      {
        company: "Example Company",
        position: "Software Developer",
        duration: "2023-Present",
        description: resumeText.substring(0, 200),
      },
    ],
    skills,
    technologies: skills,
    certifications: [],
    projects: [],
    achievements: [
      "Developed full-stack applications",
      "Led technical initiatives",
    ],
  };
}

/**
 * Generate resume intelligence analysis
 */
function generateResumeIntelligence(
  parsedData: ParsedResume,
  originalText: string
): ResumeIntelligence {
  const skillCount = parsedData.skills.length;
  const projectCount = parsedData.projects.length;
  const experienceCount = parsedData.experience.length;

  return {
    overallReadiness: Math.min(
      100,
      Math.max(50, skillCount * 5 + projectCount * 10 + experienceCount * 8)
    ),
    strengths: [
      skillCount > 5 ? "Diverse technical skills" : "Good foundational skills",
      experienceCount > 1 ? "Multiple relevant experiences" : "Focused experience",
      projectCount > 0 ? "Portfolio projects demonstrated" : "Consider adding projects",
    ],
    gaps: generateSkillGaps(parsedData),
    inconsistencies: detectInconsistencies(originalText),
    possibleFollowUpQuestions: generateFollowUpQuestions(parsedData),
    projectInterviewPoints: generateProjectInterviewPoints(parsedData),
    experienceInterviewPoints: generateExperienceInterviewPoints(parsedData),
    missingKeywords: findMissingKeywords(parsedData),
    recommendedSkillsToAdd: [
      "System Design",
      "AWS",
      "Docker",
      "Kubernetes",
    ],
    resumeScore: {
      clarity: 75,
      completeness: 80,
      relevance: 85,
      impact: 70,
    },
  };
}

/**
 * Generate skill gaps
 */
function generateSkillGaps(parsedData: ParsedResume): string[] {
  const commonTechSkills = [
    "Cloud (AWS/Azure/GCP)",
    "Containerization (Docker)",
    "Orchestration (Kubernetes)",
    "CI/CD Pipelines",
    "Monitoring (ELK, Prometheus)",
    "System Design",
  ];

  return commonTechSkills.filter(
    (skill) =>
      !parsedData.skills
        .join(" ")
        .toLowerCase()
        .includes(skill.toLowerCase())
  );
}

/**
 * Detect inconsistencies
 */
function detectInconsistencies(text: string): string[] {
  const inconsistencies: string[] = [];

  // Check for date inconsistencies
  const datePattern = /\b(202[0-5])\b/g;
  const dates = text.match(datePattern);
  if (dates) {
    const uniqueDates = [...new Set(dates)].map(Number).sort();
    if (uniqueDates.length > 1) {
      const gap = uniqueDates[uniqueDates.length - 1] - uniqueDates[0];
      if (gap > 1) {
        inconsistencies.push("Potential career gap detected");
      }
    }
  }

  // Check for missing details
  if (!text.toLowerCase().includes("achieved") && !text.toLowerCase().includes("improved")) {
    inconsistencies.push("Missing quantifiable achievements");
  }

  return inconsistencies;
}

/**
 * Generate follow-up questions
 */
function generateFollowUpQuestions(
  parsedData: ParsedResume
): ResumeIntelligence["possibleFollowUpQuestions"] {
  return parsedData.skills.slice(0, 3).map((skill) => ({
    skill,
    questions: [
      `Tell me about your experience with ${skill}`,
      `What projects have you built using ${skill}?`,
      `How deep is your knowledge of ${skill}?`,
      `Walk me through a complex problem you solved with ${skill}`,
    ],
  }));
}

/**
 * Generate project interview points
 */
function generateProjectInterviewPoints(
  parsedData: ParsedResume
): ResumeIntelligence["projectInterviewPoints"] {
  return parsedData.projects.map((project) => ({
    project: project.name,
    focusAreas: ["Architecture", "Challenges", "Learnings", "Technologies"],
    possibleQuestions: [
      `Walk me through the architecture of ${project.name}`,
      `What technical challenges did you face?`,
      `How would you improve ${project.name}?`,
      `What would you do differently if you built it again?`,
    ],
  }));
}

/**
 * Generate experience interview points
 */
function generateExperienceInterviewPoints(
  parsedData: ParsedResume
): ResumeIntelligence["experienceInterviewPoints"] {
  return parsedData.experience.map((exp) => ({
    company: exp.company,
    position: exp.position,
    keyAchievements: exp.achievements || [
      "Contributed to team projects",
      "Solved technical problems",
    ],
    behavioralQuestions: [
      `Tell me about a conflict you handled at ${exp.company}`,
      `How did you contribute to your team's success?`,
      `What was your biggest achievement?`,
    ],
    technicalQuestions: [
      `Describe the most complex system you worked on`,
      `How did you optimize performance?`,
      `What technical decisions did you make?`,
    ],
  }));
}

/**
 * Find missing keywords
 */
function findMissingKeywords(parsedData: ParsedResume): string[] {
  const importantKeywords = [
    "scalable",
    "high-performance",
    "user-centric",
    "agile",
    "cloud-native",
    "microservices",
    "distributed",
    "mentoring",
    "leadership",
  ];

  const skillsText = parsedData.skills.join(" ").toLowerCase();
  return importantKeywords.filter(
    (keyword) => !skillsText.includes(keyword)
  );
}

/**
 * Generate interview questions from resume
 */
function generateInterviewQuestionsFromResume(
  parsedData: ParsedResume,
  analysis: ResumeIntelligence
): string[] {
  const questions: string[] = [];

  // Questions from skills
  parsedData.skills.slice(0, 2).forEach((skill) => {
    questions.push(`Explain your experience with ${skill}`);
    questions.push(`What complex problem did you solve with ${skill}?`);
  });

  // Questions from projects
  parsedData.projects.slice(0, 2).forEach((project) => {
    questions.push(
      `Walk me through the ${project.name} project and your role`
    );
  });

  // Questions from experience
  if (parsedData.experience.length > 0) {
    const exp = parsedData.experience[0];
    questions.push(
      `Tell me about your experience at ${exp.company} as a ${exp.position}`
    );
    questions.push(`What was your biggest achievement there?`);
  }

  return questions;
}

/**
 * Generate resume-based interview
 */
export async function createResumeBasedInterview(
  resumeAnalysis: ResumeAnalysis
): Promise<{
  questions: string[];
  focusAreas: string[];
  estimatedDuration: number;
}> {
  return {
    questions: resumeAnalysis.questionsGenerated,
    focusAreas: [
      "Resume projects",
      "Technical skills",
      "Work experience",
      "Achievements",
    ],
    estimatedDuration: 45,
  };
}

/**
 * Score resume
 */
export async function scoreResume(
  parsedData: ParsedResume
): Promise<number> {
  let score = 50;

  // Add points for completeness
  if (parsedData.name) score += 5;
  if (parsedData.email) score += 5;
  if (parsedData.phone) score += 5;
  if (parsedData.education && parsedData.education.length > 0) score += 10;
  if (parsedData.experience && parsedData.experience.length > 0) score += 15;
  if (parsedData.skills && parsedData.skills.length > 5) score += 15;
  if (parsedData.projects && parsedData.projects.length > 0) score += 10;

  return Math.min(100, score);
}
