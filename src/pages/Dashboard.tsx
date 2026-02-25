import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, MessageSquare, CheckCircle2, XCircle, Target, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import ScoreRing from '@/components/ScoreRing';
import { SkillRadar } from '@/components/SkillRadar';
import { PageTransition } from '@/components/PageTransition';
import { usePdfExport } from '@/hooks/usePdfExport';
import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

const Dashboard = () => {
  const navigate = useNavigate();
  const { analysisData, isAnalyzing } = useAppContext();
  const confettiFired = useRef(false);
  const { targetRef, exportPdf } = usePdfExport();

  // 1. LOADING STATE
  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-teal mx-auto mb-6 animate-pulse flex items-center justify-center">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Analyzing your profile...</h2>
          <p className="text-muted-foreground">Our AI is reviewing your resume and skills</p>
        </motion.div>
      </div>
    );
  }

  // 2. NO DATA STATE
  if (!analysisData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No analysis data yet</p>
          <Button onClick={() => navigate('/analyze')} className="bg-teal text-white border-0">
            Start Analysis
          </Button>
        </div>
      </div>
    );
  }

  // 3. SAFE DESTRUCTURING
  const {
    readinessScore = 0,
    strongSkills = [],
    weakSkills = [],
    missingSkills = [],
    roadmap = [],
    targetCompany = "Target Company",
  } = typeof analysisData === 'object' ? analysisData : {} as any;

  // 4. FALLBACK FOR RAW TEXT RESPONSES
  if (typeof analysisData === 'string') {
    return (
      <div className="min-h-screen bg-background p-10">
        <div className="max-w-3xl mx-auto">
          <Button onClick={() => navigate('/analyze')} variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Input
          </Button>
          <h1 className="text-2xl font-bold mb-4">Analysis Result</h1>
          <div className="bg-card border border-border p-6 rounded-2xl text-left whitespace-pre-wrap leading-relaxed shadow-sm">
            {analysisData}
          </div>
        </div>
      </div>
    );
  }

  // 5. CONFETTI
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (readinessScore >= 80 && !confettiFired.current) {
      confettiFired.current = true;
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#38bda8', '#f59e0b', '#1e3a73', '#10b981', '#8b5cf6'],
        });
      }, 1000);
    }
  }, [readinessScore]);

  // 6. MAIN DASHBOARD UI
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div ref={targetRef} className="container mx-auto px-6 py-8 max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => navigate('/analyze')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Input
            </motion.button>
            <Button
              onClick={() => exportPdf(`${targetCompany}_readiness_report.pdf`)}
              variant="outline"
              size="sm"
              className="rounded-xl"
            >
              <Download className="w-4 h-4 mr-2" /> Export PDF
            </Button>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Placement Dashboard</h1>
            <p className="text-muted-foreground">Your personalized roadmap for <span className="text-teal font-medium">{targetCompany}</span></p>
          </motion.div>

          {/* Score + Skills Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Readiness Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm"
            >
              <p className="text-sm font-medium text-muted-foreground mb-4">Readiness Score</p>
              <ScoreRing score={readinessScore} />
              <p className="text-sm text-muted-foreground mt-4 font-medium">
                {readinessScore >= 80 ? '🎉 Excellent!' : readinessScore >= 60 ? 'Good progress' : 'Needs work'}
              </p>
            </motion.div>

            {/* Strong Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <p className="text-sm font-medium text-foreground">Strong Areas</p>
              </div>
              <div className="space-y-2">
                {strongSkills.map((s: string) => (
                  <div key={s} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="text-foreground">{s}</span>
                  </div>
                ))}
                {strongSkills.length === 0 && <p className="text-xs text-muted-foreground">No data provided</p>}
              </div>
            </motion.div>

            {/* Areas to Improve */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-5 h-5 text-orange-400" />
                <p className="text-sm font-medium text-foreground">Areas to Improve</p>
              </div>
              <div className="space-y-2">
                {weakSkills.map((s: string) => (
                  <div key={s} className="flex items-center gap-2 text-sm">
                    <XCircle className="w-4 h-4 text-orange-400 shrink-0" />
                    <span className="text-foreground">{s}</span>
                  </div>
                ))}
                {missingSkills.map((s: string) => (
                  <div key={s} className="flex items-center gap-2 text-sm">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="text-foreground">{s}</span>
                    <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase font-bold dark:bg-red-900/30 dark:text-red-400">missing</span>
                  </div>
                ))}
                {(weakSkills.length === 0 && missingSkills.length === 0) && (
                  <p className="text-xs text-muted-foreground">All areas look clear!</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Skill Radar Chart */}
          {(strongSkills.length > 0 || weakSkills.length > 0 || missingSkills.length > 0) && (
            <div className="mb-8">
              <SkillRadar
                strongSkills={strongSkills}
                weakSkills={weakSkills}
                missingSkills={missingSkills}
              />
            </div>
          )}

          {/* 6-Month Roadmap Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-teal" />
              <h2 className="text-lg font-bold text-foreground">6-Month Roadmap</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {roadmap.map((item: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  whileHover={{ scale: 1.02, borderColor: 'hsl(172 80% 40%)' }}
                  className="relative p-4 rounded-xl border border-border bg-muted/20 hover:border-teal/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 rounded-lg bg-teal text-white text-xs font-bold flex items-center justify-center">
                      M{item.month || i + 1}
                    </span>
                    <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
              {roadmap.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-full py-4">No roadmap steps generated.</p>
              )}
            </div>
          </motion.div>

          {/* Interview CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              onClick={() => navigate('/interview')}
              size="lg"
              className="w-full bg-teal text-white font-semibold text-lg py-6 rounded-2xl shadow-lg hover:shadow-teal/20 hover:scale-[1.01] transition-all duration-300 border-0"
            >
              <MessageSquare className="mr-2 w-5 h-5" />
              Start Mock Interview
            </Button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;