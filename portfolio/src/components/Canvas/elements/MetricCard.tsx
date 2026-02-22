import type { MetricCardElement } from '../../../types';

interface Props {
  element: MetricCardElement;
  isSelected: boolean;
  onClick: () => void;
}

export default function MetricCard({ element, isSelected, onClick }: Props) {
  const { data, width, height } = element;

  return (
    <div
      onClick={onClick}
      className={`canvas-element-base rounded-2xl p-5 flex flex-col justify-between bg-white border border-panel-border shadow-sm ${isSelected ? 'selected' : ''}`}
      style={{
        width,
        height,
      }}
    >
      <div>
        <p className="text-xs font-semibold mb-2 text-text-primary">
          {data.label}
        </p>
        <p className="text-4xl font-bold tracking-tight" style={{ color: data.accentColor }}>
          {data.value}
        </p>
      </div>
      {data.change && (
        <div className="flex items-center gap-1.5 mt-2">
          {data.changePositive !== undefined && (
            <span className="text-xs font-bold" style={{ color: data.changePositive ? '#059669' : '#DC2626' }}>
              {data.changePositive ? '↑' : '↓'}
            </span>
          )}
          <span className="text-xs font-medium text-text-secondary">{data.change}</span>
        </div>
      )}
    </div>
  );
}
