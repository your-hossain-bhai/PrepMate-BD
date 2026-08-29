import React, { useState, useEffect } from 'react';
import { UserProfile, AcademicLevel, AcademicGroup, QuizQuestion, QuizHistoryRecord } from './types';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { ThemeProvider, useTheme } from './ThemeContext';
import { AuthView } from './components/AuthView';
import { QuizConfigView } from './components/QuizConfigView';
import { QuizPlayView } from './components/QuizPlayView';
import { QuizResultsView } from './components/QuizResultsView';
import { CommunityFeedView } from './components/CommunityFeedView';
import { SubscriptionView } from './components/SubscriptionView';
import { StudyPlannerView } from './components/StudyPlannerView';
import { StudyBotView } from './components/StudyBotView';
import { StudyReminderModal } from './components/StudyReminderModal';
import { InstallPromptModal } from './components/InstallPromptModal';
import { AuthModal } from './components/AuthModal';
import { playReminderChime } from './utils/notificationAudio';
import {
  auth,
  onAuthStateChanged,
  getRedirectResult,
  isFirebaseConfigured,
  saveQuizResultToFirestore,
  syncStudentToFirestore,
} from './firebase';
import {
  cacheQuizSet,
  getOfflineQuestions,
  saveActiveQuizSession,
  getActiveQuizSession,
  clearActiveQuizSession,
} from './utils/offlineCache';

import {
  School,
  Zap,
  Users,
  Crown,
  Smartphone,
  Sun,
  Moon,
  Calendar,
  Bot,
  Bell,
  BellRing,
  WifiOff,
  Database,
  RefreshCw,
  User,
  LogIn,
} from 'lucide-react';

type AppTab = 'quiz' | 'bot' | 'planner' | 'community' | 'subscription' | 'profile';
type QuizStep = 'config' | 'playing' | 'results';

