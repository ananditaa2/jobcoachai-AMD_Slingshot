import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
}

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.98,
    },
    enter: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    exit: {
        opacity: 0,
        y: -10,
        scale: 0.99,
        transition: {
            duration: 0.25,
            ease: 'easeIn',
        },
    },
};

export function PageTransition({ children }: PageTransitionProps) {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
        >
            {children}
        </motion.div>
    );
}
