import React, { useState } from 'react';
import { UserProfile, AcademicLevel, AcademicGroup, QuizQuestion } from './types';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { AuthView } from './components/AuthView';
import { QuizConfigView } from './components/QuizConfigView';
import { QuizPlayView } from './components/QuizPlayView';
import { QuizResultsView } from './components/QuizResultsView';
import { CommunityFeedView } from './components/CommunityFeedView';
import { SubscriptionView } from './components/SubscriptionView';
import { FlutterCodeExplorer } from './components/FlutterCodeExplorer';
import { LandingPageView } from './components/LandingPageView';

import {
  School,
  Zap,
  Users,
  Crown,
  Code2,
  Smartphone,
  Globe2,
  Menu,
  X,
  Play,
  Download,
} from 'lucide-react';

type AppTab = 'landing' | 'quiz' | 'community' | 'subscription' | 'profile' | 'codebase';
type QuizStep = 'config' | 'playing' | 'results';

function MainApp() {
  const { lang, setLang, t } = useLanguage();

  const [user, setUser] = useState<UserProfile>({
    uid: 'bd_student_101',
    phone: '+8801712345678',
    name: 'তানভীর হোসেন',
    academicLevel: 'HSC',
    group: 'Science',
    isPremium: false,
    dailyQuizCount: 0,
    points: 120,
    streakDays: 4,
  });

  const [activeTab, setActiveTab] = useState<AppTab>('landing');
  const [viewMode, setViewMode] = useState<'app' | 'codebase'>('app');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Quiz Engine State
  const [quizStep, setQuizStep] = useState<QuizStep>('config');
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [activeQuizSubject, setActiveQuizSubject] = useState('Physics');
  const [activeQuizChapter, setActiveQuizChapter] = useState('১ম অধ্যায়');
  const [completedAnswers, setCompletedAnswers] = useState<
    { question: QuizQuestion; selectedIndex: number | null; timeSpentSec: number }[]
  >([]);

  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updated }));
  };

  const handleStartQuiz = async (config: {
    academicLevel: AcademicLevel;
    group: AcademicGroup;
    subject: string;
    chapter: string;
    count: number;
    curriculumVersion?: string;
  }) => {
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
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, language: lang }),
      });

      const data = await res.json();
      setCurrentQuestions(data.questions || []);

      // Increment daily quiz count for free tier
      if (!user.isPremium) {
        setUser((prev) => ({ ...prev, dailyQuizCount: prev.dailyQuizCount + 1 }));
      }
    } catch (err) {
      console.error('Quiz fetch error:', err);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleCompleteQuiz = (
    userAnswers: { question: QuizQuestion; selectedIndex: number | null; timeSpentSec: number }[]
  ) => {
    setCompletedAnswers(userAnswers);
    const correctCount = userAnswers.filter(
      (ans) => ans.selectedIndex === ans.question.correctIndex
    ).length;

    // Award 10 points per correct answer
    setUser((prev) => ({ ...prev, points: prev.points + correctCount * 10 }));
    setQuizStep('results');
  };

  return (
    <div className="min-h-screen bg-[#002b24] text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-amber-400 selection:text-[#002b24]">
      {/* Background Glowing Glass Orbs */}
      <div className="fixed top-[-120px] right-[-120px] w-[600px] h-[600px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none z-0"></div>

      {/* Platform Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between relative z-10 flex-wrap gap-2">
          {/* Logo & Level Selector */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveTab('landing');
                setViewMode('app');
              }}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 bg-amber-400 text-[#002b24] rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-amber-900/30 group-hover:scale-105 transition-transform">
                P
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-white">
                    PrepMate <span className="text-amber-400">BD</span>
                  </h1>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                    🇧🇩 SSC/HSC
                  </span>
                </div>
                <p className="text-[11px] text-emerald-300/80 hidden sm:block tracking-wide">
                  {t('appTagline')}
                </p>
              </div>
            </button>
          </div>

          {/* Controls: Language Switcher, Level Switcher, Code Inspector */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Language Switcher (Bengali vs English) */}
            <div className="bg-white/10 backdrop-blur-md p-1 rounded-xl flex text-xs font-bold border border-white/15 items-center">
              <button
                onClick={() => setLang('bn')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  lang === 'bn'
                    ? 'bg-amber-400 text-[#002b24] shadow-md font-extrabold'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  lang === 'en'
                    ? 'bg-amber-400 text-[#002b24] shadow-md font-extrabold'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                English
              </button>
            </div>

            {/* Academic Level Toggle */}
            <div className="bg-white/10 backdrop-blur-md p-1 rounded-xl flex text-xs font-bold border border-white/15">
              <button
                onClick={() => handleUpdateUser({ academicLevel: 'SSC' })}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  user.academicLevel === 'SSC'
                    ? 'bg-amber-400 text-[#002b24] shadow-md font-extrabold'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                SSC
              </button>
              <button
                onClick={() => handleUpdateUser({ academicLevel: 'HSC' })}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  user.academicLevel === 'HSC'
                    ? 'bg-amber-400 text-[#002b24] shadow-md font-extrabold'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                HSC
              </button>
            </div>

            {/* View Mode Toggle: App vs Flutter Codebase */}
            <button
              onClick={() => {
                setViewMode(viewMode === 'app' ? 'codebase' : 'app');
                if (viewMode === 'app') setActiveTab('codebase');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all shadow-md ${
                viewMode === 'codebase'
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'bg-white/10 text-amber-300 border-white/20 hover:bg-white/20'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span className="hidden sm:inline">
                {viewMode === 'codebase' ? t('appViewBtn') : t('flutterCodeTab')}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6 space-y-5 relative z-10">
        {/* Navigation Tabs Bar (if in App View Mode) */}
        {viewMode === 'app' && (
          <div className="bg-white/10 backdrop-blur-2xl p-2 rounded-2xl shadow-xl border border-white/20 flex items-center justify-start sm:justify-around overflow-x-auto gap-1 no-scrollbar">
            {/* Website / Landing Page Tab */}
            <button
              onClick={() => setActiveTab('landing')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'landing'
                  ? 'bg-amber-400 text-[#002b24] font-extrabold shadow-lg shadow-amber-900/40'
                  : 'text-emerald-200/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Globe2 className="w-4 h-4 text-[#002b24]" />
              <span>{t('landingPageTab')}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('quiz');
                setQuizStep('config');
              }}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'quiz'
                  ? 'bg-emerald-500 text-white shadow-[0_4px_20px_rgba(16,185,129,0.4)]'
                  : 'text-emerald-200/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>{t('aiQuizTab')}</span>
            </button>

            <button
              onClick={() => setActiveTab('community')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'community'
                  ? 'bg-emerald-500 text-white shadow-[0_4px_20px_rgba(16,185,129,0.4)]'
                  : 'text-emerald-200/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-300" />
              <span>{t('communityTab')}</span>
            </button>

            <button
              onClick={() => setActiveTab('subscription')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'subscription'
                  ? 'bg-amber-400 text-[#002b24] font-extrabold shadow-lg shadow-amber-900/40'
                  : 'text-emerald-200/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>{t('premiumTab')}</span>
              {user.isPremium ? (
                <span className="bg-emerald-500 text-[#002b24] text-[9px] px-1.5 py-0.2 rounded font-bold font-mono">
                  ACTIVE
                </span>
              ) : (
                <span className="bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[9px] px-1.5 py-0.2 rounded font-mono">
                  2.00 BDT/day
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'profile'
                  ? 'bg-emerald-500 text-white shadow-[0_4px_20px_rgba(16,185,129,0.4)]'
                  : 'text-emerald-200/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-300" />
              <span>{t('profileTab')}</span>
            </button>
          </div>
        )}

        {/* View Mode: Flutter Code Architecture Explorer */}
        {viewMode === 'codebase' ? (
          <FlutterCodeExplorer />
        ) : (
          /* View Mode: App Simulator */
          <div className="space-y-4">
            {/* TAB 0: Landing Page / Website */}
            {activeTab === 'landing' && (
              <LandingPageView
                user={user}
                onOpenWebApp={() => {
                  setActiveTab('quiz');
                  setQuizStep('config');
                }}
                onOpenSubscription={() => setActiveTab('subscription')}
                onOpenFlutterCode={() => {
                  setViewMode('codebase');
                  setActiveTab('codebase');
                }}
              />
            )}
            {/* TAB 1: AI Quiz Engine */}
            {activeTab === 'quiz' && (
              <>
                {quizStep === 'config' && (
                  <QuizConfigView
                    user={user}
                    onStartQuiz={handleStartQuiz}
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
                    onRestartQuiz={() => setQuizStep('config')}
                    onOpenCommunity={() => setActiveTab('community')}
                  />
                )}
              </>
            )}

            {/* TAB 2: Community Feed */}
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
        )}
      </main>

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
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
