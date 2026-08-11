import React, { useState } from 'react';
import { UserProfile, AcademicLevel, AcademicGroup } from '../types';
import { useLanguage } from '../LanguageContext';
import {
  Phone,
  ShieldCheck,
  CheckCircle2,
  School,
  Sparkles,
  ArrowRight,
  History,
  Trophy,
  Zap,
  User,
  Edit3,
  Clock,
  BookOpen,
} from 'lucide-react';

interface AuthViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onLoginComplete: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ user, onUpdateUser, onLoginComplete }) => {
  const { lang, t } = useLanguage();
  const [showEditForm, setShowEditForm] = useState(false);

  const [phone, setPhone] = useState(user.phone || '+8801812345678');
  const [name, setName] = useState(user.name || 'তানভীর হোসেন');
  const [level, setLevel] = useState<AcademicLevel>(user.academicLevel || 'HSC');
  const [group, setGroup] = useState<AcademicGroup>(user.group || 'Science');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const history = user.quizHistory || [];
  const last5Quizzes = history.slice(0, 5);

  const totalCompleted = history.length;
  const avgScorePct =
    totalCompleted > 0
      ? Math.round(history.reduce((acc, q) => acc + q.percentage, 0) / totalCompleted)
      : 0;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    let formattedPhone = phone.trim();

    if (formattedPhone.startsWith('01')) {
      formattedPhone = '+88' + formattedPhone;
    }

    if (!formattedPhone.match(/^\+8801[68]\d{8}$/)) {
      setError(
        lang === 'en'
          ? 'bdapps Carrier Billing currently supports Robi (018) & Airtel (016) numbers only.'
          : 'বর্তমানে bdapps বিলিং সার্ভিস শুধুমাত্র রবি (018) এবং এয়ারটেল (016) নম্বরে উপলব্ধ।'
      );
      return;
    }

    setPhone(formattedPhone);
    setError('');
    setOtpSent(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '123456' && otp.length < 4) {
      setError(
        lang === 'en'
          ? 'Enter valid OTP (test code: 123456)'
          : 'সঠিক OTP দিন (টেস্ট কোড: 123456)'
      );
      return;
    }
    setError('');
    onUpdateUser({
      phone,
      name,
      academicLevel: level,
      group,
    });
    setShowEditForm(false);
    onLoginComplete();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 my-4">
      {/* Student Profile Card */}
      <div className="p-6 sm:p-8 bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 text-white relative overflow-hidden">
        {/* Top Header info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-500 text-[#002b24] font-black rounded-2xl flex items-center justify-center shadow-xl shadow-amber-900/30 text-3xl shrink-0">
              <User className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-extrabold text-white">{user.name}</h2>
                {user.isPremium ? (
                  <span className="bg-amber-400 text-[#002b24] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    PRO
                  </span>
                ) : (
                  <span className="bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    FREE
                  </span>
                )}
              </div>

              <p className="text-xs text-emerald-200/80 font-mono">
                {user.phone} • {user.academicLevel} ({user.group})
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-400/20 text-amber-300 px-3 py-1 rounded-xl border border-amber-400/30">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  {user.points} XP
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-500/20 text-emerald-200 px-3 py-1 rounded-xl border border-emerald-400/30">
                  <Zap className="w-3.5 h-3.5 text-emerald-300" />
                  {user.streakDays} {lang === 'en' ? 'Day Streak' : 'দিন স্ট্রিক'} 🔥
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowEditForm(!showEditForm)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-all shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-300" />
            {showEditForm
              ? lang === 'en'
                ? 'Close Settings'
                : 'সেটিংস বন্ধ করুন'
              : lang === 'en'
              ? 'Edit Profile'
              : 'প্রোফাইল পরিবর্তন'}
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10 text-center">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider mb-1">
              {lang === 'en' ? 'Quizzes Solved' : 'মোট কুইজ'}
            </p>
            <p className="text-xl font-black text-amber-300 font-mono">{totalCompleted}</p>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider mb-1">
              {lang === 'en' ? 'Average Score' : 'গড় পারফরম্যান্স'}
            </p>
            <p className="text-xl font-black text-emerald-300 font-mono">{avgScorePct}%</p>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider mb-1">
              {lang === 'en' ? 'Exam Target' : 'পরীক্ষার টার্গেট'}
            </p>
            <p className="text-xl font-black text-white font-mono">{user.academicLevel}</p>
          </div>
        </div>
      </div>

      {/* Quiz History Section (Last 5 Quizzes) */}
      <div className="p-6 sm:p-8 bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 text-white space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400/20 text-amber-300 rounded-xl border border-amber-400/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                {lang === 'en' ? 'Quiz History' : 'কুইজ হিস্ট্রি (সর্বশেষ ৫টি কুইজ)'}
              </h3>
              <p className="text-xs text-emerald-200/80">
                {lang === 'en'
                  ? 'Track your performance & progress over time'
                  : 'আপনার কুইজ রেজাল্ট ও পারফরম্যান্স ট্র্যাক করুন'}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-amber-300 bg-white/10 px-3 py-1 rounded-xl">
            {last5Quizzes.length} / {totalCompleted}
          </span>
        </div>

