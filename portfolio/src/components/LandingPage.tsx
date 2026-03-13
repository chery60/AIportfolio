import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { Sparkles, Download, ExternalLink, ArrowDown, Briefcase, Compass, ChevronDown, Check, X, File as FileIcon, MessageCircle, ArrowLeft } from 'lucide-react';
import Character from './Canvas/Character';
import { createChatSession, type ChatIntent } from '../lib/gemini';
import { saveConversationLog } from '../lib/analytics';
import { useIsMobile } from '../hooks/useIsMobile';

// ── Persona & Local Data ────────────────────────────────────────────────────────────
const PERSONA = {
    name: 'Sai Charan',
    role: 'Product Designer',
    bio: 'I design systems that make complex things simple. From enterprise kiosks to AI-powered tools — I craft experiences that delight users and drive business outcomes.',
    codeLiner: 'const passion = "Designing for humans, powered by AI"',
};

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    attachments?: Attachment[];
}

export interface Attachment {
    file: File;
    base64Data: string;
    mimeType: string;
    previewUrl?: string; // For images
}

const STARTER_PROMPTS = [
    { label: '👋 Who is Sai Charan?', prompt: 'Tell me about Sai Charan' },
    { label: '🛠️ What does he design?', prompt: 'What kind of products does Sai Charan design?' },
    { label: '🚀 Show me projects', prompt: 'What are his recent projects?' },
];

const RECRUITER_QUESTIONS = [
    { id: 'exp', label: '/experience', text: 'Can you walk me through your most relevant experience for this role?' },
    { id: 'process', label: '/process', text: 'What is your typical design process from concept to handoff?' },
    { id: 'impact', label: '/impact', text: 'What project are you most proud of and what was its business impact?' },
    { id: 'challenge', label: '/challenge', text: 'Tell me about a time you faced a significant design challenge and how you overcame it.' },
    { id: 'tools', label: '/tools', text: 'What design and prototyping tools are you most proficient in?' }
];
// ── Typing Animation Hook ───────────────────────────────────────────────────
function useTypewriter(text: string, speed = 12) {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);
    const indexRef = useRef(0);
    const textRef = useRef(text);

    useEffect(() => {
        // Only reset if the text actually changed to a brand new text
        // This prevents re-renders from restarting the typing animation midway
        if (text !== textRef.current) {
            setDisplayed('');
            setDone(false);
            indexRef.current = 0;
            textRef.current = text;
        }

        // If we've already done typing this text, just return
        if (indexRef.current >= text.length) {
            if (!done) {
                setDisplayed(text);
                setDone(true);
            }
            return;
        }

        const timer = setInterval(() => {
            indexRef.current++;
            setDisplayed(text.slice(0, indexRef.current));

            if (indexRef.current >= text.length) {
                clearInterval(timer);
                setDone(true);
            }
        }, speed);

        return () => clearInterval(timer);
    }, [text, speed, done]);

    return { displayed, done };
}

