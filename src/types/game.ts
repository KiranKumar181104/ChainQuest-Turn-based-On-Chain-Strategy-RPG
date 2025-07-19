export type CharacterClass = 'warrior' | 'mage' | 'rogue' | 'paladin';

export interface Character {
  id: string;
  profile_id: string;
  name: string;
  class: CharacterClass;
  level: number;
  health: number;
  max_health: number;
  attack: number;
  defense: number;
  speed: number;
  mana: number;
  max_mana: number;
  experience: number;
  is_nft: boolean;
  nft_token_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  level: number;
  experience: number;
  gold: number;
  gems: number;
  wallet_address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  name: string;
  description: string | null;
  type: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  attack_bonus: number;
  defense_bonus: number;
  health_bonus: number;
  mana_bonus: number;
  speed_bonus: number;
  price: number;
  is_nft: boolean;
  image_url: string | null;
  created_at: string;
}

export interface Battle {
  id: string;
  player1_id: string;
  player2_id: string;
  player1_character_id: string;
  player2_character_id: string;
  winner_id: string | null;
  battle_log: any;
  rewards: any;
  created_at: string;
  completed_at: string | null;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: Record<string, any>;
  rewards: Record<string, any>;
  difficulty: 'easy' | 'medium' | 'hard';
  min_level: number;
  is_active: boolean;
  created_at: string;
}