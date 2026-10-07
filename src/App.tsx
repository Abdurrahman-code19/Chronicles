import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  MessageSquare, 
  PlusCircle, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Download, 
  Sparkles, 
  Menu, 
  X,
  Zap,
  BookOpen,
  Info
} from 'lucide-react';
import { 
  GameState, 
  StoryBeat, 
  InventoryItem, 
  Quest, 
  ChatMessage, 
  ChatRole, 
  PlayerProfile 
} from './types';
import { Sidebar } from './components/Sidebar';
import { StoryView } from './components/StoryView';
import { CompanionChat } from './components/CompanionChat';
import { NewGameModal } from './components/NewGameModal';
import { ItemModal } from './components/ItemModal';
import { 
  playDiceRollSound, 
  playItemAcquiredSound, 
  playQuestProgressSound, 
  playParchmentSound 
} from './utils/audio';

const STORAGE_KEY = 'chronicle_adventure_engine_state_v1';
const CHAT_STORAGE_KEY = 'chronicle_adventure_chat_v1';

const DEFAULT_PLAYER: PlayerProfile = {
  name: 'Vael',
  archetype: 'Shadowblade Wanderer',
  visualAnchor: 'Silver-haired rogue in tattered obsidian traveling cloak, wielding twin rune-etched daggers, glowing pale violet eyes',
  genre: 'Dark Fantasy',
  artStyle: 'Dark Fantasy Oil Painting',
  imageSize: '1K',
  autoIllustrate: true,
  lowLatencyMode: false,
  health: 100,
  maxHealth: 100,
  resolve: 100,
  maxResolve: 100,
  gold: 45,
  level: 1,
  experience: 0,
};

const DEFAULT_QUEST: Quest = {
  id: 'q-init',
  title: 'The Whisper of the Sunken Spire',
  summary: 'Investigate the forgotten catacombs beneath the Mistveil Citadel and locate the fractured Celestial Astrolabe before the cult of the Eclipse retrieves it.',
  status: 'active',
  stages: [
    { id: 's1', description: 'Bypass the sleeping stone gargoyles at the crypt entrance', isCompleted: false },
    { id: 's2', description: 'Decipher the lunar glyph on the obsidian vault', isCompleted: false },
    { id: 's3', description: 'Retrieve the Astrolabe core', isCompleted: false },
  ],
  rewardPreview: 'Rune of Aether & 120 Gold',
};

const DEFAULT_INVENTORY: InventoryItem[] = [
  {
    id: 'item-1',
    name: 'Obsidian Moon-Dagger',
    category: 'weapon',
    rarity: 'rare',
    quantity: 1,
    description: 'Forged from fallen stellar glass. Gleams with faint starlight when danger approaches.',
    statsOrEffect: '+6 Agility, +15% Critical strike from shadows',
    isEquipped: true,
  },
  {
    id: 'item-2',
    name: 'Elixir of Ghost-Walking',
    category: 'consumable',
    rarity: 'common',
    quantity: 2,
    description: 'A smoky tincture that renders the imbiber nearly weightless and silent for a brief span.',
    statsOrEffect: 'Temporary soundless movement',
    isEquipped: false,
  },
  {
    id: 'item-3',
    name: 'Cipher-Ring of the Night Owls',
    category: 'artifact',
    rarity: 'epic',
    quantity: 1,
    description: 'An ancient signet bearing the symbol of the secretive informants guild.',
    statsOrEffect: 'Reveals hidden marks in thieves cant',
    isEquipped: true,
  },
];

