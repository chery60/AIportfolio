import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useTransform, type MotionValue } from 'framer-motion';
import { Sparkles, Download, ExternalLink, ArrowDown, Briefcase, Compass, ChevronDown, Check, X, File as FileIcon, MessageCircle, ArrowLeft } from 'lucide-react';
import Character from './Canvas/Character';
import PixelBangaloreBackground from './PixelBangaloreBackground';
import Stack from './Stack/Stack';
import { createChatSession, generateAvatarReaction, type ChatIntent } from '../lib/gemini';
import { saveConversationLog } from '../lib/analytics';
import { useIsMobile } from '../hooks/useIsMobile';
import { useSabotage } from '../context/SabotageContext';
import { type ElementBounds } from './Canvas/Character';
import { CoolMode } from './ui/cool-mode';
import { Highlighter } from './ui/highlighter';
import { RotatingText } from './ui/rotating-text';
import { useWebHaptics } from 'web-haptics/react';

// ── Persona & Local Data ────────────────────────────────────────────────────────────
const PERSONA = {
    name: 'Sai Charan',
    role: 'Senior Product Designer',
    bio: (
        <>
            Specialist in enterprise and SaaS products. Adaptive designer with a strong passion for <Highlighter color="rgba(113,112,255,0.15)"><span className="text-white">UX Design</span></Highlighter>. I help companies design efficient experiences based on <Highlighter action="underline" color="rgba(113,112,255,0.5)"><span className="text-white">user-centric strategy</span></Highlighter>, with the aim of user and customer satisfaction. On a path to become <Highlighter action="highlight" color="rgba(130,143,255,0.15)"><span className="text-white">irreplaceable by AI</span></Highlighter> — a lifelong learner who values craft above all.
        </>
    ),
    codeLiner: 'const passion = "Designing for humans, powered by craft"',
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

const ASSISTANT_FOCUS_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eef6ff]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#27445d]';
const ASSISTANT_GLASS_BUTTON_CLASS = `border border-white/[0.34] bg-[rgba(8,24,40,0.34)] text-[#f1f7ff] shadow-[0_14px_34px_rgba(4,14,24,0.18)] backdrop-blur-[34px] hover:border-white/[0.5] hover:bg-[rgba(18,42,62,0.48)] hover:text-white ${ASSISTANT_FOCUS_CLASS}`;
const ASSISTANT_MENU_CLASS = 'bg-[rgba(8,22,36,0.74)] border border-white/[0.3] shadow-[0_22px_56px_rgba(4,12,22,0.32)] backdrop-blur-[36px]';

