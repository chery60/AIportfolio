import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHARACTER_COLLISION_MARGIN } from '../../constants/canvasSpacing';
import type { Emote, ArrivalAnimation } from '../../data/tourScripts';

export interface ElementBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Props {
    targetX: number;
    targetY: number;
    color: string;
    elementBounds?: ElementBounds[];
    message?: string | null;
    canvasScale?: number;
    // ── Guide mode props ──
    guideTarget?: { x: number; y: number } | null;
    isGuiding?: boolean;
    isComplete?: boolean;
    emote?: Emote | null;
    onArrived?: () => void;
    onNextStep?: () => void;
    onSkipTour?: () => void;
    arrivalAnimation?: ArrivalAnimation | null;
    tourProgress?: { current: number; total: number; label: string | null } | null;
    // ── Intro Prompt props ──
    showIntro?: boolean;
    introGreeting?: string;
    onStartTour?: () => void;
    onStartTourWithVoice?: () => void;
    onDismissTour?: () => void;
}

// ── Emote emoji map ──────────────────────────────────────────────────────────
const EMOTE_EMOJI: Record<Emote, string> = {
    wave: '👋',
    thinking: '🤔',
    excited: '🎉',
    serious: '😤',
    proud: '💪',
    wink: '😉',
};

// ── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(text: string | null, speed = 18) {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);
    const indexRef = useRef(0);
    const prevTextRef = useRef<string | null>(null);

    useEffect(() => {
        if (text === null) {
            setDisplayed('');
            setDone(false);
            indexRef.current = 0;
            prevTextRef.current = null;
            return;
        }

        if (text !== prevTextRef.current) {
            setDisplayed('');
            setDone(false);
            indexRef.current = 0;
            prevTextRef.current = text;
        }

        if (indexRef.current >= text.length) {
            if (!done) {
                setDisplayed(text);
                setDone(true);
            }
            return;
        }

        const timer = setInterval(() => {
            indexRef.current++;
            setDisplayed(text.slice(0, indexRef.current));
            if (indexRef.current >= text.length) {
                clearInterval(timer);
                setDone(true);
            }
        }, speed);

        return () => clearInterval(timer);
    }, [text, speed, done]);

    return { displayed, done };
}

/**
 * Returns true if point (px, py) is inside the rectangle with a margin buffer.
 * The margin must stay in sync with CHARACTER_COLLISION_MARGIN from canvasSpacing.ts.
 * All canvas elements must have at least (CHARACTER_COLLISION_MARGIN * 2 + character_width)px
 * of horizontal clear space and (CHARACTER_COLLISION_MARGIN * 2 + character_height)px
 * of vertical clear space between them so the character can always pass through.
 */
function isInsideElement(px: number, py: number, el: ElementBounds, margin = CHARACTER_COLLISION_MARGIN): boolean {
    return (
        px > el.x - margin &&
        px < el.x + el.width + margin &&
        py > el.y - margin &&
        py < el.y + el.height + margin
    );
}

/**
 * Given a desired target (tx, ty) that may be inside an element,
 * clamp it to the nearest point on that element's border.
 */
function clampToBorder(tx: number, ty: number, el: ElementBounds, margin = CHARACTER_COLLISION_MARGIN): { x: number; y: number } {
    const minX = el.x - margin;
    const maxX = el.x + el.width + margin;
    const minY = el.y - margin;
    const maxY = el.y + el.height + margin;

    const clampedX = Math.max(minX, Math.min(maxX, tx));
    const clampedY = Math.max(minY, Math.min(maxY, ty));

    // Find which edge is closest
    const distLeft = Math.abs(tx - minX);
    const distRight = Math.abs(tx - maxX);
    const distTop = Math.abs(ty - minY);
    const distBottom = Math.abs(ty - maxY);
    const minDist = Math.min(distLeft, distRight, distTop, distBottom);

    if (minDist === distLeft) return { x: minX, y: clampedY };
    if (minDist === distRight) return { x: maxX, y: clampedY };
    if (minDist === distTop) return { x: clampedX, y: minY };
    return { x: clampedX, y: maxY };
}

