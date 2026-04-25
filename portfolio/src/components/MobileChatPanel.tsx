import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Paperclip, Plus, File as FileIcon } from 'lucide-react';
import { createChatSession } from '../lib/gemini';
import type { Attachment } from './LandingPage';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: Attachment[];
}

const STARTER_PROMPTS = [
  { label: '👋 Who is Sai Charan?', prompt: 'Tell me about Sai Charan' },
  { label: '🛠️ What does he design?', prompt: 'What kind of products does Sai Charan design?' },
  { label: '🚀 Show me projects', prompt: 'What are his recent projects?' },
];

function useTypewriter(text: string, speed = 12) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);
  const textRef = useRef(text);

  useEffect(() => {
    if (text !== textRef.current) {
      setDisplayed('');
      setDone(false);
      indexRef.current = 0;
      textRef.current = text;
    }
    if (indexRef.current >= text.length) {
      if (!done) { setDisplayed(text); setDone(true); }
      return;
    }
    const timer = setInterval(() => {
      indexRef.current++;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) { clearInterval(timer); setDone(true); }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, done]);

  return { displayed, done };
}

function ChatBubble({ message, isLatest }: { message: ChatMessage; isLatest: boolean }) {
  const isUser = message.role === 'user';
  const { displayed, done } = useTypewriter(message.content, isLatest && !isUser ? 12 : 0);
  const showText = isUser || !isLatest ? message.content : displayed;

  return (
    <motion.div
      initial={isLatest ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      layout={false}
      className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}
    >
      {isUser && message.attachments && message.attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-end max-w-[85%]">
          {message.attachments.map((att, idx) => (
            <div key={idx} className="rounded-xl overflow-hidden border border-white/[0.08] bg-[#191a1b]">
              {att.mimeType.startsWith('image/') && att.previewUrl ? (
                <img src={att.previewUrl} alt="attachment" className="w-auto h-20 object-cover" />
              ) : (
                <div className="flex items-center gap-2 px-3 py-2">
                  <FileIcon className="w-4 h-4 text-[#7170ff]" />
                  <span className="text-xs text-[#d0d6e0] truncate max-w-[100px]">{att.file.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-[#5e6ad2] text-white'
            : 'bg-[#191a1b] text-[#d0d6e0] border border-white/[0.08]'
        }`}
      >
        <div className="whitespace-pre-wrap">
          {showText.split('**').map((part, i) =>
            i % 2 === 1
              ? <span key={i} className="font-bold text-white">{part}</span>
              : <span key={i}>{part}</span>
          )}
        </div>
        {!isUser && isLatest && !done && (
          <span className="inline-block w-2 h-4 bg-[#7170ff] ml-0.5 animate-pulse rounded-sm" />
        )}
      </div>
    </motion.div>
  );
}

interface Props {
  dockHeight: number;
  onClose: () => void;
}

export default function MobileChatPanel({ dockHeight, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chatSessionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Init Gemini session
  useEffect(() => {
    createChatSession('explore').then(session => {
      chatSessionRef.current = session;
    });
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = useCallback(async (text: string, atts: Attachment[] = []) => {
    if (!text.trim() && atts.length === 0) return;
    if (!chatSessionRef.current) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      attachments: atts.length > 0 ? atts : undefined,
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setAttachments([]);
    setIsTyping(true);

    try {
      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
      if (text.trim()) parts.push({ text: text.trim() });
      atts.forEach(att => parts.push({ inlineData: { mimeType: att.mimeType, data: att.base64Data } }));

      const result = await chatSessionRef.current.sendMessage(parts);
      const responseText = result.response.text();

      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: responseText,
      }]);
    } catch (err) {
      console.error('Chat error', err);
      setMessages(prev => [...prev, {
        id: `a-err-${Date.now()}`,
        role: 'assistant',
        content: "Hmm, something went wrong. Try again?",
      }]);
    } finally {
      setIsTyping(false);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue, attachments);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const processed = await Promise.all(files.map(async (file) => {
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const result = ev.target?.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(file);
      });
      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
      return { file, base64Data, mimeType: file.type, previewUrl };
    }));
    setAttachments(prev => [...prev, ...processed]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isEmpty = messages.length === 0;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      className="fixed inset-0 z-[45] flex flex-col bg-[#08090a]"
      style={{
        paddingBottom: `calc(${dockHeight}px + env(safe-area-inset-bottom, 0px) + 8px)`,
        overflowX: 'hidden',
      }}
    >
      {/* Handle + header */}
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#5e6ad2]/15 flex items-center justify-center">
            <span className="text-sm">🚀</span>
          </div>
          <div>
            <p className="text-sm font-[510] text-[#f7f8f8]">Ask Sai's AI</p>
            <p className="text-[10px] text-[#62666d]">Powered by Gemini</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => {
              setMessages([]);
              setInputValue('');
              setAttachments([]);
              createChatSession('explore').then(session => {
                chatSessionRef.current = session;
              });
            }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center"
            title="New chat"
          >
            <Plus className="w-4 h-4 text-[#8a8f98]" />
          </motion.button>
          <motion.button
            onClick={onClose}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center"
          >
            <X className="w-4 h-4 text-[#8a8f98]" />
          </motion.button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-scroll px-4 py-4 flex flex-col gap-3 min-h-0 mobile-smooth-scroll">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
            <div className="text-center">
              <p className="text-4xl mb-3">👋</p>
              <p className="text-sm font-[510] text-[#f7f8f8]">Hey there!</p>
              <p className="text-xs text-[#62666d] mt-1">Ask me anything about Sai Charan</p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              {STARTER_PROMPTS.map((sp) => (
                <motion.button
                  key={sp.label}
                  onClick={() => sendMessage(sp.prompt)}
                  whileTap={{ scale: 0.97 }}
                  className="w-full text-left px-4 py-3 rounded-xl border border-white/[0.08] bg-[#0f1011] text-sm text-[#8a8f98]"
                >
                  {sp.label}
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <ChatBubble key={msg.id} message={msg} isLatest={idx === messages.length - 1} />
            ))}
            {isTyping && (
              <div className="flex items-center gap-1.5 bg-[#191a1b] rounded-2xl px-4 py-3 self-start border border-white/[0.08]">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#7170ff]"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            )}
            <div ref={chatEndRef} />
          </>
        )}
      </div>

      {/* Attachment previews */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex gap-2 px-4 py-2 border-t border-white/[0.08] overflow-x-auto mobile-smooth-scroll-x"
          >
            {attachments.map((att, idx) => (
              <div key={idx} className="relative flex-shrink-0">
                {att.mimeType.startsWith('image/') && att.previewUrl ? (
                  <img src={att.previewUrl} alt="preview" className="w-14 h-14 rounded-lg object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-[#191a1b] border border-white/[0.08] flex items-center justify-center">
                    <FileIcon className="w-5 h-5 text-[#7170ff]" />
                  </div>
                )}
                <button
                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center"
                >
                  <X className="w-2.5 h-2.5 text-white" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div className="flex items-end gap-2 px-4 py-3 border-t border-white/[0.08] flex-shrink-0">
        <input ref={fileInputRef} type="file" className="hidden" multiple onChange={handleFileChange} />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => fileInputRef.current?.click()}
          className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center flex-shrink-0 mb-0.5"
        >
          <Paperclip className="w-4 h-4 text-[#8a8f98]" />
        </motion.button>

        <div className="flex-1 flex items-end bg-[#0f1011] border border-white/[0.08] rounded-xl px-3 py-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything…"
            rows={1}
            className="flex-1 bg-transparent text-sm text-[#f7f8f8] placeholder-[#62666d] resize-none outline-none leading-5 max-h-24"
            style={{ minHeight: 20, overflowX: 'hidden' }}
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => sendMessage(inputValue, attachments)}
          disabled={!inputValue.trim() && attachments.length === 0}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mb-0.5 transition-colors"
          style={{
            backgroundColor: (inputValue.trim() || attachments.length > 0) ? '#5e6ad2' : 'rgba(255,255,255,0.05)',
          }}
        >
          <Send className="w-4 h-4 text-white" />
        </motion.button>
      </div>
    </motion.div>
  );
}
