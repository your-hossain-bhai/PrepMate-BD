import { QuizQuestion, AcademicLevel } from '../types';

export interface CachedQuizAttempt {
  subject: string;
  chapter: string;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  userAnswers: { question: QuizQuestion; selectedIndex: number | null; timeSpentSec: number }[];
  timestamp: number;
  isDailyChallenge?: boolean;
}

const STORAGE_KEYS = {
  ACTIVE_ATTEMPT: 'prepmate_active_quiz_attempt',
  CACHED_QUIZZES: 'prepmate_cached_quizzes',
  OFFLINE_STUDY_PLANNER: 'prepmate_offline_planner',
};

// Default offline fallback questions for SSC/HSC when network is down
const OFFLINE_QUESTIONS_DATABASE: Record<string, QuizQuestion[]> = {
  HSC_Physics: [
    {
      id: 'off_phy_1',
      question: 'দুইটি সমমানের ভেক্টর P ও P একই বিন্দুতে ১২০° কোণে ক্রিয়া করলে তাদের লব্ধির মান কত হবে?',
      options: ['P', '2P', 'P/√2', 'P√3'],
      correctIndex: 0,
      explanation: 'লব্ধি R = √(P² + P² + 2P²cos120°) = √(2P² - P²) = √P² = P।',
    },
    {
      id: 'off_phy_2',
      question: 'একটি প্রাস ৯.৮ মি/সে বেগে ৩০° কোণে নিক্ষিপ্ত হলে তার সর্বাধিক উচ্চতা কত হবে? (g = 9.8 m/s²)',
      options: ['0.306 m', '0.612 m', '1.225 m', '2.45 m'],
      correctIndex: 0,
      explanation: 'H = (v₀² sin²θ)/(2g) = (9.8² × sin²30°)/(2 × 9.8) = (9.8 × 0.25)/2 = 0.306 m।',
    },
    {
      id: 'off_phy_3',
      question: 'পৃথিবীর কেন্দ্রে বস্তুর ওজন কত?',
      options: ['শূন্য (Zero)', 'অসীম (Infinity)', 'সর্বোচ্চ (Maximum)', '৯.৮ নিউটন'],
      correctIndex: 0,
      explanation: 'পৃথিবীর কেন্দ্রে g এর মান শূন্য (g = 0 m/s²), তাই W = mg = 0।',
    },
  ],
  HSC_Chemistry: [
    {
      id: 'off_chem_1',
      question: 'কোন নীতির ভিত্তিতে ইলেকট্রন প্রথমে নিম্ন শক্তির অরবিটালে প্রবেশ করে?',
      options: ['আউফবাউ নীতি (Aufbau Principle)', 'হুন্ডের নীতি (Hund Rule)', 'পাউলির বর্জন নীতি', 'হাইজেনবার্গের নীতি'],
      correctIndex: 0,
      explanation: 'আউফবাউ নীতি অনুযায়ী ইলেকট্রন সর্বনিম্ন শক্তির অরবিটাল আগে পূর্ণ করে।',
    },
    {
      id: 'off_chem_2',
      question: 'বেনজিনে কার্বন-কার্বন বন্ধন দৈর্ঘ্য কত?',
      options: ['0.139 nm', '0.154 nm', '0.134 nm', '0.120 nm'],
      correctIndex: 0,
      explanation: 'বেনজিনে কার্বন-কার্বন অ্যারোমেটিক সঞ্চরণশীল বন্ধন দৈর্ঘ্য হলো 0.139 nm।',
    },
  ],
  SSC_Math: [
    {
      id: 'off_ssc_m1',
      question: 'a + b = 5 এবং a - b = 3 হলে ab এর মান কত?',
      options: ['4', '8', '16', '2'],
      correctIndex: 0,
      explanation: 'ab = ((a+b)/2)² - ((a-b)/2)² = (5/2)² - (3/2)² = 25/4 - 9/4 = 16/4 = 4।',
    },
    {
      id: 'off_ssc_m2',
      question: 'একটি সমকোণী ত্রিভুজের ভূমি ৪ সেমি ও উচ্চতা ৩ সেমি হলে অতিভুজ কত সেমি?',
      options: ['5 cm', '6 cm', '7 cm', '25 cm'],
      correctIndex: 0,
      explanation: 'পিথাগোরাসের সূত্রানুসারে অতিভুজ = √(৩² + ৪²) = √(৯ + ১৬) = √২৫ = ৫ সেমি।',
    },
  ],
  HSC_ICT: [
    {
      id: 'off_ict_1',
      question: 'C ভাষায় for-loop এর কোন অংশটি প্রথম সম্পাদিত হয়?',
      options: ['ইনিশিয়্যালাইজেশন (Initialization)', 'কন্ডিশন টেস্ট (Condition)', 'ইনক্রিমেন্ট (Increment)', 'বডি কোড'],
      correctIndex: 0,
      explanation: 'for (init; condition; increment) লুপের শুরুতে ইনিশিয়্যালাইজেশন প্রথম ঘটে।',
    },
  ],
};

// Save active incomplete quiz session
export function saveActiveQuizSession(session: CachedQuizAttempt): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ATTEMPT, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save active quiz attempt to offline cache', e);
  }
}

// Get active incomplete quiz session
export function getActiveQuizSession(): CachedQuizAttempt | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_ATTEMPT);
    if (!raw) return null;
    return JSON.parse(raw) as CachedQuizAttempt;
  } catch (e) {
    return null;
  }
}

// Clear active incomplete quiz session
export function clearActiveQuizSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ATTEMPT);
  } catch (e) {}
}

// Cache last generated questions list
export function cacheQuizSet(subject: string, chapter: string, questions: QuizQuestion[]): void {
  try {
    const existingRaw = localStorage.getItem(STORAGE_KEYS.CACHED_QUIZZES);
    const existing = existingRaw ? JSON.parse(existingRaw) : {};
    const key = `${subject}_${chapter}`;
    existing[key] = {
      questions,
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.CACHED_QUIZZES, JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to cache quiz set', e);
  }
}

// Retrieve cached quiz or fallback to built-in database
export function getOfflineQuestions(academicLevel: AcademicLevel, subject: string, chapter?: string): QuizQuestion[] {
  try {
    const existingRaw = localStorage.getItem(STORAGE_KEYS.CACHED_QUIZZES);
    if (existingRaw) {
      const existing = JSON.parse(existingRaw);
      const searchKey = `${subject}_${chapter}`;
      if (existing[searchKey] && existing[searchKey].questions?.length > 0) {
        return existing[searchKey].questions;
      }
      // Search any questions for the subject
      for (const k in existing) {
        if (k.startsWith(subject) && existing[k].questions?.length > 0) {
          return existing[k].questions;
        }
      }
    }
  } catch (e) {}

  // Fallback to built-in offline questions
  const dbKey = `${academicLevel}_${subject.split(' ')[0]}`;
  if (OFFLINE_QUESTIONS_DATABASE[dbKey]) {
    return OFFLINE_QUESTIONS_DATABASE[dbKey];
  }

  // Generic fallback if key missing
  return OFFLINE_QUESTIONS_DATABASE['HSC_Physics'];
}
