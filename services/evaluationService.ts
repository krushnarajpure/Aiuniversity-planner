/**
 * Evaluation Service
 * Handles answer evaluation, scoring, and feedback generation
 */

import type {
  AnswerEvaluation,
  InterviewAnswer,
  AnswerMetrics,
  Difficulty,
} from "@/types/ai-interview";

/**
 * Evaluate an answer
 */
export async function evaluateAnswer(
  answer: InterviewAnswer,
  expectedConcepts: string[],
  suggestedAnswer: string,
  difficulty: Difficulty
): Promise<AnswerEvaluation> {
  // TODO: Replace with real AI API for evaluation
  const score = calculateScore(answer.text, expectedConcepts, suggestedAnswer);
  const conceptsCovered = detectConcepts(answer.text, expectedConcepts);
  const conceptsMissed = expectedConcepts.filter(
    (c) => !conceptsCovered.includes(c)
  );

  return {
    id: `eval-${Date.now()}`,
    answerId: answer.id,
    score: Math.min(100, Math.max(0, score)),
    detailedScores: {
      technical: score - 5,
      communication: score + 3,
      clarity: score,
      structure: score - 2,
      completeness: Math.max(0, score - 10),
      relevance: score + 5,
      problemSolving: score,
    },
    strengths: generateStrengths(answer.text, score),
    improvements: generateImprovements(answer.text, score, conceptsMissed),
    evidence: extractEvidence(answer.text),
    conceptsCovered,
    conceptsMissed,
    starAnalysis:
      expectedConcepts.includes("STAR") || answer.text.toLowerCase().includes("situation")
        ? analyzeStar(answer.text)
        : undefined,
    suggestedAnswer,
    improvedVersion: generateImprovedVersion(answer.text, expectedConcepts),
    nextQuestionRecommendation: generateNextQuestionRecommendation(
      score,
      conceptsMissed
    ),
    difficulty,
    adjustedDifficulty: adjustDifficultyBased(difficulty, score),
    topicsToFollow: generateFollowUpTopics(conceptsMissed),
    feedback: generateFeedback(score, conceptsMissed),
  };
}

/**
 * Calculate answer score
 */
