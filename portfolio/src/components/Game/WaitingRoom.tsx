interface Props {
  currentPlayerName: string | null;
  playerColor: string;
  onCancel: () => void;
}

export default function WaitingRoom({ currentPlayerName, playerColor, onCancel }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 h-full py-8">
      {/* Crewmate with speech bubble */}
      <div className="relative flex flex-col items-center">
        {/* Speech bubble */}
        <div className="relative bg-white rounded-2xl px-4 py-3 shadow-lg mb-3 max-w-[220px]">
          <p className="text-sm font-semibold text-gray-800 text-center leading-snug">
            Waiting for my turn... 👀
          </p>
          <p className="text-xs text-gray-500 text-center mt-1">
            {currentPlayerName
              ? <><span className="font-bold text-gray-700">{currentPlayerName}</span> is playing</>
              : 'Someone is playing right now'}
          </p>
          {/* Bubble tail */}
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '10px solid white',
            }}
          />
        </div>

        {/* Animated crewmate SVG */}
        <div className="animate-bounce" style={{ animationDuration: '1.2s' }}>
          <CrewmateSVG color={playerColor} />
        </div>
      </div>

      {/* Waiting info */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-white/60 text-sm">Queue: 1 ahead of you</span>
        </div>
        <p className="text-white/30 text-xs max-w-[260px]">
          The game will start automatically when it's your turn.
        </p>
      </div>

      {/* Cancel button */}
      <button
        onClick={onCancel}
        className="px-5 py-2 rounded-full border border-white/20 text-white/50 text-sm hover:bg-white/10 hover:text-white/80 transition-all"
      >
        Leave Queue
      </button>
    </div>
  );
}

function CrewmateSVG({ color }: { color: string }) {
  return (
    <svg width="48" height="60" viewBox="0 0 48 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx="24" cy="57" rx="14" ry="4" fill="rgba(0,0,0,0.2)" />
      {/* Backpack */}
      <rect x="4" y="16" width="12" height="20" rx="5" fill={color} />
      <rect x="4" y="26" width="12" height="10" rx="3" fill="rgba(0,0,0,0.2)" />
      {/* Left Leg */}
      <rect x="14" y="42" width="10" height="14" rx="5" fill={color} />
      <rect x="14" y="50" width="10" height="6" rx="3" fill="rgba(0,0,0,0.2)" />
      {/* Right Leg */}
      <rect x="26" y="42" width="10" height="14" rx="5" fill={color} />
      <rect x="26" y="50" width="10" height="6" rx="3" fill="rgba(0,0,0,0.2)" />
      {/* Body */}
      <rect x="14" y="4" width="28" height="40" rx="12" fill={color} />
      <rect x="28" y="8" width="12" height="32" rx="8" fill="rgba(0,0,0,0.15)" />
      {/* Visor */}
      <ellipse cx="34" cy="16" rx="10" ry="7" fill="#92D1DF" />
      <ellipse cx="34" cy="19" rx="8" ry="5" fill="#527F8B" />
      <ellipse cx="38" cy="13" rx="4" ry="2.5" fill="white" opacity="0.7" />
      {/* Outlines */}
      <rect x="14" y="4" width="28" height="40" rx="12" stroke="#111" strokeWidth="2" fill="none" />
      <ellipse cx="34" cy="16" rx="10" ry="7" stroke="#111" strokeWidth="1.5" fill="none" />
    </svg>
  );
}
