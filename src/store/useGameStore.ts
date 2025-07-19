import { create } from 'zustand';
import { Character, Profile, Item, Battle, Quest } from '../types/game';

interface GameState {
  user: any;
  profile: Profile | null;
  characters: Character[];
  selectedCharacter: Character | null;
  items: Item[];
  battles: Battle[];
  quests: Quest[];
  isLoading: boolean;
  
  // Actions
  setUser: (user: any) => void;
  setProfile: (profile: Profile | null) => void;
  setCharacters: (characters: Character[]) => void;
  setSelectedCharacter: (character: Character | null) => void;
  setItems: (items: Item[]) => void;
  setBattles: (battles: Battle[]) => void;
  setQuests: (quests: Quest[]) => void;
  setIsLoading: (loading: boolean) => void;
  
  // Game actions
  addCharacter: (character: Character) => void;
  updateCharacter: (character: Character) => void;
  addBattle: (battle: Battle) => void;
}

export const useGameStore = create<GameState>((set) => ({
  user: null,
  profile: null,
  characters: [],
  selectedCharacter: null,
  items: [],
  battles: [],
  quests: [],
  isLoading: false,
  
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setCharacters: (characters) => set({ characters }),
  setSelectedCharacter: (character) => set({ selectedCharacter: character }),
  setItems: (items) => set({ items }),
  setBattles: (battles) => set({ battles }),
  setQuests: (quests) => set({ quests }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  addCharacter: (character) => 
    set((state) => ({ characters: [...state.characters, character] })),
  updateCharacter: (character) =>
    set((state) => ({
      characters: state.characters.map((c) => c.id === character.id ? character : c),
      selectedCharacter: state.selectedCharacter?.id === character.id ? character : state.selectedCharacter,
    })),
  addBattle: (battle) =>
    set((state) => ({ battles: [...state.battles, battle] })),
}));