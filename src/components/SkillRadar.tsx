import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface SkillRadarProps {
    strongSkills: string[];
    weakSkills: string[];
    missingSkills: string[];
}

export function SkillRadar({ strongSkills, weakSkills, missingSkills }: SkillRadarProps) {
    // Build radar data from skills
    const radarData = [
        ...strongSkills.slice(0, 4).map((skill) => ({
            skill: skill.length > 12 ? skill.slice(0, 12) + '…' : skill,
            value: Math.floor(Math.random() * 15) + 80, // 80-95 for strong
            fullMark: 100,
        })),
        ...weakSkills.slice(0, 3).map((skill) => ({
            skill: skill.length > 12 ? skill.slice(0, 12) + '…' : skill,
            value: Math.floor(Math.random() * 20) + 40, // 40-60 for weak
            fullMark: 100,
        })),
        ...missingSkills.slice(0, 3).map((skill) => ({
            skill: skill.length > 12 ? skill.slice(0, 12) + '…' : skill,
            value: Math.floor(Math.random() * 15) + 5, // 5-20 for missing
            fullMark: 100,
        })),
    ];

    if (radarData.length < 3) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
            className="bg-card border border-border rounded-2xl p-6 shadow-sm"
        >
            <p className="text-sm font-medium text-muted-foreground mb-4 text-center">Skill Proficiency Map</p>
            <ResponsiveContainer width="100%" height={280}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid
                        stroke="hsl(var(--border))"
                        strokeDasharray="3 3"
                    />
                    <PolarAngleAxis
                        dataKey="skill"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    />
                    <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={false}
                        axisLine={false}
                    />
                    <Radar
                        name="Skills"
                        dataKey="value"
                        stroke="hsl(172, 80%, 40%)"
                        fill="hsl(172, 80%, 40%)"
                        fillOpacity={0.2}
                        strokeWidth={2}
                        animationBegin={300}
                        animationDuration={1200}
                        animationEasing="ease-out"
                    />
                </RadarChart>
            </ResponsiveContainer>
        </motion.div>
    );
}
