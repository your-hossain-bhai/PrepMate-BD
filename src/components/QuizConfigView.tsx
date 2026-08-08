import React, { useState } from 'react';
import { UserProfile, AcademicLevel, AcademicGroup } from '../types';
import { useLanguage } from '../LanguageContext';
import { BookOpen, Sparkles, Zap, Lock, Crown, ChevronRight, Check, Globe } from 'lucide-react';

interface QuizConfigViewProps {
  user: UserProfile;
  onStartQuiz: (config: {
    academicLevel: AcademicLevel;
    group: AcademicGroup;
    subject: string;
    chapter: string;
    count: number;
    curriculumVersion: string;
  }) => void;
  onOpenSubscription: () => void;
}

const SUBJECT_MAP: Record<AcademicLevel, Record<AcademicGroup, string[]>> = {
  HSC: {
    Science: [
      'Physics 1st Paper',
      'Physics 2nd Paper',
      'Chemistry 1st Paper',
      'Chemistry 2nd Paper',
      'Higher Math 1st Paper',
      'Higher Math 2nd Paper',
      'ICT',
      'Biology 1st Paper',
      'Biology 2nd Paper',
    ],
    Commerce: ['Accounting 1st Paper', 'Accounting 2nd Paper', 'Business Organization', 'Economics', 'ICT'],
    Humanities: ['Economics', 'Civics & Good Governance', 'Islamic History', 'Logic', 'ICT'],
  },
  SSC: {
    Science: ['Physics', 'Chemistry', 'Higher Math', 'Biology', 'ICT', 'General Math', 'General Science'],
    Commerce: ['Accounting', 'Finance & Banking', 'Business Entrepreneurship', 'General Math', 'ICT'],
    Humanities: ['History of Bangladesh', 'Geography & Environment', 'Civics & Citizenship', 'General Math', 'ICT'],
  },
};

const CHAPTER_SUGGESTIONS_BN: Record<string, string[]> = {
  Physics: ['১ম অধ্যায়: ভৌত রাশি ও পরিমাপ', '২য় অধ্যায়: গতি', '৩য় অধ্যায়: বল', '৪র্থ অধ্যায়: কাজ, ক্ষমতা ও শক্তি', '৭ম অধ্যায়: তরঙ্গ ও শব্দ'],
  'Physics 1st Paper': ['২য় অধ্যায়: ভেক্টর', '৩য় অধ্যায়: গতিবিদ্যা', '৪র্থ অধ্যায়: নিউটনীয় বলবিদ্যা', '৫ম অধ্যায়: কাজ, শক্তি ও ক্ষমতা', '১০ম অধ্যায়: আদর্শ গ্যাস'],
  'Physics 2nd Paper': ['১ম অধ্যায়: তাপগতিবিদ্যা', '২য় অধ্যায়: স্থির তড়িৎ', '৩য় অধ্যায়: চল তড়িৎ', '৬ষ্ঠ অধ্যায়: জ্যামিতিক আলোকবিজ্ঞান', '৮ম অধ্যায়: আধুনিক পদার্থবিজ্ঞান'],
  ICT: ['১ম অধ্যায়: বিশ্ব ও বাংলাদেশ প্রেক্ষিত', '২য় অধ্যায়: কমিউনিকেশন সিস্টেমস', '৩য় অধ্যায়: সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস', '৪র্থ অধ্যায়: ওয়েব ডিজাইন ও HTML', '৫ম অধ্যায়: প্রোগ্রামিং ভাষা (C)'],
  Chemistry: ['৩য় অধ্যায়: পদার্থের গঠন', '৪র্থ অধ্যায়: পর্যায় সারণি', '৫ম অধ্যায়: রাসায়নিক বন্ধন', '৬ষ্ঠ অধ্যায়: মোলের ধারণা ও রাসায়নিক গণনা'],
};