// ── A* Pathfinding ────────────────────────────────────────────────────────────

/** Extra clearance beyond collision margin for placing corner waypoints */
const CORNER_CLEARANCE = 20;

/**
 * Liang-Barsky segment vs. expanded AABB intersection test.
 * Returns true if the segment (x1,y1)→(x2,y2) passes through the rectangle.
 */
function segmentIntersectsAABB(
    x1: number, y1: number,
    x2: number, y2: number,
    el: ElementBounds,
    margin: number
): boolean {
    const xMin = el.x - margin;
    const xMax = el.x + el.width + margin;
    const yMin = el.y - margin;
    const yMax = el.y + el.height + margin;

    const dx = x2 - x1;
    const dy = y2 - y1;

    let tEnter = 0;
    let tExit = 1;

    // [p, q] pairs for 4 clip planes: left, right, top, bottom
    const ps = [-dx, dx, -dy, dy];
    const qs = [x1 - xMin, xMax - x1, y1 - yMin, yMax - y1];

    for (let i = 0; i < 4; i++) {
        const p = ps[i];
        const q = qs[i];
        if (p === 0) {
            if (q < 0) return false; // parallel and outside
        } else if (p < 0) {
            tEnter = Math.max(tEnter, q / p);
        } else {
            tExit = Math.min(tExit, q / p);
        }
        if (tEnter >= tExit) return false;
    }
    return true;
}

/** Returns true if the straight line from (ax,ay) to (bx,by) doesn't cross any element. */
function hasLineOfSight(
    ax: number, ay: number,
    bx: number, by: number,
    bounds: ElementBounds[],
    margin: number
): boolean {
    for (const el of bounds) {
        if (segmentIntersectsAABB(ax, ay, bx, by, el, margin)) return false;
    }
    return true;
}

interface Waypoint { x: number; y: number; }

/**
 * Visibility-graph A* pathfinding.
 * Returns an array of waypoints from start to end (excluding start, including end).
 * Falls back to [end] if direct LOS is clear or no path found.
 */
function computePath(
    start: Waypoint,
    end: Waypoint,
    bounds: ElementBounds[]
): Waypoint[] {
    // Fast path: direct line of sight
    if (hasLineOfSight(start.x, start.y, end.x, end.y, bounds, CHARACTER_COLLISION_MARGIN)) {
        return [end];
    }

    // Build waypoint list: start + end + valid element corners
    const fullMargin = CHARACTER_COLLISION_MARGIN + CORNER_CLEARANCE;
    const cornerWaypoints: Waypoint[] = [];
    for (const el of bounds) {
        const corners: Waypoint[] = [
            { x: el.x - fullMargin,              y: el.y - fullMargin },
            { x: el.x + el.width + fullMargin,   y: el.y - fullMargin },
            { x: el.x - fullMargin,              y: el.y + el.height + fullMargin },
            { x: el.x + el.width + fullMargin,   y: el.y + el.height + fullMargin },
        ];
        for (const c of corners) {
            // Discard corners that land inside any element's collision zone
            if (!bounds.some(other => isInsideElement(c.x, c.y, other))) {
                cornerWaypoints.push(c);
            }
        }
    }

    const allWaypoints: Waypoint[] = [start, end, ...cornerWaypoints];
    const N = allWaypoints.length;

    // Build adjacency list (visibility graph)
    const adj: Array<Array<{ j: number; cost: number }>> = Array.from({ length: N }, () => []);
    for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
            const a = allWaypoints[i];
            const b = allWaypoints[j];
            if (hasLineOfSight(a.x, a.y, b.x, b.y, bounds, CHARACTER_COLLISION_MARGIN)) {
                const cost = Math.hypot(b.x - a.x, b.y - a.y);
                adj[i].push({ j, cost });
                adj[j].push({ j: i, cost });
            }
        }
    }

    // A* from index 0 (start) to index 1 (end)
    const INF = Infinity;
    const gScore = new Array<number>(N).fill(INF);
    const fScore = new Array<number>(N).fill(INF);
    const cameFrom = new Array<number>(N).fill(-1);
    gScore[0] = 0;
    fScore[0] = Math.hypot(end.x - start.x, end.y - start.y);

    const openSet = new Set<number>([0]);

    while (openSet.size > 0) {
        // Pick node with lowest fScore
        let current = -1;
        let bestF = INF;
        for (const node of openSet) {
            if (fScore[node] < bestF) { bestF = fScore[node]; current = node; }
        }

        if (current === 1) {
            // Reconstruct path
            const path: Waypoint[] = [];
            let n = current;
            while (n !== 0) {
                path.unshift(allWaypoints[n]);
                n = cameFrom[n];
            }
            return path;
        }

        openSet.delete(current);

        for (const { j, cost } of adj[current]) {
            const tentativeG = gScore[current] + cost;
            if (tentativeG < gScore[j]) {
                cameFrom[j] = current;
                gScore[j] = tentativeG;
                fScore[j] = tentativeG + Math.hypot(allWaypoints[j].x - end.x, allWaypoints[j].y - end.y);
                openSet.add(j);
            }
        }
    }

    // No path found — fall back to direct movement
    return [end];
}

