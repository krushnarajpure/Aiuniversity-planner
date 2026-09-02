/**
 * Job Description Service
 * Handles job description analysis and question generation
 */

import type {
  JobDescriptionAnalysis,
  ParsedJobDescription,
  JobIntelligence,
} from "@/types/ai-interview";

/**
 * Analyze job description
 */
export async function analyzeJobDescription(
  jobDescription: string,
  userId: string,
  userResume?: string
): Promise<JobDescriptionAnalysis> {
  // TODO: Replace with real NLP parsing
  const parsedData = parseJobDescription(jobDescription);
  const analysis = generateJobIntelligence(parsedData, userResume);
  const questionsGenerated = generateJobBasedQuestions(parsedData, analysis);

  return {
    id: `job-${Date.now()}`,
    userId,
    jobDescription,
    parsedData,
    analysis,
    questionsGenerated,
    createdAt: new Date(),
  };
}

/**
 * Parse job description
 */
function parseJobDescription(jobDescription: string): ParsedJobDescription {
  const lowerText = jobDescription.toLowerCase();

  // Extract title (usually first line or title pattern)
  let title = "Software Engineer";
  const titleMatch = jobDescription.match(/^#?\s*(.+?)$/m);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }

  // Extract required skills (look for common patterns)
  const requiredSkills = extractSkills(jobDescription);
  const preferredSkills = extractPreferredSkills(jobDescription);
  const technologies = extractTechnologies(jobDescription);

  // Extract responsibilities
  const responsibilities = extractResponsibilities(jobDescription);

  // Extract experience
  const experience = extractExperience(jobDescription);

  // Extract soft skills
  const softSkills = extractSoftSkills(jobDescription);

  // Calculate keyword density
  const keywordDensity = calculateKeywordDensity(jobDescription);

  return {
    title,
    level: inferLevel(title, experience),
    requiredSkills,
    preferredSkills,
    responsibilities,
    qualifications: extractQualifications(jobDescription),
    experience,
    technologies,
    softSkills,
    keywordDensity,
  };
}

/**
 * Generate job intelligence analysis
 */
function generateJobIntelligence(
  parsedData: ParsedJobDescription,
  userResume?: string
): JobIntelligence {
  const matchScore = userResume
    ? calculateMatchScore(parsedData.requiredSkills, userResume)
    : 0;

  return {
    matchScore,
    mustHaveSkills: parsedData.requiredSkills.slice(0, 5),
    niceToHaveSkills: parsedData.preferredSkills,
    criticalSkillGaps: findSkillGaps(
      parsedData.requiredSkills,
      userResume
    ),
    roleSpecificQuestions: generateRoleSpecificQuestions(parsedData),
    companyStyleQuestions: generateCompanyStyleQuestions(
      parsedData.title
    ),
    technicalDepthRequired: inferTechnicalDepth(parsedData),
    estimatedInterviewRounds: estimateInterviewRounds(parsedData),
    preparationChecklist: generatePreparationChecklist(parsedData),
    commonInterviewPatterns: getCommonPatterns(parsedData.title),
    roleReadinessAssessment: {
      technical: matchScore ? matchScore * 0.7 : 50,
      seniority: inferSeniorityRequirement(parsedData.experience),
      communication: 70,
      cultureFit: 65,
    },
  };
}

/**
 * Extract skills from job description
 */
function extractSkills(text: string): string[] {
  const skillPatterns = [
    "javascript",
    "typescript",
    "react",
    "nodejs",
    "express",
    "python",
    "java",
    "sql",
    "postgresql",
    "mongodb",
    "aws",
    "azure",
    "docker",
    "kubernetes",
    "git",
    "api",
    "rest",
    "graphql",
    "testing",
    "jest",
    "webpack",
  ];

  const foundSkills: string[] = [];
  const lowerText = text.toLowerCase();

  skillPatterns.forEach((skill) => {
    if (lowerText.includes(skill)) {
      foundSkills.push(skill);
    }
  });

  return [...new Set(foundSkills)];
}

/**
 * Extract preferred skills
 */
function extractPreferredSkills(text: string): string[] {
  const preferredKeywords = ["nice to have", "preferred", "beneficial", "optional"];
  const skillPatterns = [
    "machine learning",
    "ai",
    "data science",
    "redis",
    "elasticsearch",
    "rabbitmq",
  ];

  let preferredText = text;
  preferredKeywords.forEach((keyword) => {
    const index = text.toLowerCase().indexOf(keyword);
    if (index !== -1) {
      preferredText = text.substring(index);
    }
  });

  const foundSkills: string[] = [];
  const lowerText = preferredText.toLowerCase();

  skillPatterns.forEach((skill) => {
    if (lowerText.includes(skill)) {
      foundSkills.push(skill);
    }
  });

  return foundSkills;
}

/**
 * Extract technologies
 */
function extractTechnologies(text: string): string[] {
  const techs = extractSkills(text);
  return [...new Set(techs)];
}

/**
 * Extract responsibilities
 */
function extractResponsibilities(text: string): string[] {
  const responsibilities: string[] = [];
  const lines = text.split("\n");

  lines.forEach((line) => {
    if (
      line.match(/^[\*\-\•]\s/) ||
      line.match(/^\d+\.\s/)
    ) {
      const responsibility = line.replace(/^[\*\-\•\d+\.]\s+/, "").trim();
      if (responsibility.length > 10) {
        responsibilities.push(responsibility);
      }
    }
  });

  return responsibilities.slice(0, 10);
}

/**
 * Extract qualifications
 */
function extractQualifications(text: string): string[] {
  return [
    "Bachelor's degree in Computer Science or related field",
    "Strong problem-solving skills",
    "Experience with modern development practices",
  ];
}

/**
 * Extract experience requirement
 */
function extractExperience(text: string): string {
  const experiencePattern = /(\d+)\s*\+?\s*(years?|yrs?)/i;
  const match = text.match(experiencePattern);
  if (match) {
    return `${match[1]}+ years`;
  }
  return "Not specified";
}

/**
 * Extract soft skills
 */
function extractSoftSkills(text: string): string[] {
  const softSkillPatterns = [
    "communication",
    "teamwork",
    "leadership",
    "problem-solving",
    "adaptability",
    "attention to detail",
    "time management",
  ];

  const lowerText = text.toLowerCase();
  return softSkillPatterns.filter((skill) =>
    lowerText.includes(skill.toLowerCase())
  );
}

/**
 * Calculate keyword density
 */
function calculateKeywordDensity(text: string): Record<string, number> {
  const keywords = ["team", "system", "develop", "build", "design", "implement"];
  const lowerText = text.toLowerCase();
  const totalWords = lowerText.split(/\s+/).length;

  const density: Record<string, number> = {};
  keywords.forEach((keyword) => {
    const matches = (lowerText.match(new RegExp(keyword, "g")) || []).length;
    density[keyword] = totalWords > 0 ? (matches / totalWords) * 100 : 0;
  });

  return density;
}

/**
 * Infer job level
 */
function inferLevel(title: string, experience: string): string {
  const lowerTitle = title.toLowerCase();
  if (
    lowerTitle.includes("senior") ||
    lowerTitle.includes("lead") ||
    lowerTitle.includes("principal")
  ) {
    return "Senior";
  }
  if (lowerTitle.includes("junior") || experience.includes("0-2")) {
    return "Junior";
  }
  if (lowerTitle.includes("intern")) {
    return "Intern";
  }
  return "Mid-Level";
}

/**
 * Calculate match score
 */
function calculateMatchScore(requiredSkills: string[], userResume?: string): number {
  if (!userResume) return 0;

  const lowerResume = userResume.toLowerCase();
  const matchedSkills = requiredSkills.filter((skill) =>
    lowerResume.includes(skill.toLowerCase())
  );

  return Math.round((matchedSkills.length / requiredSkills.length) * 100);
}

/**
 * Find skill gaps
 */
function findSkillGaps(requiredSkills: string[], userResume?: string): string[] {
  if (!userResume) return requiredSkills.slice(0, 5);

  const lowerResume = userResume.toLowerCase();
  return requiredSkills.filter(
    (skill) => !lowerResume.includes(skill.toLowerCase())
  );
}

/**
 * Generate role-specific questions
 */
function generateRoleSpecificQuestions(parsedData: ParsedJobDescription): string[] {
  const questions: string[] = [];

  // Based on title
  if (parsedData.title.toLowerCase().includes("frontend")) {
    questions.push("How would you approach performance optimization in a React app?");
    questions.push("Explain your experience with responsive design");
  }

  if (parsedData.title.toLowerCase().includes("backend")) {
    questions.push("Design a scalable API for handling millions of requests");
    questions.push("How do you ensure database query performance?");
  }

  // Based on required skills
  parsedData.requiredSkills.slice(0, 2).forEach((skill) => {
    questions.push(`Walk me through a complex project using ${skill}`);
  });

  return questions.slice(0, 5);
}

/**
 * Generate company-style questions
 */
function generateCompanyStyleQuestions(title: string): string[] {
  return [
    "Why do you want to work at our company?",
    "How does this role fit your career goals?",
    "Tell me about a time you had to learn a new technology quickly",
  ];
}

/**
 * Infer technical depth
 */
function inferTechnicalDepth(
  parsedData: ParsedJobDescription
): "beginner" | "intermediate" | "advanced" | "expert" {
  const skillCount = parsedData.requiredSkills.length;
  const hasSystemDesign = parsedData.responsibilities.some((r) =>
    r.toLowerCase().includes("design")
  );

  if (hasSystemDesign && skillCount > 8) return "expert";
  if (skillCount > 6) return "advanced";
  if (skillCount > 3) return "intermediate";
  return "beginner";
}

/**
 * Estimate interview rounds
 */
function estimateInterviewRounds(parsedData: ParsedJobDescription) {
  const rounds = ["introduction"];

  if (parsedData.title.toLowerCase().includes("senior")) {
    rounds.push("behavioral", "technical", "system_design");
  } else if (parsedData.title.toLowerCase().includes("junior")) {
    rounds.push("technical", "behavioral");
  } else {
    rounds.push("behavioral", "technical", "coding");
  }

  rounds.push("final_hr");
  return rounds as any[];
}

/**
 * Generate preparation checklist
 */
function generatePreparationChecklist(parsedData: ParsedJobDescription) {
  return [
    {
      category: "Technical Preparation",
      items: parsedData.requiredSkills.map((skill) => `Deep dive into ${skill}`),
    },
    {
      category: "Behavioral Preparation",
      items: [
        "Prepare STAR stories",
        "Practice communication",
        "Research company culture",
      ],
    },
    {
      category: "Final Preparation",
      items: [
        "Mock interviews",
        "Review projects",
        "Prepare questions for interviewer",
      ],
    },
  ];
}

/**
 * Get common interview patterns
 */
function getCommonPatterns(title: string): string[] {
  return [
    "Technical deep-dive expected",
    "System design questions likely",
    "Behavioral assessment standard",
  ];
}

/**
 * Infer seniority requirement
 */
function inferSeniorityRequirement(experience: string): number {
  if (experience.includes("0-1")) return 30;
  if (experience.includes("1-3")) return 40;
  if (experience.includes("3-5")) return 60;
  if (experience.includes("5+")) return 80;
  return 50;
}

/**
 * Generate job-based interview questions
 */
function generateJobBasedQuestions(
  parsedData: ParsedJobDescription,
  analysis: JobIntelligence
): string[] {
  const questions: string[] = [
    ...(analysis.roleSpecificQuestions ?? []),
    ...(analysis.companyStyleQuestions ?? []),
  ];

  // Add technical questions based on tech stack
  parsedData.technologies.slice(0, 2).forEach((tech) => {
    questions.push(`How would you use ${tech} in this role?`);
  });

  return questions.slice(0, 10);
}
