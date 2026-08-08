import React, { useState } from 'react';
import { UserProfile, AcademicLevel } from '../types';
import { useLanguage } from '../LanguageContext';
import { Trophy, Medal, Flame, Crown, Sparkles, Star, BookOpen, Zap, Target, Award } from 'lucide-react';

interface LeaderboardProps {
  currentUser: UserProfile;
}

export interface LeaderboardStudent {
  id: string;
  rank: number;
  name: string;
  level: AcademicLevel;
  board: string;
  points: number;
  quizzesSolved: number;
  chaptersMastered: number;
  streakDays: number;
  isCurrentUser?: boolean;
  avatarBg: string;
}

type SortCriterion = 'points' | 'quizzes' | 'chapters';

const MOCK_TOP_STUDENTS: LeaderboardStudent[] = [
  {
    id: '1',
    rank: 1,
    name: 'আরিফুর রহমান (Arifur)',
    level: 'HSC',
    board: 'Dhaka Board',
    points: 1850,
    quizzesSolved: 64,
    chaptersMastered: 18,
    streakDays: 18,
    avatarBg: 'bg-amber-400 text-[#002b24]',
  },
  {
    id: '2',
    rank: 2,
    name: 'নুসরাত জাহান (Nusrat)',
    level: 'HSC',
    board: 'Chattogram Board',
    points: 1620,
    quizzesSolved: 58,
    chaptersMastered: 16,
    streakDays: 14,
    avatarBg: 'bg-slate-300 text-[#002b24]',
  },
  {
    id: '3',
    rank: 3,
    name: 'সাদমান সাকিব (Sadman)',
    level: 'SSC',
    board: 'Rajshahi Board',
    points: 1490,
    quizzesSolved: 51,
    chaptersMastered: 15,
    streakDays: 12,
    avatarBg: 'bg-amber-700 text-white',
  },
  {
    id: '4',
    rank: 4,
    name: 'মেহজাবীন সুলতানা (Mehjabin)',
    level: 'HSC',
    board: 'Sylhet Board',
    points: 1310,
    quizzesSolved: 44,
    chaptersMastered: 13,
    streakDays: 9,
    avatarBg: 'bg-emerald-500 text-white',
  },
  {
    id: '5',
    rank: 5,
    name: 'ফাহিম আহমেদ (Fahim)',
    level: 'SSC',
    board: 'Cumilla Board',
    points: 1180,
    quizzesSolved: 40,
    chaptersMastered: 11,
    streakDays: 8,
    avatarBg: 'bg-emerald-600 text-white',
  },
  {
    id: '6',
    rank: 6,
    name: 'আনিকা মেহেরাজ (Anika)',
    level: 'HSC',
    board: 'Barishal Board',
    points: 1050,
    quizzesSolved: 36,
    chaptersMastered: 10,
    streakDays: 7,
    avatarBg: 'bg-emerald-700 text-white',
  },
  {
    id: '7',
    rank: 7,
    name: 'রাফসান আল দীন (Rafsan)',
    level: 'SSC',
    board: 'Jashore Board',
    points: 920,
    quizzesSolved: 31,
    chaptersMastered: 9,
    streakDays: 6,
    avatarBg: 'bg-emerald-800 text-white',
  },
  {
    id: '8',
    rank: 8,
    name: 'সামিয়া পারভীন (Samiya)',
    level: 'HSC',
    board: 'Dinajpur Board',
    points: 840,
    quizzesSolved: 28,
    chaptersMastered: 8,
    streakDays: 5,
    avatarBg: 'bg-teal-600 text-white',
  },
  {
    id: '9',
    rank: 9,
    name: 'মাহির ফয়সাল (Mahir)',
    level: 'SSC',
    board: 'Mymensingh Board',
    points: 760,
    quizzesSolved: 25,
    chaptersMastered: 7,
    streakDays: 4,
    avatarBg: 'bg-teal-700 text-white',
  },
  {
    id: '10',
    rank: 10,
    name: 'তাসনিম আক্তার (Tasnim)',
    level: 'HSC',
    board: 'Dhaka Board',
    points: 690,
    quizzesSolved: 22,
    chaptersMastered: 6,
    streakDays: 4,
    avatarBg: 'bg-teal-800 text-white',
  },
];

