import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { Header } from '@/components/Header';
import { UserStats } from '@/components/UserStats';
import { ActiveQuestCard, CompletedQuestCard } from '@/components/ActiveQuestCard';
import { Leaderboard } from '@/components/Leaderboard';
import { QuestCompleteModal } from '@/components/QuestCompleteModal';
import { WalletButton } from '@/components/WalletButton';
import { Scroll, History, Sparkles, Wallet } from 'lucide-react';
import type { UserQuest } from '@/lib/contracts';
import { DEMO_QUESTS } from '@/lib/questConfig';
import { toast } from 'sonner';

// Demo data for testing
const DEMO_ACTIVE_QUESTS: UserQuest[] = [
  {
    questId: 1n,
    amount: 500n * 10n ** 18n,
    startTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 5), // Started 5 days ago
    endTime: 0n,
    xpEarned: 0n,
  },
  {
    questId: 2n,
    amount: 1000n * 10n ** 18n,
    startTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 25), // Started 25 days ago
    endTime: 0n,
    xpEarned: 0n,
  },
];

const DEMO_COMPLETED_QUESTS: UserQuest[] = [
  {
    questId: 1n,
    amount: 200n * 10n ** 18n,
    startTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 14),
    endTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 7),
    xpEarned: 1400n,
  },
  {
    questId: 3n,
    amount: 800n * 10n ** 18n,
    startTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 90),
    endTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 30),
    xpEarned: 9600n,
  },
];

export default function Journey() {
  const { address, isConnected } = useAccount();
  const [completedQuest, setCompletedQuest] = useState<UserQuest | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completingQuestId, setCompletingQuestId] = useState<bigint | null>(null);

  // Demo user stats (replace with contract calls)
  const totalXP = 11000;
  const questsCompleted = 2;
  const totalYieldGenerated = 45.5;

  const handleCompleteQuest = async (questId: bigint) => {
    setCompletingQuestId(questId);
    
    try {
      // Simulate contract call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Find the completed quest for the modal
      const quest = DEMO_ACTIVE_QUESTS.find(q => q.questId === questId);
      if (quest) {
        const completedQuestData: UserQuest = {
          ...quest,
          endTime: BigInt(Math.floor(Date.now() / 1000)),
          xpEarned: 1500n, // Demo XP
        };
        setCompletedQuest(completedQuestData);
        setIsCompleteModalOpen(true);
      }
      
      toast.success('Quest completed successfully!');
    } catch (error) {
      toast.error('Failed to complete quest');
    } finally {
      setCompletingQuestId(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
              <Wallet className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-4">
              Connect Your Wallet
            </h1>
            <p className="text-muted-foreground mb-8">
              Connect your wallet to view your quest progress, XP, and rewards.
            </p>
            <WalletButton />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            My <span className="gradient-text">Journey</span>
          </h1>
          <p className="text-muted-foreground">
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
              questsCompleted={questsCompleted}
              totalYieldGenerated={totalYieldGenerated}
            />

            {/* Active Quests */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Scroll className="w-5 h-5 text-accent" />
                <h2 className="font-display text-xl font-semibold">Active Quests</h2>
                <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-semibold">
                  {DEMO_ACTIVE_QUESTS.length}
                </span>
              </div>

              {DEMO_ACTIVE_QUESTS.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {DEMO_ACTIVE_QUESTS.map((quest) => (
                    <ActiveQuestCard
                      key={quest.questId.toString()}
                      userQuest={quest}
                      questInfo={DEMO_QUESTS.find(q => q.id === quest.questId)}
                      onComplete={handleCompleteQuest}
                      isCompleting={completingQuestId === quest.questId}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 rounded-xl border border-dashed border-border">
                  <Sparkles className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No active quests</p>
                  <p className="text-sm text-muted-foreground/70">
                    Join a quest from the home page to get started!
                  </p>
                </div>
              )}
            </motion.section>

            {/* Completed Quests */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-semibold">Completed Quests</h2>
              </div>

              {DEMO_COMPLETED_QUESTS.length > 0 ? (
                <div className="space-y-3">
                  {DEMO_COMPLETED_QUESTS.map((quest, index) => (
                    <CompletedQuestCard key={index} userQuest={quest} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 rounded-xl border border-dashed border-border">
                  <p className="text-muted-foreground">No completed quests yet</p>
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

      {/* Quest Complete Modal */}
      <QuestCompleteModal
        quest={completedQuest}
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setIsCompleteModalOpen(false);
          setCompletedQuest(null);
        }}
        totalXP={totalXP + (completedQuest ? Number(completedQuest.xpEarned) : 0)}
      />
    </div>
  );
}
