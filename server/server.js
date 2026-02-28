import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { PDFParse } from "pdf-parse";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the server directory explicitly
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
app.use(cors());
app.use(express.json());

// Multer config for PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"));
  },
});

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Check API Key on startup
const groqKey = process.env.GROQ_API_KEY;
if (!groqKey) {
  console.error("❌ ERROR: GROQ_API_KEY is missing! Please add it to the .env file.");
} else {
  console.log(`✅ GROQ_API_KEY loaded: ${groqKey.trim().substring(0, 10)}...`);
}

// ─── Groq API Helper ────────────────────────────────────────────────
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

async function callAI(prompt, maxRetries = 1) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not configured");

  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: "You are a helpful career coach AI. Always respond with valid JSON when asked for JSON. Never wrap JSON in markdown code blocks." },
            { role: "user", content: prompt },
          ],
          temperature: 0.4,
          max_tokens: 2048,
        }),
      });

      const data = await response.json();

      if (data.error) {
        lastError = new Error(data.error.message || JSON.stringify(data.error));
        console.error(`Groq API error (attempt ${attempt + 1}):`, data.error.message);
        if (attempt < maxRetries) continue;
        throw lastError;
      }

      const aiContent = data.choices?.[0]?.message?.content || "";

      if (!aiContent) {
        lastError = new Error("Groq returned empty response");
        if (attempt < maxRetries) continue;
        throw lastError;
      }

      console.log(`Groq response (${aiContent.length} chars, attempt ${attempt + 1})`);
      return aiContent;
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        console.warn(`Error (attempt ${attempt + 1}): ${err.message}, retrying in 1s...`);
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }
  throw lastError;
}



function extractJSON(text) {
  if (!text) return null;

  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (_) { }

  const startIdx = cleaned.indexOf("{");
  if (startIdx !== -1) {
    let depth = 0;
    let endIdx = -1;
    for (let i = startIdx; i < cleaned.length; i++) {
      if (cleaned[i] === "{") depth++;
      else if (cleaned[i] === "}") {
        depth--;
        if (depth === 0) { endIdx = i; break; }
      }
    }
    if (endIdx !== -1) {
      try {
        return JSON.parse(cleaned.substring(startIdx, endIdx + 1));
      } catch (_) { }
    }
  }

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (_) { }
  }

  return null;
}

// ─── User Storage ────────────────────────────────────────────────────
const USERS_FILE = path.join(__dirname, "users.json");
const HISTORY_FILE = path.join(__dirname, "history.json");

if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}
if (!fs.existsSync(HISTORY_FILE)) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify([]));
}

const getUsers = () => JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
const saveUsers = (users) => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
const getHistory = () => JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8"));
const saveHistory = (history) => fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));

// ─── Auth Middleware ─────────────────────────────────────────────────
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "your-secret-key", (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
};

// ─── Routes ──────────────────────────────────────────────────────────
app.get("/", (req, res) => res.send("Backend is up and running! ✅"));

