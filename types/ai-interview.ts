// AI Interview Type Definitions
// Comprehensive types for the AI Interview module

// Core Models
export interface UserInterviewProfile {
  userId: string;
  targetRole: string;
  experience: 'student' | 'fresher' | 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'manager';
  skills: string[];
  preferredLanguage: string;
  interviewPreferences: {
    duration: number;
    difficulty: Difficulty;
    interviewMode: InterviewMode;
    microphonePreferred: boolean;
    cameraPreferred: boolean;
    captionsEnabled: boolean;
  };
  weakTopics: string[];
  strongTopics: string[];
  practiceGoals: string[];
  targetCompanies: string[];
  certifications?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'advanced' | 'expert' | 'elite';
export type InterviewMode = 'text' | 'voice' | 'video' | 'mixed';
export type InterviewPurpose = 'internship' | 'campus' | 'job' | 'career_switch' | 'promotion' | 'practice' | 'certification' | 'freelance' | 'startup' | 'government' | 'technical_screening';
export type Role = 'frontend' | 'backend' | 'fullstack' | 'react' | 'nodejs' | 'java' | 'python' | 'data_analyst' | 'data_scientist' | 'ai_engineer' | 'ml_engineer' | 'devops' | 'cloud' | 'cybersecurity' | 'designer' | 'pm' | 'ba' | 'marketing' | 'finance' | 'hr' | 'sales' | 'support' | 'custom';
export type InterviewType = 'introduction' | 'hr' | 'behavioral' | 'technical' | 'coding' | 'system_design' | 'case_study' | 'problem_solving' | 'rapid_fire' | 'final_hr';
export type PersonalityStyle = 'friendly' | 'professional' | 'strict' | 'technical' | 'challenging' | 'supportive' | 'executive' | 'recruiter' | 'hiring_manager' | 'cto' | 'panel';
export type QuestionType = 'mcq' | 'open_ended' | 'coding' | 'behavioral' | 'scenario' | 'case_study' | 'system_design' | 'rapid_fire';
export type RoundName = 'introduction' | 'resume' | 'technical' | 'coding' | 'behavioral' | 'hr' | 'system_design' | 'rapid_fire' | 'final';

export interface InterviewSession {
  id: string;
  userId: string;
  status: 'setup' | 'in_progress' | 'paused' | 'completed' | 'abandoned';
  config: InterviewConfig;
  rounds: InterviewRound[];
  currentRoundIndex: number;
  currentQuestionIndex: number;
  answers: InterviewAnswer[];
  score?: InterviewScore;
  report?: InterviewReport;
  startedAt?: Date;
  completedAt?: Date;
  duration: number; // in seconds
  metadata: {
    resumeUploaded: boolean;
    jobDescriptionProvided: boolean;
    companyName?: string;
    notes?: string;
  };
}

export interface InterviewConfig {
  purpose: InterviewPurpose;
  role: Role;
  experience: 'student' | 'fresher' | 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'manager';
  difficulty: Difficulty;
  interviewTypes: InterviewType[];
  duration: number;
  questionCount: number;
  company?: string;
  jobDescription?: string;
  resume?: string;
  personality: PersonalityStyle;
  interviewMode: InterviewMode;
  adaptiveDifficulty: boolean;
}

export interface InterviewRound {
  id: string;
  name: RoundName;
  difficulty: Difficulty;
  topicsToTest: string[];
  estimatedDuration: number;
  questions: InterviewQuestion[];
  startedAt?: Date;
  completedAt?: Date;
  score?: number;
}

export interface InterviewQuestion {
  id: string;
  roundId: string;
  type: QuestionType;
  text: string;
  difficulty: Difficulty;
  topic: string;
  followUpTopics: string[];
  expectedConcepts: string[];
  contextFromResume?: string;
  contextFromJobDescription?: string;
  contextFromPreviousAnswer?: string;
  codeTemplate?: string;
  codeLanguages?: string[];
  timeLimit?: number;
  hintAvailable: boolean;
  hints?: string[];
  relatedProjects?: string[];
  skillsTested: string[];
  starComponentsRequired?: ('situation' | 'task' | 'action' | 'result')[];
}

export interface InterviewAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  userId: string;
  text: string;
  voiceTranscript?: string;
  codeSubmission?: CodeSubmission;
  videoUrl?: string;
  submittedAt: Date;
  duration: number; // in seconds
  metrics: AnswerMetrics;
  evaluation?: AnswerEvaluation;
}

