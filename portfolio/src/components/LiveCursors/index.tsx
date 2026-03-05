import { useEffect } from 'react';
import { MousePointer2 } from 'lucide-react';
import type { ActiveViewer } from '../../hooks/useRealtimeSession';

interface LiveCursorsProps {
    activeViewers: ActiveViewer[];
    cursors: Record<string, { x: number, y: number }>;
    localIdentity: ActiveViewer | null;
    broadcastCursor: (x: number, y: number) => void;
}

export default function LiveCursors({ activeViewers, cursors, localIdentity, broadcastCursor }: LiveCursorsProps) {
    useEffect(() => {
        if (!localIdentity) return;

        let rafId: number;
        let lastX = 0;
        let lastY = 0;

        const handleMouseMove = (e: MouseEvent) => {
            lastX = e.clientX;
            lastY = e.clientY;

            if (!rafId) {
                rafId = requestAnimationFrame(() => {
                    broadcastCursor(lastX, lastY);
                    rafId = 0;
                });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [localIdentity, broadcastCursor]);

    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
            {activeViewers.map((viewer) => {
                if (localIdentity && viewer.id === localIdentity.id) return null;

                const pos = cursors[viewer.id];
                if (!pos) return null;

                return (
                    <div
                        key={viewer.id}
                        className="absolute top-0 left-0 transition-all duration-75 ease-linear will-change-transform"
                        style={{
                            transform: `translate(${pos.x}px, ${pos.y}px)`,
                        }}
                    >
                        <MousePointer2
                            className="w-5 h-5"
                            fill={viewer.color}
                            color={viewer.color}
                            strokeWidth={1.5}
                            stroke="white"
                        />
                        <div
                            className="mt-1 ml-4 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-md whitespace-nowrap w-max"
                            style={{ backgroundColor: viewer.color }}
                        >
                            {viewer.name}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
