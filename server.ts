import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Mock database for bdapps subscribers
interface SubscriptionRecord {
  phone: string;
  operator: string;
  isPremium: boolean;
  subscriberId: string;
  subscribedAt: string;
  dailyQuizCount: number;
  lastQuizReset: string;
}

const subscriptionDb = new Map<string, SubscriptionRecord>();

// Pre-fill a demo user
subscriptionDb.set('+8801700000000', {
  phone: '+8801700000000',
  operator: 'Grameenphone',
  isPremium: true,
  subscriberId: 'BDAPPS-GP-98765',
  subscribedAt: new Date().toISOString(),
  dailyQuizCount: 0,
  lastQuizReset: new Date().toDateString(),
});

// Mock SSC/HSC Question Bank Fallback if AI API key is unavailable or fails
const FALLBACK_QUESTIONS: Record<string, any[]> = {
  Physics: [
    {
      id: 'q1',
      question: 'একটি বস্তু ২০ m/s বেগে খাড়া উপরের দিকে নিক্ষিপ্ত হলো। বস্তুটি সর্বোচ্চ কত উচ্চতায় উঠবে? (g = 9.8 m/s²)',
      options: ['10.2 m', '20.4 m', '40.8 m', '9.8 m'],
      correctIndex: 1,
      explanation: 'Bangla: h = v² / (2g) = (20)² / (2 × 9.8) = 400 / 19.6 ≈ 20.41 m.\nEnglish: Maximum height equation h = v² / 2g yields 20.4 meters.',
    },
    {
      id: 'q2',
      question: 'নিউটনের গতির দ্বিতীয় সূত্র থেকে কিসের পরিমাপ পাওয়া যায়?',
      options: ['বল (Force)', 'ভরবেগ (Momentum)', 'ত্বরণ (Acceleration)', 'কাজ (Work)'],
      correctIndex: 0,
      explanation: 'Bangla: নিউটনের ২য় সূত্র (F = ma) থেকে বলের পরিমাণ পরিমাপ করা যায়। ১ম সূত্র থেকে বলের সংজ্ঞায়ন পাওয়া যায়।\nEnglish: Newton\'s 2nd Law gives the quantitative measurement of Force (F=ma).',
    },
    {
      id: 'q3',
      question: 'শব্দ তরঙ্গের কম্পাঙ্ক 500 Hz এবং বেগ 350 m/s হলে তরঙ্গদৈর্ঘ্য (λ) কত?',
      options: ['0.7 m', '1.4 m', '1.75 m', '0.5 m'],
      correctIndex: 0,
      explanation: 'Bangla: λ = v / f = 350 / 500 = 0.7 m.\nEnglish: Wavelength λ = velocity / frequency = 350 / 500 = 0.7m.',
    },
  ],
  ICT: [
    {
      id: 'q1',
      question: 'HTML-এ সবচেয়ে বড় হেডিং ট্যাগের নাম কোনটি?',
      options: ['<h6>', '<h1>', '<head>', '<header>'],
      correctIndex: 1,
      explanation: 'Bangla: <h1> হলো বৃহত্তম হেডিং এবং <h6> হলো ক্ষুদ্রতম হেডিং ট্যাগ।\nEnglish: <h1> defines the largest heading in standard HTML syntax.',
    },
    {
      id: 'q2',
      question: 'C প্রোগ্রামে ডাবল প্রিসিশন ফ্লোটিং পয়েন্টের ফরম্যাট স্পেসিফায়ার কোনটি?',
      options: ['%f', '%d', '%lf', '%c'],
      correctIndex: 2,
      explanation: 'Bangla: float এর জন্য %f এবং double এর জন্য %lf ব্যবহৃত হয়।\nEnglish: %lf is used for double precision floating point variables in C.',
    },
  ],
  Chemistry: [
    {
      id: 'q1',
      question: 'সোডিয়াম নাইট্রেট (NaNO₃) যৌগে নাইট্রোজেনের জারণ সংখ্যা কত?',
      options: ['+3', '+5', '-3', '+1'],
      correctIndex: 1,
      explanation: 'Bangla: Na(+1) + N(x) + O3(3 × -2) = 0 => 1 + x - 6 = 0 => x = +5.\nEnglish: Oxidation state of N in NaNO3 is +5.',
    },
  ],
};

