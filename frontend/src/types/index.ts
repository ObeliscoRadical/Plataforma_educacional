export type UserRole = 'STUDENT' | 'ADMIN' | 'MENTOR';
export type SubscriptionStatus = 'PENDING_PAYMENT' | 'ACTIVE' | 'TRIAL' | 'CANCELED';

export interface User {
  id: string;
  email: string;
  name: string;
  handle: string;
  role: UserRole;
  avatar?: string;
  subscription_status?: SubscriptionStatus;
  plan_id?: string;
}

export type SkillStatus = 'NOT_LEARNED' | 'FRAGILE' | 'ASSISTED' | 'MASTERED';
export type ProgressStatus = 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'NEEDS_REVIEW' | 'COMPLETED';

export interface Skill {
  skill_id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  status: SkillStatus;
  knowledge_score: number;
  implementation_score: number;
  problem_solving_score: number;
  debugging_score: number;
  autonomy_score: number;
  composite_score: number;
  updated_at?: string;
}

export interface LessonSummary {
  id: string;
  module_id: string;
  order_index: number;
  code: string;
  title: string;
  slug: string;
  duration_min: number;
  difficulty: string;
  is_checkpoint: number;
  progress_status?: ProgressStatus;
  video_watched?: number;
  exercise_completed?: number;
  quiz_passed?: number;
}

export interface Module {
  id: string;
  course_id: string;
  order_index: number;
  code: string;
  title: string;
  slug: string;
  summary: string;
  icon: string;
  status: ProgressStatus;
  total_lessons?: number;
  completed_lessons?: number;
  progressPercent?: number;
  lessons?: LessonSummary[];
  challenge?: any;
  project?: any;
}

export interface LessonDetail extends LessonSummary {
  module_code: string;
  module_title: string;
  content: {
    objective: string;
    prerequisites: string[];
    competences: string[];
    content_markdown: string;
    guided_practice_markdown?: string;
    expected_output?: string;
    commented_solution?: string;
    resources: { title: string; url: string }[];
  } | null;
  video: {
    title: string;
    duration_seconds: number;
    video_url: string;
    thumbnail_url: string;
    transcript: { scene: number; title: string; narration: string }[];
    status: string;
  } | null;
  exercise: {
    id: string;
    title: string;
    description: string;
    initial_code: string;
    solution_code: string;
    testCases: { name: string; assertion: string; input?: string; expected?: string }[];
    difficulty: string;
  } | null;
  quiz: {
    id: string;
    title: string;
    passing_score: number;
    questions: {
      id: string;
      prompt: string;
      explanation: string;
      difficulty_level: number;
      answers: { id: string; text: string; explanation: string; is_correct?: number }[];
    }[];
  } | null;
  progress: {
    status: ProgressStatus;
    video_watched: number;
    exercise_completed: number;
    quiz_passed: number;
  };
}

export interface MentorFeedback {
  id: string;
  sessionId: string;
  message: string;
  sender: 'USER' | 'MENTOR_AI';
  hintLevel: number;
  code_snippet?: string;
  suggestedCode?: string;
  analysis?: any;
  created_at?: string;
  timestamp?: string;
}

export interface RemedialLesson {
  id: string;
  user_id: string;
  skill_id: string;
  skill_name: string;
  skill_code: string;
  title: string;
  reason: string;
  content_markdown: string;
  microExercise: {
    title: string;
    description: string;
    initialCode: string;
    solutionCode: string;
    testCases: { name: string; assertion: string }[];
  };
  status: 'PENDING' | 'COMPLETED';
  created_at: string;
}

export interface ProjectItem {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  tier: number;
  rubric: { criterion: string; weight: number; description: string }[];
  template_repo_url: string;
  required_skills: string[];
  module_title: string;
  module_code: string;
  submission?: {
    id: string;
    repository_url: string;
    deploy_url: string;
    grade: number;
    status: 'SUBMITTED' | 'UNDER_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED';
    mentorReview?: any;
  };
}

export interface FinalExamStatus {
  id: string;
  user_id: string;
  stage1_knowledge_score: number;
  stage2_debugging_score: number;
  stage3_feature_score: number;
  stage4_defense_score: number;
  overall_grade: number;
  status: 'IN_PROGRESS' | 'PASSED' | 'FAILED';
}
