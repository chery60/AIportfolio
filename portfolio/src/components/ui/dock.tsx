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
          isActive ? 'text-[#aeb7ff]' : 'text-[#d0d6e0]'
        )}
      >
        {icon}
      </div>
      <span
        className={clsx(
          'text-[10px] font-semibold tracking-wide transition-colors duration-150',
          isActive ? 'text-[#aeb7ff]' : 'text-[#a6afbd]'
        )}
      >
        {label}
      </span>
      {isActive && (
        <motion.div
          layoutId="dock-active-dot"
          className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#aeb7ff]"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
      {badge != null && badge > 0 && (
        <span className="absolute top-1.5 right-4 min-w-[16px] h-4 rounded-full bg-[#5e6ad2] text-white text-[9px] font-bold flex items-center justify-center px-1">
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
        'bg-[#05070b]/98 backdrop-blur-xl border border-white/[0.18]',
        'rounded-full w-fit px-2',
        'shadow-[0_-8px_34px_rgba(0,0,0,0.66)]',
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
