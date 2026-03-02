import { useState, useRef, useCallback } from 'react';
import type { GameZoneElement } from '../../types';
import { useGameSession } from '../../hooks/useGameSession';
import GameEngine from './GameEngine';
import Leaderboard from './Leaderboard';
import WaitingRoom from './WaitingRoom';

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
    myName,
    leaderboard,
    isLoadingScores,
    lastScore,
    startPlaying,
    endGame,
    resetGame,
  } = useGameSession();

  const [nameInput, setNameInput] = useState('');
  const [nameError, setNameError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleStartClick = () => {
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
    startPlaying(trimmed);
  };

  const handleGameOver = useCallback((score: number) => {
    endGame(score);
  }, [endGame]);

  const handlePlayAgain = useCallback(() => {
    resetGame();
    setNameInput('');
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

      {/* ── IDLE STATE — Name entry + leaderboard ── */}
      {(sessionState === 'idle' || sessionState === 'waiting') && (
        <div className="flex h-[calc(100%-52px)]">
          {/* Left: Game preview / name entry */}
          <div className="flex flex-col items-center justify-center gap-5 flex-1 px-8 py-6 border-r border-white/6"
            style={{ borderRightColor: 'rgba(255,255,255,0.06)' }}
          >
            {sessionState === 'waiting' ? (
              <WaitingRoom
                currentPlayerName={currentPlayer}
                playerColor={SESSION_COLOR}
                onCancel={resetGame}
              />
            ) : (
              <>
                {/* Game preview illustration */}
                <div
                  className="w-full rounded-xl flex items-center justify-center relative overflow-hidden"
                  style={{
                    height: 140,
                    background: '#111216',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {/* Ground line */}
                  <div
                    className="absolute bottom-8 left-0 right-0 h-0.5"
                    style={{ background: data.accentColor, boxShadow: `0 0 8px ${data.accentColor}` }}
                  />
                  {/* Preview crewmate */}
                  <div className="absolute bottom-8 left-12">
                    <PreviewCrewmate color={SESSION_COLOR} />
                  </div>
                  {/* Preview obstacles */}
                  <div className="absolute bottom-8 right-12">
                    <ObstaclePreview color="#6366F1" label="Scope Creep" />
                  </div>
                  <div className="absolute bottom-8 right-36">
                    <ObstaclePreview color="#C74B18" label="Dev Says No" height={50} />
                  </div>
                  {/* Title overlay */}
                  <div className="absolute top-3 left-0 right-0 text-center">
                    <span className="text-xs font-bold text-white/30 uppercase tracking-widest">
                      Dodge the obstacles!
                    </span>
                  </div>
                </div>

                {/* Name input */}
                <div className="w-full flex flex-col gap-2">
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
                    className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 outline-none focus:border-white/30 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                    onClick={e => e.stopPropagation()}
                  />
                  {nameError && (
                    <p className="text-red-400 text-xs">{nameError}</p>
                  )}
                </div>

                {/* Start button */}
                <button
                  onClick={e => { e.stopPropagation(); handleStartClick(); }}
                  className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${data.accentColor}, #F59E0B)`,
                    boxShadow: `0 4px 20px ${data.accentColor}50`,
                  }}
                >
                  🚀 Start Game
                </button>

                {/* Controls hint */}
                <p className="text-white/20 text-xs text-center">
                  Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white/40 text-[10px] font-mono">Space</kbd> or tap to jump · Dodge obstacles!
                </p>
              </>
            )}
          </div>

          {/* Right: Leaderboard */}
          <div className="w-[280px] flex-shrink-0 px-5 py-5 overflow-y-auto">
            <Leaderboard
              scores={leaderboard}
              isLoading={isLoadingScores}
            />
          </div>
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

          {/* Game canvas */}
          <div className="flex-1 flex items-center justify-center bg-[#0A0B0F] p-2">
            <GameEngine
              playerColor={SESSION_COLOR}
              onGameOver={handleGameOver}
            />
          </div>
        </div>
      )}

      {/* ── GAME OVER STATE ── */}
      {sessionState === 'gameover' && (
        <div className="flex h-[calc(100%-52px)]">
          {/* Left: Result card */}
          <div className="flex flex-col items-center justify-center gap-5 flex-1 px-8 py-6 border-r border-white/6"
            style={{ borderRightColor: 'rgba(255,255,255,0.06)' }}
          >
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
              className="w-full rounded-xl p-4 flex flex-col gap-3"
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
              className="w-full py-2.5 rounded-xl border border-white/15 text-white/60 text-sm font-semibold hover:bg-white/8 hover:text-white/90 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              🔄 Play Again
            </button>
          </div>

          {/* Right: Leaderboard */}
          <div className="w-[280px] flex-shrink-0 px-5 py-5 overflow-y-auto">
            <Leaderboard
              scores={leaderboard}
              isLoading={isLoadingScores}
              myName={myName}
              myScore={lastScore}
            />
          </div>
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

// Small preview crewmate (static SVG)
function PreviewCrewmate({ color }: { color: string }) {
  return (
    <div style={{ filter: 'drop-shadow(2px 0 0 #111) drop-shadow(-2px 0 0 #111) drop-shadow(0 2px 0 #111)' }}>
      <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
        <rect x="0" y="10" width="9" height="16" rx="4" fill={color} />
        <rect x="8" y="24" width="8" height="10" rx="4" fill={color} />
        <rect x="18" y="24" width="8" height="10" rx="4" fill={color} />
        <rect x="8" y="0" width="20" height="26" rx="10" fill={color} />
        <ellipse cx="22" cy="9" rx="7" ry="5" fill="#92D1DF" />
        <ellipse cx="22" cy="11" rx="5" ry="3" fill="#527F8B" />
        <ellipse cx="25" cy="7" rx="3" ry="1.5" fill="white" opacity="0.7" />
      </svg>
    </div>
  );
}

// Small obstacle preview
function ObstaclePreview({ color, label, height = 65 }: { color: string; label: string; height?: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg text-center px-2"
      style={{
        width: 70,
        height,
        background: color,
        border: '1.5px solid rgba(0,0,0,0.2)',
      }}
    >
      <span className="text-sm">⚠️</span>
      <span className="text-[9px] text-white font-bold leading-tight mt-1">{label}</span>
    </div>
  );
}
