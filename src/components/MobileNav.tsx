import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, BarChart3, MessageSquare, PenLine } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Analyze', path: '/analyze', icon: BarChart3 },
    { label: 'Resume Rewriter', path: '/resume-rewriter', icon: PenLine },
];

const authedItems = [
    { label: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { label: 'Interview', path: '/interview', icon: MessageSquare },
];

export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, logout } = useAuth();

    const handleNav = (path: string) => {
        navigate(path);
        setIsOpen(false);
    };

    return (
        <div className="md:hidden">
            <button
                onClick={() => setIsOpen(true)}
                className="w-10 h-10 rounded-xl bg-primary-foreground/10 border border-primary-foreground/20 flex items-center justify-center"
                aria-label="Open menu"
            >
                <Menu className="w-5 h-5 text-primary-foreground" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-72 bg-card border-l border-border z-50 flex flex-col"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-border">
                                <span className="font-bold text-foreground">Menu</span>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {isAuthenticated && user && (
                                <div className="px-6 py-4 border-b border-border">
                                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                            )}

                            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                                {navItems.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <button
                                            key={item.path}
                                            onClick={() => handleNav(item.path)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-teal/10 text-teal' : 'text-foreground hover:bg-muted/50'
                                                }`}
                                        >
                                            <item.icon className="w-4 h-4" />
                                            {item.label}
                                        </button>
                                    );
                                })}

                                {isAuthenticated &&
                                    authedItems.map((item) => {
                                        const isActive = location.pathname === item.path;
                                        return (
                                            <button
                                                key={item.path}
                                                onClick={() => handleNav(item.path)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-teal/10 text-teal' : 'text-foreground hover:bg-muted/50'
                                                    }`}
                                            >
                                                <item.icon className="w-4 h-4" />
                                                {item.label}
                                            </button>
                                        );
                                    })}
                            </nav>

                            {isAuthenticated && (
                                <div className="p-4 border-t border-border">
                                    <button
                                        onClick={() => { logout(); setIsOpen(false); }}
                                        className="w-full px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
