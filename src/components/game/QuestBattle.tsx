import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sword, Shield, Heart, Zap, ArrowLeft, Trophy, 
  Coins, Gem, Star, Target, Clock, Sparkles, 
  X
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface QuestBattleProps {
  quest: any;
  onComplete: () => void;
  onExit: () => void;
}

interface Enemy {
  id: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
}

interface BattleLog {
  id: string;
  message: string;
  type: 'player' | 'enemy' | 'system';
  damage?: number;
}

export const QuestBattle: React.FC<QuestBattleProps> = ({ quest, onComplete, onExit }) => {
  const { selectedCharacter, profile, updateCharacter, setProfile } = useGameStore();
  const [enemy, setEnemy] = useState<Enemy | null>(null);
  const [playerHealth, setPlayerHealth] = useState(0);
  const [playerMana, setPlayerMana] = useState(0);
  const [battleLog, setBattleLog] = useState<BattleLog[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [battlePhase, setBattlePhase] = useState<'intro' | 'battle' | 'victory' | 'defeat'>('intro');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (selectedCharacter) {
      setPlayerHealth(selectedCharacter.health);
      setPlayerMana(selectedCharacter.mana);
      generateEnemy();
    }
  }, [selectedCharacter]);

  const generateEnemy = () => {
    const enemyTypes = [
      { name: 'Goblin Warrior', baseAttack: 8, baseDefense: 3, baseHealth: 60 },
      { name: 'Orc Berserker', baseAttack: 12, baseDefense: 5, baseHealth: 80 },
      { name: 'Dark Mage', baseAttack: 10, baseDefense: 2, baseHealth: 50 },
      { name: 'Skeleton Knight', baseAttack: 9, baseDefense: 7, baseHealth: 70 },
      { name: 'Fire Elemental', baseAttack: 15, baseDefense: 4, baseHealth: 90 }
    ];

    const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    const levelVariance = Math.max(1, quest.min_level + Math.floor(Math.random() * 3) - 1);
    
    const newEnemy: Enemy = {
      id: `enemy_${Date.now()}`,
      name: enemyType.name,
      level: levelVariance,
      health: enemyType.baseHealth + (levelVariance * 10),
      maxHealth: enemyType.baseHealth + (levelVariance * 10),
      attack: enemyType.baseAttack + (levelVariance * 2),
      defense: enemyType.baseDefense + levelVariance,
      speed: 8 + Math.floor(Math.random() * 6)
    };

    setEnemy(newEnemy);
    addBattleLog(`A wild ${newEnemy.name} (Level ${newEnemy.level}) appears!`, 'system');
  };

  const addBattleLog = (message: string, type: 'player' | 'enemy' | 'system', damage?: number) => {
    const newLog: BattleLog = {
      id: `log_${Date.now()}_${Math.random()}`,
      message,
      type,
      damage
    };
    setBattleLog(prev => [...prev, newLog]);
  };

  const calculateDamage = (attacker: any, defender: any, isSpecialAttack = false) => {
    const baseAttack = attacker.attack * (isSpecialAttack ? 1.5 : 1);
    const defense = defender.defense;
    const variance = 0.8 + Math.random() * 0.4; // 80% to 120% damage
    const damage = Math.max(1, Math.floor((baseAttack - defense * 0.5) * variance));
    return damage;
  };

  const playerAttack = async () => {
    if (!selectedCharacter || !enemy || isAnimating || !isPlayerTurn) return;

    setIsAnimating(true);
    const damage = calculateDamage(selectedCharacter, enemy);
    const newEnemyHealth = Math.max(0, enemy.health - damage);
    
    setEnemy(prev => prev ? { ...prev, health: newEnemyHealth } : null);
    addBattleLog(`${selectedCharacter.name} attacks for ${damage} damage!`, 'player', damage);

    if (newEnemyHealth <= 0) {
      setTimeout(() => {
        setBattlePhase('victory');
        handleVictory();
      }, 1000);
    } else {
      setTimeout(() => {
        setIsPlayerTurn(false);
        enemyTurn();
      }, 1000);
    }

    setIsAnimating(false);
  };

  const playerSpecialAttack = async () => {
    if (!selectedCharacter || !enemy || isAnimating || !isPlayerTurn || playerMana < 20) return;

    setIsAnimating(true);
    const damage = calculateDamage(selectedCharacter, enemy, true);
    const newEnemyHealth = Math.max(0, enemy.health - damage);
    const newMana = playerMana - 20;
    
    setEnemy(prev => prev ? { ...prev, health: newEnemyHealth } : null);
    setPlayerMana(newMana);
    addBattleLog(`${selectedCharacter.name} uses special attack for ${damage} damage!`, 'player', damage);

    if (newEnemyHealth <= 0) {
      setTimeout(() => {
        setBattlePhase('victory');
        handleVictory();
      }, 1000);
    } else {
      setTimeout(() => {
        setIsPlayerTurn(false);
        enemyTurn();
      }, 1000);
    }

    setIsAnimating(false);
  };

  const playerHeal = async () => {
    if (!selectedCharacter || isAnimating || !isPlayerTurn || playerMana < 15) return;

    setIsAnimating(true);
    const healAmount = Math.floor(selectedCharacter.max_health * 0.3);
    const newHealth = Math.min(selectedCharacter.max_health, playerHealth + healAmount);
    const newMana = playerMana - 15;
    
    setPlayerHealth(newHealth);
    setPlayerMana(newMana);
    addBattleLog(`${selectedCharacter.name} heals for ${healAmount} HP!`, 'player');

    setTimeout(() => {
      setIsPlayerTurn(false);
      enemyTurn();
    }, 1000);

    setIsAnimating(false);
  };

  const enemyTurn = () => {
    if (!enemy || !selectedCharacter) return;

    setTimeout(() => {
      const actions = ['attack', 'special'];
      const action = actions[Math.floor(Math.random() * actions.length)];
      
      if (action === 'special' && Math.random() > 0.7) {
        const damage = calculateDamage(enemy, selectedCharacter, true);
        const newPlayerHealth = Math.max(0, playerHealth - damage);
        setPlayerHealth(newPlayerHealth);
        addBattleLog(`${enemy.name} uses a powerful attack for ${damage} damage!`, 'enemy', damage);
        
        if (newPlayerHealth <= 0) {
          setBattlePhase('defeat');
        } else {
          setIsPlayerTurn(true);
        }
      } else {
        const damage = calculateDamage(enemy, selectedCharacter);
        const newPlayerHealth = Math.max(0, playerHealth - damage);
        setPlayerHealth(newPlayerHealth);
        addBattleLog(`${enemy.name} attacks for ${damage} damage!`, 'enemy', damage);
        
        if (newPlayerHealth <= 0) {
          setBattlePhase('defeat');
        } else {
          setIsPlayerTurn(true);
        }
      }
    }, 1500);
  };

  const handleVictory = async () => {
    if (!selectedCharacter || !profile || !quest) return;

    try {
      const expGained = quest.rewards.experience || 50;
      const goldGained = quest.rewards.gold || 100;
      const gemsGained = quest.rewards.gems || 0;

      // Update character
      const updatedCharacter = {
        ...selectedCharacter,
        experience: selectedCharacter.experience + expGained,
        health: playerHealth
      };

      // Check for level up
      const expForNextLevel = updatedCharacter.level * 100;
      if (updatedCharacter.experience >= expForNextLevel) {
        updatedCharacter.level += 1;
        updatedCharacter.max_health += 10;
        updatedCharacter.attack += 2;
        updatedCharacter.defense += 1;
        updatedCharacter.max_mana += 5;
        updatedCharacter.health = updatedCharacter.max_health; // Full heal on level up
        toast.success(`${updatedCharacter.name} reached level ${updatedCharacter.level}!`);
      }

      // Update profile
      const updatedProfile = {
        ...profile,
        gold: profile.gold + goldGained,
        gems: profile.gems + gemsGained,
        experience: profile.experience + expGained
      };

      // Save to database
      await supabase
        .from('characters')
        .update(updatedCharacter)
        .eq('id', selectedCharacter.id);

      await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('user_id', profile.user_id);

      // Mark quest as completed
      await supabase
        .from('character_quests')
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq('character_id', selectedCharacter.id)
        .eq('quest_id', quest.id);

      // Update store
      updateCharacter(updatedCharacter);
      setProfile(updatedProfile);

      addBattleLog(`Victory! Gained ${expGained} XP, ${goldGained} gold${gemsGained > 0 ? `, ${gemsGained} gems` : ''}!`, 'system');
    } catch (error) {
      console.error('Error updating after victory:', error);
      toast.error('Error saving progress');
    }
  };

  const handleRestart = () => {
    if (!selectedCharacter) return;
    
    setPlayerHealth(selectedCharacter.health);
    setPlayerMana(selectedCharacter.mana);
    setBattleLog([]);
    setIsPlayerTurn(true);
    setBattlePhase('intro');
    generateEnemy();
  };

  if (!selectedCharacter || !enemy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading battle...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg')] bg-cover bg-center opacity-20" />
      
      <div className="relative z-10 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onExit}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit Quest</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">{quest.title}</h1>
            <p className="text-slate-300">Battle Phase</p>
          </div>
          
          <div className="w-24" /> {/* Spacer */}
        </div>

        {/* Battle Arena */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Player Character */}
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Sword className="w-5 h-5 mr-2 text-blue-400" />
                {selectedCharacter.name}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">Health</span>
                    <span className="text-white">{playerHealth}/{selectedCharacter.max_health}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <motion.div
                      className="bg-red-500 h-3 rounded-full"
                      initial={{ width: '100%' }}
                      animate={{ width: `${(playerHealth / selectedCharacter.max_health) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">Mana</span>
                    <span className="text-white">{playerMana}/{selectedCharacter.max_mana}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <motion.div
                      className="bg-blue-500 h-3 rounded-full"
                      initial={{ width: '100%' }}
                      animate={{ width: `${(playerMana / selectedCharacter.max_mana) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm pt-2">
                  <div className="flex items-center space-x-1">
                    <Sword className="w-4 h-4 text-orange-400" />
                    <span className="text-slate-300">{selectedCharacter.attack}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300">{selectedCharacter.defense}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Battle Log */}
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-purple-400" />
                Battle Log
              </h3>
              
              <div className="h-64 overflow-y-auto space-y-2">
                <AnimatePresence>
                  {battleLog.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-2 rounded text-sm ${
                        log.type === 'player' ? 'bg-blue-500/20 text-blue-300' :
                        log.type === 'enemy' ? 'bg-red-500/20 text-red-300' :
                        'bg-purple-500/20 text-purple-300'
                      }`}
                    >
                      {log.message}
                      {log.damage && (
                        <span className="font-bold ml-2">(-{log.damage})</span>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Enemy */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-red-400" />
                {enemy.name}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">Health</span>
                    <span className="text-white">{enemy.health}/{enemy.maxHealth}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <motion.div
                      className="bg-red-500 h-3 rounded-full"
                      initial={{ width: '100%' }}
                      animate={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm pt-2">
                  <div className="flex items-center space-x-1">
                    <Sword className="w-4 h-4 text-orange-400" />
                    <span className="text-slate-300">{enemy.attack}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300">{enemy.defense}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-slate-300">Lv.{enemy.level}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Battle Actions */}
          {battlePhase === 'battle' && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-8 bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
            >
              <h3 className="text-lg font-bold text-white mb-4">
                {isPlayerTurn ? 'Your Turn' : 'Enemy Turn'}
              </h3>
              
              {isPlayerTurn && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={playerAttack}
                    disabled={isAnimating}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                  >
                    <Sword className="w-5 h-5" />
                    <span>Attack</span>
                  </button>
                  
                  <button
                    onClick={playerSpecialAttack}
                    disabled={isAnimating || playerMana < 20}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Special (20 MP)</span>
                  </button>
                  
                  <button
                    onClick={playerHeal}
                    disabled={isAnimating || playerMana < 15}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                    <span>Heal (15 MP)</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Battle Results */}
          {(battlePhase === 'victory' || battlePhase === 'defeat') && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-8 bg-slate-800/80 backdrop-blur-sm rounded-xl p-8 border border-slate-700 text-center"
            >
              {battlePhase === 'victory' ? (
                <>
                  <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-white mb-4">Victory!</h2>
                  <p className="text-slate-300 mb-6">You have completed the quest successfully!</p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={onComplete}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200"
                    >
                      Continue
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Defeat</h2>
                  <p className="text-slate-300 mb-6">Your character has fallen in battle.</p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={handleRestart}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={onExit}
                      className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                    >
                      Exit Quest
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Start Battle Button */}
          {battlePhase === 'intro' && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-8 text-center"
            >
              <button
                onClick={() => setBattlePhase('battle')}
                className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-xl font-bold rounded-lg transition-all duration-200"
              >
                Start Battle!
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};