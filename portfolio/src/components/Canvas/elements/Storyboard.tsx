import React, { useEffect, useRef, useState } from 'react';
import type { StoryboardElement } from '../../../types';
import Character from '../Character';

interface Props {
    element: StoryboardElement;
    isSelected: boolean;
    onClick: () => void;
}

const CROWD_COLORS = [
    '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#64748B', '#A855F7',
    '#D946EF', '#06B6D4', '#84CC16', '#EAB308',
];

// ─── Scaled Among Us character (scale ~1.3 = ~47x57px) ───
const ScaledChar = ({ color, x, y, scale = 1.3, flip = false, eating = false }: {
    color: string; x: number; y: number; scale?: number; flip?: boolean; eating?: boolean;
}) => (
    <div className="absolute" style={{ left: x, top: y, zIndex: Math.floor(y + 100) }}>
        <div
            style={{ transform: `scale(${scale}) ${flip ? 'scaleX(-1)' : ''}`, transformOrigin: 'bottom center' }}
            className={eating ? 'animate-amongus-bob' : ''}
        >
            <Character targetX={0} targetY={0} color={color} />
        </div>
    </div>
);


// ─── Animated tray held by waiter ───
const Tray = () => (
    <div className="absolute pointer-events-none" style={{ left: 28, top: -8, zIndex: 9999 }}>
        {/* Tray platter */}
        <div className="relative w-[44px] h-[8px] bg-[#c8a96e] rounded-full border-[2px] border-[#8B6914] shadow-md">
            {/* Items on tray */}
            <div className="absolute -top-[10px] left-[4px] text-[11px]">🍔</div>
            <div className="absolute -top-[10px] left-[20px] text-[11px]">🥤</div>
        </div>
    </div>
);

// ─── Animated waiter: manager → waypoints → table → waypoints → manager → repeat ───
// Uses a waypoint path so the waiter walks around the crowd, not through it.
// Each table entry can have its own approach waypoints.
const WaiterCharacter = ({ color, managerPos, tablePositions, speed = 1.2 }: {
    color: string;
    managerPos: { x: number; y: number };
    // Each table has a destination + optional waypoints for approach and return
    tablePositions: {
        x: number; y: number;
        approachWaypoints?: { x: number; y: number }[];
        returnWaypoints?: { x: number; y: number }[];
    }[];
    speed?: number;
}) => {
    const posRef = useRef({ x: managerPos.x, y: managerPos.y });
    const charRef = useRef<HTMLDivElement>(null);
    const flipRef = useRef(false);
    const [flip, setFlip] = useState(false);
    const [showTray, setShowTray] = useState(false);
    const [serving, setServing] = useState(false);
    // State machine: 'pickup' | 'to-table' | 'serving' | 'return'
    const stateRef = useRef<'pickup' | 'to-table' | 'serving' | 'return'>('pickup');
    const tableIndexRef = useRef(0);
    const pauseRef = useRef(false);
    // Waypoint index within the current path segment
    const waypointIndexRef = useRef(0);

    useEffect(() => {
        let raf: number;

        const moveTo = (target: { x: number; y: number }): boolean => {
            const dx = target.x - posRef.current.x;
            const dy = target.y - posRef.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 3) return true; // arrived
            posRef.current.x += (dx / dist) * speed;
            posRef.current.y += (dy / dist) * speed;
            if (dx < -1 && !flipRef.current) { flipRef.current = true; setFlip(true); }
            else if (dx > 1 && flipRef.current) { flipRef.current = false; setFlip(false); }
            return false;
        };

        // Move through a series of waypoints then a final destination.
        // Returns true when final destination is reached.
        const moveAlongPath = (waypoints: { x: number; y: number }[], destination: { x: number; y: number }): boolean => {
            const fullPath = [...waypoints, destination];
            const currentTarget = fullPath[waypointIndexRef.current];
            if (!currentTarget) return true;
            const arrived = moveTo(currentTarget);
            if (arrived) {
                waypointIndexRef.current++;
                if (waypointIndexRef.current >= fullPath.length) {
                    waypointIndexRef.current = 0;
                    return true; // fully arrived at destination
                }
            }
            return false;
        };

        const loop = () => {
            if (!pauseRef.current) {
                const tableIdx = tableIndexRef.current % tablePositions.length;
                const currentTable = tablePositions[tableIdx];
                const approachWaypoints = currentTable.approachWaypoints ?? [];
                const returnWaypoints = currentTable.returnWaypoints ?? [];

                if (stateRef.current === 'pickup') {
                    // Walk directly to manager/kitchen pickup (no waypoints needed)
                    const arrived = moveTo(managerPos);
                    if (arrived) {
                        // Reset waypoint index for next journey
                        waypointIndexRef.current = 0;
                        // Pause at manager 800ms to "pick up" tray
                        pauseRef.current = true;
                        setShowTray(false);
                        setTimeout(() => {
                            setShowTray(true);
                            stateRef.current = 'to-table';
                            pauseRef.current = false;
                        }, 800);
                    }
                } else if (stateRef.current === 'to-table') {
                    // Walk via approach waypoints → table
                    const arrived = moveAlongPath(approachWaypoints, { x: currentTable.x, y: currentTable.y });
                    if (arrived) {
                        // Arrive at table — serve food (hide tray, pause)
                        pauseRef.current = true;
                        stateRef.current = 'serving';
                        setServing(true);
                        setShowTray(false);
                        // Reset waypoint for return journey
                        waypointIndexRef.current = 0;
                        setTimeout(() => {
                            setServing(false);
                            tableIndexRef.current = (tableIndexRef.current + 1) % tablePositions.length;
                            stateRef.current = 'return';
                            pauseRef.current = false;
                        }, 1200);
                    }
                } else if (stateRef.current === 'return') {
                    // Walk via return waypoints → manager
                    const arrived = moveAlongPath(returnWaypoints, managerPos);
                    if (arrived) {
                        waypointIndexRef.current = 0;
                        stateRef.current = 'pickup';
                    }
                }
            }

            if (charRef.current) {
                charRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
            }
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, [managerPos, tablePositions, speed]);

    return (
        <div
            ref={charRef}
            className="absolute pointer-events-none"
            style={{ left: 0, top: 0, zIndex: 600, transform: `translate(${managerPos.x}px, ${managerPos.y}px)` }}
        >
            {/* Serving indicator */}
            {serving && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-base animate-bounce pointer-events-none z-[9999]">
                    ✅
                </div>
            )}
            <div style={{ transform: `scale(1.25) ${flip ? 'scaleX(-1)' : ''}`, transformOrigin: 'bottom center' }} className="animate-amongus-bob">
                <Character targetX={0} targetY={0} color={color} />
            </div>
            {showTray && <Tray />}
        </div>
    );
};

