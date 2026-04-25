import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHARACTER_COLLISION_MARGIN } from '../../constants/canvasSpacing';

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
}

/**
 * Returns true if point (px, py) is inside the rectangle with a margin buffer.
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

const CORNER_CLEARANCE = 20;

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

    const ps = [-dx, dx, -dy, dy];
    const qs = [x1 - xMin, xMax - x1, y1 - yMin, yMax - y1];

    for (let i = 0; i < 4; i++) {
        const p = ps[i];
        const q = qs[i];
        if (p === 0) {
            if (q < 0) return false;
        } else if (p < 0) {
            tEnter = Math.max(tEnter, q / p);
        } else {
            tExit = Math.min(tExit, q / p);
        }
        if (tEnter >= tExit) return false;
    }
    return true;
}

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

function computePath(
    start: Waypoint,
    end: Waypoint,
    bounds: ElementBounds[]
): Waypoint[] {
    if (hasLineOfSight(start.x, start.y, end.x, end.y, bounds, CHARACTER_COLLISION_MARGIN)) {
        return [end];
    }

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
            if (!bounds.some(other => isInsideElement(c.x, c.y, other))) {
                cornerWaypoints.push(c);
            }
        }
    }

    const allWaypoints: Waypoint[] = [start, end, ...cornerWaypoints];
    const N = allWaypoints.length;

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

    const INF = Infinity;
    const gScore = new Array<number>(N).fill(INF);
    const fScore = new Array<number>(N).fill(INF);
    const cameFrom = new Array<number>(N).fill(-1);
    gScore[0] = 0;
    fScore[0] = Math.hypot(end.x - start.x, end.y - start.y);

    const openSet = new Set<number>([0]);

    while (openSet.size > 0) {
        let current = -1;
        let bestF = INF;
        for (const node of openSet) {
            if (fScore[node] < bestF) { bestF = fScore[node]; current = node; }
        }

        if (current === 1) {
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

    return [end];
}

export default function Character({
    targetX, targetY, color, elementBounds = [], message = null, canvasScale = 1,
}: Props) {
    // ── Drop-entrance state ──────────────────────────────────────────────
    // The character enters head-first (upside down, rotated 180°), falls
    // with gravity, flips mid-air to land on its feet, then squishes.
    const DROP_GRAVITY = 0.18;       // px / frame² — tuned for ~1.2s fall
    const DROP_START_Y = -180;       // above viewport

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

    // Start at the correct X but far above the target Y
    const posRef = useRef({ x: initialPos.x, y: DROP_START_Y });
    const targetRef = useRef({ x: initialPos.x, y: initialPos.y });
    const requestRef = useRef<number>(0);
    const boundsRef = useRef<ElementBounds[]>(elementBounds);
    const lastTimeRef = useRef<number>(performance.now());

    // Drop-phase tracking
    const dropPhaseRef = useRef<'falling' | 'landed' | 'done'>('falling');
    const dropVelocityRef = useRef(0);            // current downward velocity
    const dropRotationRef = useRef(180);           // degrees: 180 = upside-down → 0 = upright
    const landingYRef = useRef(initialPos.y);      // where the character should land
    const totalDropDistance = useRef(initialPos.y - DROP_START_Y); // total fall distance
    const [isSquishing, setIsSquishing] = useState(false);

    const pathRef = useRef<Waypoint[]>([]);
    const pathTargetRef = useRef<Waypoint | null>(null);
    const stuckTimerRef = useRef<number>(0);
    const lastPathTimeRef = useRef<number>(0);

    const charRef = useRef<HTMLDivElement>(null);
    const spriteRef = useRef<HTMLDivElement>(null);
    const dropRotWrapperRef = useRef<HTMLDivElement>(null); // separate div for drop rotation

    const [facingLeft, setFacingLeft] = useState(false);
    const [isWalking, setIsWalking] = useState(false);
    const facingLeftRef = useRef(false);
    const isWalkingRef = useRef(false);

    const [isIdleFidget, setIsIdleFidget] = useState(false);
    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const canvasScaleRef = useRef(canvasScale);
    useEffect(() => { canvasScaleRef.current = canvasScale; }, [canvasScale]);

    const resetIdleTimer = useCallback(() => {
        setIsIdleFidget(false);
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => {
            setIsIdleFidget(true);
            setTimeout(() => setIsIdleFidget(false), 2000);
        }, 6000);
    }, []);

    useEffect(() => {
        resetIdleTimer();
        return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
    }, [resetIdleTimer]);

    const maxSpeed = 7.0;
    const lerpFactor = 0.08;
    const arrivalThreshold = 20;

    useEffect(() => {
        boundsRef.current = elementBounds;
        pathRef.current = [];
        pathTargetRef.current = null;
    }, [elementBounds]);

    useEffect(() => {
        let tx = targetX;
        let ty = targetY;

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
    }, [targetX, targetY, resetIdleTimer]);

    // Game Loop
    const updatePosition = (time: number) => {
        const dt = time - lastTimeRef.current;
        lastTimeRef.current = time;
        const safeDt = Math.min(dt, 100);
        const timeScale = safeDt / (1000 / 60);

        // ── DROP PHASE: head-first fall with mid-air flip ─────────────────
        if (dropPhaseRef.current === 'falling') {
            dropVelocityRef.current += DROP_GRAVITY * timeScale;
            posRef.current.y += dropVelocityRef.current * timeScale;

            // Compute how far through the fall we are (0 → 1)
            const fallProgress = Math.min(1, Math.max(0,
                (posRef.current.y - DROP_START_Y) / totalDropDistance.current
            ));

            // Eased rotation: slow start, fast mid-flip, soft finish
            // Using a cubic-ish ease-in-out so the flip feels snappy in the middle
            const eased = fallProgress < 0.5
                ? 4 * fallProgress * fallProgress * fallProgress
                : 1 - Math.pow(-2 * fallProgress + 2, 3) / 2;

            // Rotate from 180° (head-first) → 0° (upright)
            dropRotationRef.current = 180 * (1 - eased);

            // Reached (or passed) landing position?
            if (posRef.current.y >= landingYRef.current) {
                posRef.current.y = landingYRef.current;
                dropPhaseRef.current = 'landed';
                dropVelocityRef.current = 0;
                dropRotationRef.current = 0;

                // Trigger squish animation then transition to normal movement
                setIsSquishing(true);
                setTimeout(() => {
                    setIsSquishing(false);
                    dropPhaseRef.current = 'done';
                    posRef.current.x = initialPos.x;
                    posRef.current.y = initialPos.y;
                }, 450); // matches CSS squish-bounce duration
            }

            // Render position + rotation during drop
            if (charRef.current) {
                const renderX = Math.round(posRef.current.x);
                const renderY = Math.round(posRef.current.y);
                charRef.current.style.transform = `translate(${renderX}px, ${renderY}px)`;
            }
            if (dropRotWrapperRef.current) {
                dropRotWrapperRef.current.style.transform = `rotate(${dropRotationRef.current}deg)`;
            }

            requestRef.current = requestAnimationFrame(updatePosition);
            return; // Skip normal movement logic while falling
        }

        // While the squish animation plays, freeze position but reset rotation
        if (dropPhaseRef.current === 'landed') {
            if (dropRotWrapperRef.current) {
                dropRotWrapperRef.current.style.transform = 'rotate(0deg)';
            }
            requestRef.current = requestAnimationFrame(updatePosition);
            return;
        }

        // ── NORMAL MOVEMENT (dropPhase === 'done') ───────────────────────

        // Snap out if engulfed by an element
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

        // Advance to next waypoint when close enough
        const WAYPOINT_ARRIVE_DIST = 15;
        if (pathRef.current.length > 0) {
            const wp = pathRef.current[0];
            const wpDist = Math.hypot(wp.x - posRef.current.x, wp.y - posRef.current.y);
            if (wpDist < WAYPOINT_ARRIVE_DIST) {
                pathRef.current = pathRef.current.slice(1);
            }
        }

        const moveTarget = pathRef.current.length > 0 ? pathRef.current[0] : targetRef.current;
        const dx = moveTarget.x - posRef.current.x;
        const dy = moveTarget.y - posRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const distToFinalTarget = Math.hypot(
            targetRef.current.x - posRef.current.x,
            targetRef.current.y - posRef.current.y
        );

        // Path recompute when target drifts
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
            const easedFactor = 1 - Math.pow(1 - lerpFactor, timeScale);
            let moveX = dx * easedFactor;
            let moveY = dy * easedFactor;

            const moveLen = Math.sqrt(moveX * moveX + moveY * moveY);
            if (moveLen > maxSpeed * timeScale) {
                const scale = (maxSpeed * timeScale) / moveLen;
                moveX *= scale;
                moveY *= scale;
            }

            let nextX = posRef.current.x + moveX;
            let nextY = posRef.current.y + moveY;

            let hitX = false;
            let hitY = false;

            for (const el of boundsRef.current) {
                if (isInsideElement(nextX, posRef.current.y, el)) hitX = true;
                if (isInsideElement(posRef.current.x, nextY, el)) hitY = true;
            }

            if (hitX && hitY) {
                nextX = posRef.current.x;
                nextY = posRef.current.y;
            } else if (hitX) {
                nextX = posRef.current.x;
                const slideSpeed = (dy > 0 ? maxSpeed : -maxSpeed) * timeScale;
                if (Math.abs(dy) > 2) moveY = slideSpeed;
                nextY = posRef.current.y + moveY;
                for (const el of boundsRef.current) {
                    if (isInsideElement(nextX, nextY, el)) nextY = posRef.current.y;
                }
            } else if (hitY) {
                nextY = posRef.current.y;
                const slideSpeed = (dx > 0 ? maxSpeed : -maxSpeed) * timeScale;
                if (Math.abs(dx) > 2) moveX = slideSpeed;
                nextX = posRef.current.x + moveX;
                for (const el of boundsRef.current) {
                    if (isInsideElement(nextX, nextY, el)) nextX = posRef.current.x;
                }
            } else {
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

            if (dx < -0.5 && !facingLeftRef.current) {
                facingLeftRef.current = true;
                setFacingLeft(true);
            } else if (dx > 0.5 && facingLeftRef.current) {
                facingLeftRef.current = false;
                setFacingLeft(false);
            }

        } else {
            if (pathRef.current.length === 0) {
                posRef.current.x = targetRef.current.x;
                posRef.current.y = targetRef.current.y;
            }
            if (isWalkingRef.current) {
                isWalkingRef.current = false;
                setIsWalking(false);
            }
        }

        if (charRef.current) {
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
        lastTimeRef.current = performance.now();
        requestRef.current = requestAnimationFrame(updatePosition);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return (
        <div
            ref={charRef}
            className="absolute w-[36px] h-[44px] -ml-[18px] -mt-[44px] pointer-events-none z-[65] will-change-transform"
            style={{
                transform: `translate(${Math.round(posRef.current.x)}px, ${Math.round(posRef.current.y)}px)`,
                transformOrigin: '18px 44px',
            }}
        >

            {/* ── Message Bubble ── */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="absolute bottom-full left-1/2 -ml-6 mb-4 origin-bottom-left w-max max-w-[180px] bg-white text-[#2A2B3D] border-2 border-white text-[11px] font-bold px-3 py-2 rounded-xl shadow-xl pointer-events-none z-[80]"
                    >
                        <div className="relative z-10 whitespace-normal text-center leading-snug">
                            {message}
                        </div>
                        {/* Tail */}
                        <div className="absolute -bottom-2 left-6 w-3 h-3 rotate-45 transform origin-center shadow-sm bg-white border-b-2 border-r-2 border-white" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Drop Rotation Wrapper (only active during fall) ── */}
            <div
                ref={dropRotWrapperRef}
                style={{ transform: 'rotate(180deg)', transformOrigin: 'center center' }}
            >
            {/* ── Sprite ── */}
            <div ref={spriteRef} style={{ transform: `scaleX(${facingLeft ? -1 : 1})` }}>
                {/* Walking bob wrapper — also applies squish on landing */}
                <div
                    className={`${isWalking || isIdleFidget ? 'animate-amongus-bob' : ''} ${isSquishing ? 'animate-drop-squish' : ''}`}
                    style={{ position: 'relative', width: '36px', height: '44px' }}
                >
                    {/* Ground shadow */}
                    <div
                        className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 rounded-full"
                        style={{ width: '32px', height: '8px', background: 'rgba(0,0,0,0.15)' }}
                    />

                    {/* Backpack */}
                    <div
                        className="absolute"
                        style={{
                            top: '10px', left: '-6px', width: '14px', height: '22px',
                            borderRadius: '6px', background: color,
                            filter: 'drop-shadow(2px 0 0 #111) drop-shadow(-2px 0 0 #111) drop-shadow(0 2px 0 #111) drop-shadow(0 -2px 0 #111)',
                        }}
                    >
                        <div className="absolute bottom-0 left-0 right-0" style={{ height: '11px', borderRadius: '0 0 6px 6px', background: 'rgba(0,0,0,0.20)' }} />
                    </div>

                    {/* Left Leg */}
                    <div
                        className={`absolute ${isWalking ? 'animate-amongus-leg-1' : ''}`}
                        style={{
                            bottom: '2px', left: '6px', width: '12px', height: '14px',
                            borderRadius: '2px 2px 6px 6px', background: color,
                            filter: 'drop-shadow(2px 0 0 #111) drop-shadow(-2px 0 0 #111) drop-shadow(0 2px 0 #111) drop-shadow(0 -2px 0 #111)',
                        }}
                    >
                        <div className="absolute bottom-0 left-0 right-0" style={{ height: '8px', borderRadius: '0 0 6px 6px', background: 'rgba(0,0,0,0.20)' }} />
                    </div>

                    {/* Right Leg */}
                    <div
                        className={`absolute ${isWalking ? 'animate-amongus-leg-2' : ''}`}
                        style={{
                            bottom: '2px', right: '4px', width: '12px', height: '14px',
                            borderRadius: '2px 2px 6px 6px', background: color,
                            filter: 'drop-shadow(2px 0 0 #111) drop-shadow(-2px 0 0 #111) drop-shadow(0 2px 0 #111) drop-shadow(0 -2px 0 #111)',
                        }}
                    >
                        <div className="absolute bottom-0 left-0 right-0" style={{ height: '8px', borderRadius: '0 0 6px 6px', background: 'rgba(0,0,0,0.20)' }} />
                    </div>

                    {/* Body */}
                    <div
                        className="absolute"
                        style={{
                            top: 0, right: 0, width: '28px', height: '32px',
                            borderRadius: '14px 14px 6px 6px', background: color,
                            filter: 'drop-shadow(2px 0 0 #111) drop-shadow(-2px 0 0 #111) drop-shadow(0 2px 0 #111) drop-shadow(0 -2px 0 #111)',
                            overflow: 'hidden',
                        }}
                    >
                        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.20)', borderRadius: '14px 14px 6px 6px', transform: 'translateY(3px) translateX(3px)' }} />
                        <div className="absolute" style={{ top: '8px', left: '8px', width: '16px', height: '12px', borderRadius: '50%', background: 'rgba(255,255,255,0.18)', filter: 'blur(4px)', transform: 'translateY(-4px) translateX(2px)' }} />
                    </div>

                    {/* Visor */}
                    <div
                        className="absolute"
                        style={{
                            top: '6px', right: '-4px', width: '20px', height: '12px',
                            borderRadius: '9999px', background: '#92D1DF',
                            filter: 'drop-shadow(2px 0 0 #111) drop-shadow(-2px 0 0 #111) drop-shadow(0 2px 0 #111) drop-shadow(0 -2px 0 #111)',
                            overflow: 'hidden',
                        }}
                    >
                        <div className="absolute" style={{ top: '4px', left: '1px', right: '1px', height: '10px', borderRadius: '9999px', background: '#527F8B' }} />
                        <div className="absolute" style={{ top: '2px', right: '4px', width: '10px', height: '3px', borderRadius: '9999px', background: 'rgba(255,255,255,0.85)', transform: 'rotate(-8deg)' }} />
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}
