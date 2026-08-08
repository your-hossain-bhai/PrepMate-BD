import React, { useState } from 'react';
import { QuizQuestion, UserProfile } from '../types';
import { useLanguage } from '../LanguageContext';
import { Award, CheckCircle2, XCircle, RotateCcw, Bot, Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

interface QuizResultsViewProps {
  user: UserProfile;
  subject: string;
  chapter: string;
  userAnswers: { question: QuizQuestion; selectedIndex: number | null; timeSpentSec: number }[];
  onRestartQuiz: () => void;
  onOpenCommunity: () => void;
}

export const QuizResultsView: React.FC<QuizResultsViewProps> = ({
  user,
  subject,
  chapter,
  userAnswers,
  onRestartQuiz,
  onOpenCommunity,
}) => {
  const { lang, t } = useLanguage();
  const [expandedAiExplanation, setExpandedAiExplanation] = useState<Record<string, string>>({});
  const [loadingAiId, setLoadingAiId] = useState<string | null>(null);

  const totalQuestions = userAnswers.length;
  const correctCount = userAnswers.filter(
    (ans) => ans.selectedIndex === ans.question.correctIndex
  ).length;
  const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const handleAskAiTutor = async (q: QuizQuestion, selectedIndex: number | null) => {
    if (expandedAiExplanation[q.id]) {
      // Toggle off
      const updated = { ...expandedAiExplanation };
      delete updated[q.id];
      setExpandedAiExplanation(updated);
      return;
    }

    setLoadingAiId(q.id);
    try {
      const selectedText = selectedIndex !== null ? q.options[selectedIndex] : 'Not Answered';
      const correctText = q.options[q.correctIndex];

      const res = await fetch('/api/tutor/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q.question,
          selectedOption: selectedText,
          correctOption: correctText,
          subject,
          academicLevel: user.academicLevel,
          language: lang,
        }),
      });

      const data = await res.json();
      setExpandedAiExplanation((prev) => ({
        ...prev,
        [q.id]: data.explanation,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAiId(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Score Summary Card */}
      <div className="bg-white/10 backdrop-blur-2xl border border-white/20 text-white p-6 sm:p-8 rounded-3xl shadow-2xl text-center space-y-5">
        <div className="w-16 h-16 bg-amber-400 text-[#002b24] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-900/40">
          <Award className="w-9 h-9" />
        </div>

        <div>
          <span className="text-[11px] font-bold text-amber-300 bg-amber-400/20 border border-amber-400/30 px-3 py-1 rounded-full uppercase tracking-wider">
            {user.academicLevel} Board Exam Quiz Results
          </span>
          <h2 className="text-2xl font-extrabold mt-2 text-white">{subject}</h2>
          <p className="text-xs text-emerald-200/80">{chapter}</p>
        </div>

        {/* Score Circle */}
        <div className="flex justify-center items-center gap-4 sm:gap-6 py-2">
          <div className="bg-[#003d34]/80 p-4 rounded-2xl border border-white/15 text-center min-w-[110px] shadow-lg">
            <p className="text-3xl font-extrabold text-amber-300">
              {correctCount} / {totalQuestions}
            </p>
            <p className="text-[11px] text-emerald-300/80 mt-1 uppercase font-bold tracking-wider">
              {t('correctAnswersCount')}
            </p>
          </div>

          <div className="bg-[#003d34]/80 p-4 rounded-2xl border border-white/15 text-center min-w-[110px] shadow-lg">
            <p className="text-3xl font-extrabold text-emerald-400">{scorePercentage}%</p>
            <p className="text-[11px] text-emerald-300/80 mt-1 uppercase font-bold tracking-wider">
              {lang === 'en' ? 'Accuracy Rate' : 'অ্যাকিউরেসি রেট'}
            </p>
          </div>
        </div>

        {/* Board Performance Estimate */}
        <p className="text-xs text-emerald-100 bg-white/5 border border-white/10 py-3 px-4 rounded-2xl max-w-md mx-auto leading-relaxed">
          {scorePercentage >= 80
            ? (lang === 'en' ? '🎉 Excellent performance! On track for A+ in Board Exams.' : '🎉 চমৎকার প্রস্তুতি! ঢাকা বোর্ড গ্রেড: A+ নিশ্চিতের পথে।')
            : scorePercentage >= 50
            ? (lang === 'en' ? '👍 Good progress! Review a few core concepts to hit top marks.' : '👍 ভালো পারফরম্যান্স! কিছু বেসিক টপিকে আরও অনুশীলন প্রয়োজন।')
            : (lang === 'en' ? '💡 Keep practicing! Solve previous years board questions for better clarity.' : '💡 আরও মনোযোগ দিন! বোর্ডের আগের বছরের কুইজগুলো প্র্যাকটিস করুন।')}
        </p>

        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <button
            onClick={onRestartQuiz}
            className="py-3 px-5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-2xl text-xs flex items-center gap-2 transition-all shadow"
          >
            <RotateCcw className="w-4 h-4 text-emerald-300" /> {t('retakeQuizBtn')}
          </button>
          <button
            onClick={onOpenCommunity}
            className="py-3 px-5 bg-amber-400 hover:bg-amber-300 text-[#002b24] font-extrabold rounded-2xl text-xs flex items-center gap-2 transition-all shadow-lg"
          >
            {t('discussCommunityBtn')}
          </button>
        </div>
      </div>

      {/* Questions Breakdown */}
      <div className="bg-white/10 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl space-y-5">
        <h3 className="text-base font-bold text-white flex items-center justify-between border-b border-white/10 pb-3">
          <span>{t('explanationTitle')}</span>
          <span className="text-xs font-semibold text-emerald-300/80">{totalQuestions} {t('questionsCountSuffix')}</span>
        </h3>

        <div className="space-y-4">
          {userAnswers.map((ans, idx) => {
            const isCorrect = ans.selectedIndex === ans.question.correctIndex;

            return (
              <div
                key={ans.question.id}
                className={`p-4 sm:p-5 rounded-2xl border text-xs space-y-3 transition-all ${
                  isCorrect
                    ? 'border-emerald-500/30 bg-emerald-500/10'
                    : 'border-rose-500/30 bg-rose-500/10'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <p className="font-bold text-white text-sm leading-relaxed">{ans.question.question}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-200 bg-[#003d34]/80 p-3 rounded-xl border border-white/10">
                  <div>
                    <span className="font-semibold text-emerald-300/70">{lang === 'en' ? 'Your Answer: ' : 'আপনার উত্তর: '}</span>
                    <span className={isCorrect ? 'font-bold text-emerald-300' : 'font-bold text-rose-300'}>
                      {ans.selectedIndex !== null ? ans.question.options[ans.selectedIndex] : (lang === 'en' ? 'Not Answered' : 'উত্তর দেননি')}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-emerald-300/70">{lang === 'en' ? 'Correct Answer: ' : 'সঠিক উত্তর: '}</span>
                    <span className="font-bold text-emerald-300">
                      {ans.question.options[ans.question.correctIndex]}
                    </span>
                  </div>
                </div>

                {/* AI Tutor Button */}
                <div>
                  <button
                    onClick={() => handleAskAiTutor(ans.question, ans.selectedIndex)}
                    disabled={loadingAiId === ans.question.id}
                    className="w-full py-2.5 px-3.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 font-bold rounded-xl flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2 text-xs">
                      <Bot className="w-4 h-4 text-amber-300" />
                      {lang === 'en' ? 'Gemini AI Tutor: Ask for deep explanation?' : 'Gemini AI Tutor: স্টেপ-বাই-স্টেপ ব্যাখ্যা চান?'}
                    </span>
                    {loadingAiId === ans.question.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                    ) : expandedAiExplanation[ans.question.id] ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {/* Expanded Gemini Explanation */}
                  {expandedAiExplanation[ans.question.id] && (
                    <div className="mt-2.5 p-4 bg-[#001f1a] text-slate-100 rounded-2xl space-y-2 border border-emerald-500/30 text-xs leading-relaxed shadow-inner">
                      <div className="flex items-center gap-1.5 text-amber-300 font-bold border-b border-white/10 pb-2">
                        <Sparkles className="w-4 h-4 text-amber-400" /> Gemini AI Tutor Explanation:
                      </div>
                      <div className="whitespace-pre-line text-emerald-100/90 leading-relaxed pt-1">
                        {expandedAiExplanation[ans.question.id]}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
