export type AcademicLevel = 'SSC' | 'HSC';
export type AcademicGroup = 'Science' | 'Commerce' | 'Humanities';

export interface QuizHistoryRecord {
  id: string;
  subject: string;
  chapter: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timestamp: string;
  academicLevel: AcademicLevel;
}

export interface StudySlot {
  id: string; // e.g., 'sat-morning'
  day: string; // 'Sat', 'Sun', etc.
  timeSlot: string; // 'Morning (8-10 AM)', etc.
  subject: string;
  topic?: string;
  completed?: boolean;
}

export interface UserProfile {
  uid: string;
  phone: string;
  name: string;
  academicLevel: AcademicLevel;
  group: AcademicGroup;
  isPremium: boolean;
  dailyQuizCount: number;
  points: number;
  streakDays: number;
  lastDailyChallengeDate?: string;
  quizHistory?: QuizHistoryRecord[];
  reminderEnabled?: boolean;
  reminderTime?: string; // e.g., '20:00'
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CommentItem {
  id: string;
  author: string;
  text: string;
  isAiTutor?: boolean;
  timestamp: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  level: AcademicLevel;
  subject: string;
  questionText: string;
  timestamp: string;
  upvotes: number;
  userUpvoted?: boolean;
  comments: CommentItem[];
}
