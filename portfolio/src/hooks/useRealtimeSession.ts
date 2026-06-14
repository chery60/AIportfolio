import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

const COLORS = ['#7170ff', '#5e6ad2', '#34D399', '#FBBF24', '#60A5FA', '#828fff', '#8a8f98', '#38BDF8'];
const FIRST_NAMES = ['Alex', 'Priya', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Devon'];
const LAST_INITIALS = ['M', 'S', 'W', 'K', 'R', 'L', 'T', 'B', 'C', 'P'];
const UNKNOWN_LOCATION = 'Unknown location';
const VIEWER_SESSION_STORAGE_KEY = 'portfolio.viewerIdentity.v1';
const VIEWER_HEARTBEAT_MS = 4000;
const VIEWER_STALE_MS = 16000;
let cachedLocation: string | null = null;

type StoredViewerIdentity = Pick<ActiveViewer, 'id' | 'name' | 'initials' | 'color'>;

async function resolveApproxLocation(): Promise<string> {
    if (cachedLocation) return cachedLocation;

    try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error('Location lookup failed');
        const data = await response.json() as {
            city?: string;
            region?: string;
            country_name?: string;
            country?: string;
            error?: boolean;
        };

        if (data.error) throw new Error('Location lookup returned an error');

        const city = data.city?.trim();
        const regionOrCountry = (data.region || data.country_name || data.country)?.trim();
        cachedLocation = city && regionOrCountry
            ? `${city}, ${regionOrCountry}`
            : city || regionOrCountry || UNKNOWN_LOCATION;
    } catch {
        cachedLocation = UNKNOWN_LOCATION;
    }

    return cachedLocation;
}

function finiteNumber(value: unknown, fallback: number): number {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : fallback;
}

function normalizeViewer(rawViewer: Partial<ActiveViewer>): ActiveViewer | null {
    if (!rawViewer.id || !rawViewer.name || !rawViewer.initials || !rawViewer.color) return null;

    return {
        id: rawViewer.id,
        name: rawViewer.name,
        initials: rawViewer.initials,
        color: rawViewer.color,
        location: rawViewer.location || UNKNOWN_LOCATION,
        projectId: rawViewer.projectId || '',
        x: finiteNumber(rawViewer.x, 0),
        y: finiteNumber(rawViewer.y, 0),
        hasCursor: Boolean(rawViewer.hasCursor),
        viewportX: finiteNumber(rawViewer.viewportX, finiteNumber(rawViewer.x, 0)),
        viewportY: finiteNumber(rawViewer.viewportY, finiteNumber(rawViewer.y, 0)),
        viewportScale: finiteNumber(rawViewer.viewportScale, 1),
        lastSeenAt: finiteNumber(rawViewer.lastSeenAt, Date.now()),
    };
}

function mergeViewers(current: ActiveViewer[], incomingViewer: ActiveViewer): ActiveViewer[] {
    const existingIndex = current.findIndex((viewer) => viewer.id === incomingViewer.id);
    if (existingIndex === -1) return [...current, incomingViewer];

    const existing = current[existingIndex];
    const merged = incomingViewer.lastSeenAt >= existing.lastSeenAt
        ? { ...existing, ...incomingViewer }
        : { ...incomingViewer, ...existing };

    return current.map((viewer, index) => index === existingIndex ? merged : viewer);
}

function viewerToCursor(viewer: ActiveViewer): CursorPosition {
    return {
        x: viewer.x,
        y: viewer.y,
        projectId: viewer.projectId,
        hasCursor: viewer.hasCursor,
        lastSeenAt: viewer.lastSeenAt,
    };
}

function createStoredIdentity(): StoredViewerIdentity {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastInitial = LAST_INITIALS[Math.floor(Math.random() * LAST_INITIALS.length)];

    return {
        id: crypto.randomUUID(),
        name: `${firstName} ${lastInitial}.`,
        initials: `${firstName[0]}${lastInitial[0]}`,
        color,
    };
}

