import type { TagClusterElement } from '../../../types';
import { CanvasCardShell } from '@/components/ui/executive';
import { hexToRgb } from '@/lib/executive';

interface Props {
  element: TagClusterElement;
  isSelected: boolean;
  onClick: () => void;
}

export default function TagCluster({ element, isSelected, onClick }: Props) {
  const { data, width, height } = element;

  return (
    <CanvasCardShell
      onClick={onClick}
      selected={isSelected}
      className="p-5"
      style={{
        width,
        height,
      }}
    >
      <p className="exec-eyebrow mb-4">
        {data.title}
      </p>
      <div className="flex flex-wrap gap-2">
        {data.tags.map(tag => {
          const rgb = hexToRgb(tag.color);
          return (
            <span
              key={tag.label}
              className="exec-chip"
              style={{
                background: `rgba(${rgb}, 0.075)`,
                color: tag.color,
                borderColor: `rgba(${rgb}, 0.22)`,
              }}
            >
              {tag.label}
            </span>
          );
        })}
      </div>
    </CanvasCardShell>
  );
}
