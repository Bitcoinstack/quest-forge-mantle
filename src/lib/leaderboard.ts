export interface LeaderboardEntry {
  address: string;
  totalXP: number;
  questsCompleted: number;
}

// Demo leaderboard data for display
export const DEMO_LEADERBOARD: LeaderboardEntry[] = [
  { address: '0x1234...5678', totalXP: 45000, questsCompleted: 12 },
  { address: '0xabcd...efgh', totalXP: 32500, questsCompleted: 8 },
  { address: '0x9876...5432', totalXP: 28000, questsCompleted: 7 },
  { address: '0xfedc...ba98', totalXP: 21500, questsCompleted: 6 },
  { address: '0x2468...1357', totalXP: 15000, questsCompleted: 4 },
];

// Format address for display
export function formatAddress(address: string): string {
  if (address.includes('...')) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