// ─── Character behaviours at a dining table ───
// 'eating'  → bobs up/down + periodic food emoji + occasional "Mmm!" bubble
// 'chatting'→ still, shows chat bubble periodically
// 'waiting' → still, shows "..." bubble
// 'phone'   → still, shows 📱 emoji floating
type SeatBehaviour = 'eating' | 'chatting' | 'waiting' | 'phone';

const EATING_BUBBLES = ['Mmm! 😋', 'So good!', 'Delish! 🤤', 'Love it!'];
const CHAT_BUBBLES = ['Ha ha! 😂', 'No way!', 'For real?', 'Same! 😄', 'Totally!'];

// ─── Frustrated crowd bubble — only shows after story starts ───
const FRUSTRATED_PHRASES = [
    ['Hungry... 😩', 'Ugh, this wait...', 'Come on!!', 'How long?!'],
    ['Ugh, this wait...', 'Starving here! 😤', 'Is anyone working?', '...seriously?'],
];

const CrowdBubble = ({ x, y, phrases, delayMs, active }: {
    x: number; y: number; phrases: string[]; delayMs: number; active: boolean;
}) => {
    const [text, setText] = useState<string | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const phraseIdxRef = useRef(0);

    useEffect(() => {
        if (!active) {
            setText(null);
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            return;
        }

        // First fire after stagger delay, then cycle every 4.5s
        timeoutRef.current = setTimeout(() => {
            const fire = () => {
                const phrase = phrases[phraseIdxRef.current % phrases.length];
                phraseIdxRef.current++;
                setText(phrase);
                setTimeout(() => setText(null), 2200);
            };
            fire();
            intervalRef.current = setInterval(fire, 4500);
        }, delayMs);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [active, delayMs, phrases]);

    if (!text) return null;

    return (
        <div
            className="absolute z-[9999] pointer-events-none"
            style={{ left: x - 10, top: y - 68 }}
        >
            <div
                className="bg-white rounded-xl px-2.5 py-1 text-[11px] font-bold text-gray-900 shadow-lg border-2 border-gray-300 whitespace-nowrap relative"
                style={{ animation: 'fadeInUp 0.2s ease' }}
            >
                {text}
                {/* Tail */}
                <div className="absolute -bottom-[7px] left-4 w-3 h-3 bg-white border-b-2 border-r-2 border-gray-300 rotate-45" />
            </div>
        </div>
    );
};

const DiningSeat = ({ color, pos, flip = false, behaviour, foodEmoji, bubbleDelay }: {
    color: string;
    pos: [number, number];
    flip?: boolean;
    behaviour: SeatBehaviour;
    foodEmoji?: string;
    bubbleDelay: number; // ms stagger
}) => {
    const [bubble, setBubble] = useState<string | null>(null);
    const [showFood, setShowFood] = useState(false);

    useEffect(() => {
        // Each seat fires its bubble on its own staggered interval
        const baseInterval = behaviour === 'eating' ? 3200
            : behaviour === 'chatting' ? 4000
            : behaviour === 'waiting' ? 5000
            : 6000;

        let interval: ReturnType<typeof setInterval>;

        const t = setTimeout(() => {
            const fire = () => {
                if (behaviour === 'eating') {
                    setShowFood(true);
                    setTimeout(() => setShowFood(false), 900);
                    const msg = EATING_BUBBLES[Math.floor(Math.random() * EATING_BUBBLES.length)];
                    setTimeout(() => {
                        setBubble(msg);
                        setTimeout(() => setBubble(null), 1800);
                    }, 1200);
                } else if (behaviour === 'chatting') {
                    const msg = CHAT_BUBBLES[Math.floor(Math.random() * CHAT_BUBBLES.length)];
                    setBubble(msg);
                    setTimeout(() => setBubble(null), 2000);
                } else if (behaviour === 'waiting') {
                    setBubble('...');
                    setTimeout(() => setBubble(null), 1500);
                } else if (behaviour === 'phone') {
                    setShowFood(true);
                    setTimeout(() => setShowFood(false), 1200);
                }
            };
            fire(); // fire once immediately after the stagger delay
            interval = setInterval(fire, baseInterval);
        }, bubbleDelay);

        return () => {
            clearTimeout(t);
            clearInterval(interval);
        };
    }, [behaviour, bubbleDelay]);

    const isEating = behaviour === 'eating';

    return (
        <div className="absolute" style={{ left: pos[0], top: pos[1], zIndex: 200 }}>
            {/* Speech bubble */}
            {bubble && (
                <div
                    className="absolute pointer-events-none z-[9999] whitespace-nowrap"
                    style={{
                        bottom: 52,
                        left: flip ? 'auto' : '50%',
                        right: flip ? '50%' : 'auto',
                        transform: flip ? 'translateX(50%)' : 'translateX(-50%)',
                        animation: 'fadeInUp 0.25s ease',
                    }}
                >
                    <div className="bg-white rounded-lg px-2 py-1 text-[11px] font-bold text-gray-800 shadow-lg border border-gray-200 relative">
                        {bubble}
                        {/* Tail */}
                        <div
                            className="absolute w-2 h-2 bg-white border-b border-r border-gray-200 rotate-45"
                            style={{ bottom: -5, left: flip ? 'auto' : '50%', right: flip ? '50%' : 'auto', transform: 'translateX(-50%) rotate(45deg)' }}
                        />
                    </div>
                </div>
            )}

            {/* Food / phone emoji pop */}
            {showFood && (
                <div
                    className="absolute pointer-events-none text-base z-[9999]"
                    style={{
                        top: -38,
                        left: '50%',
                        transform: 'translateX(-50%) translateY(-4px) scale(1.1)',
                        transition: 'all 0.3s ease',
                        filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))',
                    }}
                >
                    {behaviour === 'phone' ? '📱' : foodEmoji}
                </div>
            )}

            {/* Character */}
            <div
                style={{
                    transform: `scale(1.2) ${flip ? 'scaleX(-1)' : ''}`,
                    transformOrigin: 'bottom center',
                    animation: isEating ? `amongUsBob 0.5s ease-in-out ${bubbleDelay % 200}ms infinite alternate` : undefined,
                }}
            >
                <Character targetX={0} targetY={0} color={color} />
            </div>
        </div>
    );
};

