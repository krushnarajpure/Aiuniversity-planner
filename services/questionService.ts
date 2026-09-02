/**
 * Question Service
 * Handles question generation, retrieval, and management
 */

import type {
  InterviewQuestion,
  QuestionType,
  Difficulty,
  InterviewType,
  Role,
  QuestionBankFilters,
  QuestionBankEntry,
} from "@/types/ai-interview";

// Mock question templates
const QUESTION_TEMPLATES: Record<string, Record<Difficulty, string[]>> = {
  frontend: {
    easy: [
      "What are the main differences between inline, inline-block, and block elements in CSS?",
      "Explain the concept of event bubbling in JavaScript.",
      "What is the virtual DOM in React and why is it important?",
      "How does CSS specificity work?",
      "What are the different ways to create a component in React?",
    ],
    medium: [
      "How would you optimize a React component that re-renders too often?",
      "Explain the difference between controlled and uncontrolled components.",
      "What are hooks in React and what are the rules for using them?",
      "How does the event loop work in JavaScript?",
      "Explain closures in JavaScript with a practical example.",
    ],
    hard: [
      "Design a system to manage state across a large React application.",
      "How would you implement infinite scroll efficiently?",
      "Explain memory leaks in JavaScript and how to prevent them.",
      "How would you build a progressively enhanced web application?",
      "What strategies would you use to optimize Core Web Vitals?",
    ],
    advanced: [
      "Design a performant data grid component for displaying millions of rows.",
      "How would you implement a WebAssembly module in a React application?",
      "Explain advanced rendering patterns and when to use each.",
      "How would you build a micro-frontend architecture?",
      "Design a real-time collaborative editing system.",
    ],
    expert: [
      "How would you design a state machine-based architecture for a complex UI?",
      "Explain advanced performance profiling and optimization techniques.",
      "How would you build a compiler for a domain-specific language?",
      "Design a cross-platform, accessible component system.",
      "How would you architect an AI-powered IDE?",
    ],
    beginner: [
      "What is HTML and what is it used for?",
      "What are CSS classes and IDs?",
      "What is a function in JavaScript?",
      "What is the DOM?",
      "What is the difference between var, let, and const?",
    ],
    elite: [
      "Design and implement an advanced type system for JavaScript.",
      "How would you build a distributed rendering system?",
      "Explain cutting-edge performance optimization techniques.",
      "Design an AI-assisted development platform.",
      "How would you architect a global-scale real-time platform?",
    ],
  },
  // More roles can be added here
};

/**
 * Generate questions for an interview
 */
export async function generateQuestionsForInterview(
  role: Role,
  interviewType: InterviewType,
  difficulty: Difficulty,
  count: number,
  context?: {
    resume?: string;
    jobDescription?: string;
    previousAnswers?: string[];
  }
): Promise<InterviewQuestion[]> {
  // TODO: Replace with real AI API call
  const questions: InterviewQuestion[] = [];
  const templates = QUESTION_TEMPLATES[role] || QUESTION_TEMPLATES["frontend"];
  const difficultyQuestions = templates[difficulty] || templates["medium"];

  for (let i = 0; i < Math.min(count, difficultyQuestions.length); i++) {
    questions.push({
      id: `q-${Date.now()}-${i}`,
      roundId: `round-${interviewType}`,
      type: "open_ended" as QuestionType,
      text: difficultyQuestions[i],
      difficulty,
      topic: getTopicForQuestion(difficultyQuestions[i], role),
      followUpTopics: ["Implementation", "Scalability", "Trade-offs"],
      expectedConcepts: getExpectedConcepts(difficultyQuestions[i]),
      contextFromResume: context?.resume ? "Relevant experience detected" : undefined,
      contextFromJobDescription: context?.jobDescription ? "Matches JD requirements" : undefined,
      hintAvailable: true,
      hints: getHintsForQuestion(difficultyQuestions[i]),
      skillsTested: getSkillsForQuestion(difficultyQuestions[i]),
    });
  }

  return questions;
}

/**
 * Get next adaptive question based on performance
 */
export async function getAdaptiveNextQuestion(
  role: Role,
  interviewType: InterviewType,
  currentDifficulty: Difficulty,
  lastAnswerScore: number,
  weakAreas: string[]
): Promise<InterviewQuestion> {
  // TODO: Use actual adaptive algorithm
  let nextDifficulty = currentDifficulty;
  let nextTopic = weakAreas[0] || getDefaultTopic(role);

  if (lastAnswerScore >= 80) {
    nextDifficulty = increaseDifficulty(currentDifficulty);
  } else if (lastAnswerScore < 50) {
    nextDifficulty = decreaseDifficulty(currentDifficulty);
    nextTopic = weakAreas[0] || nextTopic; // Focus on weak area
  }

  const questions = await generateQuestionsForInterview(
    role,
    interviewType,
    nextDifficulty,
    1,
    { previousAnswers: [nextTopic] }
  );

  return questions[0];
}

/**
 * Get question follow-ups
 */
export async function generateFollowUpQuestion(
  originalQuestion: string,
  userAnswer: string,
  answerScore: number
): Promise<string> {
  // TODO: Replace with real AI API
  const followUpTemplates = [
    "Can you elaborate on that point?",
    "How would you handle edge cases?",
    "What would be the trade-offs?",
    "How would you optimize this solution?",
    "Can you provide a concrete example?",
    "What are the alternative approaches?",
  ];

  return followUpTemplates[Math.floor(Math.random() * followUpTemplates.length)];
}

