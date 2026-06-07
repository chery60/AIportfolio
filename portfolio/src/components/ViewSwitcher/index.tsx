import { motion } from 'framer-motion';
import { Eye, Footprints } from 'lucide-react';
import type { ViewMode } from '../../types';

interface ViewSwitcherProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
  /** When true, third-person option is disabled (e.g. canvas structural edit). */
  thirdPersonLocked?: boolean;
}

export default function ViewSwitcher({
  viewMode,
  onChange,
  thirdPersonLocked = false,
}: ViewSwitcherProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="pointer-events-auto inline-flex rounded-full border border-panel-border bg-white/95 p-1 shadow-[0_8px_32px_rgb(0,0,0,0.12)] backdrop-blur-sm"
      role="tablist"
      aria-label="Canvas view mode"
    >
      <button
        type="button"
        role="tab"
        aria-selected={viewMode === 'top'}
        title="Top board view"
        onClick={() => onChange('top')}
        className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
          viewMode === 'top'
            ? 'bg-surface-2 text-text-primary shadow-inner'
            : 'text-text-secondary hover:bg-surface-1 hover:text-text-primary'
        }`}
      >
        <Eye className="w-4 h-4" />
        Board
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={viewMode === 'third-person'}
        disabled={thirdPersonLocked}
        title={
          thirdPersonLocked
            ? 'Switch to Preview to explore in 3D'
            : 'Third-person walk-through'
        }
        onClick={() => !thirdPersonLocked && onChange('third-person')}
        className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
          viewMode === 'third-person'
            ? 'bg-surface-2 text-text-primary shadow-inner'
            : 'text-text-secondary hover:bg-surface-1 hover:text-text-primary'
        } ${thirdPersonLocked ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
      >
        <Footprints className="w-4 h-4" />
        Explore 3D
      </button>
    </motion.div>
  );
}