const INITIAL_BEAT: StoryBeat = {
  id: 'beat-0',
  turnNumber: 1,
  title: 'Threshold of the Hollow Crypts',
  location: 'Mistveil Citadel Catacombs',
  playerActionTaken: '',
  consequenceAnalysis: '',
  narrative: `The chill of the sunken crypts settles deep into your bones as rain drums hollow against the granite above. Before you yawn the cavernous descent into the Sunken Spire—a subterranean labyrinth sealed since the fall of the Eclipse Dynasty.

Two petrified gargoyles flank the archway, their stony wings curved protectively over the threshold. You notice moss clawing across their talons, but faint wisps of cerulean incense still curl from their hollow nostrils. In the gloom ahead, an ancient iron lantern flickers with cold phantom fire, casting elongated shadows across cracked mosaic tiles depicting a fractured astrolabe.

Your fingers tighten around the hilt of your moon-dagger. Somewhere deeper in the stone labyrinth, heavy iron boots echo against the damp flags. You are not the only seeker who hunts the Astrolabe tonight.`,
  choices: [
    {
      id: 'c1',
      text: 'Melt into the perimeter shadows and slip quietly past the gargoyles before they awaken.',
      riskLevel: 'safe',
      intentTag: 'stealthy',
    },
    {
      id: 'c2',
      text: 'Examine the cerulean incense burners and identify the magical ward powering the statues.',
      riskLevel: 'moderate',
      intentTag: 'investigative',
    },
    {
      id: 'c3',
      text: 'Draw your weapon openly and advance down the central staircase to confront whoever approaches.',
      riskLevel: 'perilous',
      intentTag: 'aggressive',
    },
    {
      id: 'c4',
      text: 'Toss a flask of ghost-walking elixir onto the mosaic floor to mask your spiritual presence entirely.',
      riskLevel: 'unfathomable',
      intentTag: 'arcane',
    },
  ],
  timestamp: Date.now(),
  visualScenePrompt: 'A solitary silver-haired rogue in a dark traveling cloak standing at the grand arched entrance of a flooded ancient stone crypt flanked by two menacing stone gargoyles, atmospheric blue torchlight and foggy stone steps',
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved game state:', e);
    }
    return {
      player: DEFAULT_PLAYER,
      currentQuest: DEFAULT_QUEST,
      pastQuests: [],
      inventory: DEFAULT_INVENTORY,
      charactersMet: [
        {
          id: 'char-1',
          name: 'Kaelen the Blind Oracle',
          role: 'Keeper of the Sunken Archives',
          relationship: 'friendly',
          description: 'A reclusive elder monk whose sight was traded for prophecy.',
          lastSeenLocation: 'Mistveil Sanctuary',
        },
      ],
      storyBeats: [INITIAL_BEAT],
      currentBeatIndex: 0,
      worldKnowledge: [],
    };
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse chat messages:', e);
    }
    return [];
  });

  const [isGeneratingTurn, setIsGeneratingTurn] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isQuickActionLoading, setIsQuickActionLoading] = useState(false);
  const [quickActionResult, setQuickActionResult] = useState<string | null>(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'quest' | 'inventory' | 'characters' | 'settings'>('quest');
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [inspectedItem, setInspectedItem] = useState<InventoryItem | null>(null);
  const [isNewGameModalOpen, setIsNewGameModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Save game state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    } catch (e) {
      console.error('Failed to save game state:', e);
    }
  }, [gameState]);

  // Save chat messages
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatMessages));
    } catch (e) {
      console.error('Failed to save chat messages:', e);
    }
  }, [chatMessages]);

  const currentBeat = gameState.storyBeats[gameState.currentBeatIndex] || null;

  // Handle advancing the story with a chosen or custom action
  const handleAdvanceStory = async (actionText: string) => {
    if (isGeneratingTurn) return;
    setIsGeneratingTurn(true);
    if (soundEnabled) playParchmentSound();

    try {
      // Build history summary from recent beats
      const recentBeats = gameState.storyBeats.slice(-3);
      const historySummary = recentBeats
        .map((b) => `Chapter ${b.turnNumber} (${b.location}): ${b.title}\n${b.narrative.slice(0, 200)}...`)
        .join('\n\n');

      const response = await fetch('/api/adventure/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player: gameState.player,
          currentQuest: gameState.currentQuest,
          inventory: gameState.inventory,
          charactersMet: gameState.charactersMet,
          historySummary,
          playerAction: actionText,
          lowLatency: gameState.player.lowLatencyMode,
          isOpening: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to advance adventure');
      }

      const data = await response.json();

      // Process Dice check sound
      if (data.diceCheck && soundEnabled) {
        playDiceRollSound();
      }

      // New Story Beat
      const newBeatId = `beat-${Date.now()}`;
      const newTurnNumber = gameState.storyBeats.length + 1;
      const newBeat: StoryBeat = {
        id: newBeatId,
        turnNumber: newTurnNumber,
        title: data.title || `Chapter ${newTurnNumber}`,
        narrative: data.narrative || 'The path continues into the unknown...',
        consequenceAnalysis: data.consequenceAnalysis || 'Your choice leaves an indelible mark on the realm.',
        playerActionTaken: actionText,
        location: data.location || (currentBeat?.location || 'Uncharted Land'),
        choices: Array.isArray(data.choices) && data.choices.length > 0 ? data.choices : [
          { id: 'def-1', text: 'Press forward cautiously.', riskLevel: 'safe', intentTag: 'investigative' },
          { id: 'def-2', text: 'Stand your ground and prepare for ambush.', riskLevel: 'moderate', intentTag: 'aggressive' },
        ],
        visualScenePrompt: data.visualScenePrompt,
        diceRoll: data.diceCheck,
        timestamp: Date.now(),
      };

      // 1. Process Inventory Updates
      let updatedInventory = [...gameState.inventory];
      let itemAcquired = false;

      if (data.inventoryUpdates) {
        // Items removed
        if (Array.isArray(data.inventoryUpdates.itemsRemovedNames)) {
          updatedInventory = updatedInventory.filter(
            (item) => !data.inventoryUpdates.itemsRemovedNames.includes(item.name)
          );
        }
        // Items added
        if (Array.isArray(data.inventoryUpdates.itemsAdded)) {
          for (const newItem of data.inventoryUpdates.itemsAdded) {
            itemAcquired = true;
            const existingIndex = updatedInventory.findIndex((i) => i.name.toLowerCase() === newItem.name.toLowerCase());
            if (existingIndex >= 0) {
              updatedInventory[existingIndex].quantity += newItem.quantity || 1;
            } else {
              updatedInventory.push({
                id: `item-${Date.now()}-${Math.random()}`,
                name: newItem.name,
                category: newItem.category || 'artifact',
                rarity: newItem.rarity || 'common',
                quantity: newItem.quantity || 1,
                description: newItem.description || 'An artifact unearthed along your journey.',
                statsOrEffect: newItem.statsOrEffect,
                isEquipped: false,
              });
            }
          }
        }
      }

      if (itemAcquired && soundEnabled) {
        playItemAcquiredSound();
      }

      // 2. Process Quest Updates
      let updatedCurrentQuest = { ...gameState.currentQuest };
      const updatedPastQuests = [...gameState.pastQuests];

      if (data.questUpdate) {
        const qu = data.questUpdate;
        if (qu.isQuestCompleted) {
          updatedPastQuests.push({ ...updatedCurrentQuest, status: 'completed' });
          if (qu.newQuestIfCompleted) {
            updatedCurrentQuest = {
              id: `quest-${Date.now()}`,
              title: qu.newQuestIfCompleted.title,
              summary: qu.newQuestIfCompleted.summary,
              status: 'active',
              stages: qu.newQuestIfCompleted.firstStage
                ? [{ id: `s-${Date.now()}`, description: qu.newQuestIfCompleted.firstStage, isCompleted: false }]
                : [],
            };
          }
        } else {
          if (qu.title) updatedCurrentQuest.title = qu.title;
          if (qu.summary) updatedCurrentQuest.summary = qu.summary;

          // If current stage completed
          if (qu.isCurrentStageCompleted && updatedCurrentQuest.stages.length > 0) {
            const firstIncomplete = updatedCurrentQuest.stages.find((s) => !s.isCompleted);
            if (firstIncomplete) {
              firstIncomplete.isCompleted = true;
              if (soundEnabled) playQuestProgressSound();
            }
          }

          // Add new stages
          if (Array.isArray(qu.newStagesToAdd)) {
            for (const stageText of qu.newStagesToAdd) {
              updatedCurrentQuest.stages.push({
                id: `stage-${Date.now()}-${Math.random()}`,
                description: stageText,
                isCompleted: false,
              });
            }
          }
        }
      }

      // 3. Process Characters Met Updates
      let updatedCharacters = [...gameState.charactersMet];
      if (Array.isArray(data.charactersMetUpdates)) {
        for (const charUpdate of data.charactersMetUpdates) {
          const existingIdx = updatedCharacters.findIndex((c) => c.name.toLowerCase() === charUpdate.name.toLowerCase());
          if (existingIdx >= 0) {
            updatedCharacters[existingIdx] = {
              ...updatedCharacters[existingIdx],
              ...charUpdate,
            };
          } else {
            updatedCharacters.push({
              id: `char-${Date.now()}-${Math.random()}`,
              ...charUpdate,
            });
          }
        }
      }

      // 4. Process Player Stat Deltas
      const updatedPlayer = { ...gameState.player };
      if (data.playerStatDeltas) {
        if (data.playerStatDeltas.healthDelta) {
          updatedPlayer.health = Math.max(0, Math.min(updatedPlayer.maxHealth, updatedPlayer.health + data.playerStatDeltas.healthDelta));
        }
        if (data.playerStatDeltas.resolveDelta) {
          updatedPlayer.resolve = Math.max(0, Math.min(updatedPlayer.maxResolve, updatedPlayer.resolve + data.playerStatDeltas.resolveDelta));
        }
        if (data.playerStatDeltas.goldDelta) {
          updatedPlayer.gold = Math.max(0, updatedPlayer.gold + data.playerStatDeltas.goldDelta);
        }
        if (data.playerStatDeltas.expDelta) {
          updatedPlayer.experience += data.playerStatDeltas.expDelta;
          if (updatedPlayer.experience >= updatedPlayer.level * 100) {
            updatedPlayer.level += 1;
            updatedPlayer.maxHealth += 10;
            updatedPlayer.maxResolve += 10;
            updatedPlayer.health = updatedPlayer.maxHealth;
            updatedPlayer.resolve = updatedPlayer.maxResolve;
          }
        }
      }

      const updatedBeats = [...gameState.storyBeats, newBeat];

      setGameState({
        ...gameState,
        player: updatedPlayer,
        currentQuest: updatedCurrentQuest,
        pastQuests: updatedPastQuests,
        inventory: updatedInventory,
        charactersMet: updatedCharacters,
        storyBeats: updatedBeats,
        currentBeatIndex: updatedBeats.length - 1,
      });

      // Auto-illustrate if enabled
      if (gameState.player.autoIllustrate && data.visualScenePrompt) {
        handleGenerateImageForBeat(newBeatId, data.visualScenePrompt);
      }
    } catch (error: any) {
      console.error('Error generating turn:', error);
      alert(`The threads of fate tangled: ${error.message}`);
    } finally {
      setIsGeneratingTurn(false);
    }
  };

  // Generate image using gemini-3-pro-image-preview with size affordance (1K, 2K, 4K)
  const handleGenerateImageForBeat = async (beatId: string, customPrompt?: string) => {
    const targetBeat = gameState.storyBeats.find((b) => b.id === beatId);
    if (!targetBeat) return;

    const promptText = customPrompt || targetBeat.visualScenePrompt || targetBeat.narrative.slice(0, 200);

    setIsGeneratingImage(true);
    try {
      const response = await fetch('/api/adventure/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          visualAnchor: gameState.player.visualAnchor,
          artStyle: gameState.player.artStyle,
          imageSize: gameState.player.imageSize,
        }),
      });

      const data = await response.json();
      if (data?.imageUrl) {
        setGameState((prev) => ({
          ...prev,
          storyBeats: prev.storyBeats.map((b) =>
            b.id === beatId ? { ...b, imageUrl: data.imageUrl } : b
          ),
        }));
      }
    } catch {
      // Seamlessly handled
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Low-latency quick sensory action powered by gemini-3.1-flash-lite
  const handleQuickAction = async (actionType: string, subject: string) => {
    setIsQuickActionLoading(true);
    setQuickActionResult(null);
    try {
      const response = await fetch('/api/adventure/quick-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType,
          subject,
          context: {
            heroName: gameState.player.name,
            location: currentBeat?.location || 'Unknown',
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setQuickActionResult(data.result);
      }
    } catch (e: any) {
      console.error('Quick action failed:', e);
    } finally {
      setIsQuickActionLoading(false);
    }
  };

  // Multi-turn chat with configurable roles and models (gemini-3.1-pro-preview, gemini-3.5-flash, gemini-3.1-flash-lite)
  const handleSendChatMessage = async (text: string, roleType: ChatRole, modelChoice: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      roleType,
      modelUsed: modelChoice,
      timestamp: Date.now(),
    };

    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);

    try {
      const response = await fetch('/api/adventure/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: chatMessages.slice(-6),
          message: text,
          roleType,
          modelChoice,
          context: {
            heroName: gameState.player.name,
            quest: gameState.currentQuest.title,
            location: currentBeat?.location,
            inventory: gameState.inventory.map((i) => i.name).join(', '),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Oracle communication disrupted');
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'assistant',
        text: data.text,
        roleType,
        modelUsed: data.modelUsed || modelChoice,
        timestamp: Date.now(),
      };

      setChatMessages([...newHistory, assistantMsg]);
    } catch (e: any) {
      console.error('Chat error:', e);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        sender: 'assistant',
        text: 'The ethereal connection flickered. Please commune once more.',
        roleType,
        modelUsed: modelChoice,
        timestamp: Date.now(),
      };
      setChatMessages([...newHistory, errorMsg]);
    }
  };

  // Toggle equip status on an item
  const handleToggleEquipItem = (itemId: string) => {
    setGameState((prev) => ({
      ...prev,
      inventory: prev.inventory.map((item) =>
        item.id === itemId ? { ...item, isEquipped: !item.isEquipped } : item
      ),
    }));
  };

  // Update player profile
  const handleUpdatePlayerProfile = (updates: Partial<PlayerProfile>) => {
    setGameState((prev) => ({
      ...prev,
      player: { ...prev.player, ...updates },
    }));
  };

  // Start a fresh adventure
  const handleStartNewAdventure = async (profile: Partial<PlayerProfile>) => {
    const newPlayer: PlayerProfile = {
      ...DEFAULT_PLAYER,
      ...profile,
    };

    setIsGeneratingTurn(true);
    try {
      const response = await fetch('/api/adventure/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player: newPlayer,
          currentQuest: null,
          inventory: [],
          charactersMet: [],
          historySummary: '',
          playerAction: 'Begin the journey',
          lowLatency: newPlayer.lowLatencyMode,
          isOpening: true,
        }),
      });

      const data = await response.json();

      const newQuest: Quest = {
        id: `q-${Date.now()}`,
        title: data.questUpdate?.title || 'An Awakening in Shadows',
        summary: data.questUpdate?.summary || 'Unravel the grand mystery of your genesis.',
        status: 'active',
        stages: Array.isArray(data.questUpdate?.newStagesToAdd)
          ? data.questUpdate.newStagesToAdd.map((s: string) => ({ id: `s-${Math.random()}`, description: s, isCompleted: false }))
          : [{ id: 's1', description: 'Investigate your immediate surroundings', isCompleted: false }],
        rewardPreview: 'Uncharted Horizons',
      };

      const newInventory: InventoryItem[] = Array.isArray(data.inventoryUpdates?.itemsAdded)
        ? data.inventoryUpdates.itemsAdded.map((i: any) => ({
            id: `item-${Math.random()}`,
            name: i.name,
            category: i.category || 'artifact',
            rarity: i.rarity || 'common',
            quantity: i.quantity || 1,
            description: i.description || 'Starting equipment.',
            statsOrEffect: i.statsOrEffect,
            isEquipped: true,
          }))
        : DEFAULT_INVENTORY;

      const newFirstBeat: StoryBeat = {
        id: `beat-${Date.now()}`,
        turnNumber: 1,
        title: data.title || 'Genesis of the Wanderer',
        narrative: data.narrative || 'You stand at the threshold of a vast, unwritten realm...',
        consequenceAnalysis: data.consequenceAnalysis || 'The infinite path unfolds according to your will.',
        playerActionTaken: 'Begin Journey',
        location: data.location || 'The Crossroad',
        choices: data.choices || [],
        visualScenePrompt: data.visualScenePrompt,
        timestamp: Date.now(),
      };

      setGameState({
        player: newPlayer,
        currentQuest: newQuest,
        pastQuests: [],
        inventory: newInventory,
        charactersMet: data.charactersMetUpdates || [],
        storyBeats: [newFirstBeat],
        currentBeatIndex: 0,
        worldKnowledge: [],
      });

      setChatMessages([]);

      if (newPlayer.autoIllustrate && data.visualScenePrompt) {
        handleGenerateImageForBeat(newFirstBeat.id, data.visualScenePrompt);
      }
    } catch (e: any) {
      console.error('Error starting new game:', e);
      alert('Could not start new adventure: ' + e.message);
    } finally {
      setIsGeneratingTurn(false);
    }
  };

  // Export full chronicle as Markdown
  const handleExportChronicle = () => {
    let md = `# Chronicle of ${gameState.player.name}\n\n`;
    md += `**Archetype:** ${gameState.player.archetype} | **Genre:** ${gameState.player.genre}\n\n`;
    md += `**Art Style:** ${gameState.player.artStyle} | **Image Size:** ${gameState.player.imageSize}\n\n`;
    md += `## Quests Completed\n\n`;
    md += `- **Active:** ${gameState.currentQuest.title} (${gameState.currentQuest.summary})\n`;
    gameState.pastQuests.forEach((q) => {
      md += `- **Done:** ${q.title} (${q.summary})\n`;
    });
    md += `\n## Story Chapters\n\n`;
    gameState.storyBeats.forEach((b) => {
      md += `### Chapter ${b.turnNumber}: ${b.title}\n`;
      md += `*Location:* ${b.location}\n\n`;
      if (b.playerActionTaken) {
        md += `> **Action Taken:** ${b.playerActionTaken}\n\n`;
      }
      md += `${b.narrative}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${gameState.player.name.toLowerCase()}_chronicle.md`;
    a.click();
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-stone-950 font-sans select-text">
      {/* Global Top Navbar */}
      <header className="h-14 border-b border-stone-800 bg-stone-950/95 px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="md:hidden p-2 text-stone-400 hover:text-white"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-amber-500 animate-spin-slow" />
            <div>
              <h1 className="font-serif font-black tracking-wider text-base text-amber-200">
                CHRONICLE
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-mono text-stone-400">
                Infinite Choose-Your-Own-Adventure Engine
              </span>
            </div>
          </div>
        </div>

        {/* Header Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg border text-xs transition-colors ${
              soundEnabled
                ? 'border-stone-700 bg-stone-900 text-amber-300'
                : 'border-stone-800 bg-stone-950 text-stone-600'
            }`}
            title={soundEnabled ? 'Mute Audio Effects' : 'Enable Audio Effects'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Export Chronicle */}
          <button
            onClick={handleExportChronicle}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-800 bg-stone-900/60 hover:bg-stone-900 text-stone-300 hover:text-amber-200 text-xs transition-colors"
            title="Export full narrative as Markdown"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Log</span>
          </button>

          {/* New Adventure Modal trigger */}
          <button
            onClick={() => setIsNewGameModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-600/50 text-amber-200 text-xs font-medium transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>New Adventure</span>
          </button>

          {/* Toggle Companion Chat Drawer */}
          <button
            onClick={() => setIsChatDrawerOpen(!isChatDrawerOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isChatDrawerOpen
                ? 'bg-amber-600 text-stone-950 border-amber-500 font-bold'
                : 'bg-stone-900 text-stone-300 border-stone-700 hover:text-white hover:bg-stone-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Oracle & Chat</span>
            {chatMessages.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>
        </div>
      </header>

      {/* Quick Action Alert Toast (if triggered) */}
      {quickActionResult && (
        <div className="bg-amber-950/90 border-b border-amber-600/50 px-4 py-2 flex items-center justify-between text-xs text-amber-200 z-30 animate-in slide-in-from-top">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-mono">Rapid Check:</span>
            <span>{quickActionResult}</span>
          </div>
          <button
            onClick={() => setQuickActionResult(null)}
            className="p-1 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex shrink-0 h-full">
          <Sidebar
            gameState={gameState}
            onUpdatePlayerProfile={handleUpdatePlayerProfile}
            onInspectItem={(item) => setInspectedItem(item)}
            onToggleEquipItem={handleToggleEquipItem}
            onQuickAction={handleQuickAction}
            isQuickActionLoading={isQuickActionLoading}
            activeTab={activeSidebarTab}
            setActiveTab={setActiveSidebarTab}
          />
        </div>

        {/* Mobile Slide-over Sidebar */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/70"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative z-50 w-80 max-w-full h-full shadow-2xl">
              <Sidebar
                gameState={gameState}
                onUpdatePlayerProfile={handleUpdatePlayerProfile}
                onInspectItem={(item) => {
                  setInspectedItem(item);
                  setIsMobileSidebarOpen(false);
                }}
                onToggleEquipItem={handleToggleEquipItem}
                onQuickAction={handleQuickAction}
                isQuickActionLoading={isQuickActionLoading}
                activeTab={activeSidebarTab}
                setActiveTab={setActiveSidebarTab}
              />
            </div>
          </div>
        )}

        {/* Central Story View */}
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          <StoryView
            currentBeat={currentBeat}
            allBeats={gameState.storyBeats}
            currentBeatIndex={gameState.currentBeatIndex}
            onSelectChoice={handleAdvanceStory}
            onCustomAction={handleAdvanceStory}
            onGenerateImageForBeat={(beatId) => handleGenerateImageForBeat(beatId)}
            onNavigateBeat={(idx) => setGameState((prev) => ({ ...prev, currentBeatIndex: idx }))}
            isGeneratingTurn={isGeneratingTurn}
            isGeneratingImage={isGeneratingImage}
            imageSize={gameState.player.imageSize}
            lowLatencyMode={gameState.player.lowLatencyMode}
          />
        </main>

        {/* Oracle & Companion Multi-turn Chat Slide-out Drawer */}
        {isChatDrawerOpen && (
          <div className="w-80 md:w-96 shrink-0 h-full z-20 shadow-2xl flex flex-col">
            <CompanionChat
              messages={chatMessages}
              onSendMessage={handleSendChatMessage}
              onClearChat={() => setChatMessages([])}
              isLoading={false}
              gameState={gameState}
              onClose={() => setIsChatDrawerOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Item Inspection Modal */}
      <ItemModal
        item={inspectedItem}
        onClose={() => setInspectedItem(null)}
        onToggleEquip={handleToggleEquipItem}
        onAskAboutItem={(itemName) => {
          setIsChatDrawerOpen(true);
          handleSendChatMessage(`Inspect this artifact in my inventory: "${itemName}". Tell me its hidden lore and how to unlock its full potential.`, 'lorekeeper', 'gemini-3.1-flash-lite');
        }}
      />

      {/* New Adventure Modal */}
      <NewGameModal
        isOpen={isNewGameModalOpen}
        onClose={() => setIsNewGameModalOpen(false)}
        onStartAdventure={handleStartNewAdventure}
      />
    </div>
  );
}
