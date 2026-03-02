import { useEffect, useRef, useState } from 'react';
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

export default function Character({ targetX, targetY, color, elementBounds = [] }: Props) {
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

    // Ref to the DOM element for direct transform updates
    const charRef = useRef<HTMLDivElement>(null);

    // State for facing direction (to flip sprite) and walking state
    const [facingLeft, setFacingLeft] = useState(false);
    const [isWalking, setIsWalking] = useState(false);
    const facingLeftRef = useRef(false);
    const isWalkingRef = useRef(false);

    // Speed in pixels per frame
    const speed = 3.0;

    // Update target when props change — clamp to element borders
    useEffect(() => {
        boundsRef.current = elementBounds;
    }, [elementBounds]);

    useEffect(() => {
        let tx = targetX;
        let ty = targetY;
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
    }, [targetX, targetY]);

    // The Game Loop
    const updatePosition = () => {
        const dx = targetRef.current.x - posRef.current.x;
        const dy = targetRef.current.y - posRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 5) {
            let vx = (dx / distance) * speed;
            let vy = (dy / distance) * speed;

            let nextX = posRef.current.x + vx;
            let nextY = posRef.current.y + vy;

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

                // Adjust sliding speed: boost it to full 'speed' along the Y axis
                // to slide along the obstacle
                const slideSpeed = dy > 0 ? speed : -speed;
                // Only slide if moving makes sense (distance along y is significant)
                if (Math.abs(dy) > 2) {
                    vy = slideSpeed;
                }
                nextY = posRef.current.y + vy;

                // Check corner/edge again with the boosted sliding speed
                for (const el of boundsRef.current) {
                    if (isInsideElement(nextX, nextY, el)) {
                        nextY = posRef.current.y; // Abort slide if it hits another wall (inner corner)
                    }
                }
            } else if (hitY) {
                // Blocked vertically, slide horizontally
                nextY = posRef.current.y;

                const slideSpeed = dx > 0 ? speed : -speed;
                if (Math.abs(dx) > 2) {
                    vx = slideSpeed;
                }
                nextX = posRef.current.x + vx;

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
            } else {
                if (isWalkingRef.current) {
                    isWalkingRef.current = false;
                    setIsWalking(false);
                }
            }

            // Update facing based on target direction (dx)
            if (dx < -0.5 && !facingLeftRef.current) {
                facingLeftRef.current = true;
                setFacingLeft(true);
            } else if (dx > 0.5 && facingLeftRef.current) {
                facingLeftRef.current = false;
                setFacingLeft(false);
            }

        } else {
            if (isWalkingRef.current) {
                isWalkingRef.current = false;
                setIsWalking(false);
            }
        }

        if (charRef.current) {
            // Direct DOM manipulation for buttery smooth movement
            charRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px) scaleX(${facingLeftRef.current ? -1 : 1})`;
        }

        requestRef.current = requestAnimationFrame(updatePosition);
    };

    useEffect(() => {
        // Start loop
        requestRef.current = requestAnimationFrame(updatePosition);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return (
        <div
            ref={charRef}
            className="absolute w-[36px] h-[44px] -ml-[18px] -mt-[44px] pointer-events-none z-50 will-change-transform"
            style={{
                transform: `translate(${posRef.current.x}px, ${posRef.current.y}px) scaleX(${facingLeft ? -1 : 1})`,
            }}
        >
            {/* Body Parts with Drop Shadow Outline */}
            <div
                className="absolute inset-0"
                style={{ filter: 'drop-shadow(2px 0 0 #111) drop-shadow(-2px 0 0 #111) drop-shadow(0 2px 0 #111) drop-shadow(0 -2px 0 #111)' }}
            >
                <div className={`relative w-full h-full ${isWalking ? 'animate-amongus-bob' : ''}`}>
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

            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/15 rounded-full blur-[2px] z-[-1]"></div>
        </div>
    );
}
