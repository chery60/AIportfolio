import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const DEFAULT_EMOJIS = ['❤️', '🔥', '🎯', '💡'];

export function useReactions(projectId: string) {
  const [reactions, setReactions] = useState<Record<string, number>>(
    () => Object.fromEntries(DEFAULT_EMOJIS.map(e => [e, 0]))
  );
  const [loading, setLoading] = useState(true);

  // Fetch counts whenever projectId changes
  useEffect(() => {
    // Reset to zero immediately on project switch
    setReactions(Object.fromEntries(DEFAULT_EMOJIS.map(e => [e, 0])));
    setLoading(true);

    const fetchReactions = async () => {
      const sb = supabase;
      if (!sb) {
        setLoading(false);
        return;
      }

      const { data, error } = await sb
        .from('portfolio_reactions')
        .select('emoji, count')
        .eq('project_id', projectId);

      if (error) {
        console.error('[useReactions] fetch error:', error);
      } else if (data) {
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
  }, [projectId]);

  // Subscribe to realtime updates filtered by project_id
  useEffect(() => {
    const sb = supabase;
    if (!sb) return;

    const channel = sb
      .channel(`portfolio_reactions_realtime_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'portfolio_reactions',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          const row = payload.new as { emoji: string; count: number };
          setReactions(prev => ({ ...prev, [row.emoji]: row.count }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'portfolio_reactions',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          const row = payload.new as { emoji: string; count: number };
          setReactions(prev => ({ ...prev, [row.emoji]: row.count }));
        }
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, [projectId]);

  const incrementReaction = useCallback(async (emoji: string) => {
    // Optimistic update
    setReactions(prev => ({ ...prev, [emoji]: (prev[emoji] ?? 0) + 1 }));

    const sb = supabase;
    if (!sb) return; // local-only fallback already applied above

    // Use an RPC call to atomically increment in Supabase (now with project_id)
    const { error } = await sb.rpc('increment_reaction', {
      reaction_emoji: emoji,
      p_project_id: projectId,
    });
    if (error) {
      console.error('[useReactions] increment_reaction RPC error:', error);
    }
  }, [projectId]);

  return { reactions, loading, incrementReaction };
}
