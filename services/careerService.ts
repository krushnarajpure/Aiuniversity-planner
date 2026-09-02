/**
 * Career Intelligence Service
 * Handles career readiness assessment and recommendations
 */

import type {
  CareerReadinessAssessment,
  UserInterviewProfile,
} from "@/types/ai-interview";

/**
 * Generate career readiness assessment
 */
export async function assessCareerReadiness(
  userProfile: UserInterviewProfile,
  interviewHistory: {
    score: number;
    date: Date;
    topicsStrong: string[];
    topicsWeak: string[];
  }[]
): Promise<CareerReadinessAssessment> {
  const overallReadiness = calculateOverallReadiness(
    userProfile,
    interviewHistory
  );

  return {
    userId: userProfile.userId,
    targetRole: userProfile.targetRole,
    overallReadiness,
    skillCoverage: calculateSkillCoverage(userProfile),
    interviewExperience: Math.min(
      100,
      interviewHistory.length * 15
    ),
    communicationReadiness: 70,
    technicalDepth: extractAverageScore(interviewHistory, "technical"),
    confidenceScore: extractAverageScore(interviewHistory, "confidence"),
    skillGaps: generateSkillGaps(userProfile, interviewHistory),
    recommendedTopics: generateRecommendedTopics(
      userProfile,
      interviewHistory
    ),
    practicePlan: generatePracticePlan(
      overallReadiness,
      interviewHistory
    ),
    interviewPlan: generateInterviewPlan(
      overallReadiness,
      userProfile
    ),
    milestones: generateMilestones(overallReadiness),
  };
}

/**
 * Calculate overall readiness score
 */
function calculateOverallReadiness(
  userProfile: UserInterviewProfile,
  interviewHistory: {
    score: number;
    date: Date;
    topicsStrong: string[];
    topicsWeak: string[];
  }[]
): number {
  let readiness = 40; // Base score

  // Add points for skills
  readiness += Math.min(userProfile.skills.length * 3, 20);

  // Add points for interview experience
  if (interviewHistory.length > 0) {
    const avgScore = interviewHistory.reduce((sum, h) => sum + h.score, 0) / interviewHistory.length;
    readiness += (avgScore / 100) * 30;
  }

  // Add points for practice streak
  if (userProfile.practiceGoals.length > 0) {
    readiness += 5;
  }

  return Math.min(100, Math.max(0, readiness));
}

/**
 * Calculate skill coverage
 */
function calculateSkillCoverage(userProfile: UserInterviewProfile): number {
  const commonSkills = getCommonSkillsForRole(userProfile.targetRole);
  const covered = userProfile.skills.filter((s) =>
    commonSkills.some((cs) =>
      cs.toLowerCase().includes(s.toLowerCase())
    )
  ).length;

  return Math.round((covered / commonSkills.length) * 100);
}

/**
 * Extract average score for a category
 */
function extractAverageScore(
  interviewHistory: {
    score: number;
    date: Date;
    topicsStrong: string[];
    topicsWeak: string[];
  }[],
  _category: string
): number {
  if (interviewHistory.length === 0) return 50;

  const avgScore = interviewHistory.reduce((sum, h) => sum + h.score, 0) / interviewHistory.length;
  return Math.round(avgScore);
}

/**
 * Generate skill gaps
 */
function generateSkillGaps(
  userProfile: UserInterviewProfile,
  interviewHistory: {
    score: number;
    date: Date;
    topicsStrong: string[];
    topicsWeak: string[];
  }[]
): CareerReadinessAssessment["skillGaps"] {
  const weakTopics = new Set<string>();

  // Collect weak topics from interview history
  interviewHistory.forEach((h) => {
    h.topicsWeak.forEach((t) => weakTopics.add(t));
  });

  // Also include recommended topics not yet covered
  const commonSkills = getCommonSkillsForRole(userProfile.targetRole);
  const missingSkills = commonSkills.filter((s) =>
    !userProfile.skills.some((us) =>
      us.toLowerCase().includes(s.toLowerCase())
    )
  );

  return [
    ...[...weakTopics].slice(0, 2).map((skill) => ({
      skill,
      currentLevel: "Basic",
      requiredLevel: "Intermediate",
      timeToLearn: "2-4 weeks",
    })),
    ...missingSkills.slice(0, 2).map((skill) => ({
      skill,
      currentLevel: "None",
      requiredLevel: "Intermediate",
      timeToLearn: "4-8 weeks",
    })),
  ];
}

/**
 * Generate recommended topics
 */
function generateRecommendedTopics(
  userProfile: UserInterviewProfile,
  interviewHistory: {
    score: number;
    date: Date;
    topicsStrong: string[];
    topicsWeak: string[];
  }[]
): string[] {
  const topics: string[] = [];

  // Add weak topics from history
  if (interviewHistory.length > 0) {
    const weakTopics = new Set<string>();
    interviewHistory.forEach((h) => {
      h.topicsWeak.forEach((t) => weakTopics.add(t));
    });
    topics.push(...Array.from(weakTopics).slice(0, 3));
  }

  // Add topics for target role
  const roleTopics = getCommonSkillsForRole(userProfile.targetRole);
  topics.push(
    ...roleTopics.filter(
      (t) => !userProfile.skills.some((s) =>
        s.toLowerCase().includes(t.toLowerCase())
      )
    ).slice(0, 2)
  );

  return topics;
}

