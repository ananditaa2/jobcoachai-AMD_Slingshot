import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) return <div className="w-10 h-10" />;

    const isDark = theme === 'dark';

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="relative w-10 h-10 rounded-xl bg-primary-foreground/10 border border-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
            aria-label="Toggle theme"
        >
            <motion.div
                initial={false}
                animate={{ rotate: isDark ? 0 : 180, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
                {isDark ? (
                    <Moon className="w-4 h-4 text-primary-foreground" />
                ) : (
                    <Sun className="w-4 h-4 text-primary-foreground" />
                )}
            </motion.div>
        </motion.button>
    );
}
