import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Trophy, 
  Star, 
  BookOpen, 
  Play,
  Pause,
  RotateCcw,
  Castle,
  Zap,
  Heart,
  Coins,
  Lock,
  Lightbulb,
  Map,
  Sword,
  Shield,
  Target,
  Flame,
  Snowflake,
  Compass
} from 'lucide-react';

// Tower types with enhanced visuals
interface Tower {
  id: string;
  type: 'archer' | 'cannon' | 'wizard' | 'frost' | 'barracks' | 'tesla';
  x: number;
  y: number;
  level: number;
  damage: number;
  range: number;
  fireRate: number;
  lastFired: number;
}

// Enemy types with different characteristics
interface Enemy {
  id: string;
  type: 'goblin' | 'orc' | 'troll' | 'dragon' | 'necromancer';
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  speed: number;
  pathIndex: number;
  reward: number;
  armor: number;
}

// Tower definitions - more variety and strategy
const TOWER_TYPES = {
  archer: { 
    name: 'Archer Tower', 
    cost: 50, 
    damage: 15, 
    range: 120, 
    fireRate: 800,
    icon: Target,
    color: 'from-amber-600 to-amber-800',
    description: 'Fast attacks, good range',
    unlocked: true
  },
  cannon: { 
    name: 'Cannon Tower', 
    cost: 100, 
    damage: 40, 
    range: 100, 
    fireRate: 1500,
    icon: Flame,
    color: 'from-orange-600 to-red-800',
    description: 'Heavy damage, splash effect',
    unlocked: true
  },
  wizard: { 
    name: 'Wizard Tower', 
    cost: 150, 
    damage: 30, 
    range: 90, 
    fireRate: 1200,
    icon: Zap,
    color: 'from-purple-600 to-indigo-800',
    description: 'Magic damage, ignores armor',
    unlocked: false
  },
  frost: { 
    name: 'Frost Tower', 
    cost: 120, 
    damage: 10, 
    range: 100, 
    fireRate: 600,
    icon: Snowflake,
    color: 'from-cyan-400 to-blue-600',
    description: 'Slows enemies significantly',
    unlocked: false
  },
  barracks: { 
    name: 'Barracks', 
    cost: 80, 
    damage: 20, 
    range: 60, 
    fireRate: 1000,
    icon: Sword,
    color: 'from-green-600 to-emerald-800',
    description: 'Spawns soldiers to block path',
    unlocked: false
  },
  tesla: { 
    name: 'Tesla Tower', 
    cost: 200, 
    damage: 60, 
    range: 80, 
    fireRate: 2000,
    icon: Zap,
    color: 'from-yellow-400 to-amber-600',
    description: 'Chain lightning, hits multiple',
    unlocked: false
  },
};

