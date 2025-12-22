import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getQuestConfig, formatDuration } from '@/lib/questConfig';
import { Clock, Coins, TrendingUp, Sparkles } from 'lucide-react';
import type { Quest } from '@/lib/contracts';

interface QuestCardProps {
  quest: Quest;
  onJoinQuest: (quest: Quest) => void;
  isConnected: boolean;
}

export function QuestCard({ quest, onJoinQuest, isConnected }: QuestCardProps) {
  const config = getQuestConfig(Number(quest.id));
  const durationDays = Number(quest.minDuration) / 86400;
  const minAmount = Number(quest.minAmount) / 1e18;

  const difficultyColors = {
    Novice: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
    Adept: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    Veteran: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    Legendary: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
  };

  const difficultyBadgeColors = {
    Novice: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Adept: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Veteran: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Legendary: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={`quest-card group relative overflow-hidden border bg-gradient-to-br ${difficultyColors[config.difficulty]}`}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      {/* Content */}
      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{config.icon}</span>
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                {config.name}
              </h3>
              <p className="text-sm text-muted-foreground">{config.description}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${difficultyBadgeColors[config.difficulty]}`}>
            {config.difficulty}
          </span>
        </div>

        {/* Flavor text */}
        <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">
          "{config.flavorText}"
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-accent" />
            <div>
              <p className="text-muted-foreground text-xs">Duration</p>
              <p className="font-semibold text-foreground">{formatDuration(Number(quest.minDuration))}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Coins className="w-4 h-4 text-primary" />
            <div>
              <p className="text-muted-foreground text-xs">Min Stake</p>
              <p className="font-semibold text-foreground">{minAmount.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-success-teal" />
            <div>
              <p className="text-muted-foreground text-xs">Est. APR</p>
              <p className="font-semibold text-success-teal">{config.estimatedAPR}%</p>
            </div>
          </div>
        </div>

        {/* Action */}
        <Button
          onClick={() => onJoinQuest(quest)}
          disabled={!isConnected}
          className="w-full gap-2 bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-600/90 text-primary-foreground font-semibold shadow-lg hover:shadow-primary/25 transition-all duration-300 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {isConnected ? 'Join Quest' : 'Connect Wallet to Join'}
        </Button>
      </div>

      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
    </motion.div>
  );
}
