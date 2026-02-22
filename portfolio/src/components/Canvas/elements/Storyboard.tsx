import React, { useEffect, useState } from 'react';
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
const ScaledChar = ({ color, x, y, scale = 1.3, flip = false }: {
    color: string; x: number; y: number; scale?: number; flip?: boolean;
}) => (
    <div className="absolute" style={{ left: x, top: y, zIndex: Math.floor(y + 100) }}>
        <div style={{ transform: `scale(${scale}) ${flip ? 'scaleX(-1)' : ''}`, transformOrigin: 'bottom center' }}>
            <Character targetX={0} targetY={0} color={color} />
        </div>
    </div>
);

// ─── Small round dining table with 2-4 characters sitting around it ───
const DiningTable = ({ x, y, chars }: { x: number; y: number; chars: { color: string; pos: [number, number]; flip?: boolean }[] }) => (
    <div className="absolute" style={{ left: x, top: y, zIndex: Math.floor(y) }}>
        {/* Characters around the table */}
        {chars.map((c, i) => (
            <ScaledChar key={i} color={c.color} x={c.pos[0]} y={c.pos[1]} scale={1.2} flip={c.flip} />
        ))}
        {/* The table itself – small, round */}
        <div
            className="absolute rounded-full bg-[#6B3410] border-[6px] border-[#3E1F07] shadow-lg"
            style={{ width: 80, height: 50, left: -40, top: -25, zIndex: Math.floor(y + 5) }}
        >
            {/* Food items */}
            <div className="flex items-center justify-center gap-1 h-full">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-4 h-4 rounded-full bg-yellow-300"></div>
                <div className="w-3 h-4 bg-white rounded-sm"></div>
            </div>
        </div>
    </div>
);

// ─── Person-sized Kiosk (about character height) ───
const KioskMachine = ({ x, y }: { x: number; y: number }) => (
    <div className="absolute" style={{ left: x, top: y, zIndex: Math.floor(y) }}>
        {/* Stand pole */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[8px] h-[40px] bg-gray-500"></div>
        {/* Screen body */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[35px] w-[50px] h-[65px] bg-gray-200 rounded-lg border-[4px] border-gray-400 shadow-lg flex flex-col items-center p-1.5 overflow-hidden">
            <div className="w-full h-3 bg-red-400 rounded-sm mb-1"></div>
            <div className="flex gap-0.5 w-full flex-1">
                <div className="w-1/2 h-full bg-slate-600 rounded-sm"></div>
                <div className="w-1/2 h-full bg-slate-600 rounded-sm"></div>
            </div>
            <div className="w-[85%] h-3 bg-green-500 rounded mt-1 shadow-[0_0_6px_rgba(34,197,94,0.5)]"></div>
            <div className="absolute inset-0 bg-cyan-200/10 pointer-events-none rounded-md"></div>
        </div>
        {/* Base */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[-4px] w-[30px] h-[8px] bg-gray-500 rounded-sm"></div>
    </div>
);

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
    const queueChars = React.useMemo(() => {
        if (data.boardType !== 'problem') return [];
        const q: { x: number; y: number; color: string; flip: boolean; label: string }[] = [];
        // Row 1: going right from counter → far right (y ~430)
        const row1Y = 420;
        for (let i = 0; i < 9; i++) {
            q.push({ x: 250 + i * 55, y: row1Y, color: CROWD_COLORS[i % CROWD_COLORS.length], flip: false, label: i === 2 ? 'Ugh, this wait...' : '' });
        }
        // Row 2: snaking back left (y ~480) — leave gap for Harry & Wife
        const row2Y = 480;
        for (let i = 0; i < 8; i++) {
            const xPos = 700 - i * 55;
            // Skip positions near Harry/Wife
            if (i === 2 || i === 3) continue;
            q.push({ x: xPos, y: row2Y, color: CROWD_COLORS[(i + 9) % CROWD_COLORS.length], flip: true, label: '' });
        }
        // Row 3: going right again (y ~540)
        const row3Y = 540;
        for (let i = 0; i < 6; i++) {
            q.push({ x: 300 + i * 55, y: row3Y, color: CROWD_COLORS[(i + 5) % CROWD_COLORS.length], flip: false, label: i === 1 ? 'Hungry...' : '' });
        }
        return q;
    }, [data.boardType]);

    // ────── Dining tables ──────
    const tables = React.useMemo(() => [
        {
            x: 150, y: 680,
            chars: [
                { color: '#EF4444', pos: [-50, -35] as [number, number] },
                { color: '#F59E0B', pos: [50, -35] as [number, number], flip: true },
                { color: '#10B981', pos: [-50, 20] as [number, number] },
                { color: '#3B82F6', pos: [50, 20] as [number, number], flip: true },
            ]
        },
        {
            x: 380, y: 690,
            chars: [
                { color: '#EC4899', pos: [-50, -35] as [number, number] },
                { color: '#8B5CF6', pos: [50, -35] as [number, number], flip: true },
                { color: '#F97316', pos: [-50, 20] as [number, number] },
                { color: '#14B8A6', pos: [50, 20] as [number, number], flip: true },
            ]
        },
        {
            x: 610, y: 680,
            chars: [
                { color: '#A855F7', pos: [-50, -35] as [number, number] },
                { color: '#84CC16', pos: [50, -35] as [number, number], flip: true },
                { color: '#D946EF', pos: [-50, 20] as [number, number] },
                { color: '#EAB308', pos: [50, 20] as [number, number], flip: true },
            ]
        },
        {
            x: 840, y: 690,
            chars: [
                { color: '#06B6D4', pos: [-50, -35] as [number, number] },
                { color: '#EF4444', pos: [50, -35] as [number, number], flip: true },
                { color: '#64748B', pos: [-50, 20] as [number, number] },
                { color: '#F59E0B', pos: [50, 20] as [number, number], flip: true },
            ]
        },
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
                        {q.label && (
                            <div className="absolute bg-white rounded-md px-2 py-0.5 text-[11px] text-black font-bold shadow-md whitespace-nowrap z-[9999]"
                                style={{ left: q.x - 10, top: q.y - 65 }}>
                                {q.label}
                            </div>
                        )}
                    </React.Fragment>
                ))}

                {/* === DINING TABLES === */}
                {tables.map((t, i) => (
                    <DiningTable key={`t-${i}`} x={t.x} y={t.y} chars={t.chars} />
                ))}

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
