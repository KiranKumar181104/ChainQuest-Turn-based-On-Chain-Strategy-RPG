/*
# ChainQuest Game Database Schema

This migration creates the complete database schema for ChainQuest, a turn-based on-chain strategy RPG.

## Tables Created:
1. **profiles** - User profiles with game stats (gold, gems, level, experience)
2. **characters** - Player characters with different classes and stats
3. **items** - Game items with different rarities and bonuses
4. **character_items** - Junction table for character inventory
5. **battles** - Battle records and history
6. **quests** - Available quests with objectives and rewards
7. **character_quests** - Character quest progress tracking
8. **leaderboards** - Player rankings and scores

## Security:
- Row Level Security (RLS) enabled on all tables
- Policies for authenticated users to access their own data
- Public read access for items and quests
- Automatic profile creation trigger for new users

## Sample Data:
- Starter items with different rarities
- Initial quests for new players
- Balanced game economy setup
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (main user data)
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  level integer DEFAULT 1,
  experience integer DEFAULT 0,
  gold integer DEFAULT 1000,
  gems integer DEFAULT 50,
  wallet_address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Characters table
CREATE TABLE IF NOT EXISTS public.characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  name text NOT NULL,
  class text NOT NULL CHECK (class IN ('warrior', 'mage', 'rogue', 'paladin')),
  level integer DEFAULT 1,
  health integer DEFAULT 100,
  max_health integer DEFAULT 100,
  attack integer DEFAULT 10,
  defense integer DEFAULT 5,
  speed integer DEFAULT 10,
  mana integer DEFAULT 50,
  max_mana integer DEFAULT 50,
  experience integer DEFAULT 0,
  is_nft boolean DEFAULT false,
  nft_token_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Items table
CREATE TABLE IF NOT EXISTS public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('weapon', 'armor', 'consumable', 'accessory')),
  rarity text DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  attack_bonus integer DEFAULT 0,
  defense_bonus integer DEFAULT 0,
  health_bonus integer DEFAULT 0,
  mana_bonus integer DEFAULT 0,
  speed_bonus integer DEFAULT 0,
  price integer DEFAULT 0,
  is_nft boolean DEFAULT false,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Character items (inventory)
CREATE TABLE IF NOT EXISTS public.character_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id uuid REFERENCES public.characters(id) ON DELETE CASCADE,
  item_id uuid REFERENCES public.items(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  is_equipped boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(character_id, item_id)
);

-- Battles table
CREATE TABLE IF NOT EXISTS public.battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  player2_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  player1_character_id uuid REFERENCES public.characters(id),
  player2_character_id uuid REFERENCES public.characters(id),
  winner_id uuid REFERENCES public.profiles(user_id),
  battle_log jsonb,
  rewards jsonb,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Quests table
CREATE TABLE IF NOT EXISTS public.quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  objectives jsonb NOT NULL,
  rewards jsonb NOT NULL,
  difficulty text DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  min_level integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Character quests (progress tracking)
CREATE TABLE IF NOT EXISTS public.character_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id uuid REFERENCES public.characters(id) ON DELETE CASCADE,
  quest_id uuid REFERENCES public.quests(id) ON DELETE CASCADE,
  progress jsonb DEFAULT '{}',
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(character_id, quest_id)
);

-- Leaderboards table
CREATE TABLE IF NOT EXISTS public.leaderboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  character_id uuid REFERENCES public.characters(id) ON DELETE CASCADE,
  category text NOT NULL,
  score integer NOT NULL,
  rank integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own characters" ON public.characters;
DROP POLICY IF EXISTS "Users can manage own characters" ON public.characters;
DROP POLICY IF EXISTS "Anyone can read items" ON public.items;
DROP POLICY IF EXISTS "Users can read own character items" ON public.character_items;
DROP POLICY IF EXISTS "Users can manage own character items" ON public.character_items;
DROP POLICY IF EXISTS "Users can read own battles" ON public.battles;
DROP POLICY IF EXISTS "Users can create battles" ON public.battles;
DROP POLICY IF EXISTS "Anyone can read quests" ON public.quests;
DROP POLICY IF EXISTS "Users can read own quest progress" ON public.character_quests;
DROP POLICY IF EXISTS "Users can manage own quest progress" ON public.character_quests;
DROP POLICY IF EXISTS "Anyone can read leaderboards" ON public.leaderboards;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Characters policies
CREATE POLICY "Users can read own characters"
  ON public.characters FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own characters"
  ON public.characters FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Items policies (public read access for shop)
CREATE POLICY "Anyone can read items"
  ON public.items FOR SELECT
  TO authenticated
  USING (true);

-- Character items policies
CREATE POLICY "Users can read own character items"
  ON public.character_items FOR SELECT
  TO authenticated
  USING (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own character items"
  ON public.character_items FOR ALL
  TO authenticated
  USING (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()));

-- Battles policies
CREATE POLICY "Users can read own battles"
  ON public.battles FOR SELECT
  TO authenticated
  USING (player1_id = auth.uid() OR player2_id = auth.uid());

CREATE POLICY "Users can create battles"
  ON public.battles FOR INSERT
  TO authenticated
  WITH CHECK (player1_id = auth.uid());

-- Quests policies (public read access)
CREATE POLICY "Anyone can read quests"
  ON public.quests FOR SELECT
  TO authenticated
  USING (true);

-- Character quests policies
CREATE POLICY "Users can read own quest progress"
  ON public.character_quests FOR SELECT
  TO authenticated
  USING (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own quest progress"
  ON public.character_quests FOR ALL
  TO authenticated
  USING (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()));

-- Leaderboards policies (public read access)
CREATE POLICY "Anyone can read leaderboards"
  ON public.leaderboards FOR SELECT
  TO authenticated
  USING (true);

-- Function to automatically create profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, level, experience, gold, gems)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    1,
    0,
    1000,
    50
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.characters;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.characters
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Insert sample items
INSERT INTO public.items (name, description, type, rarity, attack_bonus, defense_bonus, health_bonus, price, image_url) VALUES
('Iron Sword', 'A basic iron sword for beginners', 'weapon', 'common', 5, 0, 0, 100, 'https://images.pexels.com/photos/6472842/pexels-photo-6472842.jpeg'),
('Steel Shield', 'A sturdy steel shield', 'armor', 'common', 0, 8, 10, 150, 'https://images.pexels.com/photos/6472842/pexels-photo-6472842.jpeg'),
('Health Potion', 'Restores 50 health points', 'consumable', 'common', 0, 0, 50, 25, 'https://images.pexels.com/photos/6472842/pexels-photo-6472842.jpeg'),
('Mana Potion', 'Restores 30 mana points', 'consumable', 'common', 0, 0, 0, 30, 'https://images.pexels.com/photos/6472842/pexels-photo-6472842.jpeg'),
('Silver Sword', 'A well-crafted silver blade', 'weapon', 'uncommon', 8, 2, 5, 300, 'https://images.pexels.com/photos/6472842/pexels-photo-6472842.jpeg'),
('Chainmail Armor', 'Flexible protection for warriors', 'armor', 'uncommon', 0, 12, 20, 400, 'https://images.pexels.com/photos/6472842/pexels-photo-6472842.jpeg'),
('Magic Ring', 'Increases magical power', 'accessory', 'rare', 3, 3, 0, 800, 'https://images.pexels.com/photos/6472842/pexels-photo-6472842.jpeg'),
('Dragon Sword', 'A legendary sword forged by dragons', 'weapon', 'legendary', 25, 5, 20, 2000, 'https://images.pexels.com/photos/6472842/pexels-photo-6472842.jpeg'),
('Phoenix Armor', 'Armor blessed by the phoenix', 'armor', 'epic', 5, 20, 50, 1500, 'https://images.pexels.com/photos/6472842/pexels-photo-6472842.jpeg'),
('Speed Boots', 'Boots that increase movement speed', 'accessory', 'rare', 0, 0, 0, 600, 'https://images.pexels.com/photos/6472842/pexels-photo-6472842.jpeg')
ON CONFLICT DO NOTHING;

-- Insert sample quests
INSERT INTO public.quests (title, description, objectives, rewards, difficulty, min_level) VALUES
('First Steps', 'Complete your first battle to prove your worth', '{"battles_won": 1}', '{"gold": 100, "experience": 50}', 'easy', 1),
('Collector', 'Gather 5 different items for your inventory', '{"items_collected": 5}', '{"gold": 250, "gems": 10}', 'easy', 1),
('Warrior''s Path', 'Win 10 battles to become a seasoned warrior', '{"battles_won": 10}', '{"gold": 500, "experience": 200}', 'medium', 3),
('Legendary Hunter', 'Defeat 3 legendary opponents', '{"legendary_defeats": 3}', '{"gold": 1000, "gems": 50}', 'hard', 10),
('Item Master', 'Collect one item of each rarity', '{"rare_items": 1, "epic_items": 1, "legendary_items": 1}', '{"gold": 2000, "gems": 100}', 'hard', 15),
('Speed Demon', 'Win 5 battles in under 3 turns each', '{"quick_victories": 5}', '{"gold": 750, "experience": 300}', 'medium', 5)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON public.characters(user_id);
CREATE INDEX IF NOT EXISTS idx_character_items_character_id ON public.character_items(character_id);
CREATE INDEX IF NOT EXISTS idx_battles_player1_id ON public.battles(player1_id);
CREATE INDEX IF NOT EXISTS idx_battles_player2_id ON public.battles(player2_id);
CREATE INDEX IF NOT EXISTS idx_character_quests_character_id ON public.character_quests(character_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_category ON public.leaderboards(category);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);