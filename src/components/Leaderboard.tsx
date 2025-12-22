import { motion } from 'framer-motion';
import { Trophy, Sparkles, Medal } from 'lucide-react';
import { DEMO_LEADERBOARD, LeaderboardEntry, formatAddress } from '@/lib/leaderboard';
import { formatXP } from '@/lib/level';

interface LeaderboardProps {
  entries?: LeaderboardEntry[];
  title?: string;
}

export function Leaderboard({ entries = DEMO_LEADERBOARD, title = 'Leaderboard (Session)' }: LeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-amber-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm text-muted-foreground">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-amber-500/20 to-transparent border-amber-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-transparent border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-700/20 to-transparent border-amber-700/30';
      default:
        return 'bg-muted/30 border-border/50';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Trophy className="w-5 h-5 text-primary" />
        <h3 className="font-display text-lg font-semibold">{title}</h3>
      </div>

      {/* Table */}
      <div className="p-4">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-muted-foreground uppercase tracking-wider">
              <th className="text-left pb-3 font-medium">Rank</th>
              <th className="text-left pb-3 font-medium">Adventurer</th>
              <th className="text-right pb-3 font-medium">XP</th>
              <th className="text-right pb-3 font-medium">Quests</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {entries.map((entry, index) => (
              <motion.tr
                key={entry.address}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${getRankBg(index + 1)} border-l-2`}
              >
                <td className="py-3 pl-2">
                  {getRankIcon(index + 1)}
                </td>
                <td className="py-3">
                  <span className="font-mono text-sm">{formatAddress(entry.address)}</span>
                </td>
                <td className="py-3 text-right">
                  <span className="font-semibold gradient-text">{formatXP(entry.totalXP)}</span>
                </td>
                <td className="py-3 text-right pr-2">
                  <span className="text-muted-foreground">{entry.questsCompleted}</span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {entries.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No quests completed yet this session</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
