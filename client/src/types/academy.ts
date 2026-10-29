/**
 * Interview Academy: TypeScript Domain Types
 * 
 * Defines curriculum structures, interactive quizzes, good/bad comparative models,
 * and user-isolated progress persistence for the InterviewBro AI Academy.
 */

export type AcademyCategory = 
  | 'Foundation' 
  | 'Presence & Delivery' 
  | 'Core Answers' 
  | 'Placement Mastery';

export interface QuizOption {
  id: string; // 'a' | 'b' | 'c' | 'd'
  text: string;
  isCorrect: boolean;
  explanation: string; // Immediate rationale why this option is right/wrong
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  conceptKey: string; // Tag/domain e.g. 'Body Language', 'STAR Method', 'First Impression'
  hint?: string;
}

export interface ExampleContrast {
  text: string;
  analysis: string; // Explanation of strengths or fatal flaws
  spokenAudioText?: string; // Text optimized for Web Speech TTS playback
}

export interface LessonExample {
  id: string;
  scenario: string;
  badExample: ExampleContrast;
  goodExample: ExampleContrast;
  proTip?: string;
}

export interface LessonSection {
  id: string;
  title: string;
  content: string; // Markdown or structured explanation
  keyTakeaways: string[];
  checklist?: string[];
}

export type ExerciseType = 'script_builder' | 'voice_recording' | 'reflection' | 'checklist';

export interface EvaluationCriterion {
  criterion: string;
  idealTarget: string;
}

export interface PracticalExercise {
  id: string;
  title: string;
  type: ExerciseType;
  instructions: string;
  prompt: string;
  starterTemplate?: string;
  evaluationRubric: EvaluationCriterion[];
  sampleAnswer?: string;
}

export interface AcademyLesson {
  id: string;
  moduleId: string;
  number: number;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  objective: string;
  sections: LessonSection[];
  examples: LessonExample[];
  exercise: PracticalExercise;
  quiz: QuizQuestion[];
  tags: string[];
}

export interface AcademyModule {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  iconName: string; // Lucide icon name (e.g. 'Compass', 'DoorOpen', 'Sparkles', 'Users')
  category: AcademyCategory;
  lessons: AcademyLesson[];
}

// ==========================================
// User Progress & Practice Persistence Types
// ==========================================

export interface PracticeAttempt {
  id: string;
  lessonId: string;
  type: ExerciseType;
  userResponse: string;
  fillerWordCount?: number;
  durationSeconds?: number;
  selfRating?: number; // 1 to 5 stars
  createdAt: string;
}

export interface QuizAttempt {
  lessonId: string;
  score: number; // Percentage 0 - 100
  totalQuestions: number;
  passed: boolean; // >= 75%
  selectedOptions: Record<string, string>; // questionId -> optionId
  attemptedAt: string;
}

export interface LessonProgress {
  lessonId: string;
  isCompleted: boolean;
  completedAt?: string;
  quizPassed: boolean;
  bestQuizScore: number; // 0 - 100
  exerciseCompleted: boolean;
  lastAttemptAt?: string;
}

export interface UserAcademyProgress {
  userId: string;
  completedLessonIds: string[];
  lessonProgress: Record<string, LessonProgress>;
  quizAttempts: Record<string, QuizAttempt[]>;
  practiceAttempts: Record<string, PracticeAttempt[]>;
  overallPercent: number; // 0 - 100
  lastActiveLessonId: string;
  updatedAt: string;
}