export interface CodeSubmission {
  language: string;
  code: string;
  testResults?: TestResult[];
  complexity?: {
    timeComplexity: string;
    spaceComplexity: string;
  };
}

export interface TestResult {
  testName: string;
  passed: boolean;
  input: string;
  expected: string;
  actual?: string;
  error?: string;
}

export interface AnswerMetrics {
  wordCount: number;
  wordsPerMinute: number;
  fillerWordCount: number;
  pauseCount: number;
  averagePauseLength: number;
  sentenceComplexity: number;
  answerLength: 'too_short' | 'optimal' | 'too_long';
  grammar: {
    errors: number;
    score: number;
  };
  vocabulary: {
    uniqueWords: number;
    complexity: number;
  };
  confidenceIndicators: {
    hesitations: number;
    corrections: number;
    score: number;
  };
  clarity: number; // 0-100
  completeness: number; // 0-100
  relevance: number; // 0-100
}

export interface AnswerEvaluation {
  id: string;
  answerId: string;
  score: number; // 0-100
  detailedScores: {
    technical: number;
    communication: number;
    clarity: number;
    structure: number;
    completeness: number;
    relevance: number;
    problemSolving: number;
    behavioral?: number;
    codingCorrectness?: number;
    codeEfficiency?: number;
  };
  strengths: string[];
  improvements: string[];
  evidence: string[]; // quotes from answer
  conceptsCovered: string[];
  conceptsMissed: string[];
  starAnalysis?: {
    hasSituation: boolean;
    hasTask: boolean;
    hasAction: boolean;
    hasResult: boolean;
    missing: string[];
  };
  suggestedAnswer?: string;
  improvedVersion?: string;
  nextQuestionRecommendation: string;
  difficulty: Difficulty;
  adjustedDifficulty?: Difficulty;
  topicsToFollow: string[];
  feedback: string;
}

export interface InterviewScore {
  overall: number; // 0-100
  technical: number;
  communication: number;
  behavioral: number;
  problemSolving: number;
  coding: number;
  clarity: number;
  structure: number;
  confidence: number;
  readiness: number;
  roleReadiness: number;
  skillGaps: string[];
  strongSkills: string[];
  weakSkills: string[];
  improvementPercentage: number; // vs previous interview
  recommendedFocusAreas: string[];
}

export interface InterviewReport {
  id: string;
  sessionId: string;
  userId: string;
  generatedAt: Date;
  executiveSummary: string;
  overallScore: InterviewScore;
  roundScores: Record<RoundName, number>;
  technicalPerformance: {
    score: number;
    topicsStrong: string[];
    topicsWeak: string[];
    recommendations: string[];
  };
  communicationAnalysis: {
    clarity: number;
    structure: number;
    vocabulary: number;
    grammar: number;
    fillerWords: number;
    pacing: number;
  };
  behavioralPerformance: {
    score: number;
    starScores: Record<'situation' | 'task' | 'action' | 'result', number>;
    leadershipQualities: string[];
    areasForImprovement: string[];
  };
  codingPerformance?: {
    score: number;
    correctness: number;
    efficiency: number;
    approach: number;
  };
  strengths: string[];
  weaknesses: string[];
  questionReview: {
    questionId: string;
    question: string;
    userAnswer: string;
    evaluation: string;
    suggestedAnswer: string;
    improvementTips: string[];
  }[];
  sevenDayPlan: string[];
  thirtyDayPlan: string[];
  nextSteps: string[];
  certificationsEarned?: string[];
  comparisonWithPreviousInterview?: {
    improvementAreas: string[];
    consistentWeaknesses: string[];
    progressSummary: string;
  };
  practiceRecommendations: {
    skill: string;
    difficulty: Difficulty;
    estimatedPracticeDays: number;
  }[];
}

