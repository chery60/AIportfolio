import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { Sparkles, Download, ExternalLink, ArrowDown } from 'lucide-react';
import Character from './Canvas/Character';

// ── Mock AI Data ────────────────────────────────────────────────────────────
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
}

const STARTER_PROMPTS = [
    { label: '👋 Who is Sai Charan?', prompt: 'Tell me about Sai Charan' },
    { label: '🛠️ What does he design?', prompt: 'What kind of products does Sai Charan design?' },
    { label: '🚀 Show me projects', prompt: 'What are his recent projects?' },
];

const MOCK_RESPONSES: Record<string, string> = {
    'Tell me about Sai Charan':
        "Sai Charan is a **Product Designer** who specializes in building end-to-end design systems for enterprise and consumer products. He's worked at Oracle's Food & Beverage division, designing self-ordering kiosks, user management platforms, and B2B analytics dashboards.\n\nHe combines UX research, interaction design, and a deep understanding of data to ship products that truly solve problems. He's also passionate about AI-powered tools and vibe-coded experiments. 🎨",
    'What kind of products does Sai Charan design?':
        "Sai designs a diverse range of products:\n\n🥡 **Oracle Symphony Kiosk** — Self-ordering kiosk for QSRs & stadiums\n👥 **User Management** — Unified admin platform across Oracle products\n🏢 **Companies Platform** — Enterprise finance & company management\n📱 **Flow** — Task management mobile app\n📊 **Nexus B2B Analytics** — Web analytics dashboard\n🤖 **Beacon AI** — AI-powered navigation product\n\nHe works across the full spectrum from 0→1 products to system-level redesigns.",
    'What are his recent projects?':
        "Here are Sai's most recent projects:\n\n1. **Oracle Symphony Kiosk** (2024) — Guest self-ordering kiosk designed from scratch, covering hardware & software UX\n2. **User Management** (2024) — Unified user management system for Oracle FBGBU\n3. **Companies Platform** — Enterprise finance platform design\n4. **Flow — Task Management** — Mobile app for task & project management\n5. **Nexus B2B Analytics** — Web-based B2B analytics dashboard\n6. **Beacon AI Navigation** — AI-powered product for intelligent navigation\n\n👇 Scroll down to explore each project on the interactive canvas!",
};

const DEFAULT_RESPONSE =
    "That's a great question! Sai Charan is a Product Designer focused on enterprise UX, AI tools, and creative experiments. Scroll down to explore his project canvas and see his work in action! 🎯";

