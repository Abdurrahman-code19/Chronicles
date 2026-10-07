import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Compass, 
  Send, 
  RefreshCw, 
  Maximize2, 
  X, 
  Dice5, 
  AlertTriangle, 
  GitBranch, 
  ChevronLeft, 
  ChevronRight, 
  Image as ImageIcon,
  Zap,
  BookOpen
} from 'lucide-react';
import { StoryBeat, StoryChoice, ImageSizeType } from '../types';

interface StoryViewProps {
  currentBeat: StoryBeat | null;
  allBeats: StoryBeat[];
  currentBeatIndex: number;
  onSelectChoice: (choiceText: string) => void;
  onCustomAction: (customText: string) => void;
  onGenerateImageForBeat: (beatId: string) => void;
  onNavigateBeat: (index: number) => void;
  isGeneratingTurn: boolean;
  isGeneratingImage: boolean;
  imageSize: ImageSizeType;
  lowLatencyMode: boolean;
}

export const StoryView: React.FC<StoryViewProps> = ({
  currentBeat,
  allBeats,
  currentBeatIndex,
  onSelectChoice,
  onCustomAction,
  onGenerateImageForBeat,
  onNavigateBeat,
  isGeneratingTurn,
  isGeneratingImage,
  imageSize,
  lowLatencyMode,
}) => {
  const [customActionText, setCustomActionText] = useState('');
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customActionText.trim() || isGeneratingTurn) return;
    onCustomAction(customActionText.trim());
    setCustomActionText('');
  };

  const getRiskColor = (risk: StoryChoice['riskLevel']) => {
    switch (risk) {
      case 'unfathomable':
        return 'text-rose-400 border-rose-600/60 bg-rose-950/40 hover:bg-rose-900/50 hover:border-rose-500';
      case 'perilous':
        return 'text-amber-400 border-amber-600/60 bg-amber-950/40 hover:bg-amber-900/50 hover:border-amber-500';
      case 'moderate':
        return 'text-sky-300 border-sky-600/50 bg-sky-950/30 hover:bg-sky-900/40 hover:border-sky-400';
      default:
        return 'text-emerald-300 border-emerald-600/50 bg-emerald-950/30 hover:bg-emerald-900/40 hover:border-emerald-400';
    }
  };

  const getIntentBadge = (tag: StoryChoice['intentTag']) => {
    switch (tag) {
      case 'aggressive':
        return 'bg-red-950/80 text-red-300 border-red-800';
      case 'diplomatic':
        return 'bg-blue-950/80 text-blue-300 border-blue-800';
      case 'stealthy':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      case 'arcane':
        return 'bg-purple-950/80 text-purple-300 border-purple-800';
      case 'investigative':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800';
      default:
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
    }
  };

  if (!currentBeat) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-stone-400">
        <div className="text-center space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-amber-400 animate-pulse" />
          <p className="font-serif text-lg">Inscribing the first chapter into the Chronicle...</p>
        </div>
      </div>
    );
  }

  const isViewingLatest = currentBeatIndex === allBeats.length - 1;

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-stone-900 text-stone-200">
      {/* Chapter Top Bar */}
      <div className="px-6 py-3 border-b border-stone-800 bg-stone-950/70 backdrop-blur-xs flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/50 text-amber-300">
            Chapter {currentBeat.turnNumber}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-stone-400 font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>{currentBeat.location}</span>
          </div>
        </div>

        {/* Turn Navigation & Mode indicators */}
        <div className="flex items-center gap-2">
          {lowLatencyMode && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-600/40">
              <Zap className="w-3 h-3 text-emerald-400" /> Turbo Mode (gemini-3.1-flash-lite)
            </span>
          )}

          {allBeats.length > 1 && (
            <div className="flex items-center gap-1 text-xs bg-stone-900 border border-stone-800 rounded px-1.5 py-0.5">
              <button
                disabled={currentBeatIndex === 0}
                onClick={() => onNavigateBeat(currentBeatIndex - 1)}
                className="p-1 hover:text-amber-300 disabled:opacity-30"
                title="Previous Chapter"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] text-stone-400">
                {currentBeatIndex + 1} / {allBeats.length}
              </span>
              <button
                disabled={isViewingLatest}
                onClick={() => onNavigateBeat(currentBeatIndex + 1)}
                className="p-1 hover:text-amber-300 disabled:opacity-30"
                title="Next Chapter"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl w-full mx-auto p-6 md:p-8 space-y-6">
        {/* Previous Choice Consequence Banner */}
        {currentBeat.playerActionTaken && (
          <div className="bg-stone-950/90 border-l-2 border-amber-500/80 p-3.5 rounded-r-lg shadow-sm space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <GitBranch className="w-3.5 h-3.5" />
              <span>Prior Action: "{currentBeat.playerActionTaken}"</span>
            </div>
            {currentBeat.consequenceAnalysis && (
              <p className="text-xs text-stone-300 italic pl-5">
                ↳ {currentBeat.consequenceAnalysis}
              </p>
            )}
          </div>
        )}

        {/* Dice Check Indicator (if resolved) */}
        {currentBeat.diceRoll && (
          <div className="flex items-center gap-2 text-xs bg-stone-950/80 border border-stone-800 p-2.5 rounded-lg">
            <Dice5 className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-stone-300">
              Check ({currentBeat.diceRoll.statUsed}): Rolled{' '}
              <strong className="text-amber-300">{currentBeat.diceRoll.roll}</strong> vs DC{' '}
              {currentBeat.diceRoll.threshold}
            </span>
            <span
              className={`ml-auto px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                currentBeat.diceRoll.passed
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                  : 'bg-rose-950 text-rose-300 border border-rose-600/50'
              }`}
            >
              {currentBeat.diceRoll.passed ? 'Success' : 'Complication'}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-amber-100">
          {currentBeat.title}
        </h1>

        {/* Scene Illustration with gemini-3-pro-image-preview */}
        {currentBeat.imageUrl ? (
          <div className="relative group rounded-xl overflow-hidden border border-stone-700/80 bg-stone-950 shadow-2xl">
            <img
              src={currentBeat.imageUrl}
              alt={currentBeat.title}
              className="w-full max-h-[440px] object-cover transition-transform duration-500 group-hover:scale-[1.01]"
            />
            {/* Resolution Tag & Controls */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-amber-300 border border-amber-500/40">
                {imageSize} Resolution
              </span>
              <button
                onClick={() => setSelectedImageModal(currentBeat.imageUrl || null)}
                className="p-1.5 rounded bg-black/75 hover:bg-black text-stone-300 hover:text-white border border-stone-700 transition-colors"
                title="Expand Full View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={isGeneratingImage}
                onClick={() => onGenerateImageForBeat(currentBeat.id)}
                className="p-1.5 rounded bg-black/75 hover:bg-black text-stone-300 hover:text-amber-300 border border-stone-700 transition-colors"
                title="Re-render Scene"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingImage ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-stone-950/60 rounded-xl border border-dashed border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-stone-400 text-xs">
              <ImageIcon className="w-5 h-5 text-stone-500" />
              <span>Scene artwork not rendered yet ({imageSize} with gemini-3-pro-image-preview)</span>
            </div>
            <button
              disabled={isGeneratingImage}
              onClick={() => onGenerateImageForBeat(currentBeat.id)}
              className="px-3 py-1.5 bg-amber-950/70 hover:bg-amber-900 border border-amber-600/50 text-amber-200 text-xs rounded flex items-center gap-1.5 font-medium transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {isGeneratingImage ? 'Rendering...' : 'Illustrate Scene'}
            </button>
          </div>
        )}

        {/* Narrative Prose */}
        <div className="prose prose-invert max-w-none font-serif text-stone-200 leading-relaxed text-base md:text-lg space-y-4 pt-2">
          {currentBeat.narrative.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="first-letter:text-3xl first-letter:font-bold first-letter:text-amber-300 first-letter:mr-1 first-letter:float-left">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Emergent Choices Section */}
        {isViewingLatest && (
          <div className="pt-6 border-t border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-amber-200 flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400" />
                <span>What is your course of action?</span>
              </h2>
              <span className="text-[11px] font-mono text-stone-400">
                Choices shape subsequent events permanently
              </span>
            </div>

            {/* Structured Choices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentBeat.choices.map((choice) => (
                <button
                  key={choice.id}
                  disabled={isGeneratingTurn}
                  onClick={() => onSelectChoice(choice.text)}
                  className={`p-3.5 rounded-lg border text-left transition-all duration-200 flex flex-col justify-between gap-2.5 shadow-sm group disabled:opacity-50 disabled:pointer-events-none ${getRiskColor(
                    choice.riskLevel
                  )}`}
                >
                  <span className="font-serif text-sm font-medium leading-snug group-hover:text-amber-100 transition-colors">
                    {choice.text}
                  </span>
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className={`px-2 py-0.5 rounded border uppercase ${getIntentBadge(choice.intentTag)}`}>
                      {choice.intentTag}
                    </span>
                    <span className="uppercase tracking-wider font-semibold opacity-80">
                      Risk: {choice.riskLevel}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Action Input (Infinite Freedom) */}
            <div className="pt-2">
              <form onSubmit={handleCustomSubmit} className="relative">
                <input
                  type="text"
                  value={customActionText}
                  onChange={(e) => setCustomActionText(e.target.value)}
                  disabled={isGeneratingTurn}
                  placeholder="Or forge your own destiny: type any action, spell, or dialogue..."
                  className="w-full bg-stone-950 border border-stone-700/80 rounded-lg pl-4 pr-12 py-3 text-sm text-stone-200 placeholder-stone-500 focus:outline-hidden focus:border-amber-500 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!customActionText.trim() || isGeneratingTurn}
                  className="absolute right-2 top-2 p-2 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-md disabled:opacity-40 disabled:hover:bg-amber-600 transition-colors"
                  title="Execute custom action"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <p className="text-[11px] text-stone-500 mt-1.5 pl-1">
                The game engine analyzes any freeform action and computes real emergent narrative consequences.
              </p>
            </div>
          </div>
        )}

        {!isViewingLatest && (
          <div className="p-4 bg-stone-950/70 border border-stone-800 rounded-lg flex items-center justify-between text-xs text-stone-400">
            <span>You are viewing past chapter {currentBeatIndex + 1}.</span>
            <button
              onClick={() => onNavigateBeat(allBeats.length - 1)}
              className="px-3 py-1 bg-amber-950 text-amber-300 border border-amber-600/50 rounded font-medium hover:bg-amber-900 transition-colors"
            >
              Jump to Current Beat
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Image Modal */}
      {selectedImageModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setSelectedImageModal(null)}
              className="absolute -top-10 right-0 p-2 text-stone-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImageModal}
              alt="Scene preview"
              className="max-h-[85vh] w-auto rounded-lg shadow-2xl object-contain border border-stone-800"
            />
            <div className="text-xs text-stone-400 mt-2 font-mono">
              Rendered with gemini-3-pro-image-preview • {imageSize} Resolution
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