// Resume Intelligence
export interface ResumeAnalysis {
  id: string;
  userId: string;
  resumeText: string;
  parsedData: ParsedResume;
  analysis: ResumeIntelligence;
  questionsGenerated: string[];
  createdAt: Date;
}

export interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  summary?: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: string[];
  certifications: string[];
  projects: ProjectEntry[];
  technologies: string[];
  achievements: string[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
}

export interface ExperienceEntry {
  company: string;
  position: string;
  duration: string;
  description: string;
  achievements?: string[];
  technologies?: string[];
}

export interface ProjectEntry {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  achievements?: string[];
}

export interface ResumeIntelligence {
  overallReadiness: number;
  strengths: string[];
  gaps: string[];
  inconsistencies: string[];
  possibleFollowUpQuestions: {
    skill: string;
    questions: string[];
  }[];
  projectInterviewPoints: {
    project: string;
    focusAreas: string[];
    possibleQuestions: string[];
  }[];
  experienceInterviewPoints: {
    company: string;
    position: string;
    keyAchievements: string[];
    behavioralQuestions: string[];
    technicalQuestions: string[];
  }[];
  missingKeywords: string[];
  recommendedSkillsToAdd: string[];
  resumeScore: {
    clarity: number;
    completeness: number;
    relevance: number;
    impact: number;
  };
}

// Job Description Intelligence
export interface JobDescriptionAnalysis {
  id: string;
  userId: string;
  jobDescription: string;
  parsedData: ParsedJobDescription;
  analysis: JobIntelligence;
  questionsGenerated: string[];
  createdAt: Date;
}

export interface ParsedJobDescription {
  title: string;
  company?: string;
  level: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  qualifications: string[];
  experience: string;
  technologies: string[];
  softSkills: string[];
  keywordDensity: Record<string, number>;
}

export interface JobIntelligence {
  matchScore: number; // based on user resume
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  criticalSkillGaps: string[];
  roleSpecificQuestions: string[];
  companyStyleQuestions?: string[];
  technicalDepthRequired: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedInterviewRounds: InterviewType[];
  preparationChecklist: {
    category: string;
    items: string[];
  }[];
  commonInterviewPatterns: string[];
  roleReadinessAssessment: {
    technical: number;
    seniority: number;
    communication: number;
    cultureFit: number;
  };
}

// Career Intelligence
export interface CareerReadinessAssessment {
  userId: string;
  targetRole: string;
  overallReadiness: number; // 0-100
  skillCoverage: number;
  interviewExperience: number;
  communicationReadiness: number;
  technicalDepth: number;
  confidenceScore: number;
  skillGaps: {
    skill: string;
    currentLevel: string;
    requiredLevel: string;
    timeToLearn: string;
  }[];
  recommendedTopics: string[];
  practicePlan: {
    week: number;
    focus: string;
    estimatedHours: number;
    topics: string[];
  }[];
  interviewPlan: {
    round: number;
    type: InterviewType;
    difficulty: Difficulty;
    estimatedDate: string;
  }[];
  milestones: {
    name: string;
    description: string;
    targetDate: string;
    progressPercentage: number;
  }[];
}