// ── Typing Animation Hook ───────────────────────────────────────────────────
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
                        <div key={idx} className="relative rounded-xl overflow-hidden border border-white/[0.28] bg-[rgba(8,24,40,0.38)] shadow-[0_10px_30px_rgba(5,16,28,0.16)] backdrop-blur-[30px]">
                            {att.mimeType.startsWith('image/') && att.previewUrl ? (
                                <img src={att.previewUrl} alt="attachment" className="w-auto h-24 object-cover" />
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-2 h-12">
                                    <FileIcon className="w-4 h-4 text-[#b9c7ff]" />
                                    <span className="text-xs text-[#edf5ff] truncate max-w-[120px]">{att.file.name}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser
                    ? 'bg-[rgba(94,106,210,0.9)] text-white shadow-[0_12px_34px_rgba(70,84,180,0.24)]'
                    : 'bg-[rgba(8,24,40,0.44)] text-[#f1f7ff] border border-white/[0.28] shadow-[0_12px_34px_rgba(5,16,28,0.18)] backdrop-blur-[32px]'
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
                    <span className="inline-block w-2 h-4 bg-[#7170ff] ml-0.5 animate-pulse rounded-sm" />
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
    canvasRevealRawProgress: MotionValue<number>;
    canvasRevealProgress: MotionValue<number>;
}

export default function LandingPage({
    onEnterCanvas,
    canvasRevealRawProgress,
    canvasRevealProgress,
}: LandingPageProps) {
    const { trigger } = useWebHaptics({ debug: true });
    const isMobile = useIsMobile();
    const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { isSabotaged } = useSabotage();

    // AI Integration
    const [intent, setIntent] = useState<ChatIntent>('explore');
    const [isIntentDropdownOpen, setIsIntentDropdownOpen] = useState(false);

    // Slash commands
    const [isSlashMenuOpen, setIsSlashMenuOpen] = useState(false);
    const [slashIndex, setSlashIndex] = useState(0);

    // Avatar state
    const [avatarMessage, setAvatarMessage] = useState<string | null>(null);
    const avatarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [panelBounds, setPanelBounds] = useState<ElementBounds[]>([]);

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
    const [mousePos, setMousePos] = useState({ x: 200, y: 300 });

    const hasTriggeredEnter = useRef(false);

    // Transforms for main intro content mapping from progress [0..1]
    const contentScale = useTransform(canvasRevealProgress, [0, 0.9], [1, 0.85]);
    const contentY = useTransform(canvasRevealProgress, [0, 0.9], ["0vh", "-15vh"]);
    const contentOpacity = useTransform(canvasRevealProgress, [0, 0.7], [1, 0]);

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

            let target = canvasRevealRawProgress.get() + e.deltaY * 0.0015;
            target = Math.max(0, Math.min(1.05, target));
            canvasRevealRawProgress.set(target);

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
                let target = canvasRevealRawProgress.get() + deltaY * 0.003;
                target = Math.max(0, Math.min(1.05, target));
                canvasRevealRawProgress.set(target);
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

        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });
        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [canvasRevealRawProgress, onEnterCanvas, isMobileChatOpen]);

    // Measure Right Panel bounds for Avatar collision
    useEffect(() => {
        if (!isMobile && rightPanelRef.current) {
            // Give layout a moment to settle
            const measure = () => {
                if (rightPanelRef.current) {
                    const rect = rightPanelRef.current.getBoundingClientRect();
                    setPanelBounds([{
                        x: rect.left,
                        y: rect.top,
                        width: rect.width,
                        height: rect.height
                    }]);
                }
            };
            
            measure();
            window.addEventListener('resize', measure);
            return () => window.removeEventListener('resize', measure);
        }
    }, [isMobile]);

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
        setMousePos({
            x: e.clientX,
            y: e.clientY,
        });
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

                const result = await chatSessionRef.current.sendMessage(parts);
                const responseText = result.response.text();

                const aiMsg: ChatMessage = {
                    id: `ai-${Date.now()}`,
                    role: 'assistant',
                    content: responseText,
                };
                setMessages((prev) => [...prev, aiMsg]);

                // Generate avatar reaction
                if (!isMobile) {
                    generateAvatarReaction(text, responseText).then(reaction => {
                        setAvatarMessage(reaction);
                        if (avatarTimerRef.current) clearTimeout(avatarTimerRef.current);
                        avatarTimerRef.current = setTimeout(() => {
                            setAvatarMessage(null);
                        }, 5000); // Hide after 5 seconds
                    });
                }
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
        [isTyping, intent, attachments, isMobile]
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
            className="fixed inset-0 z-[200] bg-[linear-gradient(180deg,#0b1621_0%,#08101a_54%,#050b12_100%)] flex flex-col"
        >
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.14] bg-white/[0.04] mobile-safe-top">
                <button
                    type="button"
                    onClick={() => setIsMobileChatOpen(false)}
                    aria-label="Close assistant chat"
                    title="Close assistant chat"
                    className={`w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.08] text-[#e6eef9] hover:text-white hover:bg-white/[0.16] transition-colors ${ASSISTANT_FOCUS_CLASS}`}
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <p className="text-sm font-semibold text-[#f7f8f8]">Portfolio AI Assistant</p>
                    <p className="text-[11px] text-[#b8c2d0]">Ask about Sai Charan's work</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {/* Chat Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scroll-smooth flex flex-col">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 gap-4 py-8">
                        <div className="w-16 h-16 relative flex items-center justify-center mb-2">
                            <div className="absolute inset-0 bg-[#9fb7ff]/18 rounded-2xl blur-xl pb-2"></div>
                            <div className="w-14 h-14 rounded-2xl bg-[rgba(14,31,47,0.74)] border border-white/[0.24] flex items-center justify-center relative z-10 shadow-[0_0_22px_rgba(120,150,255,0.24)] backdrop-blur-xl">
                                <Sparkles className="w-6 h-6 text-[#c9d6ff]" />
                            </div>
                        </div>
                        <div className="text-center mb-6">
                            <p className="text-base font-semibold text-[#f7f8f8] mb-1.5">
                                Portfolio AI Assistant
                            </p>
                            <p className="text-[13px] text-[#c5cfdd] max-w-[280px]">
                                Ask me anything about Sai Charan's work,
                                skills, and projects.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2.5 w-full max-w-[340px]">
                            {STARTER_PROMPTS.map((sp) => (
                                <button
                                    type="button"
                                    key={sp.label}
                                    onClick={() => sendMessage(sp.prompt)}
                                    className={`w-full text-left px-5 py-3.5 rounded-xl text-[13px] transition-all flex items-center group ${ASSISTANT_GLASS_BUTTON_CLASS}`}
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
                                <div className="w-2 h-2 rounded-full bg-[#7170ff] animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 rounded-full bg-[#7170ff] animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 rounded-full bg-[#7170ff] animate-bounce" style={{ animationDelay: '300ms' }} />
                            </motion.div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                )}
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-[rgba(5,12,20,0.86)] border-t border-white/[0.14] mobile-safe-bottom backdrop-blur-xl">
                {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-2 pt-2 pb-1">
                        {attachments.map((att, idx) => (
                            <div key={idx} className="relative group rounded-lg overflow-hidden border border-white/[0.2] bg-[rgba(14,31,47,0.68)] backdrop-blur-xl">
                                {att.mimeType.startsWith('image/') && att.previewUrl ? (
                                    <img src={att.previewUrl} alt="preview" className="w-14 h-14 object-cover" />
                                ) : (
                                    <div className="w-14 h-14 flex flex-col items-center justify-center p-1">
                                        <FileIcon className="w-4 h-4 text-[#d6e3f2] mb-1" />
                                        <span className="text-[8px] text-[#eef5ff] truncate w-full text-center">{att.file.name.split('.').pop()?.toUpperCase()}</span>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => removeAttachment(idx)}
                                    aria-label={`Remove ${att.file.name}`}
                                    title={`Remove ${att.file.name}`}
                                    className={`absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center ${ASSISTANT_FOCUS_CLASS}`}
                                >
                                    <X className="w-2.5 h-2.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="bg-[rgba(10,24,38,0.78)] border border-white/[0.22] rounded-2xl relative focus-within:border-white/[0.44] focus-within:ring-2 focus-within:ring-[#eef6ff]/20 transition-colors duration-200 backdrop-blur-xl shadow-[0_16px_38px_rgba(5,16,28,0.26)]">
                    <textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        placeholder="Ask about Sai Charan..."
                        rows={1}
                        className="w-full bg-transparent text-[#f3f8ff] text-[13px] px-4 py-3 min-h-[44px] max-h-[120px] placeholder-[#d0dbea] resize-none outline-none leading-relaxed overflow-y-auto scrollbar-none rounded-t-2xl"
                    />
                    <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
                        <div className="flex items-center gap-2">
                            <input type="file" ref={fileInputRef} onChange={handleFileInputChange} className="hidden" multiple accept="image/*,application/pdf,.doc,.docx,.txt" />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                aria-label="Attach files"
                                title="Attach files"
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[#d6e3f2] hover:text-white hover:bg-white/15 transition-colors ${ASSISTANT_FOCUS_CLASS}`}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={(!inputValue.trim() && attachments.length === 0) || isTyping}
                            aria-label="Send message"
                            title="Send message"
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${((inputValue.trim() || attachments.length > 0) && !isTyping)
                                    ? `bg-white text-[#05111d] hover:bg-[#dfeaff] shadow-md ${ASSISTANT_FOCUS_CLASS}`
                                    : 'bg-white/[0.16] text-[#b8c4d4] cursor-not-allowed'
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
            className={`fixed inset-0 z-50 overflow-hidden transition-colors duration-1000 ${isSabotaged ? 'bg-[#1a0505]' : 'bg-[#08090a]'}`}
            onMouseMove={!isMobile ? handleLandingMouseMove : undefined}
        >
            <PixelBangaloreBackground className={isSabotaged ? 'opacity-70 saturate-[0.7] hue-rotate-[130deg]' : 'opacity-100'} />

            {/* ── Walking Among Us Character (desktop only) ──────────── */}
            {!isMobile && (
                <div className="fixed inset-0 pointer-events-none z-[60]">
                    <Character
                        targetX={mousePos.x}
                        targetY={mousePos.y}
                        color={isSabotaged ? "#ff0000" : "#7170ff"}
                        elementBounds={panelBounds}
                        message={avatarMessage}
                    />
                </div>
            )}

            {/* ── Mobile Chat Overlay ──────────────────────────────────── */}
            <AnimatePresence>
                {isMobile && isMobileChatOpen && renderMobileChatOverlay()}
            </AnimatePresence>

            {/* ── MAIN CONTENT LAYER (fades/scales down on scroll) ──────── */}
            <motion.div
                className="absolute inset-0 z-10 flex"
                style={{ scale: contentScale, y: contentY, opacity: contentOpacity }}
            >
                {/* Atmospheric readability overlays */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(90deg, rgba(0,0,0,0.24) 0%, rgba(0,0,0,0.05) 45%, rgba(0,0,0,0.14) 100%)',
                        }}
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.08) 58%, rgba(0,0,0,0.5) 100%)',
                        }}
                    />
                </div>

                {/* Corner badges */}
                <div className="absolute top-6 left-6 z-10 pointer-events-none">
                    <span className="text-[11px] text-[#62666d] font-mono tracking-widest">
                        PORTFOLIO.V2
                    </span>
                </div>
                <div className="absolute top-6 right-6 z-10 pointer-events-none flex items-center gap-2.5 mt-[-6px] mr-[-6px]">
                    <span
                        className={`inline-block h-2 w-2 shrink-0 rounded-full animate-pulse ${
                            isSabotaged ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-emerald-400'
                        }`}
                        aria-hidden
                    />
                    <span
                        className={`text-[11px] font-mono tracking-widest uppercase ${
                            isSabotaged ? 'text-red-500' : 'text-[#d4d4d8]'
                        }`}
                    >
                        {isSabotaged ? 'System sabotaged' : 'Available for hire'}
                    </span>
                </div>

                {/* ── Layout — two-column desktop, single-column mobile ── */}
                <div className={`relative z-10 flex items-stretch w-full h-screen ${isMobile ? 'flex-col' : ''}`}>
                    {/* ═══ LEFT SECTION — Creative intro ═══ */}
                    <div className={`relative flex flex-col justify-center ${isMobile ? 'flex-1 px-6 pt-16' : 'flex-1 px-6 lg:px-12 xl:px-24'}`}>
                        {/* Image stack */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="mb-6"
                        >
                            <div style={{ width: 160, height: 160 }}>
                                <Stack
                                    randomRotation
                                    sensitivity={150}
                                    sendToBackOnClick
                                    autoplay
                                    autoplayDelay={3000}
                                    pauseOnHover
                                />
                            </div>
                        </motion.div>

                        {/* Name */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <h1 className={`${isMobile ? 'text-4xl' : 'text-5xl lg:text-6xl'} font-semibold text-[#f7f8f8] tracking-normal leading-none mb-2 drop-shadow-[0_10px_34px_rgba(0,0,0,0.55)]`}>
                                {PERSONA.name}
                            </h1>
                            <p className="text-2xl text-[#87c7ff] font-[510] mb-5 min-h-[1.75rem] drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                                <RotatingText
                                    words={['Enterprise & SaaS Specialist', 'Information Architect L2', 'UX Designer', 'Interaction Designer', 'Senior Product Designer']}
                                    interval={2800}
                                    className="text-[#87c7ff]"
                                />
                            </p>
                        </motion.div>

                        {/* Code liner */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.55 }}
                            className="mb-5"
                        >
                            <div className="inline-flex items-center gap-2 rounded-lg border border-white/[0.14] bg-black/35 px-4 py-2.5 shadow-[0_14px_44px_rgba(0,0,0,0.28)] backdrop-blur-md">
                                <span className="text-[#80f2bd] font-mono text-xs">{'>'}</span>
                                <code className="text-[#8a8f98] font-mono text-xs">
                                    <span className="text-[#bcefff]">const</span>{' '}
                                    <span className="text-[#d0d6e0]">passion</span>{' '}
                                    <span className="text-[#62666d]">=</span>{' '}
                                    <span className="text-[#8a8f98]">
                                        "Designing for humans, powered by craft"
                                    </span>
                                </code>
                                <span className="w-2 h-4 bg-[#80f2bd] animate-pulse rounded-sm" />
                            </div>
                        </motion.div>

                        {/* Bio */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.65 }}
                            className="text-[#c7ccd4] text-base leading-relaxed max-w-md mb-8 drop-shadow-[0_8px_24px_rgba(0,0,0,0.65)]"
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
                            <CoolMode>
                                <a onPointerDown={() => trigger('light')} href={`${import.meta.env.BASE_URL}sai%20charan%20kalla_Latest%20Resume.pdf`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#5e6ad2] text-white text-sm font-[510] hover:bg-[#828fff] transition-colors active:scale-95">
                                    <Download className="w-4 h-4" />
                                    Download Resume
                                </a>
                            </CoolMode>
                            <a onPointerDown={() => trigger('light')} href="https://www.linkedin.com/in/sai-charan-92a8ab13b/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.02] border border-white/[0.08] text-[#d0d6e0] text-sm font-[510] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all active:scale-95">
                                <ExternalLink className="w-4 h-4" />
                                LinkedIn
                            </a>
                        </motion.div>
                    </div>

                    {/* ═══ RIGHT SECTION — AI Chat Panel (desktop only) ═══ */}
                    {!isMobile && (
                        <motion.div
                            ref={rightPanelRef}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="relative z-20 flex h-full w-[min(44vw,640px)] min-w-[520px] items-center justify-end py-5 pr-5 xl:py-8 xl:pr-10"
                        >
                            <div className="relative flex h-full max-h-[calc(100vh-2.5rem)] w-full flex-col overflow-hidden rounded-[34px] border border-white/[0.34] bg-[rgba(188,219,244,0.13)] pt-8 shadow-[0_26px_80px_rgba(3,12,20,0.34),0_1px_0_rgba(255,255,255,0.28)_inset] backdrop-blur-[44px] xl:max-h-[calc(100vh-4rem)]">
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.13)_0%,rgba(107,143,171,0.08)_42%,rgba(5,16,28,0.2)_100%)]"
                                />
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(245,250,255,0.2)_0%,rgba(173,198,255,0.06)_32%,rgba(5,16,28,0)_64%)]"
                                />
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/55 to-transparent"
                                />
                                {/* Chat messages area */}
                                <div ref={chatContainerRef} className="relative z-10 flex flex-1 flex-col overflow-y-auto px-6 py-4 scrollbar-thin scroll-smooth">
                                    {messages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center flex-1 gap-4 py-8">
                                            <div className="w-16 h-16 relative flex items-center justify-center mb-2">
                                                <div className="absolute inset-0 bg-[rgba(226,240,255,0.22)] rounded-2xl blur-xl pb-2"></div>
                                                <div className="w-14 h-14 rounded-2xl bg-[rgba(8,24,40,0.38)] border border-white/[0.38] flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(173,199,255,0.2)] backdrop-blur-[34px]">
                                                    <Sparkles className="w-6 h-6 text-[#dce8ff]" />
                                                </div>
                                            </div>
                                            <div className="text-center mb-6">
                                                <p className="text-base font-semibold text-[#ffffff] mb-1.5 drop-shadow-[0_2px_18px_rgba(3,10,18,0.88)]">
                                                    Portfolio AI Assistant
                                                </p>
                                                <p className="text-[13px] text-[#edf5ff] max-w-[280px] drop-shadow-[0_1px_14px_rgba(3,10,18,0.82)]">
                                                    Ask me anything about Sai Charan's work,
                                                    skills, and projects.
                                                </p>
                                            </div>

                                            {/* Starter prompts */}
                                            <div className="flex flex-col gap-2.5 w-full max-w-[340px]">
                                                {STARTER_PROMPTS.map((sp) => (
                                                    <button
                                                        type="button"
                                                        key={sp.label}
                                                        onClick={() => sendMessage(sp.prompt)}
                                                        className={`w-full text-left px-5 py-3.5 rounded-xl text-[13px] font-medium transition-all flex items-center group ${ASSISTANT_GLASS_BUTTON_CLASS}`}
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
                                                    <div className="w-2 h-2 rounded-full bg-[#7170ff] animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <div className="w-2 h-2 rounded-full bg-[#7170ff] animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <div className="w-2 h-2 rounded-full bg-[#7170ff] animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </motion.div>
                                            )}

                                            <div ref={chatEndRef} />
                                        </div>
                                    )}
                                </div>

                                {/* Chat input area */}
                                <div className="relative z-20 m-4 mt-0 flex flex-col gap-2 rounded-[28px] border border-white/[0.18] bg-[rgba(5,14,24,0.24)] p-3 shadow-[0_18px_48px_rgba(3,12,20,0.24),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-[38px]">
                                    {/* Attachment Previews */}
                                    {attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-2 px-2 pt-2">
                                            {attachments.map((att, idx) => (
                                                <div key={idx} className="relative group rounded-lg overflow-hidden border border-white/[0.28] bg-[rgba(8,24,40,0.42)] shadow-[0_10px_26px_rgba(5,16,28,0.18)] backdrop-blur-[30px]">
                                                    {att.mimeType.startsWith('image/') && att.previewUrl ? (
                                                        <img src={att.previewUrl} alt="preview" className="w-16 h-16 object-cover" />
                                                    ) : (
                                                        <div className="w-16 h-16 flex flex-col items-center justify-center p-1">
                                                            <FileIcon className="w-5 h-5 text-[#d6e3f2] mb-1" />
                                                            <span className="text-[9px] text-[#eef5ff] truncate w-full text-center">{att.file.name.split('.').pop()?.toUpperCase() || 'FILE'}</span>
                                                        </div>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAttachment(idx)}
                                                        aria-label={`Remove ${att.file.name}`}
                                                        title={`Remove ${att.file.name}`}
                                                        className={`absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity hover:bg-black/80 ${ASSISTANT_FOCUS_CLASS}`}
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="bg-[rgba(8,24,40,0.42)] border border-white/[0.34] rounded-[20px] shadow-[0_18px_42px_rgba(5,16,28,0.2),inset_0_1px_0_rgba(255,255,255,0.16)] relative focus-within:border-white/[0.58] focus-within:ring-2 focus-within:ring-[#eef6ff]/22 transition-colors duration-200 backdrop-blur-[36px]">
                                        {/* Slash command menu */}
                                        <AnimatePresence>
                                            {isSlashMenuOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    transition={{ duration: 0.15 }}
                                                    className={`absolute bottom-[calc(100%+8px)] left-0 w-full rounded-xl overflow-hidden py-1.5 z-[100] ${ASSISTANT_MENU_CLASS}`}
                                                >
                                                    <div className="px-3 py-1.5 text-xs font-semibold text-[#dbe7f7] uppercase tracking-wider">
                                                        Recruiter Questions
                                                    </div>
                                                    <div className="max-h-[200px] overflow-y-auto scrollbar-thin">
                                                        {filteredCommands.map((cmd, idx) => (
                                                            <button
                                                                type="button"
                                                                key={cmd.id}
                                                                onMouseEnter={() => setSlashIndex(idx)}
                                                                onClick={() => handleSelectCommand(cmd.text)}
                                                                className={`w-full text-left px-3 py-2 text-[13px] flex items-center justify-between transition-colors ${ASSISTANT_FOCUS_CLASS} ${slashIndex === idx
                                                                    ? 'bg-white/[0.18] text-white'
                                                                    : 'text-[#e3edf9] hover:bg-white/[0.12] hover:text-white'
                                                                    }`}
                                                            >
                                                                <span className="flex flex-col gap-0.5">
                                                                    <span className="font-medium text-[#d8e2ff]">{cmd.label}</span>
                                                                    <span className="text-[11px] opacity-80 truncate max-w-[400px]">{cmd.text}</span>
                                                                </span>
                                                            </button>
                                                        ))}
                                                        {filteredCommands.length === 0 && (
                                                            <div className="px-3 py-2 text-[12px] text-[#d0dbea]">No commands found</div>
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
                                            className="w-full bg-transparent text-[#f3f8ff] text-[13px] px-4 py-3 min-h-[44px] max-h-[200px] placeholder-[#d0dbea] resize-none outline-none leading-relaxed overflow-y-auto scrollbar-none rounded-t-[20px]"
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
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    aria-label="Attach files"
                                                    title="Attach files"
                                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[#d6e3f2] hover:text-white hover:bg-white/15 transition-colors ${ASSISTANT_FOCUS_CLASS}`}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsIntentDropdownOpen(!isIntentDropdownOpen)}
                                                        aria-haspopup="menu"
                                                        aria-expanded={isIntentDropdownOpen}
                                                        title="Change conversation intent"
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] text-[#f1f7ff] bg-[rgba(8,24,40,0.38)] hover:text-white hover:bg-[rgba(18,42,62,0.52)] transition-colors cursor-pointer border border-white/[0.32] shadow-[0_8px_20px_rgba(5,16,28,0.16)] backdrop-blur-[30px] ${ASSISTANT_FOCUS_CLASS}`}
                                                    >
                                                        {intent === 'hire' ? <Briefcase className="w-3 h-3 text-emerald-400" /> : <Compass className="w-3 h-3 text-blue-400" />}
                                                        {intent === 'hire' ? 'Intend to Hire' : 'Just Exploring'}
                                                        <ChevronDown className={`w-3 h-3 transition-transform ${isIntentDropdownOpen ? 'rotate-180' : ''}`} />
                                                    </button>

                                                    <AnimatePresence>
                                                        {isIntentDropdownOpen && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                transition={{ duration: 0.15 }}
                                                                className={`absolute bottom-[calc(100%+8px)] left-0 w-40 rounded-xl overflow-hidden py-1 z-[100] ${ASSISTANT_MENU_CLASS}`}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleIntentChange('hire')}
                                                                    className={`w-full text-left px-3 py-2 text-[11px] text-[#e3edf9] hover:bg-white/[0.12] hover:text-white flex items-center justify-between transition-colors ${ASSISTANT_FOCUS_CLASS}`}
                                                                >
                                                                    <span className="flex items-center gap-2">
                                                                        <Briefcase className="w-3 h-3 text-emerald-400" /> Intend to Hire
                                                                    </span>
                                                                    {intent === 'hire' && <Check className="w-3 h-3" />}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleIntentChange('explore')}
                                                                    className={`w-full text-left px-3 py-2 text-[11px] text-[#e3edf9] hover:bg-white/[0.12] hover:text-white flex items-center justify-between transition-colors ${ASSISTANT_FOCUS_CLASS}`}
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
                                                    type="button"
                                                    onClick={handleSend}
                                                    disabled={(!inputValue.trim() && attachments.length === 0) || isTyping}
                                                    aria-label="Send message"
                                                    title="Send message"
                                                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${((inputValue.trim() || attachments.length > 0) && !isTyping)
                                                        ? `bg-white text-[#05111d] hover:bg-[#dfeaff] shadow-md ${ASSISTANT_FOCUS_CLASS}`
                                                        : 'bg-white/[0.16] text-[#b8c4d4] cursor-not-allowed'
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
                                            type="button"
                                            onClick={() => setMessages([])}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-[#dbe7f7] hover:text-white hover:bg-white/[0.12] transition-colors ${ASSISTANT_FOCUS_CLASS}`}
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
                    <span className="text-[10px] text-[#62666d] font-mono tracking-widest uppercase">
                        {isMobile ? 'Swipe up to explore projects' : 'Scroll to explore projects'}
                    </span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    >
                        <ArrowDown className="w-4 h-4 text-[#62666d]" />
                    </motion.div>
                </motion.div>

                {/* ── Mobile Chat FAB ──────────────────────────────────────── */}
                {isMobile && !isMobileChatOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
                        onClick={() => setIsMobileChatOpen(true)}
                        className="fixed bottom-24 right-5 z-[100] w-14 h-14 rounded-full bg-[#5e6ad2] text-white flex items-center justify-center shadow-lg shadow-[#5e6ad2]/20 active:scale-90 transition-transform mobile-safe-bottom"
                    >
                        <MessageCircle className="w-6 h-6" />
                    </motion.button>
                )}
            </motion.div>

        </div>
    );
}
