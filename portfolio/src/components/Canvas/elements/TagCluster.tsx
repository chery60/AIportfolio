import type { TagClusterElement } from '../../../types';

interface Props {
  element: TagClusterElement;
  isSelected: boolean;
  onClick: () => void;
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '124, 92, 252';
}

export default function TagCluster({ element, isSelected, onClick }: Props) {
  const { data, width, height } = element;

  return (
    <div
      onClick={onClick}
      className={`canvas-element-base rounded-2xl p-4 bg-white border border-panel-border shadow-sm ${isSelected ? 'selected' : ''}`}
      style={{
        width,
        height,
      }}
    >
      <p className="text-xs font-semibold tracking-widest uppercase mb-3 text-text-secondary">
        {data.title}
      </p>
      <div className="flex flex-wrap gap-2">
        {data.tags.map(tag => {
          const rgb = hexToRgb(tag.color);
          return (
            <span
              key={tag.label}
              className="text-xs px-2.5 py-1 rounded-lg font-medium"
              style={{
                background: `rgba(${rgb}, 0.12)`,
                color: tag.color,
                border: `1px solid rgba(${rgb}, 0.25)`,
              }}
            >
              {tag.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
