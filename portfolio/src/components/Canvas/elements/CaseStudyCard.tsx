import type { CaseStudyCardElement } from '../../../types';
import { CanvasCardShell } from '@/components/ui/executive';
import { hexToRgb } from '@/lib/executive';

interface Props {
  element: CaseStudyCardElement;
  isSelected: boolean;
  onClick: () => void;
}

export default function CaseStudyCard({ element, isSelected, onClick }: Props) {
  const { data, width, height } = element;

  const rgb = hexToRgb(data.accentColor);

  return (
    <CanvasCardShell
      onClick={onClick}
      selected={isSelected}
      accentColor={data.accentColor}
      className="cursor-pointer"
      style={{
        width,
        height,
      }}
    >
      <div className="exec-card-accent" />

      <div className="exec-card-body h-[calc(100%-3px)] flex flex-col bg-white/[0.72]">
        <div className="mb-4">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="min-w-0">
              <p className="exec-eyebrow mb-2" style={{ color: data.accentColor }}>{data.subtitle}</p>
              <h2 className="exec-title text-[18px]">{data.title}</h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-2.5 mb-1">
            {data.tags.map(tag => (
              <span
                key={tag}
                className="exec-chip"
                style={{
                  background: `rgba(${rgb}, 0.075)`,
                  color: data.accentColor,
                  borderColor: `rgba(${rgb}, 0.22)`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <p className="exec-copy flex-1 mb-5">
          {data.description}
        </p>

        {data.metrics && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[rgba(0,0,0,0.08)]">
            {data.metrics.map(m => (
              <div key={m.label} className="min-w-0">
                <div className="text-[16px] font-bold leading-none" style={{ color: data.accentColor }}>{m.value}</div>
                <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--exec-faint)] truncate">{m.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CanvasCardShell>
  );
}
