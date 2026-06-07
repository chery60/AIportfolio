import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Mic, MicOff } from 'lucide-react';
import AmongUsAvatar from '../AmongUsAvatar';
import type { ChatMessage } from '../../hooks/useCharacterChat';

interface Props {
  messages: ChatMessage[];
  isLoading: boolean;
  isListening: boolean;
  characterColor: string;
  onSend: (text: string) => Promise<void>;
  onVoiceInput: () => void;
  onClose: () => void;
}

export default function CharacterChatBar({
  messages,
  isLoading,
  isListening,
  characterColor,
  onSend,
  onVoiceInput,
  onClose,
}: Props) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input on open
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput('');
    await onSend(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <motion.div
      initial={{ y: 16, opacity: 0, scale: 0.97 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 16, opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="absolute bottom-[72px] left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
      style={{ width: 380 }}
    >
      <div className="bg-white rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.16)] border border-panel-border overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-panel-border bg-surface-1">
          <div className="relative flex-shrink-0" style={{ height: 32 }}>
            <AmongUsAvatar color={characterColor} size={0.75} animated={false} />
            {/* online dot */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary leading-tight">Ask Crew</p>
            <p className="text-xs text-text-secondary truncate">About this project</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-2 transition-colors text-text-secondary hover:text-text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: 240, minHeight: 80 }}>
          {messages.length === 0 && (
            <p className="text-xs text-text-secondary text-center py-4">
              Ask me anything about this project! 👋
            </p>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'crew' && (
                <div className="flex-shrink-0 mt-0.5" style={{ height: 20 }}>
                  <AmongUsAvatar color={characterColor} size={0.45} animated={false} />
                </div>
              )}
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-snug ${
                  msg.role === 'user'
                    ? 'bg-brand text-white rounded-br-sm'
                    : 'bg-surface-1 text-text-primary rounded-bl-sm border border-panel-border'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Loading dots */}
          {isLoading && (
            <div className="flex gap-2 justify-start">
              <div className="flex-shrink-0 mt-0.5" style={{ height: 20 }}>
                <AmongUsAvatar color={characterColor} size={0.45} animated={false} />
              </div>
              <div className="bg-surface-1 border border-panel-border rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-text-secondary"
                    style={{
                      animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Listening indicator */}
          {isListening && (
            <div className="flex items-center gap-2 justify-center py-1">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              <span className="text-xs text-red-500 font-medium">Listening…</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input row */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-2.5 border-t border-panel-border">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this project…"
            disabled={isLoading}
            className="flex-1 text-sm text-text-primary placeholder:text-text-secondary bg-surface-1 rounded-full px-4 py-2 outline-none border border-panel-border focus:border-brand transition-colors disabled:opacity-50"
          />
          <button
            type="button"
            onClick={onVoiceInput}
            title={isListening ? 'Stop listening' : 'Voice input'}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-all flex-shrink-0 ${
              isListening
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-surface-1 text-text-secondary hover:bg-surface-2 hover:text-text-primary border border-panel-border'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-brand text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </motion.div>
  );
}
