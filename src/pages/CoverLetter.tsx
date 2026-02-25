import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Sparkles, Copy, Download, Building2, Briefcase, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useAppContext } from '@/context/AppContext';
import { PageTransition } from '@/components/PageTransition';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CoverLetter = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const { resumeText } = useAppContext();
    const [jobTitle, setJobTitle] = useState('');
    const [company, setCompany] = useState('');
    const [keyPoints, setKeyPoints] = useState('');
    const [coverLetter, setCoverLetter] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!jobTitle.trim() || !company.trim()) {
            toast.error('Please enter a job title and company name');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/generate-cover-letter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    jobTitle,
                    company,
                    keyPoints,
                    resumeText,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to generate cover letter');
            setCoverLetter(data.coverLetter);
            toast.success('Cover letter generated!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate cover letter');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(coverLetter);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([coverLetter], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cover_letter_${company.replace(/\s+/g, '_')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Downloaded!');
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-6 py-8 max-w-4xl">
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </motion.button>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <FileText className="w-8 h-8 text-teal" />
                            Cover Letter Generator
                        </h1>
                        <p className="text-muted-foreground mt-2">Create a tailored cover letter powered by AI</p>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Input Side */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4"
                        >
                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-teal" />
                                    Job Title *
                                </label>
                                <Input
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    placeholder="e.g. Software Engineer"
                                    className="rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-teal" />
                                    Company *
                                </label>
                                <Input
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    placeholder="e.g. Google"
                                    className="rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block text-sm">
                                    Key Points to Highlight (optional)
                                </label>
                                <Textarea
                                    value={keyPoints}
                                    onChange={(e) => setKeyPoints(e.target.value)}
                                    placeholder="e.g. 3 years of React experience, led team of 5, passionate about cloud..."
                                    className="rounded-xl min-h-[100px]"
                                />
                            </div>

                            <Button
                                onClick={handleGenerate}
                                disabled={isLoading || !jobTitle.trim() || !company.trim()}
                                className="w-full bg-teal text-white hover:bg-teal/90 font-semibold py-6 rounded-xl border-0 shadow-lg shadow-teal/20"
                            >
                                <Sparkles className="mr-2 w-5 h-5" />
                                {isLoading ? 'Generating...' : 'Generate Cover Letter'}
                            </Button>
                        </motion.div>

                        {/* Output Side */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-medium text-muted-foreground">Generated Cover Letter</p>
                                <AnimatePresence>
                                    {coverLetter && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex gap-2"
                                        >
                                            <Button size="sm" variant="outline" onClick={handleCopy} className="rounded-lg text-xs">
                                                {copied ? <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" /> : <Copy className="w-3 h-3 mr-1" />}
                                                {copied ? 'Copied!' : 'Copy'}
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={handleDownload} className="rounded-lg text-xs">
                                                <Download className="w-3 h-3 mr-1" /> Download
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex-1 min-h-[300px] bg-muted/30 rounded-xl p-4 overflow-y-auto">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <div className="w-10 h-10 border-3 border-teal border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                            <p className="text-sm text-muted-foreground">AI is crafting your letter...</p>
                                        </div>
                                    </div>
                                ) : coverLetter ? (
                                    <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                        {coverLetter}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                        Your cover letter will appear here
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default CoverLetter;
