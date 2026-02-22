import type { ProcessStepElement } from '../../../types';

interface Props {
  element: ProcessStepElement;
  isSelected: boolean;
  onClick: () => void;
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '124, 92, 252';
}

export default function ProcessStep({ element, isSelected, onClick }: Props) {
  const { data, width, height } = element;
  const rgb = hexToRgb(data.color);

  return (
    <div
      onClick={onClick}
      className={`canvas-element-base rounded-2xl p-5 flex flex-col bg-white border border-panel-border shadow-sm ${isSelected ? 'selected' : ''}`}
      style={{
        width,
        height,
      }}
    >
      {/* Step number */}
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{
            background: `rgba(${rgb}, 0.15)`,
            color: data.color,
            border: `1px solid rgba(${rgb}, 0.3)`,
          }}
        >
          {data.stepNumber}
        </div>
        <h4 className="text-sm font-semibold text-text-primary leading-tight">{data.title}</h4>
      </div>

      <p className="text-xs leading-relaxed text-text-secondary">
        {data.description}
      </p>

      {/* Bottom accent line */}
      <div
        className="mt-auto pt-3"
        style={{ borderTop: `1px solid rgba(${rgb}, 0.12)` }}
      >
        <div
          className="h-0.5 rounded-full"
          style={{ background: `linear-gradient(90deg, ${data.color}66, transparent)`, width: '60%' }}
        />
      </div>
    </div>
  );
}
