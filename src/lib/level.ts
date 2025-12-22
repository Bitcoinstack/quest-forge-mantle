// XP to Level mapping for Yield Quest RPG
// All level calculations happen off-chain in the frontend

export interface LevelInfo {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  color: string;
  icon: string;
}

// Level thresholds and titles
export const LEVEL_CONFIG: LevelInfo[] = [
  { level: 1, title: 'Initiate', minXP: 0, maxXP: 999, color: 'text-gray-400', icon: '🌱' },
  { level: 2, title: 'Adventurer', minXP: 1000, maxXP: 4999, color: 'text-emerald-400', icon: '⚔️' },
  { level: 3, title: 'Warrior', minXP: 5000, maxXP: 14999, color: 'text-blue-400', icon: '🗡️' },
  { level: 4, title: 'Champion', minXP: 15000, maxXP: 29999, color: 'text-purple-400', icon: '🛡️' },
  { level: 5, title: 'Legend', minXP: 30000, maxXP: Infinity, color: 'text-amber-400', icon: '👑' },
];

// Get level from XP
export function getLevelFromXP(totalXP: number): number {
  for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_CONFIG[i].minXP) {
      return LEVEL_CONFIG[i].level;
    }
  }
  return 1;
}

// Get full level info from XP
export function getLevelInfo(totalXP: number): LevelInfo {
  for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_CONFIG[i].minXP) {
      return LEVEL_CONFIG[i];
    }
  }
  return LEVEL_CONFIG[0];
}

// Get progress to next level (0-100)
export function getProgressToNextLevel(totalXP: number): number {
  const currentLevel = getLevelInfo(totalXP);
  const nextLevelIndex = LEVEL_CONFIG.findIndex(l => l.level === currentLevel.level + 1);
  
  if (nextLevelIndex === -1) {
    return 100; // Max level reached
  }
  
  const nextLevel = LEVEL_CONFIG[nextLevelIndex];
  const xpInCurrentLevel = totalXP - currentLevel.minXP;
  const xpNeededForNextLevel = nextLevel.minXP - currentLevel.minXP;
  
  return Math.min(100, Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100));
}

// Get XP needed for next level
export function getXPForNextLevel(totalXP: number): number {
  const currentLevel = getLevelInfo(totalXP);
  const nextLevelIndex = LEVEL_CONFIG.findIndex(l => l.level === currentLevel.level + 1);
  
  if (nextLevelIndex === -1) {
    return 0; // Max level reached
  }
  
  return LEVEL_CONFIG[nextLevelIndex].minXP - totalXP;
}

// Format large XP numbers
export function formatXP(xp: number): string {
  if (xp >= 1000000) {
    return `${(xp / 1000000).toFixed(1)}M`;
  }
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`;
  }
  return xp.toString();
}

// Calculate XP reward based on amount and duration (demo calculation)
export function calculateXPReward(amount: bigint, durationSeconds: number, decimals: number = 18): number {
  const amountNumber = Number(amount) / Math.pow(10, decimals);
  const durationDays = durationSeconds / 86400;
  
  // Base XP: 10 XP per token per day
  const baseXP = Math.floor(amountNumber * durationDays * 10);
  
  // Bonus for longer quests
  let multiplier = 1;
  if (durationDays >= 90) multiplier = 2.0;
  else if (durationDays >= 60) multiplier = 1.5;
  else if (durationDays >= 30) multiplier = 1.25;
  
  return Math.floor(baseXP * multiplier);
}
