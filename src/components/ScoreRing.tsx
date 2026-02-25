import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ScoreRingProps {
  score: number;
  size?: number;
}

const ScoreRing = ({ score, size = 140 }: ScoreRingProps) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const [displayScore, setDisplayScore] = useState(0);

  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v));

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => setDisplayScore(v));
    const controls = animate(motionValue, score, {
      duration: 1.8,
      ease: 'easeOut',
      delay: 0.3,
    });
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [score, motionValue, rounded]);

  const getColor = (s: number) => {
    if (s >= 80) return 'hsl(152 70% 40%)';
    if (s >= 60) return 'hsl(172 80% 40%)';
    if (s >= 40) return 'hsl(38 92% 55%)';
    return 'hsl(0 84% 60%)';
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.8, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl font-black text-foreground"
        >
          {displayScore}%
        </motion.span>
      </div>
    </div>
  );
};

export default ScoreRing;
