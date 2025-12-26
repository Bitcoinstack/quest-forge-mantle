import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { UserStats } from '@/components/UserStats';
import { Leaderboard } from '@/components/Leaderboard';
import { WalletButton } from '@/components/WalletButton';
import { Button } from '@/components/ui/button';
import { Scroll, History, Sparkles, Wallet, Gamepad2, Trophy, Crown, Castle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CompletedGame {
  id: string;
  game_type: string;
  difficulty: string;
  xp_earned: number;
  completed_at: string;
  game_data: { result?: string; moves?: number; wave?: number };
}

export default function Journey() {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const [completedGames, setCompletedGames] = useState<CompletedGame[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [gamesWon, setGamesWon] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      fetchPlayerData();
    }
  }, [address]);

  const fetchPlayerData = async () => {
    if (!address) return;
    
    try {
      // Fetch completed games
      const { data: games } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('wallet_address', address)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (games) {
        setCompletedGames(games.map(g => ({
          ...g,
          game_data: (g.game_data as { result?: string; moves?: number; wave?: number }) || {}
        })) as CompletedGame[]);
        const xp = games.reduce((sum, g) => sum + (g.xp_earned || 0), 0);
        setTotalXP(xp);
        const wins = games.filter(g => {
          const gameData = g.game_data as { result?: string } | null;
          return gameData?.result === 'win';
        }).length;
        setGamesWon(wins);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-foreground/10 flex items-center justify-center">
              <Wallet className="w-10 h-10 text-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              Connect Your Wallet
            </h1>
            <p className="text-foreground/60 mb-8">
              Connect your wallet to view your quest progress, XP, and rewards.
            </p>
            <WalletButton />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 md:py-12 pt-24">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2 text-foreground">
            My <span className="text-foreground">Journey</span>
          </h1>
          <p className="text-foreground/60">
            Track your quest progress, XP gains, and rewards.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* User Stats */}
            <UserStats
              address={address!}
              totalXP={totalXP}
              questsCompleted={completedGames.length}
              totalYieldGenerated={gamesWon * 10}
            />

            {/* Quick Play */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Gamepad2 className="w-5 h-5 text-foreground" />
                <h2 className="font-display text-xl font-semibold text-foreground">Play Now</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  onClick={() => navigate('/game/chess')}
                  className="h-20 gap-3 bg-foreground text-background hover:bg-foreground/90 font-bold text-lg"
                >
                  <Crown className="w-6 h-6" />
                  Chess Quest
                </Button>
                <Button
                  onClick={() => navigate('/game/tower_defense')}
                  className="h-20 gap-3 bg-foreground text-background hover:bg-foreground/90 font-bold text-lg"
                >
                  <Castle className="w-6 h-6" />
                  Tower Defense
                </Button>
              </div>
            </motion.section>

            {/* Completed Games */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-foreground" />
                <h2 className="font-display text-xl font-semibold text-foreground">Completed Games</h2>
              </div>

              {loading ? (
                <div className="text-center py-8 text-foreground/60">Loading...</div>
              ) : completedGames.length > 0 ? (
                <div className="space-y-3">
                  {completedGames.map((game) => (
                    <motion.div
                      key={game.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-card border border-border"
                    >
                      <div className="flex items-center gap-3">
                        {game.game_type === 'chess' ? (
                          <Crown className="w-6 h-6 text-foreground" />
                        ) : (
                          <Castle className="w-6 h-6 text-foreground" />
                        )}
                        <div>
                          <h4 className="font-semibold text-foreground capitalize">
                            {game.game_type === 'tower_defense' ? 'Tower Defense' : game.game_type}
                          </h4>
                          <p className="text-xs text-foreground/60">
                            {new Date(game.completed_at).toLocaleDateString()} • {game.difficulty}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-foreground">
                          {game.game_data?.result === 'win' ? (
                            <Trophy className="w-4 h-4" />
                          ) : null}
                          <Sparkles className="w-4 h-4" />
                          <span className="font-semibold">+{game.xp_earned} XP</span>
                        </div>
                        <p className="text-xs text-foreground/60">
                          {game.game_data?.result === 'win' ? 'Victory' : 'Completed'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 rounded-xl border border-dashed border-border">
                  <Sparkles className="w-10 h-10 mx-auto mb-3 text-foreground/30" />
                  <p className="text-foreground/60">No completed games yet</p>
                  <p className="text-sm text-foreground/40">
                    Start playing to earn XP and track your progress!
                  </p>
                </div>
              )}
            </motion.section>
          </div>

          {/* Sidebar - Leaderboard */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Leaderboard />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
