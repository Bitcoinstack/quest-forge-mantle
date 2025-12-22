// Contract addresses and ABIs for Yield Quest RPG
// Replace these with actual deployed contract addresses

export const MANTLE_CHAIN_ID = 5000;

export const MANTLE_CHAIN_CONFIG = {
  id: 5000,
  name: 'Mantle',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: { http: ['https://rpc.mantle.xyz'] },
    public: { http: ['https://rpc.mantle.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Mantle Explorer', url: 'https://explorer.mantle.xyz' },
  },
} as const;

// Quest Staking Contract Address - Replace with actual deployed address
export const QUEST_STAKING_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

// Quest and UserQuest types matching the contract
export interface Quest {
  id: bigint;
  name: string;
  minDuration: bigint;
  minAmount: bigint;
  stakingToken: string;
}

export interface UserQuest {
  questId: bigint;
  amount: bigint;
  startTime: bigint;
  endTime: bigint;
  xpEarned: bigint;
}

// ABI for QuestStaking contract
export const QUEST_STAKING_ABI = [
  {
    name: 'getQuests',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      {
        type: 'tuple[]',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'name', type: 'string' },
          { name: 'minDuration', type: 'uint256' },
          { name: 'minAmount', type: 'uint256' },
          { name: 'stakingToken', type: 'address' },
        ],
      },
    ],
  },
  {
    name: 'getUserQuestState',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      {
        name: 'active',
        type: 'tuple[]',
        components: [
          { name: 'questId', type: 'uint256' },
          { name: 'amount', type: 'uint256' },
          { name: 'startTime', type: 'uint256' },
          { name: 'endTime', type: 'uint256' },
          { name: 'xpEarned', type: 'uint256' },
        ],
      },
      {
        name: 'completed',
        type: 'tuple[]',
        components: [
          { name: 'questId', type: 'uint256' },
          { name: 'amount', type: 'uint256' },
          { name: 'startTime', type: 'uint256' },
          { name: 'endTime', type: 'uint256' },
          { name: 'xpEarned', type: 'uint256' },
        ],
      },
    ],
  },
  {
    name: 'joinQuest',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'questId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'completeQuest',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'questId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'getUserTotalXP',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'getUserCompletedCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  // Events
  {
    name: 'QuestJoined',
    type: 'event',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'questId', type: 'uint256', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'startTime', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'QuestCompleted',
    type: 'event',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'questId', type: 'uint256', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'xpEarned', type: 'uint256', indexed: false },
      { name: 'endTime', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'LevelUp',
    type: 'event',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'newLevel', type: 'uint256', indexed: false },
      { name: 'totalXP', type: 'uint256', indexed: false },
    ],
  },
] as const;

// Standard ERC-20 ABI for token interactions
export const ERC20_ABI = [
  {
    name: 'name',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint8' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
] as const;
