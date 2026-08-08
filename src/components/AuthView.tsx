import React, { useState } from 'react';
import { UserProfile, AcademicLevel, AcademicGroup } from '../types';
import { useLanguage } from '../LanguageContext';
import { Phone, ShieldCheck, CheckCircle2, School, Sparkles, ArrowRight } from 'lucide-react';

interface AuthViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onLoginComplete: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ user, onUpdateUser, onLoginComplete }) => {
  const { lang, t } = useLanguage();
  const [phone, setPhone] = useState(user.phone || '+8801712345678');
  const [name, setName] = useState(user.name || 'সাকিব আহমেদ');
  const [level, setLevel] = useState<AcademicLevel>(user.academicLevel || 'HSC');
  const [group, setGroup] = useState<AcademicGroup>(user.group || 'Science');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.match(/^\+8801[3-9]\d{8}$/)) {
      setError(lang === 'en' ? 'Enter a valid Bangladeshi phone number (+8801XXXXXXXXX)' : 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন (+8801XXXXXXXXX)');
      return;
    }
    setError('');
    setOtpSent(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '123456' && otp.length < 4) {
      setError(lang === 'en' ? 'Enter valid OTP (test code: 123456)' : 'সঠিক OTP দিন (টেস্ট কোড: 123456)');
      return;
    }
    setError('');
    onUpdateUser({
      phone,
      name,
      academicLevel: level,
      group,
    });
    onLoginComplete();
  };

  return (
    <div className="max-w-md mx-auto p-6 sm:p-8 bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 text-white my-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-amber-400 text-[#002b24] font-black rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-900/40">
          <School className="w-9 h-9" />
        </div>
        <h2 className="text-2xl font-extrabold text-white">
          {lang === 'en' ? 'Welcome to PrepMate BD!' : 'PrepMate BD এ স্বাগতম!'}
        </h2>
        <p className="text-xs text-emerald-200/80 leading-relaxed">
          {t('appTagline')}
        </p>
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
                <option value="Science">{lang === 'en' ? 'Science' : 'বিজ্ঞান (Science)'}</option>
                <option value="Commerce">{lang === 'en' ? 'Commerce' : 'ব্যবসায় শিক্ষা'}</option>
                <option value="Humanities">{lang === 'en' ? 'Humanities' : 'মানবিক'}</option>
              </select>
            </div>
          </div>

          {error && <p className="text-xs text-rose-300 font-bold bg-rose-500/20 p-3 rounded-xl border border-rose-500/30">{error}</p>}

          <button
            type="submit"
            className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold rounded-2xl shadow-[0_10px_25px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
          >
            {lang === 'en' ? 'Send OTP Code' : 'OTP কোড পাঠান'} <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="bg-emerald-500/20 border border-emerald-500/40 p-3.5 rounded-2xl text-xs text-emerald-100 font-medium">
            {lang === 'en' ? `Simulated 6-digit OTP sent to ` : 'নম্বরে একটি ৬-ডিজিটের সিমুলেটেড OTP পাঠানো হয়েছে: '}<span className="font-mono font-bold text-amber-300">{phone}</span>.
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

          {error && <p className="text-xs text-rose-300 font-bold bg-rose-500/20 p-3 rounded-xl border border-rose-500/30">{error}</p>}

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
              <CheckCircle2 className="w-4 h-4 text-amber-300" /> {lang === 'en' ? 'Confirm Login' : 'লগইন নিশ্চিত করুন'}
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
  );
};