function MainApp() {
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('prepmate_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      uid: 'bd_student_101',
      phone: '+8801812345678',
      name: 'তানভীর হোসেন',
      academicLevel: 'HSC',
      group: 'Science',
      isPremium: false,
      dailyQuizCount: 0,
      points: 120,
      streakDays: 4,
      quizHistory: [
        {
          id: 'qh_1',
          subject: 'Physics',
          chapter: '১ম অধ্যায় - ভৌত রাশি ও পরিমাপ',
          score: 5,
          totalQuestions: 5,
          percentage: 100,
          timestamp: 'আজ, ১০:১৫ AM',
          academicLevel: 'HSC',
        },
        {
          id: 'qh_2',
          subject: 'Higher Math',
          chapter: '৩য় অধ্যায় - ম্যাট্রিক্স ও নির্ণায়ক',
          score: 4,
          totalQuestions: 5,
          percentage: 80,
          timestamp: 'গতকাল, ০৮:৪৫ PM',
          academicLevel: 'HSC',
        },
        {
          id: 'qh_3',
          subject: 'Chemistry',
          chapter: '২য় অধ্যায় - পরমাণুর গঠন',
          score: 3,
          totalQuestions: 5,
          percentage: 60,
          timestamp: '০৯ আগস্ট, ০৪:২০ PM',
          academicLevel: 'HSC',
        },
        {
          id: 'qh_4',
          subject: 'Biology',
          chapter: '১ম অধ্যায় - কোষ ও এর গঠন',
          score: 4,
          totalQuestions: 5,
          percentage: 80,
          timestamp: '০৭ আগস্ট, ১১:১০ AM',
          academicLevel: 'HSC',
        },
      ],
    };
  });

  // Sync Firebase Auth state if configured
  useEffect(() => {
    if (isFirebaseConfigured() && auth) {
      // Handle redirect sign-in result (PWA/Mobile)
      getRedirectResult(auth).then((result) => {
        if (result && result.user) {
          const fbUser = result.user;
          syncStudentToFirestore(fbUser.uid, {
            uid: fbUser.uid,
            name: fbUser.displayName || 'Google Student',
            email: fbUser.email || undefined,
            avatarUrl: fbUser.photoURL || undefined,
            authProvider: 'google',
          });
        }
      }).catch((error) => {
        console.error('Redirect sign-in error:', error);
      });

      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser((prev) => {
            const updated: UserProfile = {
              ...prev,
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || prev.name || 'Student',
              email: firebaseUser.email || prev.email,
              avatarUrl: firebaseUser.photoURL || prev.avatarUrl,
              authProvider: firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email',
            };
            localStorage.setItem('prepmate_auth_user', JSON.stringify(updated));
            return updated;
          });
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const [activeTab, setActiveTab] = useState<AppTab>('quiz');
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isOfflineLoaded, setIsOfflineLoaded] = useState<boolean>(false);
  const [resumableSession, setResumableSession] = useState<any | null>(null);

  // Monitor Network Online/Offline Status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for resumable quiz session in local cache
    const savedSession = getActiveQuizSession();
    if (savedSession && savedSession.questions?.length > 0) {
      setResumableSession(savedSession);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Daily Study Reminder background monitor loop
  React.useEffect(() => {
    const interval = setInterval(() => {
      const enabledSaved = localStorage.getItem('prepmate_reminder_enabled');
      const reminderEnabled = enabledSaved !== null ? JSON.parse(enabledSaved) : user.reminderEnabled ?? true;
      const reminderTime = localStorage.getItem('prepmate_reminder_time') || user.reminderTime || '20:00';

      if (!reminderEnabled) return;

      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayDateStr = now.toDateString();
      const lastTriggeredDate = localStorage.getItem('prepmate_last_reminder_triggered');

      if (currentHHMM === reminderTime && lastTriggeredDate !== todayDateStr) {
        localStorage.setItem('prepmate_last_reminder_triggered', todayDateStr);
        playReminderChime();

        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(
              lang === 'en'
                ? `🔥 Daily Board Exam Challenge Ready (${user.academicLevel})!`
                : `🔥 আপনার ${user.academicLevel} পরীক্ষা প্রস্তুতি কুইজ চ্যালেঞ্জ প্রস্তুত!`,
              {
                body:
                  lang === 'en'
                    ? `Don't break your ${user.streakDays}-day streak! Return to PrepMate BD now to complete today's practice.`
                    : `আপনার ${user.streakDays} দিনের স্টাডি স্ট্রিক বজায় রাখতে আজই প্রেপমেট বিডিতে কুইজ সম্পন্ন করুন! 📚🎯`,
                icon: '/icon.png',
                tag: 'prepmate-scheduled-daily-reminder',
              }
            );
          } catch (e) {
            console.debug('Notification trigger failed in browser:', e);
          }
        }
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [user.reminderEnabled, user.reminderTime, user.streakDays, user.academicLevel, lang]);

  // Quiz Engine State
  const [quizStep, setQuizStep] = useState<QuizStep>('config');
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [activeQuizSubject, setActiveQuizSubject] = useState('Physics');
  const [activeQuizChapter, setActiveQuizChapter] = useState('১ম অধ্যায়');
  const [isDailyChallengeMode, setIsDailyChallengeMode] = useState(false);
  const [lastEarnedBonusXp, setLastEarnedBonusXp] = useState(0);
  const [completedAnswers, setCompletedAnswers] = useState<
    { question: QuizQuestion; selectedIndex: number | null; timeSpentSec: number }[]
  >([]);

  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updated }));
  };

  const handleResumeSavedQuiz = () => {
    if (!resumableSession) return;
    setActiveQuizSubject(resumableSession.subject);
    setActiveQuizChapter(resumableSession.chapter);
    setCurrentQuestions(resumableSession.questions);
    setIsDailyChallengeMode(!!resumableSession.isDailyChallenge);
    setIsOfflineLoaded(true);
    setQuizStep('playing');
    setResumableSession(null);
  };

  const handleStartDailyChallenge = async () => {
    setIsDailyChallengeMode(true);
    setLastEarnedBonusXp(0);
    setIsOfflineLoaded(false);
    const sub = lang === 'en' ? 'Daily Board Challenge' : 'আজকের ডেইলি চ্যালেঞ্জ';
    const chap = lang === 'en' ? 'Physics: Vectors & Newtonian Mechanics' : 'পদার্থবিজ্ঞান: ভেক্টর ও গতিবিদ্যা';
    setActiveQuizSubject(sub);
    setActiveQuizChapter(chap);
    setQuizStep('playing');
    setQuizLoading(true);

    try {
      let questions: QuizQuestion[] = [];
      if (navigator.onLine) {
        const res = await fetch('/api/quiz/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            academicLevel: user.academicLevel,
            group: user.group,
            subject: user.academicLevel === 'HSC' ? 'Physics 1st Paper' : 'Physics',
            chapter: lang === 'en' ? 'Daily Curated High-Yield Challenge Question' : 'বোর্ড পরীক্ষার আজকের বিশেষ কিউরেটেড প্রশ্ন',
            count: 1,
            curriculumVersion: lang === 'en' ? 'English' : 'Bangla',
            language: lang,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          questions = data.questions || [];
          if (questions.length > 0) {
            cacheQuizSet(sub, chap, questions);
          }
        }
      }

      if (!questions || questions.length === 0) {
        questions = getOfflineQuestions(user.academicLevel, 'Physics', 'Daily Challenge');
        setIsOfflineLoaded(true);
      }

      setCurrentQuestions(questions);
      saveActiveQuizSession({
        subject: sub,
        chapter: chap,
        questions,
        currentQuestionIndex: 0,
        userAnswers: [],
        timestamp: Date.now(),
        isDailyChallenge: true,
      });
    } catch (err) {
      console.error('Daily Challenge fetch error, using offline cache:', err);
      const offlineQ = getOfflineQuestions(user.academicLevel, 'Physics', 'Daily Challenge');
      setCurrentQuestions(offlineQ);
      setIsOfflineLoaded(true);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleStartQuiz = async (config: {
    academicLevel: AcademicLevel;
    group: AcademicGroup;
    subject: string;
    chapter: string;
    count: number;
    curriculumVersion?: string;
  }) => {
    setIsDailyChallengeMode(false);
    setLastEarnedBonusXp(0);
    setIsOfflineLoaded(false);

    // Check daily free limit for free tier
    if (!user.isPremium && user.dailyQuizCount >= 1) {
      setActiveTab('subscription');
      return;
    }

    setActiveQuizSubject(config.subject);
    setActiveQuizChapter(config.chapter);
    setQuizStep('playing');
    setQuizLoading(true);

    try {
      let questions: QuizQuestion[] = [];
      if (navigator.onLine) {
        const res = await fetch('/api/quiz/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...config, language: lang }),
        });

        if (res.ok) {
          const data = await res.json();
          questions = data.questions || [];
          if (questions.length > 0) {
            cacheQuizSet(config.subject, config.chapter, questions);
          }
        }
      }

      if (!questions || questions.length === 0) {
        questions = getOfflineQuestions(config.academicLevel, config.subject, config.chapter);
        setIsOfflineLoaded(true);
      }

      setCurrentQuestions(questions);
      saveActiveQuizSession({
        subject: config.subject,
        chapter: config.chapter,
        questions,
        currentQuestionIndex: 0,
        userAnswers: [],
        timestamp: Date.now(),
        isDailyChallenge: false,
      });

      // Increment daily quiz count for free tier
      if (!user.isPremium) {
        setUser((prev) => ({ ...prev, dailyQuizCount: prev.dailyQuizCount + 1 }));
      }
    } catch (err) {
      console.error('Quiz fetch error, falling back to offline cache:', err);
      const offlineQ = getOfflineQuestions(config.academicLevel, config.subject, config.chapter);
      setCurrentQuestions(offlineQ);
      setIsOfflineLoaded(true);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleCompleteQuiz = (
    userAnswers: { question: QuizQuestion; selectedIndex: number | null; timeSpentSec: number }[]
  ) => {
    clearActiveQuizSession();
    setCompletedAnswers(userAnswers);
    const correctCount = userAnswers.filter(
      (ans) => ans.selectedIndex === ans.question.correctIndex
    ).length;
    const totalCount = userAnswers.length;
    const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

    const todayString = new Date().toDateString();
    let bonusXp = 0;
    if (isDailyChallengeMode && correctCount > 0) {
      bonusXp = 50;
    }
    setLastEarnedBonusXp(bonusXp);

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newRecord: QuizHistoryRecord = {
      id: 'qh_' + Date.now(),
      subject: activeQuizSubject,
      chapter: activeQuizChapter,
      score: correctCount,
      totalQuestions: totalCount,
      percentage: percentage,
      timestamp: `আজ, ${timeString}`,
      academicLevel: user.academicLevel,
    };

    // Award 10 points per correct answer + 50 bonus XP if daily challenge solved correctly
    setUser((prev) => {
      const updatedUser = {
        ...prev,
        points: prev.points + correctCount * 10 + bonusXp,
        lastDailyChallengeDate: isDailyChallengeMode ? todayString : prev.lastDailyChallengeDate,
        quizHistory: [newRecord, ...(prev.quizHistory || [])],
      };

      // Persist to localStorage
      localStorage.setItem('prepmate_auth_user', JSON.stringify(updatedUser));

      // Persist to Cloud Firestore database
      if (prev.uid) {
        syncStudentToFirestore(prev.uid, updatedUser);
        saveQuizResultToFirestore(prev.uid, {
          subject: newRecord.subject,
          chapter: newRecord.chapter,
          score: newRecord.score,
          totalQuestions: newRecord.totalQuestions,
          percentage: newRecord.percentage,
          academicLevel: newRecord.academicLevel,
          group: prev.group,
        });
      }

      return updatedUser;
    });
    setQuizStep('results');
  };

  return (
    <div className="min-h-screen bg-[#002b24] text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-amber-400 selection:text-[#002b24] app-container">
      {/* Background Glowing Glass Orbs */}
      <div className="fixed top-[-120px] right-[-120px] w-[600px] h-[600px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none z-0"></div>

      {/* Platform Header */}
      <header className="bg-[#00231d]/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 shadow-lg app-header">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          {/* Logo & Title */}
          <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto">
            <button
              onClick={() => {
                setActiveTab('quiz');
                setQuizStep('config');
              }}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-105 transition-transform overflow-hidden p-1">
                <img src="/logo.png" alt="PrepMate BD Logo" className="w-full h-full object-contain" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-white">
                    PrepMate <span className="text-amber-400">BD</span>
                  </h1>
                </div>
                <p className="text-[11px] text-emerald-300/80 hidden sm:block tracking-wide">
                  {t('appTagline')}
                </p>
              </div>
            </button>
          </div>

            {/* Controls: Language Switcher, Install, Reminder & Academic Level Toggle */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-start sm:justify-end w-full sm:w-auto mb-3 sm:mb-0">
            {/* Install on Mobile App Button */}
            <button
              onClick={() => setIsInstallModalOpen(true)}
              title={lang === 'en' ? 'Install App on Phone' : 'মোবাইলে ইনস্টল করুন'}
              className="bg-emerald-500 hover:bg-emerald-400 text-[#002b24] px-4 py-2 rounded-2xl transition-all flex items-center gap-2 text-sm font-extrabold shadow-md shadow-emerald-950/30 active:scale-95"
            >
              <Smartphone className="w-4 h-4" />
              <span>{lang === 'en' ? 'Install' : 'ইনস্টল'}</span>
            </button>

            {/* Daily Study Reminder Trigger */}
            <button
              onClick={() => setIsReminderModalOpen(true)}
              title={lang === 'en' ? 'Daily Study Reminders' : 'ডেইলি রিমাইন্ডার সেট করুন'}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 transition-all flex items-center gap-2 text-sm font-bold text-amber-300 shadow-sm relative active:scale-95"
            >
              <BellRing className="w-4 h-4 text-amber-300" />
              <span>
                {lang === 'en' ? 'Reminder' : 'রিমাইন্ডার'}
              </span>
              <span className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
            </button>

            {/* Language Switcher (Bengali vs English) */}
            <div className="bg-black/30 backdrop-blur-md p-1.5 rounded-2xl flex text-sm font-bold border border-white/15 items-center gap-1">
              <button
                onClick={() => setLang('bn')}
                className={`px-4 py-1.5 rounded-xl transition-all flex items-center gap-2 ${
                  lang === 'bn'
                    ? 'bg-amber-400 text-[#002b24] shadow-md font-extrabold'
                    : 'text-emerald-200/80 hover:text-white'
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-4 py-1.5 rounded-xl transition-all flex items-center gap-2 ${
                  lang === 'en'
                    ? 'bg-amber-400 text-[#002b24] shadow-md font-extrabold'
                    : 'text-emerald-200/80 hover:text-white'
                }`}
              >
                English
              </button>
            </div>

            {/* Academic Level Toggle */}
            <div className="bg-black/30 backdrop-blur-md p-1.5 rounded-2xl flex text-sm font-bold border border-white/15 items-center gap-1">
              <button
                onClick={() => handleUpdateUser({ academicLevel: 'SSC' })}
                className={`px-4 py-1.5 rounded-xl transition-all ${
                  user.academicLevel === 'SSC'
                    ? 'bg-amber-400 text-[#002b24] shadow-md font-extrabold'
                    : 'text-emerald-200/80 hover:text-white'
                }`}
              >
                SSC
              </button>
              <button
                onClick={() => handleUpdateUser({ academicLevel: 'HSC' })}
                className={`px-4 py-1.5 rounded-xl transition-all ${
                  user.academicLevel === 'HSC'
                    ? 'bg-amber-400 text-[#002b24] shadow-md font-extrabold'
                    : 'text-emerald-200/80 hover:text-white'
                }`}
              >
                HSC
              </button>
            </div>
            {/* Student Account / Login Chip */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              title={lang === 'en' ? 'Student Account / Login' : 'শিক্ষার্থী অ্যাকাউন্ট / লগইন'}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 transition-all flex items-center gap-2 text-sm font-bold shadow-sm active:scale-95 text-emerald-200 hover:text-white"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-5 h-5 rounded-full object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-4 h-4 text-amber-400" />
              )}
              <span className="max-w-[90px] sm:max-w-[120px] truncate text-white">
                {user.authProvider && user.authProvider !== 'guest'
                  ? user.name
                  : lang === 'en'
                  ? 'Sign In'
                  : 'লগইন'}
              </span>
              {user.points > 0 && (
                <span className="bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold hidden sm:inline">
                  {user.points} XP
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6 space-y-5 relative z-10">
        {/* Offline Connection Alert Banner */}
        {!isOnline && (
          <div className="p-3.5 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-400/40 rounded-2xl flex items-center justify-between gap-3 text-white text-xs backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/30 text-amber-300 rounded-xl shrink-0">
                <WifiOff className="w-4 h-4" />
              </div>
              <div>
                <p className="font-black text-amber-300">
                  {lang === 'en' ? 'Weak/Offline Internet Connection' : 'দুর্বল বা ইন্টারনেট সংযোগ বিচ্ছিন্ন!'}
                </p>
                <p className="text-emerald-100/80 text-[11px] mt-0.5">
                  {lang === 'en'
                    ? 'No worries! Your last attempted quiz sets, offline planner, and questions are cached locally for practice.'
                    : 'চিন্তার কারণ নেই! অফলাইন মেমোরি ক্যাশ থেকে পূর্বের কুইজ ও পড়ালেখার প্ল্যানার সচল রয়েছে।'}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-amber-400 text-[#002b24] font-black rounded-xl text-[10px] shrink-0 uppercase tracking-widest">
              {lang === 'en' ? 'Offline Cache Active' : 'অফলাইন মোড'}
            </span>
          </div>
        )}

        {/* Resumable Session Banner */}
        {resumableSession && (
          <div className="p-4 bg-gradient-to-r from-[#00382d] via-[#002b24] to-[#00332a] border border-amber-400/40 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-[#002b24] flex items-center justify-center font-black shrink-0 shadow-md">
                <Database className="w-5 h-5 text-[#002b24]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-300 uppercase tracking-wider">
                  <span>{lang === 'en' ? 'Unsaved Quiz Attempt Found' : 'পূর্বের অসম্পূর্ণ কুইজ সেশন পাওয়া গেছে'}</span>
                </div>
                <h4 className="text-xs font-black text-white">
                  {resumableSession.subject} • {resumableSession.chapter}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={handleResumeSavedQuiz}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-[#002b24] font-black text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Resume Attempt' : 'চালিয়ে যান (Resume)'}</span>
              </button>
              <button
                onClick={() => {
                  clearActiveQuizSession();
                  setResumableSession(null);
                }}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all"
              >
                {lang === 'en' ? 'Dismiss' : 'মুছে ফেলুন'}
              </button>
            </div>
          </div>
        )}

        {/* Offline Loaded Cache Indicator (During Playing) */}
        {isOfflineLoaded && quizStep === 'playing' && (
          <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/30 rounded-xl flex items-center justify-between gap-2 text-emerald-200 text-xs">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">
                {lang === 'en'
                  ? 'Loaded from PrepMate Local Offline Practice Vault'
                  : 'প্রেপমেট অফলাইন কুইজ ভল্ট থেকে প্রশ্নসমূহ লোড করা হয়েছে'}
              </span>
            </div>
            <span className="text-[10px] bg-emerald-400 text-[#002b24] font-black px-2 py-0.5 rounded-full">
              OFFLINE READY
            </span>
          </div>
        )}
        {/* Pure Student App Navigation Bar */}
        <div className="bg-white/10 backdrop-blur-2xl p-2 rounded-2xl shadow-xl border border-white/20 flex items-center justify-around overflow-x-auto gap-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden app-nav">
          <button
            onClick={() => {
              setActiveTab('quiz');
              setQuizStep('config');
            }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'quiz'
                ? 'bg-emerald-500 text-white shadow-[0_4px_20px_rgba(16,185,129,0.4)] active-tab'
                : 'text-emerald-200/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Zap className="w-5 h-5 sm:w-4 sm:h-4 text-amber-300" />
            <span>{t('aiQuizTab')}</span>
          </button>

          <button
            onClick={() => setActiveTab('bot')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'bot'
                ? 'bg-amber-400 text-[#002b24] font-extrabold shadow-lg shadow-amber-900/40 active-tab'
                : 'text-emerald-200/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Bot className="w-5 h-5 sm:w-4 sm:h-4 text-amber-300" />
            <span>{t('studyBotTab')}</span>
          </button>

          <button
            onClick={() => setActiveTab('planner')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'planner'
                ? 'bg-emerald-500 text-white shadow-[0_4px_20px_rgba(16,185,129,0.4)] active-tab'
                : 'text-emerald-200/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Calendar className="w-5 h-5 sm:w-4 sm:h-4 text-amber-300" />
            <span>{t('plannerTab')}</span>
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'community'
                ? 'bg-emerald-500 text-white shadow-[0_4px_20px_rgba(16,185,129,0.4)] active-tab'
                : 'text-emerald-200/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5 sm:w-4 sm:h-4 text-emerald-300" />
            <span>{t('communityTab')}</span>
          </button>

          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'subscription'
                ? 'bg-amber-400 text-[#002b24] font-extrabold shadow-lg shadow-amber-900/40 active-tab'
                : 'text-emerald-200/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2">
              <Crown className="w-5 h-5 sm:w-4 sm:h-4 text-amber-400" />
              <span>{t('premiumTab')}</span>
            </div>
            {user.isPremium ? (
              <span className="bg-emerald-500 text-[#002b24] text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded font-bold font-mono">
                ACTIVE
              </span>
            ) : (
              <span className="bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded font-mono mt-1 sm:mt-0">
                2.00 BDT/day
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'profile'
                ? 'bg-emerald-500 text-white shadow-[0_4px_20px_rgba(16,185,129,0.4)] active-tab'
                : 'text-emerald-200/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Smartphone className="w-5 h-5 sm:w-4 sm:h-4 text-emerald-300" />
            <span>{t('profileTab')}</span>
          </button>
        </div>

        {/* Student App Views */}
        <div className="space-y-4">
          {/* TAB 1: AI Quiz Engine */}
          {activeTab === 'quiz' && (
            <>
              {quizStep === 'config' && (
                <QuizConfigView
                  user={user}
                  onStartQuiz={handleStartQuiz}
                  onStartDailyChallenge={handleStartDailyChallenge}
                  onOpenSubscription={() => setActiveTab('subscription')}
                />
              )}

              {quizStep === 'playing' && (
                <QuizPlayView
                  questions={currentQuestions}
                  isLoading={quizLoading}
                  subject={activeQuizSubject}
                  chapter={activeQuizChapter}
                  onCompleteQuiz={handleCompleteQuiz}
                />
              )}

              {quizStep === 'results' && (
                <QuizResultsView
                  user={user}
                  subject={activeQuizSubject}
                  chapter={activeQuizChapter}
                  userAnswers={completedAnswers}
                  earnedBonusXp={lastEarnedBonusXp}
                  onRestartQuiz={() => setQuizStep('config')}
                  onOpenCommunity={() => setActiveTab('community')}
                />
              )}
            </>
          )}

          {/* TAB 2: AI Study Bot */}
          {activeTab === 'bot' && <StudyBotView user={user} onUpdateUser={handleUpdateUser} />}

          {/* TAB 3: Study Planner */}
          {activeTab === 'planner' && (
            <StudyPlannerView user={user} onUpdateUser={handleUpdateUser} />
          )}

          {/* TAB 3: Community Feed */}
          {activeTab === 'community' && <CommunityFeedView user={user} />}

          {/* TAB 3: Subscription & bdapps Carrier Billing */}
          {activeTab === 'subscription' && (
            <SubscriptionView user={user} onUpdateUser={handleUpdateUser} />
          )}

          {/* TAB 4: Profile & Auth View */}
          {activeTab === 'profile' && (
            <AuthView
              user={user}
              onUpdateUser={handleUpdateUser}
              onLoginComplete={() => setActiveTab('quiz')}
            />
          )}
        </div>
      </main>

      {/* Daily Study Reminder Settings Modal */}
      <StudyReminderModal
        user={user}
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        onUpdateUser={handleUpdateUser}
      />

      {/* Install on Mobile Modal */}
      <InstallPromptModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Student Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={user}
        onUpdateUser={handleUpdateUser}
      />

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-md text-emerald-300/60 text-xs py-4 px-6 border-t border-white/10 text-center space-y-1 relative z-10 mt-auto">
        <p className="flex items-center justify-center gap-1.5 font-bold text-emerald-200 text-sm">
          <School className="w-4 h-4 text-amber-400" /> PrepMate BD
        </p>
        <p className="text-xs text-emerald-200/80 font-medium">
          {t('appTagline')}
        </p>
        <p className="text-[11px] text-emerald-400/60 font-mono tracking-wide">
          Aligned with NCTB & Cambridge Curriculums • Made for Bangladesh 🇧🇩
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <MainApp />
      </LanguageProvider>
    </ThemeProvider>
  );
}
