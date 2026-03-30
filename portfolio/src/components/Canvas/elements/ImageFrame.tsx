
import type { CanvasElement } from '../../../types';

interface Props {
  element: CanvasElement;
  isSelected: boolean;
  onClick: () => void;
}

export default function ImageFrame({ element, isSelected, onClick }: Props) {
  const { data, width, height } = element as any;

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col rounded-xl overflow-hidden bg-white border border-panel-border shadow-sm cursor-pointer ${isSelected ? 'ring-2 ring-accent-purple' : ''}`}
      style={{
        width,
        height,
      }}
    >
      {/* Header Profile */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-panel-border bg-surface-1 flex-shrink-0">
        <div className="flex items-center gap-2.5 flex-1">
          {/* Traffic lights */}
          <div className="flex gap-1.5 flex-shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          </div>
          <span className="text-[11px] font-semibold text-text-secondary tracking-wide uppercase truncate ml-2">
            {data.label || 'Image Viewer'}
          </span>
        </div>
      </div>

      <div className="flex-1 w-full relative bg-surface-1 overflow-hidden">
        {data.imageUrl ? (
          <img 
            src={data.imageUrl} 
            alt={data.label || 'Image'} 
            className={`w-full h-full object-cover ${data.style === 'rounded' ? 'rounded-lg' : ''}`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-text-secondary text-sm">
            <span>No image selected</span>
          </div>
        )}
      </div>
    </div>
  );
}
