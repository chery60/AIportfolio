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

const MOBILE_CHAT_FOCUS_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eef6ff]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06111c]';
const MOBILE_CHAT_GLASS_CLASS = `border border-white/[0.24] bg-[rgba(10,28,45,0.46)] text-[#f1f7ff] shadow-[0_12px_30px_rgba(5,16,28,0.16)] backdrop-blur-[30px] ${MOBILE_CHAT_FOCUS_CLASS}`;

function useTypewriter(text: string, speed = 12) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let index = 0;
    let timer: ReturnType<typeof setInterval> | undefined;

    const startTimer = window.setTimeout(() => {
      if (speed <= 0 || text.length === 0) {
        setDisplayed(text);
        setDone(true);
        return;
      }

      setDisplayed('');
      setDone(false);
      timer = setInterval(() => {
        index++;
        setDisplayed(text.slice(0, index));
        if (index >= text.length) {
          if (timer) clearInterval(timer);
          setDone(true);
        }
      }, speed);
    }, 0);

    return () => {
      window.clearTimeout(startTimer);
      if (timer) clearInterval(timer);
    };
  }, [text, speed]);

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
            <div key={idx} className="rounded-xl overflow-hidden border border-white/[0.22] bg-[rgba(10,28,45,0.46)] backdrop-blur-[30px]">
              {att.mimeType.startsWith('image/') && att.previewUrl ? (
                <img src={att.previewUrl} alt="attachment" className="w-auto h-20 object-cover" />
              ) : (
                <div className="flex items-center gap-2 px-3 py-2">
                  <FileIcon className="w-4 h-4 text-[#c9d6ff]" />
                  <span className="text-xs text-[#edf5ff] truncate max-w-[100px]">{att.file.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-[rgba(94,106,210,0.9)] text-white'
            : 'bg-[rgba(10,28,45,0.46)] text-[#f1f7ff] border border-white/[0.24] backdrop-blur-[30px]'
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
      className="fixed inset-0 z-[45] flex flex-col bg-[linear-gradient(180deg,#0c1824_0%,#08131f_54%,#050b12_100%)]"
      style={{
        paddingBottom: `calc(${dockHeight}px + env(safe-area-inset-bottom, 0px) + 8px)`,
        overflowX: 'hidden',
      }}
    >
      {/* Handle + header */}
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0 border-b border-white/[0.1] bg-white/[0.04] backdrop-blur-[24px]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#9fb7ff]/14 flex items-center justify-center border border-white/[0.18]">
            <span className="text-sm">🚀</span>
          </div>
          <div>
            <p className="text-sm font-[510] text-[#f7f8f8]">Ask Sai's AI</p>
            <p className="text-[10px] text-[#aeb7c6] font-medium">Powered by Gemini</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            onClick={() => {
              setMessages([]);
              setInputValue('');
              setAttachments([]);
              createChatSession('explore').then(session => {
                chatSessionRef.current = session;
              });
            }}
            whileTap={{ scale: 0.9 }}
            aria-label="New chat"
            className={`w-8 h-8 rounded-full bg-white/[0.07] border border-white/[0.16] flex items-center justify-center hover:bg-white/[0.14] transition-colors ${MOBILE_CHAT_FOCUS_CLASS}`}
            title="New chat"
          >
            <Plus className="w-4 h-4 text-[#d0d6e0]" />
          </motion.button>
          <motion.button
            type="button"
            onClick={onClose}
            whileTap={{ scale: 0.9 }}
            aria-label="Close chat"
            title="Close chat"
            className={`w-8 h-8 rounded-full bg-white/[0.07] border border-white/[0.16] flex items-center justify-center hover:bg-white/[0.14] transition-colors ${MOBILE_CHAT_FOCUS_CLASS}`}
          >
            <X className="w-4 h-4 text-[#d0d6e0]" />
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
              <p className="text-xs text-[#b8c2d0] font-medium mt-1">Ask me anything about Sai Charan</p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              {STARTER_PROMPTS.map((sp) => (
                <motion.button
                  type="button"
                  key={sp.label}
                  onClick={() => sendMessage(sp.prompt)}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium ${MOBILE_CHAT_GLASS_CLASS}`}
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
              <div className="flex items-center gap-1.5 bg-[rgba(10,28,45,0.46)] rounded-2xl px-4 py-3 self-start border border-white/[0.22] backdrop-blur-[30px]">
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
            className="flex gap-2 px-4 py-2 border-t border-white/[0.12] bg-white/[0.025] backdrop-blur-[24px] overflow-x-auto mobile-smooth-scroll-x"
          >
            {attachments.map((att, idx) => (
              <div key={idx} className="relative flex-shrink-0">
                {att.mimeType.startsWith('image/') && att.previewUrl ? (
                  <img src={att.previewUrl} alt="preview" className="w-14 h-14 rounded-lg object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-[rgba(10,28,45,0.46)] border border-white/[0.22] flex items-center justify-center backdrop-blur-[30px]">
                    <FileIcon className="w-5 h-5 text-[#c9d6ff]" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                  aria-label={`Remove ${att.file.name}`}
                  title={`Remove ${att.file.name}`}
                  className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center ${MOBILE_CHAT_FOCUS_CLASS}`}
                >
                  <X className="w-2.5 h-2.5 text-white" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div className="flex items-end gap-2 px-4 py-3 border-t border-white/[0.14] bg-[rgba(5,14,24,0.56)] backdrop-blur-[30px] flex-shrink-0">
        <input ref={fileInputRef} type="file" className="hidden" multiple onChange={handleFileChange} />
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach files"
          title="Attach files"
          className={`w-9 h-9 rounded-xl bg-white/[0.07] border border-white/[0.16] flex items-center justify-center flex-shrink-0 mb-0.5 hover:bg-white/[0.14] transition-colors ${MOBILE_CHAT_FOCUS_CLASS}`}
        >
          <Paperclip className="w-4 h-4 text-[#d0d6e0]" />
        </motion.button>

        <div className="flex-1 flex items-end bg-[rgba(10,28,45,0.46)] border border-white/[0.24] rounded-xl px-3 py-2 backdrop-blur-[30px] focus-within:border-white/[0.48] focus-within:ring-2 focus-within:ring-[#eef6ff]/20">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything…"
            rows={1}
            className="flex-1 bg-transparent text-sm text-[#f7f8f8] placeholder-[#d0dbea] resize-none outline-none leading-5 max-h-24"
            style={{ minHeight: 20, overflowX: 'hidden' }}
          />
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => sendMessage(inputValue, attachments)}
          disabled={!inputValue.trim() && attachments.length === 0}
          aria-label="Send message"
          title="Send message"
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mb-0.5 transition-colors ${MOBILE_CHAT_FOCUS_CLASS}`}
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
