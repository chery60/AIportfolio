import type { StickyNoteElement } from '../../../types';

interface Props {
  element: StickyNoteElement;
  isSelected: boolean;
  onClick: () => void;
}

const COLORS = {
  yellow: { bg: '#2A2410', border: '#FBBF24', text: '#FDE68A', pin: '#FBBF24' },
  purple: { bg: '#1C1529', border: '#7C5CFC', text: '#C4B5FD', pin: '#7C5CFC' },
  pink:   { bg: '#22101A', border: '#FF6B9D', text: '#FCA5A5', pin: '#FF6B9D' },
  cyan:   { bg: '#0F2028', border: '#22D3EE', text: '#A5F3FC', pin: '#22D3EE' },
  green:  { bg: '#0D2218', border: '#34D399', text: '#6EE7B7', pin: '#34D399' },
};

export default function StickyNote({ element, isSelected, onClick }: Props) {
  const { data, width, height } = element;
  const colors = COLORS[data.color];
  const rotation = data.rotation ?? 0;

  return (
    <div
      onClick={onClick}
      className={`canvas-element-base rounded-xl p-4 ${isSelected ? 'selected' : ''}`}
      style={{
        width,
        height,
        background: colors.bg,
        border: `1px solid ${colors.border}44`,
        transform: `rotate(${rotation}deg)`,
        boxShadow: `3px 4px 0 rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)`,
      }}
    >
      {/* Pin */}
      <div
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full shadow-md"
        style={{ background: colors.pin, boxShadow: `0 0 6px ${colors.pin}66` }}
      />

      {/* Accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl opacity-60"
        style={{ background: `linear-gradient(90deg, ${colors.border}, transparent)` }}
      />

      <p
        className="text-xs leading-relaxed whitespace-pre-line font-medium"
        style={{ color: colors.text }}
      >
        {data.content}
      </p>
    </div>
  );
}
