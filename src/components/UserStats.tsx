import { motion } from 'framer-motion';
import { getLevelInfo, getProgressToNextLevel, getXPForNextLevel, formatXP, LEVEL_CONFIG } from '@/lib/level';
import { Sparkles, Star, Trophy, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface UserStatsProps {
  address: string;
  totalXP: number;
  questsCompleted: number;
  totalYieldGenerated?: number;
}

export function UserStats({ address, totalXP, questsCompleted, totalYieldGenerated = 0 }: UserStatsProps) {
  const levelInfo = getLevelInfo(totalXP);
  const progress = getProgressToNextLevel(totalXP);
  const xpToNext = getXPForNextLevel(totalXP);
  
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const stats = [
    {
      icon: Sparkles,
      label: 'Total XP',
      value: formatXP(totalXP),
      color: 'text-primary',
    },
    {
      icon: Trophy,
      label: 'Quests Done',
      value: questsCompleted.toString(),
      color: 'text-accent',
    },
    {
      icon: Target,
      label: 'Est. Yield',
      value: `${totalYieldGenerated.toFixed(2)} tokens`,
      color: 'text-success-teal',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-gradient-to-br from-card to-secondary/20 overflow-hidden"
    >
      {/* Header with level badge */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Adventurer</p>
            <p className="font-mono text-lg">{formatAddress(address)}</p>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="level-badge px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <span className="text-2xl">{levelInfo.icon}</span>
            <div className="text-primary-foreground">
              <p className="text-xs font-medium opacity-80">Level {levelInfo.level}</p>
              <p className="font-display font-bold">{levelInfo.title}</p>
            </div>
          </motion.div>
        </div>

        {/* Level progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress to Level {levelInfo.level + 1}</span>
            <span className="font-semibold gradient-text">
              {levelInfo.level >= LEVEL_CONFIG.length ? 'MAX LEVEL' : `${xpToNext} XP to go`}
            </span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 divide-x divide-border">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 text-center"
          >
            <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className="font-semibold text-lg">{stat.value}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
