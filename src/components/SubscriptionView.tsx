import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { useLanguage } from '../LanguageContext';
import { Crown, CheckCircle2, ShieldCheck, Loader2, Smartphone, AlertCircle, Sparkles } from 'lucide-react';

interface SubscriptionViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({ user, onUpdateUser }) => {
  const { lang, t } = useLanguage();
  const [operator, setOperator] = useState('Robi');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [statusInfo, setStatusInfo] = useState<any>(null);

  const userPhone = user?.phone || '+8801812345678';

  // Check bdapps subscription status on mount
  useEffect(() => {
    if (userPhone) {
      checkBdappsStatus();
    }
  }, [userPhone]);

  const checkBdappsStatus = async () => {
    try {
      const res = await fetch(`/api/bdapps/status?phone=${encodeURIComponent(userPhone)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data) {
        setStatusInfo(data);
        if (typeof data.isPremium === 'boolean' && data.isPremium !== user?.isPremium) {
          onUpdateUser({ isPremium: data.isPremium });
        }
      }
    } catch (e) {
      console.error('Error checking bdapps status:', e);
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/bdapps/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: userPhone,
          operator,
        }),
      });

      const data = await res.json();

      if (data.status === 'SUCCESS') {
        setMessage(data.message || (lang === 'en' ? 'bdapps Carrier Billing successful!' : 'bdapps Carrier Billing সফল হয়েছে!'));
        onUpdateUser({ isPremium: true });
        checkBdappsStatus();
      } else {
        setError(data.message || (lang === 'en' ? 'Subscription charging failed.' : 'সাবস্ক্রিপশন চার্জিং ব্যর্থ হয়েছে।'));
      }
    } catch (err: any) {
      setError(lang === 'en' ? 'Unable to reach bdapps servers.' : 'bdapps সার্ভারে সংযোগ করা সম্ভব হয়নি।');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/bdapps/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: userPhone,
        }),
      });

      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setMessage(lang === 'en' ? 'bdapps subscription cancelled successfully.' : 'সফলভাবে bdapps সাবস্ক্রিপশন বাতিল করা হয়েছে।');
        onUpdateUser({ isPremium: false });
        checkBdappsStatus();
      }
    } catch (err) {
      setError(lang === 'en' ? 'Cancellation process failed.' : 'বাতিল প্রক্রিয়া ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-white/10 backdrop-blur-2xl border border-white/20 text-white p-6 sm:p-8 rounded-3xl shadow-2xl text-center space-y-4 relative overflow-hidden">
        <div className="w-16 h-16 bg-amber-400 text-[#002b24] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-900/40">
          <Crown className="w-9 h-9" />
        </div>

        <div>
          <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            PrepMate BD Premium
          </span>
          <h2 className="text-2xl font-extrabold text-white mt-2">{t('subscriptionHeader')}</h2>
          <p className="text-xs text-emerald-200/90 font-medium max-w-md mx-auto leading-relaxed mt-1">
            {t('subscriptionSubtitle')}
          </p>
        </div>
      </div>

      {/* Feature Comparison List */}
      <div className="bg-white/10 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl space-y-4">
        <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-widest border-b border-white/10 pb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" /> {lang === 'en' ? 'Premium Plan Features' : 'প্রিমিয়াম মেম্বারশিপের সুবিধাসমূহ'}
        </h3>

        <div className="space-y-3.5 text-xs text-slate-100">
          <div className="flex items-center gap-3 bg-[#003d34]/60 p-3 rounded-2xl border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong className="text-white">{lang === 'en' ? 'Unlimited AI Quiz Engine: ' : 'আনলিমিটেড এআই কুইজ জেনারেটর: '}</strong>
              {lang === 'en' ? 'Chapter-wise questions for all SSC & HSC subjects (Bangla & English Version)' : 'SSC ও HSC এর সকল বিষয়ের চ্যাপ্টারভিত্তিক প্রশ্ন'}
            </span>
          </div>

          <div className="flex items-center gap-3 bg-[#003d34]/60 p-3 rounded-2xl border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong className="text-white">{lang === 'en' ? 'Bilingual AI Explanations: ' : 'দ্বিভাষিক (বাংলা + English) এআই ব্যাখ্যা: '}</strong>
              {lang === 'en' ? 'Real-time step-by-step formula breakdown for any wrong option' : 'ভুল উত্তরের জন্য রিয়েল-টাইম সমাধান'}
            </span>
          </div>

          <div className="flex items-center gap-3 bg-[#003d34]/60 p-3 rounded-2xl border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong className="text-white">{lang === 'en' ? 'Priority AI Community Answers: ' : 'কমিউনিটিতে ফার্স্ট-প্রাইওরিটি এআই উত্তর: '}</strong>
              {lang === 'en' ? 'Instant AI solutions for complex math & physics problems posted in forum' : 'যে কোনো কঠিন গাণিতিক বা থিওরি প্রশ্নের সলভ'}
            </span>
          </div>

          <div className="flex items-center gap-3 bg-[#003d34]/60 p-3 rounded-2xl border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong className="text-white">{lang === 'en' ? 'Board Exam Suggestions & Leaderboard: ' : 'বোর্ড সাজেশন ও অ্যানালিটিক্স: '}</strong>
              {lang === 'en' ? 'Full access to national rankings and past year board trends' : 'বিগত ১০ বছরের বোর্ড পরীক্ষার প্রশ্ন ধারা বিশ্লেষণ'}
            </span>
          </div>
        </div>
      </div>

      {/* Subscription Action Form */}
      <div className="bg-white/10 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-widest">
            {t('selectOperator')}:
          </label>
          <span className="text-xs font-mono font-bold text-amber-300 bg-white/10 border border-white/15 px-3 py-1 rounded-full">
            {user.phone}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {['Robi', 'Airtel'].map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => setOperator(op)}
              className={`p-4 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between ${
                operator === op
                  ? 'border-amber-400 bg-amber-400/20 text-amber-300 shadow-md ring-1 ring-amber-400/50'
                  : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{op}</span>
                <span className="text-[9px] bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded font-mono font-extrabold">
                  {op === 'Robi' ? '018 prefix' : '016 prefix'} • bdapps
                </span>
              </div>
              <Smartphone className="w-4 h-4 text-emerald-300/60" />
            </button>
          ))}
        </div>

        {message && (
          <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-100 rounded-2xl text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-rose-500/20 border border-rose-500/40 text-rose-100 rounded-2xl text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!user.isPremium ? (
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-4 px-6 bg-amber-400 hover:bg-amber-300 text-[#002b24] font-black rounded-2xl text-xs shadow-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#002b24]" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-[#002b24]" /> {t('subNowBtn')}
              </>
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="p-4 bg-amber-400/20 border border-amber-400/40 text-amber-200 rounded-2xl text-xs text-center font-bold">
              ✨ {lang === 'en' ? 'You are currently on active bdapps Premium subscription' : 'আপনি বর্তমানে bdapps প্রিমিয়াম সাবস্ক্রিপশনে আছেন'} ({statusInfo?.operator || operator})।
            </div>

            <button
              onClick={handleUnsubscribe}
              disabled={loading}
              className="w-full py-3 px-4 bg-rose-500/20 border border-rose-500/40 text-rose-200 hover:bg-rose-500/30 font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : t('unsubBtn')}
            </button>
          </div>
        )}

        <div className="text-[11px] text-emerald-300/60 text-center space-y-1 pt-3 border-t border-white/10 font-mono">
          <p>bdapps API Compliance: 2.00 BDT/day + 15% VAT + 15% SD + 1% Surcharge.</p>
          <p>{lang === 'en' ? 'Cancel anytime via app or operator SMS unsubscribe code.' : 'যে কোনো সময় চার্জিং বন্ধ করতে অ্যাপ বা SMS থেকে Unsubscribe করতে পারবেন।'}</p>
        </div>
      </div>
    </div>
  );
};
