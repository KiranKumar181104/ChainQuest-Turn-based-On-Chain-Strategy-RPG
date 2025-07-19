import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Sword, Shield, Heart, Zap, User } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { Character } from '../../types/game';

interface CharacterPanelProps {
  onCreateCharacter: () => void;
}

export const CharacterPanel: React.FC<CharacterPanelProps> = ({ onCreateCharacter }) => {
  const { characters, selectedCharacter, setSelectedCharacter } = useGameStore();

  const getRarityColor = (level: number) => {
    if (level >= 20) return 'border-yellow-400 bg-yellow-400/10';
    if (level >= 15) return 'border-purple-400 bg-purple-400/10';
    if (level >= 10) return 'border-blue-400 bg-blue-400/10';
    if (level >= 5) return 'border-green-400 bg-green-400/10';
    return 'border-slate-400 bg-slate-400/10';
  };

  const getClassIcon = (characterClass: string) => {
    switch (characterClass) {
      case 'warrior': return Sword;
      case 'mage': return Zap;
      case 'rogue': return User;
      case 'paladin': return Shield;
      default: return Sword;
    }
  };

  const getClassColor = (characterClass: string) => {
    switch (characterClass) {
      case 'warrior': return 'text-red-400';
      case 'mage': return 'text-blue-400';
      case 'rogue': return 'text-green-400';
      case 'paladin': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Sword className="w-5 h-5 mr-2 text-purple-400" />
          Your Characters
        </h2>
        <button
          onClick={onCreateCharacter}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Create Character</span>
        </button>
      </div>

      {characters.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No characters created yet</p>
          <p className="text-sm mt-2">Create your first character to start your adventure!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {characters.map((character) => {
            const ClassIcon = getClassIcon(character.class);
            const isSelected = selectedCharacter?.id === character.id;
            
            return (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCharacter(character)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : `${getRarityColor(character.level)} hover:border-slate-500`
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full bg-slate-700 ${getClassColor(character.class)}`}>
                      <ClassIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{character.name}</h3>
                      <p className="text-sm text-slate-400 capitalize">{character.class}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">Level {character.level}</p>
                    <p className="text-xs text-slate-400">{character.experience} XP</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="text-slate-300">{character.health}/{character.max_health}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300">{character.mana}/{character.max_mana}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sword className="w-4 h-4 text-orange-400" />
                    <span className="text-slate-300">{character.attack}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300">{character.defense}</span>
                  </div>
                </div>

                {character.is_nft && (
                  <div className="mt-3 flex items-center justify-center">
                    <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold rounded-full">
                      NFT
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};