<div align="center">

# 🚀 JobCoach AI - The Future of Career Prep
**An Intelligent, End-to-End Career Coaching Platform Powered by LLaMA 3**

[![React](https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Groq API](https://img.shields.io/badge/AI-Groq_Llama3-FF4500?style=for-the-badge)](https://groq.com/)

[**Live Demo (Frontend)**](https://dream-job-coach.vercel.app/) • [**Backend API**](https://dream-job-coach.onrender.com)

</div>

<br />

## 🌟All about the project!

In today's hyper-competitive job market, thousands of talented candidates are rejected not because they lack skills, but because they lack **access to professional career coaching**, **ATS-optimized resumes**, and **proper interview practice**. Professional career coaches charge hundreds of dollars an hour, making quality preparation completely inaccessible to the average student or job seeker.

**JobCoach AI** democratizes career preparation. By leveraging cutting-edge, ultra-fast LLMs (Llama-3 via Groq), this platform provides **free, personalized, and instantaneous** career coaching. It transforms raw PDFs into actionable insights, generates custom study roadmaps, rewrites resumes to pass ATS filters, and conducts dynamically generated, company-specific technical mock interviews. 

**This is a high-impact, market-ready solution that solves a massive real-world problem for millions of job seekers.**

---

## ✨ Core Innovations & Features

### 📄 1. Intelligent PDF Resume Parsing & Benchmarking
Unlike standard text extractors, our system parses raw PDF resumes and uses AI to map existing skills against the specific requirements of the user's **Target Company** (e.g., Google, Amazon, AMD). 
- **Readiness Score (0-100)** to give instant reality checks.
- **Skill Gap Analysis** (Strong, Weak, and Missing critical skills).

### 🗺️ 2. Dynamic 6-Month Preparation Roadmap
Generates a highly personalized, month-by-month actionable study plan. It doesn't just tell candidates what they are missing—it provides curated, real-world **Learning Resources** (courses, YouTube playlists, GitHub repos) to fill those exact gaps.

### ✍️ 3. ATS-Optimized Resume Rewriting
Leverages advanced prompt engineering to completely rewrite the user's resume. It converts passive statements into high-impact, quantifiable achievements using the **STAR Method** (Situation, Task, Action, Result), maximizing the chances of bypassing automated ATS parsers.

### 🎤 4. AI Technical Mock Interviewer
Taking interview prep to the next level. Instead of static question banks, JobCoach AI dynamically generates a **completely unique set of questions** specific to the target company, role, and the candidate's exact skill set.
- Evaluates the user's typed answers in real-time.
- Provides immediate feedback: **Score (1-10)**, **Strengths**, **Areas to Improve**, and an **Industry Pro-Tip**.

### 📱 5. Stunning, Accessible UI/UX
Built with a dark-mode first, glassmorphic design system using **Tailwind CSS** and **Framer Motion**. It provides a frictionless, premium experience comparable to high-end SaaS products.

---

## 🛠️ Technology Architecture

### Frontend Layer (The Experience)
- **Framework:** React 18 + Vite (for lightning-fast HMR and optimized builds)
- **Styling & Animations:** Tailwind CSS, Framer Motion, Radix UI Primitives
- **Data Visualization:** Recharts (for progress tracking)
- **Routing:** React Router v6

### Backend Layer (The Engine)
- **Runtime:** Node.js + Express.js
- **PDF Processing:** `pdf-parse` & `multer` for memory-efficient file buffering
- **Authentication:** Custom JWT-based stateless auth with bcrypt password hashing
- **Security:** CORS enabled, environment variable protection

### AI intelligence Layer (The Brain)
- **Provider:** **Groq Cloud API**
- **Model:** `llama-3.3-70b-versatile` — Chosen specifically for its unparalleled inference speed, allowing complex JSON generation and parsing in milliseconds, providing a seamless "chat-like" experience for mock interviews and massive document analysis.

---

## 🔮 Future Roadmap
- **Voice-to-Text Mock Interviews** (Real-time speech evaluation)
- **Chrome Extension** to auto-fill job applications using the AI-rewritten resume
- **LinkedIn Integration** for direct profile optimization

<br />

<div align="center">
  <i>Built with ❤️ to help everyone land their dream job.</i>
</div>
