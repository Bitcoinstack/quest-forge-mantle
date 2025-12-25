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
  Lightbulb
} from 'lucide-react';

// Tower types
interface Tower {
  id: string;
  type: 'basic' | 'sniper' | 'splash' | 'slow';
  x: number;
  y: number;
  level: number;
  damage: number;
  range: number;
  fireRate: number;
  lastFired: number;
}

// Enemy types
interface Enemy {
  id: string;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  speed: number;
  pathIndex: number;
  reward: number;
}

// Tower definitions
const TOWER_TYPES = {
  basic: { 
    name: 'Basic Tower', 
    cost: 50, 
    damage: 10, 
    range: 100, 
    fireRate: 1000, 
    color: 'bg-foreground/70',
    unlocked: true
  },
  sniper: { 
    name: 'Sniper Tower', 
    cost: 100, 
    damage: 50, 
    range: 200, 
    fireRate: 2000, 
    color: 'bg-blue-500',
    unlocked: false
  },
  splash: { 
    name: 'Splash Tower', 
    cost: 150, 
    damage: 20, 
    range: 80, 
    fireRate: 1500, 
    color: 'bg-orange-500',
    unlocked: false
  },
  slow: { 
    name: 'Slow Tower', 
    cost: 75, 
    damage: 5, 
    range: 100, 
    fireRate: 500, 
    color: 'bg-cyan-500',
    unlocked: false
  },
};

// Path for enemies
const ENEMY_PATH = [
  { x: 0, y: 200 },
  { x: 150, y: 200 },
  { x: 150, y: 100 },
  { x: 300, y: 100 },
  { x: 300, y: 300 },
  { x: 450, y: 300 },
  { x: 450, y: 150 },
  { x: 600, y: 150 },
];

// Maps configuration
const MAPS = {
  forest: { name: 'Forest', unlocked: true, waves: 10, bgColor: 'bg-emerald-900/30' },
  desert: { name: 'Desert', unlocked: false, waves: 15, bgColor: 'bg-amber-900/30' },
  volcano: { name: 'Volcano', unlocked: false, waves: 20, bgColor: 'bg-red-900/30' },
};

// Mantle tips to show on good moves
const MANTLE_TIPS = [
  "🎮 Mantle is a modular L2 scaling solution built on Ethereum!",
  "💡 Mantle uses Optimistic Rollups for fast, low-cost transactions.",
  "🔥 Build on Mantle: docs.mantle.xyz/network",
  "⚡ Mantle achieves high throughput with data availability layers.",
  "🌐 Mantle is EVM-compatible - deploy your Solidity contracts easily!",
  "🔐 Mantle inherits Ethereum's security while reducing gas costs.",
  "🚀 Learn to build dApps on Mantle: docs.mantle.xyz/developers",
  "💰 Mantle uses $MNT as its native token for gas fees.",
  "🏗️ Build scalable dApps with Mantle's modular architecture!",
  "🔗 Mantle bridges assets seamlessly from Ethereum mainnet.",
];

