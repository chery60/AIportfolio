import type { ScoreEntry } from '../../hooks/useGameSession';

interface Props {
  scores: ScoreEntry[];
  isLoading: boolean;
  myName?: string;
  myScore?: number;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard({ scores, isLoading, myName, myScore }: Props) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Leaderboard</span>
        <span className="text-xs text-white/30">Top 3</span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
        </div>
      ) : scores.length === 0 ? (
        <div className="text-center py-6 text-white/30 text-sm">
          No scores yet — be the first! 🚀
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {scores.slice(0, 3).map((entry, idx) => {
            const isMe = myName && entry.player_name === myName && myScore !== undefined && entry.score === myScore;
            return (
              <div
                key={entry.id}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isMe
                    ? 'bg-[#C74B18]/30 border border-[#C74B18]/50'
                    : idx === 0
                      ? 'bg-yellow-500/10 border border-yellow-500/20'
                      : 'bg-white/5 border border-white/5'
                  }`}
              >
                <span className="text-base w-6 text-center flex-shrink-0">
                  {idx < 3 ? MEDALS[idx] : (
                    <span className="text-xs text-white/40 font-mono">{idx + 1}</span>
                  )}
                </span>
                <span className={`flex-1 text-sm font-semibold truncate ${isMe ? 'text-[#F59E0B]' : 'text-white/80'}`}>
                  {entry.player_name}
                  {isMe && <span className="ml-1 text-xs text-[#F59E0B]/70">(you)</span>}
                </span>
                <span className={`text-sm font-bold font-mono ${idx === 0 ? 'text-yellow-400' : isMe ? 'text-[#C74B18]' : 'text-white/60'
                  }`}>
                  {entry.score.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