// ── Typing Animation Hook ───────────────────────────────────────────────────
function useTypewriter(text: string, speed = 12) {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);

    useEffect(() => {
        setDisplayed('');
        setDone(false);
        let i = 0;
        const timer = setInterval(() => {
            i++;
            setDisplayed(text.slice(0, i));
            if (i >= text.length) {
                clearInterval(timer);
                setDone(true);
            }
        }, speed);
        return () => clearInterval(timer);
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
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
        >
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
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
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

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
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

        const wrapper = landingRef.current;
        if (wrapper) {
            wrapper.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (wrapper) wrapper.removeEventListener('wheel', handleWheel);
        };
    }, [rawProgress, onEnterCanvas]);

    // Track mouse position for the Among Us character
    const handleLandingMouseMove = useCallback((e: React.MouseEvent) => {
        if (landingRef.current) {
            const rect = landingRef.current.getBoundingClientRect();
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

    const sendMessage = useCallback(
        (text: string) => {
            if (isTyping) return;

            const userMsg: ChatMessage = {
                id: `user-${Date.now()}`,
                role: 'user',
                content: text,
            };
            setMessages((prev) => [...prev, userMsg]);
            setInputValue('');
            setIsTyping(true);

            // Simulate AI response delay
            setTimeout(() => {
                const response =
                    MOCK_RESPONSES[text] || DEFAULT_RESPONSE;
                const aiMsg: ChatMessage = {
                    id: `ai-${Date.now()}`,
                    role: 'assistant',
                    content: response,
                };
                setMessages((prev) => [...prev, aiMsg]);
                setIsTyping(false);
            }, 600 + Math.random() * 400);
        },
        [isTyping]
    );

    const handleSend = () => {
        const text = inputValue.trim();
        if (!text) return;
        sendMessage(text);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div
            ref={landingRef}
            className="fixed inset-0 z-50 overflow-hidden bg-[#0A0B0F]"
            onMouseMove={handleLandingMouseMove}
        >
            {/* ── Walking Among Us Character (follows cursor) ──────────── */}
            <div className="fixed inset-0 pointer-events-none z-[60]">
                <Character
                    targetX={mousePos.x}
                    targetY={mousePos.y}
                    color="#7B5CFA"
                    elementBounds={[]}
                />
            </div>

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

                {/* ── Two-column layout ──────────────────────────────────────── */}
                <div className="relative z-10 flex items-stretch w-full h-screen">
                    {/* ═══ LEFT SECTION — Creative intro ═══ */}
                    <div className="flex-1 flex flex-col justify-center px-6 lg:px-12 xl:px-24">
                        {/* Name */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <h1 className="text-5xl lg:text-6xl font-bold text-[#F0F0FF] tracking-tight leading-none mb-2">
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

                    {/* ═══ RIGHT SECTION — AI Chat Panel ═══ */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="w-[500px] xl:w-[640px] h-full"
                    >
                        <div className="w-full h-full border-l border-white/[0.04] bg-[#09090B] flex flex-col pt-12">
                            {/* Chat messages area */}
                            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin">
                                {messages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full gap-4 py-8">
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
                                )}

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

                            {/* Chat input area */}
                            <div className="p-4 bg-[#09090B]">
                                <div className="bg-[#121214] border border-white/[0.06] rounded-[20px] shadow-sm relative focus-within:border-white/[0.12] transition-colors duration-200">
                                    <textarea
                                        ref={inputRef}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Describe what you want to create..."
                                        rows={1}
                                        className="w-full bg-transparent text-[#E4E4E5] text-[13px] px-4 py-3 min-h-[44px] max-h-[200px] placeholder-[#71717A] resize-none outline-none leading-relaxed overflow-y-auto scrollbar-none rounded-t-[20px]"
                                    />
                                    <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
                                        <div className="flex items-center gap-2">
                                            <button className="w-6 h-6 rounded-full flex items-center justify-center text-[#A1A1AA] hover:text-[#E4E4E5] hover:bg-white/5 transition-colors">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                            </button>
                                            <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] text-[#A1A1AA] hover:text-[#E4E4E5] transition-colors border border-white/[0.06] bg-[#18181B]">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /></svg>
                                                Aspect Ratio
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] text-[#A1A1AA] bg-transparent hover:text-[#E4E4E5] transition-colors cursor-pointer">
                                                Alchemy 4.5 Pro
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                            </div>
                                            <button
                                                onClick={handleSend}
                                                disabled={!inputValue.trim() || isTyping}
                                                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${inputValue.trim() && !isTyping
                                                    ? 'bg-white text-black hover:bg-[#E4E4E5] shadow-md'
                                                    : 'bg-[#27272A] text-[#52525B] cursor-not-allowed'
                                                    }`}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`${inputValue.trim() && !isTyping ? 'animate-in slide-in-from-bottom-2 fade-in duration-200' : ''}`}><path d="m5 12 7-7 7 7" /><path d="M12 19V5" /></svg>
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
                </div>

                {/* ── Scroll indicator ───────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    className="absolute bottom-8 left-1/4 -translate-x-1/2 flex flex-col items-center gap-2 z-10 pointer-events-none"
                >
                    <span className="text-[10px] text-[#3A3C5A] font-mono tracking-widest uppercase">
                        Scroll to explore projects
                    </span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    >
                        <ArrowDown className="w-4 h-4 text-[#3A3C5A]" />
                    </motion.div>
                </motion.div>
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
