/**
 * AmongUsAvatar — Reusable Among Us crewmate rendered as pure CSS/divs.
 * Extracted from the GameEngine.tsx canvas drawing for use in React components.
 */
interface Props {
    color?: string;
    size?: number;
    animated?: boolean;
    className?: string;
}

export default function AmongUsAvatar({
    color = '#C74B18',
    size = 1,
    animated = true,
    className = '',
}: Props) {
    const scale = size;

    return (
        <div
            className={`relative inline-block ${className}`}
            style={{
                width: `${36 * scale}px`,
                height: `${44 * scale}px`,
                transform: `scale(${scale})`,
                transformOrigin: 'bottom center',
            }}
        >
            {/* Walking bob wrapper */}
            <div className={animated ? 'animate-amongus-bob' : ''}>
                {/* Ground shadow */}
                <div
                    className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 rounded-full"
                    style={{
                        width: '32px',
                        height: '8px',
                        background: 'rgba(0,0,0,0.15)',
                    }}
                />

                {/* Backpack */}
                <div
                    className="absolute"
                    style={{
                        top: '10px',
                        left: '-6px',
                        width: '14px',
                        height: '22px',
                        borderRadius: '6px',
                        background: color,
                        filter: 'drop-shadow(2px 0 0 #111) drop-shadow(-2px 0 0 #111) drop-shadow(0 2px 0 #111) drop-shadow(0 -2px 0 #111)',
                    }}
                >
                    {/* Backpack shade */}
                    <div
                        className="absolute bottom-0 left-0 right-0"
                        style={{
                            height: '11px',
                            borderRadius: '0 0 6px 6px',
                            background: 'rgba(0,0,0,0.20)',
                        }}
                    />
                </div>

                {/* Left Leg */}
                <div
                    className={`absolute ${animated ? 'animate-amongus-leg-1' : ''}`}
                    style={{
                        bottom: '2px',
                        left: '6px',
                        width: '12px',
                        height: '14px',
                        borderRadius: '2px 2px 6px 6px',
                        background: color,
                        filter: 'drop-shadow(2px 0 0 #111) drop-shadow(-2px 0 0 #111) drop-shadow(0 2px 0 #111) drop-shadow(0 -2px 0 #111)',
                    }}
                >
                    <div
                        className="absolute bottom-0 left-0 right-0"
                        style={{
                            height: '8px',
                            borderRadius: '0 0 6px 6px',
                            background: 'rgba(0,0,0,0.20)',
                        }}
                    />
                </div>

                {/* Right Leg */}
                <div
                    className={`absolute ${animated ? 'animate-amongus-leg-2' : ''}`}
                    style={{
                        bottom: '2px',
                        right: '4px',
                        width: '12px',
                        height: '14px',
                        borderRadius: '2px 2px 6px 6px',
                        background: color,
                        filter: 'drop-shadow(2px 0 0 #111) drop-shadow(-2px 0 0 #111) drop-shadow(0 2px 0 #111) drop-shadow(0 -2px 0 #111)',
                    }}
                >
                    <div
                        className="absolute bottom-0 left-0 right-0"
                        style={{
                            height: '8px',
                            borderRadius: '0 0 6px 6px',
                            background: 'rgba(0,0,0,0.20)',
                        }}
                    />
                </div>

                {/* Body */}
                <div
                    className="absolute"
                    style={{
                        top: 0,
                        right: 0,
                        width: '28px',
                        height: '32px',
                        borderRadius: '14px 14px 6px 6px',
                        background: color,
                        filter: 'drop-shadow(2px 0 0 #111) drop-shadow(-2px 0 0 #111) drop-shadow(0 2px 0 #111) drop-shadow(0 -2px 0 #111)',
                        overflow: 'hidden',
                    }}
                >
                    {/* Body dark shade */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: 'rgba(0,0,0,0.20)',
                            borderRadius: '14px 14px 6px 6px',
                            transform: 'translateY(3px) translateX(3px)',
                        }}
                    />
                    {/* Body glow highlight */}
                    <div
                        className="absolute"
                        style={{
                            top: '8px',
                            left: '8px',
                            width: '16px',
                            height: '12px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.18)',
                            filter: 'blur(4px)',
                            transform: 'translateY(-4px) translateX(2px)',
                        }}
                    />
                </div>

                {/* Visor */}
                <div
                    className="absolute"
                    style={{
                        top: '6px',
                        right: '-4px',
                        width: '20px',
                        height: '12px',
                        borderRadius: '9999px',
                        background: '#92D1DF',
                        filter: 'drop-shadow(2px 0 0 #111) drop-shadow(-2px 0 0 #111) drop-shadow(0 2px 0 #111) drop-shadow(0 -2px 0 #111)',
                        overflow: 'hidden',
                    }}
                >
                    {/* Visor inner shadow */}
                    <div
                        className="absolute"
                        style={{
                            top: '4px',
                            left: '1px',
                            right: '1px',
                            height: '10px',
                            borderRadius: '9999px',
                            background: '#527F8B',
                        }}
                    />
                    {/* Visor shine */}
                    <div
                        className="absolute"
                        style={{
                            top: '2px',
                            right: '4px',
                            width: '10px',
                            height: '3px',
                            borderRadius: '9999px',
                            background: 'rgba(255,255,255,0.85)',
                            transform: 'rotate(-8deg)',
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
