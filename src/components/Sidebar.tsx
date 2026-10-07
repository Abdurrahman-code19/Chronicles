import React, { useState } from 'react';
import { 
  Backpack, 
  Scroll, 
  Users, 
  Sliders, 
  Sparkles, 
  Shield, 
  Heart, 
  Flame, 
  Coins, 
  CheckCircle2, 
  Circle, 
  Eye, 
  Zap, 
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { 
  GameState, 
  InventoryItem, 
  Quest, 
  CharacterContact, 
  ImageSizeType, 
  ArtStyleType 
} from '../types';

interface SidebarProps {
  gameState: GameState;
  onUpdatePlayerProfile: (updates: Partial<GameState['player']>) => void;
  onInspectItem: (item: InventoryItem) => void;
  onToggleEquipItem: (itemId: string) => void;
  onQuickAction: (actionType: string, subject: string) => void;
  isQuickActionLoading: boolean;
  activeTab: 'quest' | 'inventory' | 'characters' | 'settings';
  setActiveTab: (tab: 'quest' | 'inventory' | 'characters' | 'settings') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  gameState,
  onUpdatePlayerProfile,
  onInspectItem,
  onToggleEquipItem,
  onQuickAction,
  isQuickActionLoading,
  activeTab,
  setActiveTab,
}) => {
  const { player, currentQuest, pastQuests, inventory, charactersMet } = gameState;
  const [showAnchorEdit, setShowAnchorEdit] = useState(false);
  const [anchorDraft, setAnchorDraft] = useState(player.visualAnchor);
  const [showPastQuests, setShowPastQuests] = useState(false);

  const getRarityBadge = (rarity: InventoryItem['rarity']) => {
    switch (rarity) {
      case 'eldritch':
        return 'border-purple-500/80 text-purple-300 bg-purple-950/60';
      case 'legendary':
        return 'border-amber-500/80 text-amber-300 bg-amber-950/60';
      case 'epic':
        return 'border-indigo-500/80 text-indigo-300 bg-indigo-950/60';
      case 'rare':
        return 'border-cyan-500/80 text-cyan-300 bg-cyan-950/60';
      default:
        return 'border-stone-600/80 text-stone-300 bg-stone-900/60';
    }
  };

  const getRelationshipColor = (rel: CharacterContact['relationship']) => {
    switch (rel) {
      case 'allied':
      case 'friendly':
        return 'text-emerald-400 border-emerald-500/50 bg-emerald-950/30';
      case 'hostile':
        return 'text-rose-400 border-rose-500/50 bg-rose-950/30';
      case 'mysterious':
        return 'text-violet-400 border-violet-500/50 bg-violet-950/30';
      default:
        return 'text-amber-400 border-amber-500/50 bg-amber-950/30';
    }
  };

  return (
    <aside className="w-80 md:w-96 flex flex-col bg-stone-950/95 border-r border-stone-800 text-stone-200 h-full backdrop-blur-md select-none">
      {/* Top Hero Banner */}
      <div className="p-4 border-b border-stone-800/80 bg-linear-to-b from-stone-900/70 to-stone-950/40">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="font-serif text-lg font-bold tracking-wide text-amber-200">
              {player.name}
            </h2>
            <p className="text-xs text-stone-400">{player.archetype} • Lv. {player.level}</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full border border-amber-500/40 bg-amber-950/40 text-amber-300 font-mono">
            {player.genre}
          </span>
        </div>

        {/* Vitals Bar */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
          <div className="bg-stone-900/80 p-2 rounded border border-rose-950/50 flex flex-col items-center">
            <span className="flex items-center gap-1 text-rose-400 font-medium">
              <Heart className="w-3.5 h-3.5 fill-rose-500/30 text-rose-500" /> HP
            </span>
            <span className="font-mono text-stone-200 font-semibold mt-0.5">
              {player.health}/{player.maxHealth}
            </span>
          </div>
          <div className="bg-stone-900/80 p-2 rounded border border-indigo-950/50 flex flex-col items-center">
            <span className="flex items-center gap-1 text-indigo-400 font-medium">
              <Flame className="w-3.5 h-3.5 fill-indigo-500/30 text-indigo-500" /> Resolve
            </span>
            <span className="font-mono text-stone-200 font-semibold mt-0.5">
              {player.resolve}/{player.maxResolve}
            </span>
          </div>
          <div className="bg-stone-900/80 p-2 rounded border border-amber-950/50 flex flex-col items-center">
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <Coins className="w-3.5 h-3.5 fill-amber-500/30 text-amber-500" /> Gold
            </span>
            <span className="font-mono text-stone-200 font-semibold mt-0.5">
              {player.gold}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-4 border-b border-stone-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('quest')}
          className={`py-2.5 flex flex-col items-center gap-1 transition-colors border-b-2 ${
            activeTab === 'quest'
              ? 'border-amber-400 text-amber-300 bg-stone-900/60'
              : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-900/30'
          }`}
          title="Current Quest & Objectives"
        >
          <Scroll className="w-4 h-4" />
          <span>Quest</span>
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`py-2.5 flex flex-col items-center gap-1 transition-colors border-b-2 relative ${
            activeTab === 'inventory'
              ? 'border-amber-400 text-amber-300 bg-stone-900/60'
              : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-900/30'
          }`}
          title="Inventory & Equipment"
        >
          <Backpack className="w-4 h-4" />
          <span>Items ({inventory.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('characters')}
          className={`py-2.5 flex flex-col items-center gap-1 transition-colors border-b-2 ${
            activeTab === 'characters'
              ? 'border-amber-400 text-amber-300 bg-stone-900/60'
              : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-900/30'
          }`}
          title="Known Characters & Factions"
        >
          <Users className="w-4 h-4" />
          <span>Codex ({charactersMet.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`py-2.5 flex flex-col items-center gap-1 transition-colors border-b-2 ${
            activeTab === 'settings'
              ? 'border-amber-400 text-amber-300 bg-stone-900/60'
              : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-900/30'
          }`}
          title="Visual Art & Engine Config"
        >
          <Sliders className="w-4 h-4" />
          <span>Engine</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* QUEST TAB */}
        {activeTab === 'quest' && (
          <div className="space-y-4">
            <div className="bg-stone-900/80 border border-stone-800 rounded-lg p-3.5 shadow-inner">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] tracking-wider uppercase font-mono text-amber-400 font-semibold">
                  Active Quest
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-600/40 text-emerald-300 uppercase">
                  {currentQuest.status}
                </span>
              </div>
              <h3 className="font-serif text-base font-bold text-amber-100">
                {currentQuest.title || 'In Search of Destiny'}
              </h3>
              <p className="text-xs text-stone-300 mt-1.5 leading-relaxed">
                {currentQuest.summary}
              </p>

              {/* Stages Checklist */}
              <div className="mt-3.5 pt-3 border-t border-stone-800/80 space-y-2">
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wide block">
                  Quest Objectives:
                </span>
                {currentQuest.stages && currentQuest.stages.length > 0 ? (
                  currentQuest.stages.map((stage) => (
                    <div
                      key={stage.id}
                      className={`flex items-start gap-2 text-xs p-1.5 rounded transition-colors ${
                        stage.isCompleted
                          ? 'text-stone-500 line-through bg-stone-950/40'
                          : 'text-stone-200 bg-stone-900/50'
                      }`}
                    >
                      {stage.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <span className="leading-tight">{stage.description}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-500 italic">No specific milestones yet.</p>
                )}
              </div>

              {currentQuest.rewardPreview && (
                <div className="mt-3 pt-2 border-t border-stone-800/60 text-xs text-amber-300/90 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reward: {currentQuest.rewardPreview}</span>
                </div>
              )}
            </div>

            {/* Past Quests Accordion */}
            {pastQuests.length > 0 && (
              <div className="border border-stone-800 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowPastQuests(!showPastQuests)}
                  className="w-full flex items-center justify-between p-2.5 bg-stone-900/60 text-xs text-stone-300 hover:bg-stone-900"
                >
                  <span>Completed Deeds ({pastQuests.length})</span>
                  {showPastQuests ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {showPastQuests && (
                  <div className="p-3 space-y-2 bg-stone-950/60 divide-y divide-stone-800/60">
                    {pastQuests.map((q) => (
                      <div key={q.id} className="pt-2 first:pt-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-stone-300">{q.title}</span>
                          <span className="text-[10px] text-emerald-400">Done</span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-2">{q.summary}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-400 px-1">
              <span>Carrying Capacity: {inventory.length} items</span>
              <span className="text-[10px] text-amber-400 font-mono">Auto-synced by AI</span>
            </div>

            {inventory.length === 0 ? (
              <div className="p-8 text-center text-stone-500 bg-stone-900/40 rounded-lg border border-dashed border-stone-800">
                <Backpack className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">Your satchel is empty.</p>
                <p className="text-[10px] text-stone-600 mt-1">Choices in the narrative will reveal new artifacts.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {inventory.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-stone-900/70 hover:bg-stone-900 border border-stone-800/80 rounded-lg transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-serif font-semibold text-sm text-stone-200 group-hover:text-amber-200 transition-colors">
                            {item.name}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-[10px] bg-stone-800 text-stone-300 px-1.5 py-0.2 rounded font-mono">
                              x{item.quantity}
                            </span>
                          )}
                          <span className={`text-[10px] px-1.5 py-0.2 rounded border uppercase font-mono ${getRarityBadge(item.rarity)}`}>
                            {item.rarity}
                          </span>
                          {item.isEquipped && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-500/60 text-amber-300 font-semibold">
                              EQUIPPED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-400 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                        {item.statsOrEffect && (
                          <div className="mt-1 text-[11px] text-emerald-400 font-mono">
                            ✦ {item.statsOrEffect}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1.5 mt-2 pt-2 border-t border-stone-800/50">
                      <button
                        onClick={() => onInspectItem(item)}
                        className="px-2 py-1 text-[11px] rounded bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3 h-3" /> Inspect
                      </button>
                      <button
                        onClick={() => onToggleEquipItem(item.id)}
                        className={`px-2 py-1 text-[11px] rounded flex items-center gap-1 transition-colors ${
                          item.isEquipped
                            ? 'bg-amber-900/60 hover:bg-amber-800/80 text-amber-200 border border-amber-600/50'
                            : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        {item.isEquipped ? 'Unequip' : 'Equip'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CHARACTERS TAB */}
        {activeTab === 'characters' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-400 px-1">
              <span>Known Allies & Adversaries</span>
              <span className="text-[10px] font-mono text-amber-400">AI Tracked</span>
            </div>

            {charactersMet.length === 0 ? (
              <div className="p-8 text-center text-stone-500 bg-stone-900/40 rounded-lg border border-dashed border-stone-800">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No key figures recorded yet.</p>
                <p className="text-[10px] text-stone-600 mt-1">People you converse with will be cataloged here.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {charactersMet.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-stone-900/70 border border-stone-800 rounded-lg space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-sm text-amber-100">
                        {c.name}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-mono ${getRelationshipColor(c.relationship)}`}>
                        {c.relationship}
                      </span>
                    </div>
                    <p className="text-xs text-amber-400/90 font-medium">{c.role}</p>
                    <p className="text-xs text-stone-300 leading-snug">{c.description}</p>
                    <div className="text-[11px] text-stone-500 pt-1 font-mono">
                      Location: {c.lastSeenLocation}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SETTINGS / VISUAL ART TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-4 text-xs">
            {/* Visual Consistency Section */}
            <div className="bg-stone-900/80 p-3.5 rounded-lg border border-stone-800 space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-semibold font-serif text-sm">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>Visual Art Direction</span>
              </div>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                Images are rendered in real-time with consistent character traits and coherent aesthetics.
              </p>

              {/* Resolution affordance: 1K, 2K, 4K */}
              <div>
                <label className="text-[11px] font-mono text-stone-300 block mb-1.5">
                  Image Resolution:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['1K', '2K', '4K'] as ImageSizeType[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => onUpdatePlayerProfile({ imageSize: size })}
                      className={`py-1.5 px-2 rounded font-mono text-xs font-semibold border transition-all ${
                        player.imageSize === size
                          ? 'border-amber-400 bg-amber-950/70 text-amber-200 shadow-xs'
                          : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Model: gemini-3-pro-image-preview
                </span>
              </div>

              {/* Art Style Selector */}
              <div>
                <label className="text-[11px] font-mono text-stone-300 block mb-1.5">
                  Art Style Preset:
                </label>
                <select
                  value={player.artStyle}
                  onChange={(e) => onUpdatePlayerProfile({ artStyle: e.target.value as ArtStyleType })}
                  className="w-full bg-stone-950 border border-stone-700 rounded px-2.5 py-1.5 text-stone-200 text-xs focus:outline-hidden focus:border-amber-500"
                >
                  <option value="Dark Fantasy Oil Painting">Dark Fantasy Oil Painting</option>
                  <option value="Grim Graphic Novel Noir">Grim Graphic Novel Noir</option>
                  <option value="Retro 16-Bit Isometric RPG">Retro 16-Bit Isometric RPG</option>
                  <option value="Studio Ghibli Watercolor">Studio Ghibli Watercolor</option>
                  <option value="Eldritch Charcoal & Gold Leaf">Eldritch Charcoal & Gold Leaf</option>
                  <option value="Cinematic Photorealistic Concept Art">Cinematic Photorealistic Concept Art</option>
                </select>
              </div>

              {/* Character Appearance Anchor */}
              <div className="pt-2 border-t border-stone-800/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono text-stone-300">
                    Hero Visual Anchor:
                  </span>
                  <button
                    onClick={() => {
                      if (showAnchorEdit) {
                        onUpdatePlayerProfile({ visualAnchor: anchorDraft });
                      }
                      setShowAnchorEdit(!showAnchorEdit);
                    }}
                    className="text-[10px] text-amber-400 hover:underline"
                  >
                    {showAnchorEdit ? 'Save Anchor' : 'Edit'}
                  </button>
                </div>
                {showAnchorEdit ? (
                  <textarea
                    value={anchorDraft}
                    onChange={(e) => setAnchorDraft(e.target.value)}
                    rows={3}
                    className="w-full bg-stone-950 border border-amber-600/60 rounded p-2 text-[11px] text-stone-200 focus:outline-hidden"
                    placeholder="Describe hero's hair, cloak, eyes, sigil..."
                  />
                ) : (
                  <p className="text-[11px] text-stone-400 bg-stone-950/50 p-2 rounded border border-stone-800/80 italic">
                    "{player.visualAnchor}"
                  </p>
                )}
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Injected into every image prompt to ensure characters look identical throughout the journey.
                </span>
              </div>
            </div>

            {/* Performance & Latency */}
            <div className="bg-stone-900/80 p-3.5 rounded-lg border border-stone-800 space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-semibold font-serif text-sm">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Response Speed</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-stone-200 font-medium block">
                    Low-Latency Mode (gemini-3.1-flash-lite)
                  </span>
                  <span className="text-[10px] text-stone-400">
                    Rapid responses for lightning-fast choices
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={player.lowLatencyMode}
                  onChange={(e) => onUpdatePlayerProfile({ lowLatencyMode: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-stone-200 font-medium block">
                    Auto-Generate Scene Art
                  </span>
                  <span className="text-[10px] text-stone-400">
                    Render illustration on every new chapter
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={player.autoIllustrate}
                  onChange={(e) => onUpdatePlayerProfile({ autoIllustrate: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Quick-Action Bar powered by gemini-3.1-flash-lite */}
      <div className="p-3 border-t border-stone-800/90 bg-stone-900/90">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono text-amber-400/90 uppercase flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> Quick Sensory Checks
          </span>
          <span className="text-[9px] text-stone-500 font-mono">gemini-3.1-flash-lite</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            disabled={isQuickActionLoading}
            onClick={() => onQuickAction('Perception', 'Immediate Surroundings')}
            className="px-2 py-1.5 bg-stone-800/80 hover:bg-stone-700/90 text-stone-300 rounded text-[11px] font-medium border border-stone-700/60 disabled:opacity-50 transition-colors"
          >
            Scan Room
          </button>
          <button
            disabled={isQuickActionLoading}
            onClick={() => onQuickAction('Sense Motives', 'Present Characters')}
            className="px-2 py-1.5 bg-stone-800/80 hover:bg-stone-700/90 text-stone-300 rounded text-[11px] font-medium border border-stone-700/60 disabled:opacity-50 transition-colors"
          >
            Sense Motives
          </button>
          <button
            disabled={isQuickActionLoading}
            onClick={() => onQuickAction('Appraisal', 'Carried Relics')}
            className="px-2 py-1.5 bg-stone-800/80 hover:bg-stone-700/90 text-stone-300 rounded text-[11px] font-medium border border-stone-700/60 disabled:opacity-50 transition-colors"
          >
            Appraise Items
          </button>
        </div>
      </div>
    </aside>
  );
};
