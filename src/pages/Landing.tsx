import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Header } from '@/components/Header';
import { GameQuestCard } from '@/components/GameQuestCard';
import { JoinQuestModal } from '@/components/JoinQuestModal';
import { DEMO_QUESTS } from '@/lib/questConfig';
import { Play, Scroll, Gamepad2, Shield, Zap, Trophy } from 'lucide-react';
import type { Quest } from '@/lib/contracts';
import warriorImage from '@/assets/warrior-character.png';

export default function Landing() {
  const { isConnected } = useAccount();
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const questSectionRef = useRef<HTMLDivElement>(null);

  const quests = DEMO_QUESTS;

  const handleJoinQuest = (quest: Quest) => {
    setSelectedQuest(quest);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedQuest(null);
  };

  const handleSuccess = (gameType: 'chess' | 'tower_defense') => {
    setIsModalOpen(false);
    setSelectedQuest(null);
    navigate(`/game/${gameType}`);
  };

  const scrollToQuests = () => {
    questSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section with Video Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="video-hero"
        >
          <source src="/videos/hero-video.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay */}
        <div className="hero-overlay" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-foreground/10 border border-foreground/20 mb-8"
            >
              <Shield className="w-4 h-4 text-foreground" />
              <span className="text-sm font-medium text-foreground">Powered by Mantle Network</span>
            </motion.div>

            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight text-foreground">
              YIELD QUEST
              <span className="block text-3xl md:text-4xl lg:text-5xl mt-2 text-foreground/80">
                ON MANTLE
              </span>
            </h1>

            <p className="text-lg md:text-xl text-foreground/70 mb-12 max-w-2xl mx-auto">
              Stake your tokens. Play epic games. Earn real yield and XP rewards.
            </p>

            {/* Play Button */}
            <motion.button
              onClick={scrollToQuests}
              className="play-button mx-auto"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-10 h-10 text-background ml-1" fill="currentColor" />
            </motion.button>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-foreground/50 mt-6 text-sm uppercase tracking-widest"
            >
              Click to Play
            </motion.p>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 rounded-full border-2 border-foreground/30 flex items-start justify-center p-2"
          >
            <motion.div className="w-1.5 h-1.5 rounded-full bg-foreground" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section - Stake Play Earn */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-foreground">
              STAKE. PLAY. EARN.
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              A new era of GameFi where your staking rewards unlock epic gaming experiences.
            </p>
          </motion.div>

          {/* Two column layout - Image left, Cards right */}
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
            {/* Left side - Character Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <img 
                src={warriorImage} 
                alt="Warrior Character" 
                className="max-h-[500px] object-contain drop-shadow-2xl"
              />
            </motion.div>

            {/* Right side - Feature Cards */}
            <div className="space-y-6">
              {[
                {
                  icon: Gamepad2,
                  title: 'Play Games',
                  description: 'Chess strategy and Tower Defense games with progressive difficulty.',
                },
                {
                  icon: Zap,
                  title: 'Earn XP',
                  description: 'Level up your character through gameplay achievements and challenges.',
                },
                {
                  icon: Trophy,
                  title: 'Win Rewards',
                  description: 'Stake tokens to unlock games and earn yield while you play.',
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-6 p-6 rounded-2xl bg-card border border-border hover:border-foreground/20 transition-all duration-300"
                >
                  <div className="w-14 h-14 shrink-0 rounded-xl bg-foreground/10 flex items-center justify-center">
                    <feature.icon className="w-7 h-7 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                    <p className="text-foreground/60 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Available Quests Section */}
      <section ref={questSectionRef} className="py-20 bg-background" id="quests">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 border border-foreground/10 mb-6">
              <Scroll className="w-4 h-4 text-foreground" />
              <span className="text-sm font-medium text-foreground">Available Quests</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-foreground">
              CHOOSE YOUR GAME
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              Each quest unlocks a unique game. Stake tokens, play to earn XP, and climb the leaderboard.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {quests.map((quest, index) => (
              <motion.div
                key={quest.id.toString()}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <GameQuestCard
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
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center text-foreground/50 mt-8"
            >
              Connect your wallet to join quests
            </motion.p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-background">
        <div className="container mx-auto px-4 text-center text-sm text-foreground/50">
          <p>Yield Quest on Mantle • Built for DeFi Gamers</p>
        </div>
      </footer>

      {/* Join Quest Modal */}
      <JoinQuestModal
        quest={selectedQuest}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={() => handleSuccess(selectedQuest?.gameType || 'chess')}
      />
    </div>
  );
}
