import { useState, useEffect, useRef, useCallback } from 'react';
import { SIMULATED_VIEWERS } from '../data/presence';
import type { Viewer } from '../types';
import { supabase } from '../lib/supabase';

import type { RealtimeChannel } from '@supabase/supabase-js';

export interface CursorState {
  x: number;
  y: number;
  color: string;
}

export function usePresence() {
  const [viewers, setViewers] = useState<Viewer[]>(SIMULATED_VIEWERS.filter(v => v.isActive));
  const [totalCount, setTotalCount] = useState(SIMULATED_VIEWERS.filter(v => v.isActive).length);

  useEffect(() => {
    // Simulate viewers joining/leaving
    const interval = setInterval(() => {
      setViewers(prev => {
        const allViewers = SIMULATED_VIEWERS;
        // Randomly toggle one viewer
        const idx = Math.floor(Math.random() * allViewers.length);
        const toggled = allViewers[idx];
        const isCurrentlyActive = prev.find(v => v.id === toggled.id);

        if (isCurrentlyActive) {
          if (prev.length > 1 && Math.random() > 0.6) {
            return prev.filter(v => v.id !== toggled.id);
          }
        } else {
          if (Math.random() > 0.4) {
            return [...prev, { ...toggled, isActive: true }];
          }
        }
        return prev;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setTotalCount(viewers.length);
  }, [viewers]);

  // --- Real-time Cursors Logic ---
  const [remoteCursors, setRemoteCursors] = useState<Record<string, CursorState>>({});
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Assign a random HSL color for this session's character
  const colorRef = useRef<string>(`hsl(${Math.random() * 360}, 80%, 65%)`);
  const lastSend = useRef(0);

  useEffect(() => {
    const sb = supabase;
    if (!sb) return;

    let isMounted = true;

    const initCursors = async () => {
      const { data: { session } } = await sb.auth.getSession();
      if (!session) {
        await sb.auth.signInAnonymously();
      }

      const channel = sb.channel('room-1', {
        config: { presence: { key: Math.random().toString(36).substring(7) } },
      });
      channelRef.current = channel;

      channel
        .on('presence', { event: 'sync' }, () => {
          if (!isMounted) return;
          const newState = channel.presenceState();
          const others: Record<string, CursorState> = {};

          for (const [key, presences] of Object.entries(newState)) {
            if (presences.length > 0) {
              const data = presences[0] as unknown as CursorState & { isMe?: boolean };
              if (!data.isMe && data.x !== undefined && data.y !== undefined) {
                others[key] = { x: data.x, y: data.y, color: data.color };
              }
            }
          }
          setRemoteCursors(others);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ x: 0, y: 0, color: colorRef.current, isMe: true });
          }
        });
    };

    initCursors();

    return () => {
      isMounted = false;
      if (channelRef.current) {
        sb.removeChannel(channelRef.current);
      }
    };
  }, []);

  const updateCursor = useCallback((x: number, y: number) => {
    if (!channelRef.current) return;
    const now = Date.now();
    // Throttle to ~20fps (50ms)
    if (now - lastSend.current > 50) {
      lastSend.current = now;
      channelRef.current.track({ x, y, color: colorRef.current, isMe: true });
    }
  }, []);

  return { viewers, totalCount, remoteCursors, updateCursor, localColor: colorRef.current };
}
