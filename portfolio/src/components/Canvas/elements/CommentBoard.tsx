import { MessageSquare } from 'lucide-react';
import type { CanvasElement } from '../../../types';

interface Props {
    element: CanvasElement;
    isSelected?: boolean;
}

export default function CommentBoard({ element, isSelected }: Props) {
    return (
        <div
            className={`relative w-full h-full bg-surface-1/50 border-2 border-dashed rounded-3xl overflow-hidden transition-colors ${isSelected ? 'border-accent-purple bg-accent-purple/5' : 'border-panel-border hover:border-text-secondary/50'
                }`}
            style={{
                width: element.width,
                height: element.height,
                background: 'rgba(255,255,255,0.48)',
                borderColor: isSelected ? 'rgba(var(--exec-accent-rgb), 0.55)' : 'rgba(32,36,44,0.16)',
                borderRadius: '18px',
            }}
        >
            <div
                className="absolute inset-0 opacity-[0.13] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #20242c 1px, transparent 1.25px)',
                    backgroundSize: '24px 24px'
                }}
            />

            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center pointer-events-none">
                <div className="w-12 h-12 bg-white/75 rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-[var(--exec-line)]">
                    <MessageSquare className="w-6 h-6 text-[var(--exec-muted)]" />
                </div>
                <h3 className="text-xl font-semibold tracking-normal text-[var(--exec-ink)] mb-2">
                    Comment Board
                </h3>
                <p className="text-[var(--exec-muted)] max-w-sm text-sm leading-relaxed">
                    Click anywhere inside this dashed area to place a new note. You can drag existing notes to move them.
                </p>
            </div>

        </div>
    );
}
