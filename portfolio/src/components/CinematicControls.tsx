/**
 * Minimal cinematic tour HUD (ExplorerScene expects this module).
 */
interface Props {
  isPlaying: boolean;
  isPaused: boolean;
  progress: number;
  speed: number;
  currentWaypointLabel?: string;
  totalWaypoints: number;
  currentWaypointIndex: number;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSkipNext: () => void;
  onSkipPrevious: () => void;
  onSetSpeed: (speed: number) => void;
}

export default function CinematicControls({
  isPlaying,
  isPaused,
  progress,
  speed,
  currentWaypointLabel,
  totalWaypoints,
  currentWaypointIndex,
  onPlay,
  onPause,
  onResume,
  onStop,
  onSkipNext,
  onSkipPrevious,
  onSetSpeed,
}: Props) {
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-auto">
      <div className="rounded-full bg-white/95 border border-panel-border shadow-lg px-4 py-2 text-xs font-semibold text-text-primary max-w-[min(90vw,420px)] truncate">
        {currentWaypointLabel ?? 'Tour'} · {currentWaypointIndex + 1}/{totalWaypoints}
      </div>
      <div className="flex items-center gap-2 rounded-full bg-white/95 border border-panel-border shadow-lg px-3 py-2">
        <button
          type="button"
          className="px-2 py-1 rounded-full hover:bg-surface-2 text-[11px] font-bold"
          onClick={onSkipPrevious}
        >
          Prev
        </button>
        {!isPlaying || isPaused ? (
          <button
            type="button"
            className="px-3 py-1 rounded-full bg-brand text-white text-[11px] font-bold"
            onClick={isPaused ? onResume : onPlay}
          >
            Play
          </button>
        ) : (
          <button
            type="button"
            className="px-3 py-1 rounded-full bg-surface-2 text-[11px] font-bold"
            onClick={onPause}
          >
            Pause
          </button>
        )}
        <button
          type="button"
          className="px-2 py-1 rounded-full hover:bg-surface-2 text-[11px] font-bold"
          onClick={onSkipNext}
        >
          Next
        </button>
        <button
          type="button"
          className="px-2 py-1 rounded-full hover:bg-surface-2 text-[11px] font-bold"
          onClick={onStop}
        >
          Stop
        </button>
        <span className="text-[10px] text-text-secondary px-1">{Math.round(progress * 100)}%</span>
        <select
          className="text-[10px] rounded-full border border-panel-border px-2 py-1 bg-white"
          value={speed}
          onChange={(e) => onSetSpeed(Number(e.target.value))}
        >
          {[0.5, 1, 1.5, 2].map((s) => (
            <option key={s} value={s}>
              {s}x
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
