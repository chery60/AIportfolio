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
            }}
        >
            {/* Subtle grid background */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(to right, #808080 1px, transparent 1px), linear-gradient(to bottom, #808080 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center pointer-events-none">
                <div className="w-16 h-16 bg-surface-2 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-panel-border">
                    <MessageSquare className="w-8 h-8 text-text-secondary" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-text-primary mb-2">
                    Comment Board
                </h3>
                <p className="text-text-secondary max-w-sm">
                    Click anywhere inside this dashed area to place a new note. You can drag existing notes to move them.
                </p>
            </div>

        </div>
    );
}
