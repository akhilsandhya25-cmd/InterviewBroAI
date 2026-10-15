# 🎙️ InterviewBro AI — Complete AI Interview Preparation Platform

> **Practice Smarter. Interview Better. Get Hired.**

InterviewBro AI is a production-oriented AI interview preparation platform designed primarily for Indian college students, fresh engineering graduates, campus placement candidates, and job seekers.

The platform simulates realistic tech interviews with browser-native video rooms, real-time speech-to-text transcription, AI question generation, adaptive follow-ups, resume ATS analysis, and actionable STAR methodology feedback reports.

---

## 🚀 Key Features

### 1. 💼 Indian Company Interview Blueprints & Presets
- **Indian IT & Placement Giants:** Pre-configured tracks for **TCS (NQT, Digital, Prime)**, **Infosys (Specialist Programmer & DSE)**, and **Wipro (Elite & Turbo)**.
- **Product Unicorns & Scaleups:** Tracks for **Flipkart** (machine coding & high concurrency), **Swiggy** (distributed event-driven microservices), and **Zomato** (database scaling & throughput).
- **FAANG & Global MNCs:** **Amazon India** (16 Leadership Principles & Bar Raiser DSA), **Google / Microsoft** (algorithmic excellence & system complexity), and **High-Growth Startups** (full-stack pragmatism).

### 2. 📹 Dedicated Video Interview Room
- **Local Webcam & Mic Controls:** Native browser `MediaStream` and `getUserMedia` integration with zero paid video service dependencies.
- **Privacy & Consent Handling:** Clear consent modals before any local recording; no false claims about detecting emotion or honesty from video feeds.
- **Real-Time Speech-to-Text (STT):** Integrated Web Speech API for voice responses with text fallback.
- **Text-to-Speech (TTS):** Spoken AI interviewer questions with pause and cancel controls.
- **Timer & Question Counter:** Realistic time pressure matching actual placement rounds.

### 3. 🤖 AI Mock Interview Engine & Follow-Up Probing
- **Structured Questions:** Questions tailored to target role, difficulty, experience level, and optional job description / resume text.
- **Adaptive Follow-Up Challenges:** Candidates can challenge themselves with intelligent follow-up questions probing edge cases, scale constraints, and architecture defenses.
- **STAR Methodology Scoring:** Evaluates answers against **Situation, Task, Action, and Result** rubrics.

### 4. 📄 Resume ATS & Project Interrogator
- **PDF & DOCX Extraction:** Secure text parsing via server-side `pdf-parse` and client extractors.
- **Skill Coverage & Gaps:** Compares candidate skills against requirements for their target position.
- **Tailored Project Questions:** Generates realistic interview questions based directly on the candidate's actual projects.

### 5. 📊 Comprehensive STAR Feedback Reports
- Four-pillar grading: **Technical Accuracy**, **Communication Clarity**, **STAR Answer Structure**, and **Relevance**.
- Question-by-question model answer transformations with explanations.
- Actionable 7-day preparation roadmap.

### 6. 🔒 Supabase Authentication & PostgreSQL Database
- Complete PostgreSQL schema with **Row Level Security (RLS)** ensuring users only access their own records.
- Seamless fallback to local-first sandbox mode with browser `localStorage` persistence when offline or before Supabase credentials are configured.

### 7. 🎁 Free Tier & Quota Enforcement
- 5 free full-length mock interviews for new candidates.
- Real-time remaining quota indicators with fair session resumption.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js, Express, TypeScript, tsx, CORS, Multer, pdf-parse |
| **AI Integration** | OpenAI SDK (GPT-4o / GPT-4o-mini) with curated offline fallback bank |
| **Database & Auth** | Supabase (PostgreSQL, Row Level Security, Supabase Auth) |
| **Media APIs** | Browser `MediaDevices`, `MediaRecorder`, Web Speech API (STT & TTS) |

---

## 📂 Project Structure

