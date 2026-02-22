import type { CaseStudyCardElement } from '../../../types';

interface Props {
  element: CaseStudyCardElement;
  isSelected: boolean;
  onClick: () => void;
}

export default function CaseStudyCard({ element, isSelected, onClick }: Props) {
  const { data, width, height } = element;

  return (
    <div
      onClick={onClick}
      className={`canvas-element-base rounded-2xl overflow-hidden bg-white border border-panel-border shadow-sm ${isSelected ? 'selected' : ''}`}
      style={{
        width,
        height,
      }}
    >
      {/* Accent top bar */}
      <div
        className="h-1.5 w-full"
        style={{ background: `linear-gradient(90deg, ${data.accentColor}, ${data.accentColor}88)` }}
      />

      <div className="p-5 h-full flex flex-col">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="text-text-primary font-semibold text-lg leading-tight">{data.title}</h2>
              <p className="text-xs mt-0.5" style={{ color: data.accentColor }}>{data.subtitle}</p>
            </div>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: `rgba(${hexToRgb(data.accentColor)}, 0.15)`, color: data.accentColor }}
            >
              ✦
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {data.tags.map(tag => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-md font-medium"
                style={{
                  background: `rgba(${hexToRgb(data.accentColor)}, 0.12)`,
                  color: data.accentColor,
                  border: `1px solid rgba(${hexToRgb(data.accentColor)}, 0.2)`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs leading-relaxed text-text-secondary flex-1 mb-4">
          {data.description}
        </p>

        {/* Metrics */}
        {data.metrics && (
          <div className="flex gap-4 pt-3 border-t border-panel-border">
            {data.metrics.map(m => (
              <div key={m.label}>
                <div className="text-base font-bold" style={{ color: data.accentColor }}>{m.value}</div>
                <div className="text-xs" style={{ color: '#6B6D8A' }}>{m.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '124, 92, 252';
}