function getStoredIdentity(): StoredViewerIdentity {
    try {
        const stored = window.sessionStorage.getItem(VIEWER_SESSION_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored) as Partial<StoredViewerIdentity>;
            if (parsed.id && parsed.name && parsed.initials && parsed.color) {
                return {
                    id: parsed.id,
                    name: parsed.name,
                    initials: parsed.initials,
                    color: parsed.color,
                };
            }
        }

        const identity = createStoredIdentity();
        window.sessionStorage.setItem(VIEWER_SESSION_STORAGE_KEY, JSON.stringify(identity));
        return identity;
    } catch {
        return createStoredIdentity();
    }
}

export interface ActiveViewer {
    id: string;
    name: string;
    initials: string;
    color: string;
    location: string;
    projectId: string;
    x: number;
    y: number;
    hasCursor: boolean;
    viewportX: number;
    viewportY: number;
    viewportScale: number;
    lastSeenAt: number;
}

export interface CursorPosition {
    x: number;
    y: number;
    projectId: string;
    hasCursor: boolean;
    lastSeenAt: number;
}

export function useRealtimeSession(projectId: string) {
    const [activeViewers, setActiveViewers] = useState<ActiveViewer[]>([]);
    const [cursors, setCursors] = useState<Record<string, CursorPosition>>({});
    const [localIdentity, setLocalIdentity] = useState<ActiveViewer | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);
    const identityRef = useRef<ActiveViewer | null>(null);
    const lastPresenceTrackTimeRef = useRef(0);
    const lastViewerBroadcastTimeRef = useRef(0);

    const upsertViewer = useCallback((viewer: ActiveViewer) => {
        setActiveViewers((prev) => mergeViewers(prev, viewer));
        setCursors((prev) => {
            const existing = prev[viewer.id];
            if (existing && existing.lastSeenAt > viewer.lastSeenAt) return prev;
            return {
                ...prev,
                [viewer.id]: viewerToCursor(viewer),
            };
        });
    }, []);

    const removeViewer = useCallback((viewerId: string) => {
        setActiveViewers((prev) => prev.filter((viewer) => viewer.id !== viewerId));
        setCursors((prev) => {
            if (!(viewerId in prev)) return prev;
            const next = { ...prev };
            delete next[viewerId];
            return next;
        });
    }, []);

    const reconcilePresenceState = useCallback((channel: RealtimeChannel, forceRemoveIds: string[] = []) => {
        const state = channel.presenceState<ActiveViewer>();
        const viewers: ActiveViewer[] = [];
        const forceRemoveSet = new Set(forceRemoveIds);

        for (const key in state) {
            const viewer = normalizeViewer(state[key]?.[0] ?? {});
            if (viewer) viewers.push(viewer);
        }

        setActiveViewers((prev) => {
            const presenceIds = new Set(viewers.map((viewer) => viewer.id));
            const now = Date.now();
            const broadcastOnlyFresh = prev.filter((viewer) =>
                !forceRemoveSet.has(viewer.id) &&
                !presenceIds.has(viewer.id) && now - viewer.lastSeenAt < VIEWER_STALE_MS
            );

            return [...viewers, ...broadcastOnlyFresh];
        });

        setCursors((prev) => {
            const activeIds = new Set(viewers.map((viewer) => viewer.id));
            const next: Record<string, CursorPosition> = {};

            for (const viewer of viewers) {
                const existing = prev[viewer.id];
                next[viewer.id] = existing && existing.lastSeenAt >= viewer.lastSeenAt
                    ? existing
                    : viewerToCursor(viewer);
            }

            for (const [id, cursor] of Object.entries(prev)) {
                if (!forceRemoveSet.has(id) && activeIds.has(id)) next[id] = next[id] ?? cursor;
            }

            return next;
        });
    }, []);

    const broadcastViewerState = useCallback((force = false) => {
        if (!channelRef.current || !identityRef.current) return;

        const now = Date.now();
        if (!force && now - lastViewerBroadcastTimeRef.current < VIEWER_HEARTBEAT_MS) return;
        lastViewerBroadcastTimeRef.current = now;

        channelRef.current.send({
            type: 'broadcast',
            event: 'viewer-state',
            payload: { ...identityRef.current, lastSeenAt: now },
        }).catch(() => { });
    }, []);

    const pruneStaleViewers = useCallback(() => {
        const now = Date.now();
        setActiveViewers((prev) => prev.filter((viewer) =>
            viewer.id === identityRef.current?.id || now - viewer.lastSeenAt < VIEWER_STALE_MS
        ));
        setCursors((prev) => {
            const next: Record<string, CursorPosition> = {};
            for (const [id, cursor] of Object.entries(prev)) {
                if (id === identityRef.current?.id || now - cursor.lastSeenAt < VIEWER_STALE_MS) {
                    next[id] = cursor;
                }
            }
            return next;
        });
    }, []);

    const trackLocalPresence = useCallback((updates: Partial<ActiveViewer>, force = false) => {
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

        broadcastViewerState(force);
    }, [broadcastViewerState]);

    useEffect(() => {
        if (!supabase) return;

        const storedIdentity = getStoredIdentity();
        const identity: ActiveViewer = {
            ...storedIdentity,
            location: UNKNOWN_LOCATION,
            projectId,
            x: 0,
            y: 0,
            hasCursor: false,
            viewportX: 0,
            viewportY: 0,
            viewportScale: 1,
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
                reconcilePresenceState(channel);
            })
            .on('presence', { event: 'join' }, ({ newPresences }) => {
                for (const presence of newPresences as Partial<ActiveViewer>[]) {
                    const viewer = normalizeViewer(presence);
                    if (viewer) upsertViewer(viewer);
                }
                reconcilePresenceState(channel);
            })
            .on('presence', { event: 'leave' }, ({ leftPresences }) => {
                const leftIds: string[] = [];
                for (const presence of leftPresences as Partial<ActiveViewer>[]) {
                    if (presence.id) {
                        leftIds.push(presence.id);
                        removeViewer(presence.id);
                    }
                }
                reconcilePresenceState(channel, leftIds);
            })
            .on('broadcast', { event: 'cursor' }, ({ payload }) => {
                if (!payload || !payload.id) return;
                const x = Number(payload.x);
                const y = Number(payload.y);
                if (!Number.isFinite(x) || !Number.isFinite(y)) return;
                const lastSeenAt = Number(payload.lastSeenAt) || Date.now();
                setCursors((prev) => ({
                    ...prev,
                    [payload.id]: { x, y, projectId: payload.projectId ?? '', hasCursor: true, lastSeenAt }
                }));
            })
            .on('broadcast', { event: 'viewer-state' }, ({ payload }) => {
                const viewer = normalizeViewer(payload ?? {});
                if (!viewer || viewer.id === identityRef.current?.id) return;
                upsertViewer(viewer);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track(identity);
                    reconcilePresenceState(channel);
                    broadcastViewerState(true);
                    resolveApproxLocation().then((location) => {
                        trackLocalPresence({ location }, true);
                    });
                }
            });

        const heartbeatId = window.setInterval(() => {
            broadcastViewerState(true);
            pruneStaleViewers();
        }, VIEWER_HEARTBEAT_MS);

        return () => {
            window.clearInterval(heartbeatId);
            channel.unsubscribe();
            channelRef.current = null;
            identityRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [broadcastViewerState, reconcilePresenceState, pruneStaleViewers, removeViewer, trackLocalPresence, upsertViewer]);

    // Re-track presence whenever projectId changes so other viewers see the updated project
    useEffect(() => {
        trackLocalPresence({ projectId, hasCursor: false }, true);
    }, [projectId, trackLocalPresence]);

    const lastSendTimeRef = useRef(0);

    const broadcastCursor = useCallback((x: number, y: number) => {
        if (!channelRef.current || !identityRef.current) return;

        const now = Date.now();
        trackLocalPresence({ x, y, hasCursor: true }, false);

        if (now - lastSendTimeRef.current > 50) {
            lastSendTimeRef.current = now;
            channelRef.current.send({
                type: 'broadcast',
                event: 'cursor',
                payload: { id: identityRef.current.id, x, y, projectId: identityRef.current.projectId, lastSeenAt: now }
            }).catch(() => { });
        }
    }, [trackLocalPresence]);

    const updatePresencePosition = useCallback((viewportX: number, viewportY: number, viewportScale = 1) => {
        if (!Number.isFinite(viewportX) || !Number.isFinite(viewportY)) return;
        trackLocalPresence({
            viewportX,
            viewportY,
            viewportScale: Number.isFinite(viewportScale) ? viewportScale : 1,
        }, false);
    }, [trackLocalPresence]);

    return { activeViewers, cursors, localIdentity, broadcastCursor, updatePresencePosition };
}
