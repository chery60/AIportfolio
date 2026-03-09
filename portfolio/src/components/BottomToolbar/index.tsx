import { useState } from 'react';
import { Hand, StickyNote, Minus, Plus, Maximize, Smartphone, Bot, ExternalLink, BoxSelect, MonitorPlay, Sparkles, Undo, Redo, ChevronDown, X } from 'lucide-react';
import type { Project } from '../../types';

interface Props {
  project: Project;
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitToScreen: () => void;
  onAddNote: () => void;
  isEditing?: boolean;
  isPreviewMode?: boolean;
  onTogglePreview?: (preview: boolean) => void;
}

export default function BottomToolbar({
  project,
  scale,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToScreen,
  onAddNote,
  isEditing = false,
  isPreviewMode = false,
  onTogglePreview,
}: Props) {
  const [activeTool, setActiveTool] = useState<'pointer' | 'comment'>('pointer');
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  // Dynamic context action based on the selected project
  const renderContextAction = () => {
    switch (project.id) {
      case 'beacon-ai':
        return (
          <button className="flex items-center gap-1.5 px-4 h-9 ml-1 rounded-full text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95 shadow-md" style={{ background: 'linear-gradient(135deg, #FF6B9D, #FBBF24)' }}>
            <Bot className="w-4 h-4" />
            Try Sandbox
          </button>
        );
      case 'flow-app':
        return (
          <button className="flex items-center gap-1.5 px-4 h-9 ml-1 rounded-full text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95 shadow-md" style={{ background: 'linear-gradient(135deg, #22D3EE, #7C5CFC)' }}>
            <Smartphone className="w-4 h-4" />
            View Prototype
          </button>
        );
      default:
        return (
          <button className="flex items-center gap-1.5 px-4 h-9 ml-1 rounded-full bg-surface-1 hover:bg-panel-border text-sm font-semibold text-text-primary transition-colors">
            View Live
            <ExternalLink className="w-4 h-4 text-text-secondary" />
          </button>
        );
    }
  };

  if (isEditing) {
    return (
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-40">

        {/* Floating AI Prompt Box */}
        {showAIPrompt && (
          <div className="bg-white rounded-2xl shadow-2xl border border-panel-border p-4 w-[480px] mb-4 pointer-events-auto flex flex-col" style={{ backdropFilter: 'blur(12px)' }}>
            <div className="mb-3 space-y-1.5 p-3 bg-surface-1 rounded-xl">
              <div className="flex items-center gap-1.5 text-[10px] text-text-primary font-medium">
                <Sparkles className="w-3.5 h-3.5 text-black" /> Analyzing your prompt...
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                <div className="w-3 h-3 rounded-full border border-panel-border flex items-center justify-center"><div className="w-1.5 h-1.5 bg-text-secondary rounded-full" /></div> Looking for the best possible response...
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                <div className="w-3 h-3 rounded-full border border-panel-border" /> Refining the language for clarity...
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                <div className="w-3 h-3 rounded-full border border-panel-border" /> Almost ready...
              </div>
            </div>

            <textarea
              autoFocus
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe what you want to generate..."
              className="w-full min-h-[80px] text-sm text-text-primary outline-none resize-none bg-transparent placeholder:text-text-secondary"
            />

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-panel-border">
              <div className="flex items-center gap-2">
                {/* Empty left section to maintain space-between layout */}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs font-semibold text-text-primary flex items-center gap-1 cursor-pointer">
                  Alchemy 4.5 Pro <ChevronDown className="w-4 h-4" />
                </div>
                <button
                  onClick={() => setShowAIPrompt(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-panel-border text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Mode Bottom Toolbar */}
        <div className="flex items-center gap-2 bg-white rounded-full px-2 py-1.5 shadow-[0_8px_32px_rgb(0,0,0,0.12)] border border-panel-border pointer-events-auto h-14">

          {/* Tools (Left to match View mode) */}
          <ToolBtn active={activeTool === 'pointer'} onClick={() => setActiveTool('pointer')} title="Pan Tool (Space + Drag)">
            <Hand className="w-5 h-5" />
          </ToolBtn>
          <ToolBtn active={activeTool === 'comment'} onClick={() => { setActiveTool('comment'); onAddNote(); }} title="Leave a Note">
            <StickyNote className="w-5 h-5" />
          </ToolBtn>

          {/* AI Magic Button */}
          <button
            onClick={() => setShowAIPrompt(!showAIPrompt)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md ml-1 mr-1 ${showAIPrompt ? 'bg-accent-purple text-white shadow-inner scale-95' : 'bg-accent-purple text-white hover:bg-opacity-90 hover:scale-[1.05]'}`}
            title="AI Capability"
          >
            <Sparkles className="w-4 h-4 text-white" />
          </button>

          <div className="w-px h-6 bg-panel-border mx-1" />

          {/* History */}
          <ToolBtn><Undo className="w-[18px] h-[18px]" /></ToolBtn>
          <ToolBtn><Redo className="w-[18px] h-[18px]" /></ToolBtn>

          <div className="w-px h-6 bg-panel-border mx-1" />

          {/* Mode Toggle */}
          <div className="flex bg-surface-2 p-1 rounded-full ml-1">
            <button
              onClick={() => {
                onTogglePreview?.(false);
                setShowAIPrompt(false);
              }}
              className={`flex items-center gap-1.5 px-4 h-8 rounded-full text-sm font-semibold transition-all ${!isPreviewMode ? 'bg-white shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary hover:bg-surface-1'
                }`}
            >
              <BoxSelect className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={() => {
                onTogglePreview?.(true);
                setShowAIPrompt(false);
              }}
              className={`flex items-center gap-1.5 px-4 h-8 rounded-full text-sm font-semibold transition-all ${isPreviewMode ? 'bg-white shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary hover:bg-surface-1'
                }`}
            >
              <MonitorPlay className="w-4 h-4" /> Preview
            </button>
          </div>

        </div>
      </div>
    );
  }

  // View Mode Toolbar (Unchanged)
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white rounded-full p-1.5 shadow-[0_8px_32px_rgb(0,0,0,0.12)] border border-panel-border pointer-events-auto h-14 z-40">

      {/* Navigation & Interaction */}
      <ToolBtn active title="Pan Tool (Space + Drag)">
        <Hand className="w-5 h-5" />
      </ToolBtn>
      <ToolBtn onClick={onAddNote} title="Leave a Sticky Note (N)">
        <StickyNote className="w-5 h-5" />
      </ToolBtn>

      <div className="h-8 w-px bg-panel-border self-center mx-2" />

      {/* Zoom Controls */}
      <ToolBtn onClick={onZoomOut} title="Zoom Out (-)">
        <Minus className="w-4 h-4" />
      </ToolBtn>

      <button
        onClick={onResetZoom}
        className="px-3 h-10 rounded-full text-xs font-bold text-text-primary hover:bg-surface-1 transition-colors min-w-[64px]"
        title="Reset Zoom to 100%"
      >
        {Math.max(0, Math.round(scale * 100) - 40)}%
      </button>

      <ToolBtn onClick={onZoomIn} title="Zoom In (+)">
        <Plus className="w-4 h-4" />
      </ToolBtn>

      <div className="h-8 w-px bg-panel-border self-center mx-2" />

      {/* Fit to Screen */}
      <ToolBtn onClick={onFitToScreen} title="Fit to Screen (Shift + 1)">
        <Maximize className="w-4 h-4" />
      </ToolBtn>

      <div className="h-8 w-px bg-panel-border self-center mx-2" />

      {/* Contextual Action */}
      {renderContextAction()}

    </div>
  );
}

function ToolBtn({ children, active, onClick, title }: { children: React.ReactNode; active?: boolean; onClick?: () => void; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${active
        ? 'bg-surface-2 text-text-primary shadow-inner border border-panel-border'
        : 'text-text-secondary hover:bg-surface-1 hover:text-text-primary'
        }`}
    >
      {children}
    </button>
  );
}
