import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getRandomMantleFact, getMantleFactByCategory } from '@/lib/mantleFacts';
import { 
  ArrowLeft, 
  Trophy, 
  Star, 
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
  Users,
  Wind,
  Mountain,
  Skull,
  Crown,
  Sparkles
} from 'lucide-react';

// Enhanced Tower types with isometric-style visuals
interface Tower {
  id: string;
  type: TowerType;
  x: number;
  y: number;
  level: number;
  damage: number;
  range: number;
  fireRate: number;
  lastFired: number;
  kills: number;
}

type TowerType = 'archer' | 'cannon' | 'wizard' | 'frost' | 'barracks' | 'tesla';

// Enemy types with different characteristics
interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  speed: number;
  pathIndex: number;
  reward: number;
  armor: number;
  slowed: boolean;
}

type EnemyType = 'goblin' | 'orc' | 'troll' | 'dragon' | 'necromancer' | 'golem' | 'wraith';

// Projectile interface for visual effects
interface Projectile {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  type: TowerType;
}

// Enhanced Tower definitions with isometric-style design
const TOWER_TYPES: Record<TowerType, {
  name: string;
  cost: number;
  damage: number;
  range: number;
  fireRate: number;
  icon: typeof Target;
  color: string;
  bgColor: string;
  description: string;
  special: string;
  unlocked: boolean;
}> = {
  archer: { 
    name: 'Archer Tower', 
    cost: 50, 
    damage: 18, 
    range: 140, 
    fireRate: 600,
    icon: Target,
    color: 'text-amber-400',
    bgColor: 'bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900',
    description: 'Fast attacks, excellent range',
    special: 'Critical Hit Chance',
    unlocked: true
  },
  cannon: { 
    name: 'Cannon Tower', 
    cost: 100, 
    damage: 55, 
    range: 110, 
    fireRate: 1400,
    icon: Flame,
    color: 'text-orange-400',
    bgColor: 'bg-gradient-to-b from-stone-600 via-stone-700 to-stone-800',
    description: 'Heavy AOE damage',
    special: 'Splash Damage',
    unlocked: true
  },
  wizard: { 
    name: 'Wizard Tower', 
    cost: 175, 
    damage: 40, 
    range: 100, 
    fireRate: 1000,
    icon: Sparkles,
    color: 'text-purple-400',
    bgColor: 'bg-gradient-to-b from-purple-700 via-indigo-800 to-purple-900',
    description: 'Magic damage ignores armor',
    special: 'Armor Piercing',
    unlocked: false
  },
  frost: { 
    name: 'Frost Tower', 
    cost: 125, 
    damage: 12, 
    range: 120, 
    fireRate: 500,
    icon: Snowflake,
    color: 'text-cyan-400',
    bgColor: 'bg-gradient-to-b from-cyan-600 via-blue-700 to-cyan-800',
    description: 'Slows all enemies in range',
    special: '50% Slow Effect',
    unlocked: false
  },
  barracks: { 
    name: 'Barracks', 
    cost: 90, 
    damage: 25, 
    range: 70, 
    fireRate: 800,
    icon: Users,
    color: 'text-green-400',
    bgColor: 'bg-gradient-to-b from-green-700 via-emerald-800 to-green-900',
    description: 'Spawns soldiers to block',
    special: 'Path Blocking',
    unlocked: false
  },
  tesla: { 
    name: 'Tesla Tower', 
    cost: 250, 
    damage: 80, 
    range: 90, 
    fireRate: 2000,
    icon: Zap,
    color: 'text-yellow-300',
    bgColor: 'bg-gradient-to-b from-yellow-600 via-amber-700 to-yellow-800',
    description: 'Chain lightning effect',
    special: 'Hits 3 Enemies',
    unlocked: false
  },
};

