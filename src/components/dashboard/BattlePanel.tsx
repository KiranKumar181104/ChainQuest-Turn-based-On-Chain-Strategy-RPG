import React from 'react';
import { motion } from 'framer-motion';
import { Swords, Trophy, Clock, User, Crown, Zap } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

interface BattlePanelProps {
  onQuickBattle: () => void;
}

export const BattlePanel: React.FC<BattlePanelProps> = ({ onQuickBattle }) => {
  const { battles, selectedCharacter, profile } = useGameStore();

  const handleQuickBattle = () => {
    if (!selectedCharacter) return;
    onQuickBattle();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBattleResult = (battle: any) => {
    if (!battle.winner_id) return 'Draw';
    return battle.winner_id === profile?.id ? 'Victory' : 'Defeat';
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Victory': return 'text-green-400';
      case 'Defeat': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Swords className="w-5 h-5 mr-2 text-purple-400" />
          Battle Arena
        </h2>
        <button
          onClick={handleQuickBattle}
          disabled={!selectedCharacter}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            selectedCharacter
              ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white'
              : 'bg-slate-600 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Quick Battle</span>
        </button>
      </div>

      {!selectedCharacter ? (
        <div className="text-center py-8 text-slate-400">
          <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select a character to battle</p>
          <p className="text-sm mt-2">Choose from your characters above</p>
        </div>
      ) : battles.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Swords className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No battles fought yet</p>
          <p className="text-sm mt-2">Start your first battle to see history here!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Battles</h3>
          {battles.map((battle) => {
            const result = getBattleResult(battle);
            const resultColor = getResultColor(result);
            
            return (
              <motion.div
                key={battle.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${result === 'Victory' ? 'bg-green-400/20' : result === 'Defeat' ? 'bg-red-400/20' : 'bg-slate-400/20'}`}>
                      {result === 'Victory' ? (
                        <Crown className="w-5 h-5 text-green-400" />
                      ) : (
                        <Swords className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${resultColor}`}>{result}</p>
                      <p className="text-sm text-slate-400">
                        {battle.completed_at ? formatDate(battle.completed_at) : 'In Progress'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-300">
                        {formatDate(battle.created_at)}
                      </span>
                    </div>
                    {battle.rewards && (
                      <div className="flex items-center space-x-2 mt-1">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-yellow-400">
                          +{battle.rewards.gold || 0} gold
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};