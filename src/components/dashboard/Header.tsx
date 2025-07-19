import React from 'react';
import { motion } from 'framer-motion';
import { Sword, LogOut, User, Coins, Gem } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGameStore } from '../../store/useGameStore';

export const Header: React.FC = () => {
  const { signOut } = useAuth();
  const { profile } = useGameStore();

  return (
    <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sword className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">ChainQuest</h1>
            </div>
            
            {profile && (
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1 text-yellow-400">
                  <Coins className="w-4 h-4" />
                  <span className="font-semibold">{profile.gold.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1 text-purple-400">
                  <Gem className="w-4 h-4" />
                  <span className="font-semibold">{profile.gems.toLocaleString()}</span>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            {profile && (
              <div className="flex items-center space-x-2 text-white">
                <User className="w-5 h-5" />
                <span className="font-medium">{profile.username}</span>
                <span className="text-slate-400">•</span>
                <span className="text-sm text-slate-300">Level {profile.level}</span>
              </div>
            )}
            
            <button
              onClick={signOut}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </motion.div>
        </div>
      </div>
    </header>
  );
};