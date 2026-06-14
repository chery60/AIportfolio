import type { ProcessStepElement } from '../../../types';
import { CanvasCardShell } from '@/components/ui/executive';
import { hexToRgb } from '@/lib/executive';

interface Props {
  element: ProcessStepElement;
  isSelected: boolean;
  onClick: () => void;
}

export default function ProcessStep({ element, isSelected, onClick }: Props) {
  const { data, width, height } = element;
  const rgb = hexToRgb(data.color);

  return (
    <CanvasCardShell
      onClick={onClick}
      selected={isSelected}
      accentColor={data.color}
      className="p-5 flex flex-col"
      style={{
        width,
        height,
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-8 h-8 rounded-[11px] flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{
            background: `rgba(${rgb}, 0.09)`,
            color: data.color,
            border: `1px solid rgba(${rgb}, 0.22)`,
          }}
        >
          {data.stepNumber}
        </div>
        <h4 className="exec-title text-sm">{data.title}</h4>
      </div>

      <p className="exec-copy">
        {data.description}
      </p>

      <div
        className="mt-auto pt-3"
        style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}
      >
        <div
          className="h-[2px] rounded-full"
          style={{ background: `linear-gradient(90deg, ${data.color}90, transparent)`, width: '62%' }}
        />
      </div>
    </CanvasCardShell>
  );
}
