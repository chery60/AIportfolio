import { useState, useRef, useEffect } from 'react';
import { Trash2, Pencil, Check, X, Sparkles } from 'lucide-react';
import type { CanvasElement } from '../../types';

type EditableElementData = CanvasElement['data'] & {
  aiDescription?: string;
  accentColor?: string;
  color?: string;
} & Record<string, unknown>;

const ACCENT_COLORS = [
  '#C74B18', '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
  '#6366F1', '#5e6ad2', '#7170ff', '#828fff', '#22D3EE',
  '#1E3A8A', '#0EA5E9',
];

const STICKY_COLORS: Array<{ value: string; label: string; bg: string }> = [
  { value: 'yellow', label: 'Yellow', bg: '#FBBF24' },
  { value: 'purple', label: 'Purple', bg: '#5e6ad2' },
  { value: 'pink',   label: 'Pink',   bg: '#828fff' },
  { value: 'cyan',   label: 'Cyan',   bg: '#22D3EE' },
  { value: 'green',  label: 'Green',  bg: '#34D399' },
];

interface Props {
  element: CanvasElement;
  canvasScale: number;
  onUpdate: (updated: CanvasElement) => void;
  onDelete: (id: string) => void;
}

/** Get the primary text field name & value for an element type */
function getPrimaryTextField(element: CanvasElement): { key: string; value: string } | null {
  const data = element.data as EditableElementData;
  const textValue = (key: string) => {
    const value = data[key];
    return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  };

  switch (element.type) {
    case 'text-block':      return { key: 'content', value: textValue('content') };
    case 'sticky-note':     return { key: 'content', value: textValue('content') };
    case 'section-label':   return { key: 'title', value: textValue('title') };
    case 'quote-block':     return { key: 'quote', value: textValue('quote') };
    case 'metric-card':     return { key: 'value', value: textValue('value') };
    case 'process-step':    return { key: 'title', value: textValue('title') };
    case 'case-study-card': return { key: 'title', value: textValue('title') };
    case 'user-flow-step':  return { key: 'label', value: textValue('label') };
    case 'data-dimension':  return { key: 'title', value: textValue('title') };
    case 'video-embed':     return { key: 'title', value: textValue('title') };
    case 'figma-embed':     return { key: 'title', value: textValue('title') };
    case 'tag-cluster':     return { key: 'title', value: textValue('title') };
    default:                return null;
  }
}

/** Get current accent/color value for color swatch highlighting */
function getElementColor(element: CanvasElement): string | null {
  const data = element.data as EditableElementData;
  const color = element.type === 'sticky-note' ? data.color : data.accentColor ?? data.color;
  return typeof color === 'string' ? color : null;
}

