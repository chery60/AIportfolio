import type { QuoteBlockElement } from '../../../types';
import { CanvasCardShell } from '@/components/ui/executive';
import { hexToRgb } from '@/lib/executive';

interface Props {
  element: QuoteBlockElement;
  isSelected: boolean;
  onClick: () => void;
}

export default function QuoteBlock({ element, isSelected, onClick }: Props) {
  const { data, width, height } = element;
  const accent = data.accentColor ?? '#5e6ad2';
  const rgb = hexToRgb(accent);

  return (
    <CanvasCardShell
      onClick={onClick}
      selected={isSelected}
      accentColor={accent}
      className="p-5 flex flex-col justify-between"
      style={{
        width,
        height,
        borderLeft: `3px solid ${accent}`,
      }}
    >
      <div className="text-5xl leading-none mb-2 opacity-[0.28]" style={{ color: accent }}>"</div>

      <p className="text-[13px] leading-relaxed flex-1 text-[var(--exec-ink-soft)]">
        {data.quote}
      </p>

      <div className="flex items-center gap-3 mt-5 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: `rgba(${rgb}, 0.10)`, color: accent }}
        >
          {data.author[0]}
        </div>
        <div>
          <p className="text-[12px] font-semibold text-[var(--exec-ink)]">{data.author}</p>
          {data.role && <p className="text-[11px] text-[var(--exec-muted)] mt-0.5">{data.role}</p>}
        </div>
      </div>
    </CanvasCardShell>
  );
}