function calculateScore(
  answer: string,
  expectedConcepts: string[],
  suggestedAnswer: string
): number {
  let score = 50; // Base score

  // Check for expected concepts
  const conceptsFound = expectedConcepts.filter((concept) =>
    answer.toLowerCase().includes(concept.toLowerCase())
  );
  score += (conceptsFound.length / expectedConcepts.length) * 30;

  // Check answer length (penalize too short or too long)
  const wordCount = answer.split(/\s+/).length;
  if (wordCount < 20) {
    score -= 10;
  } else if (wordCount > 500) {
    score -= 5;
  } else if (wordCount > 300) {
    score -= 2;
  }

  // Check for examples
  if (
    answer.toLowerCase().includes("example") ||
    answer.toLowerCase().includes("for instance")
  ) {
    score += 10;
  }

  // Check for structure
  if (
    answer.includes("\n") ||
    answer.toLowerCase().includes("first") ||
    answer.toLowerCase().includes("second")
  ) {
    score += 5;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Detect concepts in answer
 */
function detectConcepts(answer: string, expectedConcepts: string[]): string[] {
  const lowerAnswer = answer.toLowerCase();
  return expectedConcepts.filter((concept) =>
    lowerAnswer.includes(concept.toLowerCase())
  );
}

/**
 * Generate strengths
 */
function generateStrengths(answer: string, score: number): string[] {
  const strengths: string[] = [];

  if (score > 70) {
    strengths.push("Clear understanding of the topic");
  }

  if (answer.length > 150) {
    strengths.push("Comprehensive answer with good depth");
  }

  if (
    answer.toLowerCase().includes("example") ||
    answer.toLowerCase().includes("for instance")
  ) {
    strengths.push("Good use of examples");
  }

  if (
    answer.includes("?") ||
    answer.toLowerCase().includes("could") ||
    answer.toLowerCase().includes("might")
  ) {
    strengths.push("Acknowledges alternative approaches");
  }

  return strengths.length > 0
    ? strengths
    : ["Some relevant concepts covered"];
}

/**
 * Generate improvement suggestions
 */
function generateImprovements(
  answer: string,
  score: number,
  conceptsMissed: string[]
): string[] {
  const improvements: string[] = [];

  if (conceptsMissed.length > 0) {
    improvements.push(
      `Consider covering: ${conceptsMissed.slice(0, 2).join(", ")}`
    );
  }

  if (answer.length < 100) {
    improvements.push("Provide more detail and examples");
  }

  if (score < 60) {
    improvements.push("Review the fundamentals of this topic");
  }

  if (!answer.toLowerCase().includes("example")) {
    improvements.push("Add practical examples to strengthen your answer");
  }

  return improvements.length > 0
    ? improvements
    : ["Overall, good answer. Minor improvements possible."];
}

/**
 * Extract evidence from answer
 */
function extractEvidence(answer: string): string[] {
  const evidence: string[] = [];
  const sentences = answer.split(/[.!?]+/);

  // Extract first 2-3 most relevant sentences
  sentences.slice(0, 3).forEach((sentence) => {
    const trimmed = sentence.trim();
    if (trimmed.length > 20) {
      evidence.push(trimmed);
    }
  });

  return evidence;
}

/**
 * Analyze STAR framework
 */
function analyzeStar(
  answer: string
): AnswerEvaluation["starAnalysis"] {
  const lowerAnswer = answer.toLowerCase();

  return {
    hasSituation:
      lowerAnswer.includes("situation") ||
      lowerAnswer.includes("was") ||
      lowerAnswer.includes("were"),
    hasTask:
      lowerAnswer.includes("task") ||
      lowerAnswer.includes("responsible") ||
      lowerAnswer.includes("needed"),
    hasAction:
      lowerAnswer.includes("action") ||
      lowerAnswer.includes("did") ||
      lowerAnswer.includes("implemented"),
    hasResult:
      lowerAnswer.includes("result") ||
      lowerAnswer.includes("outcome") ||
      lowerAnswer.includes("improved"),
    missing: [],
  };
}

/**
 * Generate improved version
 */
function generateImprovedVersion(
  answer: string,
  expectedConcepts: string[]
): string {
  let improved = answer;

  // Add concepts if missing
  const conceptsToAdd = expectedConcepts.slice(0, 2);
  if (!improved.toLowerCase().includes(conceptsToAdd[0].toLowerCase())) {
    improved += ` Additionally, it's important to consider ${conceptsToAdd[0]}.`;
  }

  // Improve structure
  if (!improved.includes("example")) {
    improved += ` For example, you could...`;
  }

  return improved;
}

/**
 * Generate next question recommendation
 */
function generateNextQuestionRecommendation(
  score: number,
  conceptsMissed: string[]
): string {
  if (score > 80) {
    return "Let's explore a more advanced topic";
  } else if (score > 60) {
    return `Let's build on this. Next question about ${conceptsMissed[0] || "related concepts"}`;
  }
  return `Let's practice more on fundamentals before advancing`;
}

/**
 * Adjust difficulty
 */
function adjustDifficultyBased(
  current: Difficulty,
  score: number
): Difficulty | undefined {
  if (score > 85) return "hard";
  if (score > 75) return "medium";
  if (score < 50) return "beginner";
  return undefined;
}

/**
 * Generate follow-up topics
 */
function generateFollowUpTopics(conceptsMissed: string[]): string[] {
  return conceptsMissed.slice(0, 3);
}

/**
 * Generate feedback
 */
function generateFeedback(score: number, conceptsMissed: string[]): string {
  if (score > 80) {
    return "Excellent answer! You demonstrated strong understanding.";
  } else if (score > 60) {
    return "Good answer with some room for improvement.";
  } else if (score > 40) {
    return "Your answer covers some key points, but needs more depth.";
  }
  return "Let's review the fundamentals and try again.";
}

/**
 * Calculate communication score
 */
export function calculateCommunicationScore(metrics: AnswerMetrics): number {
  let score = 50;

  // Clarity
  score += (metrics.clarity || 0) / 2;

  // Grammar
  if ((metrics.grammar?.errors || 0) === 0) score += 15;
  else if ((metrics.grammar?.errors || 0) < 3) score += 10;

  // Vocabulary
  score += Math.min((metrics.vocabulary?.uniqueWords || 0) / 50, 15);

  // Confidence (inverse of hesitations)
  const hesitationPenalty = Math.min((metrics.confidenceIndicators?.hesitations || 0) * 2, 15);
  score -= hesitationPenalty;

  return Math.min(100, Math.max(0, score));
}

/**
 * Generate comprehensive feedback
 */
export async function generateComprehensiveFeedback(
  answer: string,
  evaluation: AnswerEvaluation,
  conversationHistory?: string[]
): Promise<{
  summary: string;
  improvements: string[];
  examples: string[];
  resources?: string[];
}> {
  return {
    summary: `Your answer scored ${evaluation.score}/100. ${evaluation.feedback}`,
    improvements: evaluation.improvements,
    examples: [
      "Here's an improved version of your answer...",
      "Another way to think about this...",
    ],
    resources: [
      "https://example.com/concept1",
      "https://example.com/concept2",
    ],
  };
}
