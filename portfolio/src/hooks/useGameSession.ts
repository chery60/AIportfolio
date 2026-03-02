import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface ScoreEntry {
  id: string;
  player_name: string;
  score: number;
  created_at: string;
}

export type GameSessionState = 'idle' | 'waiting' | 'playing' | 'gameover';

const GAME_CHANNEL = 'crewmate-dash-session';

export function useGameSession() {
  const [sessionState, setSessionState] = useState<GameSessionState>('idle');
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);
  const [myName, setMyName] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [isLoadingScores, setIsLoadingScores] = useState(false);
  const [lastScore, setLastScore] = useState<number>(0);
  const [supabaseReady, setSupabaseReady] = useState(false);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const mySessionId = useRef<string>(Math.random().toString(36).substring(2, 10));
  const isPlayingRef = useRef(false);
  const myNameRef = useRef('');

  // Fetch leaderboard from Supabase
  const fetchLeaderboard = useCallback(async () => {
    const sb = supabase;
    if (!sb) return;
    setIsLoadingScores(true);
    try {
      const { data, error } = await sb
        .from('game_scores')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);
      if (!error && data) {
        setLeaderboard(data as ScoreEntry[]);
      }
    } catch (e) {
      console.warn('Leaderboard fetch failed:', e);
    } finally {
      setIsLoadingScores(false);
    }
  }, []);

  // Submit score
  const submitScore = useCallback(async (name: string, score: number) => {
    const sb = supabase;
    if (!sb) return;
    try {
      await sb.from('game_scores').insert({ player_name: name, score });
      await fetchLeaderboard();
    } catch (e) {
      console.warn('Score submit failed:', e);
    }
  }, [fetchLeaderboard]);

  // Set up presence channel to track who is playing
  useEffect(() => {
    const sb = supabase;
    if (!sb) {
      // No Supabase — still allow playing, just no multiplayer lock
      setSupabaseReady(false);
      return;
    }

    let isMounted = true;

    const initSession = async () => {
      try {
        const { data: { session } } = await sb.auth.getSession();
        if (!session) {
          await sb.auth.signInAnonymously();
        }
      } catch {
        // Auth not required for presence to work in some configs
      }

      if (!isMounted) return;

      const channel = sb.channel(GAME_CHANNEL, {
        config: { presence: { key: mySessionId.current } },
      });
      channelRef.current = channel;

      channel.on('presence', { event: 'sync' }, () => {
        if (!isMounted) return;
        const state = channel.presenceState();
        const players = Object.values(state)
          .map((presences) => (presences as any[])[0])
          .filter(p => p?.isPlaying && p?.sessionId !== mySessionId.current);

        if (players.length === 0) {
          setCurrentPlayer(null);
          if (!isPlayingRef.current) {
            setSessionState(prev => prev === 'waiting' ? 'idle' : prev);
          }
        } else {
          const activePlayer = players[0];
          setCurrentPlayer(activePlayer.name ?? 'Someone');
          if (!isPlayingRef.current) {
            setSessionState(prev =>
              prev === 'idle' || prev === 'waiting' ? 'waiting' : prev
            );
          }
        }
      });

      channel.subscribe(() => {
        if (isMounted) setSupabaseReady(true);
      });
    };

    initSession();
    fetchLeaderboard();

    return () => {
      isMounted = false;
      if (channelRef.current) {
        sb.removeChannel(channelRef.current);
      }
    };
  }, [fetchLeaderboard]);

  // Start playing — broadcast presence
  const startPlaying = useCallback((name: string) => {
    myNameRef.current = name;
    setMyName(name);
    isPlayingRef.current = true;
    setSessionState('playing');

    window.dispatchEvent(new CustomEvent('local-game-state', { detail: { isPlaying: true } }));

    // Broadcast to others that we're playing (fire and forget)
    channelRef.current?.track({
      name,
      sessionId: mySessionId.current,
      isPlaying: true,
    }).catch(() => { });
  }, []);

  // End game — untrack presence, submit score
  const endGame = useCallback(async (score: number) => {
    isPlayingRef.current = false;
    setLastScore(score);
    setSessionState('gameover');

    window.dispatchEvent(new CustomEvent('local-game-state', { detail: { isPlaying: false } }));

    // Untrack playing state
    channelRef.current?.track({
      name: myNameRef.current,
      sessionId: mySessionId.current,
      isPlaying: false,
    }).catch(() => { });

    if (myNameRef.current && score > 0) {
      await submitScore(myNameRef.current, score);
    }
  }, [submitScore]);

  // Reset to idle
  const resetGame = useCallback(() => {
    isPlayingRef.current = false;
    setSessionState('idle');
    setLastScore(0);

    window.dispatchEvent(new CustomEvent('local-game-state', { detail: { isPlaying: false } }));
  }, []);

  const isSomeoneElsePlaying = sessionState === 'waiting' && currentPlayer !== null;

  return {
    sessionState,
    currentPlayer,
    myName,
    leaderboard,
    isLoadingScores,
    lastScore,
    isSomeoneElsePlaying,
    supabaseReady,
    startPlaying,
    endGame,
    resetGame,
    fetchLeaderboard,
  };
}
