import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileText, Sparkles, Download, ArrowLeft, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { PageTransition } from '@/components/PageTransition';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ResumeRewriter = () => {
    const navigate = useNavigate();
    const { token, isAuthenticated } = useAuth();
    const [originalResume, setOriginalResume] = useState('');
    const [rewrittenResume, setRewrittenResume] = useState('');
    const [isRewriting, setIsRewriting] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!isAuthenticated) {
        navigate('/login');
        return null;
    }

    const handleRewrite = async () => {
        if (!originalResume.trim()) {
            toast.error('Please enter your resume text');
            return;
        }

        setIsRewriting(true);
        try {
            const response = await fetch(`${API_URL}/rewrite-resume`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ resumeText: originalResume }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to rewrite resume');
            }

            setRewrittenResume(data.rewrittenResume);
            toast.success('Resume rewritten successfully!');
        } catch (error) {
            console.error('Rewrite Error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to rewrite resume. Make sure the backend server is running.');
        } finally {
            setIsRewriting(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(rewrittenResume);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([rewrittenResume], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rewritten-resume.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Resume downloaded!');
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-6 py-8 max-w-7xl">
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </motion.button>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                        <h1 className="text-3xl font-bold text-foreground mb-2">AI Resume Rewriter</h1>
                        <p className="text-muted-foreground">Transform your resume into a professional, ATS-friendly masterpiece</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Original Resume */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-teal" />
                                    Original Resume
                                </label>
                            </div>
                            <Textarea
                                value={originalResume}
                                onChange={(e) => setOriginalResume(e.target.value)}
                                placeholder="Paste your resume text here...

Example:
John Doe
Software Engineer

Experience:
- Worked on various projects
- Used multiple technologies
- Collaborated with team members

Skills:
JavaScript, Python, React"
                                className="min-h-[500px] rounded-xl font-mono text-sm"
                                disabled={isRewriting}
                            />
                            <Button
                                onClick={handleRewrite}
                                size="lg"
                                className="w-full bg-teal text-white hover:bg-teal/90 font-semibold py-6 rounded-xl shadow-lg shadow-teal/20 hover:shadow-teal/40 transition-all border-0"
                                disabled={isRewriting || !originalResume.trim()}
                            >
                                <Sparkles className="mr-2 w-5 h-5" />
                                {isRewriting ? 'Rewriting with AI...' : 'Rewrite Resume'}
                            </Button>
                        </motion.div>

                        {/* Rewritten Resume */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-teal" />
                                    AI-Enhanced Resume
                                </label>
                                {rewrittenResume && (
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleCopy}
                                            size="sm"
                                            variant="outline"
                                            className="rounded-xl"
                                        >
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                        <Button
                                            onClick={handleDownload}
                                            size="sm"
                                            variant="outline"
                                            className="rounded-xl"
                                        >
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <div className="relative">
                                <Textarea
                                    value={rewrittenResume}
                                    readOnly
                                    placeholder="Your AI-enhanced resume will appear here..."
                                    className="min-h-[500px] rounded-xl font-mono text-sm bg-teal/5 border-teal/20"
                                />
                                {isRewriting && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
                                        <div className="text-center">
                                            <div className="w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                            <p className="text-sm text-muted-foreground">AI is analyzing and rewriting your resume...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {rewrittenResume && (
                                <div className="p-4 rounded-xl bg-teal/10 border border-teal/20">
                                    <p className="text-sm text-foreground">
                                        <span className="font-semibold">✨ Enhanced!</span> Your resume has been optimized for ATS systems and professional impact.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default ResumeRewriter;
