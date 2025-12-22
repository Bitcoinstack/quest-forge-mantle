import { motion } from 'framer-motion';
import { getQuestConfig, formatTimeRemaining } from '@/lib/questConfig';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Coins, Sparkles, CheckCircle2 } from 'lucide-react';
import type { UserQuest, Quest } from '@/lib/contracts';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ActiveQuestCardProps {
  userQuest: UserQuest;
  questInfo?: Quest;
  onComplete: (questId: bigint) => void;
  isCompleting?: boolean;
}

export function ActiveQuestCard({ userQuest, questInfo, onComplete, isCompleting }: ActiveQuestCardProps) {
  const config = getQuestConfig(Number(userQuest.questId));
  const amount = Number(userQuest.amount) / 1e18;
  const startTime = Number(userQuest.startTime);
  const minDuration = questInfo ? Number(questInfo.minDuration) : 604800; // Default 7 days
  
  const now = Math.floor(Date.now() / 1000);
  const elapsed = now - startTime;
  const progress = Math.min(100, (elapsed / minDuration) * 100);
  const isReady = elapsed >= minDuration;
  const timeRemaining = minDuration - elapsed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="quest-card p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h4 className="font-display font-semibold">{config.name}</h4>
            <p className="text-sm text-muted-foreground">{config.difficulty}</p>
          </div>
        </div>
        {isReady && (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-accent/20 text-accent border border-accent/30 animate-pulse">
            Ready!
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Staked</p>
            <p className="font-semibold">{amount.toLocaleString()} tokens</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent" />
          <div>
            <p className="text-xs text-muted-foreground">
              {isReady ? 'Status' : 'Time Left'}
            </p>
            <p className={`font-semibold ${isReady ? 'text-accent' : ''}`}>
              {isReady ? 'Complete!' : formatTimeRemaining(timeRemaining)}
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold">{Math.floor(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Action */}
      {isReady ? (
        <Button
          onClick={() => onComplete(userQuest.questId)}
          disabled={isCompleting}
          className="w-full gap-2 bg-gradient-to-r from-accent to-teal-500 hover:from-accent/90 hover:to-teal-500/90 text-accent-foreground"
        >
          <CheckCircle2 className="w-4 h-4" />
          {isCompleting ? 'Completing...' : 'Complete Quest'}
        </Button>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                disabled
                className="w-full gap-2 opacity-50 cursor-not-allowed"
              >
                <Clock className="w-4 h-4" />
                Quest in Progress
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Quest not ready yet. Wait {formatTimeRemaining(timeRemaining)}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </motion.div>
  );
}

interface CompletedQuestCardProps {
  userQuest: UserQuest;
}

export function CompletedQuestCard({ userQuest }: CompletedQuestCardProps) {
  const config = getQuestConfig(Number(userQuest.questId));
  const amount = Number(userQuest.amount) / 1e18;
  const xpEarned = Number(userQuest.xpEarned);
  const completedDate = new Date(Number(userQuest.endTime) * 1000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl opacity-75">{config.icon}</span>
        <div>
          <h4 className="font-semibold">{config.name}</h4>
          <p className="text-xs text-muted-foreground">
            {completedDate.toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="text-right">
        <div className="flex items-center gap-1 text-primary">
          <Sparkles className="w-4 h-4" />
          <span className="font-semibold">+{xpEarned} XP</span>
        </div>
        <p className="text-xs text-muted-foreground">{amount.toLocaleString()} tokens</p>
      </div>
    </motion.div>
  );
}