```
InterviewBroAI/
├── client/                     # Vite + React + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, AuthModal, StatsCard
│   │   ├── context/            # AuthContext (Supabase/local), InterviewContext
│   │   ├── data/               # Indian company presets & fallback question banks
│   │   ├── pages/              # Landing, Dashboard, Setup, Room, Report, Resume, Profile
│   │   ├── services/           # Supabase client, API client, Web Speech API, Storage
│   │   ├── types/              # TypeScript interfaces for sessions, questions, reports
│   │   ├── App.tsx             # Main routing & state coordinator
│   │   ├── index.css           # Tailwind CSS & glassmorphic dark SaaS theme
│   │   └── main.tsx            # React root
│   ├── tailwind.config.js      # Dark theme palette with violet and blue accents
│   └── vite.config.ts          # Vite configuration with proxy to port 5000
│
├── server/                     # Express API Server (safeguards API keys)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── ai.ts           # /api/ai/questions, /evaluate, /follow-up, /final-report
│   │   │   └── resume.ts       # /api/resume/parse with multer memory buffer
│   │   ├── services/
│   │   │   ├── openaiService.ts# GPT-4o-mini structured JSON outputs
│   │   │   └── resumeParser.ts # PDF parsing & ATS heuristic auditing
│   │   └── index.ts            # Express server entry point (Port 5000)
│   ├── tsconfig.json
│   └── package.json
│
├── supabase/
│   └── schema.sql              # PostgreSQL schema with RLS policies, tables & triggers
│
├── .env.example                # Template for environment variables
├── package.json                # Root package.json with concurrently scripts
└── README.md
```

---

## ⚙️ Quick Start Installation

### Prerequisites
- **Node.js** >= v18.0.0 (Tested on Node.js v24.21.0)
- **npm** >= 9.0.0

### Step 1: Install Dependencies
Run the following command in the project root:
```bash
npm run install:all
```
*(Or install in each directory: `npm install`, `cd client && npm install`, `cd ../server && npm install`)*

### Step 2: Configure Environment Variables (Optional)
The platform runs immediately out of the box in local-first demo mode. To connect real AI and cloud database persistence:

1. Copy `.env.example` in `server/`:
```bash
cp server/.env.example server/.env
```
Add your OpenAI key:
```env
PORT=5000
OPENAI_API_KEY=sk-proj-your-openai-api-key
```

2. Copy `.env.example` in `client/`:
```bash
cp client/.env.example client/.env
```
Add your Supabase project credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. If using Supabase, execute `supabase/schema.sql` in the **SQL Editor** of your Supabase dashboard to set up all tables and security policies.

### Step 3: Run Development Servers
From the root directory, run:
```bash
npm run dev
```
This automatically starts:
- **Express Backend:** `http://localhost:5000`
- **Vite Frontend:** `http://localhost:5173` (with `/api` proxy configured)

Open `http://localhost:5173` in your browser.

---

## 🔍 Verification & Testing Status

| Feature | Implementation | Offline Fallback |
|---|---|---|
| **Landing Page** | Fully implemented with honest metrics, FAQs, and pricing | Always active |
| **Dashboard** | Real metrics, radar pillars, recent sessions, and Indian company quick-starts | Populated with realistic sample data in `localStorage` |
| **Personalized Setup** | Role, experience level, company, difficulty, timer, JD & resume hooks | Active |
| **Live Video Room** | Browser `MediaStream` webcam preview, mute toggles, consent banner | Local preview works with any webcam |
| **Speech Recognition** | Browser Web Speech API (`webkitSpeechRecognition`) | Fallback text input provided |
| **Text-to-Speech** | Browser `window.speechSynthesis` | Falls back gracefully if disabled |
| **AI Questions** | Server OpenAI GPT-4o-mini | Tailored placement question bank |
| **STAR Answer Evaluation** | Server OpenAI JSON evaluation | Heuristic structural scoring |
| **Follow-Up Questions** | Dynamic probing challenges | Contextual scale/concurrency challenges |
| **Resume ATS Parser** | Server `pdf-parse` + skill comparison | Regex & skill dictionary matcher |
| **Quota Management** | 5 free sessions per candidate, tracked in database & storage | Enforced |

---

## 🛡️ Security & Privacy Architecture
- **Secret Keys:** `OPENAI_API_KEY` is strictly held on the Express backend; never exposed to frontend code.
- **Media Streams:** Webcam footage is processed purely on the user's browser via native canvas/video elements. No facial or emotion surveillance is performed.
- **Database RLS:** PostgreSQL Row Level Security enforces that users can only select, insert, update, or delete their own sessions and resumes.
