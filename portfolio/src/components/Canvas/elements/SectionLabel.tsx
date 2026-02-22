import type { SectionLabelElement } from '../../../types';

interface Props {
  element: SectionLabelElement;
  isSelected: boolean;
  onClick: () => void;
}

export default function SectionLabel({ element, isSelected, onClick }: Props) {
  const { data, width } = element;

  return (
    <div
      onClick={onClick}
      className={`canvas-element-base flex items-center gap-2 ${isSelected ? 'selected' : ''}`}
      style={{ width }}
    >
      <div className="w-2 h-2 rounded-sm" style={{ background: data.color }} />
      <span
        className="text-xs font-semibold tracking-widest uppercase"
        style={{ color: data.color, opacity: 0.8 }}
      >
        {data.title}
      </span>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${data.color}44, transparent)` }} />
    </div>
  );
}
