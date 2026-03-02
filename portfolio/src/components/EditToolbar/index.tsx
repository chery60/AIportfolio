import React, { useState } from 'react';
import { Type, Image as ImageIcon, StickyNote, MessageSquareQuote, MonitorPlay, Key, Check } from 'lucide-react';
import type { CanvasElementType } from '../../types';

const DRAGGABLE_ELEMENTS: { type: CanvasElementType; label: string; icon: React.ElementType; color: string }[] = [
    { type: 'text-block', label: 'Text Block', icon: Type, color: '#3B82F6' },
    { type: 'image-frame', label: 'Image Frame', icon: ImageIcon, color: '#10B981' },
    { type: 'sticky-note', label: 'Sticky Note', icon: StickyNote, color: '#F59E0B' },
    { type: 'quote-block', label: 'Quote', icon: MessageSquareQuote, color: '#8B5CF6' },
    { type: 'prototype-embed', label: 'Prototype', icon: MonitorPlay, color: '#EC4899' },
];

export default function EditToolbar() {
    const [apiKey, setApiKey] = useState('');
    const [showSavedMsg, setShowSavedMsg] = useState(false);

    const handleDragStart = (e: React.DragEvent, type: CanvasElementType) => {
        e.dataTransfer.setData('canvas/element-type', type);
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleSaveToken = () => {
        // Save to localStorage or just local state for now
        if (apiKey) {
            localStorage.setItem('ai_api_key', apiKey);
            setShowSavedMsg(true);
            setTimeout(() => setShowSavedMsg(false), 2000);
        }
    };

    return (
        <div
            className="flex flex-col h-full bg-white border border-panel-border shadow-2xl shadow-black/5 rounded-2xl flex-shrink-0 relative pointer-events-auto transition-all overflow-hidden"
            style={{ width: '280px' }}
        >
            <div className="flex items-center justify-between px-4 py-3 border-b border-panel-border bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent-purple" />
                    <span className="text-xs font-semibold text-text-primary">Creator Tools</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-6">
                {/* Components Section */}
                <div className="p-4 border-b border-panel-border">
                    <SectionTitle>DRAGGABLE COMPONENTS</SectionTitle>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                        {DRAGGABLE_ELEMENTS.map((el) => (
                            <div
                                key={el.type}
                                draggable
                                onDragStart={(e) => handleDragStart(e, el.type)}
                                className="flex flex-col items-center justify-center p-3 bg-surface-1 hover:bg-surface-2 rounded-xl border border-transparent hover:border-panel-border cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02]"
                            >
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 shadow-sm"
                                    style={{ backgroundColor: `${el.color}15`, color: el.color }}
                                >
                                    <el.icon className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-semibold text-text-primary text-center">
                                    {el.label}
                                </span>
                                <span className="text-[9px] text-text-secondary mt-0.5">Drag to add</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Integration Section */}
                <div className="p-4 border-b border-panel-border">
                    <SectionTitle>AI INTEGRATION</SectionTitle>
                    <div className="mt-3 space-y-2">
                        <p className="text-[10px] text-text-secondary leading-relaxed mb-2">
                            Enter your API key to enable AI-powered layout generation and content suggestions.
                        </p>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                <Key className="h-3 w-3 text-text-secondary" />
                            </div>
                            <input
                                type="password"
                                placeholder="sk-..."
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="w-full bg-surface-1 border border-panel-border rounded-md pl-8 pr-3 py-2 text-xs text-text-primary outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple transition-all"
                            />
                        </div>
                        <button
                            onClick={handleSaveToken}
                            className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 rounded-md bg-white border border-panel-border hover:bg-surface-1 text-xs font-semibold text-text-primary transition-colors"
                        >
                            {showSavedMsg ? (
                                <>
                                    <Check className="w-3.5 h-3.5 text-green-500" />
                                    <span className="text-green-600">Saved!</span>
                                </>
                            ) : (
                                'Save API Key'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h3 className="text-[10px] font-bold tracking-widest text-text-secondary uppercase">{children}</h3>;
}
