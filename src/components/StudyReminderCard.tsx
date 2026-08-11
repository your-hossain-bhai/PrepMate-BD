import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { useLanguage } from '../LanguageContext';
import {
  Bell,
  BellRing,
  Clock,
  Check,
  Sparkles,
  Flame,
  Send,
  AlertCircle,
} from 'lucide-react';

interface StudyReminderCardProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onOpenModal?: () => void;
}

export const StudyReminderCard: React.FC<StudyReminderCardProps> = ({
  user,
  onUpdateUser,
  onOpenModal,
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

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleToggleEnable = async () => {
    if (!enabled) {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const res = await Notification.requestPermission();
        setPermission(res);
        if (res === 'granted') {
          setEnabled(true);
          localStorage.setItem('prepmate_reminder_enabled', 'true');
          onUpdateUser({ reminderEnabled: true });
        }
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

  const handleTestNotification = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (Notification.permission !== 'granted') {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res !== 'granted') return;
    }

    try {
      new Notification(
        isEnglish
          ? `🔥 Keep your ${user.streakDays}-Day Study Streak Active!`
          : `🔥 আপনার ${user.streakDays} দিনের স্টাডি স্ট্রিক ধরে রাখুন!`,
        {
          body: isEnglish
            ? `It's time for your daily SSC/HSC Board Exam practice! Complete today's challenge on PrepMate BD.`
            : `আপনার এসএসসি ও এইচএসসি পরীক্ষার দৈনিক কুইজ চ্যালেঞ্জ প্রস্তুত! আজই এ প্লাস প্রস্তুতি নিশ্চিত করুন। 📚🎯`,
          icon: '/icon.png',
          tag: 'prepmate-daily-reminder',
        }
      );
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } catch (err) {
      console.error('Test notification error:', err);
    }
  };

  return (
    <div className="p-5 bg-gradient-to-r from-[#00332a] via-[#002b24] to-[#00382d] rounded-3xl border border-amber-400/30 text-white shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-[#002b24] flex items-center justify-center font-black shadow-md shrink-0">
            <BellRing className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-300 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{isEnglish ? 'Daily Study Reminders' : 'ডেইলি স্টাডি নোটিফিকেশন'}</span>
            </div>
            <h4 className="text-sm font-black text-white">
              {isEnglish
                ? 'Get Notified for Daily Board Challenge'
                : 'বোর্ড পরীক্ষা প্রস্তুতির কথা মনে করিয়ে দেওয়ার নোটিফিকেশন'}
            </h4>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs font-bold text-emerald-200/80">
            {enabled ? (isEnglish ? 'ON' : 'চালু') : (isEnglish ? 'OFF' : 'বন্ধ')}
          </span>
          <button
            onClick={handleToggleEnable}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              enabled ? 'bg-amber-400' : 'bg-white/20'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-[#002b24] transition-transform ${
                enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Details Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-black/30 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs font-bold text-emerald-100">
            {isEnglish
              ? `Daily Streak Goal: ${user.streakDays} Days Active`
              : `ডেইলি কুইজ স্ট্রিক: ${user.streakDays} দিন সক্রিয়`}
          </span>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Clock className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="text-xs font-bold text-white">
            {isEnglish ? 'Time:' : 'সময়:'}
          </span>
          <input
            type="time"
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="px-2.5 py-1 bg-[#002b24] border border-amber-400/40 rounded-xl text-amber-300 font-mono font-extrabold text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Test & Manage Controls */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          onClick={handleTestNotification}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
        >
          {testSent ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>{isEnglish ? 'Sent!' : 'পাঠানো হয়েছে!'}</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>{isEnglish ? 'Test Notification' : 'টেস্ট নোটিফিকেশন পাঠাও'}</span>
            </>
          )}
        </button>

        {onOpenModal && (
          <button
            onClick={onOpenModal}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1"
          >
            <Bell className="w-3.5 h-3.5 text-amber-300" />
            <span>{isEnglish ? 'Settings' : 'সেটিংস'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
