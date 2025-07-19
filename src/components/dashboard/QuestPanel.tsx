import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Trophy, Star, Coins, Gem, Play } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface QuestPanelProps {
  onStartQuest: (quest: any) => void;
}

export const QuestPanel: React.FC<QuestPanelProps> = ({ onStartQuest }) => {
  const { quests, selectedCharacter, profile } = useGameStore();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'hard': return 'text-red-400 bg-red-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const canAcceptQuest = (quest: any) => {
    return selectedCharacter && selectedCharacter.level >= quest.min_level;
  };

  const handleAcceptQuest = async (quest: any) => {
    if (!canAcceptQuest(quest)) {
      toast.error(`Character must be level ${quest.min_level} or higher`);
      return;
    }

    if (!selectedCharacter || !profile) {
      toast.error('Please select a character first');
      return;
    }

    try {
      // Check if quest is already accepted
      const { data: existingQuest } = await supabase
        .from('character_quests')
        .select('*')
        .eq('character_id', selectedCharacter.id)
        .eq('quest_id', quest.id)
        .single();

      if (existingQuest) {
        if (existingQuest.completed) {
          toast.error('Quest already completed');
          return;
        } else {
          // Quest already accepted, start it
          onStartQuest(quest);
          return;
        }
      }

      // Accept the quest
      const { error } = await supabase
        .from('character_quests')
        .insert([{
          character_id: selectedCharacter.id,
          quest_id: quest.id,
          progress: {},
          completed: false
        }]);

      if (error) {
        console.error('Error accepting quest:', error);
        toast.error('Failed to accept quest');
        return;
      }

      toast.success(`Quest "${quest.title}" accepted!`);
      onStartQuest(quest);
    } catch (error) {
      console.error('Error accepting quest:', error);
      toast.error('Failed to accept quest');
    }
  };

  return (
    <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
      <h2 className="text-xl font-bold text-white flex items-center mb-6">
        <MapPin className="w-5 h-5 mr-2 text-purple-400" />
        Available Quests
      </h2>

      {!selectedCharacter ? (
        <div className="text-center py-8 text-slate-400">
          <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select a character to view quests</p>
          <p className="text-sm mt-2">Choose from your characters above</p>
        </div>
      ) : quests.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No quests available</p>
          <p className="text-sm mt-2">Check back later for new adventures!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quests.map((quest) => (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-white">{quest.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quest.difficulty)}`}>
                      {quest.difficulty}
                    </span>
                    <div className="flex items-center space-x-1 text-slate-400">
                      <Star className="w-4 h-4" />
                      <span className="text-sm">Level {quest.min_level}+</span>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm mb-3">{quest.description}</p>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-yellow-400">
                      <Coins className="w-4 h-4" />
                      <span className="text-sm font-medium">{quest.rewards.gold || 0}</span>
                    </div>
                    {quest.rewards.gems && (
                      <div className="flex items-center space-x-1 text-purple-400">
                        <Gem className="w-4 h-4" />
                        <span className="text-sm font-medium">{quest.rewards.gems}</span>
                      </div>
                    )}
                    {quest.rewards.experience && (
                      <div className="flex items-center space-x-1 text-blue-400">
                        <Trophy className="w-4 h-4" />
                        <span className="text-sm font-medium">{quest.rewards.experience} XP</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => handleAcceptQuest(quest)}
                  disabled={!canAcceptQuest(quest)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    canAcceptQuest(quest)
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                      : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  <span>{canAcceptQuest(quest) ? 'Start Quest' : 'Locked'}</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};