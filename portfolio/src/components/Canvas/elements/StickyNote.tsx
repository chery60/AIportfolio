import type { StickyNoteElement } from '../../../types';
import { CanvasCardShell } from '@/components/ui/executive';

interface Props {
  element: StickyNoteElement;
  isSelected: boolean;
  onClick: () => void;
}

const COLORS = {
  yellow: { bg: '#fff8df', border: '#a56716', text: '#4d3f20', pin: '#a56716' },
  purple: { bg: '#f2f1fb', border: '#5e6ad2', text: '#34345f', pin: '#5e6ad2' },
  pink:   { bg: '#f7eef4', border: '#b85a7b', text: '#513241', pin: '#b85a7b' },
  cyan:   { bg: '#eef8f8', border: '#2b7f8b', text: '#264d54', pin: '#2b7f8b' },
  green:  { bg: '#edf7f2', border: '#14785f', text: '#244d3f', pin: '#14785f' },
};

export default function StickyNote({ element, isSelected, onClick }: Props) {
  const { data, width, height } = element;
  const colors = COLORS[data.color];
  const rotation = data.rotation ?? 0;

  return (
    <CanvasCardShell
      onClick={onClick}
      selected={isSelected}
      accentColor={colors.border}
      className="p-4"
      style={{
        width,
        height,
        background: colors.bg,
        border: `1.5px solid ${colors.border}45`,
        transform: `rotate(${rotation}deg)`,
        boxShadow: `0 2px 8px rgba(32,36,44,0.07), 0 12px 32px rgba(32,36,44,0.10), inset 0 1px 0 rgba(255,255,255,0.82)`,
      }}
    >
      <div
        className="absolute -top-2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-white shadow-sm"
        style={{ background: colors.pin }}
      />

      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-70"
        style={{ background: `linear-gradient(90deg, ${colors.border}, transparent)` }}
      />

      <p
        className="text-[12px] leading-relaxed whitespace-pre-line font-medium"
        style={{ color: colors.text }}
      >
        {data.content}
      </p>
    </CanvasCardShell>
  );
}
