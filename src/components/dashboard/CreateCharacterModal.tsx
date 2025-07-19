import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sword, Shield, User, Zap, Sparkles } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { supabase } from '../../lib/supabase';
import { CharacterClass } from '../../types/game';
import toast from 'react-hot-toast';

interface CreateCharacterModalProps {
  onClose: () => void;
}

export const CreateCharacterModal: React.FC<CreateCharacterModalProps> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('warrior');
  const [isLoading, setIsLoading] = useState(false);
  const { profile, addCharacter } = useGameStore();

  const classes = [
    {
      name: 'warrior',
      icon: Sword,
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
      borderColor: 'border-red-400',
      description: 'Strong melee fighter with high health and attack',
      stats: { health: 120, attack: 15, defense: 8, speed: 8, mana: 30 }
    },
    {
      name: 'mage',
      icon: Zap,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      borderColor: 'border-blue-400',
      description: 'Magical spellcaster with high mana and magical damage',
      stats: { health: 80, attack: 12, defense: 4, speed: 12, mana: 80 }
    },
    {
      name: 'rogue',
      icon: User,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      borderColor: 'border-green-400',
      description: 'Agile assassin with high speed and critical strikes',
      stats: { health: 90, attack: 13, defense: 6, speed: 16, mana: 40 }
    },
    {
      name: 'paladin',
      icon: Shield,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400',
      description: 'Holy warrior with balanced stats and healing abilities',
      stats: { health: 100, attack: 10, defense: 12, speed: 10, mana: 60 }
    }
  ];

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Please enter a character name');
      return;
    }

    if (!profile) {
      toast.error('Profile not found');
      return;
    }

    setIsLoading(true);
    try {
      const selectedClassData = classes.find(c => c.name === selectedClass);
      if (!selectedClassData) {
        toast.error('Invalid class selected');
        return;
      }

      const characterData = {
        user_id: profile.user_id,
        name: name.trim(),
        class: selectedClass,
        level: 1,
        health: selectedClassData.stats.health,
        max_health: selectedClassData.stats.health,
        attack: selectedClassData.stats.attack,
        defense: selectedClassData.stats.defense,
        speed: selectedClassData.stats.speed,
        mana: selectedClassData.stats.mana,
        max_mana: selectedClassData.stats.mana,
        experience: 0,
        is_nft: false,
        nft_token_id: null
      };

      const { data, error } = await supabase
        .from('characters')
        .insert([characterData])
        .select()
        .single();

      if (error) {
        console.error('Error creating character:', error);
        if (error.code === 'PGRST301') {
          toast.error('Database not ready. Please refresh the page.');
        } else {
          toast.error('Failed to create character');
        }
        return;
      }

      addCharacter(data);
      toast.success(`${name} the ${selectedClass} has been created!`);
      onClose();
    } catch (error) {
      console.error('Error creating character:', error);
      toast.error('Failed to create character');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-purple-400" />
            Create New Character
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Character Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Character Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
              placeholder="Enter character name"
              maxLength={20}
            />
          </div>

          {/* Class Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-4">
              Choose Class
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classes.map((characterClass) => {
                const Icon = characterClass.icon;
                const isSelected = selectedClass === characterClass.name;
                
                return (
                  <motion.div
                    key={characterClass.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedClass(characterClass.name as CharacterClass)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? `${characterClass.borderColor} ${characterClass.bgColor}` 
                        : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-full ${characterClass.bgColor}`}>
                        <Icon className={`w-6 h-6 ${characterClass.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white capitalize">{characterClass.name}</h3>
                        <p className="text-sm text-slate-400">{characterClass.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Health:</span>
                        <span className="text-white">{characterClass.stats.health}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Attack:</span>
                        <span className="text-white">{characterClass.stats.attack}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Defense:</span>
                        <span className="text-white">{characterClass.stats.defense}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Speed:</span>
                        <span className="text-white">{characterClass.stats.speed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Mana:</span>
                        <span className="text-white">{characterClass.stats.mana}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={isLoading || !name.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Creating...
                </div>
              ) : (
                'Create Character'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};