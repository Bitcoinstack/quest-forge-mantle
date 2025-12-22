import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { Header } from '@/components/Header';
import { QuestCard } from '@/components/QuestCard';
import { JoinQuestModal } from '@/components/JoinQuestModal';
import { DEMO_QUESTS } from '@/lib/questConfig';
import { Sparkles, Wallet, Clock, TrendingUp, Shield } from 'lucide-react';
import type { Quest } from '@/lib/contracts';

export default function Landing() {
  const { isConnected } = useAccount();
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use demo quests for now (replace with contract call when connected)
  const quests = DEMO_QUESTS;

  const handleJoinQuest = (quest: Quest) => {
    setSelectedQuest(quest);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedQuest(null);
  };

  const handleSuccess = () => {
    // Refresh quests/user state
    console.log('Quest joined successfully!');
  };

  const steps = [
    {
      icon: Wallet,
      title: 'Connect Wallet',
      description: 'Connect your wallet on Mantle network to begin your adventure.',
    },
    {
      icon: Clock,
      title: 'Choose a Quest',
      description: 'Select a quest that matches your risk appetite and stake your tokens.',
    },
    {
      icon: TrendingUp,
      title: 'Claim Rewards',
      description: 'Return after the quest duration to claim your yield and XP rewards.',
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6"
            >
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Powered by Mantle</span>
            </motion.div>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="gradient-text glow-text">Yield Quest RPG</span>
              <br />
              <span className="text-foreground">on Mantle</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Send your yield-bearing tokens on epic quests. Earn real yield + RPG rewards. 
              Level up your adventure and climb the leaderboard.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm">Earn XP & Level Up</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span className="text-sm">Real Yield Rewards</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quest Grid */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Available <span className="gradient-text">Quests</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Choose your adventure. Each quest offers different durations, minimum stakes, and rewards.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {quests.map((quest, index) => (
            <motion.div
              key={quest.id.toString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <QuestCard
                quest={quest}
                onJoinQuest={handleJoinQuest}
                isConnected={isConnected}
              />
            </motion.div>
          ))}
        </div>

        {!isConnected && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-muted-foreground mt-8"
          >
            Connect your wallet to join quests
          </motion.p>
        )}
      </section>

      {/* How it Works */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            How it <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Three simple steps to start your yield-generating adventure.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative text-center p-6"
            >
              {/* Step number */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center text-primary-foreground font-bold text-sm">
                {index + 1}
              </div>

              {/* Icon */}
              <div className="w-16 h-16 mx-auto mb-4 mt-4 rounded-2xl bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                <step.icon className="w-8 h-8 text-primary" />
              </div>

              <h3 className="font-display text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Yield Quest RPG on Mantle • Built for DeFi adventurers</p>
        </div>
      </footer>

      {/* Join Quest Modal */}
      <JoinQuestModal
        quest={selectedQuest}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
