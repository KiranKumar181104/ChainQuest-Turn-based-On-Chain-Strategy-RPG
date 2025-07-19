  -- Correct Profiles Table
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

  -- Correct Characters Table
  CREATE TABLE IF NOT EXISTS public.characters (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    name text NOT NULL,
    class text NOT NULL,
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

  CREATE TABLE IF NOT EXISTS items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    type text NOT NULL, -- weapon, armor, consumable, etc.
    rarity text DEFAULT 'common', -- common, uncommon, rare, epic, legendary
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

  CREATE TABLE IF NOT EXISTS character_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id uuid REFERENCES characters(id) ON DELETE CASCADE,
    item_id uuid REFERENCES items(id) ON DELETE CASCADE,
    quantity integer DEFAULT 1,
    is_equipped boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    UNIQUE(character_id, item_id)
  );

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

  CREATE TABLE IF NOT EXISTS quests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text NOT NULL,
    objectives jsonb NOT NULL,
    rewards jsonb NOT NULL,
    difficulty text DEFAULT 'easy',
    min_level integer DEFAULT 1,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS character_quests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id uuid REFERENCES characters(id) ON DELETE CASCADE,
    quest_id uuid REFERENCES quests(id) ON DELETE CASCADE,
    progress jsonb DEFAULT '{}',
    completed boolean DEFAULT false,
    completed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    UNIQUE(character_id, quest_id)
  );

  CREATE TABLE IF NOT EXISTS public.leaderboards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE,  -- Changed to reference user_id
    character_id uuid REFERENCES public.characters(id) ON DELETE CASCADE,
    category text NOT NULL, -- level, battles_won, gold_earned, etc.
    score integer NOT NULL,
    rank integer,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
  ALTER TABLE items ENABLE ROW LEVEL SECURITY;
  ALTER TABLE character_items ENABLE ROW LEVEL SECURITY;
  ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
  ALTER TABLE character_quests ENABLE ROW LEVEL SECURITY;
  ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;


  -- First drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

  -- Then create new policies
  CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

  CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

  CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

  -- Corrected character policies (using user_id instead of profile_id)
  DROP POLICY IF EXISTS "Users can read own characters" ON public.characters;
  DROP POLICY IF EXISTS "Users can manage own characters" ON public.
  characters;
  DROP policy if exists "Anyone can read items" on public.items;
  CREATE POLICY "Users can read own characters"
    ON public.characters FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

  CREATE POLICY "Users can manage own characters"
    ON public.characters FOR ALL
    TO authenticated
    USING (user_id = auth.uid());

  -- Items policy (unchanged as it was correct)
  CREATE POLICY "Anyone can read items"
    ON public.items FOR SELECT
    TO authenticated
    USING (true);


  DROP POLICY IF EXISTS "Users can read own character items" ON public.character_items;
  DROP POLICY IF EXISTS "Users can manage own character items" ON public.character_items;
  DROP POLICY IF EXISTS "Users can read own battles" ON public.battles;

  CREATE POLICY "Users can read own character items"
    ON public.character_items FOR SELECT
    TO authenticated
    USING (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()));

  CREATE POLICY "Users can manage own character items"
    ON public.character_items FOR ALL
    TO authenticated
    USING (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()));

  -- Battles policy (simplified)
  CREATE POLICY "Users can read own battles"
    ON public.battles FOR SELECT
    TO authenticated
    USING (player1_id = auth.uid() OR player2_id = auth.uid());

  DROP POLICY IF EXISTS "Users can create battles" ON public.battles;
  CREATE POLICY "Users can create battles"
    ON battles FOR INSERT
    TO authenticated
    WITH CHECK (player1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
  DROP POLICY IF EXISTS "Anyone can read quests" ON public.quests;
  CREATE POLICY "Anyone can read quests"
    ON quests FOR SELECT
    TO authenticated
    USING (true);

  -- First drop the policy if it exists to avoid conflicts
  DROP POLICY IF EXISTS "Users can read own quest progress" ON public.character_quests;

  -- Create the corrected policy
  CREATE POLICY "Users can read own quest progress"
    ON public.character_quests FOR SELECT
    TO authenticated
    USING (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()));

  -- First drop the existing policy if it exists
  DROP POLICY IF EXISTS "Users can manage own quest progress" ON public.character_quests;

  -- Create the corrected policy
  CREATE POLICY "Users can manage own quest progress"
    ON public.character_quests FOR ALL
    TO authenticated
    USING (
      character_id IN (
        SELECT id 
        FROM public.characters 
        WHERE user_id = auth.uid()
      )
    );
  DROP POLICY IF EXISTS "Anyone can read leaderboards" ON public.leaderboards;

  -- Create the policy
  CREATE POLICY "Anyone can read leaderboards"
    ON public.leaderboards FOR SELECT
    TO authenticated
    USING (true);

  INSERT INTO items (name, description, type, rarity, attack_bonus, defense_bonus, health_bonus, price, image_url) VALUES
  ('Iron Sword', 'A basic iron sword for beginners', 'weapon', 'common', 5, 0, 0, 100, 'https://images.pexels.com/photos/6472842/pexels-photo-6472842.jpeg'),
  ('Steel Shield', 'A sturdy steel shield', 'armor', 'common', 0, 8, 10, 150, 'https://images.pexels.com/photos/6472842/pexels-photo-6472842.jpeg'),
  ('Health Potion', 'Restores 50 health points', 'consumable', 'common', 0, 0, 50, 25, 'https://images.pexels.com/photos/6472842/pexels-photo-6472842.jpeg'),
  ('Dragon Sword', 'A legendary sword forged by dragons', 'weapon', 'legendary', 25, 5, 20, 2000, 'https://images.pexels.com/photos/6472842/pexels-photo-6472842.jpeg'),
  ('Mana Potion', 'Restores 30 mana points', 'consumable', 'common', 0, 0, 0, 30, 'https://images.pexels.com/photos/6472842/pexels-photo-6472842.jpeg');

  INSERT INTO quests (title, description, objectives, rewards, difficulty, min_level) VALUES
  ('First Steps', 'Complete your first battle to prove your worth', '{"battles_won": 1}', '{"gold": 100, "experience": 50}', 'easy', 1),
  ('Collector', 'Gather 5 different items for your inventory', '{"items_collected": 5}', '{"gold": 250, "gems": 10}', 'easy', 1),
  ('Warrior''s Path', 'Win 10 battles to become a seasoned warrior', '{"battles_won": 10}', '{"gold": 500, "experience": 200}', 'medium', 3),
  ('Legendary Hunter', 'Defeat 3 legendary opponents', '{"legendary_defeats": 3}', '{"gold": 1000, "gems": 50}', 'hard', 10);