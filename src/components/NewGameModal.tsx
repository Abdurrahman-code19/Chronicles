import React, { useState } from 'react';
import { Sparkles, Shield, Compass, Palette, X, Zap } from 'lucide-react';
import { GenreType, ArtStyleType, ImageSizeType, PlayerProfile } from '../types';

interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartAdventure: (profile: Partial<PlayerProfile>) => void;
}

const ARCHETYPES = [
  {
    name: 'Shadowblade Wanderer',
    genre: 'Dark Fantasy' as GenreType,
    anchor: 'Silver-haired rogue in tattered obsidian traveling cloak, wielding twin rune-etched daggers, glowing pale violet eyes',
    desc: 'Master of stealth, forgotten shadows, and lethal agility.',
  },
  {
    name: 'Eldritch Inquisitor',
    genre: 'Eldritch Gothic' as GenreType,
    anchor: 'Grim inquisitor in heavy iron-trimmed black greatcoat, holding a brass astrolabe and bone-handled flintlock pistol',
    desc: 'Hunter of aberrant horrors and keeper of forbidden sigils.',
  },
  {
    name: 'Cyber-Netrunner Merc',
    genre: 'Grim Cyberpunk' as GenreType,
    anchor: 'Cybernetic operative with glowing cyan ocular implants, matte black tactical jacket with neon yellow cabling',
    desc: 'Hacker and urban mercenary navigating towering megacities.',
  },
  {
    name: 'Aetherial Astromancer',
    genre: 'Sci-Fi Deep Space' as GenreType,
    anchor: 'Deep space explorer in white pressurized orbital suit with gilded astronomical filigree, helmet visor reflecting star nebulas',
    desc: 'Explorer charting dying stars and alien anomalies.',
  },
  {
    name: 'Steam-Iron Paladin',
    genre: 'Mythic Steampunk' as GenreType,
    anchor: 'Armored knight in brass and copper steam-powered plate armor with pressure gauges, bearing a glowing clockwork greatsword',
    desc: 'Devout defender powered by clockwork engines and righteous fury.',
  },
];

