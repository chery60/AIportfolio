import { Hand, StickyNote, Minus, Plus, Maximize, Smartphone, Bot, ExternalLink } from 'lucide-react';
import type { Project } from '../../types';

interface Props {
  project: Project;
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitToScreen: () => void;
  onAddNote: () => void;
}

export default function BottomToolbar({
  project,
  scale,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToScreen,
  onAddNote,
}: Props) {

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
        {Math.round(scale * 100)}%
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
