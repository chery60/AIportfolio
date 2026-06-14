
import type { ImageFrameElement } from '../../../types';
import { CanvasCardShell } from '@/components/ui/executive';

interface Props {
  element: ImageFrameElement;
  isSelected: boolean;
  onClick: () => void;
}

export default function ImageFrame({ element, isSelected, onClick }: Props) {
  const { data, width, height } = element;

  return (
    <CanvasCardShell
      onClick={onClick}
      selected={isSelected}
      className="relative flex flex-col cursor-pointer"
      style={{
        width,
        height,
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--exec-line)] bg-[rgba(251,250,247,0.84)] flex-shrink-0">
        <div className="flex items-center gap-2.5 flex-1">
          <div className="flex gap-1.5 flex-shrink-0">
            <div className="h-2 w-2 rounded-full bg-[var(--exec-red)] opacity-90" />
            <div className="h-2 w-2 rounded-full bg-[var(--exec-amber)] opacity-90" />
            <div className="h-2 w-2 rounded-full bg-[var(--exec-green)] opacity-90" />
          </div>
          <span className="exec-eyebrow truncate ml-1">
            {data.label || 'Image Viewer'}
          </span>
        </div>
      </div>

      <div className="flex-1 w-full relative bg-[var(--exec-card-subtle)] overflow-hidden">
        {data.imageUrl ? (
          <img
            src={data.imageUrl}
            alt={data.label || 'Image'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--exec-muted)]">
            <span className="text-[12px] font-medium">No image selected</span>
          </div>
        )}
      </div>
    </CanvasCardShell>
  );
}
