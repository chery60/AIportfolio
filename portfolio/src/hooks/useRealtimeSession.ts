import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

const COLORS = ['#7170ff', '#5e6ad2', '#34D399', '#FBBF24', '#60A5FA', '#828fff', '#8a8f98', '#38BDF8'];
const FIRST_NAMES = ['Alex', 'Priya', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Devon'];
const LAST_INITIALS = ['M', 'S', 'W', 'K', 'R', 'L', 'T', 'B', 'C', 'P'];
const LOCATIONS = ['San Francisco', 'London', 'New York', 'Tokyo', 'Berlin', 'Toronto', 'Sydney', 'Paris', 'Singapore', 'Austin'];

export interface ActiveViewer {
    id: string;
    name: string;
    initials: string;
    color: string;
    location: string;
    projectId: string;
    x: number;
    y: number;
    lastSeenAt: number;
}

export interface CursorPosition {
    x: number;
    y: number;
    projectId: string;
    lastSeenAt: number;
}

function finiteNumber(value: unknown): number {
    if (value === null || value === undefined || value === '') return Number.NaN;
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : Number.NaN;
}

function hasUsablePosition(position: Pick<CursorPosition, 'x' | 'y'>): boolean {
    return Number.isFinite(position.x) && Number.isFinite(position.y);
}

export function resolveViewerPosition(
    viewer: ActiveViewer,
    cursor: CursorPosition | undefined,
    fallback: Pick<CursorPosition, 'x' | 'y'>
): CursorPosition {
    if (cursor && cursor.projectId === viewer.projectId && hasUsablePosition(cursor)) {
        return cursor;
    }

    if (hasUsablePosition(viewer)) {
        return {
            x: viewer.x,
            y: viewer.y,
            projectId: viewer.projectId,
            lastSeenAt: viewer.lastSeenAt,
        };
    }

    return {
        x: fallback.x,
        y: fallback.y,
        projectId: viewer.projectId,
        lastSeenAt: viewer.lastSeenAt,
    };
}

export function useRealtimeSession(projectId: string) {
    const [activeViewers, setActiveViewers] = useState<ActiveViewer[]>([]);
    const [cursors, setCursors] = useState<Record<string, CursorPosition>>({});
    const [localIdentity, setLocalIdentity] = useState<ActiveViewer | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);
    const identityRef = useRef<ActiveViewer | null>(null);
    const lastPresenceTrackTimeRef = useRef(0);

    const trackLocalPresence = useCallback((updates: Partial<Pick<ActiveViewer, 'projectId' | 'x' | 'y'>>, force = false) => {
        if (!channelRef.current || !identityRef.current) return;

        const now = Date.now();
        const updated: ActiveViewer = {
            ...identityRef.current,
            ...updates,
            lastSeenAt: now,
        };

        identityRef.current = updated;
        setLocalIdentity(updated);

        if (force || now - lastPresenceTrackTimeRef.current > 1000) {
            lastPresenceTrackTimeRef.current = now;
            channelRef.current.track(updated).catch(() => { });
        }
    }, []);

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
            projectId,
            x: Number.NaN,
            y: Number.NaN,
            lastSeenAt: Date.now(),
        };

        setLocalIdentity(identity);
        identityRef.current = identity;

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
                        const viewer = state[key][0];
                        viewers.push({
                            ...viewer,
                            x: finiteNumber(viewer.x),
                            y: finiteNumber(viewer.y),
                            lastSeenAt: viewer.lastSeenAt ?? Date.now(),
                        });
                    }
                }
                setActiveViewers(viewers);
                setCursors((prev) => {
                    const activeIds = new Set(viewers.map((viewer) => viewer.id));
                    const next: Record<string, CursorPosition> = {};

                    for (const viewer of viewers) {
                        const existing = prev[viewer.id];
                        const existingMatchesProject = existing?.projectId === viewer.projectId;

                        if (existingMatchesProject && existing.lastSeenAt >= viewer.lastSeenAt) {
                            next[viewer.id] = existing;
                        } else if (hasUsablePosition(viewer)) {
                            next[viewer.id] = {
                                x: viewer.x,
                                y: viewer.y,
                                projectId: viewer.projectId,
                                lastSeenAt: viewer.lastSeenAt,
                            };
                        } else if (existingMatchesProject) {
                            next[viewer.id] = existing;
                        } else {
                            next[viewer.id] = {
                                x: Number.NaN,
                                y: Number.NaN,
                                projectId: viewer.projectId,
                                lastSeenAt: viewer.lastSeenAt,
                            };
                        }
                    }

                    for (const [id, cursor] of Object.entries(prev)) {
                        if (activeIds.has(id)) next[id] = next[id] ?? cursor;
                    }

                    return next;
                });
            })
            .on('broadcast', { event: 'cursor' }, ({ payload }) => {
                if (!payload || !payload.id) return;
                const x = Number(payload.x);
                const y = Number(payload.y);
                if (!Number.isFinite(x) || !Number.isFinite(y)) return;
                const lastSeenAt = Number(payload.lastSeenAt) || Date.now();
                setCursors((prev) => ({
                    ...prev,
                    [payload.id]: { x, y, projectId: payload.projectId ?? '', lastSeenAt }
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
            identityRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Re-track presence whenever projectId changes so other viewers see the updated project
    useEffect(() => {
        trackLocalPresence({ projectId }, true);
    }, [projectId, trackLocalPresence]);

    const lastSendTimeRef = useRef(0);

    const broadcastCursor = useCallback((x: number, y: number) => {
        if (!channelRef.current || !identityRef.current) return;

        const now = Date.now();
        trackLocalPresence({ x, y }, false);

        if (now - lastSendTimeRef.current > 50) {
            lastSendTimeRef.current = now;
            channelRef.current.send({
                type: 'broadcast',
                event: 'cursor',
                payload: { id: identityRef.current.id, x, y, projectId: identityRef.current.projectId, lastSeenAt: now }
            }).catch(() => { });
        }
    }, [trackLocalPresence]);

    const updatePresencePosition = useCallback((x: number, y: number) => {
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;
        trackLocalPresence({ x, y }, true);
    }, [trackLocalPresence]);

    return { activeViewers, cursors, localIdentity, broadcastCursor, updatePresencePosition };
}
