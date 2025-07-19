import React from 'react';
import { motion } from 'framer-motion';
import { Database, RefreshCw } from 'lucide-react';

export const DatabaseSetupNotice: React.FC = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/7078705/pexels-photo-7078705.jpeg')] bg-cover bg-center opacity-10" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-slate-700">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4"
            >
              <Database className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Database Setup Required</h1>
            <p className="text-slate-400">
              The database is not set up yet. Please:
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                1
              </div>
              <p className="text-slate-300">Click "Connect to Supabase" in the top right to set up your database connection</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                2
              </div>
              <p className="text-slate-300">Configure your Supabase URL and API key, then run the database migration</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                3
              </div>
              <p className="text-slate-300">Refresh this page</p>
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
            <p className="text-slate-300 text-sm">
              You need to set up your Supabase project with the correct URL and API key. This will create all necessary tables, security policies, and sample data for ChainQuest.
            </p>
          </div>

          {/* Refresh Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRefresh}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200"
          >
            <div className="flex items-center justify-center">
              <RefreshCw className="w-5 h-5 mr-2" />
              Refresh Page
            </div>
          </motion.button>

          <div className="mt-4 text-center">
            <p className="text-slate-400 text-sm">
              After connecting to Supabase, refresh this page to continue.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};