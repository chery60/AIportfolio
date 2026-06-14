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
      className="noon-toolbar-light pointer-events-auto inline-flex rounded-full p-1"
      role="tablist"
      aria-label="Canvas view mode"
    >
      <button
        type="button"
        role="tab"
        aria-selected={viewMode === 'top'}
        title="Top board view"
        onClick={() => onChange('top')}
        className={`flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-xs font-semibold transition-colors ${
          viewMode === 'top'
            ? 'bg-[rgba(var(--exec-accent-rgb),0.10)] text-[var(--exec-accent)] shadow-inner'
            : 'text-[var(--exec-muted)] hover:bg-white hover:text-[var(--exec-ink)]'
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
        className={`flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-xs font-semibold transition-colors ${
          viewMode === 'third-person'
            ? 'bg-[rgba(var(--exec-accent-rgb),0.10)] text-[var(--exec-accent)] shadow-inner'
            : 'text-[var(--exec-muted)] hover:bg-white hover:text-[var(--exec-ink)]'
        } ${thirdPersonLocked ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
      >
        <Footprints className="w-4 h-4" />
        Explore 3D
      </button>
    </motion.div>
  );
}
