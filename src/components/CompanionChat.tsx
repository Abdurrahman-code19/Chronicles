import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Trash2, 
  Bot, 
  User, 
  Crown, 
  Compass, 
  Zap, 
  Sparkles,
  Info,
  X
} from 'lucide-react';
import { ChatMessage, ChatRole, GameState } from '../types';

interface CompanionChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, roleType: ChatRole, modelChoice: string) => void;
  onClearChat: () => void;
  isLoading: boolean;
  gameState: GameState;
  onClose?: () => void;
}

export const CompanionChat: React.FC<CompanionChatProps> = ({
  messages,
  onSendMessage,
  onClearChat,
  isLoading,
  gameState,
  onClose,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedRole, setSelectedRole] = useState<ChatRole>('dungeon_master');
  const [modelChoice, setModelChoice] = useState<'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite'>('gemini-3.1-pro-preview');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // When role changes, set sensible default model
  const handleRoleChange = (role: ChatRole) => {
    setSelectedRole(role);
    if (role === 'dungeon_master') {
      setModelChoice('gemini-3.1-pro-preview');
    } else if (role === 'companion') {
      setModelChoice('gemini-3.5-flash');
    } else {
      setModelChoice('gemini-3.1-flash-lite');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim(), selectedRole, modelChoice);
    setInputText('');
  };

  const getRoleDetails = (role: ChatRole) => {
    switch (role) {
      case 'dungeon_master':
        return {
          title: 'The Dungeon Master & Plot Architect',
          desc: 'Excels at complex tasks, deep cosmological lore, world causality & hidden secrets.',
          icon: Crown,
          accent: 'text-amber-300 border-amber-600/50 bg-amber-950/40',
          recommendedModel: 'gemini-3.1-pro-preview',
        };
      case 'companion':
        return {
          title: 'Traveling Companion & Familiar',
          desc: 'General tasks: in-character dialogue, personal banter, travel camaraderie & field advice.',
          icon: Compass,
          accent: 'text-sky-300 border-sky-600/50 bg-sky-950/40',
          recommendedModel: 'gemini-3.5-flash',
        };
      case 'lorekeeper':
        return {
          title: 'Quick Lorekeeper & Tactician',
          desc: 'Tasks that should happen fast: low-latency checks, stats, monster traits & rules.',
          icon: Zap,
          accent: 'text-emerald-300 border-emerald-600/50 bg-emerald-950/40',
          recommendedModel: 'gemini-3.1-flash-lite',
        };
    }
  };

  const currentRoleInfo = getRoleDetails(selectedRole);

  const starterPrompts = [
    `Tell me the hidden history of ${gameState.currentBeatIndex >= 0 ? gameState.storyBeats[gameState.currentBeatIndex]?.location : 'this realm'}.`,
    `What are the tactical advantages and risks of our active quest "${gameState.currentQuest?.title}"?`,
    `Inspect my carried items and advise which gear is best suited for impending perils.`,
  ];

  return (
    <div className="flex flex-col h-full bg-stone-950 text-stone-200 border-l border-stone-800">
      {/* Header */}
      <div className="p-4 border-b border-stone-800 bg-stone-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-serif font-bold text-sm text-stone-100">
              Oracle & Companion Chamber
            </h3>
            <p className="text-[11px] text-stone-400">
              Multi-turn conversational guide grounded in your current adventure
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              className="p-1.5 text-stone-400 hover:text-rose-400 transition-colors"
              title="Clear Thread History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-200"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Role Selection bar */}
      <div className="p-3 border-b border-stone-800/80 bg-stone-900/40 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
            Select Chatbot Persona & Role:
          </span>
          <span className="text-[10px] font-mono text-amber-400">
            {modelChoice}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {(['dungeon_master', 'companion', 'lorekeeper'] as ChatRole[]).map((r) => {
            const info = getRoleDetails(r);
            const Icon = info.icon;
            const isSelected = selectedRole === r;
            return (
              <button
                key={r}
                onClick={() => handleRoleChange(r)}
                className={`py-1.5 px-2 rounded text-xs flex flex-col items-center gap-1 border transition-all ${
                  isSelected
                    ? `${info.accent} font-semibold shadow-xs`
                    : 'border-stone-800 bg-stone-900/50 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[11px] truncate w-full text-center">
                  {r === 'dungeon_master' ? 'DM' : r === 'companion' ? 'Companion' : 'Lorekeeper'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Model Selector affordance */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-stone-400 font-mono">Engine Model:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setModelChoice('gemini-3.1-pro-preview')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                modelChoice === 'gemini-3.1-pro-preview'
                  ? 'bg-amber-950 border-amber-500 text-amber-200'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
              title="gemini-3.1-pro-preview for particularly complex tasks"
            >
              Pro (Complex)
            </button>
            <button
              onClick={() => setModelChoice('gemini-3.5-flash')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                modelChoice === 'gemini-3.5-flash'
                  ? 'bg-amber-950 border-amber-500 text-amber-200'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
              title="gemini-3.5-flash for general tasks"
            >
              Flash (General)
            </button>
            <button
              onClick={() => setModelChoice('gemini-3.1-flash-lite')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                modelChoice === 'gemini-3.1-flash-lite'
                  ? 'bg-amber-950 border-amber-500 text-amber-200'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
              title="gemini-3.1-flash-lite for tasks that should happen fast"
            >
              Lite (Fast)
            </button>
          </div>
        </div>

        <p className="text-[10px] text-stone-400 italic">
          {currentRoleInfo.desc}
        </p>
      </div>

      {/* Messages Scrollable Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="py-8 px-4 text-center space-y-3">
            <Bot className="w-8 h-8 mx-auto text-stone-600" />
            <h4 className="font-serif text-sm font-semibold text-stone-300">
              The Thread Awaits Your Inquiry
            </h4>
            <p className="text-xs text-stone-400 max-w-xs mx-auto">
              Ask about obscure lore, request tactical counsel, or commune with your familiar.
            </p>

            <div className="pt-3 space-y-2 max-w-sm mx-auto">
              <span className="text-[10px] font-mono text-stone-500 uppercase block">
                Suggested Inquiries:
              </span>
              {starterPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(prompt, selectedRole, modelChoice)}
                  className="w-full text-left text-xs p-2 rounded bg-stone-900/70 hover:bg-stone-900 border border-stone-800/80 text-stone-300 hover:text-amber-200 transition-colors"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-stone-500 font-mono">
                  {isUser ? (
                    <>
                      <span>{gameState.player.name}</span>
                      <User className="w-3 h-3 text-stone-400" />
                    </>
                  ) : (
                    <>
                      <Bot className="w-3 h-3 text-amber-400" />
                      <span className="text-amber-300/80 capitalize">
                        {msg.roleType.replace('_', ' ')}
                      </span>
                      <span>• {msg.modelUsed}</span>
                    </>
                  )}
                </div>
                <div
                  className={`p-3 rounded-xl max-w-[88%] text-xs leading-relaxed ${
                    isUser
                      ? 'bg-amber-950/70 border border-amber-600/40 text-amber-100 rounded-tr-none'
                      : 'bg-stone-900/90 border border-stone-800 text-stone-200 rounded-tl-none font-serif text-[13px]'
                  }`}
                >
                  {msg.text.split('\n\n').map((para, i) => (
                    <p key={i} className="mb-2 last:mb-0">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-stone-900/50 rounded-lg text-xs text-stone-400 border border-stone-800/60 animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>Consulting the ether with {modelChoice}...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-stone-800 bg-stone-900/80">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder={`Ask ${selectedRole.replace('_', ' ')}...`}
            className="flex-1 bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-hidden focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-lg font-medium text-xs disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
