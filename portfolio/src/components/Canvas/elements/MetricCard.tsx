import type { MetricCardElement } from '../../../types';
import { CanvasCardShell, MetricSurface } from '@/components/ui/executive';

interface Props {
  element: MetricCardElement;
  isSelected: boolean;
  onClick: () => void;
}

export default function MetricCard({ element, isSelected, onClick }: Props) {
  const { data, width, height } = element;

  return (
    <CanvasCardShell
      onClick={onClick}
      selected={isSelected}
      accentColor={data.accentColor}
      className="p-0"
      style={{
        width,
        height,
      }}
    >
      <MetricSurface
        label={data.label}
        value={data.value}
        accentColor={data.accentColor}
        className="h-full"
        meta={data.change && (
        <div className="flex items-center gap-1.5">
          {data.changePositive !== undefined && (
            <span className="text-xs font-bold" style={{ color: data.changePositive ? 'var(--exec-green)' : 'var(--exec-red)' }}>
              {data.changePositive ? '↑' : '↓'}
            </span>
          )}
          <span className="text-[12px] font-medium">{data.change}</span>
        </div>
        )}
      />
    </CanvasCardShell>
  );
}