/**
 * Search question bank
 */
export async function searchQuestionBank(
  filters: QuestionBankFilters,
  searchText?: string
): Promise<QuestionBankEntry[]> {
  // TODO: Replace with real database search
  const mockQuestions: QuestionBankEntry[] = [
    {
      id: "q1",
      question: "What is React?",
      type: "open_ended",
      difficulty: "beginner",
      topic: "React Basics",
      skills: ["React", "JavaScript"],
      roles: ["frontend"],
      expectedConceptsMinimal: ["JSX", "Components", "Props"],
      expectedConceptsDetailed: [
        "Virtual DOM",
        "React Fiber",
        "Reconciliation",
      ],
      suggestedAnswer: "React is a JavaScript library for building UIs...",
      tags: ["frontend", "react", "javascript"],
      views: 1000,
      usersFailed: 100,
      usersSucceeded: 900,
      averageScore: 85,
    },
    {
      id: "q2",
      question: "Explain the difference between props and state",
      type: "open_ended",
      difficulty: "easy",
      topic: "React Core",
      skills: ["React", "State Management"],
      roles: ["frontend"],
      expectedConceptsMinimal: ["Props", "State", "Immutability"],
      expectedConceptsDetailed: [
        "Unidirectional flow",
        "Component communication",
        "Re-renders",
      ],
      suggestedAnswer: "Props are passed down from parent...",
      tags: ["react", "state", "props"],
      views: 800,
      usersFailed: 150,
      usersSucceeded: 650,
      averageScore: 78,
    },
  ];

  let results = mockQuestions;

  if (filters.difficulty) {
    results = results.filter((q) => filters.difficulty?.includes(q.difficulty));
  }

  if (filters.skills) {
    results = results.filter((q) =>
      q.skills.some((s) => filters.skills?.includes(s))
    );
  }

  if (searchText) {
    const lowercaseSearch = searchText.toLowerCase();
    results = results.filter(
      (q) =>
        q.question.toLowerCase().includes(lowercaseSearch) ||
        q.topic.toLowerCase().includes(lowercaseSearch)
    );
  }

  return results;
}

/**
 * Get question hints
 */
export async function getQuestionHints(
  questionId: string
): Promise<string[]> {
  // TODO: Replace with real database
  return [
    "Consider the core concept being tested",
    "Think about edge cases",
    "What would a senior engineer do?",
  ];
}

/**
 * Mark question as complete
 */
export async function markQuestionAsComplete(
  userId: string,
  questionId: string,
  score: number
): Promise<void> {
  // TODO: Update database
  console.log("Marking question complete:", questionId, score);
}

// Helper functions

function getTopicForQuestion(question: string, role: string): string {
  // Simple heuristic - in production, use ML/NLP
  if (question.toLowerCase().includes("react")) return "React";
  if (question.toLowerCase().includes("css")) return "CSS";
  if (question.toLowerCase().includes("database")) return "Databases";
  if (question.toLowerCase().includes("api")) return "APIs";
  return "General";
}

function getExpectedConcepts(question: string): string[] {
  // Simple heuristic - in production, use ML/NLP
  if (question.toLowerCase().includes("react"))
    return ["JSX", "Components", "Props", "State"];
  if (question.toLowerCase().includes("optimize"))
    return ["Performance", "Algorithm Complexity", "Caching"];
  return ["Fundamentals"];
}

function getHintsForQuestion(question: string): string[] {
  return [
    "Start with the basics",
    "Consider the problem from first principles",
    "Think about real-world examples",
  ];
}

function getSkillsForQuestion(question: string): string[] {
  if (question.toLowerCase().includes("javascript"))
    return ["JavaScript", "Programming"];
  if (question.toLowerCase().includes("react"))
    return ["React", "Frontend"];
  return ["General"];
}

function getDefaultTopic(role: Role): string {
  const topicMap: Record<Role, string> = {
    frontend: "React Basics",
    backend: "Node.js Basics",
    fullstack: "Full Stack Basics",
    react: "React Advanced",
    nodejs: "Node.js Advanced",
    java: "Java Basics",
    python: "Python Basics",
    data_analyst: "Data Analysis",
    data_scientist: "Machine Learning",
    ai_engineer: "AI/ML",
    ml_engineer: "ML Models",
    devops: "DevOps",
    cloud: "Cloud Platform",
    cybersecurity: "Security",
    designer: "Design",
    pm: "Product Management",
    ba: "Business Analysis",
    marketing: "Marketing",
    finance: "Finance",
    hr: "HR",
    sales: "Sales",
    support: "Customer Support",
    custom: "Custom Topic",
  };
  return topicMap[role] || "General";
}

function increaseDifficulty(current: Difficulty): Difficulty {
  const progression: Record<Difficulty, Difficulty> = {
    beginner: "easy",
    easy: "medium",
    medium: "hard",
    hard: "advanced",
    advanced: "expert",
    expert: "elite",
    elite: "elite",
  };
  return progression[current];
}

function decreaseDifficulty(current: Difficulty): Difficulty {
  const progression: Record<Difficulty, Difficulty> = {
    beginner: "beginner",
    easy: "beginner",
    medium: "easy",
    hard: "medium",
    advanced: "hard",
    expert: "advanced",
    elite: "expert",
  };
  return progression[current];
}
