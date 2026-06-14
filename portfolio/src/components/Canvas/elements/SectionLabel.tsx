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
      className={`canvas-element-base flex items-center gap-2 rounded-full px-2 py-1.5 ${isSelected ? 'selected' : ''}`}
      style={{ width }}
    >
      <div className="w-2 h-2 rounded-sm shadow-sm flex-shrink-0" style={{ background: data.color }} />
      <span
        className="text-[11px] font-bold tracking-[0.14em] uppercase"
        style={{ color: data.color, opacity: 0.88 }}
      >
        {data.title}
      </span>
      <div className="flex-1 h-[2px] rounded-full" style={{ background: `linear-gradient(90deg, ${data.color}55, transparent)` }} />
    </div>
  );
}
