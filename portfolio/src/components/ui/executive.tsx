import { forwardRef } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { hexToRgb } from '@/lib/executive';

interface CanvasCardShellProps extends HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  accentColor?: string;
  children: ReactNode;
}

export const CanvasCardShell = forwardRef<HTMLDivElement, CanvasCardShellProps>(function CanvasCardShell({
  selected = false,
  accentColor,
  children,
  className,
  style,
  ...props
}, ref) {
  return (
    <div
      ref={ref}
      {...props}
      className={cn(
        'canvas-element-base exec-card exec-motion',
        selected && 'selected',
        className
      )}
      style={{
        '--exec-accent': accentColor ?? 'var(--exec-accent)',
        '--exec-accent-rgb': hexToRgb(accentColor),
        ...style,
      } as CSSProperties}
    >
      {children}
    </div>
  );
});

interface PanelSectionProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  count?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

export function PanelSection({
  title,
  count,
  action,
  children,
  className,
  ...props
}: PanelSectionProps) {
  return (
    <section className={cn('exec-panel-section', className)} {...props}>
      {(title || count || action) && (
        <div className="exec-panel-section-header">
          <div className="flex min-w-0 items-center gap-2">
            {title && <SectionHeader>{title}</SectionHeader>}
            {count !== undefined && <span className="exec-count-pill">{count}</span>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

interface ToolbarButtonProps extends HTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: ReactNode;
}

export function ToolbarButton({
  active = false,
  children,
  className,
  ...props
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={cn('exec-toolbar-button', active && 'is-active', className)}
      {...props}
    >
      {children}
    </button>
  );
}

interface MetricSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
  accentColor?: string;
  meta?: ReactNode;
}

export function MetricSurface({
  label,
  value,
  accentColor,
  meta,
  className,
  style,
  ...props
}: MetricSurfaceProps) {
  return (
    <div
      className={cn('exec-metric-surface', className)}
      style={{
        '--exec-accent': accentColor ?? 'var(--exec-accent)',
        '--exec-accent-rgb': hexToRgb(accentColor),
        ...style,
      } as CSSProperties}
      {...props}
    >
      <p className="exec-eyebrow">{label}</p>
      <p className="exec-metric-value">{value}</p>
      {meta && <div className="exec-metric-meta">{meta}</div>}
    </div>
  );
}

export function SectionHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn('exec-section-header', className)}>{children}</h3>;
}
