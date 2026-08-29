import { useEffect } from 'react';
import { UserProfile } from '../types';
import { playReminderChime } from '../utils/notificationAudio';

export function useDailyReminder(user: UserProfile, lang: 'bn' | 'en') {
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    const checkAndFireReminder = () => {
      // 1. Check notification permission
      if (Notification.permission !== 'granted') {
        return;
      }

      // 2. Read enabled status & time from localStorage or user profile fallback
      const savedEnabled = localStorage.getItem('prepmate_reminder_enabled');
      const isEnabled = savedEnabled !== null ? savedEnabled === 'true' : (user.reminderEnabled ?? true);
      if (!isEnabled) {
        return;
      }

      const savedTime = localStorage.getItem('prepmate_reminder_time') || user.reminderTime || '20:00';

      // 3. Format current local time as HH:mm
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeString = `${currentHours}:${currentMinutes}`;

      if (currentTimeString !== savedTime) {
        return;
      }

      // 4. Check if already fired today (YYYY-MM-DD)
      const todayDateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const lastFiredDate = localStorage.getItem('prepmate_reminder_last_fired');

      if (lastFiredDate === todayDateString) {
        return;
      }

      // 5. Fire daily reminder notification
      try {
        const isEnglish = lang === 'en';
        const streak = user.streakDays || 1;
        const title = isEnglish
          ? `🔥 Keep your ${streak}-Day Study Streak Active!`
          : `🔥 আপনার ${streak} দিনের স্টাডি স্ট্রিক ধরে রাখুন!`;
        const body = isEnglish
          ? `It's time for your daily SSC/HSC Board Exam practice! Complete today's challenge on PrepMate BD.`
          : `আপনার এসএসসি ও এইচএসসি পরীক্ষার দৈনিক কুইজ চ্যালেঞ্জ প্রস্তুত! আজই এ প্লাস প্রস্তুতি নিশ্চিত করুন। 📚🎯`;

        new Notification(title, {
          body,
          icon: '/icon.png',
          tag: 'prepmate-daily-reminder',
        });

        try {
          playReminderChime();
        } catch {
          // Silent chime fallback
        }

        localStorage.setItem('prepmate_reminder_last_fired', todayDateString);
      } catch (err) {
        console.error('Daily reminder notification failed:', err);
      }
    };

    // Check once immediately on load/mount
    checkAndFireReminder();

    // Check once every 60 seconds (1 minute interval)
    const intervalId = setInterval(checkAndFireReminder, 60000);

    return () => clearInterval(intervalId);
  }, [user.reminderEnabled, user.reminderTime, user.streakDays, lang]);
}
