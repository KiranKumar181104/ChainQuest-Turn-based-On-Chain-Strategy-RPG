/*
# Character Items Table for Inventory Management

This migration creates the character_items table to track which items each character owns,
including purchased weapons, armor, and other equipment.

## New Table:
- **character_items** - Junction table linking characters to their owned items

## Features:
- Track item ownership per character
- Support for item quantities
- Equipment status (equipped/unequipped)
- Automatic cleanup when characters are deleted

## Security:
- Row Level Security enabled
- Users can only access items for their own characters
*/

-- Character items table (inventory management)
CREATE TABLE IF NOT EXISTS public.character_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  is_equipped boolean DEFAULT false,
  equipped_slot text, -- 'weapon', 'armor', 'accessory', etc.
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one item per slot per character for equipment
  UNIQUE(character_id, item_id),
  -- Only one item equipped per slot per character
  EXCLUDE (character_id WITH =, equipped_slot WITH =) WHERE (is_equipped = true AND equipped_slot IS NOT NULL)
);

-- Enable Row Level Security
ALTER TABLE public.character_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for character_items
CREATE POLICY "Users can read own character items"
  ON public.character_items FOR SELECT
  TO authenticated
  USING (
    character_id IN (
      SELECT id FROM public.characters WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own character items"
  ON public.character_items FOR ALL
  TO authenticated
  USING (
    character_id IN (
      SELECT id FROM public.characters WHERE user_id = auth.uid()
    )
  );

-- Function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_character_items_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER handle_character_items_updated_at
  BEFORE UPDATE ON public.character_items
  FOR EACH ROW EXECUTE PROCEDURE public.handle_character_items_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_character_items_character_id ON public.character_items(character_id);
CREATE INDEX IF NOT EXISTS idx_character_items_item_id ON public.character_items(item_id);
CREATE INDEX IF NOT EXISTS idx_character_items_equipped ON public.character_items(character_id, is_equipped) WHERE is_equipped = true;

-- Function to automatically set equipped slot based on item type
CREATE OR REPLACE FUNCTION public.set_equipment_slot()
RETURNS trigger AS $$
BEGIN
  -- Only set slot for equipment items when they're being equipped
  IF NEW.is_equipped = true THEN
    SELECT type INTO NEW.equipped_slot
    FROM public.items
    WHERE id = NEW.item_id
    AND type IN ('weapon', 'armor', 'accessory');
  ELSE
    NEW.equipped_slot = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically set equipment slot
CREATE TRIGGER set_equipment_slot_trigger
  BEFORE INSERT OR UPDATE ON public.character_items
  FOR EACH ROW EXECUTE PROCEDURE public.set_equipment_slot();