import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Sword, Shield, Zap, Heart, Star, Coins } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

// Enhanced type definitions
interface GameItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'consumable' | 'misc';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  description?: string;
  price: number;
  attack_bonus: number;
  defense_bonus: number;
  health_bonus: number;
  mana_bonus: number;
  speed_bonus: number;
  is_nft: boolean;
  image_url?: string;
}

interface InventoryItem {
  id: string;
  item_id: string;
  profile_id: string;
  character_id: string | null;
  quantity: number;
  created_at: string;
}

export const InventoryPanel: React.FC = () => {
  const { 
    items, 
    selectedCharacter, 
    profile, 
    updateProfile, 
    addItemToInventory,
    gold =1000
  } = useGameStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  // Memoized icon getter
  const getItemIcon = (type: GameItem['type']) => {
    const iconMap = {
      weapon: Sword,
      armor: Shield,
      consumable: Heart,
      misc: Package
    };
    return iconMap[type] || Package;
  };

  // Memoized rarity styling
  const getRarityColor = (rarity: GameItem['rarity']) => {
    const colorMap = {
      common: 'border-slate-400 bg-slate-400/10',
      uncommon: 'border-green-400 bg-green-400/10',
      rare: 'border-blue-400 bg-blue-400/10',
      epic: 'border-purple-400 bg-purple-400/10',
      legendary: 'border-yellow-400 bg-yellow-400/10'
    };
    return colorMap[rarity] || 'border-slate-400 bg-slate-400/10';
  };

  const handleBuyItem = async (item: GameItem) => {
    if (!profile || !selectedCharacter) {
      toast.error('No character selected or profile loaded');
      return;
    }

    if (gold < item.price) {
      toast.error(`You need ${item.price - gold} more gold to buy this item`);
      return;
    }

    setLoading(item.id);
    setPurchaseError(null);

    try {
      const { data, error } = await supabase.rpc('purchase_item', {
        p_profile_id: profile.id,
        p_item_id: item.id,
        p_price: item.price,
        p_character_id: selectedCharacter.id
      });

      if (error) {
        throw new Error(error.message);
      }

      // Optimistic UI updates
      updateProfile({ gold: gold - item.price });
      
      const newInventoryItem: InventoryItem = {
        id: `${item.id}-${Date.now()}`,
        item_id: item.id,
        profile_id: profile.id,
        character_id: selectedCharacter.id,
        quantity: 1,
        created_at: new Date().toISOString()
      };

      addItemToInventory(newInventoryItem);

      toast.success(
        <div className="flex items-center">
          <ItemIcon className="w-5 h-5 mr-2" />
          <span>Successfully purchased {item.name}!</span>
        </div>,
        { duration: 3000 }
      );

    } catch (error: any) {
      console.error('Purchase error:', error);
      setPurchaseError(error.message);
      toast.error(
        `Failed to purchase ${item.name}: ${error.message}`,
        { duration: 5000 }
      );
    } finally {
      setLoading(null);
    }
  };

  // Render helper for item stats
  const renderItemStats = (item: GameItem) => {
    const stats = [
      { key: 'attack', value: item.attack_bonus, icon: Sword, color: 'text-red-400' },
      { key: 'defense', value: item.defense_bonus, icon: Shield, color: 'text-green-400' },
      { key: 'health', value: item.health_bonus, icon: Heart, color: 'text-red-400' },
      { key: 'mana', value: item.mana_bonus, icon: Zap, color: 'text-blue-400' },
      { key: 'speed', value: item.speed_bonus, icon: Star, color: 'text-yellow-400' }
    ];

    return (
      <div className="grid grid-cols-2 gap-2 text-sm">
        {stats.map((stat) => (
          stat.value > 0 && (
            <div key={stat.key} className="flex items-center space-x-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-slate-300">
                +{stat.value} {stat.key.toUpperCase()}
              </span>
            </div>
          )
        ))}
      </div>
    );
  };

  return (
    <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Package className="w-5 h-5 mr-2 text-purple-400" />
          Item Shop
        </h2>
        <div className="flex items-center text-yellow-400">
          <Coins className="w-5 h-5 mr-1" />
          <span className="font-bold">{(gold||0).toLocaleString()}</span>
        </div>
      </div>

      {purchaseError && (
        <div className="mb-4 p-3 bg-red-900/50 text-red-200 rounded-lg text-sm">
          {purchaseError}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No items available</p>
          <p className="text-sm mt-2">Check back later for new items!</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
          {items.map((item) => {
            const ItemIcon = getItemIcon(item.type);
            const rarityClasses = getRarityColor(item.rarity);
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-lg border ${rarityClasses} hover:border-opacity-80 transition-all duration-200`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-600"
                      />
                    ) : (
                      <div className="p-2 bg-slate-700 rounded-full">
                        <ItemIcon className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-white">{item.name}</h3>
                      <p className="text-sm text-slate-400 capitalize">{item.type}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${rarityClasses}`}>
                        {item.rarity}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center justify-end space-x-1 text-yellow-400 mb-2">
                      <span className="font-medium">{item.price.toLocaleString()}</span>
                      <Coins className="w-4 h-4" />
                    </div>
                    <button
                      onClick={() => handleBuyItem(item)}
                      disabled={loading === item.id || !selectedCharacter || gold < item.price}
                      className={`px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm rounded-lg transition-all duration-200 ${
                        (loading === item.id || !selectedCharacter || gold < item.price) 
                          ? 'opacity-50 cursor-not-allowed' 
                          : ''
                      }`}
                    >
                      {loading === item.id ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        'Buy'
                      )}
                    </button>
                  </div>
                </div>

                {item.description && (
                  <p className="text-sm text-slate-300 mb-3">{item.description}</p>
                )}

                {renderItemStats(item)}

                {item.is_nft && (
                  <div className="mt-3 flex items-center justify-center">
                    <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold rounded-full">
                      NFT ITEM
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