/**
 * HUD for presentation slides. Rendered outside the R3F Canvas (via CanvasDomOverlayProvider)
 * so react-dom nodes are not reconciled as THREE objects.
 */
interface PresentationControlsProps {
  currentIndex: number;
  totalSlides: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  sectionLabel?: string;
}

export default function PresentationControls({
  currentIndex,
  totalSlides,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  sectionLabel,
}: PresentationControlsProps) {
  const counterText = totalSlides === 0 ? '0 / 0' : `Section ${currentIndex + 1} / ${totalSlides}`;
  const label = sectionLabel ? `${counterText} — ${sectionLabel}` : counterText;

  return (
    /* Bottom-right of canvas area, clear of the 280px right panel + 12px margin = ~296px */
    <div className="fixed bottom-[72px] right-[308px] z-[100] flex flex-col items-end gap-1.5 pointer-events-auto">
      {/* Slide counter */}
      <div className="rounded-full bg-white/95 border border-black/10 shadow-md px-4 py-1.5 text-[11px] font-semibold text-gray-700 tabular-nums">
        {label}
      </div>

      {/* Prev / Next */}
      <div className="flex items-center gap-1.5 rounded-full bg-white/95 border border-black/10 shadow-md px-2.5 py-1.5">
        <button
          type="button"
          className="px-3 py-1 rounded-full hover:bg-gray-100 text-[11px] font-bold text-gray-700 disabled:opacity-35 disabled:pointer-events-none transition-colors"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          aria-label="Previous slide"
        >
          ← Prev
        </button>
        <div className="w-px h-4 bg-black/15" />
        <button
          type="button"
          className="px-3 py-1 rounded-full hover:bg-gray-100 text-[11px] font-bold text-gray-700 disabled:opacity-35 disabled:pointer-events-none transition-colors"
          onClick={onNext}
          disabled={!canGoNext}
          aria-label="Next slide"
        >
          Next →
        </button>
      </div>

      {/* Hint */}
      <div className="text-[10px] font-medium text-gray-500/80 px-1">
        ← → arrow keys
      </div>
    </div>
  );
}