// API: Generate AI Quiz via Gemini
app.post('/api/quiz/generate', async (req, res) => {
  try {
    const { academicLevel, group, subject, chapter, count = 5, language = 'bn', curriculumVersion = 'Bangla' } = req.body;

    if (!subject) {
      return res.status(400).json({ error: 'Subject is required' });
    }

    const isEnglish = language === 'en' || curriculumVersion === 'English';

    if (!ai || !process.env.GEMINI_API_KEY) {
      console.log('Gemini API key missing, returning structured fallback questions.');
      const list = FALLBACK_QUESTIONS[subject] || FALLBACK_QUESTIONS['Physics'];
      // Repeat or select count
      const result = Array.from({ length: Math.min(count, 10) }, (_, i) => {
        const template = list[i % list.length];
        return {
          id: `q-${Date.now()}-${i}`,
          question: isEnglish
            ? (template.questionEn || 'A body of mass m is thrown vertically upwards with velocity 20 m/s. What is the maximum height achieved? (g = 9.8 m/s²)')
            : template.question,
          options: template.options,
          correctIndex: template.correctIndex,
          explanation: template.explanation,
        };
      });
      return res.json({ questions: result, source: 'fallback' });
    }

    const langInstruction = isEnglish
      ? `Write the questions, options, and explanations strictly in ENGLISH. The content should be tailored for English Version (NCTB) and Cambridge/Edexcel O-Level/A-Level students in Bangladesh.`
      : `Write questions in Bangla (or mixed Bangla/English where appropriate for technical terms). Provide explanations in bilingual (Bangla + English).`;

    const prompt = `You are an expert Bangladesh National Curriculum and Textbook Board (NCTB) & Cambridge O/A-Level Exam Question Setter.
Generate exactly ${count} multiple-choice questions (MCQs) for:
- Academic Level: ${academicLevel || 'HSC'}
- Group: ${group || 'Science'}
- Subject: ${subject}
- Chapter/Topic: ${chapter || 'Important Chapter Concepts'}
- Medium/Language: ${isEnglish ? 'English Version / Cambridge English' : 'Bangla Version'}

Requirements:
1. Questions MUST reflect real SSC/HSC Board Exam & Cambridge/Edexcel patterns (mathematical problems, conceptual science questions, ICT syntax).
2. ${langInstruction}
3. Provide exactly 4 options per question.
4. Provide the 0-based index of the correct option.
5. Provide a clear, highly educational explanation showing step-by-step formula solution or memory shortcut.

Return the result STRICTLY as a JSON array adhering to this schema:
[
  {
    "id": "1",
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Detailed step-by-step explanation"
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
            },
            required: ['id', 'question', 'options', 'correctIndex', 'explanation'],
          },
        },
      },
    });

    const jsonText = response.text || '[]';
    const questions = JSON.parse(jsonText);

    return res.json({ questions, source: 'gemini' });
  } catch (err: any) {
    console.error('Error generating quiz:', err);
    // Fallback on error
    const list = FALLBACK_QUESTIONS['Physics'];
    const result = list.map((q, i) => ({
      ...q,
      id: `fallback-${i}`,
    }));
    return res.json({ questions: result, source: 'fallback_error', message: err.message });
  }
});

// API: Ask AI Tutor for Explanation
app.post('/api/tutor/explain', async (req, res) => {
  try {
    const { question, selectedOption, correctOption, subject, academicLevel } = req.body;

    if (!ai || !process.env.GEMINI_API_KEY) {
      return res.json({
        explanation: `💡 **PrepMate AI Tutor Explanation** (Offline Mode):\n\n**Question**: ${question}\n\n**Correct Answer**: ${correctOption}\n\n**Key Concept**: For ${subject} in ${academicLevel}, always verify the fundamental NCTB board formulas. Break down the given values into SI units before applying formulas!`,
      });
    }

    const prompt = `You are PrepMate BD's AI Tutor for Bangladeshi ${academicLevel} board exam students.
Explain why "${correctOption}" is the correct answer for the question below, and why "${selectedOption}" was incorrect.

Question: ${question}
User Picked: ${selectedOption}
Correct Answer: ${correctOption}
Subject: ${subject}

Provide a encouraging, clear, and structured bilingual (Bangla + English) explanation with:
1. 🎯 Direct Answer & Core Concept
2. 📐 Step-by-Step Calculation / Logic
3. 📌 Pro-Tip for SSC/HSC Board Exams`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    return res.json({ explanation: response.text });
  } catch (err: any) {
    return res.json({
      explanation: `AI Tutor response temporarily generated offline. Please review your textbook formulas for ${req.body.subject}.`,
    });
  }
});

// API: bdapps Carrier Billing - Subscribe Endpoint
app.post('/api/bdapps/subscribe', (req, res) => {
  const { phone, operator } = req.body;

  if (!phone || !phone.match(/^\+8801[3-9]\d{8}$/)) {
    return res.status(400).json({
      status: 'FAILED',
      statusCode: 'E1001',
      message: 'Invalid Bangladeshi phone number format. Must be +8801XXXXXXXXX',
    });
  }

  const subscriberId = `BDAPPS-${operator.substring(0, 2).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;

  const record: SubscriptionRecord = {
    phone,
    operator: operator || 'Grameenphone',
    isPremium: true,
    subscriberId,
    subscribedAt: new Date().toISOString(),
    dailyQuizCount: 0,
    lastQuizReset: new Date().toDateString(),
  };

  subscriptionDb.set(phone, record);

  return res.json({
    status: 'SUCCESS',
    statusCode: 'S1000',
    message: 'bdapps Carrier Billing request processed successfully.',
    data: {
      subscriberId,
      phone,
      operator: record.operator,
      chargingAmount: 'BDT 2.00',
      frequency: 'Daily Recurring',
      vatNote: '+ 15% VAT + 15% SD + 1% Surcharge',
      isPremium: true,
    },
  });
});

// API: bdapps Carrier Billing - Unsubscribe Endpoint
app.post('/api/bdapps/unsubscribe', (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ status: 'FAILED', message: 'Phone required' });
  }

  const existing = subscriptionDb.get(phone);
  if (existing) {
    existing.isPremium = false;
    subscriptionDb.set(phone, existing);
  }

  return res.json({
    status: 'SUCCESS',
    statusCode: 'S1001',
    message: 'Unsubscribed from PrepMate BD Premium service via bdapps.',
    data: {
      phone,
      isPremium: false,
    },
  });
});

// API: bdapps Status Check
app.get('/api/bdapps/status', (req, res) => {
  const phone = req.query.phone as string;
  const record = subscriptionDb.get(phone);

  if (!record) {
    return res.json({
      status: 'SUCCESS',
      isPremium: false,
      dailyQuizCount: 0,
      dailyLimit: 1,
      message: 'Free Plan - 1 AI Quiz per day.',
    });
  }

  return res.json({
    status: 'SUCCESS',
    isPremium: record.isPremium,
    subscriberId: record.subscriberId,
    operator: record.operator,
    dailyQuizCount: record.dailyQuizCount,
    dailyLimit: record.isPremium ? 999 : 1,
    message: record.isPremium ? 'bdapps Active Premium Subscription' : 'Free Plan',
  });
});

// Serve frontend in production or Vite middleware in dev
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 PrepMate BD Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
