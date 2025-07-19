import React from 'react';
import { motion } from 'framer-motion';
import { Sword } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/7078705/pexels-photo-7078705.jpeg')] bg-cover bg-center opacity-10" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4"
        >
          <Sword className="w-8 h-8 text-white" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-white mb-2">ChainQuest</h2>
        <p className="text-slate-400">Loading your adventure...</p>
        
        <div className="mt-4 flex justify-center">
          <div className="w-48 h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};