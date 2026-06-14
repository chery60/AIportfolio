import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, StickyNote, Minus, Plus, Maximize, Smartphone, Bot, ExternalLink, BoxSelect, MonitorPlay, Sparkles, Undo, Redo, ChevronDown, X, ArrowUp } from 'lucide-react';
import type { Project } from '../../types';
import { ToolbarButton } from '@/components/ui/executive';

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
  onSendAI?: (text: string) => Promise<void>;
  isAILoading?: boolean;
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
  onSendAI,
  isAILoading = false,
}: Props) {
  const [activeTool, setActiveTool] = useState<'pointer' | 'comment'>('pointer');
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAIChatInput, setShowAIChatInput] = useState(false);
  const [aiChatInput, setAiChatInput] = useState('');
  const aiInputRef = useRef<HTMLInputElement>(null);

  // Focus the AI input when it appears
  useEffect(() => {
    if (showAIChatInput) {
      setTimeout(() => aiInputRef.current?.focus(), 80);
    }
  }, [showAIChatInput]);

  const handleAISend = async () => {
    const text = aiChatInput.trim();
    if (!text || isAILoading || !onSendAI) return;
    setAiChatInput('');
    setShowAIChatInput(false);
    await onSendAI(text);
  };

  const handleAIKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAISend();
    }
    if (e.key === 'Escape') {
      setShowAIChatInput(false);
      setAiChatInput('');
    }
  };

  // Dynamic context action based on the selected project
  const renderContextAction = () => {
    switch (project.id) {
      case 'beacon-ai':
        return (
          <button className="flex items-center gap-1.5 px-4 h-9 ml-1 rounded-[11px] text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-sm bg-[var(--exec-blue)]">
            <Bot className="w-4 h-4" />
            Try Sandbox
          </button>
        );
      case 'flow-app':
        return (
          <button className="flex items-center gap-1.5 px-4 h-9 ml-1 rounded-[11px] text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-sm bg-[var(--exec-blue)]">
            <Smartphone className="w-4 h-4" />
            View Prototype
          </button>
        );
      case 'alchemy-design-system':
        return (
          <button 
            onClick={() => window.open('https://www.figma.com/proto/o3nHV47UkzxHDz7OMfDrn2/Kiosk?node-id=5470-288291&p=f&viewport=2438%2C-10732%2C0.21&t=gpdCCMT32mQ0KWFu-0&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=5480%3A352033&show-proto-sidebar=1', '_blank')}
            className="flex items-center gap-1.5 px-4 h-9 ml-1 rounded-[11px] bg-white/70 hover:bg-white text-sm font-semibold text-[var(--exec-ink)] border border-[var(--exec-line)] transition-colors"
          >
            View Live
            <ExternalLink className="w-4 h-4 text-text-secondary" />
          </button>
        );
      default:
        return (
          <button className="flex items-center gap-1.5 px-4 h-9 ml-1 rounded-[11px] bg-white/70 hover:bg-white text-sm font-semibold text-[var(--exec-ink)] border border-[var(--exec-line)] transition-colors">
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
          <div className="noon-panel-light rounded-[18px] p-4 w-[480px] mb-4 pointer-events-auto flex flex-col">
            <div className="mb-3 space-y-1.5 p-3 bg-white/60 rounded-xl border border-[var(--exec-line)]">
              <div className="flex items-center gap-1.5 text-[10px] text-[var(--exec-ink)] font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[var(--exec-accent)]" /> Analyzing your prompt...
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-[var(--exec-muted)]">
                <div className="w-3 h-3 rounded-full border border-panel-border flex items-center justify-center"><div className="w-1.5 h-1.5 bg-text-secondary rounded-full" /></div> Looking for the best possible response...
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-[var(--exec-muted)]">
                <div className="w-3 h-3 rounded-full border border-panel-border" /> Refining the language for clarity...
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-[var(--exec-muted)]">
                <div className="w-3 h-3 rounded-full border border-panel-border" /> Almost ready...
              </div>
            </div>

            <textarea
              autoFocus
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe what you want to generate..."
              className="w-full min-h-[80px] text-sm text-[var(--exec-ink)] outline-none resize-none bg-transparent placeholder:text-[var(--exec-muted)]"
            />

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-panel-border">
              <div className="flex items-center gap-2">
                {/* Empty left section to maintain space-between layout */}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs font-semibold text-[var(--exec-ink)] flex items-center gap-1 cursor-pointer">
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
        <div className="noon-toolbar-light flex items-center gap-2 rounded-full px-2 py-1.5 pointer-events-auto h-14">

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
            className={`w-9 h-9 rounded-[11px] flex items-center justify-center transition-all shadow-sm ml-1 mr-1 ${showAIPrompt ? 'bg-[var(--exec-accent)] text-white shadow-inner scale-95' : 'bg-[var(--exec-accent)] text-white hover:scale-[1.03]'}`}
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
          <div className="flex bg-white/50 border border-[var(--exec-line)] p-1 rounded-[13px] ml-1">
            <button
              onClick={() => {
                onTogglePreview?.(false);
                setShowAIPrompt(false);
              }}
              className={`flex items-center gap-1.5 px-4 h-8 rounded-[10px] text-sm font-semibold transition-all ${!isPreviewMode ? 'bg-white shadow-sm text-[var(--exec-ink)]' : 'text-[var(--exec-muted)] hover:text-[var(--exec-ink)] hover:bg-white/70'
                }`}
            >
              <BoxSelect className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={() => {
                onTogglePreview?.(true);
                setShowAIPrompt(false);
              }}
              className={`flex items-center gap-1.5 px-4 h-8 rounded-[10px] text-sm font-semibold transition-all ${isPreviewMode ? 'bg-white shadow-sm text-[var(--exec-ink)]' : 'text-[var(--exec-muted)] hover:text-[var(--exec-ink)] hover:bg-white/70'
                }`}
            >
              <MonitorPlay className="w-4 h-4" /> Preview
            </button>
          </div>

        </div>
      </div>
    );
  }

  // View Mode Toolbar
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-40">

      {/* ── Inline AI Chat Input ── */}
      <AnimatePresence>
        {showAIChatInput && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mb-3 pointer-events-auto w-[420px]"
          >
            <div className="noon-toolbar-light flex items-center gap-2 rounded-[16px] px-3 py-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Sparkles className="w-4 h-4 text-[var(--exec-accent)] flex-shrink-0" />
                <input
                  ref={aiInputRef}
                  value={aiChatInput}
                  onChange={(e) => setAiChatInput(e.target.value)}
                  onKeyDown={handleAIKeyDown}
                  placeholder="Ask about this project…"
                  disabled={isAILoading}
                  className="flex-1 text-sm text-[var(--exec-ink)] placeholder:text-[var(--exec-muted)] bg-transparent outline-none disabled:opacity-50"
                />
              </div>
              <button
                onClick={handleAISend}
                disabled={!aiChatInput.trim() || isAILoading}
                className="w-8 h-8 flex items-center justify-center rounded-[10px] bg-[var(--exec-accent)] text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 shadow-sm"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── View Mode Bottom Toolbar ── */}
      <div className="noon-toolbar-light flex items-center gap-1 rounded-full p-1.5 pointer-events-auto h-14">

        {/* Navigation & Interaction */}
        <ToolBtn active title="Pan Tool (Space + Drag)">
          <Hand className="w-5 h-5" />
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

        {/* AI Chat Icon */}
        {onSendAI && (
          <>
            <button
              onClick={() => setShowAIChatInput(prev => !prev)}
              title="Ask AI about this project"
            className={`w-10 h-10 rounded-[11px] flex items-center justify-center transition-all shadow-sm ml-0.5 ${
                showAIChatInput
                  ? 'bg-[var(--exec-accent)] text-white shadow-inner scale-95'
                  : 'bg-[var(--exec-accent)] text-white hover:scale-[1.03]'
              }`}
            >
              <Sparkles className="w-[18px] h-[18px]" />
            </button>
            <div className="h-8 w-px bg-panel-border self-center mx-2" />
          </>
        )}

        {/* Contextual Action */}
        {renderContextAction()}

      </div>
    </div>
  );
}

function ToolBtn({ children, active, onClick, title }: { children: React.ReactNode; active?: boolean; onClick?: () => void; title?: string }) {
  return (
    <ToolbarButton
      onClick={onClick}
      title={title}
      active={active}
      className="w-10 h-10 !rounded-full bg-black/[0.04] hover:bg-black/[0.08]"
    >
      {children}
    </ToolbarButton>
  );
}