export default function InlineEditToolbar({ element, canvasScale, onUpdate, onDelete }: Props) {
  const [isEditingText, setIsEditingText] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [showColors, setShowColors] = useState(false);
  const [isEditingAi, setIsEditingAi] = useState(false);
  const [aiValue, setAiValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const aiInputRef = useRef<HTMLTextAreaElement>(null);

  const textField = getPrimaryTextField(element);
  const currentColor = getElementColor(element);
  const isStickyNote = element.type === 'sticky-note';

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditingText && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingText]);

  // Focus input when entering AI edit mode
  useEffect(() => {
    if (isEditingAi && aiInputRef.current) {
      aiInputRef.current.focus();
      // Put cursor at the end
      const len = aiInputRef.current.value.length;
      aiInputRef.current.setSelectionRange(len, len);
    }
  }, [isEditingAi]);

  const handleStartEdit = () => {
    if (!textField) return;
    setEditValue(textField.value);
    setIsEditingText(true);
    setShowColors(false);
    setIsEditingAi(false);
  };

  const handleConfirmEdit = () => {
    if (!textField) return;
    const updated = {
      ...element,
      data: { ...element.data, [textField.key]: editValue },
    } as CanvasElement;
    onUpdate(updated);
    setIsEditingText(false);
  };

  const handleCancelEdit = () => {
    setIsEditingText(false);
  };

  const handleStartEditAi = () => {
    const data = element.data as EditableElementData;
    setAiValue(data.aiDescription ?? '');
    setIsEditingAi(true);
    setIsEditingText(false);
    setShowColors(false);
  };

  const handleConfirmEditAi = () => {
    const updated = {
      ...element,
      data: { ...element.data, aiDescription: aiValue },
    } as unknown as CanvasElement;
    onUpdate(updated);
    setIsEditingAi(false);
  };

  const handleCancelEditAi = () => {
    setIsEditingAi(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleConfirmEdit();
    }
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleAiKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleConfirmEditAi();
    }
    if (e.key === 'Escape') {
      handleCancelEditAi();
    }
  };

  const handleColorChange = (color: string) => {
    let updated: CanvasElement;
    if (isStickyNote) {
      updated = { ...element, data: { ...element.data, color } } as CanvasElement;
    } else {
      const data = element.data as EditableElementData;
      if ('accentColor' in data) {
        updated = { ...element, data: { ...data, accentColor: color } } as CanvasElement;
      } else if ('color' in data) {
        updated = { ...element, data: { ...data, color } } as CanvasElement;
      } else {
        return;
      }
    }
    onUpdate(updated);
    setShowColors(false);
  };

  // Scale inversely so toolbar stays same size on screen
  const invScale = 1 / canvasScale;

  return (
    <div
      className="absolute z-50 pointer-events-auto"
      style={{
        bottom: '100%',
        left: '50%',
        transform: `translateX(-50%) scale(${invScale})`,
        transformOrigin: 'bottom center',
        marginBottom: 8 * invScale,
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Text edit popover */}
      {isEditingText && textField && (
        <div className="noon-panel-light mb-2 rounded-[14px] p-3 w-[280px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[var(--exec-muted)] uppercase tracking-wider">
              Edit {textField.key.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <div className="flex gap-1">
              <button
                onClick={handleCancelEdit}
                className="w-6 h-6 rounded-[8px] flex items-center justify-center text-[var(--exec-muted)] hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleConfirmEdit}
                className="w-6 h-6 rounded-[8px] flex items-center justify-center text-white bg-[var(--exec-accent)] transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <textarea
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="exec-input px-3 py-2 text-xs resize-none"
            rows={3}
            placeholder={`Enter ${textField.key}...`}
          />
          <p className="text-[9px] text-[var(--exec-muted)] mt-1.5">Command + Enter to save / Esc to cancel</p>
        </div>
      )}

      {/* AI Context Edit popover */}
      {isEditingAi && (
        <div className="noon-panel-light mb-2 rounded-[14px] p-3 w-[280px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[var(--exec-muted)] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[var(--exec-accent)]" /> AI Description
            </span>
            <div className="flex gap-1">
              <button
                onClick={handleCancelEditAi}
                className="w-6 h-6 rounded-[8px] flex items-center justify-center text-[var(--exec-muted)] hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleConfirmEditAi}
                className="w-6 h-6 rounded-[8px] flex items-center justify-center text-white bg-[var(--exec-accent)] transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <textarea
            ref={aiInputRef}
            value={aiValue}
            onChange={(e) => setAiValue(e.target.value)}
            onKeyDown={handleAiKeyDown}
            className="exec-input px-3 py-2 text-xs resize-none"
            rows={4}
            placeholder="Why was this component placed? The guide avatar will narrate this..."
          />
          <p className="text-[9px] text-[var(--exec-muted)] mt-1.5">Command + Enter to save / Esc to cancel</p>
        </div>
      )}

      {/* Color picker popover */}
      {showColors && (
        <div className="noon-panel-light mb-2 rounded-[14px] p-3">
          <span className="text-[10px] font-bold text-[var(--exec-muted)] uppercase tracking-wider mb-2 block">
            {isStickyNote ? 'Note Color' : 'Accent Color'}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {isStickyNote
              ? STICKY_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => handleColorChange(c.value)}
                    className={`w-7 h-7 rounded-[9px] border-2 transition-transform hover:scale-105 ${
                      currentColor === c.value ? 'border-text-primary scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.bg }}
                    title={c.label}
                  />
                ))
              : ACCENT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleColorChange(c)}
                    className={`w-7 h-7 rounded-[9px] border-2 transition-transform hover:scale-105 ${
                      currentColor === c ? 'border-text-primary scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
          </div>
        </div>
      )}

      {/* Main toolbar bar */}
      <div className="noon-toolbar-light flex items-center gap-1 rounded-[14px] px-1.5 py-1">
        {/* Edit text button */}
        {textField && (
          <button
            onClick={handleStartEdit}
            className={`w-7 h-7 rounded-[9px] flex items-center justify-center transition-all ${
              isEditingText
                ? 'bg-[var(--exec-accent)] text-white'
                : 'text-[var(--exec-muted)] hover:text-[var(--exec-ink)] hover:bg-white/60'
            }`}
            title="Edit text"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Color button */}
        {currentColor != null && (
          <button
            onClick={() => { setShowColors(!showColors); setIsEditingText(false); setIsEditingAi(false); }}
            className={`w-7 h-7 rounded-[9px] flex items-center justify-center border-2 transition-all hover:scale-105 ${
              showColors ? 'border-[var(--exec-ink)]' : 'border-[var(--exec-line)]'
            }`}
            style={{
              backgroundColor: isStickyNote
                ? STICKY_COLORS.find(c => c.value === currentColor)?.bg ?? '#F59E0B'
                : currentColor,
            }}
            title="Change color"
          />
        )}

        {/* AI Description Button */}
        <button
          onClick={handleStartEditAi}
          className={`w-7 h-7 rounded-[9px] flex items-center justify-center transition-all ${
            isEditingAi
              ? 'bg-[var(--exec-accent)] text-white shadow-inner'
              : 'text-[var(--exec-muted)] hover:text-[var(--exec-ink)] hover:bg-white/60 hover:text-[var(--exec-accent)]'
          }`}
          title="Add AI description context for Guide"
        >
          <Sparkles className="w-3.5 h-3.5" />
        </button>

        {/* Divider */}
        <div className="w-px h-4 bg-[var(--exec-line)] mx-0.5" />

        {/* Delete button */}
        <button
          onClick={() => onDelete(element.id)}
          className="w-7 h-7 rounded-[9px] flex items-center justify-center text-[var(--exec-muted)] hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Delete element"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
