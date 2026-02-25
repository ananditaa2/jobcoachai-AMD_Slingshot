import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { PageTransition } from '@/components/PageTransition';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Message {
    role: 'user' | 'ai';
    content: string;
}

const CareerChat = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'ai',
            content:
                "Hi! I'm CareerAI, your personal career coach. 🎯\n\nI can help you with:\n• Career planning & advice\n• Resume improvement tips\n• Interview preparation\n• Skill development paths\n• Job search strategies\n• Salary negotiation\n\nWhat would you like to discuss?",
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMessage = input.trim();
        const userMsg: Message = { role: 'user', content: userMessage };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: userMessage,
                    conversationHistory: messages.slice(-10),
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to get response');

            setMessages((prev) => [...prev, { role: 'ai', content: data.reply }]);
        } catch (error: any) {
            toast.error(error.message || 'Failed to get AI response');
            setMessages((prev) => [
                ...prev,
                { role: 'ai', content: "Sorry, I couldn't process that. Please try again." },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const quickQuestions = [
        'How do I prepare for a FAANG interview?',
        'What skills should I learn for 2026?',
        'Tips for salary negotiation',
        'How to switch careers to tech?',
    ];

    return (
        <PageTransition>
            <div className="min-h-screen bg-background flex flex-col">
                {/* Header */}
                <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="container mx-auto px-6 py-4 max-w-3xl flex items-center justify-between">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Home
                        </button>
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-teal" />
                            <span className="font-semibold text-foreground text-sm">AI Career Coach</span>
                        </div>
                        <div className="w-16" />
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
                                        <p key={j} className={j > 0 ? 'mt-1.5' : ''}>
                                            {line.split('**').map((part, k) =>
                                                k % 2 === 1 ? <strong key={k}>{part}</strong> : part
                                            )}
                                        </p>
                                    ))}
                                </div>
                            </motion.div>
                        ))}

                        {/* Quick questions (only show initially) */}
                        {messages.length === 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-wrap gap-2 mt-4"
                            >
                                {quickQuestions.map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => {
                                            setInput(q);
                                            setTimeout(() => {
                                                const fakeEvent = { trim: () => q };
                                                setInput('');
                                                setMessages((prev) => [...prev, { role: 'user', content: q }]);
                                                setIsTyping(true);
                                                fetch(`${API_URL}/chat`, {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        Authorization: `Bearer ${token}`,
                                                    },
                                                    body: JSON.stringify({ message: q, conversationHistory: messages }),
                                                })
                                                    .then((r) => r.json())
                                                    .then((data) => {
                                                        setMessages((prev) => [...prev, { role: 'ai', content: data.reply || data.error }]);
                                                    })
                                                    .catch(() => {
                                                        setMessages((prev) => [
                                                            ...prev,
                                                            { role: 'ai', content: "Sorry, something went wrong." },
                                                        ]);
                                                    })
                                                    .finally(() => setIsTyping(false));
                                            }, 100);
                                        }}
                                        className="px-3 py-1.5 rounded-full text-xs border border-border bg-card hover:bg-muted/50 text-foreground transition-colors"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </motion.div>
                        )}

                        {isTyping && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                                <div className="w-8 h-8 rounded-xl gradient-teal flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-accent-foreground" />
                                </div>
                                <div className="bg-card border border-border rounded-2xl px-4 py-3">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.1s' }} />
                                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.2s' }} />
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
                                placeholder="Ask me anything about your career..."
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

export default CareerChat;