// Enemy definitions with varied characteristics
const ENEMY_TYPES: Record<EnemyType, {
  emoji: string;
  health: number;
  speed: number;
  armor: number;
  reward: number;
  color: string;
}> = {
  goblin: { emoji: '👺', health: 40, speed: 1.8, armor: 0, reward: 12, color: 'bg-green-600' },
  orc: { emoji: '👹', health: 80, speed: 1.2, armor: 8, reward: 18, color: 'bg-green-800' },
  troll: { emoji: '🧌', health: 150, speed: 0.8, armor: 15, reward: 30, color: 'bg-stone-600' },
  dragon: { emoji: '🐉', health: 200, speed: 1.4, armor: 12, reward: 50, color: 'bg-red-700' },
  necromancer: { emoji: '💀', health: 100, speed: 1.0, armor: 5, reward: 35, color: 'bg-purple-800' },
  golem: { emoji: '🗿', health: 300, speed: 0.5, armor: 25, reward: 60, color: 'bg-stone-700' },
  wraith: { emoji: '👻', health: 60, speed: 2.0, armor: 0, reward: 25, color: 'bg-indigo-700' },
};

// Enhanced Maps with isometric paths and unique themes
const MAPS: Record<string, {
  name: string;
  unlocked: boolean;
  waves: number;
  description: string;
  theme: string;
  bgGradient: string;
  pathColor: string;
  glowColor: string;
  path: { x: number; y: number }[];
  decorations: { x: number; y: number; type: string }[];
}> = {
  greenlands: { 
    name: 'Greenlands', 
    unlocked: true, 
    waves: 12,
    description: 'Rolling hills under siege by dark forces',
    theme: 'forest',
    bgGradient: 'from-emerald-950 via-green-900 to-emerald-950',
    pathColor: 'rgba(139, 90, 43, 0.9)',
    glowColor: 'rgba(34, 197, 94, 0.3)',
    path: [
      { x: 0, y: 200 },
      { x: 100, y: 200 },
      { x: 100, y: 80 },
      { x: 250, y: 80 },
      { x: 250, y: 320 },
      { x: 400, y: 320 },
      { x: 400, y: 150 },
      { x: 550, y: 150 },
      { x: 550, y: 250 },
      { x: 700, y: 250 },
    ],
    decorations: [
      { x: 50, y: 120, type: '🌲' },
      { x: 180, y: 180, type: '🌳' },
      { x: 320, y: 80, type: '🌲' },
      { x: 480, y: 280, type: '🌳' },
      { x: 150, y: 300, type: '🪨' },
    ]
  },
  volcano: { 
    name: 'Volcanic Forge', 
    unlocked: false, 
    waves: 15,
    description: 'The fiery heart of the mountain awaits',
    theme: 'fire',
    bgGradient: 'from-red-950 via-orange-900 to-red-950',
    pathColor: 'rgba(80, 40, 30, 0.9)',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    path: [
      { x: 0, y: 120 },
      { x: 120, y: 120 },
      { x: 120, y: 280 },
      { x: 280, y: 280 },
      { x: 280, y: 80 },
      { x: 450, y: 80 },
      { x: 450, y: 200 },
      { x: 550, y: 200 },
      { x: 550, y: 350 },
      { x: 700, y: 350 },
    ],
    decorations: [
      { x: 60, y: 200, type: '🌋' },
      { x: 200, y: 150, type: '🔥' },
      { x: 380, y: 180, type: '🌋' },
      { x: 520, y: 100, type: '🔥' },
    ]
  },
  crystalCave: { 
    name: 'Crystal Caverns', 
    unlocked: false, 
    waves: 18,
    description: 'Ancient crystals pulse with arcane energy',
    theme: 'crystal',
    bgGradient: 'from-indigo-950 via-purple-900 to-indigo-950',
    pathColor: 'rgba(70, 50, 100, 0.9)',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    path: [
      { x: 0, y: 180 },
      { x: 80, y: 180 },
      { x: 80, y: 50 },
      { x: 200, y: 50 },
      { x: 200, y: 320 },
      { x: 350, y: 320 },
      { x: 350, y: 150 },
      { x: 500, y: 150 },
      { x: 500, y: 280 },
      { x: 620, y: 280 },
      { x: 620, y: 180 },
      { x: 700, y: 180 },
    ],
    decorations: [
      { x: 130, y: 120, type: '💎' },
      { x: 280, y: 200, type: '💎' },
      { x: 420, y: 80, type: '✨' },
      { x: 560, y: 350, type: '💎' },
    ]
  },
  darkCastle: { 
    name: 'Dark Castle', 
    unlocked: false, 
    waves: 25,
    description: 'The final stronghold of the dark lord',
    theme: 'dark',
    bgGradient: 'from-slate-950 via-gray-900 to-slate-950',
    pathColor: 'rgba(40, 40, 50, 0.9)',
    glowColor: 'rgba(100, 116, 139, 0.4)',
    path: [
      { x: 0, y: 200 },
      { x: 60, y: 200 },
      { x: 60, y: 60 },
      { x: 180, y: 60 },
      { x: 180, y: 320 },
      { x: 300, y: 320 },
      { x: 300, y: 140 },
      { x: 420, y: 140 },
      { x: 420, y: 280 },
      { x: 540, y: 280 },
      { x: 540, y: 100 },
      { x: 650, y: 100 },
      { x: 650, y: 200 },
      { x: 700, y: 200 },
    ],
    decorations: [
      { x: 120, y: 150, type: '🏰' },
      { x: 240, y: 200, type: '⚰️' },
      { x: 370, y: 60, type: '🦇' },
      { x: 480, y: 350, type: '💀' },
      { x: 600, y: 180, type: '🏰' },
    ]
  },
};

