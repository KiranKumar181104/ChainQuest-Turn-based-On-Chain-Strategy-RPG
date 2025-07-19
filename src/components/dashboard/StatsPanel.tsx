import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Sword, Shield, Zap, Heart } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

export const StatsPanel: React.FC = () => {
  const { profile, characters, battles } = useGameStore();

  const wins = battles.filter(b => b.winner_id === profile?.id).length;
  const totalBattles = battles.length;
  const winRate = totalBattles > 0 ? Math.round((wins / totalBattles) * 100) : 0;

  const stats = [
    { label: 'Characters', value: characters.length, icon: Sword, color: 'text-blue-400' },
    { label: 'Battles Won', value: wins, icon: Trophy, color: 'text-yellow-400' },
    { label: 'Win Rate', value: `${winRate}%`, icon: Shield, color: 'text-green-400' },
    { label: 'Total Battles', value: totalBattles, icon: Zap, color: 'text-purple-400' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-full bg-slate-700/50 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};