export default function TowerDefenseGame() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const gameLoopRef = useRef<number>();
  
  const [towers, setTowers] = useState<Tower[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [gold, setGold] = useState(200);
  const [lives, setLives] = useState(20);
  const [wave, setWave] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [selectedTower, setSelectedTower] = useState<keyof typeof TOWER_TYPES | null>('basic');
  const [currentMap, setCurrentMap] = useState<keyof typeof MAPS>('forest');
  const [xpEarned, setXpEarned] = useState(0);
  const [unlockedTowers, setUnlockedTowers] = useState<string[]>(['basic']);
  const [showTutorial, setShowTutorial] = useState(false);
  const [placementMode, setPlacementMode] = useState(false);
  const [mantleTip, setMantleTip] = useState<string | null>(null);
  const [killCount, setKillCount] = useState(0);

  // Show Mantle tip on kills
  const showMantleTip = () => {
    const tip = MANTLE_TIPS[Math.floor(Math.random() * MANTLE_TIPS.length)];
    setMantleTip(tip);
    setTimeout(() => setMantleTip(null), 4000);
  };

  // Spawn enemies for current wave
  const spawnWave = useCallback(() => {
    const enemyCount = wave * 2 + 3;
    const newEnemies: Enemy[] = [];
    
    for (let i = 0; i < enemyCount; i++) {
      newEnemies.push({
        id: `enemy-${wave}-${i}`,
        x: ENEMY_PATH[0].x - (i * 40),
        y: ENEMY_PATH[0].y,
        health: 20 + wave * 10,
        maxHealth: 20 + wave * 10,
        speed: 1 + wave * 0.1,
        pathIndex: 0,
        reward: 10 + wave * 2,
      });
    }
    
    setEnemies(prev => [...prev, ...newEnemies]);
  }, [wave]);

  // Game loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;
    
    const gameLoop = () => {
      const now = Date.now();
      
      setEnemies(prevEnemies => {
        return prevEnemies.map(enemy => {
          const targetPoint = ENEMY_PATH[enemy.pathIndex];
          if (!targetPoint) return enemy;
          
          const dx = targetPoint.x - enemy.x;
          const dy = targetPoint.y - enemy.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 5) {
            // Move to next point
            if (enemy.pathIndex < ENEMY_PATH.length - 1) {
              return { ...enemy, pathIndex: enemy.pathIndex + 1 };
            } else {
              // Enemy reached the end
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
          
          // Find nearest enemy in range
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
                  const newHealth = e.health - tower.damage;
                  if (newHealth <= 0) {
                    setGold(prev => prev + e.reward);
                    setXpEarned(prev => prev + 5);
                    setKillCount(prev => {
                      const newCount = prev + 1;
                      // Show Mantle tip every 5 kills
                      if (newCount % 5 === 0) {
                        showMantleTip();
                      }
                      return newCount;
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
  }, [isPlaying, gameOver]);

  // Check wave completion
  useEffect(() => {
    if (isPlaying && enemies.length === 0 && wave > 0) {
      const mapData = MAPS[currentMap];
      if (wave >= mapData.waves) {
        // Victory!
        handleVictory();
      } else {
        // Next wave
        setTimeout(() => {
          setWave(prev => prev + 1);
        }, 2000);
      }
    }
  }, [enemies, isPlaying, wave, currentMap]);

  // Spawn wave when wave number changes
  useEffect(() => {
    if (wave > 0 && isPlaying) {
      spawnWave();
    }
  }, [wave, spawnWave, isPlaying]);

  const handleVictory = async () => {
    setIsPlaying(false);
    setGameOver(true);
    
    const earnedXP = xpEarned + 100 + wave * 10;
    setXpEarned(earnedXP);
    
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
            game_data: { result: 'win', wave, gold }
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
  };

  const startGame = () => {
    setIsPlaying(true);
    setWave(1);
  };

  const resetGame = () => {
    setTowers([]);
    setEnemies([]);
    setGold(200);
    setLives(20);
    setWave(0);
    setIsPlaying(false);
    setGameOver(false);
    setXpEarned(0);
    setKillCount(0);
    setMantleTip(null);
  };

  const unlockTower = (towerType: keyof typeof TOWER_TYPES) => {
    const cost = TOWER_TYPES[towerType].cost * 5;
    if (gold >= cost) {
      setGold(prev => prev - cost);
      setUnlockedTowers(prev => [...prev, towerType]);
      toast.success(`${TOWER_TYPES[towerType].name} unlocked!`);
    }
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
        <div className="max-w-6xl mx-auto">
          {/* Mantle Tip Banner */}
          <AnimatePresence>
            {mantleTip && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 rounded-xl bg-foreground/10 border border-foreground/20 flex items-center gap-3"
              >
                <Lightbulb className="w-5 h-5 text-foreground shrink-0" />
                <p className="text-sm text-foreground">{mantleTip}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Game Stats */}
            <div className="space-y-4">
              {/* Resources */}
              <div className="p-4 rounded-2xl bg-card border border-border">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <Heart className="w-5 h-5 text-red-500 mx-auto mb-1" />
                    <span className="text-lg font-bold text-foreground">{lives}</span>
                    <p className="text-xs text-foreground/50">Lives</p>
                  </div>
                  <div>
                    <Coins className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                    <span className="text-lg font-bold text-foreground">{gold}</span>
                    <p className="text-xs text-foreground/50">Gold</p>
                  </div>
                  <div>
                    <Castle className="w-5 h-5 text-foreground/50 mx-auto mb-1" />
                    <span className="text-lg font-bold text-foreground">{wave}</span>
                    <p className="text-xs text-foreground/50">Wave</p>
                  </div>
                </div>
              </div>

              {/* Tower Selection */}
              <div className="p-4 rounded-2xl bg-card border border-border">
                <h3 className="font-display text-sm font-semibold text-foreground mb-3">TOWERS</h3>
                <div className="space-y-2">
                  {Object.entries(TOWER_TYPES).map(([key, tower]) => {
                    const isUnlocked = unlockedTowers.includes(key);
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
                          ${selectedTower === key && placementMode ? 'border-foreground bg-foreground/10' : 'border-border'}
                          ${!isUnlocked ? 'opacity-50' : 'hover:border-foreground/50'}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded ${tower.color}`} />
                            <span className="text-sm font-medium text-foreground">{tower.name}</span>
                          </div>
                          {isUnlocked ? (
                            <span className="text-xs text-foreground/50">{tower.cost}g</span>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                unlockTower(key as keyof typeof TOWER_TYPES);
                              }}
                              className="h-6 px-2 text-xs"
                            >
                              <Lock className="w-3 h-3 mr-1" />
                              {tower.cost * 5}g
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {!isPlaying && !gameOver && wave === 0 && (
                  <Button
                    onClick={startGame}
                    className="w-full gap-2 bg-foreground text-background hover:bg-foreground/90"
                  >
                    <Play className="w-4 h-4" />
                    Start Wave
                  </Button>
                )}
                {isPlaying && (
                  <Button
                    onClick={() => setIsPlaying(false)}
                    variant="outline"
                    className="w-full gap-2 border-border text-foreground"
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </Button>
                )}
                <Button
                  onClick={resetGame}
                  variant="outline"
                  className="w-full gap-2 border-border text-foreground hover:bg-foreground/10"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
                <Button
                  onClick={() => setShowTutorial(true)}
                  variant="outline"
                  className="w-full gap-2 border-border text-foreground hover:bg-foreground/10"
                >
                  <BookOpen className="w-4 h-4" />
                  Tutorial
                </Button>
              </div>
            </div>

            {/* Game Board */}
            <div className="lg:col-span-3">
              <div 
                className={`relative w-full h-[400px] rounded-2xl border border-border overflow-hidden ${MAPS[currentMap].bgColor}`}
                onClick={(e) => {
                  if (placementMode) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    placeTower(x, y);
                  }
                }}
              >
                {/* Path visualization */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <polyline
                    points={ENEMY_PATH.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="30"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Towers */}
                {towers.map(tower => (
                  <motion.div
                    key={tower.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute w-10 h-10 rounded-lg ${TOWER_TYPES[tower.type].color} border-2 border-foreground/30 flex items-center justify-center`}
                    style={{ 
                      left: tower.x - 20, 
                      top: tower.y - 20,
                    }}
                  >
                    <Castle className="w-5 h-5 text-foreground" />
                    {/* Range indicator */}
                    <div 
                      className="absolute rounded-full border border-foreground/10 pointer-events-none"
                      style={{
                        width: tower.range * 2,
                        height: tower.range * 2,
                        left: 20 - tower.range,
                        top: 20 - tower.range,
                      }}
                    />
                  </motion.div>
                ))}

                {/* Enemies */}
                {enemies.map(enemy => (
                  <motion.div
                    key={enemy.id}
                    className="absolute w-8 h-8 rounded-full bg-red-500 border-2 border-red-300 flex items-center justify-center"
                    style={{ 
                      left: enemy.x - 16, 
                      top: enemy.y - 16,
                    }}
                    animate={{ x: 0, y: 0 }}
                  >
                    {/* Health bar */}
                    <div className="absolute -top-2 left-0 w-full h-1 bg-red-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all duration-100"
                        style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                      />
                    </div>
                  </motion.div>
                ))}

                {/* Placement indicator */}
                {placementMode && (
                  <div className="absolute inset-0 bg-foreground/5 flex items-center justify-center">
                    <p className="text-foreground/50 text-sm">Click to place tower</p>
                  </div>
                )}
              </div>

              {/* Map selection */}
              <div className="mt-4 flex gap-2">
                {Object.entries(MAPS).map(([key, map]) => (
                  <Button
                    key={key}
                    variant={currentMap === key ? 'default' : 'outline'}
                    size="sm"
                    disabled={!map.unlocked}
                    onClick={() => {
                      setCurrentMap(key as keyof typeof MAPS);
                      resetGame();
                    }}
                    className={currentMap === key ? 'bg-foreground text-background' : 'border-border text-foreground'}
                  >
                    {!map.unlocked && <Lock className="w-3 h-3 mr-1" />}
                    {map.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Game Over Modal */}
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
              {lives > 0 ? (
                <>
                  <Trophy className="w-16 h-16 text-foreground mx-auto mb-4" />
                  <h2 className="font-display text-3xl font-bold text-foreground mb-2">VICTORY!</h2>
                  <p className="text-foreground/60 mb-2">All waves defeated!</p>
                  <p className="text-sm text-foreground/50 mb-4">
                    💡 Learn more about Mantle Network at docs.mantle.xyz
                  </p>
                </>
              ) : (
                <>
                  <Castle className="w-16 h-16 text-foreground/50 mx-auto mb-4" />
                  <h2 className="font-display text-3xl font-bold text-foreground mb-2">DEFEAT</h2>
                  <p className="text-foreground/60 mb-4">Your base was destroyed</p>
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
                  className="flex-1 bg-foreground text-background hover:bg-foreground/90"
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
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">Tower Defense Tutorial</h2>
              
              <div className="space-y-4 text-sm text-foreground/80">
                <p><strong className="text-foreground">Objective:</strong> Prevent enemies from reaching the end of the path!</p>
                <p><strong className="text-foreground">How to play:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Select a tower from the sidebar</li>
                  <li>Click on the game board to place it</li>
                  <li>Towers automatically attack enemies in range</li>
                  <li>Earn gold by defeating enemies</li>
                  <li>Unlock new towers with gold</li>
                </ul>
                <p><strong className="text-foreground">XP Rewards:</strong> 5 XP per kill + 100 XP for victory</p>
                <p className="text-foreground/60">
                  Defeat enemies to learn about Mantle Network!
                </p>
              </div>
              
              <Button
                onClick={() => setShowTutorial(false)}
                className="w-full mt-6 bg-foreground text-background hover:bg-foreground/90"
              >
                Got it!
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