// ─── Small round dining table with realistic mix of behaviours ───
const DiningTable = ({ x, y, chars }: {
    x: number; y: number;
    chars: { color: string; pos: [number, number]; flip?: boolean; behaviour: SeatBehaviour; foodEmoji?: string }[];
}) => {
    return (
        <div className="absolute" style={{ left: x, top: y, zIndex: Math.floor(y) }}>
            {/* Characters */}
            {chars.map((c, i) => (
                <DiningSeat
                    key={i}
                    color={c.color}
                    pos={c.pos}
                    flip={c.flip}
                    behaviour={c.behaviour}
                    foodEmoji={c.foodEmoji}
                    bubbleDelay={i * 700 + 500}
                />
            ))}
            {/* Table top */}
            <div
                className="absolute rounded-full bg-[#6B3410] border-[6px] border-[#3E1F07] shadow-lg"
                style={{ width: 80, height: 50, left: -40, top: -25, zIndex: 5 }}
            >
                {/* Food items on table surface */}
                <div className="flex items-center justify-center gap-1 h-full">
                    <div className="w-3 h-3 rounded-full bg-red-400 shadow-inner"></div>
                    <div className="w-4 h-4 rounded-full bg-yellow-300 shadow-inner"></div>
                    <div className="w-3 h-4 bg-white rounded-sm shadow-inner"></div>
                </div>
            </div>
        </div>
    );
};

