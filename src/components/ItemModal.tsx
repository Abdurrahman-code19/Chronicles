import React from 'react';
import { X, Shield, Sparkles, MessageSquare, Info } from 'lucide-react';
import { InventoryItem } from '../types';

interface ItemModalProps {
  item: InventoryItem | null;
  onClose: () => void;
  onToggleEquip: (itemId: string) => void;
  onAskAboutItem: (itemName: string) => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  item,
  onClose,
  onToggleEquip,
  onAskAboutItem,
}) => {
  if (!item) return null;

  const getRarityColor = (rarity: InventoryItem['rarity']) => {
    switch (rarity) {
      case 'eldritch':
        return 'text-purple-400 border-purple-600 bg-purple-950/50';
      case 'legendary':
        return 'text-amber-400 border-amber-600 bg-amber-950/50';
      case 'epic':
        return 'text-indigo-400 border-indigo-600 bg-indigo-950/50';
      case 'rare':
        return 'text-cyan-400 border-cyan-600 bg-cyan-950/50';
      default:
        return 'text-stone-300 border-stone-600 bg-stone-900/50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-stone-950 border border-stone-800 rounded-xl max-w-md w-full p-6 text-stone-200 shadow-2xl space-y-4">
        <div className="flex items-start justify-between border-b border-stone-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-bold text-amber-100">
                {item.name}
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-mono ${getRarityColor(item.rarity)}`}>
                {item.rarity}
              </span>
            </div>
            <p className="text-xs text-stone-400 capitalize mt-0.5">
              Category: {item.category} • Quantity: {item.quantity}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wide block mb-1">
              Description & Lore:
            </span>
            <p className="text-xs text-stone-300 leading-relaxed bg-stone-900/60 p-3 rounded-lg border border-stone-800/80">
              {item.description}
            </p>
          </div>

          {item.statsOrEffect && (
            <div>
              <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wide block mb-1">
                Magical / Tactical Properties:
              </span>
              <p className="text-xs text-emerald-400 font-mono bg-stone-900/60 p-2.5 rounded-lg border border-emerald-950/50">
                ✦ {item.statsOrEffect}
              </p>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-stone-800 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              onAskAboutItem(item.name);
              onClose();
            }}
            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 rounded text-xs flex items-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            Ask Lorekeeper
          </button>

          <button
            onClick={() => onToggleEquip(item.id)}
            className={`px-4 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
              item.isEquipped
                ? 'bg-amber-900/80 hover:bg-amber-800 text-amber-200 border border-amber-600'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            {item.isEquipped ? 'Unequip Artifact' : 'Equip Artifact'}
          </button>
        </div>
      </div>
    </div>
  );
};
