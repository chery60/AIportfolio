import type { DataDimensionElement } from '../../../types';

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
    <div
      onClick={onClick}
      className={`canvas-element-base rounded-2xl overflow-hidden bg-white border border-panel-border shadow-sm flex flex-col ${isSelected ? 'selected' : ''}`}
      style={{ width, height }}
    >
      {/* Accent top bar */}
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${data.accentColor}, ${data.accentColor}88)` }} />

      <div className="p-4 flex flex-col flex-1">
        {/* Dimension label */}
        <p className="text-[9px] font-bold tracking-widest uppercase mb-1.5" style={{ color: data.accentColor }}>
          {data.dimension}
        </p>

        {/* Title with highlight */}
        <p className="text-xs leading-snug text-text-primary font-medium flex-1 mb-3">
          {parts.map((part, i) =>
            part.toLowerCase() === data.highlight.toLowerCase()
              ? <span key={i} style={{ color: data.accentColor, fontWeight: 700 }}>{part}</span>
              : part
          )}
        </p>

        {/* Min / Max / Typical */}
        <div className="flex gap-3">
          {[{ label: 'Minimum', value: data.min }, { label: 'Maximum', value: data.max }, { label: 'Typical', value: data.typical }].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center flex-1">
              <div className="text-lg font-bold" style={{ color: data.accentColor }}>{value}</div>
              <div className="text-[9px] text-text-secondary">{label}</div>
            </div>
          ))}
        </div>

        {/* Optional note */}
        {data.note && (
          <p className="text-[9px] text-text-secondary mt-2 pt-2 border-t border-panel-border leading-snug">{data.note}</p>
        )}
      </div>
    </div>
  );
}
