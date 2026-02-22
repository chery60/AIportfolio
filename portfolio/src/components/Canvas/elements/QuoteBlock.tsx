import type { QuoteBlockElement } from '../../../types';

interface Props {
  element: QuoteBlockElement;
  isSelected: boolean;
  onClick: () => void;
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '124, 92, 252';
}

export default function QuoteBlock({ element, isSelected, onClick }: Props) {
  const { data, width, height } = element;
  const accent = data.accentColor ?? '#7C5CFC';
  const rgb = hexToRgb(accent);

  return (
    <div
      onClick={onClick}
      className={`canvas-element-base rounded-2xl p-5 flex flex-col justify-between bg-white border border-panel-border shadow-sm ${isSelected ? 'selected' : ''}`}
      style={{
        width,
        height,
        borderLeft: `4px solid ${accent}`,
      }}
    >
      {/* Big quote mark */}
      <div className="text-5xl leading-none font-serif mb-2 opacity-30" style={{ color: accent }}>"</div>

      <p className="text-sm leading-relaxed italic flex-1 text-text-secondary">
        {data.quote}
      </p>

      <div className="flex items-center gap-3 mt-4 pt-3" style={{ borderTop: `1px solid rgba(${rgb}, 0.12)` }}>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: `rgba(${rgb}, 0.2)`, color: accent }}
        >
          {data.author[0]}
        </div>
        <div>
          <p className="text-xs font-semibold text-text-primary">{data.author}</p>
          {data.role && <p className="text-xs text-text-secondary">{data.role}</p>}
        </div>
      </div>
    </div>
  );
}
