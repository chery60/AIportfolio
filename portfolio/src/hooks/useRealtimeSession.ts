import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

const COLORS = ['#7C5CFC', '#FF6B9D', '#34D399', '#FBBF24', '#60A5FA', '#A78BFA', '#F472B6', '#38BDF8'];
const FIRST_NAMES = ['Alex', 'Priya', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Devon'];
const LAST_INITIALS = ['M', 'S', 'W', 'K', 'R', 'L', 'T', 'B', 'C', 'P'];
const LOCATIONS = ['San Francisco', 'London', 'New York', 'Tokyo', 'Berlin', 'Toronto', 'Sydney', 'Paris', 'Singapore', 'Austin'];

export interface ActiveViewer {
    id: string;
    name: string;
    initials: string;
    color: string;
    location: string;
}

export function useRealtimeSession() {
    const [activeViewers, setActiveViewers] = useState<ActiveViewer[]>([]);
    const [cursors, setCursors] = useState<Record<string, { x: number, y: number }>>({});
    const [localIdentity, setLocalIdentity] = useState<ActiveViewer | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        if (!supabase) return;

        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
        const lastInitial = LAST_INITIALS[Math.floor(Math.random() * LAST_INITIALS.length)];
        const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

        const id = crypto.randomUUID();
        const identity: ActiveViewer = {
            id,
            name: `${firstName} ${lastInitial}.`,
            initials: `${firstName[0]}${lastInitial[0]}`,
            color,
            location,
        };

        setLocalIdentity(identity);

        const channel = supabase.channel('room:portfolio', {
            config: {
                broadcast: { self: false },
                presence: { key: identity.id },
            },
        });

        channelRef.current = channel;

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState<ActiveViewer>();
                const viewers: ActiveViewer[] = [];
                for (const key in state) {
                    if (state[key] && state[key].length > 0) {
                        viewers.push(state[key][0]);
                    }
                }
                setActiveViewers(viewers);
            })
            .on('broadcast', { event: 'cursor' }, ({ payload }) => {
                if (!payload || !payload.id) return;
                setCursors((prev) => ({
                    ...prev,
                    [payload.id]: { x: payload.x, y: payload.y }
                }));
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track(identity);
                }
            });

        return () => {
            channel.unsubscribe();
            channelRef.current = null;
        };
    }, []);

    const lastSendTimeRef = useRef(0);

    const broadcastCursor = useCallback((x: number, y: number) => {
        if (!channelRef.current || !localIdentity) return;

        const now = Date.now();
        if (now - lastSendTimeRef.current > 50) {
            lastSendTimeRef.current = now;
            channelRef.current.send({
                type: 'broadcast',
                event: 'cursor',
                payload: { id: localIdentity.id, x, y }
            }).catch(() => { });
        }
    }, [localIdentity]);

    return { activeViewers, cursors, localIdentity, broadcastCursor };
}