export default function Character({
    targetX, targetY, color, elementBounds = [], message = null, canvasScale = 1,
    guideTarget = null, isGuiding = false, isComplete = false, emote = null,
    onArrived, onNextStep, onSkipTour,
    arrivalAnimation = null, tourProgress = null,
    showIntro = false, introGreeting = "Hey! Want me to walk you through this project?",
    onStartTour, onStartTourWithVoice, onDismissTour,
}: Props) {
    // Lazy initialize starting position so that if the character mounts while the cursor
    // is inside an element, it starts at the clamped border instead of getting stuck inside.
    const [initialPos] = useState(() => {
        let tx = targetX;
        let ty = targetY;
        for (const el of elementBounds) {
            if (isInsideElement(tx, ty, el)) {
                const clamped = clampToBorder(tx, ty, el);
                tx = clamped.x;
                ty = clamped.y;
                break;
            }
        }
        return { x: tx, y: ty };
    });

    // Use refs for positions for smooth 60fps mutability without React re-renders
    const posRef = useRef({ x: initialPos.x, y: initialPos.y });
    const targetRef = useRef({ x: initialPos.x, y: initialPos.y });
    const requestRef = useRef<number>(0);
    const boundsRef = useRef<ElementBounds[]>(elementBounds);
    const lastTimeRef = useRef<number>(performance.now());

    // ── Pathfinding refs ──────────────────────────────────────────────────────
    const pathRef = useRef<Waypoint[]>([]);
    const pathTargetRef = useRef<Waypoint | null>(null);
    const stuckTimerRef = useRef<number>(0);
    const lastPathTimeRef = useRef<number>(0);

    // Ref to the DOM element for direct transform updates
    const charRef = useRef<HTMLDivElement>(null);
    const spriteRef = useRef<HTMLDivElement>(null);

    // State for facing direction (to flip sprite) and walking state
    const [facingLeft, setFacingLeft] = useState(false);
    const [isWalking, setIsWalking] = useState(false);
    const facingLeftRef = useRef(false);
    const isWalkingRef = useRef(false);

    // Idle fidget state
    const [isIdleFidget, setIsIdleFidget] = useState(false);
    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const arrivedRef = useRef(false);

    // Keep a ref to canvasScale so the rAF loop can read the latest value
    const canvasScaleRef = useRef(canvasScale);
    useEffect(() => { canvasScaleRef.current = canvasScale; }, [canvasScale]);

    // ── Cursor-freeze refs (prevent character chasing cursor while bubble buttons are visible) ──
    const rawCursorRef = useRef({ x: targetX, y: targetY }); // always tracks raw cursor pos
    const frozenRef = useRef(false);                          // whether cursor-follow is frozen
    const hasInteractiveButtonsRef = useRef(false);           // synced from render each frame
    const isGuidingRef = useRef(isGuiding);
    useEffect(() => { isGuidingRef.current = isGuiding; }, [isGuiding]);

    // Typewriter for narration
    const displayMessage = isGuiding ? null : message;
    const { displayed: narrationDisplayed, done: narrationDone } = useTypewriter(
        message && isGuiding ? message : null
    );

    // Reset arrival flag when guide target changes
    useEffect(() => {
        arrivedRef.current = false;
    }, [guideTarget?.x, guideTarget?.y]);

    // Idle fidget detection
    const resetIdleTimer = useCallback(() => {
        setIsIdleFidget(false);
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => {
            setIsIdleFidget(true);
            // Auto-clear fidget after animation
            setTimeout(() => setIsIdleFidget(false), 2000);
        }, 6000);
    }, []);

    useEffect(() => {
        resetIdleTimer();
        return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
    }, [resetIdleTimer]);

    // Movement tuning
    const maxSpeed = 7.0;       // Max pixels per frame at 60fps
    const lerpFactor = 0.08;    // Smooth interpolation factor (0-1), lower = smoother
    const arrivalThreshold = 1; // Snap when within this distance

    // Update target when props change — clamp to element borders
    useEffect(() => {
        boundsRef.current = elementBounds;
        // Invalidate path: element layout changed, old route may be invalid
        pathRef.current = [];
        pathTargetRef.current = null;
    }, [elementBounds]);

    useEffect(() => {
        // In guide mode, use guideTarget; otherwise use cursor
        let tx = (isGuiding && guideTarget) ? guideTarget.x : targetX;
        let ty = (isGuiding && guideTarget) ? guideTarget.y : targetY;

        // Always track raw cursor so freeze-distance checks stay current
        if (!isGuiding) rawCursorRef.current = { x: targetX, y: targetY };

        // Don't chase cursor while frozen (buttons visible + character is close)
        if (frozenRef.current) {
            resetIdleTimer();
            return;
        }

        // If target is inside any element, clamp to its border
        for (const el of boundsRef.current) {
            if (isInsideElement(tx, ty, el)) {
                const clamped = clampToBorder(tx, ty, el);
                tx = clamped.x;
                ty = clamped.y;
                break;
            }
        }
        targetRef.current = { x: tx, y: ty };
        resetIdleTimer();
    }, [targetX, targetY, isGuiding, guideTarget, resetIdleTimer]);

    // The Game Loop
    const updatePosition = (time: number) => {
        const dt = time - lastTimeRef.current;
        lastTimeRef.current = time;
        // Cap dt to prevent massive jumps if tab is inactive
        const safeDt = Math.min(dt, 100);
        const timeScale = safeDt / (1000 / 60);

        // Immediate check: if bounds shift and engulf the character's CURRENT position, snap it out
        let currentX = posRef.current.x;
        let currentY = posRef.current.y;
        for (const el of boundsRef.current) {
            if (isInsideElement(currentX, currentY, el)) {
                const clamped = clampToBorder(currentX, currentY, el);
                currentX = clamped.x;
                currentY = clamped.y;
                posRef.current.x = currentX;
                posRef.current.y = currentY;
                break;
            }
        }

        // ── A* Pathfinding: advance to next waypoint when close enough ────────
        const WAYPOINT_ARRIVE_DIST = 15;
        if (pathRef.current.length > 0) {
            const wp = pathRef.current[0];
            const wpDist = Math.hypot(wp.x - posRef.current.x, wp.y - posRef.current.y);
            if (wpDist < WAYPOINT_ARRIVE_DIST) {
                pathRef.current = pathRef.current.slice(1);
            }
        }

        // Move toward current waypoint if one exists, otherwise toward final target
        const moveTarget = pathRef.current.length > 0 ? pathRef.current[0] : targetRef.current;

        const dx = moveTarget.x - posRef.current.x;
        const dy = moveTarget.y - posRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Distance to final destination (used for arrival + stuck detection)
        const distToFinalTarget = Math.hypot(
            targetRef.current.x - posRef.current.x,
            targetRef.current.y - posRef.current.y
        );

        // ── Cursor-freeze: stop chasing when bubble buttons are visible and cursor is close ──
        const FREEZE_NEAR = 120;
        const FREEZE_FAR  = 250;
        if (hasInteractiveButtonsRef.current && !isGuidingRef.current) {
            const distToCursor = Math.hypot(
                rawCursorRef.current.x - posRef.current.x,
                rawCursorRef.current.y - posRef.current.y
            );
            if (!frozenRef.current && distToCursor < FREEZE_NEAR) {
                frozenRef.current = true;
                targetRef.current = { x: posRef.current.x, y: posRef.current.y };
                pathRef.current = [];
            } else if (frozenRef.current && distToCursor > FREEZE_FAR) {
                frozenRef.current = false;
            }
        }

        // ── Path recompute: trigger when target drifts >30px or no path yet ──
        const pt = pathTargetRef.current;
        const targetDrift = pt ? Math.hypot(targetRef.current.x - pt.x, targetRef.current.y - pt.y) : Infinity;
        const needsNewPath = targetDrift > 30;

        if (needsNewPath && distToFinalTarget > 5 && (time - lastPathTimeRef.current) > 150) {
            pathRef.current = computePath(
                { x: posRef.current.x, y: posRef.current.y },
                { x: targetRef.current.x, y: targetRef.current.y },
                boundsRef.current
            );
            pathTargetRef.current = { x: targetRef.current.x, y: targetRef.current.y };
            stuckTimerRef.current = 0;
            lastPathTimeRef.current = time;
        }

        if (distance > arrivalThreshold) {
            // Smooth easing: lerp towards target, clamped by max speed
            const easedFactor = 1 - Math.pow(1 - lerpFactor, timeScale);
            let moveX = dx * easedFactor;
            let moveY = dy * easedFactor;

            // Clamp to max speed
            const moveLen = Math.sqrt(moveX * moveX + moveY * moveY);
            if (moveLen > maxSpeed * timeScale) {
                const scale = (maxSpeed * timeScale) / moveLen;
                moveX *= scale;
                moveY *= scale;
            }

            let nextX = posRef.current.x + moveX;
            let nextY = posRef.current.y + moveY;

            // Check if sliding needed
            let hitX = false;
            let hitY = false;

            // Simple axis test
            for (const el of boundsRef.current) {
                if (isInsideElement(nextX, posRef.current.y, el)) hitX = true;
                if (isInsideElement(posRef.current.x, nextY, el)) hitY = true;
            }

            if (hitX && hitY) {
                // Diagonal block -> Full stop
                nextX = posRef.current.x;
                nextY = posRef.current.y;
            } else if (hitX) {
                // Blocked horizontally, slide vertically
                nextX = posRef.current.x;

                // Adjust sliding speed: boost it to full 'maxSpeed' along the Y axis
                const slideSpeed = (dy > 0 ? maxSpeed : -maxSpeed) * timeScale;
                if (Math.abs(dy) > 2) {
                    moveY = slideSpeed;
                }
                nextY = posRef.current.y + moveY;

                for (const el of boundsRef.current) {
                    if (isInsideElement(nextX, nextY, el)) {
                        nextY = posRef.current.y;
                    }
                }
            } else if (hitY) {
                // Blocked vertically, slide horizontally
                nextY = posRef.current.y;

                const slideSpeed = (dx > 0 ? maxSpeed : -maxSpeed) * timeScale;
                if (Math.abs(dx) > 2) {
                    moveX = slideSpeed;
                }
                nextX = posRef.current.x + moveX;

                for (const el of boundsRef.current) {
                    if (isInsideElement(nextX, nextY, el)) {
                        nextX = posRef.current.x;
                    }
                }
            } else {
                // Normal corner check for grazing hits
                for (const el of boundsRef.current) {
                    if (isInsideElement(nextX, nextY, el)) {
                        nextX = posRef.current.x;
                        nextY = posRef.current.y;
                    }
                }
            }

            const actuallyMoved = Math.abs(nextX - posRef.current.x) > 0.1 || Math.abs(nextY - posRef.current.y) > 0.1;

            if (actuallyMoved) {
                posRef.current.x = nextX;
                posRef.current.y = nextY;
                if (!isWalkingRef.current) {
                    isWalkingRef.current = true;
                    setIsWalking(true);
                }
                stuckTimerRef.current = 0;
            } else {
                if (isWalkingRef.current) {
                    isWalkingRef.current = false;
                    setIsWalking(false);
                }
                // ── Stuck detection: force path recompute after ~1 second stuck ──
                if (distToFinalTarget > 5) {
                    stuckTimerRef.current++;
                    if (stuckTimerRef.current > 60) {
                        pathRef.current = computePath(
                            { x: posRef.current.x, y: posRef.current.y },
                            { x: targetRef.current.x, y: targetRef.current.y },
                            boundsRef.current
                        );
                        pathTargetRef.current = { x: targetRef.current.x, y: targetRef.current.y };
                        stuckTimerRef.current = 0;
                        lastPathTimeRef.current = time;
                    }
                }
            }

            // Update facing based on movement direction (dx toward moveTarget)
            if (dx < -0.5 && !facingLeftRef.current) {
                facingLeftRef.current = true;
                setFacingLeft(true);
            } else if (dx > 0.5 && facingLeftRef.current) {
                facingLeftRef.current = false;
                setFacingLeft(false);
            }

        } else {
            // Snap to final target only when all waypoints are exhausted
            if (pathRef.current.length === 0) {
                posRef.current.x = targetRef.current.x;
                posRef.current.y = targetRef.current.y;
            }
            if (isWalkingRef.current) {
                isWalkingRef.current = false;
                setIsWalking(false);
            }

            // Fire arrival callback in guide mode — only when at the FINAL destination
            if (distToFinalTarget <= arrivalThreshold && isGuiding && guideTarget && onArrived && !arrivedRef.current) {
                arrivedRef.current = true;
                onArrived();
            }
        }

        if (charRef.current) {
            // Round to integers to prevent sub-pixel rendering artifacts (pixelation)
            const renderX = Math.round(posRef.current.x);
            const renderY = Math.round(posRef.current.y);
            charRef.current.style.transform = `translate(${renderX}px, ${renderY}px)`;
        }

        if (spriteRef.current) {
            spriteRef.current.style.transform = `scaleX(${facingLeftRef.current ? -1 : 1})`;
        }

        requestRef.current = requestAnimationFrame(updatePosition);
    };

    useEffect(() => {
        // Start loop
        lastTimeRef.current = performance.now();
        requestRef.current = requestAnimationFrame(updatePosition);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    // Determine which message to show
    let bubbleText = isGuiding ? (narrationDisplayed || null) : displayMessage;
    let showBubble = !!(bubbleText || (isGuiding && message));
    let isIntroBubble = false;

    // Override with intro prompt if it should be shown
    if (showIntro) {
        bubbleText = introGreeting;
        showBubble = true;
        isIntroBubble = true;
    }

    const showNextButton = isGuiding && narrationDone && message && !isIntroBubble && !isComplete;

    // Sync interactive-button state to ref so the rAF game loop can read it
    const hasInteractiveButtons = !!(showNextButton || isIntroBubble);
    hasInteractiveButtonsRef.current = hasInteractiveButtons;
    // When buttons disappear (user acted or tour moved on), always unfreeze
    if (!hasInteractiveButtons) frozenRef.current = false;

    return (
        <div
            ref={charRef}
            className="absolute w-[36px] h-[44px] -ml-[18px] -mt-[44px] pointer-events-none z-[65] will-change-transform"
            style={{
                transform: `translate(${Math.round(posRef.current.x)}px, ${Math.round(posRef.current.y)}px)`,
                transformOrigin: '18px 44px',
            }}
        >
            {/* ── Arrival Animation: Confetti ── */}
            <AnimatePresence>
                {arrivalAnimation === 'confetti' && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute -top-4 left-[14px] -translate-x-1/2 pointer-events-none"
                    >
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ x: 0, y: 0, scale: 1 }}
                                animate={{
                                    x: (Math.random() - 0.5) * 60,
                                    y: -(Math.random() * 40 + 20),
                                    scale: 0,
                                    rotate: Math.random() * 360,
                                }}
                                transition={{ duration: 0.8 + Math.random() * 0.4, ease: 'easeOut' }}
                                className="absolute w-2 h-2 rounded-full"
                                style={{
                                    backgroundColor: ['#7C5CFC', '#FF6B9D', '#FFD700', '#10B981', '#06B6D4'][i % 5],
                                }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Arrival Animation: Glow Ring ── */}
            <AnimatePresence>
                {arrivalAnimation === 'glow' && (
                    <motion.div
                        initial={{ opacity: 0.6, scale: 0.5 }}
                        animate={{ opacity: 0, scale: 2.5 }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 border-[#7C5CFC] pointer-events-none"
                    />
                )}
            </AnimatePresence>

            {/* ── Emote Emoji Overlay ── */}
            <AnimatePresence>
                {emote && !isWalking && (
                    <motion.div
                        initial={{ opacity: 0, y: 0, scale: 0.5 }}
                        animate={{ opacity: 1, y: -8, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        className="absolute -top-3 -right-3 text-[14px] z-30 pointer-events-none"
                    >
                        {EMOTE_EMOJI[emote]}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Chat / Narration Bubble ── */}
            <AnimatePresence>
                {showBubble && bubbleText && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className={`absolute bottom-full left-1/2 -ml-6 mb-4 origin-bottom-left ${
                            (isGuiding || isIntroBubble)
                                ? 'w-[260px] bg-[#1A1B2E] text-[#E4E4E5] border border-[#7C5CFC]/30 shadow-[0_0_20px_rgba(124,92,252,0.15)]'
                                : 'w-max max-w-[180px] bg-white text-[#2A2B3D] border-2 border-white'
                        } text-[11px] font-bold px-3 py-2 rounded-xl shadow-xl pointer-events-auto z-[80]`}
                    >
                        <div className="relative z-10 whitespace-normal text-center leading-snug">
                            {bubbleText}
                            {/* Typewriter cursor */}
                            {isGuiding && !narrationDone && (
                                <span className="inline-block w-1.5 h-3 bg-[#7C5CFC] ml-0.5 animate-pulse rounded-sm" />
                            )}
                        </div>

                        {/* Action buttons for guided tour */}
                        {showNextButton && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex gap-2 mt-2 pt-2 border-t border-white/10"
                            >
                                <button
                                    onClick={(e) => { e.stopPropagation(); onNextStep?.(); }}
                                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#7C5CFC] text-white text-[10px] font-bold hover:bg-[#6B4CE0] transition-colors"
                                >
                                    Next →
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onSkipTour?.(); }}
                                    className="px-3 py-1.5 rounded-lg bg-white/5 text-[#A1A1AA] text-[10px] font-semibold hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    Skip
                                </button>
                            </motion.div>
                        )}

                        {/* Action buttons for Intro Prompt */}
                        {isIntroBubble && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-white/10"
                            >
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onStartTour?.(); }}
                                        className="flex-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#7C5CFC] to-[#9D7BFF] text-white text-[10px] font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all active:scale-95"
                                    >
                                        ✨ Yes, show me!
                                    </button>
                                    {onStartTourWithVoice && typeof window !== 'undefined' && 'speechSynthesis' in window && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onStartTourWithVoice(); }}
                                            className="px-2.5 py-1.5 rounded-lg bg-white/10 border border-white/15 text-white text-[10px] font-bold hover:bg-white/15 hover:scale-[1.02] transition-all active:scale-95"
                                            title="Tour with voice narration"
                                        >
                                            🔊
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDismissTour?.(); }}
                                    className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[#A1A1AA] text-[10px] font-semibold hover:bg-white/10 hover:text-white hover:scale-[1.02] transition-all active:scale-95"
                                >
                                    I'll explore myself
                                </button>
                            </motion.div>
                        )}

                        {/* Tail */}
                        <div className={`absolute -bottom-2 left-6 w-3 h-3 rotate-45 transform origin-center shadow-sm ${
                            (isGuiding || isIntroBubble)
                                ? 'bg-[#1A1B2E] border-b border-r border-[#7C5CFC]/30'
                                : 'bg-white border-b-2 border-r-2 border-white'
                        }`} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Tour Progress Bar ── */}
            <AnimatePresence>
                {tourProgress && tourProgress.total > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        // Positioned floating slightly above his head, narrow width to match character
                        className="absolute -top-4 left-[14px] -translate-x-1/2 w-[34px] pointer-events-none flex flex-col items-center gap-1 z-[70]"
                    >
                        {/* The tiny progress bar container */}
                        <div className="w-full bg-black/20 rounded-full h-[4px] overflow-hidden backdrop-blur-sm border border-black/10 shadow-sm">
                            <motion.div
                                className="h-full bg-gradient-to-r from-[#7C5CFC] to-[#9D7BFF] rounded-full"
                                initial={{ width: '0%' }}
                                animate={{ width: `${((tourProgress.current + 1) / tourProgress.total) * 100}%` }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Sprite Container (Flips based on facing dir) ── */}
            <div ref={spriteRef} className="absolute inset-0" style={{ transform: `scaleX(${facingLeft ? -1 : 1})` }}>
                {/* Body Parts with Drop Shadow Outline */}
                <div
                    className="absolute inset-0"
                    style={{ filter: 'drop-shadow(2px 0 0 #111) drop-shadow(-2px 0 0 #111) drop-shadow(0 2px 0 #111) drop-shadow(0 -2px 0 #111)' }}
                >
                    <div className={`relative w-full h-full ${isWalking ? 'animate-amongus-bob' : ''} ${isIdleFidget ? 'animate-avatar-fidget' : ''}`}>
                        {/* Backpack */}
                        <div className="absolute top-[10px] left-[-6px] w-[14px] h-[22px] rounded-[6px] z-0" style={{ backgroundColor: color }}>
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-black/20 rounded-b-[6px]"></div>
                        </div>

                        {/* Left leg (Back leg) */}
                        <div className={`absolute bottom-[2px] left-[6px] w-[12px] h-[14px] rounded-b-[6px] rounded-t-[2px] z-0 ${isWalking ? 'animate-amongus-leg-1' : ''}`} style={{ backgroundColor: color }}>
                            <div className="absolute inset-x-0 bottom-0 h-[8px] bg-black/20 rounded-b-[6px]"></div>
                        </div>

                        {/* Right leg (Front leg) */}
                        <div className={`absolute bottom-[2px] right-[4px] w-[12px] h-[14px] rounded-b-[6px] rounded-t-[2px] z-0 ${isWalking ? 'animate-amongus-leg-2' : ''}`} style={{ backgroundColor: color }}>
                            <div className="absolute inset-x-0 bottom-0 h-[8px] bg-black/20 rounded-b-[6px]"></div>
                        </div>

                        {/* Body */}
                        <div className="absolute top-0 right-0 w-[28px] h-[32px] rounded-t-[14px] rounded-b-[6px] z-10 overflow-hidden" style={{ backgroundColor: color }}>
                            <div className="absolute top-0 right-0 w-full h-full bg-black/20 translate-y-3 -translate-x-3 rounded-t-[14px] rounded-b-[6px]"></div>
                            <div className="absolute top-0 right-0 w-full h-full bg-white/20 -translate-y-4 translate-x-2 rounded-full blur-[2px]"></div>
                        </div>
                    </div>
                </div>

                {/* Visor & Shadow below character MUST NOT be in the drop-shadow filter */}
                <div className={`absolute inset-0 z-20 ${isWalking ? 'animate-amongus-bob' : ''}`}>
                    <div className="absolute top-[6px] right-[-4px] w-[20px] h-[12px] bg-[#92D1DF] rounded-full overflow-hidden border-[2px] border-[#111]">
                        <div className="absolute top-0 left-0 w-full h-full bg-[#527F8B] translate-y-1 rounded-full"></div>
                        <div className="absolute top-[2px] right-[4px] w-[10px] h-[3px] bg-white rounded-full rotate-[-8deg] z-30"></div>
                    </div>
                </div>
            </div>

            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/15 rounded-full blur-[2px] z-[-1]"></div>
        </div>
    );
}
