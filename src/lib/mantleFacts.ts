// Comprehensive Mantle Network facts database
// These facts are displayed constantly during gameplay to educate users

export const MANTLE_FACTS = {
  // Core Technology Facts
  technology: [
    "🔗 Mantle is an Ethereum Layer 2 (L2) scaling solution using Optimistic Rollup technology.",
    "⚡ Mantle can process over 1,000+ transactions per second (TPS), compared to Ethereum's ~15 TPS.",
    "💰 Gas fees on Mantle are 80-95% lower than Ethereum mainnet. Transactions often cost less than $0.01!",
    "🏗️ Mantle uses a modular architecture - separating Data Availability, Execution, and Consensus layers.",
    "🔐 Mantle inherits Ethereum's security guarantees through cryptographic proofs.",
    "📊 Mantle's Data Availability layer uses EigenDA for efficient data storage and compression.",
    "🎯 Mantle is 100% EVM-compatible - deploy your Solidity smart contracts without any changes!",
    "⏱️ Transaction finality on Mantle takes only a few seconds, not minutes like on mainnet.",
    "🌐 Mantle Network's block time is approximately 2 seconds for ultra-fast confirmations.",
  ],
  
  // MNT Token Facts
  token: [
    "💎 $MNT is the native token of Mantle Network, used for gas fees and governance.",
    "🗳️ MNT holders can participate in Mantle Governance to vote on protocol upgrades.",
    "🔥 MNT is used to pay for transaction fees on the Mantle Network.",
    "📈 The Mantle Treasury is one of the largest DAO treasuries in crypto.",
    "💼 MNT can be staked to earn rewards while supporting network security.",
    "🌟 $MNT powers the entire Mantle ecosystem - DeFi, NFTs, Gaming, and more!",
  ],
  
  // Ecosystem Facts
  ecosystem: [
    "🎮 Mantle supports gaming dApps with low-latency transactions and minimal fees.",
    "🏦 Major DeFi protocols are live on Mantle - DEXs, lending platforms, and yield farms.",
    "🎨 NFT marketplaces on Mantle offer near-zero gas fees for minting and trading.",
    "🌉 The Mantle Bridge connects Ethereum mainnet to Mantle L2 at bridge.mantle.xyz",
    "🔍 Explore Mantle transactions at the block explorer: explorer.mantle.xyz",
    "📱 Multiple wallets support Mantle - MetaMask, Coinbase Wallet, Rainbow, and more!",
    "🏆 Mantle has a thriving ecosystem with 100+ dApps across DeFi, Gaming, and NFTs.",
    "🌐 Visit mantle.xyz/ecosystem to discover all the amazing dApps built on Mantle!",
  ],
  
  // Technical Deep Dives
  technical: [
    "🔧 Mantle uses a Sequencer to order transactions before submitting batches to Ethereum.",
    "📦 Transaction batches are compressed and posted to Ethereum for data availability.",
    "🛡️ Fraud proofs allow anyone to challenge invalid state transitions on Mantle.",
    "⚙️ Mantle's modular design allows independent upgrades to each layer component.",
    "🔄 State commitments are posted to Ethereum L1 for security verification.",
    "📐 Mantle uses calldata compression to minimize L1 posting costs.",
    "🏎️ The Mantle Virtual Machine (MVM) is fully compatible with the EVM.",
    "🔌 RPC endpoints: Mainnet at rpc.mantle.xyz, Testnet at rpc.sepolia.mantle.xyz",
  ],
  
  // Developer Resources
  developer: [
    "📚 Learn to build on Mantle at docs.mantle.xyz - comprehensive documentation!",
    "🛠️ Use Hardhat, Foundry, or Remix to deploy contracts on Mantle seamlessly.",
    "🧪 Test your dApps on Mantle Sepolia testnet before going live.",
    "💡 Mantle provides developer grants for innovative projects - apply at mantle.xyz!",
    "🔗 Chain IDs: Mantle Mainnet = 5000, Mantle Sepolia = 5003",
    "📖 Mantle's open-source codebase is available on GitHub for transparency.",
    "🎓 Join Mantle's developer community on Discord for support and collaboration.",
  ],
  
  // Benefits & Advantages
  benefits: [
    "💸 Save up to 95% on gas fees compared to Ethereum mainnet!",
    "🚀 Deploy and scale your dApp without worrying about network congestion.",
    "🔒 Enjoy Ethereum-level security with Layer 2 speed and efficiency.",
    "🌍 Access a growing ecosystem of users, liquidity, and opportunities.",
    "⚡ Process thousands of transactions without breaking a sweat!",
    "🎯 Perfect for high-frequency applications like gaming and DeFi trading.",
  ],
  
  // Strategic Tips (Game-themed)
  strategy: [
    "🎮 Just like in games, strategy matters - choose Mantle for optimal blockchain performance!",
    "🏰 Build your empire on solid foundations - Mantle's modular architecture is your base.",
    "⚔️ Attack high gas fees - Mantle reduces costs by over 80%!",
    "🛡️ Defend your treasury - Mantle's inherited security keeps assets safe.",
    "🎯 Target efficiency - every transaction on Mantle is optimized for speed and cost.",
    "🏆 Win the blockchain game - scale to millions of users with Mantle!",
  ],
};

// Get a random fact from any category
export const getRandomMantleFact = (): string => {
  const allCategories = Object.values(MANTLE_FACTS);
  const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)];
  return randomCategory[Math.floor(Math.random() * randomCategory.length)];
};

// Get a random fact from a specific category
export const getMantleFactByCategory = (category: keyof typeof MANTLE_FACTS): string => {
  const facts = MANTLE_FACTS[category];
  return facts[Math.floor(Math.random() * facts.length)];
};

// Get multiple unique facts
export const getMultipleMantleFacts = (count: number): string[] => {
  const allFacts = Object.values(MANTLE_FACTS).flat();
  const shuffled = allFacts.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
