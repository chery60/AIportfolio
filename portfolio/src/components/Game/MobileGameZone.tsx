import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Eye, X, RotateCcw, LogOut, Trophy } from 'lucide-react';
import type { GameZoneElement } from '../../types';
import { useGameSession } from '../../hooks/useGameSession';
import GameEngine from './GameEngine';
import Leaderboard from './Leaderboard';

interface Props {
    element: GameZoneElement;
}

const FALLBACK_COLOR = `hsl(${Math.floor(Math.random() * 360)}, 75%, 60%)`;

export default function MobileGameZone({ element }: Props) {
    const { data } = element;
    const {
        sessionState,
        currentPlayer,
        currentPlayerColor,
        myName,
        leaderboard,
        isLoadingScores,
        lastScore,
        startPlaying,
        endGame,
        resetGame,
        clearName,
        sendSpectatorSync,
    } = useGameSession();

    const SESSION_COLOR = FALLBACK_COLOR;
    const [nameInput, setNameInput] = useState('');
    const [nameError, setNameError] = useState('');
    const [isLandscape, setIsLandscape] = useState(false);
    const [showNameScreen, setShowNameScreen] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);
    const landscapeRef = useRef<HTMLDivElement>(null);

    // Lock body scroll when landscape
    useEffect(() => {
        if (isLandscape) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.height = '100%';
        } else {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
        };
    }, [isLandscape]);

    const handlePlayTap = () => {
        setIsLandscape(true);
        if (myName && myName.length >= 2) {
            setShowNameScreen(false);
        } else {
            setShowNameScreen(true);
        }
    };

    const handleStartGame = () => {
        if (myName && myName.length >= 2) {
            startPlaying(myName, SESSION_COLOR);
            setShowNameScreen(false);
            return;
        }
        const trimmed = nameInput.trim();
        if (!trimmed || trimmed.length < 2) {
            setNameError('Enter at least 2 characters');
            inputRef.current?.focus();
            return;
        }
        if (trimmed.length > 20) {
            setNameError('Max 20 characters');
            return;
        }
        setNameError('');
        startPlaying(trimmed, SESSION_COLOR);
        setShowNameScreen(false);
    };

    const handleGameOver = useCallback((score: number) => {
        endGame(score);
    }, [endGame]);

    const handlePlayAgain = useCallback(() => {
        resetGame();
        // Stay in landscape — go directly to playing since name is known
        startPlaying(myName, SESSION_COLOR);
    }, [resetGame, startPlaying, myName, SESSION_COLOR]);

    const handleExit = useCallback(() => {
        if (sessionState === 'gameover') {
            resetGame();
        }
        setIsLandscape(false);
        setShowNameScreen(true);
    }, [sessionState, resetGame]);

    // ── Portrait Card (default in-scroll view) ─────────────────────────
    const renderPortraitCard = () => (
        <div
            className="w-full rounded-2xl overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #0A0B0F, #111320)',
                border: '1px solid rgba(255,255,255,0.08)',
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                        style={{ background: `${data.accentColor}25`, border: `1px solid ${data.accentColor}40` }}
                    >
                        🎮
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">{data.title}</p>
                        <p className="text-[10px] text-white/30 font-mono">1 Player at a Time</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ background: sessionState === 'waiting' ? '#10B981' : '#F59E0B' }}
                    />
                    <span className="text-[10px] text-white/40 font-mono">
                        {sessionState === 'waiting' ? 'LIVE' : 'READY'}
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="px-4 py-5">
                {sessionState === 'waiting' && currentPlayer ? (
                    /* Spectator view */
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Eye className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs text-white/70 font-medium">
                                Watching <span className="text-white font-bold">{currentPlayer}</span> play live
                            </span>
                        </div>
                        <div
                            className="w-full rounded-xl overflow-hidden border border-white/[0.06]"
                            style={{ aspectRatio: '1100/420' }}
                        >
                            <GameEngine
                                playerColor={currentPlayerColor || SESSION_COLOR}
                                onGameOver={() => { }}
                                isSpectator={true}
                            />
                        </div>
                        <p className="text-[10px] text-white/30 text-center mt-3">
                            Play button will appear when the game is over
                        </p>
                    </div>
                ) : (
                    /* Game preview + Play button */
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl font-black text-white">🎮 Crewmate Dash</span>
                            <span
                                className="text-[11px] font-bold uppercase tracking-widest"
                                style={{ color: data.accentColor }}
                            >
                                Design Survival Runner
                            </span>
                        </div>

                        {/* Rules */}
                        <div className="flex items-center justify-center gap-5">
                            {[
                                { icon: '👆', label: 'Tap to\nJump' },
                                { icon: '⬆️', label: 'Double\nJump' },
                                { icon: '🚫', label: 'Dodge\nObstacles' },
                                { icon: '★', label: 'Collect\nCoins' },
                            ].map((r, i) => (
                                <div key={i} className="flex flex-col items-center gap-1">
                                    <span className="text-lg">{r.icon}</span>
                                    <span className="text-[9px] text-white/40 font-semibold uppercase tracking-wider text-center whitespace-pre-line leading-tight">
                                        {r.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Play Button */}
                        <button
                            onClick={handlePlayTap}
                            className="w-full max-w-xs py-3.5 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all active:scale-95"
                            style={{
                                background: `linear-gradient(135deg, ${data.accentColor}, #F59E0B)`,
                                boxShadow: `0 6px 24px ${data.accentColor}50`,
                            }}
                        >
                            <Play className="w-5 h-5 fill-white" />
                            {myName ? `Play as ${myName}` : 'Play Game'}
                        </button>

                        <p className="text-white/20 text-[10px]">
                            Game will open in landscape mode
                        </p>
                    </div>
                )}
            </div>

            {/* Leaderboard */}
            <div className="px-4 pb-5 pt-3 border-t border-white/[0.06]">
                <Leaderboard scores={leaderboard} isLoading={isLoadingScores} />
            </div>
        </div>
    );

    // ── Landscape Overlay ─────────────────────────────────────────────
    const renderLandscapeOverlay = () => (
        <motion.div
            ref={landscapeRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mobile-landscape-overlay"
            style={{ background: 'linear-gradient(135deg, #050714, #0A0B1A)' }}
        >
            {/* Name Entry Screen */}
            {showNameScreen && sessionState !== 'playing' && sessionState !== 'gameover' && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-5 px-8">
                    {/* Close button */}
                    <button
                        onClick={handleExit}
                        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col items-center gap-1">
                        <span className="text-3xl font-black text-white">🎮 Crewmate Dash</span>
                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: data.accentColor }}>
                            Design Survival Runner
                        </span>
                    </div>

                    {!myName ? (
                        <div className="flex flex-col gap-3 w-full max-w-sm">
                            <label className="text-xs text-white/40 font-semibold uppercase tracking-wider">
                                Enter your name
                            </label>
                            <input
                                ref={inputRef}
                                type="text"
                                value={nameInput}
                                onChange={e => { setNameInput(e.target.value); setNameError(''); }}
                                onKeyDown={e => e.key === 'Enter' && handleStartGame()}
                                placeholder="Your name..."
                                maxLength={20}
                                autoFocus
                                className="w-full border border-white/10 rounded-xl px-4 py-3 text-white text-base placeholder-white/20 outline-none focus:border-white/30 transition-colors"
                                style={{ background: 'rgba(255,255,255,0.05)' }}
                            />
                            {nameError && <p className="text-red-400 text-xs">{nameError}</p>}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl w-full max-w-sm"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}>
                            <div className="w-3 h-3 rounded-full" style={{ background: SESSION_COLOR }} />
                            <span className="text-white/70 text-sm flex-1">Playing as <span className="font-bold text-white">{myName}</span></span>
                            <button
                                onClick={() => { clearName(); setNameInput(''); }}
                                className="text-white/30 text-xs hover:text-white/60 transition-colors"
                            >
                                change
                            </button>
                        </div>
                    )}

                    <button
                        onClick={handleStartGame}
                        className="w-full max-w-sm py-3.5 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all active:scale-95"
                        style={{
                            background: `linear-gradient(135deg, ${data.accentColor}, #F59E0B)`,
                            boxShadow: `0 6px 24px ${data.accentColor}50`,
                        }}
                    >
                        <Play className="w-5 h-5 fill-white" />
                        Start Game
                    </button>

                    <p className="text-white/20 text-xs text-center">
                        Tap anywhere to jump · Dodge obstacles!
                    </p>
                </div>
            )}

            {/* Playing State */}
            {sessionState === 'playing' && !showNameScreen && (
                <div className="w-full h-full flex flex-col">
                    {/* Player badge */}
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.06] flex-shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: SESSION_COLOR }} />
                        <span className="text-xs font-semibold" style={{ color: SESSION_COLOR }}>{myName}</span>
                        <span className="text-white/30 text-xs">— playing now</span>
                    </div>
                    {/* Game Canvas */}
                    <div className="flex-1 bg-[#050714]">
                        <GameEngine
                            playerColor={SESSION_COLOR}
                            onGameOver={handleGameOver}
                            onStateSync={sendSpectatorSync}
                        />
                    </div>
                </div>
            )}

            {/* Game Over State */}
            {sessionState === 'gameover' && (
                <div className="w-full h-full flex items-center justify-center gap-8 px-8">
                    {/* Score */}
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-5xl">💀</span>
                        <p className="text-white/50 text-xs font-bold uppercase tracking-widest">
                            Eliminated
                        </p>
                        <span className="text-6xl font-black text-white font-mono leading-none">
                            {lastScore.toLocaleString()}
                        </span>
                        <span className="text-white/30 text-sm">points</span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 w-52">
                        {/* Contact CTA */}
                        <div
                            className="rounded-xl p-3"
                            style={{
                                background: `linear-gradient(135deg, ${data.accentColor}18, rgba(245,158,11,0.1))`,
                                border: `1px solid ${data.accentColor}30`,
                            }}
                        >
                            <p className="text-white/80 text-sm font-semibold text-center leading-snug mb-1">
                                Like how I handle chaos? 🎮
                            </p>
                            <div className="flex gap-2">
                                {data.contactEmail && (
                                    <a
                                        href={`mailto:${data.contactEmail}`}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-white text-xs font-bold transition-all active:scale-95"
                                        style={{
                                            background: `linear-gradient(135deg, ${data.accentColor}, #F59E0B)`,
                                        }}
                                    >
                                        ✉️ Hire Me
                                    </a>
                                )}
                                {data.contactLinkedIn && (
                                    <a
                                        href={data.contactLinkedIn}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-white text-xs font-bold transition-all active:scale-95"
                                        style={{ background: '#0A66C2' }}
                                    >
                                        🔗 LinkedIn
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Play Again */}
                        <button
                            onClick={handlePlayAgain}
                            className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                            style={{
                                background: `linear-gradient(135deg, ${data.accentColor}, #F59E0B)`,
                                boxShadow: `0 4px 16px ${data.accentColor}40`,
                            }}
                        >
                            <RotateCcw className="w-4 h-4" />
                            Play Again
                        </button>

                        {/* Exit */}
                        <button
                            onClick={handleExit}
                            className="w-full py-2.5 rounded-xl border border-white/15 text-white/60 text-xs font-semibold hover:bg-white/5 hover:text-white/90 transition-all flex items-center justify-center gap-2 active:scale-95"
                            style={{ background: 'rgba(255,255,255,0.04)' }}
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Exit Game
                        </button>

                        {/* Leaderboard Mini */}
                        <div className="mt-1">
                            <div className="flex items-center gap-1.5 mb-2">
                                <Trophy className="w-3 h-3 text-yellow-500/60" />
                                <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Top 3</span>
                            </div>
                            {leaderboard.slice(0, 3).map((entry, idx) => (
                                <div key={entry.id} className="flex items-center gap-2 py-1">
                                    <span className="text-xs w-5 text-center">
                                        {['🥇', '🥈', '🥉'][idx]}
                                    </span>
                                    <span className="text-xs text-white/60 flex-1 truncate">{entry.player_name}</span>
                                    <span className="text-xs text-white/40 font-mono">{entry.score.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );

    return (
        <>
            {renderPortraitCard()}
            {createPortal(
                <AnimatePresence>
                    {isLandscape && renderLandscapeOverlay()}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
