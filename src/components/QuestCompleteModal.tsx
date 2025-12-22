import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getQuestConfig } from '@/lib/questConfig';
import { formatXP, getLevelInfo, getProgressToNextLevel } from '@/lib/level';
import { CheckCircle2, Sparkles, TrendingUp, Star } from 'lucide-react';
import type { UserQuest } from '@/lib/contracts';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface QuestCompleteModalProps {
  quest: UserQuest | null;
  isOpen: boolean;
  onClose: () => void;
  totalXP: number;
}

export function QuestCompleteModal({ quest, isOpen, onClose, totalXP }: QuestCompleteModalProps) {
  useEffect(() => {
    if (isOpen && quest) {
      // Trigger confetti on success
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#a855f7', '#14b8a6']
      });
    }
  }, [isOpen, quest]);

  if (!quest) return null;

  const config = getQuestConfig(Number(quest.questId));
  const xpEarned = Number(quest.xpEarned);
  const amountReturned = Number(quest.amount) / 1e18;
  const levelInfo = getLevelInfo(totalXP);
  const progress = getProgressToNextLevel(totalXP);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border overflow-hidden">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-center gradient-text">
            Quest Completed!
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 py-4"
        >
          {/* Quest badge */}
          <div className="flex flex-col items-center gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="text-5xl">{config.icon}</span>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-accent flex items-center justify-center"
              >
                <CheckCircle2 className="w-5 h-5 text-accent-foreground" />
              </motion.div>
            </motion.div>

            <div className="text-center">
              <h3 className="font-display text-xl font-bold">{config.name}</h3>
              <p className="text-sm text-muted-foreground">Adventure complete!</p>
            </div>
          </div>

          {/* Rewards */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-lg bg-muted/50 border border-border"
            >
              <div className="flex items-center gap-2 text-primary mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-medium">XP Earned</span>
              </div>
              <p className="text-2xl font-bold gradient-text">+{formatXP(xpEarned)}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="p-4 rounded-lg bg-muted/50 border border-border"
            >
              <div className="flex items-center gap-2 text-accent mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Tokens Returned</span>
              </div>
              <p className="text-2xl font-bold">{amountReturned.toLocaleString()}</p>
            </motion.div>
          </div>

          {/* Level progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-4 rounded-lg bg-gradient-to-r from-secondary/50 to-muted/50 border border-border"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                <span className="font-semibold">Level {levelInfo.level}: {levelInfo.title}</span>
              </div>
              <span className="text-sm text-muted-foreground">{formatXP(totalXP)} XP</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ delay: 0.7, duration: 1 }}
                className="h-full progress-bar-fill rounded-full"
              />
            </div>
          </motion.div>

          {/* Close button */}
          <Button
            onClick={onClose}
            className="w-full gap-2 bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-600/90"
          >
            <Sparkles className="w-4 h-4" />
            Continue Adventure
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
