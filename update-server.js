const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const importStatement = `import webpush from 'web-push';\n`;

// VAPID keys generated earlier
const webPushSetup = `
// Web Push Setup
webpush.setVapidDetails(
  'mailto:admin@prepmate.bd',
  'BFz0HV2phWwm8H50DDHFJswRAdyyop8qwzgOiQlb1DnIjUKXkh7Av40soHSpIWzj9iA7dmtjNzbt72wjZDr8dB4',
  'A-1U0EJt0K9I_lJ29LfUU-35QVsrnTJh4lC7aKFrlV8'
);

// In-memory store for push subscriptions (in a real app, save this to Firestore)
const pushSubscriptions = new Map();

// Subscribe Endpoint
app.post('/api/push/subscribe', (req, res) => {
  const { subscription, phone } = req.body;
  if (!subscription) {
    return res.status(400).json({ error: 'Subscription object required' });
  }
  
  // Use phone as a key if available, otherwise just use the endpoint URL as unique key
  const key = phone || subscription.endpoint;
  pushSubscriptions.set(key, subscription);
  
  console.log('✅ New Web Push Subscription saved for:', key);
  res.status(201).json({ success: true });
});

// Periodic Cron to trigger daily push notifications (simulating a cron job)
setInterval(() => {
  const now = new Date();
  // To avoid spamming, we only trigger at exactly 20:00 (8:00 PM) 
  // For AI Studio demo, we might want to let the user trigger it from UI, 
  // or we just send one at 20:00 server time.
  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  if (hours === 20 && minutes === 0) {
    // It's 8:00 PM! Send the daily reminder push notification
    const payload = JSON.stringify({
      title: '🔥 আপনার দৈনিক পড়ালেখার স্ট্রিক ধরে রাখুন!',
      body: 'আপনার এসএসসি ও এইচএসসি পরীক্ষার দৈনিক কুইজ চ্যালেঞ্জ প্রস্তুত! আজই এ প্লাস প্রস্তুতি নিশ্চিত করুন। 📚🎯',
      url: '/'
    });
    
    pushSubscriptions.forEach((sub, key) => {
      webpush.sendNotification(sub, payload).catch(err => {
        console.error('Push failed for', key, err);
        if (err.statusCode === 410 || err.statusCode === 404) {
          pushSubscriptions.delete(key);
        }
      });
    });
  }
}, 60000); // check every minute

app.post('/api/push/test', (req, res) => {
  const payload = JSON.stringify({
    title: '🔥 Test Push Notification!',
    body: 'This is a server-side push notification, exactly like Facebook/Instagram!',
    url: '/'
  });
  
  let count = 0;
  pushSubscriptions.forEach((sub, key) => {
    webpush.sendNotification(sub, payload).catch(err => {
      console.error('Push failed for', key, err);
      if (err.statusCode === 410 || err.statusCode === 404) {
        pushSubscriptions.delete(key);
      }
    });
    count++;
  });
  
  res.json({ success: true, count });
});
`;

if (!code.includes('import webpush')) {
  code = code.replace("import dotenv from 'dotenv';", "import dotenv from 'dotenv';\n" + importStatement);
}

if (!code.includes('/api/push/subscribe')) {
  code = code.replace("app.use(express.json({ limit: '20mb' }));", "app.use(express.json({ limit: '20mb' }));\n" + webPushSetup);
}

fs.writeFileSync('server.ts', code);
console.log("server.ts updated with web-push");