// Register
app.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name are required" });
    }

    const users = getUsers();
    if (users.find((u) => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      email,
      name,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.json({ token, user: { id: newUser.id, email: newUser.email, name: newUser.name } });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const users = getUsers();
    const user = users.find((u) => u.email === email);

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Verify token
app.get("/verify-token", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// ─── PDF Upload & Parse ──────────────────────────────────────────────
app.post("/upload-resume", authenticateToken, upload.single("resume"), async (req, res) => {
  let parser = null;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    // pdf-parse v2 uses PDFParse class
    const uint8 = new Uint8Array(req.file.buffer.buffer, req.file.buffer.byteOffset, req.file.buffer.byteLength);
    parser = new PDFParse({ data: uint8 });
    const textResult = await parser.getText();
    const text = textResult.text?.trim();
    const pages = textResult.pages?.length || 1;

    if (!text || text.length < 20) {
      return res.status(400).json({ error: "Could not extract meaningful text from the PDF. Try a different resume." });
    }

    console.log(`PDF parsed: ${text.length} chars extracted from ${req.file.originalname}`);
    res.json({ text, pages, filename: req.file.originalname });
  } catch (error) {
    console.error("PDF Parse Error:", error.message);
    res.status(500).json({ error: "Failed to parse PDF. Ensure it is a valid text-based PDF (not a scanned image)." });
  } finally {
    if (parser) {
      try { await parser.destroy(); } catch (_) { }
    }
  }
});

// ─── AI Analysis Endpoint (Enhanced with job suggestions + learning resources) ─
app.post("/analyze", authenticateToken, async (req, res) => {
  try {
    const { resumeText, skills, company } = req.body;

    const prompt = `You are a career coach. Analyze this candidate for ${company}.

Resume: ${resumeText}
Skills: ${JSON.stringify(skills)}
Target: ${company}

Return ONLY valid JSON (no markdown, no backticks):
{
  "readinessScore": <0-100>,
  "targetCompany": "${company}",
  "strongSkills": ["skill1", "skill2"],
  "weakSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1"],
  "roadmap": [
    {"month": 1, "title": "...", "description": "..."},
    {"month": 2, "title": "...", "description": "..."},
    {"month": 3, "title": "...", "description": "..."},
    {"month": 4, "title": "...", "description": "..."},
    {"month": 5, "title": "...", "description": "..."},
    {"month": 6, "title": "...", "description": "..."}
  ]
}`;

    const aiContent = await callAI(prompt);
    const parsed = extractJSON(aiContent);

    if (parsed && typeof parsed.readinessScore !== "undefined" && Array.isArray(parsed.roadmap)) {
      res.json({ result: parsed });
    } else {
      console.error("Failed to extract valid JSON. Raw (first 500 chars):", aiContent.substring(0, 500));
      res.status(500).json({ error: "AI analysis returned an unexpected format. Please try again." });
    }
  } catch (error) {
    console.error("Backend Error:", error.message);
    res.status(500).json({ error: error.message || "AI analysis failed" });
  }
});



// ─── Generate Company-Specific Interview Questions ─────────────────
app.post("/generate-questions", authenticateToken, async (req, res) => {
  try {
    const { company, role, skills } = req.body;

    const prompt = `You are a senior technical interviewer at ${company || "a top tech company"}.

TASK: Generate 6 realistic interview questions that ${company} would actually ask for a ${role || "software engineering"} role.

Candidate's skills: ${JSON.stringify(skills || [])}
Random Seed: ${Math.random()} (Ensure this set is COMPLETELY NEW and UNIQUE, different from standard or previous questions)

Include a mix of:
- 1 behavioral question
- 2 technical/coding questions
- 1 system design question
- 1 problem-solving question
- 1 company-specific/culture-fit question

Make them highly specific to ${company}'s known interview style, edge cases, and the candidate's skill set. AVOID generic questions like "Tell me about yourself" or "What are your weaknesses?".

RESPONSE FORMAT: Return ONLY a valid JSON array (no markdown, no backticks):
[
  {"question": "...", "type": "behavioral", "difficulty": "medium"},
  {"question": "...", "type": "technical", "difficulty": "hard"},
  {"question": "...", "type": "technical", "difficulty": "medium"},
  {"question": "...", "type": "system_design", "difficulty": "hard"},
  {"question": "...", "type": "problem_solving", "difficulty": "medium"},
  {"question": "...", "type": "culture_fit", "difficulty": "easy"}
]`;

    const aiContent = await callAI(prompt);
    const cleaned = aiContent.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    let questions;
    try {
      questions = JSON.parse(cleaned);
    } catch (_) {
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (match) questions = JSON.parse(match[0]);
    }

    if (Array.isArray(questions) && questions.length > 0) {
      res.json({ questions });
    } else {
      res.status(500).json({ error: "Failed to generate questions. Try again." });
    }
  } catch (error) {
    console.error("Generate Questions Error:", error.message);
    res.status(500).json({ error: error.message || "Question generation failed" });
  }
});



// ─── Resume Rewrite Endpoint ─────────────────────────────────────────
app.post("/rewrite-resume", authenticateToken, async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) return res.status(400).json({ error: "Resume text is required" });

    const prompt = `You are a world - class resume writer.

Rewrite this resume to be more professional, impactful, and ATS - optimized:

${resumeText}

    Rules: Use action verbs, quantify achievements, add ATS keywords, use STAR method, add a professional summary.

Return ONLY the rewritten resume text.No commentary.`;

    const aiContent = await callAI(prompt);
    res.json({ rewrittenResume: aiContent.replace(/``` / g, "").trim() });
  } catch (error) {
    console.error("Resume Rewrite Error:", error.message);
    res.status(500).json({ error: error.message || "Resume rewriting failed" });
  }
});

// ─── Interview Feedback Endpoint ─────────────────────────────────────
app.post("/interview", authenticateToken, async (req, res) => {
  try {
    const { question, answer, company, questionNumber, totalQuestions } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: "Question and answer are required" });
    }

    const prompt = `You are a senior technical interviewer at ${company || "a top tech company"}.

Question ${questionNumber || "?"}/${totalQuestions || "?"}: "${question}"
Candidate's answer: "${answer}"

Return ONLY valid JSON (no markdown, no backticks):
{
  "score": <1-10>,
  "feedback": "<2-3 sentences>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "tip": "<One pro tip>"
}`;

    const aiContent = await callAI(prompt);
    const parsed = extractJSON(aiContent);

    if (parsed && parsed.score !== undefined) {
      res.json({ result: parsed });
    } else {
      const fallback = aiContent.replace(/```json|```/g, "").trim();
      res.json({ result: { score: 5, feedback: fallback, strengths: [], improvements: [], tip: "" } });
    }
  } catch (error) {
    console.error("Interview Error:", error.message);
    res.status(500).json({ error: error.message || "Interview feedback failed" });
  }
});

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));