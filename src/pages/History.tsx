import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, TrendingUp, Target, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { PageTransition } from '@/components/PageTransition';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface HistoryEntry {
    id: string;
    userId: string;
    data: {
        readinessScore: number;
        targetCompany: string;
        strongSkills: string[];
        weakSkills: string[];
        missingSkills: string[];
    };
    timestamp: string;
}

const History = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await fetch(`${API_URL}/history`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            setHistory(data.history || []);
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch history');
        } finally {
            setIsLoading(false);
        }
    };

    // Chart data — score trend over time
    const chartData = [...history]
        .reverse()
        .map((entry, i) => ({
            name: new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            score: entry.data.readinessScore,
            company: entry.data.targetCompany,
            index: i + 1,
        }));

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
                            <Clock className="w-8 h-8 text-teal" />
                            Analysis History
                        </h1>
                        <p className="text-muted-foreground mt-2">Track your progress over time</p>
                    </motion.div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : history.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-card border border-border rounded-2xl p-12 text-center"
                        >
                            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">No Analysis History Yet</h3>
                            <p className="text-muted-foreground mb-6">Run your first analysis to start tracking progress</p>
                            <Button onClick={() => navigate('/analyze')} className="bg-teal text-white border-0 rounded-xl">
                                Start Analysis
                            </Button>
                        </motion.div>
                    ) : (
                        <>
                            {/* Score Trend Chart */}
                            {chartData.length >= 2 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-sm"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <TrendingUp className="w-5 h-5 text-teal" />
                                        <h2 className="font-semibold text-foreground">Score Trend</h2>
                                    </div>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="hsl(172, 80%, 40%)" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="hsl(172, 80%, 40%)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                            <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                                            <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'hsl(var(--card))',
                                                    border: '1px solid hsl(var(--border))',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="score"
                                                stroke="hsl(172, 80%, 40%)"
                                                strokeWidth={2}
                                                fill="url(#scoreGradient)"
                                                animationDuration={1500}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            )}

                            {/* History Entries */}
                            <div className="space-y-4">
                                {history.map((entry, i) => (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 + i * 0.05 }}
                                        whileHover={{ scale: 1.01 }}
                                        className="bg-card border border-border rounded-2xl p-5 shadow-sm cursor-pointer hover:border-teal/30 transition-colors"
                                        onClick={() => {
                                            navigate('/dashboard');
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-sm ${entry.data.readinessScore >= 80
                                                            ? 'bg-green-500'
                                                            : entry.data.readinessScore >= 60
                                                                ? 'bg-teal'
                                                                : entry.data.readinessScore >= 40
                                                                    ? 'bg-orange-400'
                                                                    : 'bg-red-500'
                                                        }`}
                                                >
                                                    {entry.data.readinessScore}%
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                                                        <Target className="w-4 h-4 text-teal" />
                                                        {entry.data.targetCompany}
                                                    </h3>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(entry.timestamp).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-muted-foreground">
                                                    {entry.data.strongSkills?.length || 0} strong · {entry.data.weakSkills?.length || 0} weak · {entry.data.missingSkills?.length || 0} missing
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default History;
