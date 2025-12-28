# Yield Quest

A gamified educational platform that teaches users about the Mantle Network through strategic gameplay. Players earn XP and rewards by playing Chess and Tower Defense games while learning about blockchain technology.

## 🎮 About The Platform

Yield Quest combines strategic gaming with blockchain education. Players stake, play, and earn while learning about Mantle Network's Layer 2 technology through interactive gameplay. Every move in our games teaches users something new about Mantle Network.

### Key Features

- **Chess Strategy Quest** - Classic chess with AI opponents. Every move displays Mantle Network facts and documentation
- **Tower Defense Quest** - Isometric tower defense with 6 tower types, 4 discoverable maps, and varied enemies
- **Learn While Playing** - Constant educational tips about Mantle Network integrated into gameplay
- **XP & Leveling System** - Earn experience points and level up through gameplay
- **Wallet Integration** - Connect your Web3 wallet to track progress and earnings

## 🌐 Mantle Network Integration

Yield Quest is built to educate users about [Mantle Network](https://www.mantle.xyz/), a modular Layer 2 blockchain solution.

### What Users Learn

- **Layer 2 Technology** - How Mantle scales Ethereum with lower fees
- **Modular Architecture** - Data availability, execution, and settlement layers
- **MNT Token** - Native governance and utility token
- **EigenDA Integration** - Secure data availability solution
- **EVM Compatibility** - Seamless deployment from Ethereum
- **Consensus Mechanisms** - Optimistic rollup technology
- **Gas Optimization** - Transaction cost savings vs mainnet
- **Developer Tools** - SDKs, APIs, and infrastructure

### Educational Implementation

Every player action triggers a Mantle Network fact:
- **Chess moves** → Display facts about Mantle's technology
- **Tower placements** → Show information about L2 scaling
- **Enemy kills** → Reveal token economics details
- **Wave completions** → Explain consensus mechanisms
- **Map discoveries** → Unlock advanced protocol knowledge

## 🎯 Game Development

### Chess Game

```
Features:
├── AI Difficulty Levels (Easy, Medium, Hard)
├── Deep green themed board
├── Full chess rules implementation
├── Move validation and highlighting
├── Piece capture tracking
├── Win/Loss detection
└── Mantle tips on every move
```

### Tower Defense Game

```
Tower Types:
├── 🏹 Archer Tower - Fast attacks, low damage
├── 💣 Cannon Tower - Area damage, slow fire rate
├── 🔮 Wizard Tower - Magic damage, chain lightning
├── ❄️ Frost Tower - Slows enemies
├── ⚔️ Barracks - Spawns defenders
└── ⚡ Tesla Tower - High damage, targets strongest

Maps:
├── 🌲 Greenlands - Starting area
├── 🌋 Volcanic Forge - Fire-themed challenges
├── 💎 Crystal Caverns - Underground battles
└── 🏰 Dark Castle - Ultimate challenge

Enemy Types:
├── Basic - Standard speed and health
├── Fast - Quick but fragile
├── Tank - Slow but high HP
├── Flying - Bypasses ground towers
└── Boss - Appears every 5 waves
```

## 🔧 How It Works

### User Flow

1. **Connect Wallet** - Link Web3 wallet (MetaMask, WalletConnect, etc.)
2. **Choose Quest** - Select Chess or Tower Defense game
3. **Join Quest** - Approve and start playing immediately
4. **Play & Learn** - Every action displays Mantle Network education
5. **Earn XP** - Gain experience points for gameplay achievements
6. **Level Up** - Progress through levels and unlock rewards
7. **Track Progress** - View completed games on Journey page

### XP Point System

| Action | XP Reward |
|--------|-----------|
| Win Chess Game | 500 XP |
| Complete Tower Defense Wave | 50 XP per wave |
| Defeat Boss Enemy | 200 XP |
| Discover New Map | 300 XP |
| Complete Quest | 1000 XP |
| First Win of Day | 100 XP Bonus |

### Leveling System

| Level | Title | XP Required |
|-------|-------|-------------|
| 1 | Novice | 0 XP |
| 2 | Apprentice | 1,000 XP |
| 3 | Warrior | 5,000 XP |
| 4 | Champion | 15,000 XP |
| 5 | Legend | 30,000 XP |

## 🔌 Integrations

### Wallet Connection

- **wagmi** - React hooks for Ethereum
- **viem** - TypeScript Ethereum library
- **WalletConnect** - Multi-wallet support
- **MetaMask** - Browser wallet integration

### Backend Services

- **PostgreSQL Database** - Game sessions, profiles, achievements
- **Real-time Updates** - Live leaderboard and progress tracking
- **Edge Functions** - Serverless backend logic

### Database Schema

```sql
-- Core Tables
├── profiles - User profiles and XP tracking
├── game_sessions - Active and completed games
├── chess_games - Chess game states and history
├── tower_defense_games - Tower defense progress
├── achievements - Unlocked player achievements
├── daily_challenges - Daily XP bonus challenges
└── leaderboard - Global rankings view
```

## 🛠️ Technology Stack

| Category | Technology |
|----------|------------|
| Frontend | React 18, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| UI Components | shadcn/ui, Radix UI |
| State Management | TanStack Query |
| Web3 | wagmi, viem |
| Database | PostgreSQL |
| Build Tool | Vite |
| Animations | Framer Motion |

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── Header.tsx       # Navigation header
│   ├── GameQuestCard.tsx # Quest selection cards
│   ├── JoinQuestModal.tsx # Quest joining flow
│   ├── Leaderboard.tsx  # Global rankings
│   └── UserStats.tsx    # Player statistics
├── pages/
│   ├── Landing.tsx      # Home page
│   ├── Journey.tsx      # Player dashboard
│   ├── ChessGame.tsx    # Chess gameplay
│   └── TowerDefenseGame.tsx # Tower defense gameplay
├── lib/
│   ├── mantleFacts.ts   # 60+ Mantle Network facts
│   ├── wagmi.ts         # Wallet configuration
│   ├── level.ts         # XP and leveling logic
│   └── questConfig.ts   # Quest definitions
└── integrations/
    └── supabase/        # Database client and types
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Web3 wallet (MetaMask recommended)

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd yield-quest

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

## 📊 Leaderboard System

Players are ranked globally based on:
- Total XP earned
- Games won
- Games played
- Current level

The leaderboard updates in real-time as players complete games and earn XP.

## 🎖️ Achievements

Players can unlock achievements for milestones:
- First Win
- 10 Games Completed
- Level Up achievements
- Map discoveries
- Perfect waves (no lives lost)

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built for the Mantle Network ecosystem** 🌐
