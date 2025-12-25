import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getQuestConfig } from '@/lib/questConfig';
import { Coins, TrendingUp, Gamepad2, Castle, Crown } from 'lucide-react';
import type { Quest } from '@/lib/contracts';
import chessHero from '@/assets/chess-hero.jpeg';
import towerDefenseHero from '@/assets/tower-defense-hero.jpeg';

interface GameQuestCardProps {
  quest: Quest & { gameType: 'chess' | 'tower_defense'; level: number };
  onJoinQuest: (quest: Quest) => void;
  isConnected: boolean;
}

export function GameQuestCard({ quest, onJoinQuest, isConnected }: GameQuestCardProps) {
  const config = getQuestConfig(Number(quest.id));
  const minAmount = Number(quest.minAmount) / 1e18;

  const gameImages = {
    chess: chessHero,
    tower_defense: towerDefenseHero,
  };

  const gameIcons = {
    chess: Crown,
    tower_defense: Castle,
  };

  const GameIcon = gameIcons[quest.gameType];

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="game-card group relative overflow-hidden"
    >
      {/* Image Background */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={gameImages[quest.gameType]}
          alt={config.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
        
        {/* Level Badge */}
        <div className="absolute top-4 left-4 px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-lg border border-border">
          <span className="text-xs font-bold text-foreground">LEVEL {quest.level}</span>
        </div>

        {/* Game Type Badge */}
        <div className="absolute top-4 right-4 px-3 py-1.5 bg-foreground/90 rounded-lg flex items-center gap-2">
          <GameIcon className="w-4 h-4 text-background" />
          <span className="text-xs font-bold text-background uppercase">
            {quest.gameType === 'chess' ? 'Chess' : 'Tower Defense'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">
            {config.name}
          </h3>
          <p className="text-foreground/60 text-sm">
            {config.flavorText}
          </p>
        </div>

        {/* Stats - Removed Duration */}
        <div className="grid grid-cols-2 gap-4 py-4 border-t border-border">
          <div className="text-center">
            <Coins className="w-5 h-5 text-foreground/50 mx-auto mb-1" />
            <p className="text-xs text-foreground/50">Min Stake</p>
            <p className="font-semibold text-foreground text-sm">{minAmount} tokens</p>
          </div>
          <div className="text-center">
            <TrendingUp className="w-5 h-5 text-foreground/50 mx-auto mb-1" />
            <p className="text-xs text-foreground/50">Est. APR</p>
            <p className="font-semibold text-foreground text-sm">{config.estimatedAPR}%</p>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => onJoinQuest(quest)}
          disabled={!isConnected}
          className="w-full h-12 gap-2 bg-foreground text-background hover:bg-foreground/90 font-bold text-base transition-all duration-300 disabled:opacity-50"
        >
          <Gamepad2 className="w-5 h-5" />
          {isConnected ? 'STAKE & PLAY' : 'CONNECT WALLET'}
        </Button>
      </div>
    </motion.div>
  );
}
