const fs = require('fs');
let code = fs.readFileSync('src/components/StudyReminderModal.tsx', 'utf8');

const subscribeToPush = `
  const subscribeToPushNotifications = async () => {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'BFz0HV2phWwm8H50DDHFJswRAdyyop8qwzgOiQlb1DnIjUKXkh7Av40soHSpIWzj9iA7dmtjNzbt72wjZDr8dB4'
        });
        
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription, phone: user.phone || 'anonymous' })
        });
        
        console.log('✅ Web Push Subscription successful!');
      }
    } catch (err) {
      console.error('Failed to subscribe to Web Push:', err);
    }
  };
`;

if (!code.includes('subscribeToPushNotifications')) {
  // Insert before handleToggleEnable
  code = code.replace("const handleToggleEnable = () => {", subscribeToPush + "\n  const handleToggleEnable = () => {");
}

const reqPermission = `
  const requestNotificationPermission = async () => {
    try {
      if (!('Notification' in window)) {
        setErrorMessage(isEnglish ? 'Browser does not support notifications.' : 'ব্রাউজার নোটিফিকেশন সাপোর্ট করে না।');
        return;
      }

      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        setErrorMessage(null);
        await subscribeToPushNotifications(); // Subscribe to Server Push when granted
        new Notification(
          isEnglish ? 'Notifications Allowed! 🎉' : 'নোটিফিকেশন চালু হয়েছে! 🎉',
          {
            body: isEnglish ? 'You will now receive daily study reminders.' : 'এখন থেকে আপনি প্রতিদিন রিমাইন্ডার পাবেন।',
            icon: '/icon.png',
          }
        );
      } else {
        setErrorMessage(
          isEnglish
            ? 'Permission denied. Please allow notifications from site settings.'
            : 'পারমিশন দেওয়া হয়নি। দয়া করে ব্রাউজার সেটিংস থেকে নোটিফিকেশন অ্যালাউ করুন।'
        );
      }
    } catch (err) {
      console.error('Failed to request permission', err);
    }
  };
`;

if (!code.includes('await subscribeToPushNotifications')) {
  // Replace requestNotificationPermission
  code = code.replace(/const requestNotificationPermission = async \(\) => \{[\s\S]*?\};/m, reqPermission);
}

const newSendTest = `
  const handleSendTestNotification = async () => {
    // Attempt Server Push (like Facebook/Instagram)
    try {
      await fetch('/api/push/test', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };
`;

if (!code.includes('/api/push/test')) {
  code = code.replace(/const handleSendTestNotification = async \(\) => \{[\s\S]*?\};/m, newSendTest);
}

fs.writeFileSync('src/components/StudyReminderModal.tsx', code);
console.log("Modal updated");