export const Leaderboard: React.FC<LeaderboardProps> = ({ currentUser }) => {
  const { lang, t } = useLanguage();
  const [filterLevel, setFilterLevel] = useState<'ALL' | AcademicLevel>('ALL');
  const [sortBy, setSortBy] = useState<SortCriterion>('points');

  // Inject current user dynamically if missing
  const fullList = [...MOCK_TOP_STUDENTS];
  const userInListIndex = fullList.findIndex((s) => s.id === currentUser.uid || s.name.includes(currentUser.name));

  const userSolvedQuizzes = Math.max(12, currentUser.dailyQuizCount * 3 + 6);
  const userMasteredChapters = Math.max(3, Math.floor(currentUser.points / 40));

  if (userInListIndex === -1) {
    fullList.push({
      id: currentUser.uid || 'user-current',
      rank: 12,
      name: `${currentUser.name} (${t('youBadge')})`,
      level: currentUser.academicLevel,
      board: 'Dhaka Board',
      points: currentUser.points,
      quizzesSolved: userSolvedQuizzes,
      chaptersMastered: userMasteredChapters,
      streakDays: currentUser.streakDays,
      isCurrentUser: true,
      avatarBg: 'bg-amber-400 text-[#002b24]',
    });
  } else {
    fullList[userInListIndex] = {
      ...fullList[userInListIndex],
      points: Math.max(fullList[userInListIndex].points, currentUser.points),
      quizzesSolved: Math.max(fullList[userInListIndex].quizzesSolved, userSolvedQuizzes),
      chaptersMastered: Math.max(fullList[userInListIndex].chaptersMastered, userMasteredChapters),
      streakDays: Math.max(fullList[userInListIndex].streakDays, currentUser.streakDays),
      isCurrentUser: true,
    };
  }

  // Filter list by SSC / HSC
  const categoryStudents = fullList.filter((s) => filterLevel === 'ALL' || s.level === filterLevel);

  // Sort list dynamically according to chosen criterion
  const sortedStudents = categoryStudents
    .sort((a, b) => {
      if (sortBy === 'points') return b.points - a.points;
      if (sortBy === 'quizzes') return b.quizzesSolved - a.quizzesSolved;
      return b.chaptersMastered - a.chaptersMastered;
    })
    .map((s, idx) => ({ ...s, rank: idx + 1 }));

  const top10 = sortedStudents.slice(0, 10);
  const userRankObj = sortedStudents.find((s) => s.isCurrentUser);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-xl bg-amber-400 text-[#002b24] font-black flex items-center justify-center shadow-lg shadow-amber-900/40 border border-amber-300">
          <Trophy className="w-4 h-4 fill-[#002b24]" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-xl bg-slate-300 text-slate-900 font-black flex items-center justify-center shadow border border-slate-200">
          <Medal className="w-4 h-4 text-slate-900" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-xl bg-amber-700 text-amber-100 font-black flex items-center justify-center shadow border border-amber-600">
          <Medal className="w-4 h-4 text-amber-200" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-xl bg-white/10 text-emerald-200 font-mono font-extrabold text-xs flex items-center justify-center border border-white/10">
        #{rank}
      </div>
    );
  };

  return (
    <div className="bg-white/10 backdrop-blur-2xl p-5 sm:p-7 rounded-3xl border border-white/20 shadow-2xl space-y-6 text-white">
      {/* Header Banner */}
      <div className="space-y-3 border-b border-white/10 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/30 text-amber-300 px-3 py-1 rounded-full text-xs font-bold mb-2">
              <Crown className="w-3.5 h-3.5 text-amber-400" /> {t('leaderboardTitle')}
            </div>
            <h3 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              National Board Exam Leaderboard <Sparkles className="w-5 h-5 text-amber-400" />
            </h3>
            <p className="text-xs text-emerald-200/80 mt-1">
              {t('leaderboardSubtitle')}
            </p>
          </div>

          {/* SSC / HSC Category Filter */}
          <div className="flex items-center bg-black/30 p-1.5 rounded-2xl border border-white/15 shrink-0 self-start sm:self-auto">
            {(['ALL', 'SSC', 'HSC'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  filterLevel === lvl
                    ? 'bg-amber-400 text-[#002b24] shadow-md font-black'
                    : 'text-emerald-200/70 hover:text-white'
                }`}
              >
                {lvl === 'ALL' ? t('allCategories') : `${lvl}`}
              </button>
            ))}
          </div>
        </div>

        {/* Ranking Criteria Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <button
            onClick={() => setSortBy('points')}
            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              sortBy === 'points'
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-900/40'
                : 'bg-white/5 border-white/10 text-emerald-200/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('topPoints')}</span>
          </button>

          <button
            onClick={() => setSortBy('quizzes')}
            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              sortBy === 'quizzes'
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-900/40'
                : 'bg-white/5 border-white/10 text-emerald-200/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('topQuizzes')}</span>
          </button>

          <button
            onClick={() => setSortBy('chapters')}
            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              sortBy === 'chapters'
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-900/40'
                : 'bg-white/5 border-white/10 text-emerald-200/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('topChapters')}</span>
          </button>
        </div>
      </div>

      {/* Podium Top 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {top10.slice(0, 3).map((student) => (
          <div
            key={student.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
              student.rank === 1
                ? 'bg-gradient-to-b from-amber-500/20 to-emerald-900/90 border-amber-400/50 shadow-xl shadow-amber-900/30'
                : student.rank === 2
                ? 'bg-gradient-to-b from-slate-400/15 to-emerald-950/90 border-slate-300/30'
                : 'bg-gradient-to-b from-amber-700/20 to-emerald-950/90 border-amber-600/30'
            }`}
          >
            <div className="flex items-center justify-between">
              {getRankBadge(student.rank)}
              <span className="text-[10px] bg-white/10 text-emerald-200 px-2.5 py-0.5 rounded-full font-mono border border-white/10 font-bold">
                {student.level} • {student.board}
              </span>
            </div>

            <div className="my-3 space-y-1">
              <h4 className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                {student.name}
                {student.isCurrentUser && (
                  <span className="text-[9px] bg-amber-400 text-[#002b24] font-black px-1.5 py-0.2 rounded">
                    YOU
                  </span>
                )}
              </h4>

              <p className="text-xs font-mono font-black text-amber-300 flex items-center gap-1">
                {sortBy === 'points' && (
                  <>
                    <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> {student.points} Points
                  </>
                )}
                {sortBy === 'quizzes' && (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> {student.quizzesSolved} Quizzes Solved
                  </>
                )}
                {sortBy === 'chapters' && (
                  <>
                    <BookOpen className="w-3.5 h-3.5 text-amber-300" /> {student.chaptersMastered} Chapters Mastered
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center justify-between text-[10px] text-emerald-200/80 border-t border-white/10 pt-2 font-mono">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                {student.streakDays}d Streak
              </span>
              <span className="text-emerald-300">
                {student.quizzesSolved} Quizzes • {student.chaptersMastered} Ch.
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Ranks 4 to 10 List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-widest">
            {filterLevel === 'ALL'
              ? (lang === 'en' ? 'Top 10 National Rankings' : 'টপ ১০ মেধা তালিকা')
              : `${filterLevel} ${lang === 'en' ? 'Category Top 10' : 'ক্যাটাগরি টপ ১০'}`} (Rank 4 - 10)
          </h4>
          <span className="text-[10px] font-mono text-emerald-300/60">
            {lang === 'en' ? 'Criteria: ' : 'র‍্যাঙ্কিং ক্রাইটেরিয়া: '}{sortBy}
          </span>
        </div>

        <div className="space-y-2">
          {top10.slice(3).map((student) => (
            <div
              key={student.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                student.isCurrentUser
                  ? 'bg-amber-400/20 border-amber-400 text-white ring-1 ring-amber-400/50 shadow-lg'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                {getRankBadge(student.rank)}

                <div className={`w-9 h-9 ${student.avatarBg} font-black rounded-xl flex items-center justify-center text-xs shrink-0 shadow`}>
                  {student.name.charAt(0)}
                </div>

                <div>
                  <h5 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{student.name}</span>
                    {student.isCurrentUser && (
                      <span className="text-[9px] bg-amber-400 text-[#002b24] font-black px-1.5 py-0.2 rounded">
                        YOU
                      </span>
                    )}
                  </h5>
                  <p className="text-[10px] text-emerald-200/70 font-mono">
                    {student.level} • {student.board}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-6 text-right shrink-0">
                <div className="hidden md:flex items-center gap-3 text-[11px] text-emerald-200/80 font-mono">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" /> {student.quizzesSolved} Quizzes
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-emerald-300" /> {student.chaptersMastered} Ch.
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-xs font-black font-mono text-amber-300">
                    {sortBy === 'points' && `${student.points} pts`}
                    {sortBy === 'quizzes' && `${student.quizzesSolved} quizzes`}
                    {sortBy === 'chapters' && `${student.chaptersMastered} ch.`}
                  </p>
                  <p className="text-[9px] text-emerald-300/60 uppercase font-bold">
                    Rank #{student.rank}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Status Summary Card */}
      {userRankObj && (
        <div className="p-4 bg-amber-400/15 border border-amber-400/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-[#002b24] font-black flex items-center justify-center text-sm shadow">
              #{userRankObj.rank}
            </div>
            <div>
              <p className="font-bold text-white text-sm">{currentUser.name} ({lang === 'en' ? 'Your Position' : 'আপনার পজিশন'})</p>
              <p className="text-[11px] text-emerald-200/80 font-mono mt-0.5">
                {currentUser.points} Points • {userSolvedQuizzes} Quizzes Solved • {userMasteredChapters} Chapters Mastered
              </p>
            </div>
          </div>

          <div className="text-right font-mono text-xs text-amber-300 font-bold bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
            {lang === 'en' ? 'Take quizzes to climb up the Leaderboard! 🚀' : 'কুইজ টেস্ট দিয়ে লিডারবোর্ডে এগিয়ে যান! 🚀'}
          </div>
        </div>
      )}
    </div>
  );
};
