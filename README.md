# Dream Job Coach AI 🎯

An AI-powered career coaching platform that helps students and job seekers prepare for placements at top tech companies. Built with React + Vite (frontend) and Express.js (backend), powered by Google's Gemini AI.

## ✨ Features

- **AI Resume Analyzer** — Upload your resume and get a detailed skill gap analysis with a 6-month personalized roadmap
- **AI Resume Rewriter** — Transform your resume into a professional, ATS-optimized document
- **AI Mock Interview** — Practice with real AI-powered interview questions and get detailed feedback with scores
- **Dashboard** — Visual progress tracking with readiness scores, skill breakdowns, and month-by-month roadmap
- **Authentication** — Secure email/password login and registration

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Radix UI |
| **Backend** | Node.js, Express.js |
| **AI** | Google Gemini 2.5 Flash |
| **Auth** | JWT, bcrypt |

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ installed
- **Gemini API Key** — Get one free from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/dream-job-coach-ai.git
cd dream-job-coach-ai
```

### 2. Setup Backend
```bash
cd server
npm install
cp .env.example .env
```
Edit `server/.env` and paste your Gemini API key:
```
GEMINI_API_KEY=AIzaSy...your_key_here
JWT_SECRET=any_random_long_string
```

### 3. Setup Frontend
```bash
cd ..
npm install
cp .env.example .env
```

### 4. Run the app
**Option A — Use the start script (Windows):**
```bash
start_app.bat
```

**Option B — Manual start:**
```bash
# Terminal 1: Start backend
cd server && node server.js

# Terminal 2: Start frontend
npm run dev
```

### 5. Open in browser
- **Frontend:** http://localhost:8090
- **Backend API:** http://localhost:5000

## 📁 Project Structure

```
dream-job-coach-ai/
├── src/                    # Frontend source code
│   ├── components/         # Reusable UI components
│   ├── context/            # React contexts (Auth, App state)
│   ├── pages/              # Page components
│   │   ├── Welcome.tsx     # Landing page
│   │   ├── Login.tsx       # Login page
│   │   ├── Register.tsx    # Registration page
│   │   ├── Analyze.tsx     # Resume upload & analysis
│   │   ├── Dashboard.tsx   # Results dashboard
│   │   ├── Interview.tsx   # AI mock interview
│   │   └── ResumeRewriter.tsx  # AI resume rewriter
│   ├── App.tsx             # Main app with routing
│   └── main.tsx            # Entry point
├── server/                 # Backend server
│   ├── server.js           # Express server with AI endpoints
│   ├── package.json        # Server dependencies
│   └── .env.example        # Environment variables template
├── public/                 # Static assets
├── index.html              # HTML entry point
├── package.json            # Frontend dependencies
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── start_app.bat           # Windows startup script
```

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Create a new account |
| POST | `/login` | No | Login and get JWT token |
| GET | `/verify-token` | Yes | Verify JWT token |
| POST | `/analyze` | Yes | AI resume analysis |
| POST | `/rewrite-resume` | Yes | AI resume rewriting |
| POST | `/interview` | Yes | AI interview feedback |

## 📝 License

MIT
