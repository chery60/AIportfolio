import type { DataDimensionElement } from '../../../types';
import { CanvasCardShell } from '@/components/ui/executive';

interface Props {
  element: DataDimensionElement;
  isSelected: boolean;
  onClick: () => void;
}

export default function DataDimension({ element, isSelected, onClick }: Props) {
  const { data, width, height } = element;

  // Highlight the keyword in the title
  const parts = data.title.split(new RegExp(`(${data.highlight})`, 'i'));

  return (
    <CanvasCardShell
      onClick={onClick}
      selected={isSelected}
      accentColor={data.accentColor}
      className="flex flex-col"
      style={{ width, height }}
    >
      <div className="exec-card-accent" />

      <div className="p-5 flex flex-col flex-1">
        <p className="exec-eyebrow mb-2" style={{ color: data.accentColor }}>
          {data.dimension}
        </p>

        <p className="text-[12px] leading-snug text-[var(--exec-ink)] font-medium flex-1 mb-4">
          {parts.map((part, i) =>
            part.toLowerCase() === data.highlight.toLowerCase()
              ? <span key={i} style={{ color: data.accentColor, fontWeight: 700 }}>{part}</span>
              : part
          )}
        </p>

        <div className="flex gap-3">
          {[{ label: 'Minimum', value: data.min }, { label: 'Maximum', value: data.max }, { label: 'Typical', value: data.typical }].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center flex-1 min-w-0">
              <div className="text-lg font-bold whitespace-nowrap" style={{ color: data.accentColor }}>{value}</div>
              <div className="text-[10px] text-[var(--exec-muted)] mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {data.note && (
          <p className="text-[10px] text-[var(--exec-muted)] mt-3 pt-3 border-t border-[rgba(0,0,0,0.08)] leading-snug">{data.note}</p>
        )}
      </div>
    </CanvasCardShell>
  );
}