// Enhanced Maps with different themes and paths
const MAPS = {
  greenlands: { 
    name: 'Greenlands', 
    unlocked: true, 
    waves: 10,
    description: 'Peaceful meadows under siege',
    gradient: 'from-emerald-900 via-green-800 to-emerald-900',
    path: [
      { x: 0, y: 180 },
      { x: 120, y: 180 },
      { x: 120, y: 80 },
      { x: 280, y: 80 },
      { x: 280, y: 280 },
      { x: 420, y: 280 },
      { x: 420, y: 180 },
      { x: 600, y: 180 },
    ],
    mantleTip: "🌱 GREENLANDS: Like Mantle's foundation, start with basics and build up!"
  },
  volcano: { 
    name: 'Volcanic Forge', 
    unlocked: false, 
    waves: 15,
    description: 'Battle in the heart of the mountain',
    gradient: 'from-red-900 via-orange-800 to-red-900',
    path: [
      { x: 0, y: 100 },
      { x: 150, y: 100 },
      { x: 150, y: 250 },
      { x: 300, y: 250 },
      { x: 300, y: 150 },
      { x: 450, y: 150 },
      { x: 450, y: 300 },
      { x: 600, y: 300 },
    ],
    mantleTip: "🌋 VOLCANIC FORGE: Hot like Mantle's transaction throughput - 1000s per second!"
  },
  crystalCave: { 
    name: 'Crystal Caverns', 
    unlocked: false, 
    waves: 20,
    description: 'Ancient crystals hold great power',
    gradient: 'from-purple-900 via-indigo-800 to-purple-900',
    path: [
      { x: 0, y: 200 },
      { x: 100, y: 200 },
      { x: 100, y: 50 },
      { x: 250, y: 50 },
      { x: 250, y: 300 },
      { x: 400, y: 300 },
      { x: 400, y: 100 },
      { x: 550, y: 100 },
      { x: 550, y: 200 },
      { x: 600, y: 200 },
    ],
    mantleTip: "💎 CRYSTAL CAVERNS: Valuable like $MNT - the native token powering Mantle!"
  },
  darkCastle: { 
    name: 'Dark Castle', 
    unlocked: false, 
    waves: 25,
    description: 'The final fortress of evil',
    gradient: 'from-gray-900 via-slate-800 to-gray-900',
    path: [
      { x: 0, y: 150 },
      { x: 80, y: 150 },
      { x: 80, y: 50 },
      { x: 200, y: 50 },
      { x: 200, y: 250 },
      { x: 350, y: 250 },
      { x: 350, y: 100 },
      { x: 500, y: 100 },
      { x: 500, y: 300 },
      { x: 600, y: 300 },
    ],
    mantleTip: "🏰 DARK CASTLE: Secure like Mantle's Ethereum-inherited security!"
  },
};

// Mantle tips based on game actions
const MANTLE_TOWER_TIPS: Record<string, string[]> = {
  archer: [
    "🏹 ARCHER TOWER: Fast and efficient, like Mantle's sub-second transaction confirmations!",
    "🎯 ARCHER PLACED: Precision targeting like Mantle's optimized gas pricing mechanism.",
  ],
  cannon: [
    "💥 CANNON TOWER: High impact, just like Mantle's modular architecture on blockchain scaling!",
    "🔥 CANNON DEPLOYED: Powerful attacks mirror Mantle's powerful smart contract execution.",
  ],
  wizard: [
    "✨ WIZARD TOWER: Magic bypasses armor, like Mantle bypasses L1 congestion with rollups!",
    "🔮 WIZARD SUMMONED: Mystical powers = Mantle's data availability layer innovation.",
  ],
  frost: [
    "❄️ FROST TOWER: Slows enemies like Mantle's fraud proofs slow down invalid transactions!",
    "🧊 FROST DEPLOYED: Control the battlefield, control your gas costs with Mantle.",
  ],
  barracks: [
    "⚔️ BARRACKS: Soldiers defend the path, like Mantle validators defend the network!",
    "🛡️ BARRACKS BUILT: Strategic defense = Mantle's layered security approach.",
  ],
  tesla: [
    "⚡ TESLA TOWER: Chain lightning hits many, like Mantle's batch processing handles many TXs!",
    "🌩️ TESLA ONLINE: Electric efficiency = Mantle's 80%+ gas savings vs Ethereum L1.",
  ],
};

const MANTLE_WAVE_TIPS = [
  "🌊 WAVE COMPLETE! Like completing a batch of transactions on Mantle - efficient and fast!",
  "⚔️ ENEMIES DEFEATED! Your strategy is strong, like Mantle's modular design strategy.",
  "🏆 WAVE SURVIVED! Resilient defense, like Mantle's inherited Ethereum security.",
  "💪 GREAT DEFENSE! You're learning, just like developers learn to build on Mantle.",
  "🎮 WAVE CLEARED! Each wave is experience, each Mantle TX is sub-$0.01.",
];

