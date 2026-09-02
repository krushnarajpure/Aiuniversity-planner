/**
 * Interview Service
 * Handles interview session management, configuration, and lifecycle
 */

import type {
  InterviewSession,
  InterviewConfig,
  InterviewRound,
  Difficulty,
  InterviewType,
  RoundName,
  PersonalityStyle,
} from "@/types/ai-interview";

// Mock interview duration configurations
const ROUND_DURATIONS: Record<InterviewType, number> = {
  introduction: 5,
  hr: 15,
  behavioral: 20,
  technical: 25,
  coding: 30,
  system_design: 40,
  case_study: 35,
  problem_solving: 20,
  rapid_fire: 10,
  final_hr: 10,
};

/**
 * Create a new interview session
 */
export async function createInterviewSession(
  userId: string,
  config: InterviewConfig
): Promise<InterviewSession> {
  // TODO: Replace with real database call
  const rounds = generateRounds(config);

  return {
    id: `session-${Date.now()}`,
    userId,
    status: "setup",
    config,
    rounds,
    currentRoundIndex: 0,
    currentQuestionIndex: 0,
    answers: [],
    duration: 0,
    metadata: {
      resumeUploaded: !!config.resume,
      jobDescriptionProvided: !!config.jobDescription,
      companyName: config.company,
    },
  };
}

/**
 * Generate interview rounds based on config
 */
function generateRounds(config: InterviewConfig): InterviewRound[] {
  const rounds: InterviewRound[] = [];
  const questionsPerRound = Math.ceil(config.questionCount / config.interviewTypes.length);

  config.interviewTypes.forEach((type, index) => {
    const roundName = typeToRoundName(type);
    rounds.push({
      id: `round-${index}`,
      name: roundName,
      difficulty: config.difficulty,
      topicsToTest: getTopicsForRound(type, config.role),
      estimatedDuration: ROUND_DURATIONS[type],
      questions: [], // Will be populated during interview
      score: undefined,
    });
  });

  return rounds;
}

/**
 * Map interview type to round name
 */
function typeToRoundName(type: InterviewType): RoundName {
  const mapping: Record<InterviewType, RoundName> = {
    introduction: "introduction",
    hr: "hr",
    behavioral: "behavioral",
    technical: "technical",
    coding: "coding",
    system_design: "system_design",
    case_study: "technical", // maps to technical round
    problem_solving: "technical",
    rapid_fire: "technical",
    final_hr: "final",
  };
  return mapping[type];
}

/**
 * Get topics for a round based on role
 */
function getTopicsForRound(type: InterviewType, role: string): string[] {
  const topicMappings: Record<string, Record<InterviewType, string[]>> = {
    frontend: {
      technical: ["HTML", "CSS", "JavaScript", "React", "Performance", "Accessibility"],
      behavioral: ["Teamwork", "Problem Solving", "Adaptability", "Communication"],
      coding: ["Algorithms", "Data Structures", "Problem Solving"],
      hr: ["Career Goals", "Motivation", "Company Interest", "Salary"],
      introduction: ["Background", "Experience", "Interests"],
      system_design: ["Architecture", "Scalability", "Performance"],
      case_study: ["Problem Analysis", "Solution Design"],
      problem_solving: ["Critical Thinking", "Logical Reasoning"],
      rapid_fire: ["Quick Recall", "Core Concepts"],
      final_hr: ["Final Assessment", "Questions for Us"],
    },
    backend: {
      technical: ["Node.js", "Databases", "APIs", "Security", "Scalability", "Performance"],
      behavioral: ["Teamwork", "Problem Solving", "Adaptability", "Communication"],
      coding: ["Algorithms", "Data Structures", "Database Design"],
      hr: ["Career Goals", "Motivation", "Company Interest", "Salary"],
      introduction: ["Background", "Experience", "Interests"],
      system_design: ["System Design", "Scalability", "Database"],
      case_study: ["System Design", "Problem Analysis"],
      problem_solving: ["Critical Thinking", "Optimization"],
      rapid_fire: ["Core Concepts", "Quick Recall"],
      final_hr: ["Final Assessment", "Questions for Us"],
    },
    // ... more roles can be added
  };

  const roleTopics =
    topicMappings[role.toLowerCase()] || topicMappings["frontend"];
  return roleTopics[type] || ["General Knowledge"];
}

/**
 * Get current round
 */
export function getCurrentRound(session: InterviewSession): InterviewRound | null {
  return session.rounds[session.currentRoundIndex] || null;
}

/**
 * Get current question
 */
export function getCurrentQuestion(session: InterviewSession) {
  const round = getCurrentRound(session);
  if (!round) return null;
  return round.questions[session.currentQuestionIndex] || null;
}

/**
 * Check if interview is complete
 */
export function isInterviewComplete(session: InterviewSession): boolean {
  const totalQuestions = session.rounds.reduce(
    (sum, round) => sum + round.questions.length,
    0
  );
  return session.answers.length >= Math.min(totalQuestions, session.config.questionCount);
}

/**
 * Get interview progress percentage
 */
export function getInterviewProgress(session: InterviewSession): number {
  const totalQuestions = session.config.questionCount;
  return Math.round((session.answers.length / totalQuestions) * 100);
}

/**
 * Mock: Get adaptive difficulty for next question
 * In production, this would use AI/ML to determine optimal difficulty
 */
export function getAdaptiveDifficulty(
  session: InterviewSession,
  baseConfigDifficulty: Difficulty
): Difficulty {
  if (!session.config.adaptiveDifficulty) {
    return baseConfigDifficulty;
  }

  if (session.answers.length < 2) {
    return baseConfigDifficulty;
  }

  // Get average score of last 3 answers
  const recentAnswers = session.answers.slice(-3);
  const avgScore = recentAnswers.reduce((sum, a) => sum + (a.evaluation?.score || 0), 0) / recentAnswers.length;

  const difficultyProgression: Record<Difficulty, Difficulty> = {
    beginner: avgScore > 75 ? "easy" : "beginner",
    easy: avgScore > 80 ? "medium" : avgScore < 60 ? "beginner" : "easy",
    medium: avgScore > 80 ? "hard" : avgScore < 60 ? "easy" : "medium",
    hard: avgScore > 80 ? "advanced" : avgScore < 60 ? "medium" : "hard",
    advanced: avgScore > 80 ? "expert" : avgScore < 60 ? "hard" : "advanced",
    expert: avgScore < 60 ? "advanced" : "expert",
    elite: "elite",
  };

  return difficultyProgression[baseConfigDifficulty] || baseConfigDifficulty;
}

/**
 * Update interview session status
 */
export async function updateInterviewSession(
  sessionId: string,
  updates: Partial<InterviewSession>
): Promise<InterviewSession> {
  // TODO: Replace with real database call
  console.log("Updating session:", sessionId, updates);
  return { ...updates } as InterviewSession;
}

/**
 * End interview session
 */
export async function endInterviewSession(
  sessionId: string
): Promise<InterviewSession> {
  // TODO: Replace with real database call
  return {
    id: sessionId,
    status: "completed",
  } as InterviewSession;
}

/**
 * Pause interview session
 */
export async function pauseInterviewSession(
  sessionId: string
): Promise<InterviewSession> {
  // TODO: Replace with real database call
  return {
    id: sessionId,
    status: "paused",
  } as InterviewSession;
}

/**
 * Resume interview session
 */
export async function resumeInterviewSession(
  sessionId: string
): Promise<InterviewSession> {
  // TODO: Replace with real database call
  return {
    id: sessionId,
    status: "in_progress",
  } as InterviewSession;
}