// Practice Sessions & Achievements
export interface PracticeSession {
  id: string;
  userId: string;
  type: 'question' | 'interview' | 'challenge' | 'learning';
  difficulty: Difficulty;
  topic?: string;
  duration: number;
  score?: number;
  completedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: {
    type: 'score' | 'count' | 'streak' | 'skill' | 'special';
    requirement: unknown;
  };
  earnedAt?: Date;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface Certificate {
  id: string;
  userId: string;
  name: string;
  description: string;
  earnedAt: Date;
  expiresAt?: Date;
  issuer: string;
  certificateUrl?: string;
  skills: string[];
  level: Difficulty;
}

export interface DailyChallenge {
  id: string;
  date: string;
  question: string;
  category: string;
  difficulty: Difficulty;
  timeLimit: number;
  isCompleted: boolean;
  userAnswer?: string;
  score?: number;
  completedAt?: Date;
}

export interface Streak {
  userId: string;
  type: 'interview' | 'practice' | 'challenge' | 'daily';
  currentStreak: number;
  longestStreak: number;
  startDate: Date;
  lastActivityDate: Date;
}

// Gamification
export interface UserProgress {
  userId: string;
  level: number;
  xp: number;
  totalXP: number;
  badges: string[];
  achievements: string[];
  streaks: Streak[];
  stats: {
    totalInterviews: number;
    questionsAnswered: number;
    averageScore: number;
    improvementPercentage: number;
    strongestSkill: string;
    weakestSkill: string;
    interviewsThisWeek: number;
    practiceSessionsThisMonth: number;
  };
}

// Settings & Preferences
export interface InterviewSettings {
  userId: string;
  display: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    reducedMotion: boolean;
    highContrast: boolean;
  };
  interview: {
    defaultDifficulty: Difficulty;
    defaultDuration: number;
    defaultInterviewMode: InterviewMode;
    autoPlayQuestions: boolean;
    autoAdvanceAfterAnswer: boolean;
  };
  audio: {
    microphonePreferred: boolean;
    autoStartRecording: boolean;
    playbackSpeed: number;
    captionsEnabled: boolean;
  };
  video: {
    cameraPreferred: boolean;
    recordingEnabled: boolean;
    backgroundBlur: boolean;
    lightingReminder: boolean;
  };
  ai: {
    feedbackLevel: 'minimal' | 'standard' | 'detailed';
    adaptiveDifficulty: boolean;
    aiPersonality: PersonalityStyle;
  };
  notifications: {
    dailyChallenges: boolean;
    streakReminders: boolean;
    practiceRecommendations: boolean;
    reportReady: boolean;
    goalProgress: boolean;
  };
  privacy: {
    dataRetention: 'month' | 'quarter' | 'year' | 'forever';
    transcriptRetention: boolean;
    recordingRetention: boolean;
    shareAnalytics: boolean;
  };
}

// Question Bank
export interface QuestionBankFilters {
  roles?: Role[];
  skills?: string[];
  topics?: string[];
  difficulty?: Difficulty[];
  company?: string[];
  experience?: string[];
  interviewType?: InterviewType[];
  language?: string[];
  duration?: number[];
  questionType?: QuestionType[];
}

export interface QuestionBankEntry {
  id: string;
  question: string;
  type: QuestionType;
  difficulty: Difficulty;
  topic: string;
  skills: string[];
  roles: Role[];
  company?: string;
  expectedConceptsMinimal: string[];
  expectedConceptsDetailed: string[];
  suggestedAnswer: string;
  starFramework?: string;
  companies?: string[];
  tags: string[];
  views: number;
  usersFailed: number;
  usersSucceeded: number;
  averageScore: number;
  resourceLinks?: string[];
}

// Dashboard Widgets
export type DashboardWidget =
  | 'readiness_score'
  | 'interview_streak'
  | 'weekly_practice'
  | 'recent_interview'
  | 'recommended_interview'
  | 'weak_skills'
  | 'strong_skills'
  | 'upcoming_challenge'
  | 'latest_report'
  | 'career_goal'
  | 'skill_progress'
  | 'question_progress'
  | 'coding_progress'
  | 'xp_progress'
  | 'interview_history'
  | 'daily_challenge';

export interface DashboardLayout {
  userId: string;
  widgets: DashboardWidget[];
  layout: {
    widget: DashboardWidget;
    row: number;
    col: number;
    width: 1 | 2 | 3 | 4;
    height: 1 | 2 | 3;
  }[];
}
