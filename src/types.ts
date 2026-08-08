export type AcademicLevel = 'SSC' | 'HSC';
export type AcademicGroup = 'Science' | 'Commerce' | 'Humanities';

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