const CHAPTER_SUGGESTIONS_EN: Record<string, string[]> = {
  Physics: ['Chapter 1: Physical Quantities & Measurements', 'Chapter 2: Motion', 'Chapter 3: Force', 'Chapter 4: Work, Power & Energy', 'Chapter 7: Waves & Sound'],
  'Physics 1st Paper': ['Chapter 2: Vectors', 'Chapter 3: Dynamics', 'Chapter 4: Newtonian Mechanics', 'Chapter 5: Work, Energy & Power', 'Chapter 10: Ideal Gas'],
  'Physics 2nd Paper': ['Chapter 1: Thermodynamics', 'Chapter 2: Electrostatics', 'Chapter 3: Current Electricity', 'Chapter 6: Geometrical Optics', 'Chapter 8: Modern Physics'],
  ICT: ['Chapter 1: World & Bangladesh Perspective', 'Chapter 2: Communication Systems', 'Chapter 3: Number System & Digital Devices', 'Chapter 4: Web Design & HTML', 'Chapter 5: C Programming Language'],
  Chemistry: ['Chapter 3: Structure of Matter', 'Chapter 4: Periodic Table', 'Chapter 5: Chemical Bond', 'Chapter 6: Concept of Mole & Chemical Calculations'],
};

export const QuizConfigView: React.FC<QuizConfigViewProps> = ({ user, onStartQuiz, onOpenSubscription }) => {
  const { lang, setLang, t } = useLanguage();
  const [level, setLevel] = useState<AcademicLevel>(user.academicLevel || 'HSC');
  const [group, setGroup] = useState<AcademicGroup>(user.group || 'Science');
  const [curriculumVersion, setCurriculumVersion] = useState<'Bangla' | 'English'>(lang === 'en' ? 'English' : 'Bangla');

  const availableSubjects = SUBJECT_MAP[level]?.[group] || SUBJECT_MAP.HSC.Science;

  const [subject, setSubject] = useState(availableSubjects[0]);
  const [chapter, setChapter] = useState('');
  const [questionCount, setQuestionCount] = useState<number>(5);

  const activeChapters = (curriculumVersion === 'English' || lang === 'en')
    ? (CHAPTER_SUGGESTIONS_EN[subject] || [
        'Chapter 1: Fundamental Concepts',
        'Chapter 2: Board Exam High Yield Topics',
        'Chapter 3: Previous Years Question Solutions',
      ])
    : (CHAPTER_SUGGESTIONS_BN[subject] || [
        '১ম অধ্যায়: মৌলিক ধারণাসমূহ',
        '২য় অধ্যায়: বোর্ড পরীক্ষার গুরুত্বপূর্ন টপিক',
        '৩য় অধ্যায়: বিগত বছরের প্রশ্ন সমাধান',
      ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.isPremium && user.dailyQuizCount >= 1) {
      onOpenSubscription();
      return;
    }
    onStartQuiz({
      academicLevel: level,
      group,
      subject,
      chapter: chapter || activeChapters[0],
      count: questionCount,
      curriculumVersion,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white/10 backdrop-blur-2xl border border-white/20 text-white p-6 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 text-amber-300 px-3 py-1 rounded-full text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Gemini 3.6 Flash Engine
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">{t('quizConfigTitle')}</h2>
            <p className="text-xs text-emerald-300/90 mt-1">
              {t('quizConfigSubtitle')}
            </p>
          </div>

          {!user.isPremium ? (
            <button
              onClick={onOpenSubscription}
              className="bg-amber-400 hover:bg-amber-300 text-[#002b24] px-4 py-2.5 rounded-2xl font-bold text-xs shadow-lg shadow-amber-900/40 flex items-center gap-2 self-start md:self-auto transition-all active:scale-95"
            >
              <Crown className="w-4 h-4 text-[#002b24]" />
              {lang === 'en' ? 'Unlock Premium (bdapps)' : 'প্রিমিয়াম আনলক (bdapps)'}
            </button>
          ) : (
            <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-300" /> bdapps Unlimited
            </div>
          )}
        </div>
      </div>

      {/* Main Config Card */}
      <div className="bg-white/10 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/20">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Language / Version Selector Banner */}
          <div className="bg-amber-400/10 border border-amber-400/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                <Globe className="w-4 h-4" /> {t('curriculumVersionLabel')}
              </p>
              <p className="text-[11px] text-emerald-200/80 mt-0.5">
                {curriculumVersion === 'English'
                  ? 'Generating questions & explanations in English (NCTB EV / Cambridge O & A Level)'
                  : 'Generating questions & explanations in Bangla (NCTB Bangla Version)'}
              </p>
            </div>

            <div className="flex bg-black/40 p-1 rounded-xl border border-white/15 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setCurriculumVersion('Bangla');
                  setLang('bn');
                }}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                  curriculumVersion === 'Bangla'
                    ? 'bg-amber-400 text-[#002b24] shadow'
                    : 'text-emerald-200/80 hover:text-white'
                }`}
              >
                বাংলা মাধ্যম
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurriculumVersion('English');
                  setLang('en');
                }}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                  curriculumVersion === 'English'
                    ? 'bg-amber-400 text-[#002b24] shadow'
                    : 'text-emerald-200/80 hover:text-white'
                }`}
              >
                English Version / Medium
              </button>
            </div>
          </div>

          {/* Level and Group Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#003d34]/60 rounded-2xl border border-white/10">
            <div>
              <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-widest mb-1.5">
                {t('examLevelLabel')}
              </label>
              <div className="flex bg-black/20 p-1 rounded-xl border border-white/10">
                {(['SSC', 'HSC'] as AcademicLevel[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => {
                      setLevel(l);
                      const newSubjects = SUBJECT_MAP[l][group];
                      setSubject(newSubjects[0]);
                    }}
                    className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                      level === l ? 'bg-amber-400 text-[#002b24] shadow' : 'text-emerald-200/70 hover:text-white'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-widest mb-1.5">
                {t('examGroupLabel')}
              </label>
              <select
                value={group}
                onChange={(e) => {
                  const g = e.target.value as AcademicGroup;
                  setGroup(g);
                  const newSubjects = SUBJECT_MAP[level][g];
                  setSubject(newSubjects[0]);
                }}
                className="w-full px-3 py-2 bg-[#002b24] border border-white/20 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="Science">{lang === 'en' ? 'Science' : 'বিজ্ঞান (Science)'}</option>
                <option value="Commerce">{lang === 'en' ? 'Commerce' : 'ব্যবসায় শিক্ষা (Commerce)'}</option>
                <option value="Humanities">{lang === 'en' ? 'Humanities' : 'মানবিক (Humanities)'}</option>
              </select>
            </div>
          </div>

          {/* Subject Picker */}
          <div>
            <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-widest mb-2 flex items-center justify-between">
              <span>{t('subjectPickerLabel')}</span>
              <span className="text-[11px] text-amber-300 font-mono tracking-normal">{level} ({group})</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {availableSubjects.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSubject(s);
                    setChapter('');
                  }}
                  className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all flex items-center justify-between ${
                    subject === s
                      ? 'border-amber-400 bg-amber-400/20 text-amber-300 shadow-md ring-1 ring-amber-400/50'
                      : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <span className="truncate">{s}</span>
                  {subject === s && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Chapter Input or Quick Select */}
          <div>
            <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-widest mb-1.5">
              {t('chapterLabel')}
            </label>
            <input
              type="text"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              placeholder={t('chapterPlaceholder')}
              className="w-full px-4 py-3 bg-[#003d34] border border-white/20 rounded-2xl focus:border-amber-400 focus:outline-none text-xs text-white placeholder-emerald-300/40 mb-2.5"
            />
            
            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] text-emerald-300/70 uppercase font-bold py-1">{t('quickSelect')}</span>
              {activeChapters.map((chap, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setChapter(chap)}
                  className={`px-3 py-1 rounded-full text-[11px] border font-medium transition-all ${
                    chapter === chap
                      ? 'bg-emerald-500 text-white border-emerald-400 font-bold shadow'
                      : 'bg-white/5 border-white/10 text-emerald-200/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {chap}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-widest mb-2">
              {t('questionCountLabel')}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[5, 10, 15].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQuestionCount(cnt)}
                  className={`py-3 rounded-2xl border text-xs font-bold transition-all ${
                    questionCount === cnt
                      ? 'bg-amber-400 text-[#002b24] border-amber-300 shadow-lg font-black'
                      : 'bg-white/5 text-emerald-100 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {cnt} {t('questionsCountSuffix')}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div>
            {!user.isPremium && user.dailyQuizCount >= 1 ? (
              <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-amber-300 text-xs font-bold">
                  <Lock className="w-4 h-4 text-amber-400" />
                  {t('freeLimitReached')}
                </div>
                <button
                  type="button"
                  onClick={onOpenSubscription}
                  className="w-full py-3.5 px-4 bg-amber-400 hover:bg-amber-300 text-[#002b24] font-black rounded-2xl text-xs shadow-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4 text-[#002b24]" /> {t('unlockPremiumBtn')}
                </button>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-bold text-base shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2.5 uppercase tracking-wide"
              >
                <Zap className="w-5 h-5 text-amber-300 fill-amber-300" /> {t('startQuizBtn')}
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
