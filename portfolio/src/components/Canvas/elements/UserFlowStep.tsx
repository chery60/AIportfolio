import type { UserFlowStepElement } from '../../../types';

interface Props {
  element: UserFlowStepElement;
  isSelected: boolean;
  onClick: () => void;
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '124, 92, 252';
}

export default function UserFlowStep({ element, isSelected, onClick }: Props) {
  const { data, width, height } = element;
  const rgb = hexToRgb(data.color);

  const shapeStyle = data.shape === 'circle' ? '50%' : data.shape === 'diamond' ? '8px' : '12px';

  return (
    <div
      onClick={onClick}
      className={`canvas-element-base flex flex-col items-center justify-center text-center ${isSelected ? 'selected' : ''}`}
      style={{
        width,
        height,
        background: `rgba(${rgb}, 0.1)`,
        border: `1.5px solid rgba(${rgb}, 0.5)`,
        borderRadius: shapeStyle,
        transform: data.shape === 'diamond' ? 'rotate(45deg)' : undefined,
        boxShadow: `0 0 20px rgba(${rgb}, 0.1), 0 4px 16px rgba(0,0,0,0.4)`,
      }}
    >
      <div style={{ transform: data.shape === 'diamond' ? 'rotate(-45deg)' : undefined }}>
        {data.stepNumber && (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1"
            style={{ background: data.color, color: '#000' }}
          >
            {data.stepNumber}
          </div>
        )}
        <p className="text-xs font-semibold leading-tight" style={{ color: data.color }}>
          {data.label}
        </p>
        {data.description && (
          <p className="text-xs mt-0.5" style={{ color: '#6B6D8A' }}>
            {data.description}
          </p>
        )}
      </div>

      {/* Arrow connector - right side indicator */}
      {data.shape !== 'circle' && (
        <div
          className="absolute -right-5 top-1/2 -translate-y-1/2 text-xs"
          style={{ color: `rgba(${rgb}, 0.5)` }}
        >
          →
        </div>
      )}
    </div>
  );
}
