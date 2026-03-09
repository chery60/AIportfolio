import { useState, useRef, useCallback } from 'react';
import type { GameZoneElement } from '../../types';
import { useGameSession } from '../../hooks/useGameSession';
import GameEngine from './GameEngine';
import Leaderboard from './Leaderboard';

interface Props {
  element: GameZoneElement;
  isSelected: boolean;
  onClick: () => void;
  localColor?: string;
}

// Fallback stable random color if localColor not provided
const FALLBACK_COLOR = `hsl(${Math.floor(Math.random() * 360)}, 75%, 60%)`;

export default function GameZone({ element, isSelected, onClick, localColor }: Props) {
  const SESSION_COLOR = localColor || FALLBACK_COLOR;
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

  const [nameInput, setNameInput] = useState('');
  const [nameError, setNameError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleStartClick = () => {
    // If we already have a saved name from a previous game, reuse it directly
    if (myName && myName.length >= 2) {
      startPlaying(myName, SESSION_COLOR);
      return;
    }
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed.length < 2) {
      setNameError('Please enter at least 2 characters.');
      inputRef.current?.focus();
      return;
    }
    if (trimmed.length > 20) {
      setNameError('Name must be 20 characters or less.');
      return;
    }
    setNameError('');
    startPlaying(trimmed, SESSION_COLOR);
  };

  const handleGameOver = useCallback((score: number) => {
    endGame(score);
  }, [endGame]);

  // Play Again: reuse existing name — no need to clear it
  const handlePlayAgain = useCallback(() => {
    resetGame();
    // Don't clear nameInput — myName is preserved in useGameSession
  }, [resetGame]);

  return (
    <div
      onClick={e => { e.stopPropagation(); onClick(); }}
      onMouseDown={e => e.stopPropagation()}
      onWheel={e => e.stopPropagation()}
      className="relative rounded-2xl overflow-hidden select-none"
      style={{
        width: element.width,
        height: element.height,
        background: 'linear-gradient(135deg, #0A0B0F 0%, #0E0F16 100%)',
        border: isSelected
          ? `2px solid ${data.accentColor}`
          : '2px solid rgba(255,255,255,0.08)',
        boxShadow: isSelected
          ? `0 0 0 3px ${data.accentColor}40, 0 24px 60px rgba(0,0,0,0.5)`
          : '0 24px 60px rgba(0,0,0,0.4)',
      }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b border-white/8"
        style={{ borderBottomColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
            style={{ background: `${data.accentColor}25`, border: `1px solid ${data.accentColor}40` }}
          >
            🎮
          </div>
          <div>
            <p className="text-sm font-bold text-white">{data.title}</p>
            <p className="text-[10px] text-white/30 font-mono uppercase tracking-wider">
              Crewmate Dash · 1 Player at a Time
            </p>
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: sessionState === 'playing' ? '#10B981' : '#F59E0B' }}
          />
          <span className="text-[10px] text-white/40 font-mono">
            {sessionState === 'playing' ? 'LIVE' : 'READY'}
          </span>
        </div>
      </div>

      {/* ── IDLE STATE — full-width game preview + leaderboard below ── */}
      {(sessionState === 'idle' || sessionState === 'waiting') && (
        <div className="flex flex-col h-[calc(100%-52px-210px)]">
          {sessionState === 'waiting' ? (
            <div className="flex-1 w-full relative bg-[#0A0B0F] overflow-hidden">
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full border border-white/10">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white/80 text-xs font-semibold">Watching {currentPlayer} live</span>
              </div>
              <GameEngine
                playerColor={currentPlayerColor || SESSION_COLOR}
                onGameOver={() => { }}
                isSpectator={true}
              />
            </div>
          ) : (
            <>
              {/* Game preview card — full width, grows to fill */}
              <div
                className="w-full flex-1 flex flex-col items-center justify-center gap-4 px-8"
                style={{
                  background: 'linear-gradient(135deg, #0D0E1A 0%, #111320 100%)',
                  borderBottom: `1px solid ${data.accentColor}20`,
                }}
              >
                {/* Game title */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-black text-white tracking-tight leading-none">
                    🎮 Crewmate Dash
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: data.accentColor }}>
                    Design Survival Runner
                  </span>
                </div>
                {/* Rules */}
                <div className="flex items-center justify-center gap-6">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl">⎵</span>
                    <span className="text-[9px] text-white/40 font-semibold uppercase tracking-wider text-center">Space / Tap<br />to Jump</span>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl">⬆️</span>
                    <span className="text-[9px] text-white/40 font-semibold uppercase tracking-wider text-center">Double<br />Jump</span>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl">🚫</span>
                    <span className="text-[9px] text-white/40 font-semibold uppercase tracking-wider text-center">Dodge<br />Obstacles</span>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl">★</span>
                    <span className="text-[9px] text-white/40 font-semibold uppercase tracking-wider text-center">Collect<br />Coins</span>
                  </div>
                </div>
              </div>

              {/* Bottom controls — compact, centered */}
              <div className="flex flex-col items-center gap-3 px-8 py-5 w-full"
                style={{ borderBottom: 'none' }}
              >
                {/* Name input — hidden when name is already known */}
                {!myName ? (
                  <div className="flex flex-col gap-2 w-full max-w-xs">
                    <label className="text-xs text-white/40 font-semibold uppercase tracking-wider">
                      Your Name
                    </label>
                    <input
                      ref={inputRef}
                      type="text"
                      value={nameInput}
                      onChange={e => { setNameInput(e.target.value); setNameError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleStartClick()}
                      placeholder="Enter your name..."
                      maxLength={20}
                      className="w-full border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 outline-none focus:border-white/30 transition-colors"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                      onClick={e => e.stopPropagation()}
                    />
                    {nameError && (
                      <p className="text-red-400 text-xs">{nameError}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full max-w-xs"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}>
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: SESSION_COLOR }} />
                    <span className="text-white/70 text-sm flex-1">Playing as <span className="font-bold text-white">{myName}</span></span>
                    <button
                      onClick={e => { e.stopPropagation(); clearName(); setNameInput(''); }}
                      className="text-white/30 text-xs hover:text-white/60 transition-colors"
                    >
                      change
                    </button>
                  </div>
                )}

                {/* Start button — compact */}
                <button
                  onClick={e => { e.stopPropagation(); handleStartClick(); }}
                  className="w-full max-w-xs py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${data.accentColor}, #F59E0B)`,
                    boxShadow: `0 4px 20px ${data.accentColor}50`,
                  }}
                >
                  {myName ? `🚀 Play Again as ${myName}` : '🚀 Start Game'}
                </button>

                {/* Controls hint */}
                <p className="text-white/20 text-xs text-center">
                  Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white/40 text-[10px] font-mono">Space</kbd> or tap to jump · Dodge obstacles!
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── PLAYING STATE ── */}
      {sessionState === 'playing' && (
        <div className="flex flex-col h-[calc(100%-52px)]">
          {/* Player badge */}
          <div className="flex items-center gap-2 px-5 py-2 border-b border-white/6"
            style={{ borderBottomColor: 'rgba(255,255,255,0.06)' }}
          >
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: SESSION_COLOR }} />
            <span className="text-xs font-semibold" style={{ color: SESSION_COLOR }}>
              {myName}
            </span>
            <span className="text-white/30 text-xs">— playing now</span>
          </div>

          {/* Game canvas — full width, no leaderboard column */}
          <div className="flex-1 flex items-center justify-center bg-[#0A0B0F]">
            <GameEngine
              playerColor={SESSION_COLOR}
              onGameOver={handleGameOver}
              onStateSync={sendSpectatorSync}
            />
          </div>
        </div>
      )}

      {/* ── GAME OVER STATE ── */}
      {sessionState === 'gameover' && (
        <div className="flex flex-col h-[calc(100%-52px)] overflow-hidden">
          {/* Result card — full width */}
          <div className="flex flex-col items-center justify-center gap-5 flex-1 px-8 py-6">
            {/* Score display */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-5xl">💀</span>
              <p className="text-white/50 text-xs font-bold uppercase tracking-widest mt-2">
                Eliminated by bad design
              </p>
              <div className="mt-3 flex flex-col items-center">
                <span className="text-6xl font-black text-white font-mono">
                  {lastScore.toLocaleString()}
                </span>
                <span className="text-white/30 text-sm">points</span>
              </div>
            </div>

            {/* Contact CTA */}
            <div
              className="w-full max-w-sm rounded-xl p-4 flex flex-col gap-3"
              style={{
                background: `linear-gradient(135deg, ${data.accentColor}18, rgba(245,158,11,0.1))`,
                border: `1px solid ${data.accentColor}30`,
              }}
            >
              <p className="text-white/80 text-sm font-semibold text-center leading-snug">
                Like how I handle chaos? 🎮
              </p>
              <p className="text-white/40 text-xs text-center">
                Imagine what I'd do with your design brief.
              </p>
              <div className="flex gap-2">
                {data.contactEmail && (
                  <a
                    href={`mailto:${data.contactEmail}`}
                    onClick={e => e.stopPropagation()}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-xs font-bold transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: `linear-gradient(135deg, ${data.accentColor}, #F59E0B)`,
                      boxShadow: `0 4px 16px ${data.accentColor}40`,
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
                    onClick={e => e.stopPropagation()}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-xs font-bold transition-all hover:scale-105 active:scale-95"
                    style={{ background: '#0A66C2' }}
                  >
                    🔗 LinkedIn
                  </a>
                )}
              </div>
            </div>

            {/* Play again */}
            <button
              onClick={e => { e.stopPropagation(); handlePlayAgain(); }}
              className="w-full max-w-xs py-2.5 rounded-xl border border-white/15 text-white/60 text-sm font-semibold hover:bg-white/8 hover:text-white/90 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              🔄 Play Again
            </button>
          </div>

          {/* Leaderboard — below result, full width */}
          <div
            className="px-8 pt-5 pb-8"
            style={{ borderTop: 'rgba(255,255,255,0.06) 1px solid' }}
          >
            <Leaderboard
              scores={leaderboard}
              isLoading={isLoadingScores}
              myName={myName}
              myScore={lastScore}
            />
          </div>
        </div>
      )}

      {/* Leaderboard — always visible below idle state */}
      {(sessionState === 'idle' || sessionState === 'waiting') && (
        <div
          className="absolute bottom-0 left-0 right-0 px-8 pt-4 pb-6 overflow-hidden"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(10,11,15,0.95)',
            maxHeight: 210,
          }}
        >
          <Leaderboard
            scores={leaderboard}
            isLoading={isLoadingScores}
          />
        </div>
      )}

      {/* Decorative corner glow */}
      <div
        className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
        style={{
          background: `radial-gradient(circle at top right, ${data.accentColor}12, transparent 70%)`,
        }}
      />
    </div>
  );
}

