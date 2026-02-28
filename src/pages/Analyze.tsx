import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Building2, FileText, Sparkles, ArrowLeft, Briefcase } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const ROLES = ['Software Engineer', 'Data Scientist', 'Product Manager', 'AI/ML Engineer', 'Frontend Developer', 'Backend Developer', 'Hardware Engineer', 'DevOps'];
const COMPANIES = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'AMD', 'NVIDIA', 'Intel'];
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Analyze = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const {
    resumeText,
    setResumeText,
    targetCompany,
    setTargetCompany,
    jobRole,
    setJobRole,
    setAnalysisData,
    setIsAnalyzing
  } = useAppContext();

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer for loading elapsed time
  useEffect(() => {
    if (isLoading) {
      setElapsedTime(0);
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading]);

  const handleFile = useCallback(async (f: File) => {
    if (f.type !== 'application/pdf' && !f.name.endsWith('.pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }
    setFile(f);

    // Actually parse the PDF via the server
    const formData = new FormData();
    formData.append('resume', f);

    try {
      toast.info('Extracting text from PDF...');
      const response = await fetch(`${API_URL}/upload-resume`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to parse PDF');

      setResumeText(data.text);
      toast.success(`Extracted ${data.text.length} characters from ${data.filename} (${data.pages} page${data.pages > 1 ? 's' : ''})`);
    } catch (error: any) {
      console.error('PDF Parse Error:', error);
      toast.error(error.message || 'Failed to extract text from PDF');
      // Fallback to basic info
      setResumeText(`Resume uploaded: ${f.name}. Please add your skills manually.`);
    }
  }, [setResumeText, token]);



  const handleAnalyze = async () => {
    if (!file) { toast.error('Please upload your resume'); return; }
    if (!targetCompany) { toast.error('Please select a target company'); return; }

    setIsAnalyzing(true);
    setIsLoading(true);

    try {
      console.log(`Sending request to: ${API_URL}/analyze`);
      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          resumeText: resumeText,
          skills: [],
          company: targetCompany,
          role: jobRole
        })
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Server response was not JSON:", text.substring(0, 200));
        throw new Error("Server returned HTML instead of JSON. Check API_URL in frontend.");
      }

      if (!response.ok) {
        throw new Error(data.error || "Server responded with an error");
      }

      if (data.result) {
        setAnalysisData(data.result);
        toast.success("Analysis complete!");
        navigate('/dashboard');
      } else {
        throw new Error("Invalid response format from AI");
      }

    } catch (error: any) {
      console.error("Analysis Error:", error);
      toast.error(error.message || "AI analysis failed.");
    } finally {
      setIsAnalyzing(false);
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8 max-w-3xl">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </motion.button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
            <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-teal/10 text-teal">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">AI Resume <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-emerald-400">Analysis</span></h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">Upload your resume and tell us your dream role. Our Llama-3 agent will benchmark you against industry standards instantly.</p>
          </motion.div>

          {/* Resume Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <label className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal" /> Resume (PDF)
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
              className={`mt-2 border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer
              ${dragOver ? 'border-teal bg-teal-light' : file ? 'border-teal/50 bg-teal-light/50' : 'border-border hover:border-teal/50'}`}
              onClick={() => document.getElementById('resume-input')?.click()}
            >
              <input
                id="resume-input"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-teal" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="ml-4 p-1 rounded-full hover:bg-muted">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-foreground font-medium">Drop your resume here</p>
                  <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                </>
              )}
            </div>
          </motion.div>



          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Target Role */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card/40 backdrop-blur-md p-6 rounded-3xl border border-white/5 shadow-xl"
            >
              <label className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-teal" /> Target Role
              </label>
              <div className="flex flex-wrap gap-2 mt-3">
                {ROLES.map(r => (
                  <button
                    key={r}
                    onClick={() => setJobRole(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border
                    ${jobRole === r
                        ? 'bg-teal text-white border-teal shadow-[0_0_15px_rgba(20,184,166,0.5)] scale-105'
                        : 'bg-background/50 text-muted-foreground border-white/5 hover:border-teal/30 hover:text-foreground'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Target Company */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card/40 backdrop-blur-md p-6 rounded-3xl border border-white/5 shadow-xl"
            >
              <label className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal" /> Target Company
              </label>
              <div className="flex flex-wrap gap-2 mt-3">
                {COMPANIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setTargetCompany(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border
                    ${targetCompany === c
                        ? 'bg-teal text-white border-teal shadow-[0_0_15px_rgba(20,184,166,0.5)] scale-105'
                        : 'bg-background/50 text-muted-foreground border-white/5 hover:border-teal/30 hover:text-foreground'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Analyze Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={handleAnalyze}
              disabled={isLoading}
              size="lg"
              className="w-full bg-gradient-to-r from-teal to-emerald-500 text-white hover:opacity-90 font-bold text-lg py-7 rounded-2xl shadow-[0_0_30px_rgba(20,184,166,0.3)] hover:shadow-[0_0_40px_rgba(20,184,166,0.5)] hover:scale-[1.01] transition-all duration-300 border-0"
            >
              <Sparkles className="mr-3 w-6 h-6" />
              Generate Career Roadmap
            </Button>
          </motion.div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="text-center p-8 rounded-3xl bg-card border border-border shadow-2xl max-w-md mx-4"
            >
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-teal/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-teal rounded-full animate-spin" />
                <div className="absolute inset-2 border-4 border-transparent border-t-teal/60 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-teal animate-pulse" />
                </div>
              </div>

              <div className="text-3xl font-bold text-foreground mb-2 tabular-nums">
                {Math.floor(elapsedTime / 60).toString().padStart(2, '0')}:{(elapsedTime % 60).toString().padStart(2, '0')}
              </div>

              <p className="text-sm font-medium text-foreground mb-1">
                {elapsedTime < 5 && 'Starting AI analysis...'}
                {elapsedTime >= 5 && elapsedTime < 15 && 'Analyzing your resume...'}
                {elapsedTime >= 15 && elapsedTime < 25 && 'Evaluating skill gaps...'}
                {elapsedTime >= 25 && elapsedTime < 40 && 'Building your roadmap...'}
                {elapsedTime >= 40 && 'Almost done, hang tight...'}
              </p>
              <p className="text-xs text-muted-foreground">
                This usually takes 15–30 seconds
              </p>

              <div className="mt-4 w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full bg-teal rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${Math.min(95, elapsedTime * 2.5)}%` }}
                  transition={{ ease: 'easeOut', duration: 1 }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};

export default Analyze;
