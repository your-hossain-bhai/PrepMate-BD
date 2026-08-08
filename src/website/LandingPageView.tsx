import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { UserProfile } from '../types';
import {
  Sparkles,
  Download,
  Smartphone,
  Laptop,
  Tablet,
  CheckCircle2,
  ShieldCheck,
  Star,
  Bot,
  Crown,
  Play,
  ArrowRight,
  ChevronRight,
  Zap,
  Globe2,
  FileCode2,
} from 'lucide-react';

interface LandingPageViewProps {
  user: UserProfile;
  onOpenWebApp: () => void;
  onOpenSubscription: () => void;
  onOpenFlutterCode: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  user,
  onOpenWebApp,
  onOpenSubscription,
  onOpenFlutterCode,
}) => {
  const { lang, t } = useLanguage();
  const [downloadingApk, setDownloadingApk] = useState(false);
  const [apkDownloaded, setApkDownloaded] = useState(false);

  // Quick Interactive Mini-Quiz state for landing page visitors
  const [demoSelectedOption, setDemoSelectedOption] = useState<number | null>(null);
  const [demoShowExplanation, setDemoShowExplanation] = useState(false);

  const sampleQuestion = {
    question: lang === 'en'
      ? 'Physics (HSC): A body of mass 2 kg moves at 10 m/s. What is its kinetic energy?'
      : 'পদার্থবিজ্ঞান (HSC): ২ কেজি ভরের একটি বস্তু ১০ মিটার/সেকেন্ড বেগে চললে এর গতিশক্তি কত?',
    options: lang === 'en'
      ? ['A) 50 Joules', 'B) 100 Joules', 'C) 200 Joules', 'D) 20 Joules']
      : ['ক) ৫০ জুল (50 J)', 'খ) ১০০ জুল (100 J)', 'গ) ২০০ জুল (200 J)', 'ঘ) ২০ জুল (20 J)'],
    correctIndex: 1, // 100 J
    explanation: lang === 'en'
      ? 'Formula: Kinetic Energy E_k = 1/2 * m * v² = 0.5 * 2 * (10)² = 100 Joules.'
      : 'সুত্র: গতিশক্তি E_k = ১/২ × m × v² = ০.৫ × ২ × (১০)² = ১০০ জুল।',
  };

  const handleDownloadApk = () => {
    setDownloadingApk(true);
    setApkDownloaded(false);

    // Create a mock blob download for PrepMate_BD_v2.4.apk
    setTimeout(() => {
      const dummyContent = `PrepMate BD Android Package (v2.4)
NCTB Board Exam AI Prep App
Size: 3.5 MB
bdapps Carrier Billing Enabled`;
      const blob = new Blob([dummyContent], { type: 'application/vnd.android.package-archive' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'PrepMate_BD_v2.4.apk';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadingApk(false);
      setApkDownloaded(true);
    }, 1200);
  };

  return (
    <div className="space-y-12 pb-16 text-white max-w-6xl mx-auto px-3 sm:px-6">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#00362c]/90 via-[#002b24] to-[#001f1a] border border-white/20 p-6 sm:p-12 shadow-2xl text-center space-y-6 mt-2">
        {/* Decorative ambient blur glows */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 px-4 py-1.5 rounded-full text-xs sm:text-sm font-extrabold text-amber-300 shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{t('landingHeroBadge')}</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {t('landingTitle')}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-emerald-200/90 leading-relaxed font-medium max-w-2xl mx-auto">
            {t('landingSubtitle')}
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            {/* Primary Action 1: Web App Online Practice */}
            <button
              onClick={onOpenWebApp}
              className="w-full sm:w-auto py-4 px-8 bg-amber-400 hover:bg-amber-300 text-[#002b24] font-black rounded-2xl text-sm shadow-xl shadow-amber-900/30 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              <Play className="w-5 h-5 fill-[#002b24]" />
              <span>{t('openWebAppBtn')}</span>
            </button>

            {/* Primary Action 2: Direct Download APK */}
            <button
              onClick={handleDownloadApk}
              disabled={downloadingApk}
              className="w-full sm:w-auto py-4 px-7 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold rounded-2xl text-sm shadow-xl shadow-emerald-900/40 border border-emerald-400/30 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              <Download className="w-5 h-5 text-amber-300" />
              <span>{downloadingApk ? (lang === 'en' ? 'Preparing APK...' : 'APK তৈরি হচ্ছে...') : t('downloadApkBtn')}</span>
            </button>
          </div>

          {/* APK Download Success Alert */}
          {apkDownloaded && (
            <div className="mt-4 p-4 bg-emerald-500/20 border border-emerald-400/50 rounded-2xl text-xs text-emerald-200 flex items-center justify-center gap-2 max-w-md mx-auto font-bold animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                {lang === 'en'
                  ? 'PrepMate_BD_v2.4.apk download started! Check your downloads folder.'
                  : 'PrepMate_BD_v2.4.apk ডাউনলোড শুরু হয়েছে! ফোনের ডাউনলোডে চেক করুন।'}
              </span>
            </div>
          )}

          {/* Device icons indicator */}
          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-emerald-300/80 font-mono">
            <span className="flex items-center gap-1.5">
              <Laptop className="w-4 h-4 text-amber-400" /> PC & Web Browser
            </span>
            <span className="flex items-center gap-1.5">
              <Tablet className="w-4 h-4 text-amber-400" /> iPads & Tablets
            </span>
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-amber-400" /> Android & iPhone
            </span>
          </div>
        </div>
      </section>

      {/* 2. MULTI-DEVICE RESPONSIVE BANNER & WEB/APK FLEXIBILITY */}
      <section className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold">
            <Globe2 className="w-3.5 h-3.5 text-amber-300" /> Cross-Platform Universal Access
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {t('multiDeviceTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/80">
            {t('multiDeviceDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Option A: Web App */}
          <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-3 flex flex-col justify-between hover:border-amber-400/50 transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                <Laptop className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">{lang === 'en' ? 'Direct Web App' : 'সরাসরি ওয়েব অ্যাপ'}</h3>
              <p className="text-emerald-200/80 leading-relaxed">
                {lang === 'en'
                  ? 'No installation required! Practice quizzes directly from Chrome, Safari, or Edge on PC or Mac.'
                  : 'কোনো ইনস্টলেশনের দরকার নেই! কম্পিউটার বা ফোনে ব্রাউজার খুলেই প্র্যাকটিস করুন।'}
              </p>
            </div>
            <button
              onClick={onOpenWebApp}
              className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
            >
              <span>{lang === 'en' ? 'Launch Web App' : 'ওয়েব অ্যাপ খুলুন'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
            </button>
          </div>

          {/* Option B: Android APK */}
          <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-3 flex flex-col justify-between hover:border-emerald-400/50 transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">{lang === 'en' ? 'Android APK File' : 'অ্যান্ড্রয়েড এপিকে (APK)'}</h3>
              <p className="text-emerald-200/80 leading-relaxed">
                {lang === 'en'
                  ? 'Download the lightweight v2.4 standalone package to test or use natively on your smartphone.'
                  : '৩.৫ মেগাবাইটের হালকা APK ইনস্টল করে সরাসরি অফলাইনে টেস্ট করে দেখুন।'}
              </p>
            </div>
            <button
              onClick={handleDownloadApk}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>{lang === 'en' ? 'Download APK (3.5MB)' : 'APK ডাউনলোড (৩.৫ MB)'}</span>
            </button>
          </div>

          {/* Option C: Flutter Source Code */}
          <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-3 flex flex-col justify-between hover:border-amber-400/50 transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                <FileCode2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">{lang === 'en' ? 'Flutter Source Code' : 'ফ্লাটার সোর্স কোড'}</h3>
              <p className="text-emerald-200/80 leading-relaxed">
                {lang === 'en'
                  ? 'Explore the mobile Flutter codebase, state management, and Android/iOS setup directly.'
                  : 'অ্যাপটির ফ্লাটার মোবাইল সোর্স কোড ও স্ট্রাকচার সরাসরি ব্রাউজারে দেখুন।'}
              </p>
            </div>
            <button
              onClick={onOpenFlutterCode}
              className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
            >
              <span>{lang === 'en' ? 'Explore Flutter Code' : 'ফ্লাটার কোড দেখুন'}</span>
              <ChevronRight className="w-3.5 h-3.5 text-cyan-300" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE LIVE QUIZ DEMO ON LANDING PAGE */}
      <section className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/30 text-amber-300 px-3 py-1 rounded-full text-xs font-bold mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Interactive Sample Quiz
            </div>
            <h2 className="text-xl font-bold text-white">
              {lang === 'en' ? 'Try a Live AI Question Right Now!' : 'সরাসরি একটি নমুনা কুইজ প্র্যাকটিস করুন'}
            </h2>
          </div>
          <button
            onClick={onOpenWebApp}
            className="py-2 px-4 bg-amber-400 hover:bg-amber-300 text-[#002b24] font-black rounded-xl text-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>{lang === 'en' ? 'Try Full App' : 'ফুল কুইজ প্র্যাকটিস'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Demo Question Box */}
        <div className="bg-[#003d34]/80 p-5 sm:p-6 rounded-2xl border border-white/15 space-y-4">
          <p className="text-sm font-bold text-white leading-relaxed">
            {sampleQuestion.question}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {sampleQuestion.options.map((opt, idx) => {
              const isSelected = demoSelectedOption === idx;
              const isCorrect = idx === sampleQuestion.correctIndex;

              let btnClass = 'bg-white/5 border-white/15 text-slate-100 hover:bg-white/15';
              if (demoSelectedOption !== null) {
                if (isCorrect) {
                  btnClass = 'bg-emerald-500/30 border-emerald-400 text-emerald-200 font-bold';
                } else if (isSelected) {
                  btnClass = 'bg-rose-500/30 border-rose-400 text-rose-200 font-bold';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setDemoSelectedOption(idx);
                    setDemoShowExplanation(true);
                  }}
                  className={`p-3.5 rounded-xl border text-xs text-left transition-all ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {demoShowExplanation && (
            <div className="p-4 bg-[#001f1a] rounded-2xl border border-emerald-500/40 text-xs space-y-2 animate-fadeIn">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Bot className="w-4 h-4 text-amber-400" />
                <span>Gemini AI Tutor Real-time Explanation:</span>
              </div>
              <p className="text-emerald-100/90 leading-relaxed">
                {sampleQuestion.explanation}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 4. KEY FEATURES GRID */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {lang === 'en' ? 'Why SSC & HSC Toppers Choose PrepMate BD' : 'কেন PrepMate BD বাংলাদেশের শিক্ষার্থীদের প্রথম পছন্দ'}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/80">
            {lang === 'en'
              ? 'Tailored specifically for NCTB Board Examination syllabus & English Version curricula.'
              : 'এনসিটিবি কারিকুলাম ও বোর্ডের আগের বছরের প্রশ্নের আলোকে বিশেষভাবে তৈরি।'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-[#002b24] font-bold flex items-center justify-center shadow">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white">{t('feature1Title')}</h3>
            <p className="text-xs text-emerald-200/80 leading-relaxed">{t('feature1Desc')}</p>
          </div>

          <div className="p-6 bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white font-bold flex items-center justify-center shadow">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <h3 className="font-bold text-base text-white">{t('feature2Title')}</h3>
            <p className="text-xs text-emerald-200/80 leading-relaxed">{t('feature2Desc')}</p>
          </div>

          <div className="p-6 bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-[#002b24] font-bold flex items-center justify-center shadow">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white">{t('feature3Title')}</h3>
            <p className="text-xs text-emerald-200/80 leading-relaxed">{t('feature3Desc')}</p>
          </div>

          <div className="p-6 bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white font-bold flex items-center justify-center shadow">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-base text-white">{t('feature4Title')}</h3>
            <p className="text-xs text-emerald-200/80 leading-relaxed">{t('feature4Desc')}</p>
          </div>
        </div>
      </section>

      {/* 5. TRANSPARENT SUBSCRIPTION & 1-CLICK UNSUBSCRIBE GUARANTEE */}
      <section className="bg-gradient-to-br from-[#003d34] to-[#002b24] border border-white/20 p-6 sm:p-10 rounded-3xl shadow-2xl space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/30 text-amber-300 px-3 py-1 rounded-full text-xs font-bold">
            <Crown className="w-3.5 h-3.5 text-amber-400" /> Fair Billing Policy
          </div>
          <h2 className="text-2xl font-black text-white">
            {lang === 'en' ? 'bdapps Robi & Airtel Carrier Billing' : 'bdapps রবি ও এয়ারটেল মোবাইল বিলিং'}
          </h2>
          <p className="text-xs text-emerald-200/90 leading-relaxed">
            {lang === 'en'
              ? 'Only BDT 2.00/day directly from mobile balance. Try it out anytime! If you find it unhelpful, cancel with 1-click instantly.'
              : 'প্রতিদিন মাত্র ২.০০ টাকা সিমের ব্যালেন্স থেকে। টেস্ট করে দেখুন, পছন্দ না হলে যেকোনো সময় ১-ক্লিকেই সাবস্ক্রিপশন বন্ধ করুন।'}
          </p>
        </div>

        <div className="p-5 bg-white/5 rounded-2xl border border-white/10 max-w-md mx-auto space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="font-bold text-white">{lang === 'en' ? 'Price / Day:' : 'দৈনিক চার্জ:'}</span>
            <span className="font-mono font-extrabold text-amber-300 text-sm">2.00 BDT (+VAT)</span>
          </div>

          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="font-bold text-white">{lang === 'en' ? 'Supported Operators:' : 'সাপোর্টেড সিম:'}</span>
            <span className="font-bold text-emerald-300">Robi & Airtel</span>
          </div>

          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="font-bold text-white">{lang === 'en' ? 'Cancellation Policy:' : 'সাবস্ক্রিপশন বাতিল নীতি:'}</span>
            <span className="font-bold text-amber-300">{lang === 'en' ? 'Instant 1-Click Unsubscribe' : '১-ক্লিকে তাৎক্ষণিক বাতিল'}</span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={onOpenSubscription}
              className="flex-1 py-3 px-4 bg-amber-400 hover:bg-amber-300 text-[#002b24] font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
            >
              <Crown className="w-4 h-4" />
              <span>{t('subNowBtn')}</span>
            </button>
            <button
              onClick={onOpenSubscription}
              className="py-3 px-4 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1"
            >
              <span>{lang === 'en' ? 'Unsubscribe' : 'আনসাবস্ক্রাইব'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 6. STUDENT REVIEWS / TESTIMONIALS */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-white">
          {t('testimonialTitle')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-xl space-y-3">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-100 italic leading-relaxed">
              "{t('testimonial1Text')}"
            </p>
            <p className="text-xs font-bold text-emerald-300 pt-1">
              — {t('testimonial1Name')}
            </p>
          </div>

          <div className="p-6 bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-xl space-y-3">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-100 italic leading-relaxed">
              "{t('testimonial2Text')}"
            </p>
            <p className="text-xs font-bold text-emerald-300 pt-1">
              — {t('testimonial2Name')}
            </p>
          </div>
        </div>
      </section>

      {/* 7. FOOTER CTA */}
      <section className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 p-8 shadow-2xl text-center space-y-4">
        <h3 className="text-xl font-extrabold text-white">
          {lang === 'en' ? 'Ready to Ace Your Board Exams?' : 'আপনার বোর্ড পরীক্ষার প্রস্তুতি এখনই শুরু করুন!'}
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onOpenWebApp}
            className="py-3.5 px-6 bg-amber-400 hover:bg-amber-300 text-[#002b24] font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg"
          >
            <Play className="w-4 h-4 fill-[#002b24]" /> {t('openWebAppBtn')}
          </button>
          <button
            onClick={handleDownloadApk}
            className="py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-lg"
          >
            <Download className="w-4 h-4 text-amber-300" /> {t('downloadApkBtn')}
          </button>
        </div>
      </section>
    </div>
  );
};
