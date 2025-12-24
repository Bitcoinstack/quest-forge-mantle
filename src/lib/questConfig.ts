// Quest configuration with static APRs and flavor text
// This can be updated when real quest data is available

export interface QuestConfig {
  id: number;
  name: string;
  description: string;
  flavorText: string;
  estimatedAPR: number; // Percentage
  difficulty: 'Novice' | 'Adept' | 'Veteran' | 'Legendary';
  icon: string;
  color: string;
  gameType: 'chess' | 'tower_defense';
  level: number;
}

// Static quest configurations matching expected contract quests
export const QUEST_CONFIGS: Record<number, QuestConfig> = {
  1: {
    id: 1,
    name: 'Chess Strategy Quest',
    description: 'Master the ancient game of kings',
    flavorText: 'Prove your strategic prowess on the checkered battlefield. Win games to earn XP and rewards.',
    estimatedAPR: 8,
    difficulty: 'Adept',
    icon: '♟️',
    color: 'from-slate-600 to-slate-800',
    gameType: 'chess',
    level: 1,
  },
  2: {
    id: 2,
    name: 'Tower Defense Quest',
    description: 'Build and defend your kingdom',
    flavorText: 'Construct mighty towers to repel waves of enemies. Upgrade and unlock new strategies.',
    estimatedAPR: 12,
    difficulty: 'Veteran',
    icon: '🏰',
    color: 'from-emerald-600 to-emerald-800',
    gameType: 'tower_defense',
    level: 1,
  },
};

// Get quest config by ID, with fallback for unknown quests
export function getQuestConfig(questId: number): QuestConfig {
  return QUEST_CONFIGS[questId] || {
    id: questId,
    name: `Quest #${questId}`,
    description: 'An unknown quest awaits',
    flavorText: 'Mysteries abound in this unexplored territory.',
    estimatedAPR: 5,
    difficulty: 'Novice',
    icon: '❓',
    color: 'from-gray-500 to-gray-600',
    gameType: 'chess',
    level: 1,
  };
}

// Format duration from seconds to human-readable
export function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  
  if (days > 0) {
    return days === 1 ? '1 day' : `${days} days`;
  }
  return hours === 1 ? '1 hour' : `${hours} hours`;
}

// Format time remaining with more precision
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Ready!';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
}

// Calculate estimated yield based on amount, APR, and duration
export function calculateEstimatedYield(
  amount: bigint,
  aprPercent: number,
  durationSeconds: number,
  decimals: number = 18
): string {
  const durationDays = durationSeconds / 86400;
  const amountNumber = Number(amount) / Math.pow(10, decimals);
  const yearlyYield = amountNumber * (aprPercent / 100);
  const questYield = yearlyYield * (durationDays / 365);
  
  return questYield.toFixed(4);
}

// Demo quests for testing when contract is not connected
export const DEMO_QUESTS = [
  {
    id: 1n,
    name: 'Chess Strategy Quest',
    minDuration: 604800n, // 7 days
    minAmount: 100n * 10n ** 18n, // 100 tokens
    stakingToken: '0x0000000000000000000000000000000000000001',
    gameType: 'chess' as const,
    level: 1,
  },
  {
    id: 2n,
    name: 'Tower Defense Quest',
    minDuration: 1209600n, // 14 days
    minAmount: 250n * 10n ** 18n, // 250 tokens
    stakingToken: '0x0000000000000000000000000000000000000001',
    gameType: 'tower_defense' as const,
    level: 1,
  },
];
