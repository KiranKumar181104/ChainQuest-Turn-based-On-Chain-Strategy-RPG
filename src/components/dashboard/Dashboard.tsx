import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useGameStore } from '../../store/useGameStore';
import { supabase } from '../../lib/supabase';
import { Header } from './Header';
import { StatsPanel } from './StatsPanel';
import { CharacterPanel } from './CharacterPanel';
import { QuestPanel } from './QuestPanel';
import { BattlePanel } from './BattlePanel';
import { InventoryPanel } from './InventoryPanel';
import { CreateCharacterModal } from './CreateCharacterModal';
import { QuestBattle } from '../game/QuestBattle';
import { useState } from 'react';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { 
    characters, 
    selectedCharacter, 
    items, 
    quests, 
    battles,
    setCharacters, 
    setItems, 
    setQuests, 
    setBattles,
    setSelectedCharacter,
    setIsLoading 
  } = useGameStore();
  
  const [showCreateCharacter, setShowCreateCharacter] = useState(false);
  const [activeQuest, setActiveQuest] = useState<any>(null);

  useEffect(() => {
    if (profile) {
      fetchGameData();
    }
  }, [profile]);

  const fetchGameData = async () => {
    try {
      setIsLoading(true);
      
      if (!supabase) {
        console.warn('Supabase not configured');
        return;
      }

      try {
        // Fetch characters
        const { data: charactersData, error: charactersError } = await supabase
          .from('characters')
          .select('*')
          .eq('user_id', profile!.user_id);

        if (charactersError) {
          console.error('Error fetching characters:', charactersError);
        } else {
          setCharacters(charactersData || []);
          if (charactersData && charactersData.length > 0 && !selectedCharacter) {
            setSelectedCharacter(charactersData[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching characters:', error);
        setCharacters([]);
      }

      try {
        // Fetch items
        const { data: itemsData, error: itemsError } = await supabase
          .from('items')
          .select('*');

        if (!itemsError) {
          setItems(itemsData || []);
        }
      } catch (error) {
        console.warn('Items table not ready:', error);
        setItems([]);
      }

      try {
        // Fetch quests
        const { data: questsData, error: questsError } = await supabase
          .from('quests')
          .select('*')
          .eq('is_active', true);

        if (!questsError) {
          setQuests(questsData || []);
        }
      } catch (error) {
        console.warn('Quests table not ready:', error);
        setQuests([]);
      }

      try {
        // Fetch battles
        const { data: battlesData, error: battlesError } = await supabase
          .from('battles')
          .select('*')
          .or(`player1_id.eq.${profile!.user_id},player2_id.eq.${profile!.user_id}`)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!battlesError) {
          setBattles(battlesData || []);
        }
      } catch (error) {
        console.warn('Battles table not ready:', error);
        setBattles([]);
      }

    } catch (error) {
      console.warn('Database not ready:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuest = (quest: any) => {
    setActiveQuest(quest);
  };

  const handleQuestComplete = () => {
    setActiveQuest(null);
    fetchGameData(); // Refresh data after quest completion
    toast.success('Quest completed successfully!');
  };

  const handleQuestExit = () => {
    setActiveQuest(null);
  };

  if (!user || !profile) {
    return null;
  }

  // Show quest battle if active quest
  if (activeQuest) {
    return (
      <QuestBattle
        quest={activeQuest}
        onComplete={handleQuestComplete}
        onExit={handleQuestExit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/7078705/pexels-photo-7078705.jpeg')] bg-cover bg-center opacity-5" />
      
      <div className="relative z-10">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <StatsPanel />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2 space-y-8"
            >
              <CharacterPanel onCreateCharacter={() => setShowCreateCharacter(true)} />
              <QuestPanel onStartQuest={handleStartQuest} />
              <BattlePanel />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-8"
            >
              <InventoryPanel />
            </motion.div>
          </div>
        </div>
      </div>

      {showCreateCharacter && (
        <CreateCharacterModal onClose={() => setShowCreateCharacter(false)} />
      )}
    </div>
  );
};