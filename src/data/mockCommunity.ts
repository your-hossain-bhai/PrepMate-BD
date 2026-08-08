import { CommunityPost } from '../types';

export const INITIAL_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    author: 'Tanvir Hossain (Dhaka College)',
    level: 'HSC',
    subject: 'Physics 1st Paper',
    questionText: 'একটি বস্তু ২০ m/s বেগে খাড়া উপরের দিকে নিক্ষিপ্ত হলো। বস্তুটি সর্বোচ্চ কত উচ্চতায় উঠবে এবং ৪ সেকেন্ড পর এর বেগ কত হবে?',
    timestamp: '১০ মিনিট আগে',
    upvotes: 24,
    userUpvoted: false,
    comments: [
      {
        id: 'c-1',
        author: 'PrepMate AI Tutor 🤖',
        text: '💡 **সমাধান**:\n1) সর্বোচ্চ উচ্চতা $h = \\frac{v_0^2}{2g} = \\frac{20^2}{2 \\times 9.8} = 20.41$ মিটার।\n2) ৪ সেকেন্ড পর বেগ $v = v_0 - gt = 20 - (9.8 \\times 4) = -19.2$ m/s (ঋণাত্মক চিহ্ন নির্দেশ করে বস্তুটি এখন নিচের দিকে পড়ছে)।',
        isAiTutor: true,
        timestamp: '৮ মিনিট আগে',
      },
      {
        id: 'c-2',
        author: 'Nadia Rahman (NDC)',
        text: 'ধন্যবাদ ভাইয়া! গতির সমীকরণ $v = u - gt$ ব্যবহার করলে ৪ সেকেন্ড পর -১৯.২ m/s আসে!',
        timestamp: '৫ মিনিট আগে',
      },
    ],
  },
  {
    id: 'post-2',
    author: 'Sabbir Ahmed (Chittagong Govt. College)',
    level: 'HSC',
    subject: 'ICT',
    questionText: 'C প্রোগ্রামে `int a = 5, b = 2; float c = a / b;` লিখলে `c` এর মান ২.০ আসবে নাকি ২.৫ আসবে? কেউ একটু বুঝিয়ে বলবেন?',
    timestamp: '১ ঘণ্টা আগে',
    upvotes: 18,
    userUpvoted: true,
    comments: [
      {
        id: 'c-3',
        author: 'PrepMate AI Tutor 🤖',
        text: '📌 **ICT Pro Tip**:\nC ভাষায় integer দিয়ে integer ভাগ করলে টাইপ কাস্টিং ছাড়া পূর্ণসংখ্যা পাওয়া যায়। তাই `5 / 2 = 2` হবে। এরপর `float` টাইপে অ্যাসাইন হলে মান হবে **2.000000**।\n২.৫ পেতে চাইলে লিখুন: `float c = (float)a / b;`',
        isAiTutor: true,
        timestamp: '৫৫ মিনিট আগে',
      },
    ],
  },
  {
    id: 'post-3',
    author: 'Mehedi Hasan (Viqarunnisa Noon School)',
    level: 'SSC',
    subject: 'Chemistry',
    questionText: 'সোডিয়াম ক্লোরাইড (NaCl) কেন পানিতে দ্রবীভূত হয় কিন্তু কেরোসিনে দ্রবীভূত হয় না?',
    timestamp: '৩ ঘণ্টা আগে',
    upvotes: 12,
    comments: [
      {
        id: 'c-4',
        author: 'Anika Tabassum (Holy Cross)',
        text: 'পানি একটি পোলার দ্রাবক ($H_2O$ তে আংশিক ধনাত্মক ও ঋণাত্মক চার্জ আছে)। আয়নিল যৌগ NaCl পানির পোলারিটির সাথে ইন্টারঅ্যাক্ট করে। কেরোসিন অপোলার তাই দ্রবীভূত হয় না।',
        timestamp: '২ ঘণ্টা আগে',
      },
    ],
  },
];
