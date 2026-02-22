import { useEffect, useRef, useState } from 'react';

interface Props {
    targetX: number;
    targetY: number;
    color: string;
}

export default function Character({ targetX, targetY, color }: Props) {
    // Use refs for positions for smooth 60fps mutability without React re-renders
    const posRef = useRef({ x: targetX, y: targetY });
    const targetRef = useRef({ x: targetX, y: targetY });
    const requestRef = useRef<number>(0);

    // Ref to the DOM element for direct transform updates
    const charRef = useRef<HTMLDivElement>(null);

    // State for facing direction (to flip sprite) and walking state
    const [facingLeft, setFacingLeft] = useState(false);
    const [isWalking, setIsWalking] = useState(false);
    const facingLeftRef = useRef(false);
    const isWalkingRef = useRef(false);

    // Speed in pixels per frame
    const speed = 3;

    // Update target when props change
    useEffect(() => {
        targetRef.current = { x: targetX, y: targetY };
    }, [targetX, targetY]);

    // The Game Loop
    const updatePosition = () => {
        const dx = targetRef.current.x - posRef.current.x;
        const dy = targetRef.current.y - posRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 5) {
            if (!isWalkingRef.current) {
                isWalkingRef.current = true;
                setIsWalking(true);
            }

            const vx = (dx / distance) * speed;
            const vy = (dy / distance) * speed;

            posRef.current.x += vx;
            posRef.current.y += vy;

            // Update facing
            if (vx < -0.5 && !facingLeftRef.current) {
                facingLeftRef.current = true;
                setFacingLeft(true);
            } else if (vx > 0.5 && facingLeftRef.current) {
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
