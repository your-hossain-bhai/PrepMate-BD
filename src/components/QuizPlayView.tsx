import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';
import { useLanguage } from '../LanguageContext';
import { Clock, CheckCircle2, XCircle, ArrowRight, HelpCircle, Loader2, Sparkles } from 'lucide-react';
import { cleanMathText } from '../utils/mathFormatter';

interface QuizPlayViewProps {
  questions: QuizQuestion[];
  isLoading: boolean;
  subject: string;
  chapter: string;
  onCompleteQuiz: (userAnswers: { question: QuizQuestion; selectedIndex: number | null; timeSpentSec: number }[]) => void;
}

export const QuizPlayView: React.FC<QuizPlayViewProps> = ({
  questions,
  isLoading,
  subject,
  chapter,
  onCompleteQuiz,
}) => {
  const { lang, t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<(number | null)[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30s per question
  const [userAnswers, setUserAnswers] = useState<
    { question: QuizQuestion; selectedIndex: number | null; timeSpentSec: number }[]
  >([]);

  // Initialize selectedOptions when questions arrive
  useEffect(() => {
    if (questions.length > 0) {
      setSelectedOptions(new Array(questions.length).fill(null));
    }
  }, [questions]);

  // Question countdown timer
  useEffect(() => {
    if (isLoading || questions.length === 0 || showFeedback) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, questions, isLoading, showFeedback]);

  const handleTimeOut = () => {
    if (showFeedback) return;
    const q = questions[currentIndex];
    const newAnswers = [
      ...userAnswers,
      { question: q, selectedIndex: null, timeSpentSec: 30 },
    ];
    setUserAnswers(newAnswers);
    setShowFeedback(true);
  };

  const handleSelectOption = (optionIndex: number) => {
    if (showFeedback) return; // Prevent changing after selected
    const updated = [...selectedOptions];
    updated[currentIndex] = optionIndex;
    setSelectedOptions(updated);

    const q = questions[currentIndex];
    const newAnswers = [
      ...userAnswers,
      { question: q, selectedIndex: optionIndex, timeSpentSec: 30 - timeLeft },
    ];
    setUserAnswers(newAnswers);
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowFeedback(false);
      setTimeLeft(30);
    } else {
      // Quiz Finished
      onCompleteQuiz(userAnswers);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white/10 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-300 shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <h3 className="text-xl font-bold text-white">
          {lang === 'en' ? 'Gemini AI Generating Questions...' : 'Gemini AI কুইজ জেনারেট করছে...'}
        </h3>
        <p className="text-xs text-emerald-200/70">
          {lang === 'en'
            ? `Preparing high-quality questions for ${subject} (${chapter}) aligned with curriculum.`
            : `NCTB বোর্ড সিলেবাস থেকে ${subject} (${chapter}) এর প্রফেশনাল প্রশ্নাবলি সাজানো হচ্ছে।`}
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center p-8 bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20">
        <HelpCircle className="w-12 h-12 text-emerald-300/50 mx-auto mb-2" />
        <p className="text-sm font-semibold text-emerald-200">
          {lang === 'en' ? 'No questions found. Please try again.' : 'কোনো প্রশ্ন পাওয়া যায়নি। দয়া করে আবার চেষ্টা করুন।'}
        </p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const selected = selectedOptions[currentIndex];
  const isCorrect = selected === currentQ.correctIndex;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Top Header Tracker */}
      <div className="bg-white/10 backdrop-blur-2xl p-4 rounded-2xl border border-white/20 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full">
            {subject}
          </span>
          <p className="text-[11px] text-emerald-200/70 mt-1.5 truncate max-w-[200px] sm:max-w-[300px]">
            {chapter}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3.5 py-1.5 rounded-2xl font-mono text-xs font-bold shadow">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{timeLeft}s</span>
          </div>

          <div className="text-xs font-extrabold text-white bg-white/10 border border-white/15 px-3 py-1.5 rounded-2xl">
            {currentIndex + 1} / {questions.length}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden border border-white/5">
        <div
          className="bg-amber-400 h-full transition-all duration-300 shadow-[0_0_10px_rgba(251,191,36,0.6)]"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white/10 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl space-y-6">
        <div className="flex items-start gap-3.5">
          <span className="w-8 h-8 bg-amber-400 text-[#002b24] font-black text-xs rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-md">
            Q{currentIndex + 1}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
            {cleanMathText(currentQ.question)}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            let optionStyle =
              'border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 hover:border-white/20';

            if (showFeedback) {
              if (idx === currentQ.correctIndex) {
                optionStyle = 'border-emerald-400 bg-emerald-500/30 text-emerald-200 font-bold ring-2 ring-emerald-400';
              } else if (idx === selected && selected !== currentQ.correctIndex) {
                optionStyle = 'border-rose-400 bg-rose-500/30 text-rose-200 font-bold ring-2 ring-rose-400';
              } else {
                optionStyle = 'opacity-40 border-white/5 bg-black/20 text-slate-400';
              }
            } else if (selected === idx) {
              optionStyle = 'border-amber-400 bg-amber-400/20 text-amber-300 font-bold ring-1 ring-amber-400';
            }

            return (
              <button
                key={idx}
                disabled={showFeedback}
                onClick={() => handleSelectOption(idx)}
                className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${optionStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full border border-white/20 font-mono text-xs flex items-center justify-center font-bold shrink-0 bg-white/10 text-white">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{cleanMathText(option)}</span>
                </div>

                {showFeedback && (
                  <div>
                    {idx === currentQ.correctIndex && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    {idx === selected && selected !== currentQ.correctIndex && (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Instant Feedback / Explanation Box */}
        {showFeedback && (
          <div
            className={`p-5 rounded-2xl border text-xs space-y-2.5 ${
              isCorrect
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-100'
                : 'bg-rose-500/20 border-rose-500/40 text-rose-100'
            }`}
          >
            <div className="flex items-center justify-between font-bold text-sm">
              <span className="flex items-center gap-2">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />{' '}
                    {lang === 'en' ? 'Correct Answer! (+10 pts)' : 'সঠিক উত্তর! (+১০ পয়েন্ট)'}
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-400" />{' '}
                    {lang === 'en' ? 'Incorrect! Correct answer is Option ' : 'ভুল উত্তর! সঠিক উত্তর: Option '}
                    {String.fromCharCode(65 + currentQ.correctIndex)}
                  </>
                )}
              </span>
            </div>

            <p className="text-emerald-200/90 whitespace-pre-line leading-relaxed pt-2 border-t border-white/10">
              {cleanMathText(currentQ.explanation)}
            </p>
          </div>
        )}

        {/* Next Question / Finish Button */}
        {showFeedback && (
          <button
            onClick={handleNextQuestion}
            className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold rounded-2xl shadow-[0_10px_25px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
          >
            {currentIndex < questions.length - 1 ? (
              <>
                {t('nextQuestionBtn')} <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" /> {t('seeResultsBtn')}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