const MANTLE_KILL_TIPS = [
  "💀 ENEMY DOWN! Each kill = knowledge. Mantle processes 1000+ TPS!",
  "⚔️ DEFEATED! Victory through strategy, like Mantle's Optimistic Rollup strategy.",
  "🎯 TARGET ELIMINATED! Precision like Mantle's EVM-compatible smart contracts.",
  "💥 DESTROYED! Power like Mantle's $3B+ TVL ecosystem strength.",
  "🔥 VANQUISHED! Build your empire, build on Mantle at docs.mantle.xyz!",
];

const MANTLE_MAP_DISCOVERIES = [
  "🗺️ NEW TERRITORY! Explore Mantle's ecosystem at mantle.xyz/ecosystem",
  "🌍 MAP UNLOCKED! New lands await, like new opportunities on Mantle DeFi.",
  "🏔️ REGION DISCOVERED! Adventure awaits, bridges await at bridge.mantle.xyz",
  "🗝️ SECRET REVEALED! Unlock Mantle's potential - EVM compatible, lower fees!",
];

export default function TowerDefenseGame() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const gameLoopRef = useRef<number>();
  
  const [towers, setTowers] = useState<Tower[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [gold, setGold] = useState(250);
  const [lives, setLives] = useState(20);
  const [wave, setWave] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [selectedTower, setSelectedTower] = useState<keyof typeof TOWER_TYPES | null>('archer');
  const [currentMap, setCurrentMap] = useState<keyof typeof MAPS>('greenlands');
  const [xpEarned, setXpEarned] = useState(0);
  const [unlockedTowers, setUnlockedTowers] = useState<string[]>(['archer', 'cannon']);
  const [unlockedMaps, setUnlockedMaps] = useState<string[]>(['greenlands']);
  const [showTutorial, setShowTutorial] = useState(false);
  const [placementMode, setPlacementMode] = useState(false);
  const [mantleTip, setMantleTip] = useState<string | null>(null);
  const [killCount, setKillCount] = useState(0);
  const [totalKills, setTotalKills] = useState(0);

  const currentMapData = MAPS[currentMap];
  const currentPath = currentMapData.path;

  // Show Mantle tip
  const showMantleTip = useCallback((tip: string) => {
    setMantleTip(tip);
    setTimeout(() => setMantleTip(null), 5000);
  }, []);

  // Spawn enemies for current wave with variety
  const spawnWave = useCallback(() => {
    const enemyCount = wave * 2 + 5;
    const newEnemies: Enemy[] = [];
    const enemyTypes: Enemy['type'][] = ['goblin', 'orc', 'troll', 'dragon', 'necromancer'];
    
    for (let i = 0; i < enemyCount; i++) {
      // Vary enemy types based on wave
      const typeIndex = Math.min(Math.floor(wave / 3), enemyTypes.length - 1);
      const type = enemyTypes[Math.floor(Math.random() * (typeIndex + 1))];
      
      const baseStats = {
        goblin: { health: 30, speed: 1.5, armor: 0, reward: 10 },
        orc: { health: 60, speed: 1, armor: 5, reward: 15 },
        troll: { health: 100, speed: 0.7, armor: 10, reward: 25 },
        dragon: { health: 150, speed: 1.2, armor: 15, reward: 40 },
        necromancer: { health: 80, speed: 0.8, armor: 5, reward: 30 },
      };
      
      const stats = baseStats[type];
      
      newEnemies.push({
        id: `enemy-${wave}-${i}`,
        type,
        x: currentPath[0].x - (i * 50),
        y: currentPath[0].y,
        health: stats.health + wave * 10,
        maxHealth: stats.health + wave * 10,
        speed: stats.speed + wave * 0.05,
        pathIndex: 0,
        reward: stats.reward + wave * 2,
        armor: stats.armor,
      });
    }
    
    setEnemies(prev => [...prev, ...newEnemies]);
  }, [wave, currentPath]);

  // Game loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;
    
    const gameLoop = () => {
      const now = Date.now();
      
      setEnemies(prevEnemies => {
        return prevEnemies.map(enemy => {
          const targetPoint = currentPath[enemy.pathIndex];
          if (!targetPoint) return enemy;
          
          const dx = targetPoint.x - enemy.x;
          const dy = targetPoint.y - enemy.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 5) {
            if (enemy.pathIndex < currentPath.length - 1) {
              return { ...enemy, pathIndex: enemy.pathIndex + 1 };
            } else {
              setLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) {
                  setGameOver(true);
                  setIsPlaying(false);
                }
                return newLives;
              });
              return { ...enemy, health: 0 };
            }
          }
          
          return {
            ...enemy,
            x: enemy.x + (dx / distance) * enemy.speed,
            y: enemy.y + (dy / distance) * enemy.speed,
          };
        }).filter(e => e.health > 0);
      });
      
      // Tower attacks
      setTowers(prevTowers => {
        return prevTowers.map(tower => {
          if (now - tower.lastFired < tower.fireRate) return tower;
          
          setEnemies(prevEnemies => {
            const enemiesInRange = prevEnemies.filter(enemy => {
              const dx = enemy.x - tower.x;
              const dy = enemy.y - tower.y;
              return Math.sqrt(dx * dx + dy * dy) <= tower.range;
            });
            
            if (enemiesInRange.length > 0) {
              const target = enemiesInRange[0];
              return prevEnemies.map(e => {
                if (e.id === target.id) {
                  const effectiveDamage = Math.max(tower.damage - e.armor, 5);
                  const newHealth = e.health - effectiveDamage;
                  if (newHealth <= 0) {
                    setGold(prev => prev + e.reward);
                    setXpEarned(prev => prev + 5);
                    setKillCount(prev => prev + 1);
                    setTotalKills(prev => {
                      const newTotal = prev + 1;
                      // Show tip every 3 kills
                      if (newTotal % 3 === 0) {
                        const tip = MANTLE_KILL_TIPS[Math.floor(Math.random() * MANTLE_KILL_TIPS.length)];
                        showMantleTip(tip);
                      }
                      return newTotal;
                    });
                  }
                  return { ...e, health: newHealth };
                }
                return e;
              }).filter(e => e.health > 0);
            }
            return prevEnemies;
          });
          
          return { ...tower, lastFired: now };
        });
      });
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying, gameOver, currentPath, showMantleTip]);

  // Check wave completion
  useEffect(() => {
    if (isPlaying && enemies.length === 0 && wave > 0) {
      if (wave >= currentMapData.waves) {
        handleVictory();
      } else {
        // Show wave complete tip
        const tip = MANTLE_WAVE_TIPS[Math.floor(Math.random() * MANTLE_WAVE_TIPS.length)];
        showMantleTip(tip);
        
        setTimeout(() => {
          setWave(prev => prev + 1);
        }, 2000);
      }
    }
  }, [enemies, isPlaying, wave, currentMapData.waves, showMantleTip]);

  // Spawn wave when wave number changes
  useEffect(() => {
    if (wave > 0 && isPlaying) {
      spawnWave();
    }
  }, [wave, spawnWave, isPlaying]);

  const handleVictory = async () => {
    setIsPlaying(false);
    setGameOver(true);
    setVictory(true);
    
    const earnedXP = xpEarned + 150 + wave * 15;
    setXpEarned(earnedXP);
    
    // Unlock next map
    const mapKeys = Object.keys(MAPS);
    const currentIndex = mapKeys.indexOf(currentMap);
    if (currentIndex < mapKeys.length - 1) {
      const nextMap = mapKeys[currentIndex + 1];
      if (!unlockedMaps.includes(nextMap)) {
        setUnlockedMaps(prev => [...prev, nextMap]);
        const discoveryTip = MANTLE_MAP_DISCOVERIES[Math.floor(Math.random() * MANTLE_MAP_DISCOVERIES.length)];
        showMantleTip(discoveryTip);
      }
    }
    
    // Save to database
    if (address) {
      try {
        const { data: session } = await supabase
          .from('game_sessions')
          .insert({
            wallet_address: address,
            game_type: 'tower_defense',
            difficulty: currentMap,
            status: 'completed',
            xp_earned: earnedXP,
            completed_at: new Date().toISOString(),
            game_data: { result: 'win', wave, gold, kills: totalKills }
          })
          .select()
          .single();
        
        if (session) {
          await supabase
            .from('tower_defense_games')
            .insert([{
              session_id: session.id,
              wallet_address: address,
              current_wave: wave,
              current_map: currentMap,
              gold,
              lives,
              game_result: 'win'
            }]);
        }
        
        toast.success(`Victory! +${earnedXP} XP earned`);
      } catch (error) {
        console.error('Error saving game:', error);
      }
    }
  };

  const placeTower = (x: number, y: number) => {
    if (!selectedTower || !placementMode) return;
    
    const towerData = TOWER_TYPES[selectedTower];
    if (gold < towerData.cost) {
      toast.error('Not enough gold!');
      return;
    }
    
    // Check if too close to path
    const minDistanceFromPath = 30;
    for (const point of currentPath) {
      const dx = point.x - x;
      const dy = point.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < minDistanceFromPath) {
        toast.error('Too close to the path!');
        return;
      }
    }
    
    const newTower: Tower = {
      id: `tower-${Date.now()}`,
      type: selectedTower,
      x,
      y,
      level: 1,
      damage: towerData.damage,
      range: towerData.range,
      fireRate: towerData.fireRate,
      lastFired: 0,
    };
    
    setTowers(prev => [...prev, newTower]);
    setGold(prev => prev - towerData.cost);
    setPlacementMode(false);
    
    // Show tower tip
    const tips = MANTLE_TOWER_TIPS[selectedTower];
    if (tips) {
      showMantleTip(tips[Math.floor(Math.random() * tips.length)]);
    }
  };

  const startGame = () => {
    setIsPlaying(true);
    setWave(1);
    showMantleTip(currentMapData.mantleTip);
  };

  const resetGame = () => {
    setTowers([]);
    setEnemies([]);
    setGold(250);
    setLives(20);
    setWave(0);
    setIsPlaying(false);
    setGameOver(false);
    setVictory(false);
    setXpEarned(0);
    setKillCount(0);
    setTotalKills(0);
    setMantleTip(null);
  };

  const unlockTower = (towerType: keyof typeof TOWER_TYPES) => {
    const cost = TOWER_TYPES[towerType].cost * 3;
    if (gold >= cost) {
      setGold(prev => prev - cost);
      setUnlockedTowers(prev => [...prev, towerType]);
      toast.success(`${TOWER_TYPES[towerType].name} unlocked!`);
    }
  };

  const getEnemyColor = (type: Enemy['type']) => {
    const colors = {
      goblin: 'bg-green-500',
      orc: 'bg-emerald-700',
      troll: 'bg-stone-600',
      dragon: 'bg-red-600',
      necromancer: 'bg-purple-700',
    };
    return colors[type];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="gap-2 text-foreground hover:bg-foreground/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quests
          </Button>
          
          <h1 className="font-display text-xl font-bold text-foreground">TOWER DEFENSE</h1>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-foreground/10 rounded-lg">
              <Star className="w-4 h-4 text-foreground" />
              <span className="text-sm font-medium text-foreground">{xpEarned} XP</span>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Mantle Tip Banner */}
          <AnimatePresence mode="wait">
            {mantleTip && (
              <motion.div
                key={mantleTip}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-500/30 flex items-start gap-3"
              >
                <Lightbulb className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-foreground font-medium">{mantleTip}</p>
                  <p className="text-xs text-foreground/50 mt-1">Learn more at docs.mantle.xyz</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left Sidebar - Resources & Towers */}
            <div className="lg:col-span-1 space-y-4">
              {/* Resources */}
              <div className="p-4 rounded-2xl bg-card border border-border">
                <h3 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  RESOURCES
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      <span className="text-sm text-foreground/60">Lives</span>
                    </div>
                    <span className="text-lg font-bold text-foreground">{lives}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm text-foreground/60">Gold</span>
                    </div>
                    <span className="text-lg font-bold text-foreground">{gold}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sword className="w-5 h-5 text-red-400" />
                      <span className="text-sm text-foreground/60">Kills</span>
                    </div>
                    <span className="text-lg font-bold text-foreground">{totalKills}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Castle className="w-5 h-5 text-foreground/50" />
                      <span className="text-sm text-foreground/60">Wave</span>
                    </div>
                    <span className="text-lg font-bold text-foreground">{wave}/{currentMapData.waves}</span>
                  </div>
                </div>
              </div>

              {/* Tower Selection */}
              <div className="p-4 rounded-2xl bg-card border border-border">
                <h3 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  TOWERS
                </h3>
                <div className="space-y-2">
                  {Object.entries(TOWER_TYPES).map(([key, tower]) => {
                    const isUnlocked = unlockedTowers.includes(key);
                    const TowerIcon = tower.icon;
                    return (
                      <div
                        key={key}
                        onClick={() => {
                          if (isUnlocked) {
                            setSelectedTower(key as keyof typeof TOWER_TYPES);
                            setPlacementMode(true);
                          }
                        }}
                        className={`
                          p-3 rounded-lg border transition-all cursor-pointer
                          ${selectedTower === key && placementMode ? 'border-emerald-500 bg-emerald-500/10' : 'border-border'}
                          ${!isUnlocked ? 'opacity-50' : 'hover:border-foreground/50'}
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tower.color} flex items-center justify-center`}>
                            <TowerIcon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-foreground truncate">{tower.name}</span>
                              {isUnlocked ? (
                                <span className="text-xs text-yellow-500 font-bold">{tower.cost}g</span>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    unlockTower(key as keyof typeof TOWER_TYPES);
                                  }}
                                  className="h-5 px-1.5 text-xs"
                                >
                                  <Lock className="w-3 h-3 mr-1" />
                                  {tower.cost * 3}g
                                </Button>
                              )}
                            </div>
                            <p className="text-[10px] text-foreground/50 truncate">{tower.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Main Game Board */}
            <div className="lg:col-span-3">
              <div 
                className={`relative w-full h-[450px] rounded-2xl border-2 border-border overflow-hidden bg-gradient-to-br ${currentMapData.gradient}`}
                onClick={(e) => {
                  if (placementMode) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    placeTower(x, y);
                  }
                }}
              >
                {/* Decorative elements */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-10 left-10 w-16 h-16 bg-foreground/10 rounded-full blur-xl" />
                  <div className="absolute bottom-20 right-20 w-24 h-24 bg-foreground/10 rounded-full blur-xl" />
                  <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-foreground/5 rounded-full blur-2xl" />
                </div>
                
                {/* Path visualization with glow */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <polyline
                    points={currentPath.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="rgba(139, 92, 42, 0.8)"
                    strokeWidth="35"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points={currentPath.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="rgba(194, 154, 108, 0.5)"
                    strokeWidth="25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow)"
                  />
                </svg>

                {/* Towers with enhanced visuals */}
                {towers.map(tower => {
                  const towerData = TOWER_TYPES[tower.type];
                  const TowerIcon = towerData.icon;
                  return (
                    <motion.div
                      key={tower.id}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className={`absolute w-12 h-12 rounded-xl bg-gradient-to-br ${towerData.color} border-2 border-white/30 flex items-center justify-center shadow-lg`}
                      style={{ 
                        left: tower.x - 24, 
                        top: tower.y - 24,
                      }}
                    >
                      <TowerIcon className="w-6 h-6 text-white drop-shadow-lg" />
                      {/* Range indicator on hover */}
                      <div 
                        className="absolute rounded-full border-2 border-white/10 pointer-events-none opacity-30"
                        style={{
                          width: tower.range * 2,
                          height: tower.range * 2,
                          left: 24 - tower.range,
                          top: 24 - tower.range,
                        }}
                      />
                    </motion.div>
                  );
                })}

                {/* Enemies with variety */}
                {enemies.map(enemy => (
                  <motion.div
                    key={enemy.id}
                    className={`absolute w-10 h-10 rounded-full ${getEnemyColor(enemy.type)} border-2 border-white/50 flex items-center justify-center shadow-lg`}
                    style={{ 
                      left: enemy.x - 20, 
                      top: enemy.y - 20,
                    }}
                  >
                    <span className="text-lg">
                      {enemy.type === 'goblin' && '👺'}
                      {enemy.type === 'orc' && '👹'}
                      {enemy.type === 'troll' && '🧌'}
                      {enemy.type === 'dragon' && '🐉'}
                      {enemy.type === 'necromancer' && '💀'}
                    </span>
                    {/* Health bar */}
                    <div className="absolute -top-3 left-0 w-full h-1.5 bg-red-900 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-green-400 to-green-600"
                        initial={{ width: '100%' }}
                        animate={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                      />
                    </div>
                  </motion.div>
                ))}

                {/* Placement overlay */}
                {placementMode && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center cursor-crosshair"
                  >
                    <div className="px-4 py-2 bg-background/80 rounded-lg border border-emerald-500/50">
                      <p className="text-foreground text-sm font-medium">Click to place {selectedTower && TOWER_TYPES[selectedTower].name}</p>
                    </div>
                  </motion.div>
                )}

                {/* Start overlay */}
                {!isPlaying && !gameOver && wave === 0 && (
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <Castle className="w-16 h-16 text-foreground mx-auto mb-4" />
                      <h3 className="font-display text-2xl font-bold text-foreground mb-2">{currentMapData.name}</h3>
                      <p className="text-foreground/60 mb-4">{currentMapData.description}</p>
                      <Button
                        onClick={startGame}
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Play className="w-5 h-5" />
                        Start Battle
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Game Controls */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-2">
                  {isPlaying && (
                    <Button
                      onClick={() => setIsPlaying(false)}
                      variant="outline"
                      size="sm"
                      className="gap-2 border-border text-foreground"
                    >
                      <Pause className="w-4 h-4" />
                      Pause
                    </Button>
                  )}
                  {!isPlaying && wave > 0 && !gameOver && (
                    <Button
                      onClick={() => setIsPlaying(true)}
                      size="sm"
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Play className="w-4 h-4" />
                      Resume
                    </Button>
                  )}
                  <Button
                    onClick={resetGame}
                    variant="outline"
                    size="sm"
                    className="gap-2 border-border text-foreground"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </Button>
                </div>
                <Button
                  onClick={() => setShowTutorial(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-border text-foreground"
                >
                  <BookOpen className="w-4 h-4" />
                  Tutorial
                </Button>
              </div>
            </div>

            {/* Right Sidebar - Maps & Learning */}
            <div className="lg:col-span-1 space-y-4">
              {/* Map Selection */}
              <div className="p-4 rounded-2xl bg-card border border-border">
                <h3 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Map className="w-4 h-4" />
                  REGIONS
                </h3>
                <div className="space-y-2">
                  {Object.entries(MAPS).map(([key, map]) => {
                    const isUnlocked = unlockedMaps.includes(key);
                    return (
                      <Button
                        key={key}
                        variant={currentMap === key ? 'default' : 'outline'}
                        size="sm"
                        disabled={!isUnlocked}
                        onClick={() => {
                          setCurrentMap(key as keyof typeof MAPS);
                          resetGame();
                        }}
                        className={`w-full justify-start gap-2 ${
                          currentMap === key 
                            ? 'bg-emerald-600 text-white' 
                            : 'border-border text-foreground'
                        }`}
                      >
                        {!isUnlocked && <Lock className="w-3 h-3" />}
                        <Compass className="w-3 h-3" />
                        {map.name}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Mantle Learning Progress */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-500/20">
                <h3 className="font-display text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  📚 MANTLE LEARNING
                </h3>
                <p className="text-xs text-foreground/60 mb-3">Every action teaches you about Mantle!</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-foreground/80">
                    <span>Towers built</span>
                    <span className="font-bold">{towers.length}</span>
                  </div>
                  <div className="flex justify-between text-foreground/80">
                    <span>Enemies defeated</span>
                    <span className="font-bold">{totalKills}</span>
                  </div>
                  <div className="flex justify-between text-foreground/80">
                    <span>Waves survived</span>
                    <span className="font-bold">{Math.max(0, wave - 1)}</span>
                  </div>
                  <div className="flex justify-between text-foreground/80">
                    <span>Maps explored</span>
                    <span className="font-bold">{unlockedMaps.length}/{Object.keys(MAPS).length}</span>
                  </div>
                  <div className="pt-2 border-t border-foreground/10">
                    <div className="flex justify-between text-emerald-400">
                      <span>Tips learned</span>
                      <span className="font-bold">{towers.length + Math.floor(totalKills / 3) + Math.max(0, wave - 1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Victory/Defeat Modal */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-8 max-w-md w-full mx-4 text-center"
            >
              {victory ? (
                <>
                  <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
                  <h2 className="font-display text-3xl font-bold text-foreground mb-2">VICTORY!</h2>
                  <p className="text-foreground/60 mb-2">The realm is safe!</p>
                  <p className="text-sm text-emerald-400 mb-4">
                    🎓 You've learned {towers.length + Math.floor(totalKills / 3) + wave} facts about Mantle!
                  </p>
                </>
              ) : (
                <>
                  <Castle className="w-20 h-20 text-foreground/50 mx-auto mb-4" />
                  <h2 className="font-display text-3xl font-bold text-foreground mb-2">DEFEAT</h2>
                  <p className="text-foreground/60 mb-4">The castle has fallen...</p>
                </>
              )}
              
              <div className="flex items-center justify-center gap-2 my-6 px-4 py-3 bg-foreground/10 rounded-lg">
                <Zap className="w-5 h-5 text-foreground" />
                <span className="font-bold text-foreground">+{xpEarned} XP Earned</span>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/journey')}
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-foreground/10"
                >
                  View Journey
                </Button>
                <Button
                  onClick={resetGame}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Play Again
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorial Modal */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={() => setShowTutorial(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-8 max-w-lg w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">🏰 Tower Defense Guide</h2>
              
              <div className="space-y-4 text-sm text-foreground/80">
                <p><strong className="text-foreground">🎯 Objective:</strong> Defend your castle by preventing enemies from reaching the end!</p>
                
                <div>
                  <strong className="text-foreground">⚔️ How to Play:</strong>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li>Select a tower from the left sidebar</li>
                    <li>Click on the battlefield to place it (not on path)</li>
                    <li>Towers automatically attack enemies in range</li>
                    <li>Defeat enemies to earn gold and XP</li>
                    <li>Unlock new towers and maps with gold</li>
                  </ul>
                </div>
                
                <div>
                  <strong className="text-foreground">🏆 XP Rewards:</strong>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li>5 XP per enemy defeated</li>
                    <li>150 XP bonus for victory</li>
                    <li>15 XP per wave completed</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-emerald-900/20 rounded-lg border border-emerald-500/20">
                  <p className="text-emerald-400 font-semibold">📚 Learn While You Defend!</p>
                  <p className="text-foreground/60 text-xs mt-1">
                    Every tower placed, enemy defeated, and map explored teaches you about Mantle Network!
                  </p>
                </div>
              </div>
              
              <Button
                onClick={() => setShowTutorial(false)}
                className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Start Defending!
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}