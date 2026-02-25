import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ParticleBackground } from '@/components/ParticleBackground';
import { PageTransition } from '@/components/PageTransition';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
    const navigate = useNavigate();
    const { register: registerUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        try {
            await registerUser(data.email, data.password, data.name);
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
                            <h1 className="text-3xl font-bold text-primary-foreground mb-2">Create Account</h1>
                            <p className="text-primary-foreground/60">Start your journey to your dream job</p>
                        </div>

                        <div className="bg-card/80 backdrop-blur-lg rounded-2xl p-8 border border-border shadow-xl">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                        <User className="w-4 h-4 text-teal" />
                                        Full Name
                                    </label>
                                    <Input
                                        {...register('name')}
                                        type="text"
                                        placeholder="John Doe"
                                        className="rounded-xl"
                                        disabled={isLoading}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                                    )}
                                </div>

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

                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-teal" />
                                        Confirm Password
                                    </label>
                                    <Input
                                        {...register('confirmPassword')}
                                        type="password"
                                        placeholder="••••••••"
                                        className="rounded-xl"
                                        disabled={isLoading}
                                    />
                                    {errors.confirmPassword && (
                                        <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-teal text-white hover:bg-teal/90 font-semibold py-6 rounded-xl shadow-lg shadow-teal/20 hover:shadow-teal/40 transition-all border-0"
                                    disabled={isLoading}
                                >
                                    <UserPlus className="mr-2 w-5 h-5" />
                                    {isLoading ? 'Creating account...' : 'Create Account'}
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-teal font-medium hover:underline">
                                        Sign in
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

export default Register;
