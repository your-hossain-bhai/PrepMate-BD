import React, { createContext, useContext, useState } from 'react';

export type Language = 'bn' | 'en';

interface Translations {
  [key: string]: {
    bn: string;
    en: string;
  };
}

export const dictionary: Translations = {
  // Landing Page & Website Showcase
  landingHeroBadge: { bn: 'SSC & HSC AI স্মার্ট প্রিপারেশন প্ল্যাটফর্ম', en: 'SSC & HSC AI Board Exam Prep Platform' },
  landingTitle: {
    bn: 'পড়াশোনায় শতভাগ প্রস্তুতি, সেরা বোর্ড রেজাল্টের নিশ্চয়তা!',
    en: 'Master Every Chapter, Score A+ in SSC & HSC Board Exams!',
  },
  landingSubtitle: {
    bn: 'NCTB কারিকুলাম ও ইংলিশ ভার্সনের জন্য কাস্টমাইজড Gemini AI কুইজ ইঞ্জিন, রিয়েল-টাইম বাংলা ব্যাখ্যা, জাতীয় লিডারবোর্ড ও bdapps মোবাইল বিলিং।',
    en: 'Customized Gemini AI quiz engine, bilingual explanations, national leaderboards, and seamless bdapps carrier billing for Robi & Airtel.',
  },
  openWebAppBtn: { bn: 'ওয়েব অ্যাপে প্র্যাকটিস শুরু করুন 🚀', en: 'Practice on Web App 🚀' },
  downloadApkBtn: { bn: 'Android APK ডাউনলোড করুন (v2.4) 📥', en: 'Download Android APK (v2.4) 📥' },
  downloadApkSubtitle: { bn: 'প্লেস্টোর ছাড়াও সরাসরি ওয়েবসাইট থেকে ইনস্টল করুন', en: 'Install directly from website without Play Store' },
  webOrAppChoice: { bn: 'ওয়েবসাইটে প্র্যাকটিস করুন অথবা APK ইনস্টল করুন', en: 'Practice online on browser or install native APK' },
  
  // Landing Page Features
  feature1Title: { bn: 'Gemini AI কুইজ জেনারেটর', en: 'Gemini AI Quiz Generator' },
  feature1Desc: { bn: 'যেকোনো বিষয় ও অধ্যায়ের ওপর তাৎক্ষণিক বোর্ড মানের MCQ কুইজ তৈরি করুন।', en: 'Generate instant board-standard MCQs for any SSC or HSC subject & chapter.' },
  feature2Title: { bn: 'দ্বিভাষিক (বাংলা + ইংলিশ) ব্যাখ্যা', en: 'Bilingual AI Explanations' },
  feature2Desc: { bn: 'ভুল উত্তরের সাথে সাথে ধাপে ধাপে বিস্তারিত ব্যাখ্যা এবং সুত্র বিশ্লেষণ।', en: 'Step-by-step bilingual guidance for incorrect choices with key formulas.' },
  feature3Title: { bn: 'bdapps ক্যারিয়ার বিলিং (২.০০ টাকা/দিন)', en: 'bdapps Carrier Billing (BDT 2.00/day)' },
  feature3Desc: { bn: 'কোনো ক্রেডিট বা ডেবিট কার্ড ছাড়া সরাসরি রবি/এয়ারটেল সিমের ব্যালেন্স দিয়ে সাবস্ক্রিপশন।', en: 'Direct airtime deduction for Robi & Airtel SIM users without any credit card.' },
  feature4Title: { bn: 'স্বচ্ছ ও ১-ক্লিক সাবস্ক্রিপশন বাতিল', en: 'Transparent 1-Click Unsubscribe' },
  feature4Desc: { bn: 'অ্যাপ পছন্দ না হলে বা প্রয়োজন শেষ হলে ১-ক্লিকেই সাবস্ক্রিপশন বন্ধ করার পূর্ণ নিশ্চয়তা।', en: 'Easy 1-click instant unsubscription whenever you want. We strictly respect your choice.' },

  // Testimonials
  testimonialTitle: { bn: 'বাংলাদেশজুড়ে শিক্ষার্থীদের অভিজ্ঞতা', en: 'Trusted by Students Across Bangladesh' },
  testimonial1Name: { bn: 'আরিফুর রহমান, ঢাকা বোর্ড (A+)', en: 'Arifur Rahman, Dhaka Board (GPA 5.00)' },
  testimonial1Text: { bn: 'फिजिक्स ও ম্যাথের কঠিন চ্যাপ্টারগুলো কুইজ দিয়ে প্র্যাকটিস করার পর কনফিডেন্স অনেক বেড়ে গেছে।', en: 'Practicing tough physics and math chapters via AI quizzes gave me ultimate board confidence.' },
  testimonial2Name: { bn: 'নুসরাত জাহান, চট্টগ্রাম বোর্ড (HSC Candidate)', en: 'Nusrat Jahan, Chattogram Board (HSC Candidate)' },
  testimonial2Text: { bn: 'bdapps বিলিং থাকায় বিকাশ/কার্ডের দরকার হয়নি, সিমের ব্যালেন্স দিয়েই সাবস্ক্রাইব করেছি।', en: 'bdapps carrier billing made it super easy to pay using my Robi mobile balance.' },

  // APK Section
  apkSectionTitle: { bn: 'স্মার্টফোনে সরাসরি Android APK ইনস্টল করুন', en: 'Direct Android APK Download' },
  apkSectionDesc: { bn: 'অফলাইন ও ফাস্ট পারফরম্যান্সের জন্য ফোনের ফাইল ম্যানেজার থেকে ৩.৫ মেগাবাইটের APK ইনস্টল করে নিন।', en: 'Download our compact 3.5MB APK for ultra-fast performance on any Android phone.' },
  apkStep1: { bn: '১. "Download APK" বাটনে ক্লিক করুন', en: '1. Click "Download Android APK"' },
  apkStep2: { bn: '২. সেটিংস থেকে "Install from Unknown Sources" অন করুন', en: '2. Enable "Install from Unknown Sources"' },
  apkStep3: { bn: '৩. অ্যাপ ওপেন করে সরাসরি কুইজ প্র্যাকটিস শুরু করুন', en: '3. Open app and start practicing instantly' },

  // Responsive & Multi-device Note
  multiDeviceTitle: { bn: 'পিসি, ট্যাবলেট ও যেকোনো স্মার্টফোনে নিরবচ্ছিন্ন এক্সেস', en: 'Flawless Experience on PC, Tablets & Smartphones' },
  multiDeviceDesc: { bn: 'ওয়েব ব্রাউজার, ল্যাপটপ, ট্যাবলেট বা যেকোনো মোবাইল ডিভাইসে রেসপন্সিভ লেআউট।', en: 'Fully responsive UI tailored for desktop monitors, iPads/tablets, and mobile screens.' },

  // Navigation & Header
  landingPageTab: { bn: 'ওয়েবসাইট / ল্যান্ডিং পেজ', en: 'Website / Home' },
  appName: { bn: 'PrepMate BD', en: 'PrepMate BD' },
  appTagline: {
    bn: 'বাংলাদেশের SSC ও HSC পরীক্ষার্থীদের জন্য AI প্রিপারেশন Platform',
    en: 'AI Board Exam Prep & Community for SSC/HSC in Bangladesh',
  },
  aiQuizTab: { bn: 'এআই কুইজ', en: 'AI Quiz' },
  studyBotTab: { bn: 'এআই স্টাডি বট', en: 'AI Study Bot' },
  plannerTab: { bn: 'স্টাডি প্ল্যানার', en: 'Study Planner' },
  communityTab: { bn: 'কমিউনিটি', en: 'Community' },
  premiumTab: { bn: 'bdapps প্রিমিয়াম', en: 'bdapps Premium' },
  profileTab: { bn: 'প্রোফাইল', en: 'Profile' },
  flutterCodeTab: { bn: 'ফ্লাটার কোড', en: 'Flutter Code' },
  appViewBtn: { bn: 'অ্যাপ ভিউ', en: 'App View' },
  
  // Language & Theme Switcher
  langName: { bn: 'বাংলা', en: 'English' },
  mediumNotice: { bn: 'বাংলা ও ইংলিশ ভার্সন সাপোর্ট', en: 'NCTB English Version & Cambridge Supported' },
  dayTheme: { bn: 'দিন মোড (Day Mode)', en: 'Day Study Mode' },
  nightTheme: { bn: 'রাত মোড (Night Mode)', en: 'Night Study Mode' },

  // Daily Challenge
  dailyChallengeTitle: { bn: 'আজকের ডেইলি চ্যালেঞ্জ', en: 'Today\'s Daily Challenge' },
  dailyChallengeSubtitle: {
    bn: 'প্রতিদিনের নির্বাচিত স্পেশাল কুইজ সমাধান করে জিতে নিন ৫০ বোনাস এক্সপি (Bonus XP)!',
    en: 'Solve today\'s curated challenge question and earn 50 Bonus XP!',
  },
  dailyChallengeCompleted: {
    bn: 'আজকের ডেইলি চ্যালেঞ্জ সম্পন্ন হয়েছে! (+৫০ XP অর্জিত 🎉)',
    en: 'Daily Challenge Completed Today! (+50 XP Earned 🎉)',
  },
  dailyChallengeBtn: { bn: 'ডেইলি চ্যালেঞ্জ শুরু করুন (+৫০ XP)', en: 'Start Daily Challenge (+50 XP)' },
  dailyChallengeBonusText: { bn: '৫০ বোনাস এক্সপি!', en: '50 Bonus XP!' },

  // Quiz Config View
  quizConfigTitle: { bn: 'বোর্ড কুইজ কনফিগারেশন', en: 'Board Quiz Configuration' },
  quizConfigSubtitle: {
    bn: 'NCTB পাঠ্যক্রম অনুযায়ী বাংলা ও ইংরেজিতে উচ্চ-মানের MCQ ও রিয়েল-টাইম ব্যাখ্যা',
    en: 'High-quality MCQs & real-time explanations aligned with NCTB & English Medium',
  },
  examLevelLabel: { bn: 'পরীক্ষার লেভেল', en: 'Exam Level' },
  examGroupLabel: { bn: 'গ্রুপ / শাখা', en: 'Group / Stream' },
  curriculumVersionLabel: { bn: 'কারিকুলাম ভার্সন', en: 'Curriculum Version' },
  curriculumBangla: { bn: 'বাংলা মাধ্যম (NCTB Bangla)', en: 'Bangla Version (NCTB)' },
  curriculumEnglish: { bn: 'ইংলিশ ভার্সন / মিডিয়াম (English Version / Cambridge)', en: 'English Version / Medium' },
  subjectPickerLabel: { bn: 'বিষয় নির্বাচন করুন', en: 'Select Subject' },
  chapterLabel: { bn: 'অধ্যায় / বিষয়বস্তু', en: 'Chapter / Topic' },
  chapterPlaceholder: {
    bn: 'যেমন: ১ম অধ্যায় - ভৌত রাশি ও পরিমাপ',
    en: 'e.g. Chapter 1 - Physical Quantities & Measurements',
  },
  quickSelect: { bn: 'দ্রুত নির্বাচন:', en: 'Quick Select:' },
  questionCountLabel: { bn: 'প্রশ্নের সংখ্যা', en: 'Number of Questions' },
  questionsCountSuffix: { bn: 'টি প্রশ্ন', en: 'Questions' },
  startQuizBtn: { bn: 'কুইজ শুরু করুন', en: 'Start AI Quiz' },
  freeLimitReached: {
    bn: 'আজকের জন্য ১টি ফ্রি কুইজের লিমিট শেষ হয়েছে!',
    en: 'Daily 1 free AI quiz limit reached for free tier!',
  },
  unlockPremiumBtn: {
    bn: 'bdapps দিয়ে মাত্র ২ টাকায় আনলিমিটেড এক্সেস নিন',
    en: 'Unlock Unlimited Access via bdapps at 2.00 BDT/day',
  },

  // Quiz Play View
  questionHeader: { bn: 'প্রশ্ন', en: 'Question' },
  timeRemaining: { bn: 'সময় বাকি:', en: 'Time Remaining:' },
  aiTutorHint: { bn: 'এআই টিউটর ইঙ্গিত (AI Hint)', en: 'AI Tutor Hint' },
  getAiHintBtn: { bn: 'ইঙ্গিত পান (Hint)', en: 'Get AI Hint' },
  submitAnswerBtn: { bn: 'উত্তর জমা দিন', en: 'Submit Answer' },
  nextQuestionBtn: { bn: 'পরবর্তী প্রশ্ন', en: 'Next Question' },
  seeResultsBtn: { bn: 'ফলাফল দেখুন', en: 'See Quiz Results' },

  // Quiz Results View
  quizResultsTitle: { bn: 'কুইজের ফলাফল ও এআই বিশ্লেষণ', en: 'Quiz Performance & AI Breakdown' },
  scoreLabel: { bn: 'আপনার স্কোর', en: 'Your Score' },
  pointsEarned: { bn: 'অর্জিত পয়েন্ট', en: 'Points Earned' },
  correctAnswersCount: { bn: 'সঠিক উত্তর', en: 'Correct' },
  incorrectAnswersCount: { bn: 'ভুল উত্তর', en: 'Incorrect' },
  explanationTitle: { bn: 'বিস্তারিত ব্যাখ্যা ও এআই গাইডেন্স', en: 'Detailed Explanation & AI Guidance' },
  askAiTutorBtn: { bn: 'এআই টিউটরকে বিস্তারিত জিজ্ঞাসা করুন', en: 'Ask AI Tutor for Deep Explanation' },
  retakeQuizBtn: { bn: 'পুনরায় কুইজ দিন', en: 'Take Another Quiz' },
  discussCommunityBtn: { bn: 'কমিউনিটিতে প্রশ্ন শেয়ার করুন', en: 'Discuss in Community' },

  // Leaderboard
  leaderboardTitle: { bn: 'বাংলাদেশ শিক্ষার্থী মেধা তালিকা', en: 'National Student Leaderboard' },
  leaderboardSubtitle: {
    bn: 'SSC ও HSC পরীক্ষার্থীদের কুইজ পয়েন্ট, সলভড চ্যাপ্টার ও কুইজ সংখ্যার র‍্যাঙ্কিং',
    en: 'Rankings based on quiz points, solved chapters, and quizzes completed',
  },
  allCategories: { bn: 'সকল ক্যাটাগরি', en: 'All Categories' },
  topPoints: { bn: 'সর্বোচ্চ পয়েন্ট', en: 'Top Points' },
  topQuizzes: { bn: 'সর্বোচ্চ কুইজ সলভ', en: 'Top Quizzes Solved' },
  topChapters: { bn: 'অধ্যায় পারদর্শিতা', en: 'Chapters Mastered' },
  rankHeader: { bn: 'র‍্যাঙ্ক', en: 'Rank' },
  youBadge: { bn: 'আপনি (YOU)', en: 'YOU' },

  // Community
  communityHeader: { bn: 'বাংলাদেশ শিক্ষা কমিউনিটি', en: 'Bangladesh Education Forum' },
  communitySubtitle: {
    bn: 'দেশজুড়ে SSC ও HSC পরীক্ষার্থীদের সাথে প্রশ্ন শেয়ার করুন ও পড়াশোনায় সাহায্য নিন',
    en: 'Share questions and get peer & AI learning help across Bangladesh',
  },
  postQuestionBtn: { bn: 'প্রশ্ন পোস্ট করুন', en: 'Post a Question' },
  feedTab: { bn: 'প্রশ্ন ও ডিসকাশন', en: 'Questions & Discussions' },
  leaderboardTab: { bn: 'মেধা তালিকা (Leaderboard)', en: 'Student Leaderboard' },
  subjectFilter: { bn: 'ফিল্টার:', en: 'Filter:' },
  filterAll: { bn: 'সব বিষয়', en: 'All Subjects' },
  upvoteBtn: { bn: 'আপভোট', en: 'Upvote' },
  commentsLabel: { bn: 'কমেন্ট', en: 'Comments' },
  addCommentPlaceholder: { bn: 'আপনার উত্তর বা সাহায্য লিখুন...', en: 'Write your solution or comment...' },
  postCommentBtn: { bn: 'কমেন্ট করুন', en: 'Post Comment' },
  newPostTitle: { bn: 'নতুন প্রশ্ন পোস্ট করুন', en: 'Post New Academic Question' },
  questionTitleLabel: { bn: 'প্রশ্নের বিস্তারিত / সমস্যা', en: 'Question Details / Math Problem' },
  cancelBtn: { bn: 'বাতিল', en: 'Cancel' },

  // Subscription (bdapps)
  subscriptionHeader: { bn: 'bdapps ক্যারিয়ার বিলিং সার্ভিস', en: 'bdapps Mobile Carrier Billing' },
  subscriptionSubtitle: {
    bn: 'শুধুমাত্র রবি ও এয়ারটেল (Robi & Airtel) মোবাইল এয়ারটাইম ব্যালেন্স থেকে প্রতিদিন মাত্র ২.০০ টাকা (+VAT)',
    en: 'Direct mobile airtime billing for Robi & Airtel at just BDT 2.00/day (+VAT)',
  },
  selectOperator: { bn: 'আপনার মোবাইল অপারেটর নির্বাচন করুন', en: 'Select Your Mobile Operator' },
  subNowBtn: { bn: 'প্রিমিয়াম সাবস্ক্রাইব করুন (২.০০ টাকা/দিন)', en: 'Subscribe Premium (2.00 BDT/day)' },
  unsubBtn: { bn: 'সাবস্ক্রিপশন বাতিল করুন', en: 'Cancel Subscription' },
  activePlan: { bn: 'প্রিমিয়াম সাবস্ক্রিপশন অ্যাক্টিভ', en: 'Premium Subscription Active' },
  freePlan: { bn: 'ফ্রি প্ল্যান (দৈনিক ১টি কুইজ)', en: 'Free Plan (1 Quiz/day)' },

  // Auth / Profile
  profileHeader: { bn: 'শিক্ষার্থী প্রোফাইল', en: 'Student Profile' },
  phoneNumberLabel: { bn: 'মোবাইল নম্বর', en: 'Mobile Number' },
  phoneOperatorNote: {
    bn: 'শুধুমাত্র রবি ও এয়ারটেল (Robi & Airtel) নম্বর (bdapps সাপোর্টেড)',
    en: 'Robi & Airtel numbers supported (bdapps billing)',
  },
  nameLabel: { bn: 'শিক্ষার্থীর নাম', en: 'Student Name' },
  saveProfileBtn: { bn: 'প্রোফাইল আপডেট করুন', en: 'Save Profile' },
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'bn',
  setLang: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('bn');

  const t = (key: string): string => {
    if (dictionary[key]) {
      return dictionary[key][lang] || dictionary[key]['bn'];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
