import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface PortfolioComment {
  id: string;
  author: string;
  content: string;
  color: string;
  initials: string;
  created_at: string;
}

const AVATAR_COLORS = [
  '#7C5CFC', '#FF6B9D', '#34D399', '#F59E0B',
  '#22D3EE', '#F87171', '#A78BFA', '#4ADE80',
];

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map(w => w[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');
}

function randomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

export function useComments() {
  const [comments, setComments] = useState<PortfolioComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all comments on mount
  useEffect(() => {
    fetchComments();
  }, []);

  // Subscribe to realtime inserts/deletes
  useEffect(() => {
    const sb = supabase;
    if (!sb) return;

    const channel = sb
      .channel('portfolio_comments_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'portfolio_comments' },
        (payload) => {
          const newComment = payload.new as PortfolioComment;
          setComments(prev => {
            // Avoid duplicates
            if (prev.some(c => c.id === newComment.id)) return prev;
            return [newComment, ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'portfolio_comments' },
        (payload) => {
          const deleted = payload.old as { id: string };
          setComments(prev => prev.filter(c => c.id !== deleted.id));
        }
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, []);

  const fetchComments = useCallback(async () => {
    const sb = supabase;
    if (!sb) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await sb
      .from('portfolio_comments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (fetchError) {
      setError('Failed to load comments.');
      setLoading(false);
      return;
    }

    setComments((data as PortfolioComment[]) ?? []);
    setLoading(false);
  }, []);

  const addComment = useCallback(async (author: string, content: string): Promise<boolean> => {
    const trimmedAuthor = author.trim();
    const trimmedContent = content.trim();
    if (!trimmedAuthor || !trimmedContent) return false;

    const color = randomColor();
    const initials = getInitials(trimmedAuthor) || trimmedAuthor.slice(0, 2).toUpperCase();

    const sb = supabase;
    if (!sb) {
      // Fallback: local-only if no Supabase
      const localComment: PortfolioComment = {
        id: Date.now().toString(),
        author: trimmedAuthor,
        content: trimmedContent,
        color,
        initials,
        created_at: new Date().toISOString(),
      };
      setComments(prev => [localComment, ...prev]);
      return true;
    }

    const { error: insertError } = await sb
      .from('portfolio_comments')
      .insert({ author: trimmedAuthor, content: trimmedContent, color, initials });

    if (insertError) {
      setError('Failed to post comment.');
      return false;
    }

    return true;
  }, []);

  const deleteComment = useCallback(async (id: string): Promise<boolean> => {
    const sb = supabase;
    if (!sb) {
      setComments(prev => prev.filter(c => c.id !== id));
      return true;
    }

    const { error: deleteError } = await sb
      .from('portfolio_comments')
      .delete()
      .eq('id', id);

    if (deleteError) {
      setError('Failed to delete comment.');
      return false;
    }

    return true;
  }, []);

  return { comments, loading, error, addComment, deleteComment, timeAgo };
}
