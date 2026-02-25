import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ParticleBackground } from '@/components/ParticleBackground';
import { PageTransition } from '@/components/PageTransition';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            await login(data.email, data.password);
            navigate('/analyze');
        } catch (error) {
            // Error is handled in AuthContext
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageTransition>
            <div className="min-h-screen gradient-hero relative overflow-hidden">
                <ParticleBackground />

                <div className="relative z-10 container mx-auto px-6 py-12 min-h-screen flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-md"
                    >
                        <div className="mb-8 text-center">
                            <Link to="/" className="inline-flex items-center gap-2 mb-6">
                                <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center">
                                    <Rocket className="w-5 h-5 text-accent-foreground" />
                                </div>
                                <span className="text-xl font-bold text-primary-foreground">CareerAI</span>
                            </Link>
                            <h1 className="text-3xl font-bold text-primary-foreground mb-2">Welcome Back</h1>
                            <p className="text-primary-foreground/60">Sign in to continue your journey</p>
                        </div>

                        <div className="bg-card/80 backdrop-blur-lg rounded-2xl p-8 border border-border shadow-xl">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-teal" />
                                        Email
                                    </label>
                                    <Input
                                        {...register('email')}
                                        type="email"
                                        placeholder="your@email.com"
                                        className="rounded-xl"
                                        disabled={isLoading}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-teal" />
                                        Password
                                    </label>
                                    <Input
                                        {...register('password')}
                                        type="password"
                                        placeholder="••••••••"
                                        className="rounded-xl"
                                        disabled={isLoading}
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-teal text-white hover:bg-teal/90 font-semibold py-6 rounded-xl shadow-lg shadow-teal/20 hover:shadow-teal/40 transition-all border-0"
                                    disabled={isLoading}
                                >
                                    <LogIn className="mr-2 w-5 h-5" />
                                    {isLoading ? 'Signing in...' : 'Sign In'}
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Don't have an account?{' '}
                                    <Link to="/register" className="text-teal font-medium hover:underline">
                                        Sign up
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Login;