// ── Chat Message Bubble ─────────────────────────────────────────────────────
function ChatBubble({
    message,
    isLatest,
}: {
    message: ChatMessage;
    isLatest: boolean;
}) {
    const isUser = message.role === 'user';
    const { displayed, done } = useTypewriter(
        message.content,
        isLatest && !isUser ? 12 : 0
    );
    const showText = isUser || !isLatest ? message.content : displayed;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}
        >
            {/* Render User Attachments */}
            {isUser && message.attachments && message.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-end max-w-[85%]">
                    {message.attachments.map((att, idx) => (
                        <div key={idx} className="relative rounded-xl overflow-hidden border border-white/10 bg-[#1A1B2E]">
                            {att.mimeType.startsWith('image/') && att.previewUrl ? (
                                <img src={att.previewUrl} alt="attachment" className="w-auto h-24 object-cover" />
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-2 h-12">
                                    <FileIcon className="w-4 h-4 text-[#7C5CFC]" />
                                    <span className="text-xs text-[#E4E4E5] truncate max-w-[120px]">{att.file.name}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser
                    ? 'bg-gradient-to-r from-[#7C5CFC] to-[#9D7BFF] text-white'
                    : 'bg-[#1A1B2E] text-[#C8CAE5] border border-white/5'
                    }`}
            >
                <div className="whitespace-pre-wrap">
                    {showText.split('**').map((part, i) =>
                        i % 2 === 1 ? (
                            <span key={i} className="font-bold text-white">
                                {part}
                            </span>
                        ) : (
                            <span key={i}>{part}</span>
                        )
                    )}
                </div>
                {!isUser && isLatest && !done && (
                    <span className="inline-block w-2 h-4 bg-[#7C5CFC] ml-0.5 animate-pulse rounded-sm" />
                )}
            </div>
        </motion.div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// ═════════════════════════════════════════════════════════════════════════════
interface LandingPageProps {
    onEnterCanvas: () => void;
}

export default function LandingPage({ onEnterCanvas }: LandingPageProps) {
    const isMobile = useIsMobile();
    const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // AI Integration
    const [intent, setIntent] = useState<ChatIntent>('explore');
    const [isIntentDropdownOpen, setIsIntentDropdownOpen] = useState(false);

    // Slash commands
    const [isSlashMenuOpen, setIsSlashMenuOpen] = useState(false);
    const [slashIndex, setSlashIndex] = useState(0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatSessionRef = useRef<any>(null);
    const messagesRef = useRef<ChatMessage[]>([]); // To access latest in unmount
    const hasSavedRef = useRef(false);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const rightPanelRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const landingRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 200, y: 300 });

    // Scroll Transition State
    const rawProgress = useMotionValue(0);
    const progress = useSpring(rawProgress, { stiffness: 120, damping: 20 });
    const hasTriggeredEnter = useRef(false);

    // Transforms for main intro content mapping from progress [0..1]
    const contentScale = useTransform(progress, [0, 0.9], [1, 0.85]);
    const contentY = useTransform(progress, [0, 0.9], ["0vh", "-15vh"]);
    const contentOpacity = useTransform(progress, [0, 0.7], [1, 0]);

    // Transforms for Canvas Preview mapping from progress [0..1]
    const canvasScale = useTransform(progress, [0, 1], [0.35, 1]);
    const canvasY = useTransform(progress, [0, 1], ["75vh", "0vh"]);
    const canvasOpacity = useTransform(progress, [0, 0.15], [0, 1]);
    const canvasRadius = useTransform(progress, [0, 1], ["24px", "0px"]);

    // Touch tracking for mobile swipe-to-canvas
    const touchStartY = useRef<number | null>(null);

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            // If the user scrolls anywhere inside the right chat panel, immediately return
            // and let the browser handle standard scrolling (i.e. chat history overflow).
            if (rightPanelRef.current && rightPanelRef.current.contains(e.target as Node)) {
                return;
            }

            // Prevent actual scrolling of the body to keep hijacked scroll
            e.preventDefault();

            let target = rawProgress.get() + e.deltaY * 0.0015;
            target = Math.max(0, Math.min(1.05, target));
            rawProgress.set(target);

            if (target >= 1 && !hasTriggeredEnter.current) {
                hasTriggeredEnter.current = true;
                setTimeout(() => {
                    onEnterCanvas();
                }, 100);
            }
        };

        // Touch handlers for mobile
        const handleTouchStart = (e: TouchEvent) => {
            if (rightPanelRef.current && rightPanelRef.current.contains(e.target as Node)) return;
            if (isMobileChatOpen) return;
            touchStartY.current = e.touches[0].clientY;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (rightPanelRef.current && rightPanelRef.current.contains(e.target as Node)) return;
            if (isMobileChatOpen) return;
            if (touchStartY.current === null) return;

            const deltaY = touchStartY.current - e.touches[0].clientY;
            if (deltaY > 0) {
                e.preventDefault();
                let target = rawProgress.get() + deltaY * 0.003;
                target = Math.max(0, Math.min(1.05, target));
                rawProgress.set(target);
                touchStartY.current = e.touches[0].clientY;

                if (target >= 1 && !hasTriggeredEnter.current) {
                    hasTriggeredEnter.current = true;
                    setTimeout(() => {
                        onEnterCanvas();
                    }, 100);
                }
            }
        };

        const handleTouchEnd = () => {
            touchStartY.current = null;
        };

        const wrapper = landingRef.current;
        if (wrapper) {
            wrapper.addEventListener('wheel', handleWheel, { passive: false });
            wrapper.addEventListener('touchstart', handleTouchStart, { passive: true });
            wrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
            wrapper.addEventListener('touchend', handleTouchEnd, { passive: true });
        }
        return () => {
            if (wrapper) {
                wrapper.removeEventListener('wheel', handleWheel);
                wrapper.removeEventListener('touchstart', handleTouchStart);
                wrapper.removeEventListener('touchmove', handleTouchMove);
                wrapper.removeEventListener('touchend', handleTouchEnd);
            }
        };
    }, [rawProgress, onEnterCanvas, isMobileChatOpen]);

    // Cleanup -> Save log
    useEffect(() => {
        return () => {
            if (!hasSavedRef.current && messagesRef.current.length > 0) {
                hasSavedRef.current = true;
                saveConversationLog(intent, messagesRef.current);
            }
        };
    }, [intent]);

    // Init Gemini
    useEffect(() => {
        let isMounted = true;
        const init = async () => {
            try {
                const session = await createChatSession(intent);
                if (isMounted) chatSessionRef.current = session;
            } catch (err) {
                console.error("Failed to init chat", err);
            }
        };
        init();
        return () => { isMounted = false; };
    }, [intent]);

    const handleIntentChange = (newIntent: ChatIntent) => {
        if (newIntent === intent) return;
        // Save current session if there are messages
        if (messages.length > 0 && !hasSavedRef.current) {
            saveConversationLog(intent, messages);
            setMessages([]);
        }
        setIntent(newIntent);
        setIsIntentDropdownOpen(false);
        hasSavedRef.current = false;
    };

    // Track mouse position for the Among Us character
    const handleLandingMouseMove = useCallback((e: React.MouseEvent) => {
        if (landingRef.current) {
            setMousePos({
                x: e.clientX,
                y: e.clientY,
            });
        }
    }, []);

    // Auto-resize textarea
    useEffect(() => {
        if (inputRef.current) {
            // Reset height to let the browser recalculate scrollHeight properly
            inputRef.current.style.height = '44px';
            const scrollHeight = inputRef.current.scrollHeight;
            // Set new height based on scrollHeight, capped at 200px max
            inputRef.current.style.height = `${Math.min(Math.max(scrollHeight, 44), 200)}px`;
        }
    }, [inputValue]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    // Extract just the base64 part
                    const base64String = reader.result.split(',')[1];
                    resolve(base64String);
                } else {
                    reject(new Error('Failed to read file ad base64'));
                }
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleFiles = async (files: FileList | File[]) => {
        const newAttachments: Attachment[] = [];
        for (const file of Array.from(files)) {
            try {
                const base64Data = await fileToBase64(file);
                let previewUrl;
                if (file.type.startsWith('image/')) {
                    previewUrl = URL.createObjectURL(file);
                }
                newAttachments.push({
                    file,
                    base64Data,
                    mimeType: file.type,
                    previewUrl,
                });
            } catch (err) {
                console.error("Error processing file", err);
            }
        }
        setAttachments(prev => [...prev, ...newAttachments]);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
        // Reset input so the same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        if (e.clipboardData.files && e.clipboardData.files.length > 0) {
            handleFiles(e.clipboardData.files);
        }
    };

    const removeAttachment = (indexToRemove: number) => {
        setAttachments(prev => {
            const up = [...prev];
            const removed = up.splice(indexToRemove, 1)[0];
            if (removed.previewUrl) {
                URL.revokeObjectURL(removed.previewUrl);
            }
            return up;
        });
    };

    const sendMessage = useCallback(
        async (text: string) => {
            if (isTyping || (!text.trim() && attachments.length === 0)) return;

            const currentAttachments = [...attachments];
            setAttachments([]); // Clear immediately for UI responsiveness

            const userMsg: ChatMessage = {
                id: `user-${Date.now()}`,
                role: 'user',
                content: text,
                attachments: currentAttachments.length > 0 ? currentAttachments : undefined
            };
            setMessages((prev) => [...prev, userMsg]);
            setInputValue('');
            if (inputRef.current) {
                inputRef.current.style.height = '44px';
                inputRef.current.focus();
            }
            setIsTyping(true);

            try {
                if (!chatSessionRef.current) {
                    chatSessionRef.current = await createChatSession(intent);
                }

                // Construct Gemini payload
                const parts: Array<string | { inlineData: { data: string, mimeType: string } }> = [];
                if (text) parts.push(text);

                for (const att of currentAttachments) {
                    parts.push({
                        inlineData: {
                            data: att.base64Data,
                            mimeType: att.mimeType
                        }
                    });
                }

                // If no parts (only spaces or empty string with no attachments), don't send
                if (parts.length === 0) {
                    setIsTyping(false);
                    return;
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const result = await chatSessionRef.current.sendMessage(parts);
                const responseText = result.response.text();

                const aiMsg: ChatMessage = {
                    id: `ai-${Date.now()}`,
                    role: 'assistant',
                    content: responseText,
                };
                setMessages((prev) => [...prev, aiMsg]);
            } catch (err: unknown) {
                console.error("Chat error", err);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const isQuotaError = (err as any)?.message?.includes('429') || (err as any)?.status === 429;
                const errorResponse = isQuotaError
                    ? "I'm currently receiving a lot of messages and have reached my quota! Please scroll down the website to view the projects Sai Charan has worked on."
                    : "Oops, something went wrong with the connection. Please try again or scroll down to view my projects.";

                setMessages((prev) => [...prev, {
                    id: `ai-err-${Date.now()}`,
                    role: 'assistant',
                    content: errorResponse
                }]);
            } finally {
                setIsTyping(false);
            }
        },
        [isTyping, intent, attachments]
    );

    const handleSend = () => {
        const text = inputValue.trim();
        if (!text && attachments.length === 0) return;
        sendMessage(text);
    };

    const filteredCommands = RECRUITER_QUESTIONS.filter(cmd =>
        cmd.label.toLowerCase().startsWith(inputValue.toLowerCase())
    );

    const handleSelectCommand = (text: string) => {
        setInputValue(text);
        setIsSlashMenuOpen(false);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (isSlashMenuOpen) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSlashIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSlashIndex((prev) => Math.max(prev - 1, 0));
                return;
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredCommands.length > 0) {
                    handleSelectCommand(filteredCommands[slashIndex].text);
                } else {
                    setIsSlashMenuOpen(false);
                }
                return;
            }
            if (e.key === 'Escape') {
                setIsSlashMenuOpen(false);
                return;
            }
        }

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setInputValue(val);

        if (val.startsWith('/')) {
            setIsSlashMenuOpen(true);
            setSlashIndex(0);
        } else {
            setIsSlashMenuOpen(false);
        }
    };

    // ── Mobile Chat Overlay Component ──────────────────────────────────
    const renderMobileChatOverlay = () => (
        <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[200] bg-[#09090B] flex flex-col"
        >
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] mobile-safe-top">
                <button
                    onClick={() => setIsMobileChatOpen(false)}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <p className="text-sm font-semibold text-[#F4F4F5]">Portfolio AI Assistant</p>
                    <p className="text-[11px] text-[#86868B]">Ask about Sai Charan's work</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {/* Chat Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scroll-smooth flex flex-col">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 gap-4 py-8">
                        <div className="w-16 h-16 relative flex items-center justify-center mb-2">
                            <div className="absolute inset-0 bg-[#4C3B73]/20 rounded-2xl blur-xl pb-2"></div>
                            <div className="w-14 h-14 rounded-2xl bg-[#2A2141] border border-[#4C3B73]/40 flex items-center justify-center relative z-10 shadow-[0_0_20px_rgba(76,59,115,0.4)]">
                                <Sparkles className="w-6 h-6 text-[#9D7BFF]" />
                            </div>
                        </div>
                        <div className="text-center mb-6">
                            <p className="text-base font-semibold text-[#F4F4F5] mb-1.5">
                                Portfolio AI Assistant
                            </p>
                            <p className="text-[13px] text-[#86868B] max-w-[280px]">
                                Ask me anything about Sai Charan's work,
                                skills, and projects.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2.5 w-full max-w-[340px]">
                            {STARTER_PROMPTS.map((sp) => (
                                <button
                                    key={sp.label}
                                    onClick={() => sendMessage(sp.prompt)}
                                    className="w-full text-left px-5 py-3.5 rounded-xl border border-white/[0.04] bg-[#121214] text-[13px] text-[#A1A1AA] hover:text-[#F4F4F5] hover:border-white/[0.08] hover:bg-[#1A1A1E] transition-all flex items-center group"
                                >
                                    <span className="group-hover:translate-x-1 inline-block transition-transform">
                                        {sp.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <AnimatePresence>
                            {messages.map((msg, idx) => (
                                <ChatBubble
                                    key={msg.id}
                                    message={msg}
                                    isLatest={idx === messages.length - 1}
                                />
                            ))}
                        </AnimatePresence>
                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex gap-1.5 px-4 py-3"
                            >
                                <div className="w-2 h-2 rounded-full bg-[#7C5CFC] animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 rounded-full bg-[#7C5CFC] animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 rounded-full bg-[#7C5CFC] animate-bounce" style={{ animationDelay: '300ms' }} />
                            </motion.div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                )}
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-[#09090B] border-t border-white/[0.06] mobile-safe-bottom">
                {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-2 pt-2 pb-1">
                        {attachments.map((att, idx) => (
                            <div key={idx} className="relative group rounded-lg overflow-hidden border border-white/10 bg-[#1A1A1E]">
                                {att.mimeType.startsWith('image/') && att.previewUrl ? (
                                    <img src={att.previewUrl} alt="preview" className="w-14 h-14 object-cover" />
                                ) : (
                                    <div className="w-14 h-14 flex flex-col items-center justify-center p-1">
                                        <FileIcon className="w-4 h-4 text-[#86868B] mb-1" />
                                        <span className="text-[8px] text-[#A1A1AA] truncate w-full text-center">{att.file.name.split('.').pop()?.toUpperCase()}</span>
                                    </div>
                                )}
                                <button
                                    onClick={() => removeAttachment(idx)}
                                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center"
                                >
                                    <X className="w-2.5 h-2.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="bg-[#121214] border border-white/[0.06] rounded-2xl relative focus-within:border-white/[0.12] transition-colors duration-200">
                    <textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        placeholder="Ask about Sai Charan..."
                        rows={1}
                        className="w-full bg-transparent text-[#E4E4E5] text-[13px] px-4 py-3 min-h-[44px] max-h-[120px] placeholder-[#71717A] resize-none outline-none leading-relaxed overflow-y-auto scrollbar-none rounded-t-2xl"
                    />
                    <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
                        <div className="flex items-center gap-2">
                            <input type="file" ref={fileInputRef} onChange={handleFileInputChange} className="hidden" multiple accept="image/*,application/pdf,.doc,.docx,.txt" />
                            <button onClick={() => fileInputRef.current?.click()} className="w-6 h-6 rounded-full flex items-center justify-center text-[#A1A1AA] hover:text-[#E4E4E5] hover:bg-white/5 transition-colors">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                            </button>
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={(!inputValue.trim() && attachments.length === 0) || isTyping}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${((inputValue.trim() || attachments.length > 0) && !isTyping)
                                    ? 'bg-white text-black hover:bg-[#E4E4E5] shadow-md'
                                    : 'bg-[#27272A] text-[#52525B] cursor-not-allowed'
                                }`}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7" /><path d="M12 19V5" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div
            ref={landingRef}
            className="fixed inset-0 z-50 overflow-hidden bg-[#0A0B0F]"
            onMouseMove={!isMobile ? handleLandingMouseMove : undefined}
        >
            {/* ── Walking Among Us Character (desktop only) ──────────── */}
            {!isMobile && (
                <div className="fixed inset-0 pointer-events-none z-[60]">
                    <Character
                        targetX={mousePos.x}
                        targetY={mousePos.y}
                        color="#7B5CFA"
                        elementBounds={[]}
                    />
                </div>
            )}

            {/* ── Mobile Chat Overlay ──────────────────────────────────── */}
            <AnimatePresence>
                {isMobile && isMobileChatOpen && renderMobileChatOverlay()}
            </AnimatePresence>

            {/* ── MAIN CONTENT LAYER (fades/scales down on scroll) ──────── */}
            <motion.div
                className="absolute inset-0 flex"
                style={{ scale: contentScale, y: contentY, opacity: contentOpacity }}
            >
                {/* Ambient background effects */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div
                        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.06]"
                        style={{
                            background:
                                'radial-gradient(circle, #7C5CFC 0%, transparent 70%)',
                        }}
                    />
                    <div
                        className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-[0.04]"
                        style={{
                            background:
                                'radial-gradient(circle, #FF6B9D 0%, transparent 70%)',
                        }}
                    />
                    {/* Grid pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage:
                                'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                            backgroundSize: '60px 60px',
                        }}
                    />
                </div>

                {/* Corner badges */}
                <div className="absolute top-6 left-6 z-10 pointer-events-none">
                    <span className="text-[11px] text-[#2A2B3C] font-mono tracking-widest">
                        PORTFOLIO.V2
                    </span>
                </div>
                <div className="absolute top-6 right-6 z-10 pointer-events-none">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[11px] text-[#2A2B3C] font-mono tracking-widest">
                            AVAILABLE FOR HIRE
                        </span>
                    </div>
                </div>

                {/* ── Layout — two-column desktop, single-column mobile ── */}
                <div className={`relative z-10 flex items-stretch w-full h-screen ${isMobile ? 'flex-col' : ''}`}>
                    {/* ═══ LEFT SECTION — Creative intro ═══ */}
                    <div className={`flex flex-col justify-center ${isMobile ? 'flex-1 px-6 pt-16' : 'flex-1 px-6 lg:px-12 xl:px-24'}`}>
                        {/* Name */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <h1 className={`${isMobile ? 'text-4xl' : 'text-5xl lg:text-6xl'} font-bold text-[#F0F0FF] tracking-tight leading-none mb-2`}>
                                {PERSONA.name}
                            </h1>
                            <p className="text-lg text-[#7C5CFC] font-semibold mb-5">
                                {PERSONA.role}
                            </p>
                        </motion.div>

                        {/* Code liner */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.55 }}
                            className="mb-5"
                        >
                            <div className="inline-flex items-center gap-2 bg-[#12131F] border border-white/5 rounded-lg px-4 py-2.5">
                                <span className="text-[#7C5CFC] font-mono text-xs">{'>'}</span>
                                <code className="text-[#8B8FAF] font-mono text-xs">
                                    <span className="text-[#C792EA]">const</span>{' '}
                                    <span className="text-[#82AAFF]">passion</span>{' '}
                                    <span className="text-[#89DDFF]">=</span>{' '}
                                    <span className="text-[#C3E88D]">
                                        "Designing for humans, powered by AI"
                                    </span>
                                </code>
                                <span className="w-2 h-4 bg-[#7C5CFC] animate-pulse rounded-sm" />
                            </div>
                        </motion.div>

                        {/* Bio */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.65 }}
                            className="text-[#6B6D8A] text-base leading-relaxed max-w-md mb-8"
                        >
                            {PERSONA.bio}
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.75 }}
                            className="flex gap-3"
                        >
                            <button className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#9D7BFF] text-white text-sm font-semibold shadow-lg shadow-[#7C5CFC]/25 hover:shadow-xl hover:shadow-[#7C5CFC]/30 hover:scale-105 transition-all active:scale-95">
                                <Download className="w-4 h-4" />
                                Download Resume
                            </button>
                            <button className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#12131F] border border-white/10 text-[#C8CAE5] text-sm font-semibold hover:bg-[#1A1B2E] hover:border-white/20 hover:scale-105 transition-all active:scale-95">
                                <ExternalLink className="w-4 h-4" />
                                View Links
                            </button>
                        </motion.div>
                    </div>

                    {/* ═══ RIGHT SECTION — AI Chat Panel (desktop only) ═══ */}
                    {!isMobile && (
                        <motion.div
                            ref={rightPanelRef}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="w-[500px] xl:w-[640px] h-full"
                        >
                            <div className="w-full h-full border-l border-white/[0.04] bg-[#09090B] flex flex-col pt-12">
                                {/* Chat messages area */}
                                <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin scroll-smooth flex flex-col">
                                    {messages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center flex-1 gap-4 py-8">
                                            <div className="w-16 h-16 relative flex items-center justify-center mb-2">
                                                <div className="absolute inset-0 bg-[#4C3B73]/20 rounded-2xl blur-xl pb-2"></div>
                                                <div className="w-14 h-14 rounded-2xl bg-[#2A2141] border border-[#4C3B73]/40 flex items-center justify-center relative z-10 shadow-[0_0_20px_rgba(76,59,115,0.4)]">
                                                    <Sparkles className="w-6 h-6 text-[#9D7BFF]" />
                                                </div>
                                            </div>
                                            <div className="text-center mb-6">
                                                <p className="text-base font-semibold text-[#F4F4F5] mb-1.5">
                                                    Portfolio AI Assistant
                                                </p>
                                                <p className="text-[13px] text-[#86868B] max-w-[280px]">
                                                    Ask me anything about Sai Charan's work,
                                                    skills, and projects.
                                                </p>
                                            </div>

                                            {/* Starter prompts */}
                                            <div className="flex flex-col gap-2.5 w-full max-w-[340px]">
                                                {STARTER_PROMPTS.map((sp) => (
                                                    <button
                                                        key={sp.label}
                                                        onClick={() => sendMessage(sp.prompt)}
                                                        className="w-full text-left px-5 py-3.5 rounded-xl border border-white/[0.04] bg-[#121214] text-[13px] text-[#A1A1AA] hover:text-[#F4F4F5] hover:border-white/[0.08] hover:bg-[#1A1A1E] transition-all flex items-center group"
                                                    >
                                                        <span className="group-hover:translate-x-1 inline-block transition-transform">
                                                            {sp.label}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-4">
                                            <AnimatePresence>
                                                {messages.map((msg, idx) => (
                                                    <ChatBubble
                                                        key={msg.id}
                                                        message={msg}
                                                        isLatest={idx === messages.length - 1}
                                                    />
                                                ))}
                                            </AnimatePresence>

                                            {isTyping && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="flex gap-1.5 px-4 py-3"
                                                >
                                                    <div className="w-2 h-2 rounded-full bg-[#7C5CFC] animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <div className="w-2 h-2 rounded-full bg-[#7C5CFC] animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <div className="w-2 h-2 rounded-full bg-[#7C5CFC] animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </motion.div>
                                            )}

                                            <div ref={chatEndRef} />
                                        </div>
                                    )}
                                </div>

                                {/* Chat input area */}
                                <div className="p-4 bg-[#09090B] flex flex-col gap-2">
                                    {/* Attachment Previews */}
                                    {attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-2 px-2 pt-2">
                                            {attachments.map((att, idx) => (
                                                <div key={idx} className="relative group rounded-lg overflow-hidden border border-white/10 bg-[#1A1A1E]">
                                                    {att.mimeType.startsWith('image/') && att.previewUrl ? (
                                                        <img src={att.previewUrl} alt="preview" className="w-16 h-16 object-cover" />
                                                    ) : (
                                                        <div className="w-16 h-16 flex flex-col items-center justify-center p-1">
                                                            <FileIcon className="w-5 h-5 text-[#86868B] mb-1" />
                                                            <span className="text-[9px] text-[#A1A1AA] truncate w-full text-center">{att.file.name.split('.').pop()?.toUpperCase() || 'FILE'}</span>
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => removeAttachment(idx)}
                                                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="bg-[#121214] border border-white/[0.06] rounded-[20px] shadow-sm relative focus-within:border-white/[0.12] transition-colors duration-200">
                                        {/* Slash command menu */}
                                        <AnimatePresence>
                                            {isSlashMenuOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute bottom-[calc(100%+8px)] left-0 w-full bg-[#121214] border border-white/[0.08] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden py-1.5 z-[100]"
                                                >
                                                    <div className="px-3 py-1.5 text-xs font-semibold text-[#86868B] uppercase tracking-wider">
                                                        Recruiter Questions
                                                    </div>
                                                    <div className="max-h-[200px] overflow-y-auto scrollbar-thin">
                                                        {filteredCommands.map((cmd, idx) => (
                                                            <button
                                                                key={cmd.id}
                                                                onMouseEnter={() => setSlashIndex(idx)}
                                                                onClick={() => handleSelectCommand(cmd.text)}
                                                                className={`w-full text-left px-3 py-2 text-[13px] flex items-center justify-between transition-colors ${slashIndex === idx
                                                                    ? 'bg-white/10 text-[#F4F4F5]'
                                                                    : 'text-[#A1A1AA] hover:bg-white/5 hover:text-[#F4F4F5]'
                                                                    }`}
                                                            >
                                                                <span className="flex flex-col gap-0.5">
                                                                    <span className="font-medium text-[#7C5CFC]">{cmd.label}</span>
                                                                    <span className="text-[11px] opacity-80 truncate max-w-[400px]">{cmd.text}</span>
                                                                </span>
                                                            </button>
                                                        ))}
                                                        {filteredCommands.length === 0 && (
                                                            <div className="px-3 py-2 text-[12px] text-[#71717A]">No commands found</div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <textarea
                                            ref={inputRef}
                                            value={inputValue}
                                            onChange={handleInputChange}
                                            onKeyDown={handleKeyDown}
                                            onPaste={handlePaste}
                                            placeholder={attachments.length > 0 ? "Add a message..." : "Describe what you want to create or type / for recruiter questions..."}
                                            rows={1}
                                            className="w-full bg-transparent text-[#E4E4E5] text-[13px] px-4 py-3 min-h-[44px] max-h-[200px] placeholder-[#71717A] resize-none outline-none leading-relaxed overflow-y-auto scrollbar-none rounded-t-[20px]"
                                        />
                                        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileInputChange}
                                                    className="hidden"
                                                    multiple
                                                    accept="image/*,application/pdf,.doc,.docx,.txt"
                                                />
                                                <button onClick={() => fileInputRef.current?.click()} className="w-6 h-6 rounded-full flex items-center justify-center text-[#A1A1AA] hover:text-[#E4E4E5] hover:bg-white/5 transition-colors">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <div
                                                        onClick={() => setIsIntentDropdownOpen(!isIntentDropdownOpen)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] text-[#A1A1AA] bg-[#1A1A1E] hover:text-[#E4E4E5] hover:bg-white/10 transition-colors cursor-pointer border border-white/[0.04]"
                                                    >
                                                        {intent === 'hire' ? <Briefcase className="w-3 h-3 text-emerald-400" /> : <Compass className="w-3 h-3 text-blue-400" />}
                                                        {intent === 'hire' ? 'Intend to Hire' : 'Just Exploring'}
                                                        <ChevronDown className={`w-3 h-3 transition-transform ${isIntentDropdownOpen ? 'rotate-180' : ''}`} />
                                                    </div>

                                                    <AnimatePresence>
                                                        {isIntentDropdownOpen && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                transition={{ duration: 0.15 }}
                                                                className="absolute bottom-[calc(100%+8px)] left-0 w-40 bg-[#121214] border border-white/[0.08] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden py-1 z-[100]"
                                                            >
                                                                <button
                                                                    onClick={() => handleIntentChange('hire')}
                                                                    className="w-full text-left px-3 py-2 text-[11px] text-[#A1A1AA] hover:bg-white/5 hover:text-[#F4F4F5] flex items-center justify-between transition-colors"
                                                                >
                                                                    <span className="flex items-center gap-2">
                                                                        <Briefcase className="w-3 h-3 text-emerald-400" /> Intend to Hire
                                                                    </span>
                                                                    {intent === 'hire' && <Check className="w-3 h-3" />}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleIntentChange('explore')}
                                                                    className="w-full text-left px-3 py-2 text-[11px] text-[#A1A1AA] hover:bg-white/5 hover:text-[#F4F4F5] flex items-center justify-between transition-colors"
                                                                >
                                                                    <span className="flex items-center gap-2">
                                                                        <Compass className="w-3 h-3 text-blue-400" /> Just Exploring
                                                                    </span>
                                                                    {intent === 'explore' && <Check className="w-3 h-3" />}
                                                                </button>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                                <button
                                                    onClick={handleSend}
                                                    disabled={(!inputValue.trim() && attachments.length === 0) || isTyping}
                                                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${((inputValue.trim() || attachments.length > 0) && !isTyping)
                                                        ? 'bg-white text-black hover:bg-[#E4E4E5] shadow-md'
                                                        : 'bg-[#27272A] text-[#52525B] cursor-not-allowed'
                                                        }`}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`${(inputValue.trim() || attachments.length > 0) && !isTyping ? 'animate-in slide-in-from-bottom-2 fade-in duration-200' : ''}`}><path d="m5 12 7-7 7 7" /><path d="M12 19V5" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* New chat button */}
                                    <div className="flex justify-center mt-3">
                                        <button
                                            onClick={() => setMessages([])}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-[#71717A] hover:text-[#A1A1AA] transition-colors"
                                        >
                                            <Sparkles className="w-3.5 h-3.5" />
                                            New chat
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* ── Scroll indicator ───────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    className={`absolute bottom-8 flex flex-col items-center gap-2 z-10 pointer-events-none ${isMobile ? 'left-1/2 -translate-x-1/2' : 'left-1/4 -translate-x-1/2'}`}
                >
                    <span className="text-[10px] text-[#8B8FAF] font-mono tracking-widest uppercase">
                        {isMobile ? 'Swipe up to explore projects' : 'Scroll to explore projects'}
                    </span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    >
                        <ArrowDown className="w-4 h-4 text-[#8B8FAF]" />
                    </motion.div>
                </motion.div>

                {/* ── Mobile Chat FAB ──────────────────────────────────────── */}
                {isMobile && !isMobileChatOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
                        onClick={() => setIsMobileChatOpen(true)}
                        className="fixed bottom-24 right-5 z-[100] w-14 h-14 rounded-full bg-gradient-to-r from-[#7C5CFC] to-[#9D7BFF] text-white flex items-center justify-center shadow-lg shadow-[#7C5CFC]/30 active:scale-90 transition-transform mobile-safe-bottom"
                    >
                        <MessageCircle className="w-6 h-6" />
                    </motion.button>
                )}
            </motion.div>

            {/* ── Canvas Preview / Scroll Transition ────────────────────── */}
            {/* Fixed wrapper holding the expanding canvas representation */}
            <div className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center overflow-hidden">
                <motion.div
                    className="w-full h-full flex flex-col bg-[#111218] border border-white/[0.06] shadow-2xl shadow-black/50 pointer-events-auto cursor-pointer group"
                    style={{
                        scale: canvasScale,
                        y: canvasY,
                        opacity: canvasOpacity,
                        borderRadius: canvasRadius,
                    }}
                    onClick={() => {
                        rawProgress.set(1);
                        setTimeout(() => onEnterCanvas(), 100);
                    }}
                >
                    <div className="flex-1 relative overflow-hidden">
                        {/* Mock canvas content inside preview */}
                        <div className="absolute inset-0">
                            {/* Grid pattern */}
                            <div
                                className="absolute inset-0 opacity-[0.04]"
                                style={{
                                    backgroundImage:
                                        'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
                                    backgroundSize: '40px 40px',
                                }}
                            />

                            {/* Mock left panel */}
                            <div className="absolute top-4 left-4 w-[180px] h-[calc(100%-32px)] bg-white/[0.03] border border-white/[0.04] rounded-xl backdrop-blur-md">
                                <div className="p-3 border-b border-white/[0.04]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#7C5CFC] to-[#FF6B9D]" />
                                        <div className="w-16 h-2 bg-white/10 rounded-full" />
                                    </div>
                                </div>
                                <div className="p-3 space-y-2">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2 p-1.5 rounded-md"
                                            style={{
                                                background: i === 1 ? 'rgba(255,255,255,0.05)' : 'transparent',
                                            }}
                                        >
                                            <div
                                                className="w-4 h-4 rounded text-[8px] flex items-center justify-center text-white/30 font-mono"
                                                style={{
                                                    background: i === 1 ? 'rgba(199,75,24,0.2)' : 'rgba(255,255,255,0.03)',
                                                }}
                                            >
                                                {i}
                                            </div>
                                            <div
                                                className="h-1.5 rounded-full bg-white/10"
                                                style={{ width: `${40 + Math.random() * 40}%` }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Mock canvas cards */}
                            <div className="absolute top-8 left-[220px] right-8 bottom-8 flex justify-center items-center">
                                <div className="w-[400px] h-[240px] rounded-xl bg-[#1A1B2E] border border-white/[0.06] p-6 shadow-xl">
                                    <div className="w-32 h-3 bg-[#C74B18]/40 rounded-full mb-4" />
                                    <div className="w-64 h-3.5 bg-white/10 rounded-full mb-3" />
                                    <div className="w-48 h-2.5 bg-white/5 rounded-full mb-6" />
                                    <div className="flex gap-2">
                                        {['#C74B18', '#F59E0B', '#10B981'].map((c) => (
                                            <div
                                                key={c}
                                                className="px-3 py-1 rounded text-[8px] font-mono"
                                                style={{
                                                    background: `${c}20`,
                                                    color: c,
                                                }}
                                            >
                                                TAG
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Magnifying overlay effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0F] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                        {/* Enter canvas CTA */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="px-6 py-3 rounded-xl bg-[#7C5CFC] text-white text-sm font-bold shadow-lg shadow-[#7C5CFC]/30 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Interactive Canvas Ready
                            </div>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="px-5 py-3 border-t border-white/[0.04] flex items-center justify-between bg-[#111218]">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400/60" />
                            <span className="text-[10px] text-[#4A4C6A] font-mono">
                                6 PROJECTS · INTERACTIVE CANVAS
                            </span>
                        </div>
                        <span className="text-[10px] text-[#3A3C5A] font-mono">
                            CLICK TO EXPLORE →
                        </span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