export default function TowerDefenseGame() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const gameLoopRef = useRef<number>();
  const factIntervalRef = useRef<NodeJS.Timeout>();
  
  const [towers, setTowers] = useState<Tower[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [gold, setGold] = useState(300);
  const [lives, setLives] = useState(25);
  const [wave, setWave] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [selectedTower, setSelectedTower] = useState<TowerType | null>('archer');
  const [currentMap, setCurrentMap] = useState<string>('greenlands');
  const [xpEarned, setXpEarned] = useState(0);
  const [unlockedTowers, setUnlockedTowers] = useState<TowerType[]>(['archer', 'cannon']);
  const [unlockedMaps, setUnlockedMaps] = useState<string[]>(['greenlands']);
  const [placementMode, setPlacementMode] = useState(false);
  const [mantleFact, setMantleFact] = useState<string>(getRandomMantleFact());
  const [killCount, setKillCount] = useState(0);
  const [totalKills, setTotalKills] = useState(0);
  const [showMapSelect, setShowMapSelect] = useState(false);

  const currentMapData = MAPS[currentMap];
  const currentPath = currentMapData.path;

  // Show Mantle fact constantly - rotate every 4 seconds
  useEffect(() => {
    factIntervalRef.current = setInterval(() => {
      setMantleFact(getRandomMantleFact());
    }, 4000);
    
    return () => {
      if (factIntervalRef.current) {
        clearInterval(factIntervalRef.current);
      }
    };
  }, []);

  // Show contextual Mantle fact
  const showContextualFact = useCallback((context: 'tower' | 'kill' | 'wave' | 'discovery') => {
    const categories: Record<string, 'technology' | 'ecosystem' | 'benefits' | 'strategy'> = {
      tower: 'technology',
      kill: 'benefits',
      wave: 'strategy',
      discovery: 'ecosystem',
    };
    const fact = getMantleFactByCategory(categories[context]);
    setMantleFact(fact);
  }, []);

  // Spawn enemies for current wave
  const spawnWave = useCallback(() => {
    const enemyCount = wave * 3 + 6;
    const newEnemies: Enemy[] = [];
    const availableTypes: EnemyType[] = ['goblin'];
    
    if (wave >= 2) availableTypes.push('orc');
    if (wave >= 4) availableTypes.push('troll');
    if (wave >= 6) availableTypes.push('necromancer');
    if (wave >= 8) availableTypes.push('dragon');
    if (wave >= 10) availableTypes.push('wraith');
    if (wave >= 12) availableTypes.push('golem');
    
    for (let i = 0; i < enemyCount; i++) {
      const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      const baseStats = ENEMY_TYPES[type];
      const waveScaling = 1 + (wave - 1) * 0.12;
      
      newEnemies.push({
        id: `enemy-${wave}-${i}-${Date.now()}`,
        type,
        x: currentPath[0].x - (i * 60),
        y: currentPath[0].y,
        health: Math.floor(baseStats.health * waveScaling),
        maxHealth: Math.floor(baseStats.health * waveScaling),
        speed: baseStats.speed + wave * 0.03,
        pathIndex: 0,
        reward: Math.floor(baseStats.reward * (1 + wave * 0.1)),
        armor: baseStats.armor + Math.floor(wave / 3),
        slowed: false,
      });
    }
    
    setEnemies(prev => [...prev, ...newEnemies]);
  }, [wave, currentPath]);

  // Main game loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;
    
    const gameLoop = () => {
      const now = Date.now();
      
      // Move enemies
      setEnemies(prevEnemies => {
        return prevEnemies.map(enemy => {
          const targetPoint = currentPath[enemy.pathIndex];
          if (!targetPoint) return enemy;
          
          const dx = targetPoint.x - enemy.x;
          const dy = targetPoint.y - enemy.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          const effectiveSpeed = enemy.slowed ? enemy.speed * 0.5 : enemy.speed;
          
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
            x: enemy.x + (dx / distance) * effectiveSpeed,
            y: enemy.y + (dy / distance) * effectiveSpeed,
            slowed: false, // Reset slow each frame
          };
        }).filter(e => e.health > 0);
      });
      
      // Tower attacks
      setTowers(prevTowers => {
        return prevTowers.map(tower => {
          if (now - tower.lastFired < tower.fireRate) return tower;
          
          const towerData = TOWER_TYPES[tower.type];
          
          setEnemies(prevEnemies => {
            const enemiesInRange = prevEnemies.filter(enemy => {
              const dx = enemy.x - tower.x;
              const dy = enemy.y - tower.y;
              return Math.sqrt(dx * dx + dy * dy) <= tower.range;
            });
            
            if (enemiesInRange.length === 0) return prevEnemies;
            
            // Sort by distance for targeting
            enemiesInRange.sort((a, b) => {
              const distA = Math.sqrt((a.x - tower.x) ** 2 + (a.y - tower.y) ** 2);
              const distB = Math.sqrt((b.x - tower.x) ** 2 + (b.y - tower.y) ** 2);
              return distA - distB;
            });
            
            const targets = tower.type === 'tesla' ? enemiesInRange.slice(0, 3) : [enemiesInRange[0]];
            
            return prevEnemies.map(enemy => {
              if (!targets.find(t => t.id === enemy.id)) {
                // Frost tower slows all in range
                if (tower.type === 'frost' && enemiesInRange.find(e => e.id === enemy.id)) {
                  return { ...enemy, slowed: true };
                }
                return enemy;
              }
              
              // Calculate damage (wizard ignores armor)
              const armorReduction = tower.type === 'wizard' ? 0 : enemy.armor;
              const effectiveDamage = Math.max(tower.damage - armorReduction, 5);
              const newHealth = enemy.health - effectiveDamage;
              
              if (newHealth <= 0) {
                setGold(prev => prev + enemy.reward);
                setXpEarned(prev => prev + 8);
                setKillCount(prev => prev + 1);
                setTotalKills(prev => {
                  const newTotal = prev + 1;
                  if (newTotal % 5 === 0) {
                    showContextualFact('kill');
                  }
                  return newTotal;
                });
                return { ...enemy, health: 0 };
              }
              
              return { 
                ...enemy, 
                health: newHealth,
                slowed: tower.type === 'frost' ? true : enemy.slowed,
              };
            }).filter(e => e.health > 0);
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
  }, [isPlaying, gameOver, currentPath, showContextualFact]);

  // Check wave completion
  useEffect(() => {
    if (isPlaying && enemies.length === 0 && wave > 0) {
      if (wave >= currentMapData.waves) {
        handleVictory();
      } else {
        showContextualFact('wave');
        setTimeout(() => {
          setWave(prev => prev + 1);
        }, 2500);
      }
    }
  }, [enemies.length, isPlaying, wave, currentMapData.waves, showContextualFact]);

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
    
    const earnedXP = xpEarned + 200 + wave * 20;
    setXpEarned(earnedXP);
    
    // Unlock next map
    const mapKeys = Object.keys(MAPS);
    const currentIndex = mapKeys.indexOf(currentMap);
    if (currentIndex < mapKeys.length - 1) {
      const nextMap = mapKeys[currentIndex + 1];
      if (!unlockedMaps.includes(nextMap)) {
        setUnlockedMaps(prev => [...prev, nextMap]);
        showContextualFact('discovery');
        toast.success(`New map unlocked: ${MAPS[nextMap].name}!`);
      }
    }
    
    // Unlock new tower
    const lockedTowers = (Object.keys(TOWER_TYPES) as TowerType[]).filter(t => !unlockedTowers.includes(t));
    if (lockedTowers.length > 0 && wave >= 5) {
      const newTower = lockedTowers[0];
      setUnlockedTowers(prev => [...prev, newTower]);
      toast.success(`New tower unlocked: ${TOWER_TYPES[newTower].name}!`);
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

  const placeTower = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedTower || !placementMode) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const towerData = TOWER_TYPES[selectedTower];
    if (gold < towerData.cost) {
      toast.error('Not enough gold!');
      return;
    }
    
    // Check distance from path
    const minDistanceFromPath = 35;
    for (const point of currentPath) {
      const dx = point.x - x;
      const dy = point.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < minDistanceFromPath) {
        toast.error('Too close to the path!');
        return;
      }
    }
    
    // Check distance from other towers
    for (const tower of towers) {
      const dx = tower.x - x;
      const dy = tower.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < 50) {
        toast.error('Too close to another tower!');
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
      kills: 0,
    };
    
    setTowers(prev => [...prev, newTower]);
    setGold(prev => prev - towerData.cost);
    setPlacementMode(false);
    showContextualFact('tower');
    toast.success(`${towerData.name} placed!`);
  };

  const startGame = () => {
    setIsPlaying(true);
    setWave(1);
    setMantleFact(getMantleFactByCategory('strategy'));
  };

  const resetGame = () => {
    setTowers([]);
    setEnemies([]);
    setGold(300);
    setLives(25);
    setWave(0);
    setIsPlaying(false);
    setGameOver(false);
    setVictory(false);
    setXpEarned(0);
    setKillCount(0);
    setTotalKills(0);
    setMantleFact(getRandomMantleFact());
  };

  const selectMap = (mapKey: string) => {
    if (unlockedMaps.includes(mapKey)) {
      setCurrentMap(mapKey);
      resetGame();
      setShowMapSelect(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="gap-2 text-foreground hover:bg-foreground/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <h1 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <Castle className="w-5 h-5" />
            TOWER DEFENSE
          </h1>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-foreground/10 rounded-lg text-sm">
              <Star className="w-4 h-4 text-foreground" />
              <span className="font-medium text-foreground">{xpEarned}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-16 pb-6 px-3">
        <div className="max-w-7xl mx-auto">
          {/* Mantle Fact Banner - Always visible and rotating */}
          <motion.div
            key={mantleFact}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 p-3 rounded-xl bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/30"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Lightbulb className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground font-medium leading-relaxed">{mantleFact}</p>
                <p className="text-xs text-emerald-400/70 mt-1">📚 docs.mantle.xyz • Learn while you play!</p>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-6 gap-4">
            {/* Left Panel - Resources & Towers */}
            <div className="lg:col-span-1 space-y-3">
              {/* Resources Panel */}
              <div className="p-3 rounded-xl bg-card border border-border">
                <h3 className="font-display text-xs font-bold text-foreground mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Resources
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-foreground/5">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-xs text-foreground/70">Lives</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">{lives}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-foreground/5">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs text-foreground/70">Gold</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">{gold}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-foreground/5">
                    <div className="flex items-center gap-2">
                      <Skull className="w-4 h-4 text-red-400" />
                      <span className="text-xs text-foreground/70">Kills</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">{totalKills}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-foreground/70">Wave</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">{wave}/{currentMapData.waves}</span>
                  </div>
                </div>
              </div>

              {/* Tower Selection */}
              <div className="p-3 rounded-xl bg-card border border-border">
                <h3 className="font-display text-xs font-bold text-foreground mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  Towers
                </h3>
                <div className="space-y-1.5">
                  {(Object.entries(TOWER_TYPES) as [TowerType, typeof TOWER_TYPES[TowerType]][]).map(([key, tower]) => {
                    const isUnlocked = unlockedTowers.includes(key);
                    const TowerIcon = tower.icon;
                    const canAfford = gold >= tower.cost;
                    
                    return (
                      <div
                        key={key}
                        onClick={() => {
                          if (isUnlocked && canAfford) {
                            setSelectedTower(key);
                            setPlacementMode(true);
                          }
                        }}
                        className={`
                          p-2 rounded-lg border transition-all cursor-pointer
                          ${selectedTower === key && placementMode ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/50' : 'border-border/50'}
                          ${!isUnlocked || !canAfford ? 'opacity-40 cursor-not-allowed' : 'hover:border-foreground/30 hover:bg-foreground/5'}
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg ${tower.bgColor} flex items-center justify-center shadow-lg`}>
                            <TowerIcon className="w-4 h-4 text-white drop-shadow" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-foreground truncate">{tower.name}</span>
                            </div>
                            <div className="flex items-center justify-between mt-0.5">
                              <span className="text-[10px] text-foreground/50">{tower.special}</span>
                              {isUnlocked ? (
                                <span className={`text-xs font-bold ${canAfford ? 'text-yellow-500' : 'text-red-400'}`}>
                                  {tower.cost}g
                                </span>
                              ) : (
                                <Lock className="w-3 h-3 text-foreground/30" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Main Game Board */}
            <div className="lg:col-span-4">
              <div 
                className={`relative w-full h-[420px] rounded-2xl border-2 border-foreground/20 overflow-hidden bg-gradient-to-br ${currentMapData.bgGradient} shadow-2xl`}
                onClick={placeTower}
                style={{ cursor: placementMode ? 'crosshair' : 'default' }}
              >
                {/* Ambient lighting effects */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/5 to-transparent" />
                  <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                
                {/* Decorations */}
                {currentMapData.decorations.map((dec, i) => (
                  <div
                    key={i}
                    className="absolute text-2xl select-none pointer-events-none opacity-60"
                    style={{ left: dec.x, top: dec.y }}
                  >
                    {dec.type}
                  </div>
                ))}
                
                {/* Path visualization - isometric style */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <filter id="pathGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={currentMapData.glowColor} />
                      <stop offset="50%" stopColor={currentMapData.pathColor} />
                      <stop offset="100%" stopColor={currentMapData.glowColor} />
                    </linearGradient>
                  </defs>
                  {/* Outer glow */}
                  <polyline
                    points={currentPath.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke={currentMapData.glowColor}
                    strokeWidth="50"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#pathGlow)"
                    opacity="0.5"
                  />
                  {/* Main path */}
                  <polyline
                    points={currentPath.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke={currentMapData.pathColor}
                    strokeWidth="38"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Path highlight */}
                  <polyline
                    points={currentPath.map(p => `${p.x},${p.y - 2}`).join(' ')}
                    fill="none"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="32"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Towers with isometric 3D effect */}
                {towers.map(tower => {
                  const towerData = TOWER_TYPES[tower.type];
                  const TowerIcon = towerData.icon;
                  return (
                    <motion.div
                      key={tower.id}
                      initial={{ scale: 0, y: -50 }}
                      animate={{ scale: 1, y: 0 }}
                      className="absolute"
                      style={{ 
                        left: tower.x - 25, 
                        top: tower.y - 35,
                      }}
                    >
                      {/* Tower base shadow */}
                      <div 
                        className="absolute w-12 h-4 bg-black/40 rounded-full blur-sm"
                        style={{ bottom: -8, left: 6 }}
                      />
                      {/* Tower structure */}
                      <div className={`relative w-14 h-16 ${towerData.bgColor} rounded-t-xl rounded-b-lg border-2 border-white/20 flex flex-col items-center justify-center shadow-xl`}>
                        {/* Tower roof */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-gradient-to-b from-white/20 to-transparent rounded-t-full" />
                        {/* Tower icon */}
                        <TowerIcon className="w-6 h-6 text-white drop-shadow-lg" />
                        {/* Level badge */}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border border-foreground/20 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-foreground">{tower.level}</span>
                        </div>
                      </div>
                      {/* Range indicator */}
                      <div 
                        className="absolute rounded-full border border-white/10 pointer-events-none"
                        style={{
                          width: tower.range * 2,
                          height: tower.range * 2,
                          left: 28 - tower.range,
                          top: 32 - tower.range,
                          opacity: 0.2,
                        }}
                      />
                    </motion.div>
                  );
                })}

                {/* Enemies */}
                {enemies.map(enemy => {
                  const enemyData = ENEMY_TYPES[enemy.type];
                  return (
                    <motion.div
                      key={enemy.id}
                      className="absolute pointer-events-none"
                      animate={{ 
                        left: enemy.x - 18, 
                        top: enemy.y - 18,
                      }}
                      transition={{ duration: 0.05, ease: "linear" }}
                    >
                      {/* Enemy shadow */}
                      <div className="absolute w-6 h-2 bg-black/40 rounded-full blur-sm" style={{ bottom: -4, left: 6 }} />
                      {/* Enemy body */}
                      <div className={`w-9 h-9 rounded-full ${enemyData.color} border-2 ${enemy.slowed ? 'border-cyan-400' : 'border-white/40'} flex items-center justify-center shadow-lg`}>
                        <span className="text-lg select-none">{enemyData.emoji}</span>
                      </div>
                      {/* Health bar */}
                      <div className="absolute -top-2 left-0 w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-green-500 to-green-400"
                          initial={{ width: '100%' }}
                          animate={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                        />
                      </div>
                      {/* Slow indicator */}
                      {enemy.slowed && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                          <Snowflake className="w-3 h-3 text-cyan-400 animate-pulse" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {/* Placement overlay */}
                {placementMode && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-emerald-500/5 flex items-center justify-center"
                  >
                    <div className="px-4 py-2 bg-background/90 rounded-xl border border-emerald-500/50 shadow-lg">
                      <p className="text-foreground text-sm font-medium flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-400" />
                        Click to place {selectedTower && TOWER_TYPES[selectedTower].name}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Start overlay */}
                {!isPlaying && !gameOver && wave === 0 && (
                  <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center p-8"
                    >
                      <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-2xl">
                        <Castle className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="font-display text-3xl font-bold text-foreground mb-2">{currentMapData.name}</h3>
                      <p className="text-foreground/60 mb-1">{currentMapData.description}</p>
                      <p className="text-sm text-emerald-400 mb-6">{currentMapData.waves} waves • {currentMapData.theme} theme</p>
                      <Button
                        onClick={startGame}
                        size="lg"
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                      >
                        <Play className="w-5 h-5" />
                        Start Battle
                      </Button>
                    </motion.div>
                  </div>
                )}
              </div>

              {/* Game Controls */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-2">
                  {isPlaying ? (
                    <Button
                      onClick={() => setIsPlaying(false)}
                      variant="outline"
                      size="sm"
                      className="gap-2 border-border text-foreground"
                    >
                      <Pause className="w-4 h-4" />
                      Pause
                    </Button>
                  ) : wave > 0 && !gameOver ? (
                    <Button
                      onClick={() => setIsPlaying(true)}
                      size="sm"
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Play className="w-4 h-4" />
                      Resume
                    </Button>
                  ) : null}
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
                  onClick={() => setShowMapSelect(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-border text-foreground"
                >
                  <Map className="w-4 h-4" />
                  Maps
                </Button>
              </div>
            </div>

            {/* Right Panel - Map & Info */}
            <div className="lg:col-span-1 space-y-3">
              {/* Current Map */}
              <div className="p-3 rounded-xl bg-card border border-border">
                <h3 className="font-display text-xs font-bold text-foreground mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <Map className="w-3.5 h-3.5" />
                  Current Map
                </h3>
                <div className={`p-3 rounded-lg bg-gradient-to-br ${currentMapData.bgGradient} border border-foreground/10`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Mountain className="w-4 h-4 text-white/80" />
                    <span className="text-sm font-bold text-white">{currentMapData.name}</span>
                  </div>
                  <p className="text-[10px] text-white/60 leading-relaxed">{currentMapData.description}</p>
                </div>
              </div>

              {/* Enemy Types */}
              <div className="p-3 rounded-xl bg-card border border-border">
                <h3 className="font-display text-xs font-bold text-foreground mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <Skull className="w-3.5 h-3.5" />
                  Enemies
                </h3>
                <div className="grid grid-cols-4 gap-1.5">
                  {(Object.entries(ENEMY_TYPES) as [EnemyType, typeof ENEMY_TYPES[EnemyType]][]).map(([key, enemy]) => (
                    <div 
                      key={key}
                      className={`aspect-square rounded-lg ${enemy.color} flex items-center justify-center text-lg`}
                      title={`${key}: ${enemy.health}HP, ${enemy.armor}ARM`}
                    >
                      {enemy.emoji}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mantle Learning */}
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-500/20">
                <h3 className="font-display text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Mantle Learning
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-foreground/70">
                    <span>Facts Learned</span>
                    <span className="font-bold text-emerald-400">{Math.floor(totalKills / 5) + wave}</span>
                  </div>
                  <div className="flex justify-between text-foreground/70">
                    <span>Strategy Level</span>
                    <span className="font-bold text-emerald-400">{Math.floor(totalKills / 10) + 1}</span>
                  </div>
                </div>
                <p className="text-[10px] text-foreground/50 mt-2">Every action teaches you about Mantle Network!</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Map Selection Modal */}
      <AnimatePresence>
        {showMapSelect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setShowMapSelect(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Map className="w-6 h-6" />
                Select Map
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(MAPS).map(([key, map]) => {
                  const isUnlocked = unlockedMaps.includes(key);
                  return (
                    <div
                      key={key}
                      onClick={() => isUnlocked && selectMap(key)}
                      className={`
                        p-4 rounded-xl border-2 transition-all cursor-pointer
                        ${currentMap === key ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-border'}
                        ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : 'hover:border-foreground/50'}
                        bg-gradient-to-br ${map.bgGradient}
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-display font-bold text-white">{map.name}</span>
                        {!isUnlocked && <Lock className="w-4 h-4 text-white/50" />}
                      </div>
                      <p className="text-xs text-white/60 mb-2">{map.description}</p>
                      <div className="flex items-center gap-2 text-xs text-white/80">
                        <span>{map.waves} waves</span>
                        <span>•</span>
                        <span className="capitalize">{map.theme}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <Button
                onClick={() => setShowMapSelect(false)}
                className="w-full mt-6 bg-foreground text-background hover:bg-foreground/90"
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center"
            >
              {victory ? (
                <>
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-2xl">
                    <Trophy className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="font-display text-3xl font-bold text-foreground mb-2">VICTORY!</h2>
                  <p className="text-foreground/60 mb-2">The kingdom is saved!</p>
                  <p className="text-sm text-emerald-400 mb-4">
                    🎓 You learned {Math.floor(totalKills / 5) + wave} facts about Mantle!
                  </p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-2xl">
                    <Skull className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="font-display text-3xl font-bold text-foreground mb-2">DEFEAT</h2>
                  <p className="text-foreground/60 mb-4">The enemies have breached the walls...</p>
                </>
              )}
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 rounded-lg bg-foreground/5">
                  <p className="text-2xl font-bold text-foreground">{wave}</p>
                  <p className="text-xs text-foreground/60">Waves</p>
                </div>
                <div className="p-3 rounded-lg bg-foreground/5">
                  <p className="text-2xl font-bold text-foreground">{totalKills}</p>
                  <p className="text-xs text-foreground/60">Kills</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10">
                  <p className="text-2xl font-bold text-emerald-400">+{xpEarned}</p>
                  <p className="text-xs text-foreground/60">XP</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/journey')}
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-foreground/10"
                >
                  Journey
                </Button>
                <Button
                  onClick={resetGame}
                  className="flex-1 bg-foreground text-background hover:bg-foreground/90"
                >
                  Play Again
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