// ─── Person-sized Kiosk (about character height) ───
const KioskMachine = ({ x, y }: { x: number; y: number }) => {
    const [active, setActive] = useState(false);
    useEffect(() => {
        const t = setInterval(() => {
            setActive(true);
            setTimeout(() => setActive(false), 600);
        }, 2200 + Math.random() * 1200);
        return () => clearInterval(t);
    }, []);
    return (
        <div className="absolute" style={{ left: x, top: y, zIndex: Math.floor(y) }}>
            {/* Stand pole */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[8px] h-[40px] bg-gray-500"></div>
            {/* Screen body */}
            <div
                className="absolute left-1/2 -translate-x-1/2 bottom-[35px] w-[50px] h-[65px] bg-gray-200 rounded-lg border-[4px] shadow-lg flex flex-col items-center p-1.5 overflow-hidden transition-all duration-300"
                style={{ borderColor: active ? '#22c55e' : '#9ca3af', boxShadow: active ? '0 0 12px rgba(34,197,94,0.6)' : undefined }}
            >
                <div className="w-full h-3 bg-red-400 rounded-sm mb-1"></div>
                <div className="flex gap-0.5 w-full flex-1">
                    <div className="w-1/2 h-full bg-slate-600 rounded-sm"></div>
                    <div className="w-1/2 h-full bg-slate-600 rounded-sm"></div>
                </div>
                <div
                    className="w-[85%] h-3 rounded mt-1 transition-all duration-300"
                    style={{
                        backgroundColor: active ? '#22c55e' : '#16a34a',
                        boxShadow: active ? '0 0 8px rgba(34,197,94,0.9)' : '0 0 4px rgba(34,197,94,0.4)',
                    }}
                ></div>
                <div className="absolute inset-0 bg-cyan-200/10 pointer-events-none rounded-md"></div>
                {active && (
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-400 animate-ping"></div>
                )}
            </div>
            {/* Base */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[-4px] w-[30px] h-[8px] bg-gray-500 rounded-sm"></div>
        </div>
    );
};

export default function Storyboard({ element, isSelected, onClick }: Props) {
    const { data } = element;
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(-1);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (isPlaying && !isPaused) {
            if (currentIndex < data.dialogues.length - 1) {
                timer = setTimeout(() => setCurrentIndex(prev => prev + 1), 3500);
            } else {
                const endTimer = setTimeout(() => setIsPlaying(false), 3500);
                return () => clearTimeout(endTimer);
            }
        }
        return () => { if (timer) clearTimeout(timer); };
    }, [isPlaying, isPaused, currentIndex, data.dialogues.length]);

    const handleStart = (e: React.MouseEvent) => { e.stopPropagation(); setIsPlaying(true); setIsPaused(false); if (currentIndex === -1 || currentIndex === data.dialogues.length - 1) setCurrentIndex(0); };
    const handlePause = (e: React.MouseEvent) => { e.stopPropagation(); setIsPaused(true); };
    const handleResume = (e: React.MouseEvent) => { e.stopPropagation(); setIsPaused(false); };
    const handleRestart = (e: React.MouseEvent) => { e.stopPropagation(); setIsPlaying(true); setIsPaused(false); setCurrentIndex(0); };

    const uniqueCharacters = Array.from(new Set(data.dialogues.map(d => d.characterName))).map(name =>
        data.dialogues.find(d => d.characterName === name)!
    );
    const activeDialog = currentIndex >= 0 && currentIndex < data.dialogues.length ? data.dialogues[currentIndex] : null;

    // ────── PROBLEM SCENE positions ──────
    // Carl and Janice are clearly behind the counter (at top of counter, small counter)
    // Queue snakes through the middle-right area
    // Tables are in the bottom foreground
    const problemCharPos: Record<string, { x: number; y: number; flip: boolean }> = {
        'Harry': { x: 580, y: 490, flip: false },
        'Wife': { x: 530, y: 490, flip: false },
        'Carl (Cashier)': { x: 160, y: 370, flip: false },
        'Janice (Manager)': { x: 80, y: 370, flip: false },
    };

    // ────── SOLUTION SCENE positions ──────
    // Harry & Wife at the kiosks, Carl behind counter prepping, Janice observing
    const solutionCharPos: Record<string, { x: number; y: number; flip: boolean }> = {
        'Harry': { x: 340, y: 560, flip: false },
        'Wife': { x: 240, y: 560, flip: false },
        'Carl (Cashier)': { x: 140, y: 370, flip: false },
        'Janice (Manager)': { x: 550, y: 560, flip: true },
    };

    const charPositions = data.boardType === 'problem' ? problemCharPos : solutionCharPos;

    // ────── Queue generation (problem only) ──────
    // The counter is on the LEFT side. Everyone in the queue faces LEFT (toward cashier).
    // flip=true  → character faces LEFT  (toward counter) ✓
    // flip=false → character faces RIGHT (away from counter) ✗
    //
    // Queue snakes:
    //   Row 1: closest to counter, leftmost person is next to be served → faces LEFT (flip:true)
    //   Row 2: wraps around to the right, everyone still faces LEFT (flip:true)
    //   Row 3: back row, everyone faces LEFT (flip:true)
    const queueChars = React.useMemo(() => {
        if (data.boardType !== 'problem') return [];
        const q: { x: number; y: number; color: string; flip: boolean; label: string }[] = [];

        // Row 1 (y=420): nearest to counter, people stand from x=250 going right
        // The person at x=250 is closest to the cashier — they all face LEFT (flip:true)
        const row1Y = 420;
        for (let i = 0; i < 9; i++) {
            q.push({
                x: 250 + i * 55,
                y: row1Y,
                color: CROWD_COLORS[i % CROWD_COLORS.length],
                flip: true,   // face LEFT toward cashier
                label: i === 3 ? 'Ugh, this wait...' : '',
            });
        }

        // Row 2 (y=480): wraps back — people continue from right side going left
        // They are still in line facing the cashier → face LEFT (flip:true)
        const row2Y = 480;
        for (let i = 0; i < 8; i++) {
            const xPos = 700 - i * 55;
            // Skip positions occupied by Harry & Wife (around x=530-580)
            if (xPos >= 510 && xPos <= 610) continue;
            q.push({
                x: xPos,
                y: row2Y,
                color: CROWD_COLORS[(i + 9) % CROWD_COLORS.length],
                flip: true,   // face LEFT toward cashier
                label: '',
            });
        }

        // Row 3 (y=540): back of the queue, still face LEFT
        const row3Y = 540;
        for (let i = 0; i < 6; i++) {
            q.push({
                x: 300 + i * 55,
                y: row3Y,
                color: CROWD_COLORS[(i + 5) % CROWD_COLORS.length],
                flip: true,   // face LEFT toward cashier
                label: i === 1 ? 'Hungry...' : '',
            });
        }
        return q;
    }, [data.boardType]);

    // ────── Dining tables — realistic scene mix ──────
    // Each table has a real scenario: some eat, some chat, some wait, one on phone
    const tables = React.useMemo(() => [
        {
            // Table 1: couple eating happily + one chatting + one on phone
            x: 150, y: 680,
            chars: [
                { color: '#EF4444', pos: [-50, -35] as [number, number], behaviour: 'eating' as SeatBehaviour, foodEmoji: '🍔' },
                { color: '#F59E0B', pos: [50, -35] as [number, number], flip: true, behaviour: 'eating' as SeatBehaviour, foodEmoji: '🥤' },
                { color: '#10B981', pos: [-50, 20] as [number, number], behaviour: 'chatting' as SeatBehaviour },
                { color: '#3B82F6', pos: [50, 20] as [number, number], flip: true, behaviour: 'phone' as SeatBehaviour },
            ],
        },
        {
            // Table 2: two eating, one waiting for food, one chatting
            x: 380, y: 690,
            chars: [
                { color: '#EC4899', pos: [-50, -35] as [number, number], behaviour: 'eating' as SeatBehaviour, foodEmoji: '🍕' },
                { color: '#8B5CF6', pos: [50, -35] as [number, number], flip: true, behaviour: 'waiting' as SeatBehaviour },
                { color: '#F97316', pos: [-50, 20] as [number, number], behaviour: 'chatting' as SeatBehaviour },
                { color: '#14B8A6', pos: [50, 20] as [number, number], flip: true, behaviour: 'eating' as SeatBehaviour, foodEmoji: '🍗' },
            ],
        },
        {
            // Table 3: friends group — two chatting, one eating, one waiting
            x: 610, y: 680,
            chars: [
                { color: '#A855F7', pos: [-50, -35] as [number, number], behaviour: 'chatting' as SeatBehaviour },
                { color: '#84CC16', pos: [50, -35] as [number, number], flip: true, behaviour: 'eating' as SeatBehaviour, foodEmoji: '🌮' },
                { color: '#D946EF', pos: [-50, 20] as [number, number], behaviour: 'waiting' as SeatBehaviour },
                { color: '#EAB308', pos: [50, 20] as [number, number], flip: true, behaviour: 'chatting' as SeatBehaviour },
            ],
        },
        {
            // Table 4: one eating, two chatting, one on phone
            x: 840, y: 690,
            chars: [
                { color: '#06B6D4', pos: [-50, -35] as [number, number], behaviour: 'eating' as SeatBehaviour, foodEmoji: '🍟' },
                { color: '#EF4444', pos: [50, -35] as [number, number], flip: true, behaviour: 'chatting' as SeatBehaviour },
                { color: '#64748B', pos: [-50, 20] as [number, number], behaviour: 'phone' as SeatBehaviour },
                { color: '#F59E0B', pos: [50, 20] as [number, number], flip: true, behaviour: 'eating' as SeatBehaviour, foodEmoji: '🧁' },
            ],
        },
    ], []);

    // ────── Waiter positions ──────
    // Problem board: waiter picks up from counter/manager area, trudges slowly to each table
    // ── PROBLEM BOARD: waiter is slow & stressed ──
    // Layout:  Counter/wall at x=0-220, y=360-400. Brick wall top is ~y=360.
    //          Queue crowd fills x=250-750, y=420-540. Each character is ~44px tall
    //          so a char at y=420 extends UP to y=376.
    // Safe corridor ABOVE crowd: y=320 (well above y=376 top of queue row 1)
    // Safe corridor BELOW crowd: y=590 (crowd bottom row y=540, chars ~44px tall → bottom at y=584)
    // Safe column RIGHT of crowd: x=920 (crowd rightmost x=700+~28px = x=728)
    // Safe column LEFT of crowd:  x=40  (crowd starts at x=250; counter wall is here)
    //
    // Manager pickup point: x=185, y=375 (standing at counter, above wall)
    // After pickup, waiter steps UP to y=320 safe corridor before going anywhere.
    const problemManagerPos = React.useMemo(() => ({ x: 185, y: 375 }), []);
    const problemTablePositions = React.useMemo(() => [
        {
            // Table 1 (x=150) — go left to x=40 (behind counter wall), drop down clear of crowd
            x: 150, y: 655,
            approachWaypoints: [
                { x: 185, y: 320 },  // step up above the wall / crowd tops
                { x: 40,  y: 320 },  // slide left behind the counter wall
                { x: 40,  y: 655 },  // drop straight down — x=40 is clear of crowd (starts x=250)
            ],
            returnWaypoints: [
                { x: 40,  y: 320 },  // back up left wall
                { x: 185, y: 320 },  // slide to counter
            ],
        },
        {
            // Table 2 (x=380) — go UP to y=320, slide RIGHT past crowd to x=920, drop to y=590, slide left to table
            x: 380, y: 660,
            approachWaypoints: [
                { x: 185, y: 320 },  // up to safe corridor
                { x: 920, y: 320 },  // all the way right above crowd (crowd right edge ~x=728)
                { x: 920, y: 590 },  // drop below crowd (crowd bottom ~y=584)
                { x: 380, y: 590 },  // slide left below crowd
            ],
            returnWaypoints: [
                { x: 920, y: 590 },  // slide right below crowd
                { x: 920, y: 320 },  // back up right side
                { x: 185, y: 320 },  // slide back to counter
            ],
        },
        {
            // Table 3 (x=610) — same top-right corridor approach
            x: 610, y: 655,
            approachWaypoints: [
                { x: 185, y: 320 },
                { x: 920, y: 320 },
                { x: 920, y: 590 },
                { x: 610, y: 590 },
            ],
            returnWaypoints: [
                { x: 920, y: 590 },
                { x: 920, y: 320 },
                { x: 185, y: 320 },
            ],
        },
        {
            // Table 4 (x=840) — go right then drop, barely need to slide left
            x: 840, y: 660,
            approachWaypoints: [
                { x: 185, y: 320 },
                { x: 920, y: 320 },
                { x: 920, y: 590 },
                { x: 840, y: 590 },
            ],
            returnWaypoints: [
                { x: 920, y: 590 },
                { x: 920, y: 320 },
                { x: 185, y: 320 },
            ],
        },
    ], []);

    // ── SOLUTION BOARD: server is fast & efficient ──
    // No crowd in solution board — tables are in the open, just go directly
    const solutionManagerPos = React.useMemo(() => ({ x: 180, y: 380 }), []);
    const solutionTablePositions = React.useMemo(() => [
        { x: 150, y: 650 },
        { x: 380, y: 660 },
        { x: 610, y: 650 },
        { x: 840, y: 660 },
    ], []);

    return (
        <div
            onClick={onClick}
            className={`
                bg-[#1e1e1e] rounded-[24px] shadow-2xl border-[6px] flex flex-col overflow-hidden relative
                transform transition-all duration-200
                ${isSelected ? 'ring-6 ring-blue-500 scale-[1.02] border-[#2a2c33]' : 'border-[#3a3c43] hover:scale-[1.01]'}
            `}
            style={{ fontFamily: 'Inter, sans-serif', width: element.width, height: element.height }}
        >
            {/* ── HEADER ── */}
            <div className="bg-[#2a2c33] px-5 py-3 flex items-center justify-between border-b-4 border-[#1a1c23] shrink-0 z-50 relative">
                <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                    <h3 className="font-bold text-gray-200 uppercase tracking-widest text-base">
                        {data.boardType === 'problem' ? 'Report: Problem' : 'Task: Solution'}
                    </h3>
                </div>
                {data.boardType === 'problem' && (
                    <div className="bg-red-500 text-white font-bold text-sm px-4 py-1.5 rounded-lg shadow-lg">ORDER</div>
                )}
            </div>

            {/* ── STAGE ── */}
            <div className="flex-1 relative bg-[#2a2520] overflow-hidden">

                {/* === BACK WALL (dark, with subtle brown tint) === */}
                <div className="absolute top-0 left-0 right-0 h-[320px] bg-[#1c1816]">
                    {/* Overhead hanging lights */}
                    <div className="absolute top-0 left-[280px] -translate-x-1/2">
                        <div className="w-3 h-[30px] bg-gray-600 mx-auto"></div>
                        <div className="w-[40px] h-[20px] bg-gray-500 rounded-b-full mx-auto"></div>
                        {/* Light cone */}
                        <div className="absolute top-[50px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[120px] border-r-[120px] border-b-[350px] border-l-transparent border-r-transparent border-b-yellow-100/[0.04] pointer-events-none"></div>
                    </div>
                    <div className="absolute top-0 left-[750px] -translate-x-1/2">
                        <div className="w-3 h-[30px] bg-gray-600 mx-auto"></div>
                        <div className="w-[40px] h-[20px] bg-gray-500 rounded-b-full mx-auto"></div>
                        <div className="absolute top-[50px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[120px] border-r-[120px] border-b-[350px] border-l-transparent border-r-transparent border-b-yellow-100/[0.04] pointer-events-none"></div>
                    </div>

                    {/* Menu board on left wall */}
                    <div className="absolute left-[100px] top-[80px] w-[280px] h-[120px] bg-[#111] border-[6px] border-[#5C2E0B] rounded-md flex flex-col p-3 shadow-2xl">
                        <h2 className="text-white font-black text-center text-2xl tracking-[0.2em] mb-2">MENU</h2>
                        <div className="flex gap-2 w-full mb-2">
                            <div className="h-2 flex-1 bg-red-500 rounded-full"></div>
                            <div className="h-2 flex-1 bg-yellow-400 rounded-full"></div>
                        </div>
                        <div className="flex gap-2 w-full">
                            <div className="h-2 w-1/3 bg-green-500 rounded-full"></div>
                            <div className="h-2 w-2/3 bg-orange-400 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* === WAINSCOTING (wood paneling strip) === */}
                <div
                    className="absolute top-[320px] left-0 right-0 h-[60px] bg-[#8B4513] border-t-[6px] border-b-[6px] border-[#5C2E0B]"
                    style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(0,0,0,0.3) 50px, rgba(0,0,0,0.3) 54px)' }}
                ></div>

                {/* === FLOOR (darker, below wainscoting) === */}
                <div className="absolute top-[386px] left-0 right-0 bottom-0 bg-[#1a1816]"
                    style={{ backgroundImage: 'repeating-conic-gradient(#1a1816 0% 25%, #151310 0% 50%) 0 0 / 40px 40px' }}
                ></div>

                {/* === COUNTER (compact, left side, clearly behind which staff stand) === */}
                <div className="absolute left-0 top-[360px] z-[400]">
                    {/* Counter top surface */}
                    <div className="w-[220px] h-[40px] bg-[#8B4513] border-t-[6px] border-r-[6px] border-[#5C2E0B] flex items-center justify-end px-4 rounded-tr-md">
                        {/* Small register */}
                        <div className="w-[28px] h-[22px] bg-gray-300 border-2 border-gray-500 rounded-sm"></div>
                    </div>
                    {/* Counter front face */}
                    <div className="w-[220px] h-[60px] bg-[#5C2E0B] border-r-[6px] border-[#3E1F07]"></div>
                </div>

                {/* === QUEUE (problem only) === */}
                {queueChars.map((q, i) => (
                    <React.Fragment key={`q-${i}`}>
                        <ScaledChar x={q.x} y={q.y} color={q.color} flip={q.flip} />
                        {/* Frustrated bubbles — only after START REPORT is clicked */}
                        {q.label && (
                            <CrowdBubble
                                x={q.x}
                                y={q.y}
                                phrases={FRUSTRATED_PHRASES[q.label === 'Hungry...' ? 0 : 1]}
                                delayMs={q.label === 'Hungry...' ? 1200 : 600}
                                active={isPlaying}
                            />
                        )}
                    </React.Fragment>
                ))}

                {/* === DINING TABLES === */}
                {tables.map((t, i) => (
                    <DiningTable key={`t-${i}`} x={t.x} y={t.y} chars={t.chars} />
                ))}

                {/* === WAITER CHARACTER (problem board: stressed, slow) === */}
                {data.boardType === 'problem' && (
                    <WaiterCharacter
                        color="#EAB308"
                        managerPos={problemManagerPos}
                        tablePositions={problemTablePositions}
                        speed={0.7}
                    />
                )}

                {/* === WAITER CHARACTER (solution board: efficient, fast) === */}
                {data.boardType === 'solution' && (
                    <WaiterCharacter
                        color="#10B981"
                        managerPos={solutionManagerPos}
                        tablePositions={solutionTablePositions}
                        speed={1.8}
                    />
                )}

                {/* === KIOSKS (solution only, person-sized) === */}
                {data.boardType === 'solution' && (
                    <>
                        <KioskMachine x={280} y={530} />
                        <KioskMachine x={420} y={530} />
                        <KioskMachine x={560} y={530} />
                    </>
                )}

                {/* === MAIN CAST CHARACTERS === */}
                {uniqueCharacters.map((char) => {
                    const isSpeaking = activeDialog?.characterName === char.characterName;
                    const pos = charPositions[char.characterName] || { x: 500, y: 500, flip: false };

                    return (
                        <div key={char.characterName} className="absolute" style={{ left: pos.x, top: pos.y, zIndex: Math.floor(pos.y + 200) }}>
                            {/* Speech Bubble */}
                            <div className={`
                                absolute bottom-[75px] w-[280px] z-[9999]
                                transition-all duration-300 origin-bottom
                                ${isSpeaking ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}
                                ${pos.flip ? 'right-[-60px] origin-bottom-right' : 'left-[-60px] origin-bottom-left'}
                            `}>
                                <div className="bg-white rounded-xl p-4 shadow-2xl relative border-[3px] border-gray-300">
                                    <p className="text-gray-900 text-[15px] font-bold leading-snug">{activeDialog?.text}</p>
                                    <div className={`absolute -bottom-[12px] w-6 h-6 bg-white border-b-[3px] border-r-[3px] border-gray-300 transform rotate-45 ${pos.flip ? 'right-10' : 'left-10'}`}></div>
                                </div>
                            </div>

                            {/* Character (scale 1.3) */}
                            <div style={{ transform: `scale(1.3) ${pos.flip ? 'scaleX(-1)' : ''}`, transformOrigin: 'bottom center' }}>
                                <div className={`relative ${isSpeaking ? 'animate-bounce' : ''}`} style={{ animationDuration: '2s' }}>
                                    <Character targetX={0} targetY={0} color={char.color} />
                                </div>
                            </div>

                            {/* Name Tag */}
                            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-black/90 border border-white/20 px-2 py-0.5 rounded text-white text-[11px] font-bold shadow-lg whitespace-nowrap">
                                {char.characterName}
                            </div>
                        </div>
                    );
                })}

                {/* === START OVERLAY === */}
                {!isPlaying && currentIndex === -1 && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center z-[5000]">
                        <div className="w-24 h-24 mb-8 flex items-center justify-center rounded-full bg-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.4)]">
                            <div style={{ transform: 'scale(1.8)' }}>
                                <Character targetX={0} targetY={0} color="#06B6D4" />
                            </div>
                        </div>
                        <button
                            onPointerDownCapture={handleStart}
                            className="px-10 py-5 bg-green-500 hover:bg-green-400 text-white font-black rounded-xl border-b-[6px] border-green-700 active:border-b-0 active:translate-y-1 transition-all text-2xl shadow-[0_0_30px_rgba(34,197,94,0.5)] pointer-events-auto flex items-center gap-3"
                        >
                            <span>START {data.boardType === 'problem' ? 'REPORT' : 'TASK'}</span>
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z" /></svg>
                        </button>
                    </div>
                )}

                {/* Vignette */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.5)_150%)] z-[300]"></div>
            </div>

            {/* ── CONTROLS BAR ── */}
            <div className="bg-[#1a1c23] px-6 py-4 flex items-center justify-between border-t-4 border-[#2a2c33] shrink-0 z-50 relative">
                <div className="flex gap-3">
                    {isPlaying && !isPaused ? (
                        <button onPointerDownCapture={handlePause} className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-white font-bold rounded-lg border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1 transition-all text-sm pointer-events-auto shadow-lg">PAUSE</button>
                    ) : (
                        <button onPointerDownCapture={currentIndex === -1 ? handleStart : handleResume} className="px-6 py-2.5 bg-green-500 hover:bg-green-400 text-white font-bold rounded-lg border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all text-sm pointer-events-auto shadow-lg">{currentIndex === -1 ? 'START' : 'RESUME'}</button>
                    )}
                    <button onPointerDownCapture={handleRestart} className="px-6 py-2.5 bg-red-500 hover:bg-red-400 text-white font-bold rounded-lg border-b-4 border-red-700 active:border-b-0 active:translate-y-1 transition-all text-sm pointer-events-auto shadow-lg">RESTART</button>

                </div>
                <div className="flex gap-2">
                    {data.dialogues.map((_, idx) => (
                        <div key={idx} className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-blue-400 scale-125 shadow-[0_0_10px_rgba(96,165,250,0.8)]' : idx < currentIndex ? 'bg-gray-400' : 'bg-[#3a3c43]'}`} />
                    ))}
                </div>
            </div>
        </div>
    );
}
