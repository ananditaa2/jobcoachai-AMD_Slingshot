import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Bot, User, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { PageTransition } from '@/components/PageTransition';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Message {
  role: 'ai' | 'user';
  content: string;
}

const FALLBACK_QUESTIONS = [
  "Tell me about yourself and why you're interested in this role.",
  "Explain the difference between a process and a thread.",
  "What is your approach to solving a problem you've never encountered before?",
  "Describe a challenging project you worked on. What was your role?",
  "How would you design a URL shortening service like bit.ly?",
  "What are the SOLID principles? Give a real-world example.",
];

const Interview = () => {
  const navigate = useNavigate();
  const { analysisData } = useAppContext();
  const { token } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const company = analysisData?.targetCompany || 'your target company';

  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  // Fetch company-specific questions on mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      const response = await fetch(`${API_URL}/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company,
          role: 'Software Engineer',
          skills: analysisData?.strongSkills || [],
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      const qs = data.questions.map((q: any) => q.question);
      setQuestions(qs);
      setMessages([
        {
          role: 'ai',
          content: `Welcome to your personalized mock interview for **${company}**! 🎯\n\nI've generated ${qs.length} questions tailored to ${company}'s interview style. Type your answer and I'll provide detailed AI-powered feedback.\n\nLet's begin:\n\n**Question 1/${qs.length}: ${qs[0]}**`,
        },
      ]);
    } catch (error) {
      console.warn('Failed to generate custom questions, using fallback');
      setQuestions(FALLBACK_QUESTIONS);
      setMessages([
        {
          role: 'ai',
          content: `Welcome to your mock interview for **${company}**! I'll ask you questions commonly asked in technical interviews. Type your answer and I'll provide detailed AI-powered feedback.\n\nLet's begin:\n\n**Question 1/${FALLBACK_QUESTIONS.length}: ${FALLBACK_QUESTIONS[0]}**`,
        },
      ]);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fireConfetti = () => {
    const duration = 2000;
    const end = Date.now() + duration;
    const colors = ['#38bda8', '#f59e0b', '#1e3a73', '#10b981', '#8b5cf6', '#ec4899'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping || questions.length === 0) return;

    const userAnswer = input.trim();
    const userMsg: Message = { role: 'user', content: userAnswer };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: questions[questionIndex],
          answer: userAnswer,
          company: company,
          questionNumber: questionIndex + 1,
          totalQuestions: questions.length,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get feedback');
      }

      const result = data.result;
      const nextQ = questionIndex + 1;
      let feedback = '';

      // Build rich feedback from AI response
      if (result.score !== undefined) {
        feedback += `**Score: ${result.score}/10**\n\n`;
      }

      if (result.feedback) {
        feedback += `${result.feedback}\n\n`;
      }

      if (result.strengths && result.strengths.length > 0) {
        feedback += `✅ **Strengths:**\n${result.strengths.map((s: string) => `• ${s}`).join('\n')}\n\n`;
      }

      if (result.improvements && result.improvements.length > 0) {
        feedback += `📈 **Areas to Improve:**\n${result.improvements.map((s: string) => `• ${s}`).join('\n')}\n\n`;
      }

      if (result.tip) {
        feedback += `💡 **Pro Tip:** ${result.tip}`;
      }

      if (nextQ < questions.length) {
        feedback += `\n\n---\n\n**Question ${nextQ + 1}/${questions.length}: ${questions[nextQ]}**`;
        setQuestionIndex(nextQ);
      } else {
        feedback += '\n\n---\n\n🎉 **Interview complete!** You\'ve answered all the questions. Great practice session!';
        setTimeout(fireConfetti, 500);
      }

      setMessages((prev) => [...prev, { role: 'ai', content: feedback }]);
    } catch (error: any) {
      console.error('Interview Error:', error);
      toast.error(error.message || 'Failed to get AI feedback');

      const nextQ = questionIndex + 1;
      let fallbackFeedback = 'I had trouble analyzing your answer. Let me ask the next question.\n\n';

      if (nextQ < questions.length) {
        fallbackFeedback += `---\n\n**Question ${nextQ + 1}/${questions.length}: ${questions[nextQ]}**`;
        setQuestionIndex(nextQ);
      } else {
        fallbackFeedback += '---\n\n🎉 **Interview complete!**';
        setTimeout(fireConfetti, 500);
      }

      setMessages((prev) => [...prev, { role: 'ai', content: fallbackFeedback }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Loading state while fetching questions
  if (isLoadingQuestions) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <div className="w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-1">Preparing your interview...</h2>
            <p className="text-sm text-muted-foreground">Generating {company}-specific questions</p>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4 max-w-3xl flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal" />
              <span className="font-semibold text-foreground text-sm">{company} Mock Interview</span>
            </div>
            <Button
              onClick={fetchQuestions}
              variant="ghost"
              size="sm"
              className="text-xs"
              disabled={isTyping}
            >
              <RefreshCw className="w-3 h-3 mr-1" /> New Set
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-6 max-w-3xl space-y-4">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'gradient-teal' : 'bg-primary'
                    }`}
                >
                  {msg.role === 'ai' ? (
                    <Bot className="w-4 h-4 text-accent-foreground" />
                  ) : (
                    <User className="w-4 h-4 text-primary-foreground" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'ai'
                    ? 'bg-card border border-border text-foreground'
                    : 'gradient-teal text-accent-foreground'
                    }`}
                >
                  {msg.content.split('\n').map((line, j) => (
                    <p key={j} className={j > 0 ? 'mt-2' : ''}>
                      {line.split('**').map((part, k) =>
                        k % 2 === 1 ? (
                          <strong key={k}>{part}</strong>
                        ) : (
                          part
                        )
                      )}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-xl gradient-teal flex items-center justify-center">
                  <Bot className="w-4 h-4 text-accent-foreground" />
                </div>
                <div className="bg-card border border-border rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                    <div
                      className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border bg-card/50 backdrop-blur-sm sticky bottom-0">
          <div className="container mx-auto px-6 py-4 max-w-3xl">
            <div className="flex gap-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your answer..."
                className="rounded-xl resize-none min-h-[48px] max-h-32"
                rows={1}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                size="icon"
                className="gradient-teal text-accent-foreground rounded-xl shrink-0 h-12 w-12 border-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Interview;
