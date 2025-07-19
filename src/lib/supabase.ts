import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          avatar_url?: string | null;
          level?: number;
          experience?: number;
          gold?: number;
          gems?: number;
          wallet_address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string;
          avatar_url?: string | null;
          level?: number;
          experience?: number;
          gold?: number;
          gems?: number;
          wallet_address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      characters: {
        Row: {
          id: string;
          profile_id: string;
          name: string;
          class: string;
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
        };
        Insert: {
          id?: string;
          profile_id: string;
          name: string;
          class: string;
          level?: number;
          health?: number;
          max_health?: number;
          attack?: number;
          defense?: number;
          speed?: number;
          mana?: number;
          max_mana?: number;
          experience?: number;
          is_nft?: boolean;
          nft_token_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          name?: string;
          class?: string;
          level?: number;
          health?: number;
          max_health?: number;
          attack?: number;
          defense?: number;
          speed?: number;
          mana?: number;
          max_mana?: number;
          experience?: number;
          is_nft?: boolean;
          nft_token_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      items: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          type: string;
          rarity: string;
          attack_bonus: number;
          defense_bonus: number;
          health_bonus: number;
          mana_bonus: number;
          speed_bonus: number;
          price: number;
          is_nft: boolean;
          image_url: string | null;
          created_at: string;
        };
      };
    };
  };
};