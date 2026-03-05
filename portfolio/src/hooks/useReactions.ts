import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const DEFAULT_EMOJIS = ['❤️', '🔥', '🎯', '💡'];

export function useReactions() {
  const [reactions, setReactions] = useState<Record<string, number>>(
    () => Object.fromEntries(DEFAULT_EMOJIS.map(e => [e, 0]))
  );
  const [loading, setLoading] = useState(true);

  // Fetch counts on mount
  useEffect(() => {
    const fetchReactions = async () => {
      const sb = supabase;
      if (!sb) {
        setLoading(false);
        return;
      }

      const { data, error } = await sb
        .from('portfolio_reactions')
        .select('emoji, count');

      if (!error && data) {
        const mapped: Record<string, number> = Object.fromEntries(
          DEFAULT_EMOJIS.map(e => [e, 0])
        );
        for (const row of data as { emoji: string; count: number }[]) {
          mapped[row.emoji] = row.count;
        }
        setReactions(mapped);
      }

      setLoading(false);
    };

    fetchReactions();
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    const sb = supabase;
    if (!sb) return;

    const channel = sb
      .channel('portfolio_reactions_realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'portfolio_reactions' },
        (payload) => {
          const row = payload.new as { emoji: string; count: number };
          setReactions(prev => ({ ...prev, [row.emoji]: row.count }));
        }
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, []);

  const incrementReaction = useCallback(async (emoji: string) => {
    // Optimistic update
    setReactions(prev => ({ ...prev, [emoji]: (prev[emoji] ?? 0) + 1 }));

    const sb = supabase;
    if (!sb) return; // local-only fallback already applied above

    // Use an RPC call to atomically increment in Supabase
    await sb.rpc('increment_reaction', { reaction_emoji: emoji });
  }, []);

  return { reactions, loading, incrementReaction };
}