/**
 * Generate practice plan
 */
function generatePracticePlan(
  overallReadiness: number,
  _interviewHistory: {
    score: number;
    date: Date;
    topicsStrong: string[];
    topicsWeak: string[];
  }[]
): CareerReadinessAssessment["practicePlan"] {
  const weeks = overallReadiness < 50 ? 8 : overallReadiness < 70 ? 4 : 2;

  const plan: CareerReadinessAssessment["practicePlan"] = [];

  for (let week = 1; week <= weeks; week++) {
    const focusAreas = [
      "Technical Fundamentals",
      "Communication Skills",
      "Problem Solving",
      "System Design",
      "Behavioral Preparation",
      "Mock Interviews",
      "Advanced Topics",
      "Final Review",
    ];

    plan.push({
      week,
      focus: focusAreas[week - 1] || "Review",
      estimatedHours: 10 + week * 2,
      topics: [
        `Topic 1 for Week ${week}`,
        `Topic 2 for Week ${week}`,
        `Topic 3 for Week ${week}`,
      ],
    });
  }

  return plan;
}

/**
 * Generate interview plan
 */
function generateInterviewPlan(
  overallReadiness: number,
  userProfile: UserInterviewProfile
): CareerReadinessAssessment["interviewPlan"] {
  const daysUntilReady = overallReadiness < 50 ? 60 : overallReadiness < 70 ? 30 : 14;

  return [
    {
      round: 1,
      type: "introduction",
      difficulty: "easy",
      estimatedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
    {
      round: 2,
      type: "technical",
      difficulty: userProfile.experience === "fresher" ? "medium" : "hard",
      estimatedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
    {
      round: 3,
      type: "behavioral",
      difficulty: "medium",
      estimatedDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
    {
      round: 4,
      type: "coding",
      difficulty: userProfile.experience === "fresher" ? "medium" : "hard",
      estimatedDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
  ];
}

/**
 * Generate milestones
 */
function generateMilestones(overallReadiness: number): CareerReadinessAssessment["milestones"] {
  return [
    {
      name: "Technical Foundation",
      description: "Complete fundamental topics for target role",
      targetDate: "Week 2",
      progressPercentage: Math.min(overallReadiness, 40),
    },
    {
      name: "Interview Skills",
      description: "Complete 5 full mock interviews",
      targetDate: "Week 4",
      progressPercentage: Math.min(overallReadiness, 60),
    },
    {
      name: "Advanced Topics",
      description: "Master advanced concepts for target role",
      targetDate: "Week 6",
      progressPercentage: Math.min(overallReadiness, 80),
    },
    {
      name: "Interview Ready",
      description: "Achieve 75+ score on 3 consecutive interviews",
      targetDate: "Week 8",
      progressPercentage: overallReadiness,
    },
  ];
}

/**
 * Get common skills for role
 */
function getCommonSkillsForRole(role: string): string[] {
  const roleSkills: Record<string, string[]> = {
    frontend: [
      "JavaScript",
      "React",
      "HTML",
      "CSS",
      "TypeScript",
      "Performance",
      "Accessibility",
      "API Integration",
    ],
    backend: [
      "Node.js",
      "Databases",
      "APIs",
      "System Design",
      "Scalability",
      "Security",
      "Docker",
      "AWS",
    ],
    fullstack: [
      "JavaScript",
      "React",
      "Node.js",
      "Databases",
      "APIs",
      "System Design",
      "DevOps",
      "Cloud",
    ],
    "data scientist": [
      "Python",
      "Machine Learning",
      "Statistics",
      "Data Analysis",
      "SQL",
      "Pandas",
      "NumPy",
      "Scikit-learn",
    ],
  };

  return roleSkills[role.toLowerCase()] ||
    roleSkills["frontend"] || [
    "Problem Solving",
    "Communication",
    "System Design",
  ];
}

/**
 * Get recommendation for next step
 */
export async function getNextStepRecommendation(
  assessment: CareerReadinessAssessment
): Promise<string> {
  if (assessment.overallReadiness < 50) {
    return `Focus on building technical fundamentals. Your current readiness (${assessment.overallReadiness}%) requires concentrated practice on core concepts.`;
  }

  if (assessment.overallReadiness < 70) {
    return `Good progress! Focus on the identified skill gaps: ${assessment.skillGaps.map((g) => g.skill).join(", ")}. Practice mock interviews to build confidence.`;
  }

  return `You're well-prepared! Take a mock interview now to validate your readiness. Focus on ${assessment.skillGaps[0]?.skill || "communication"} for final polishing.`;
}
