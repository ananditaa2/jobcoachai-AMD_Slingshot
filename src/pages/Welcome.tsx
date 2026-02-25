import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Rocket, Brain, Target, BarChart3, LogOut, FileEdit, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ParticleBackground } from '@/components/ParticleBackground';
import { PageTransition } from '@/components/PageTransition';
import { MobileNav } from '@/components/MobileNav';

const features = [
  { icon: Brain, title: 'AI-Powered Analysis', desc: 'Deep resume parsing with skill gap detection' },
  { icon: Target, title: 'Company Targeting', desc: 'Personalized roadmap for your dream company' },
  { icon: BarChart3, title: 'Readiness Score', desc: 'Know exactly where you stand' },
  { icon: Rocket, title: 'Mock Interviews', desc: 'Practice with AI-driven feedback' },
];

const Welcome = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <PageTransition>
      <div className="min-h-screen gradient-hero relative overflow-hidden">
        {/* Animated particle network */}
        <ParticleBackground />

        <div className="relative z-10 container mx-auto px-6 py-12 min-h-screen flex flex-col">
          {/* Nav */}
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-20"
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center">
                <Rocket className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="text-xl font-bold text-primary-foreground">CareerAI</span>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-white/80">Hi, {user?.name}!</span>
                  <Button
                    onClick={() => navigate('/resume-rewriter')}
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-white/40 text-white hover:bg-white/15"
                  >
                    <FileEdit className="w-3 h-3 mr-1" />
                    Resume
                  </Button>
                  <Button
                    onClick={() => navigate('/interview')}
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-white/40 text-white hover:bg-white/15"
                  >
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Interview
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-white/40 text-white hover:bg-white/15"
                  >
                    <LogOut className="w-3 h-3 mr-1" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => navigate('/login')}
                    variant="outline"
                    className="rounded-xl border-white/40 text-white hover:bg-white/15"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => navigate('/register')}
                    className="rounded-xl bg-teal text-white hover:bg-teal/90 border-0"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>

            {/* Mobile nav */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <MobileNav />
            </div>
          </motion.nav>

          {/* Hero */}
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-teal/20 text-teal border border-teal/30">
                AI-Powered Placement Coach
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl md:text-7xl font-black text-primary-foreground leading-tight mb-6"
            >
              Your Path to
              <br />
              <span className="text-gradient-animated">Placement Success</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-base sm:text-lg md:text-xl text-primary-foreground/60 max-w-2xl mb-10"
            >
              Upload your resume, tell us your dream company, and get a personalized
              roadmap with AI-powered skill analysis and mock interview practice.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                size="lg"
                onClick={() => navigate('/analyze')}
                className="gradient-teal text-accent-foreground font-semibold text-lg px-10 py-6 rounded-2xl shadow-lg shadow-teal/25 hover:shadow-teal/40 hover:scale-105 transition-all duration-300 border-0"
              >
                Start Analysis
                <Rocket className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 mb-8"
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
                className="p-4 rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10 backdrop-blur-sm cursor-default"
              >
                <f.icon className="w-7 h-7 text-teal mb-2" />
                <h3 className="font-semibold text-primary-foreground text-xs mb-1">{f.title}</h3>
                <p className="text-primary-foreground/50 text-[10px]">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Welcome;
