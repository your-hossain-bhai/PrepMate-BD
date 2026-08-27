import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import {
  Download,
  Smartphone,
  CheckCircle2,
  Share,
  PlusSquare,
  MoreVertical,
  X,
  Sparkles,
  QrCode,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface InstallPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallPromptModal: React.FC<InstallPromptModalProps> = ({ isOpen, onClose }) => {
  const { lang } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'share'>('android');

  const currentUrl = window.location.href;

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!isOpen) return null;

  const handlePwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        onClose();
      }
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-[#002b24] border border-white/20 text-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-[#002b24] flex items-center justify-center font-black shadow-lg shadow-amber-900/40">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">
                {lang === 'en' ? 'Install PrepMate BD' : 'মোবাইলে অ্যাপ ইনস্টল করুন'}
              </h3>
              <p className="text-xs text-emerald-200/80">
                {lang === 'en'
                  ? 'Access board exam AI quizzes directly from your home screen'
                  : 'হোম স্ক্রিন থেকে সরাসরি কুইজ ও অফলাইন প্র্যাকটিস করুন'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Native Browser Install if available */}
        {deferredPrompt && (
          <div className="p-4 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl space-y-3 relative z-10">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              {lang === 'en' ? 'Quick Install Available' : 'এক-ক্লিকে ইনস্টল উপলব্ধ'}
            </div>
            <button
              onClick={handlePwaInstall}
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-[#002b24] font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
            >
              <Download className="w-4 h-4" />
              {lang === 'en' ? 'Install App to Home Screen' : 'হোম স্ক্রিনে ইনস্টল করুন'}
            </button>
          </div>
        )}

        {/* Tabs: Android vs iPhone vs Share */}
        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10 relative z-10">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'android' ? 'bg-emerald-500 text-[#002b24]' : 'text-emerald-200 hover:text-white'
            }`}
          >
            Android
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ios' ? 'bg-emerald-500 text-[#002b24]' : 'text-emerald-200 hover:text-white'
            }`}
          >
            iPhone / iPad
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'share' ? 'bg-emerald-500 text-[#002b24]' : 'text-emerald-200 hover:text-white'
            }`}
          >
            {lang === 'en' ? 'App Link' : 'অ্যাপ লিঙ্ক'}
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-4 relative z-10 text-xs">
          {activeTab === 'android' && (
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3">
              <h4 className="font-bold text-amber-300 flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                {lang === 'en' ? 'Android (Google Chrome / Edge)' : 'অ্যান্ড্রয়েড (Google Chrome ব্রাউজার)'}
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-emerald-100/90 leading-relaxed font-sans">
                <li>
                  {lang === 'en' ? 'Open Chrome menu by tapping the ' : 'ক্রোম ব্রাউজারের উপরে ডানদিকের '}
                  <strong className="text-white">
                    <MoreVertical className="w-3.5 h-3.5 inline mx-0.5 text-amber-300" /> (৩-ডট মেনু)
                  </strong>{' '}
                  {lang === 'en' ? 'icon' : 'ট্যাপ করুন'}
                </li>
                <li>
                  {lang === 'en' ? 'Select ' : 'মেনু থেকে '}
                  <strong className="text-white">
                    "{lang === 'en' ? 'Install app' : 'ইনস্টল অ্যাপ'}"
                  </strong>{' '}
                  {lang === 'en' ? 'or' : 'বা'}{' '}
                  <strong className="text-white">
                    "{lang === 'en' ? 'Add to Home screen' : 'হোম স্ক্রিনে যোগ করুন'}"
                  </strong>
                </li>
                <li>
                  {lang === 'en'
                    ? 'Tap "Install". The PrepMate app icon will appear in your mobile app drawer!'
                    : '"Install" এ ক্লিক করুন। আপনার ফোনের অ্যাপ ড্রয়ারে আইকন যুক্ত হয়ে যাবে!'}
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3">
              <h4 className="font-bold text-amber-300 flex items-center gap-2">
                <Share className="w-4 h-4" />
                {lang === 'en' ? 'iPhone & iPad (Safari Browser)' : 'আইফোন / আইপ্যাড (Safari ব্রাউজার)'}
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-emerald-100/90 leading-relaxed font-sans">
                <li>
                  {lang === 'en' ? 'Open this link in ' : 'সাফারি ব্রাউজারে লিংকটি ওপেন করে নিচে '}
                  <strong className="text-white">Safari</strong> {lang === 'en' ? 'and tap the ' : 'শেয়ার আইকন '}
                  <Share className="w-3.5 h-3.5 inline mx-0.5 text-amber-300" />
                  {lang === 'en' ? 'Share button' : 'ট্যাপ করুন'}
                </li>
                <li>
                  {lang === 'en' ? 'Scroll down and tap ' : 'নিচে স্ক্রল করে '}
                  <strong className="text-white">
                    <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-amber-300" /> "
                    {lang === 'en' ? 'Add to Home Screen' : 'হোম স্ক্রিনে যোগ করুন'}"
                  </strong>{' '}
                  {lang === 'en' ? 'option' : 'সিলেক্ট করুন'}
                </li>
                <li>
                  {lang === 'en' ? 'Tap ' : 'উপরে ডানদিকে '}
                  <strong className="text-white">"Add"</strong>{' '}
                  {lang === 'en' ? 'in top-right corner' : 'ট্যাপ করুন'}
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'share' && (
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3">
              <p className="text-emerald-200/90 font-medium">
                {lang === 'en'
                  ? 'Copy the live URL or scan on your mobile phone to open instantly:'
                  : 'ফোনে ওপেন করতে নিচের লিঙ্কটি কপি করে মোবাইল ব্রাউজারে পেস্ট করুন:'}
              </p>

              <div className="flex items-center gap-2 bg-black/40 p-2.5 rounded-xl border border-white/15">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="bg-transparent text-[11px] text-amber-300 font-mono w-full focus:outline-none select-all"
                />
                <button
                  onClick={copyUrl}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-[#002b24] font-black rounded-lg text-xs flex items-center gap-1 shrink-0 transition-all"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? (lang === 'en' ? 'Copied' : 'কপি হয়েছে') : (lang === 'en' ? 'Copy' : 'কপি')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-white/10 pt-4 flex items-center justify-between text-[11px] text-emerald-300/80 relative z-10">
          <span>⚡ {lang === 'en' ? 'Works fully offline with cached quizzes' : 'অফলাইনেও কুইজ ক্যাশ প্র্যাকটিস করা যায়'}</span>
          <button
            onClick={onClose}
            className="font-bold text-white hover:text-amber-300 transition-colors"
          >
            {lang === 'en' ? 'Close' : 'বন্ধ করুন'}
          </button>
        </div>
      </div>
    </div>
  );
};
