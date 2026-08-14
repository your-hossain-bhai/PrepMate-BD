# PrepMate BD (প্রেপমেট বিডি)
### AI-Powered SSC & HSC Board Exam Preparation, Community & Carrier-Billing Platform

PrepMate BD is a specialized, bilingual (Bangla + English) educational platform designed specifically for Secondary School Certificate (SSC, Class 9–10) and Higher Secondary Certificate (HSC, Class 11–12) students in Bangladesh following the NCTB curriculum and Cambridge/Edexcel O/A-Levels.

---

## 📑 Table of Contents
1. [Architecture Overview](#-architecture-overview)
2. [Pinpoint Component Breakdown](#-pinpoint-component-breakdown)
   - [React / TypeScript Web & Preview App](#1-react--typescript-web--preview-app)
   - [Flutter Mobile Codebase Structure](#2-flutter-mobile-codebase-structure)
   - [PHP / MySQL & BDapps Backend](#3-php--mysql--bdapps-backend)
3. [AI Engine & Guardrail System](#-ai-engine--guardrail-system)
4. [Monetization & Payment Gateways](#-monetization--payment-gateways)
5. [Offline-First & Local Caching Engine](#-offline-first--local-caching-engine)
6. [API Route Specifications](#-api-route-specifications)
7. [Installation & Deployment Guide](#-installation--deployment-guide)

---

## 🏛 Architecture Overview

PrepMate BD operates across a triad architecture:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT PLATFORMS                                │
│                                                                             │
│   ┌─────────────────────────────┐       ┌───────────────────────────────┐   │
│   │   React 18 + Vite (SPA)     │       │   Flutter 3.x (Cross-Platform)│   │
│   │   - Tailwind CSS            │       │   - Provider State Management │   │
│   │   - Lucide Icons            │       │   - SharedPreferences Cache   │   │
│   │   - Web Audio & LocalStorage│       │   - Local Notifications       │   │
│   └──────────────┬──────────────┘       └──────────────┬────────────────┘   │
└──────────────────┼─────────────────────────────────────┼────────────────────┘
                   │                                     │
                   ▼                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             BACKEND SERVICES                                │
│                                                                             │
│   ┌─────────────────────────────┐       ┌───────────────────────────────┐   │
│   │  Node.js / Express Server   │       │   PHP 8.x + MySQL Backend     │   │
│   │  - Google GenAI (Gemini 3.6)│       │   - BDapps Telco VAS Billing  │   │
│   │  - Strict Focus Guardrails  │       │   - bKash / Nagad TrxID Engine│   │
│   │  - Multimodal Board Tutor   │       │   - MySQL Subscription Tables │   │
│   └─────────────────────────────┘       └───────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Pinpoint Component Breakdown

### 1. React / TypeScript Web & Preview App

#### Core Contexts & State
- **`src/LanguageContext.tsx`**: Manages global language toggle between Bangla (`bn`) and English (`en`). Exposes `t(bnText, enText)` translation helper to eliminate hardcoded language dependencies across views.
- **`src/ThemeContext.tsx`**: Controls Dark Mode vs. Daytime high-contrast study themes (`#00231D` vs. crisp study mode) with seamless state retention in `localStorage`.
- **`src/types.ts`**: Strict TypeScript interfaces defining `AcademicLevel` ('SSC' | 'HSC'), `AcademicGroup` ('Science' | 'Commerce' | 'Humanities'), `UserProfile`, `QuizQuestion`, `QuizHistoryRecord`, `StudySlot`, and `CommunityPost`.

#### Views & Subcomponents (`src/components/`)
- **`AuthView.tsx`**: Student profile setup & onboarding. Captures phone number, board exam year, academic level, study group, and initializes starting XP and streak count.
- **`QuizConfigView.tsx`**: Interactive exam configuration selector. Provides NCTB subject pickers (Physics, Chemistry, Higher Math, ICT, Biology, Accounting, etc.), chapter selectors, question quantity slider (5–20), and exam duration limits.
- **`QuizPlayView.tsx`**: High-stakes interactive MCQ runner featuring:
  - Real-time countdown timer with color transitions.
  - Option selection with immediate visual feedback (Emerald green for correct, Rose red for incorrect).
  - Web Audio sound effects synthesizer (distinct frequencies for correct vs. incorrect answers).
  - Streak progress tracker and active question pagination.
- **`QuizResultsView.tsx`**: Post-exam diagnostic breakdown showing overall percentage, earned XP, per-question analysis, and direct "Ask AI Tutor" deep-dive triggers.
- **`StudyBotView.tsx`**: Multimodal AI Study Assistant (`PrepMate FocusBot`):
  - Multimodal support: Paste or upload photos of textbook equations, whiteboard sketches, or past board questions.
  - Strict Academic Guardrails: Rejects non-academic entertainment queries (movies, games, celebrity gossip) and redirects back to exam preparation.
  - Banglish auto-converter: Automatically detects phonetically typed Bangla and responds in clean Bengali script.
- **`StudyPlannerView.tsx`**: Weekly study routine matrix divided by days (Sat–Fri) and slots (Morning, Afternoon, Evening, Night) with task completion tracking and local persistence.
- **`StudyReminderModal.tsx` & `StudyReminderCard.tsx`**: Daily study alarm scheduler with time-picker modal, audio alert simulation, and push notification triggers.
- **`CommunityFeedView.tsx`**: Student Q&A discussion board where students post challenging exam problems, upvote helpful solutions, and request AI Tutor verified answers.
- **`Leaderboard.tsx`**: Top performers ranking sorted by weekly XP, streak consistency, and board exam targets.
- **`SubscriptionView.tsx`**: Dual billing portal supporting BDapps airtime carrier billing (BDT 2.00/day for Robi/Airtel/Banglalink) and mobile financial services (bKash & Nagad) with transaction ID validation.
- **`src/website/LandingPageView.tsx`**: Landing showcase illustrating app benefits, NCTB curriculum alignment, testimonial badges, and download links.
- **`src/flutter_project/FlutterCodeExplorer.tsx`**: Interactive multi-tab code visualizer allowing direct inspection, syntax copying, and single-click download of all Flutter & PHP backend source files.

---

### 2. Flutter Mobile Codebase Structure

Located in `src/data/flutterCodebase.ts` and prepared for direct output into `prepmate_bd/`:

- **`pubspec.yaml`**: Pre-configured with dependencies:
  - `provider: ^6.1.1` (State management)
  - `http: ^1.2.0` (REST API communication)
  - `shared_preferences: ^2.2.2` (Local key-value store & offline caching)
  - `flutter_local_notifications: ^17.0.0` (Daily study reminder alarms)
  - `timezone: ^0.9.2` (Exact timezone calculation for alarm scheduling)
  - `google_fonts: ^6.1.0` (Hind Siliguri & Inter font rendering)
- **`lib/main.dart`**: Application entry point initializing Local Notifications, SharedPreferences, and the Provider state tree.
- **`lib/models/user_model.dart`**: Dart data model parsing and serializing `UserProfile` (name, academicLevel, group, xp, streak, isPremium, reminderTime).
- **`lib/models/quiz_model.dart`**: Dart data model handling `QuizQuestion` (id, question, options, correctIndex, explanation).
- **`lib/services/api_service.dart`**: HTTP service proxying quiz generation and subscription verification to the live PHP backend endpoints.
- **`lib/services/notification_service.dart`**: Notification daemon managing daily recurring study reminders (`prepmate_daily_reminder` channel) with high priority and vibration alerts.

---

### 3. PHP / MySQL & BDapps Backend

- **`php_backend/config.php`**: Database connector establishing `mysqli` connection with standard JSON UTF-8 headers and cross-origin resource sharing (CORS) preflight support.
- **`php_backend/database.sql`**: Complete database schema declaring:
  - `users`: ID, phone, name, academic level, premium status, expiration timestamp.
  - `subscriptions`: ID, phone, transaction ID (unique constraint), payment method, plan, amount, and approval status.
- **`php_backend/verify_subscription.php`**: Backend handler for bKash & Nagad payments. Prevents replay attacks by checking for duplicate `trx_id`, logs the transaction, and sets user status to premium for 30 or 365 days.
- **`php_backend/bdapps/`**: Telecom VAS subfolder for carrier billing:
  - `subscription.php`: Initiates USSD / SMS charging API call to Robi/Airtel BDapps core.
  - `notify.php`: Server-to-server webhook endpoint listening for recurring charging renewals and subscription opt-outs.

---

## 🤖 AI Engine & Guardrail System

The application connects to Google's **Gemini 3.6 Flash** model via `@google/genai` on the server:

1. **System Prompt Enforcement (`server.ts`)**:
   - Acts as a dedicated NCTB Bangladesh board question setter and senior tutor.
   - Enforces strict JSON Schema generation for MCQs (4 options, correct index, bilingual step-by-step logic).
2. **Academic Focus Guardrails**:
   - Evaluates incoming prompts against off-topic keyword filters (entertainment, celebrity gossip, gaming, politics).
   - If an off-topic question is detected, it politely declines and redirects the student to their board exam subjects.
3. **Banglish Auto-Converter**:
   - Detects Latin-transliterated Bengali (`ami kivabe physics a+ pabo`) and automatically answers in standard Bengali script (`বাংলা লিপি`).

---

## 💳 Monetization & Payment Gateways

PrepMate BD incorporates two monetization channels tailored to Bangladesh:

1. **BDapps Telco Carrier Billing**:
   - Operator integration: Robi, Airtel, Banglalink.
   - Micro-billing rate: BDT 2.00 / day (+ VAT, SD, SC).
   - Charged directly to the student's prepaid SIM balance.
2. **Mobile Financial Services (MFS)**:
   - Methods: bKash, Nagad, Rocket.
   - Packages: Monthly Exam Booster (BDT 99) and Yearly Board Pass (BDT 499).
   - Manual & Automated TrxID verification with duplicate submission rejection.

---

## 📶 Offline-First & Local Caching Engine

PrepMate BD is designed for low-connectivity environments:
- **`src/utils/offlineCache.ts`**:
  - Automatically caches the latest generated quiz sets by subject and chapter.
  - Saves in-flight quiz attempts so interrupted sessions resume without question loss.
  - Ships with built-in emergency offline question banks for HSC Physics, Chemistry, ICT, and SSC General Math.

---

## 🌐 API Route Specifications

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/quiz/generate` | Generates NCTB board exam MCQs via Gemini AI with fallback |
| `POST` | `/api/tutor/explain` | Explains wrong answers step-by-step in bilingual format |
| `POST` | `/api/study-bot/chat` | Multimodal tutor chat with image uploads and guardrails |
| `POST` | `/api/bdapps/subscribe` | Triggers Robi/Airtel BDapps carrier billing subscription |
| `POST` | `/api/bdapps/unsubscribe`| Cancels BDapps carrier billing subscription |
| `GET` | `/api/bdapps/status` | Checks active subscription plan and remaining daily limits |

---

## 🚀 Installation & Deployment Guide

### Running the Web Application
```bash
# 1. Install dependencies
npm install

# 2. Add your Gemini API key in .env
echo "GEMINI_API_KEY=your_key_here" >> .env

# 3. Start development server (port 3000)
npm run dev

# 4. Build production bundle
npm run build
```

### Running the Flutter Mobile App (`prepmate_bd`)
```bash
# 1. Navigate to Flutter project
cd prepmate_bd

# 2. Fetch packages
flutter pub get

# 3. Launch on connected Android device / emulator
flutter run
```

### Deploying the PHP Backend
1. Create a MySQL database in cPanel / phpMyAdmin and import `php_backend/database.sql`.
2. Update database credentials in `php_backend/config.php`.
3. Upload `php_backend/` to your web server `public_html/api/`.
4. Point `lib/services/api_service.dart` to `https://yourdomain.com/api`.