export const NewGameModal: React.FC<NewGameModalProps> = ({
  isOpen,
  onClose,
  onStartAdventure,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('Vael');
  const [selectedArchetype, setSelectedArchetype] = useState(ARCHETYPES[0]);
  const [genre, setGenre] = useState<GenreType>('Dark Fantasy');
  const [artStyle, setArtStyle] = useState<ArtStyleType>('Dark Fantasy Oil Painting');
  const [imageSize, setImageSize] = useState<ImageSizeType>('1K');
  const [visualAnchor, setVisualAnchor] = useState(ARCHETYPES[0].anchor);
  const [lowLatencyMode, setLowLatencyMode] = useState(false);

  const handleArchetypeSelect = (arch: typeof ARCHETYPES[0]) => {
    setSelectedArchetype(arch);
    setGenre(arch.genre);
    setVisualAnchor(arch.anchor);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartAdventure({
      name: name.trim() || 'Vael',
      archetype: selectedArchetype.name,
      genre,
      artStyle,
      imageSize,
      visualAnchor: visualAnchor.trim(),
      lowLatencyMode,
      health: 100,
      maxHealth: 100,
      resolve: 100,
      maxResolve: 100,
      gold: 50,
      level: 1,
      experience: 0,
      autoIllustrate: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-stone-950 border border-stone-800 rounded-2xl max-w-2xl w-full p-6 text-stone-200 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="font-serif text-xl font-bold text-amber-100">
                Forge a New Infinite Adventure
              </h2>
              <p className="text-xs text-stone-400">
                Define your hero, consistent visual appearance, and narrative universe.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Hero Name & Archetype */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-stone-300 block mb-1">
                Hero Name:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 focus:outline-hidden focus:border-amber-500"
                placeholder="e.g. Vael, Kieran, Lyra..."
              />
            </div>

            <div>
              <label className="text-xs font-mono text-stone-300 block mb-1">
                Universe & Genre:
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as GenreType)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 focus:outline-hidden focus:border-amber-500"
              >
                <option value="Dark Fantasy">Dark Fantasy</option>
                <option value="Grim Cyberpunk">Grim Cyberpunk</option>
                <option value="Eldritch Gothic">Eldritch Gothic</option>
                <option value="Sci-Fi Deep Space">Sci-Fi Deep Space</option>
                <option value="Mythic Steampunk">Mythic Steampunk</option>
              </select>
            </div>
          </div>

          {/* Archetypes Pre-sets */}
          <div>
            <label className="text-xs font-mono text-stone-300 block mb-1.5">
              Select Character Archetype:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ARCHETYPES.map((arch) => (
                <button
                  type="button"
                  key={arch.name}
                  onClick={() => handleArchetypeSelect(arch)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedArchetype.name === arch.name
                      ? 'border-amber-500 bg-amber-950/40 text-amber-100'
                      : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                  }`}
                >
                  <div className="font-serif font-bold text-sm text-stone-200">
                    {arch.name}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">{arch.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Consistent Visual Anchor (Key to character visual consistency!) */}
          <div className="bg-stone-900/70 p-3.5 rounded-lg border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-300 font-semibold flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" /> Character Visual Anchor
              </span>
              <span className="text-[10px] text-stone-400 font-mono">Keeps hero identical</span>
            </div>
            <textarea
              value={visualAnchor}
              onChange={(e) => setVisualAnchor(e.target.value)}
              rows={2}
              className="w-full bg-stone-950 border border-stone-700 rounded p-2 text-xs text-stone-200 focus:outline-hidden focus:border-amber-500"
              placeholder="Physical traits, attire, hair, glowing runes, signature weapon..."
            />
            <p className="text-[11px] text-stone-500">
              This visual description is systematically embedded in every real-time scene illustration prompt so your character remains visually identical across all chapters.
            </p>
          </div>

          {/* Art Style & Image Size Affordance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-stone-300 block mb-1">
                Visual Art Style:
              </label>
              <select
                value={artStyle}
                onChange={(e) => setArtStyle(e.target.value as ArtStyleType)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 focus:outline-hidden focus:border-amber-500"
              >
                <option value="Dark Fantasy Oil Painting">Dark Fantasy Oil Painting</option>
                <option value="Grim Graphic Novel Noir">Grim Graphic Novel Noir</option>
                <option value="Retro 16-Bit Isometric RPG">Retro 16-Bit Isometric RPG</option>
                <option value="Studio Ghibli Watercolor">Studio Ghibli Watercolor</option>
                <option value="Eldritch Charcoal & Gold Leaf">Eldritch Charcoal & Gold Leaf</option>
                <option value="Cinematic Photorealistic Concept Art">Cinematic Photorealistic Concept Art</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-stone-300 block mb-1">
                Image Resolution (gemini-3-pro-image-preview):
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['1K', '2K', '4K'] as ImageSizeType[]).map((size) => (
                  <button
                    type="button"
                    key={size}
                    onClick={() => setImageSize(size)}
                    className={`py-2 text-xs font-mono rounded font-semibold border transition-all ${
                      imageSize === size
                        ? 'border-amber-400 bg-amber-950 text-amber-200'
                        : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Low-Latency Mode checkbox */}
          <div className="flex items-center justify-between p-3 bg-stone-900/60 rounded-lg border border-stone-800">
            <div>
              <span className="text-xs font-medium text-stone-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Low-Latency Turbo Mode
              </span>
              <span className="text-[11px] text-stone-400 block mt-0.5">
                Use gemini-3.1-flash-lite for near-instant chapter generation
              </span>
            </div>
            <input
              type="checkbox"
              checked={lowLatencyMode}
              onChange={(e) => setLowLatencyMode(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          <div className="pt-3 border-t border-stone-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-stone-400 hover:text-stone-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-serif font-bold text-sm rounded-lg flex items-center gap-2 shadow-lg transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Begin Chronicle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