        {last5Quizzes.length === 0 ? (
          <div className="text-center py-8 space-y-3 bg-white/5 rounded-2xl border border-white/10">
            <BookOpen className="w-10 h-10 text-emerald-300/50 mx-auto" />
            <p className="text-xs text-emerald-200/80 font-medium">
              {lang === 'en'
                ? 'No quizzes completed yet. Start your first AI quiz now!'
                : 'এখনো কোনো কুইজ সম্পন্ন হয়নি। এখনই প্রথম এআই কুইজ প্র্যাকটিস শুরু করুন!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {last5Quizzes.map((quiz) => {
              const isHigh = quiz.percentage >= 80;
              const isMedium = quiz.percentage >= 50 && quiz.percentage < 80;

              const badgeColor = isHigh
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                : isMedium
                ? 'bg-amber-400/20 border-amber-400/40 text-amber-300'
                : 'bg-rose-500/20 border-rose-400/40 text-rose-300';

              const progressColor = isHigh
                ? 'bg-emerald-400'
                : isMedium
                ? 'bg-amber-400'
                : 'bg-rose-400';

              return (
                <div
                  key={quiz.id}
                  className="p-4 bg-[#003d34]/80 hover:bg-[#003d34] border border-white/15 rounded-2xl transition-all space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-amber-300">{quiz.subject}</span>
                        <span className="text-[10px] bg-white/10 text-emerald-200 px-1.5 py-0.2 rounded font-mono font-bold">
                          {quiz.academicLevel}
                        </span>
                      </div>
                      <p className="text-xs text-white/90 font-medium line-clamp-1">{quiz.chapter}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-200/80">
                        {quiz.score}/{quiz.totalQuestions}
                      </span>
                      <span
                        className={`text-xs font-black font-mono px-2.5 py-1 rounded-xl border ${badgeColor}`}
                      >
                        {quiz.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-black/30 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                      style={{ width: `${quiz.percentage}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-emerald-300/70 font-mono pt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-400" /> {quiz.timestamp}
                    </span>
                    <span>
                      {quiz.score === quiz.totalQuestions
                        ? lang === 'en'
                          ? 'Perfect Score!'
                          : 'শতভাগ নির্ভুল!'
                        : `${quiz.score} Correct Answers`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Profile & Mobile Auth Form (Shown when requested) */}
      {showEditForm && (
        <div className="p-6 sm:p-8 bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 text-white space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-amber-400 text-[#002b24] font-black rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-amber-900/40">
              <School className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-white">
              {lang === 'en' ? 'Update Profile & Mobile Auth' : 'প্রোফাইল সেটিংস ও মোবাইল ভেরিফিকেশন'}
            </h3>
          </div>

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-widest mb-1.5">
                  {t('nameLabel')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#003d34] border border-white/20 rounded-2xl text-xs text-white placeholder-emerald-300/40 focus:border-amber-400 focus:outline-none font-medium"
                  placeholder={lang === 'en' ? 'e.g. Tanvir Hossain' : 'যেমন: তানভীর হোসেন'}
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-widest mb-1.5">
                  {t('phoneNumberLabel')}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-emerald-300/60" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#003d34] border border-white/20 rounded-2xl text-xs text-white font-mono font-bold focus:border-amber-400 focus:outline-none"
                    placeholder="+8801700000000"
                    required
                  />
                </div>
                <p className="text-[10px] text-amber-300/90 mt-1 font-mono font-bold">
                  {t('phoneOperatorNote')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-widest mb-1.5">
                    {t('examLevelLabel')}
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as AcademicLevel)}
                    className="w-full px-3.5 py-2.5 bg-[#003d34] border border-white/20 rounded-2xl text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="SSC">SSC</option>
                    <option value="HSC">HSC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-widest mb-1.5">
                    {t('examGroupLabel')}
                  </label>
                  <select
                    value={group}
                    onChange={(e) => setGroup(e.target.value as AcademicGroup)}
                    className="w-full px-3.5 py-2.5 bg-[#003d34] border border-white/20 rounded-2xl text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Science">
                      {lang === 'en' ? 'Science' : 'বিজ্ঞান (Science)'}
                    </option>
                    <option value="Commerce">{lang === 'en' ? 'Commerce' : 'ব্যবসায় শিক্ষা'}</option>
                    <option value="Humanities">{lang === 'en' ? 'Humanities' : 'মানবিক'}</option>
                  </select>
                </div>
              </div>

              {error && (
                <p className="text-xs text-rose-300 font-bold bg-rose-500/20 p-3 rounded-xl border border-rose-500/30">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold rounded-2xl shadow-[0_10px_25px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                {lang === 'en' ? 'Send OTP Code' : 'OTP কোড পাঠান'}{' '}
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-emerald-500/20 border border-emerald-500/40 p-3.5 rounded-2xl text-xs text-emerald-100 font-medium">
                {lang === 'en' ? `Simulated 6-digit OTP sent to ` : 'নম্বরে একটি ৬-ডিজিটের সিমুলেটেড OTP পাঠানো হয়েছে: '}
                <span className="font-mono font-bold text-amber-300">{phone}</span>.
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-widest mb-1.5">
                  {lang === 'en' ? '6-Digit OTP PIN (Test: 123456)' : '৬ ডিজিট OTP পিন (Test: 123456)'}
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 absolute left-3.5 top-3.5 text-emerald-300/60" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-3 bg-[#003d34] border border-white/20 rounded-2xl text-center font-mono tracking-widest font-black text-amber-300 text-lg focus:border-amber-400 focus:outline-none"
                    placeholder="123456"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-rose-300 font-bold bg-rose-500/20 p-3 rounded-xl border border-rose-500/30">
                  {error}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-1/3 py-3 px-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs transition-all"
                >
                  {lang === 'en' ? 'Back' : 'পিছনে যান'}
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold rounded-2xl shadow-[0_10px_25px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />{' '}
                  {lang === 'en' ? 'Confirm & Save' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-white/10 text-center text-xs text-emerald-300/70">
            <p className="flex items-center justify-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Powered by Gemini AI & bdapps Carrier Billing
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
