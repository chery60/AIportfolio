import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const DOCK_HEIGHT = 96;

interface DockIconProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  badge?: number;
}

export function DockIcon({ icon, label, isActive, onClick, badge }: DockIconProps) {
  return (
    <motion.button
      onClick={onClick}
      className="flex flex-col items-center gap-1 px-6 py-2 relative"
      whileTap={{ scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <div
        className={clsx(
          'w-7 h-7 flex items-center justify-center transition-colors duration-150',
          isActive ? 'text-[#7C5CFC]' : 'text-[#8B8DB0]'
        )}
      >
        {icon}
      </div>
      <span
        className={clsx(
          'text-[10px] font-medium tracking-wide transition-colors duration-150',
          isActive ? 'text-[#7C5CFC]' : 'text-[#4A4B6A]'
        )}
      >
        {label}
      </span>
      {isActive && (
        <motion.div
          layoutId="dock-active-dot"
          className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#7C5CFC]"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
      {badge != null && badge > 0 && (
        <span className="absolute top-1.5 right-4 min-w-[16px] h-4 rounded-full bg-[#7C5CFC] text-white text-[9px] font-bold flex items-center justify-center px-1">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </motion.button>
  );
}

interface DockProps {
  children: React.ReactNode;
  className?: string;
}

export function Dock({ children, className }: DockProps) {
  return (
    <div
      className={clsx(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'bg-[#111218]/95 backdrop-blur-xl border border-[#1E1F2C]',
        'rounded-full w-fit px-2',
        'shadow-[0_-4px_24px_rgba(0,0,0,0.4)]',
        className
      )}
    >
      <div className="flex items-center justify-around">
        {children}
      </div>
    </div>
  );
}

export { DOCK_HEIGHT };
