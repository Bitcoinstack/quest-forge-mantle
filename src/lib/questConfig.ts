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
}

// Static quest configurations matching expected contract quests
export const QUEST_CONFIGS: Record<number, QuestConfig> = {
  1: {
    id: 1,
    name: 'Novice Expedition',
    description: 'A short quest for cautious adventurers',
    flavorText: 'Begin your journey with a simple expedition. Low risk, steady rewards.',
    estimatedAPR: 5,
    difficulty: 'Novice',
    icon: '⚔️',
    color: 'from-emerald-500 to-teal-600',
  },
  2: {
    id: 2,
    name: 'Adept Journey',
    description: 'For those seeking greater challenges',
    flavorText: 'A month-long adventure awaits. Higher stakes, better treasures.',
    estimatedAPR: 8,
    difficulty: 'Adept',
    icon: '🗡️',
    color: 'from-blue-500 to-indigo-600',
  },
  3: {
    id: 3,
    name: 'Veteran Campaign',
    description: 'Extended expedition for seasoned warriors',
    flavorText: 'Two months of relentless questing. Glory awaits the persistent.',
    estimatedAPR: 12,
    difficulty: 'Veteran',
    icon: '🛡️',
    color: 'from-purple-500 to-violet-600',
  },
  4: {
    id: 4,
    name: 'Legendary Voyage',
    description: 'The ultimate test of dedication',
    flavorText: 'Three months in the deepest dungeons. Only legends emerge.',
    estimatedAPR: 18,
    difficulty: 'Legendary',
    icon: '👑',
    color: 'from-amber-500 to-orange-600',
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
    name: 'Novice Expedition',
    minDuration: 604800n, // 7 days
    minAmount: 100n * 10n ** 18n, // 100 tokens
    stakingToken: '0x0000000000000000000000000000000000000001',
  },
  {
    id: 2n,
    name: 'Adept Journey',
    minDuration: 2592000n, // 30 days
    minAmount: 500n * 10n ** 18n, // 500 tokens
    stakingToken: '0x0000000000000000000000000000000000000001',
  },
  {
    id: 3n,
    name: 'Veteran Campaign',
    minDuration: 5184000n, // 60 days
    minAmount: 1000n * 10n ** 18n, // 1000 tokens
    stakingToken: '0x0000000000000000000000000000000000000001',
  },
  {
    id: 4n,
    name: 'Legendary Voyage',
    minDuration: 7776000n, // 90 days
    minAmount: 5000n * 10n ** 18n, // 5000 tokens
    stakingToken: '0x0000000000000000000000000000000000000001',
  },
];
