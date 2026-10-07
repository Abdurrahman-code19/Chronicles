export type GenreType = 
  | 'Dark Fantasy'
  | 'Grim Cyberpunk'
  | 'Eldritch Gothic'
  | 'Sci-Fi Deep Space'
  | 'Mythic Steampunk';

export type ArtStyleType =
  | 'Dark Fantasy Oil Painting'
  | 'Grim Graphic Novel Noir'
  | 'Retro 16-Bit Isometric RPG'
  | 'Studio Ghibli Watercolor'
  | 'Eldritch Charcoal & Gold Leaf'
  | 'Cinematic Photorealistic Concept Art';

export type ImageSizeType = '1K' | '2K' | '4K';

export type ItemCategory = 
  | 'weapon' 
  | 'armor' 
  | 'artifact' 
  | 'consumable' 
  | 'quest' 
  | 'lore' 
  | 'currency';

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'eldritch';

export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  rarity: ItemRarity;
  quantity: number;
  description: string;
  statsOrEffect?: string;
  isEquipped?: boolean;
}

export interface QuestStage {
  id: string;
  description: string;
  isCompleted: boolean;
}

export interface Quest {
  id: string;
  title: string;
  summary: string;
  stages: QuestStage[];
  status: 'active' | 'completed' | 'failed';
  giver?: string;
  rewardPreview?: string;
}

export interface CharacterContact {
  id: string;
  name: string;
  role: string;
  relationship: 'friendly' | 'neutral' | 'hostile' | 'mysterious' | 'allied';
  description: string;
  lastSeenLocation: string;
}

export interface PlayerProfile {
  name: string;
  archetype: string;
  visualAnchor: string; // Used across image generations to keep hero visually identical
  genre: GenreType;
  artStyle: ArtStyleType;
  imageSize: ImageSizeType;
  autoIllustrate: boolean;
  lowLatencyMode: boolean; // Uses gemini-3.1-flash-lite for instant turns
  health: number;
  maxHealth: number;
  resolve: number;
  maxResolve: number;
  gold: number;
  level: number;
  experience: number;
}

export interface StoryChoice {
  id: string;
  text: string;
  riskLevel: 'safe' | 'moderate' | 'perilous' | 'unfathomable';
  intentTag: 'aggressive' | 'diplomatic' | 'stealthy' | 'investigative' | 'arcane' | 'unorthodox';
}

export interface StoryBeat {
  id: string;
  turnNumber: number;
  title: string;
  narrative: string;
  consequenceAnalysis: string;
  playerActionTaken: string;
  location: string;
  choices: StoryChoice[];
  imageUrl?: string;
  imagePrompt?: string;
  visualScenePrompt?: string;
  timestamp: number;
  diceRoll?: {
    roll: number;
    threshold: number;
    passed: boolean;
    statUsed: string;
  };
}

export type ChatRole = 'dungeon_master' | 'companion' | 'lorekeeper';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  roleType: ChatRole;
  modelUsed: string;
  timestamp: number;
}

export interface GameState {
  player: PlayerProfile;
  currentQuest: Quest;
  pastQuests: Quest[];
  inventory: InventoryItem[];
  charactersMet: CharacterContact[];
  storyBeats: StoryBeat[];
  currentBeatIndex: number;
  worldKnowledge: string[];
}
