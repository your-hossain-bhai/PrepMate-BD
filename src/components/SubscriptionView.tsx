import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { useLanguage } from '../LanguageContext';
import {
  Crown,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Smartphone,
  AlertCircle,
  Sparkles,
  KeyRound,
  RefreshCw,
  MessageSquare,
  Hash,
  Send,
  Zap,
  Info,
} from 'lucide-react';

interface SubscriptionViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({ user, onUpdateUser }) => {
  const { lang, t } = useLanguage();
  const isEnglish = lang === 'en';

  const [operator, setOperator] = useState<'Robi' | 'Airtel'>('Robi');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '+8801812345678');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [statusInfo, setStatusInfo] = useState<any>(null);

  // OTP Flow States
  const [subMethod, setSubMethod] = useState<'otp' | 'direct'>('otp');
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [referenceNo, setReferenceNo] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [demoSimulationOtp, setDemoSimulationOtp] = useState<string | null>(null);

  // Check bdapps subscription status on mount and phone change
  useEffect(() => {
    if (phoneNumber) {
      checkBdappsStatus();
    }
  }, [phoneNumber]);

  const checkBdappsStatus = async () => {
    try {
      const res = await fetch(`/api/bdapps/status?phone=${encodeURIComponent(phoneNumber)}`);
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

  // 1. bdapps OTP Request
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    setDemoSimulationOtp(null);

    try {
      const res = await fetch('/api/bdapps/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneNumber,
          operator,
        }),
      });

      const data = await res.json();

      if (data.statusCode === 'S1000' || data.referenceNo) {
        setReferenceNo(data.referenceNo);
        setOtpStep('verify');
        if (data.simulationOtp) {
          setDemoSimulationOtp(data.simulationOtp);
        }
        setMessage(
          isEnglish
            ? `bdapps OTP sent to ${phoneNumber}. Please enter OTP below.`
            : `${phoneNumber} নম্বরে bdapps OTP পাঠানো হয়েছে। নিচে ওটিপি লিখুন।`
        );
      } else {
        setError(data.statusDetail || data.message || 'OTP request failed. Check phone format.');
      }
    } catch (err: any) {
      setError(isEnglish ? 'Unable to connect to bdapps TAP API gateway.' : 'bdapps গেটওয়েতে সংযোগ ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  // 2. bdapps OTP Verify
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/bdapps/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceNo,
          otp: otpCode.trim(),
          phone: phoneNumber,
          operator,
        }),
      });

      const data = await res.json();

      if (data.statusCode === 'S1000' || data.subscriptionStatus === 'REGISTERED') {
        setMessage(
          isEnglish
            ? '🎉 Subscribed successfully via bdapps TAP API! Premium activated.'
            : '🎉 bdapps TAP API এর মাধ্যমে সফলভাবে সাবস্ক্রিপশন সম্পন্ন হয়েছে! প্রিমিয়াম এক্টিভেট।'
        );
        onUpdateUser({ isPremium: true });
        setOtpStep('request');
        setOtpCode('');
        checkBdappsStatus();
      } else {
        setError(data.statusDetail || data.message || (isEnglish ? 'Incorrect OTP code.' : 'ভুল ওটিপি দেওয়া হয়েছে।'));
      }
    } catch (err: any) {
      setError(isEnglish ? 'Verification failed with bdapps gateway.' : 'ভেরিফিকেশন সম্পন্ন করা যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  // 3. Direct Subscribe (/subscription/send Action 1)
  const handleDirectSubscribe = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/bdapps/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneNumber,
          operator,
        }),
      });

      const data = await res.json();

      if (data.status === 'SUCCESS' || data.statusCode === 'S1000') {
        setMessage(data.message || (isEnglish ? 'bdapps Carrier Billing successful!' : 'bdapps Carrier Billing সফল হয়েছে!'));
        onUpdateUser({ isPremium: true });
        checkBdappsStatus();
      } else {
        setError(data.message || data.statusDetail || (isEnglish ? 'Subscription charging failed.' : 'সাবস্ক্রিপশন চার্জিং ব্যর্থ হয়েছে।'));
      }
    } catch (err: any) {
      setError(isEnglish ? 'Unable to reach bdapps servers.' : 'bdapps সার্ভারে সংযোগ করা সম্ভব হয়নি।');
    } finally {
      setLoading(false);
    }
  };

  // 4. Unsubscribe (/subscription/send Action 0)
  const handleUnsubscribe = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/bdapps/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneNumber,
        }),
      });

      const data = await res.json();
      if (data.status === 'SUCCESS' || data.statusCode === 'S1000') {
        setMessage(
          isEnglish
            ? 'bdapps subscription cancelled successfully.'
            : 'সফলভাবে bdapps সাবস্ক্রিপশন বাতিল করা হয়েছে।'
        );
        onUpdateUser({ isPremium: false });
        checkBdappsStatus();
      } else {
        setError(data.statusDetail || data.message || 'Unsubscribe request failed.');
      }
    } catch (err) {
      setError(isEnglish ? 'Cancellation process failed.' : 'বাতিল প্রক্রিয়া ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-white/10 backdrop-blur-2xl border border-white/20 text-white p-6 sm:p-8 rounded-3xl shadow-2xl text-center space-y-4 relative overflow-hidden">
        <div className="w-16 h-16 bg-amber-400 text-[#002b24] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-900/40">
          <Crown className="w-9 h-9" />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" /> bdapps TAP API Telco Billing
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            {isEnglish ? 'Unlock Unlimited AI Prep with bdapps' : 'bdapps ক্যারিয়ার বিলিং দিয়ে আনলিমিটেড এআই প্রস্তুতি'}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/90 font-medium max-w-lg mx-auto leading-relaxed mt-1">
            {isEnglish
              ? 'Charge BDT 2.00/day directly to your Robi or Airtel mobile balance. No credit card required.'
              : 'রবি অথবা এয়ারটেল ব্যালেন্স থেকে প্রতিদিন মাত্র ২.০০ টাকায় (+ভ্যাট/এসডি) কোনো ক্রেডিট কার্ড ছাড়াই আনলিমিটেড কুইজ ও এআই সমাধান।'}
          </p>
        </div>
      </div>

      {/* Feature Comparison List */}
      <div className="bg-white/10 backdrop-blur-2xl p-6 sm:p-7 rounded-3xl border border-white/20 shadow-2xl space-y-3.5">
        <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-widest border-b border-white/10 pb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />{' '}
          {isEnglish ? 'Premium Membership Benefits' : 'প্রিমিয়াম মেম্বারশিপের সুবিধাসমূহ'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-100">
          <div className="flex items-start gap-3 bg-[#003d34]/60 p-3 rounded-2xl border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-white">
                {isEnglish ? 'Unlimited AI Quizzes: ' : 'আনলিমিটেড এআই কুইজ: '}
              </strong>
              {isEnglish ? 'No daily 1-quiz cap' : 'দৈনিক কোনো লিমিট নেই'}
            </span>
          </div>

          <div className="flex items-start gap-3 bg-[#003d34]/60 p-3 rounded-2xl border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-white">
                {isEnglish ? 'Gemini 2.5 Flash Solutions: ' : 'এআই স্টেপ-বাই-স্টেপ সমাধান: '}
              </strong>
              {isEnglish ? 'Detailed breakdown for all mistakes' : 'প্রতিটি ভুল উত্তরের জন্য নির্ভুল ব্যাখ্যা'}
            </span>
          </div>

          <div className="flex items-start gap-3 bg-[#003d34]/60 p-3 rounded-2xl border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-white">
                {isEnglish ? '10-Year Board Analysis: ' : '১০ বছরের বোর্ড কোয়েশ্চেন: '}
              </strong>
              {isEnglish ? 'Dhaka, Chittagong, Rajshahi boards' : 'সকল শিক্ষাবোর্ডের বিগত বছরের প্রশ্ন'}
            </span>
          </div>

          <div className="flex items-start gap-3 bg-[#003d34]/60 p-3 rounded-2xl border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-white">
                {isEnglish ? 'Offline Caching & Reminders: ' : 'অফলাইন মোড ও রিমাইন্ডার: '}
              </strong>
              {isEnglish ? 'Practice without internet data' : 'ইন্টারনেট ছাড়াই প্র্যাকটিস ও অডিও অ্যালার্ট'}
            </span>
          </div>
        </div>
      </div>

      {/* Subscription Action Form & bdapps Integration */}
      <div className="bg-white/10 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl space-y-5">
        {/* Operator Choice & Phone Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-emerald-300 uppercase tracking-widest">
              {isEnglish ? '1. Select Telco Operator' : '১. অপারেটর নির্বাচন করুন'}:
            </label>
            <button
              onClick={checkBdappsStatus}
              className="text-[11px] text-amber-300 hover:text-amber-200 flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="w-3 h-3" /> {isEnglish ? 'Sync Status' : 'স্ট্যাটাস চেক'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(['Robi', 'Airtel'] as const).map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => {
                  setOperator(op);
                  if (op === 'Robi' && !phoneNumber.startsWith('+88018')) {
                    setPhoneNumber('+8801812345678');
                  } else if (op === 'Airtel' && !phoneNumber.startsWith('+88016')) {
                    setPhoneNumber('+8801612345678');
                  }
                }}
                className={`p-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between ${
                  operator === op
                    ? 'border-amber-400 bg-amber-400/20 text-amber-300 shadow-md ring-1 ring-amber-400/50'
                    : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold">{op}</span>
                  <span className="text-[9px] bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded font-mono font-extrabold">
                    {op === 'Robi' ? '018 prefix' : '016 prefix'}
                  </span>
                </div>
                <Smartphone className="w-4 h-4 text-emerald-300/60" />
              </button>
            ))}
          </div>
        </div>

        {/* Phone Number Input Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-emerald-300 uppercase tracking-widest">
            {isEnglish ? '2. Subscriber Phone Number' : '২. মোবাইল নম্বর'} (+880):
          </label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+88018XXXXXXXX"
            className="w-full bg-[#00241e] border border-white/20 text-white font-mono text-sm px-4 py-3 rounded-2xl focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Method Toggle: OTP Verification vs Direct 1-Click */}
        {!user.isPremium && (
          <div className="flex items-center gap-2 p-1 bg-[#00241e]/80 border border-white/15 rounded-2xl">
            <button
              type="button"
              onClick={() => setSubMethod('otp')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                subMethod === 'otp'
                  ? 'bg-amber-400 text-[#002b24] shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" /> {isEnglish ? 'bdapps OTP Flow (Official)' : 'bdapps ওটিপি ভেরিফিকেশন'}
            </button>

            <button
              type="button"
              onClick={() => setSubMethod('direct')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                subMethod === 'direct'
                  ? 'bg-amber-400 text-[#002b24] shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> {isEnglish ? '1-Click Direct Send' : '১-ক্লিক ডিরেক্ট সেন্ট'}
            </button>
          </div>
        )}

        {/* Alerts & Messages */}
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

        {/* Action Flows */}
        {!user.isPremium ? (
          <div>
            {subMethod === 'otp' ? (
              otpStep === 'request' ? (
                <button
                  onClick={handleRequestOtp}
                  disabled={loading}
                  className="w-full py-4 px-6 bg-amber-400 hover:bg-amber-300 text-[#002b24] font-black rounded-2xl text-xs shadow-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#002b24]" />
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 text-[#002b24]" />{' '}
                      {isEnglish ? 'Request bdapps OTP' : 'bdapps ওটিপি পাঠান'} (BDT 2.00/day)
                    </>
                  )}
                </button>
              ) : (
                <div className="bg-[#00241e] border border-amber-400/40 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">
                      {isEnglish ? 'Enter bdapps SMS OTP' : 'এসএমএস ওটিপি কোড লিখুন'}:
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Ref: {referenceNo}</span>
                  </div>

                  {demoSimulationOtp && (
                    <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs rounded-xl flex items-center justify-between font-mono">
                      <span>🧪 Sandbox Demo OTP: <strong>{demoSimulationOtp}</strong></span>
                      <button
                        type="button"
                        onClick={() => setOtpCode(demoSimulationOtp)}
                        className="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-0.5 rounded font-sans font-bold"
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="e.g. 1234"
                      className="flex-1 bg-slate-900 border border-white/20 text-white text-center font-mono font-bold text-lg tracking-widest py-2.5 rounded-xl focus:outline-none focus:border-amber-400"
                    />

                    <button
                      onClick={handleVerifyOtp}
                      disabled={loading || !otpCode.trim()}
                      className="px-6 bg-amber-400 hover:bg-amber-300 text-[#002b24] font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      {isEnglish ? 'Verify & Activate' : 'যাচাই ও সক্রিয় করুন'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOtpStep('request')}
                    className="text-[11px] text-slate-400 hover:text-slate-200 text-center w-full"
                  >
                    ← {isEnglish ? 'Change phone number / Re-send OTP' : 'নম্বর পরিবর্তন বা পুনরায় ওটিপি পাঠান'}
                  </button>
                </div>
              )
            ) : (
              <button
                onClick={handleDirectSubscribe}
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
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 bg-emerald-500/20 border border-emerald-400/40 text-emerald-100 rounded-2xl text-xs text-center font-bold">
              ✨ {isEnglish ? 'Active bdapps TAP Premium Member' : 'সক্রিয় bdapps প্রিমিয়াম মেম্বার'} ({statusInfo?.operator || operator})
              <div className="text-[10px] text-emerald-300 font-mono mt-1">
                Subscriber ID: {statusInfo?.subscriberId || `tel:${phoneNumber.replace(/[^\d]/g, '')}`}
              </div>
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

        {/* Alternative SMS / USSD Carrier Instructions */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <span className="text-[11px] font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />{' '}
            {isEnglish ? 'Offline SMS & USSD Subscription Codes' : 'অফলাইন এসএমএস ও ইউএসএসডি কোড'}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-[#00241e] border border-white/10 p-3 rounded-2xl">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" /> SMS Subscription:
              </div>
              <p className="text-slate-300 mt-1">
                Send <code className="text-amber-300 font-mono font-bold bg-white/10 px-1.5 py-0.5 rounded">START PREP</code> to <code className="text-emerald-300 font-mono font-bold">21213</code>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Unsubscribe: Send <code className="font-mono text-rose-300">STOP PREP</code> to <code className="font-mono">21213</code>
              </p>
            </div>

            <div className="bg-[#00241e] border border-white/10 p-3 rounded-2xl">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-amber-400" /> USSD Direct Dial:
              </div>
              <p className="text-slate-300 mt-1">
                Dial <code className="text-amber-300 font-mono font-bold bg-white/10 px-1.5 py-0.5 rounded">*21213*999#</code> from your Robi/Airtel SIM.
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Instant telco activation with zero data usage.
              </p>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-emerald-300/60 text-center space-y-0.5 pt-2 border-t border-white/10 font-mono">
          <p>bdapps TAP API Compliance: 2.00 BDT/day + 15% VAT + 15% SD + 1% Surcharge.</p>
          <p>{isEnglish ? 'Powered by Robi Axiata Ltd. BDapps Developer Partner Gateway' : 'রবি আজিয়াটা লিমিটেড bdapps ডেভেলপার পার্টনার গেটওয়ে দ্বারা পরিচালিত।'}</p>
        </div>
      </div>
    </div>
  );
};
