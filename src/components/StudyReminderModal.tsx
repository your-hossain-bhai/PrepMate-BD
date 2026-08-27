import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { useLanguage } from '../LanguageContext';
import { playReminderChime } from '../utils/notificationAudio';
import {
  Bell,
  BellRing,
  Clock,
  Check,
  X,
  Sparkles,
  ShieldAlert,
  Flame,
  Volume2,
  Send,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface StudyReminderModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
}

export const StudyReminderModal: React.FC<StudyReminderModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdateUser,
}) => {
  const { lang } = useLanguage();
  const isEnglish = lang === 'en';

  const [permission, setPermission] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default';
  });

  const [enabled, setEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('prepmate_reminder_enabled');
    return saved !== null ? JSON.parse(saved) : user.reminderEnabled ?? true;
  });

  const [time, setTime] = useState<string>(() => {
    return localStorage.getItem('prepmate_reminder_time') || user.reminderTime || '20:00';
  });

  const [testSent, setTestSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const requestNotificationPermission = async () => {
    setErrorMessage(null);
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setErrorMessage(
        isEnglish
          ? 'Browser Notifications are not supported on this browser/device.'
          : 'আপনার ব্রাউজারে নোটিফিকেশন সুবিধা সমর্থিত নয়।'
      );
      return;
    }

    try {
      playReminderChime();
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === 'granted') {
        setEnabled(true);
        localStorage.setItem('prepmate_reminder_enabled', 'true');
        onUpdateUser({ reminderEnabled: true, reminderTime: time });

        try {
          // Send a celebratory welcome notification immediately
          new Notification(
            isEnglish ? '🔔 Prepmate BD Study Reminder Activated!' : '🔔 প্রেপমেট বিডি ডেইলি রিমাইন্ডার চালু হয়েছে!',
            {
              body: isEnglish
                ? `Great job! You will receive daily reminders at ${time} to complete your ${user.academicLevel} Board Exam challenge!`
                : `অভিনন্দন! প্রতিদিন রাত ${time} টায় আপনার ${user.academicLevel} বোর্ড পরীক্ষা প্রস্তুতির কথা মনে করিয়ে দেওয়া হবে!`,
              icon: '/icon.png',
              tag: 'prepmate-welcome-reminder',
            }
          );
        } catch (notifErr) {
          console.debug('Notification API constructor skipped:', notifErr);
        }
      } else if (res === 'denied') {
        setErrorMessage(
          isEnglish
            ? 'Notification permission was blocked in browser settings. Please allow notifications in your browser location bar to receive reminders.'
            : 'ব্রাউজার সেটিংস থেকে নোটিফিকেশন ব্লক করা হয়েছে। রিমাইন্ডার পেতে ব্রাউজার থেকে নোটিফিকেশন এলাউ করুন।'
        );
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      // Fallback enable inside app even if browser notification throws in iframe
      setEnabled(true);
      localStorage.setItem('prepmate_reminder_enabled', 'true');
      onUpdateUser({ reminderEnabled: true, reminderTime: time });
    }
  };

  const handleToggleEnable = async () => {
    if (!enabled) {
      if (permission !== 'granted' && typeof window !== 'undefined' && 'Notification' in window) {
        await requestNotificationPermission();
      } else {
        playReminderChime();
        setEnabled(true);
        localStorage.setItem('prepmate_reminder_enabled', 'true');
        onUpdateUser({ reminderEnabled: true });
      }
    } else {
      setEnabled(false);
      localStorage.setItem('prepmate_reminder_enabled', 'false');
      onUpdateUser({ reminderEnabled: false });
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    localStorage.setItem('prepmate_reminder_time', newTime);
    onUpdateUser({ reminderTime: newTime });
  };

  const handleSendTestNotification = async () => {
    playReminderChime();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3500);

    if (permission === 'granted' && typeof window !== 'undefined' && 'Notification' in window) {
      try {
        new Notification(
          isEnglish
            ? `🔥 Don't break your ${user.streakDays}-day streak!`
            : `🔥 আপনার ${user.streakDays} দিনের স্টাডি স্ট্রিক ধরে রাখুন!`,
          {
            body: isEnglish
              ? `Your daily ${user.academicLevel} (${user.group || 'Science'}) Board Exam Quiz Challenge is waiting for you at PrepMate BD!`
              : `প্রেপমেট বিডিতে আপনার ${user.academicLevel} (${user.group || 'সাইন্স'}) ডেইলি কুইজ চ্যালেঞ্জ প্রস্তুত! আজই এ প্লাস প্রস্তুতি নিশ্চিত করুন। 📚🎯`,
            tag: 'prepmate-daily-test',
          }
        );
      } catch (err) {
        console.debug('Direct notification failed in iframe sandbox:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#002b24] border border-amber-400/40 text-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-[#002b24] flex items-center justify-center font-black shadow-lg shrink-0">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isEnglish ? 'Daily Study Reminder' : 'ডেইলি স্টাডি রিমাইন্ডার'}</span>
            </div>
            <h3 className="text-lg font-black text-white">
              {isEnglish ? 'Set Daily Practice Alert' : 'দৈনিক পড়ালেখার রিমাইন্ডার সেট করুন'}
            </h3>
          </div>
        </div>

        {/* Streak Incentive Banner */}
        <div className="p-3.5 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-400/30 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div className="text-xs">
            <p className="font-extrabold text-amber-300">
              {isEnglish
                ? `Maintain your ${user.streakDays}-Day Study Streak!`
                : `আপনার ${user.streakDays} দিনের পড়ালেখার স্ট্রিক ধরে রাখুন!`}
            </p>
            <p className="text-emerald-200/80 text-[11px] mt-0.5">
              {isEnglish
                ? 'Get notified daily so you never miss your board exam practice.'
                : 'প্রতিদিন নির্দিষ্ট সময়ে নোটিফিকেশন পেয়ে কুইজ অনুশীলন সম্পন্ন করুন।'}
            </p>
          </div>
        </div>

        {/* Browser Permission Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-200/80 font-bold">
              {isEnglish ? 'Browser Permission Status:' : 'ব্রাউজার পারমিশন স্ট্যাটাস:'}
            </span>
            {permission === 'granted' ? (
              <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-full font-black text-[11px] flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" />
                {isEnglish ? 'Allowed 🔔' : 'অনুমোদিত 🔔'}
              </span>
            ) : permission === 'denied' ? (
              <span className="px-2.5 py-0.5 bg-rose-500/20 border border-rose-400/40 text-rose-300 rounded-full font-black text-[11px] flex items-center gap-1">
                <X className="w-3 h-3 text-rose-400" />
                {isEnglish ? 'Blocked 🚫' : 'ব্লকড 🚫'}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 rounded-full font-black text-[11px] flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-400" />
                {isEnglish ? 'Action Needed ⚡' : 'অনুমতি প্রয়োজন ⚡'}
              </span>
            )}
          </div>

          {permission !== 'granted' && (
            <button
              onClick={requestNotificationPermission}
              className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-[#002b24] font-black rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 uppercase tracking-wider"
            >
              <Bell className="w-4 h-4" />
              <span>
                {isEnglish ? 'Allow Browser Notifications' : 'ব্রাউজার নোটিফিকেশন অ্যালাউ করুন'}
              </span>
            </button>
          )}
        </div>

        {/* Time Picker & Toggle Controls */}
        <div className="p-4 bg-black/40 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-bold text-white">
                {isEnglish ? 'Enable Daily Alert' : 'ডেইলি নোটিফিকেশন চালু রাখুন'}
              </span>
            </div>
            <button
              onClick={handleToggleEnable}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                enabled ? 'bg-amber-400' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-[#002b24] transition-transform ${
                  enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <span className="text-xs text-emerald-200/80 font-bold">
              {isEnglish ? 'Reminder Time:' : 'রিমাইন্ডার সময়:'}
            </span>
            <input
              type="time"
              value={time}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="px-3 py-1.5 bg-[#002b24] border border-amber-400/40 rounded-xl text-amber-300 font-mono font-bold text-sm focus:outline-none"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-500/20 border border-rose-400/40 text-rose-200 rounded-2xl text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSendTestNotification}
            className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
          >
            {testSent ? (
              <>
                <Check className="w-4 h-4" />
                <span>{isEnglish ? 'Sent!' : 'নোটিফিকেশন পাঠানো হয়েছে!'}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{isEnglish ? 'Test Notification Now' : 'টেস্ট নোটিফিকেশন পাঠান'}</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="py-3 px-5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs transition-all"
          >
            {isEnglish ? 'Done' : 'সম্পন্ন'}
          </button>
        </div>
      </div>
    </div>
  );
};
