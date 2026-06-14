import { useState, useEffect, useRef } from 'react';
import type { FigmaEmbedElement } from '../../../types';
import { CanvasCardShell } from '@/components/ui/executive';
import { hexToRgb } from '@/lib/executive';

interface Props {
  element: FigmaEmbedElement;
  isSelected: boolean;
  onClick: () => void;
}

export default function FigmaEmbed({ element, isSelected, onClick }: Props) {
  const { data, width, height } = element;
  const [loaded, setLoaded] = useState(false);
  const [opened, setOpened] = useState(false);
  const [, forceUpdate] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const rgb = hexToRgb(data.accentColor);

  // When the browser exits fullscreen (user pressed Escape or clicked exit),
  // force this component to re-render so it reclaims its correct dimensions
  // and doesn't leave the parent app panels invisible.
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        forceUpdate(n => n + 1);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <CanvasCardShell
      ref={containerRef}
      onClick={onClick}
      selected={isSelected}
      accentColor={data.accentColor}
      className="flex flex-col"
      style={{
        width,
        height,
        isolation: 'isolate',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{
          background: `linear-gradient(90deg, rgba(${rgb},0.06), rgba(255,255,255,0.58))`,
          borderBottom: '1px solid var(--exec-line)',
        }}
      >
        <div className="flex items-center gap-3">
          <svg width="16" height="22" viewBox="0 0 38 57" fill="none">
            <path d="M19 28.5A9.5 9.5 0 1 1 28.5 19H19v9.5z" fill="#1ABCFE" />
            <path d="M9.5 47.5A9.5 9.5 0 0 1 19 38v9.5H9.5z" fill="#0ACF83" />
            <path d="M19 0H9.5A9.5 9.5 0 0 0 9.5 19H19V0z" fill="#FF7262" />
            <path d="M19 0h9.5a9.5 9.5 0 0 1 0 19H19V0z" fill="#F24E1E" />
            <path d="M28.5 28.5a9.5 9.5 0 1 1-9.5-9.5 9.5 9.5 0 0 1 9.5 9.5z" fill="#A259FF" />
          </svg>
          <div>
            <p className="text-[12px] font-semibold text-[var(--exec-ink)] leading-none">{data.title}</p>
            {data.description && (
              <p className="text-[10px] text-[var(--exec-muted)] mt-0.5 leading-none">{data.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer hover:opacity-90 transition-opacity select-none"
            style={{
              background: `rgba(${rgb},0.10)`,
              color: data.accentColor,
              border: `1px solid rgba(${rgb},0.22)`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              // Extract the original Figma URL from the embed URL and open in new tab
              const match = data.figmaUrl.match(/url=([^&]+)/);
              const originalUrl = match ? decodeURIComponent(match[1]) : data.figmaUrl;
              window.open(originalUrl, '_blank', 'noopener,noreferrer');
            }}
          >
            Open in Figma
          </div>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {!opened ? (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group"
            style={{
              background: `radial-gradient(ellipse at 40% 40%, rgba(${rgb},0.08) 0%, #f7f5f0 68%)`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setOpened(true);
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.13]"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(32,36,44,0.55) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            <div className="relative mb-6">
              <div className="flex gap-3 mb-3">
                {['#FF7262', '#A259FF', '#1ABCFE', '#0ACF83'].map((c, i) => (
                  <div
                    key={i}
                    className="rounded-lg shadow-lg"
                    style={{
                      width: 56, height: 36,
                      background: c,
                      opacity: 0.85,
                      transform: `rotate(${[-2, 1, -1.5, 2][i]}deg) translateY(${[0, -4, 2, -2][i]}px)`,
                    }}
                  />
                ))}
              </div>
              <div className="flex gap-2 justify-center">
                {[60, 40, 80, 50].map((w, i) => (
                  <div
                    key={i}
                    className="rounded-md"
                    style={{
                      width: w, height: 20,
                      background: `rgba(${rgb},${[0.4, 0.25, 0.35, 0.2][i]})`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div
              className="relative flex items-center gap-3 px-5 py-3 rounded-xl transition-all group-hover:scale-[1.02]"
              style={{
                background: `rgba(255,255,255,0.78)`,
                border: `1px solid rgba(${rgb},0.22)`,
                boxShadow: '0 12px 26px rgba(32,36,44,0.08)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 38 57" fill="none">
                <path d="M19 28.5A9.5 9.5 0 1 1 28.5 19H19v9.5z" fill="#1ABCFE" />
                <path d="M9.5 47.5A9.5 9.5 0 0 1 19 38v9.5H9.5z" fill="#0ACF83" />
                <path d="M19 0H9.5A9.5 9.5 0 0 0 9.5 19H19V0z" fill="#FF7262" />
                <path d="M19 0h9.5a9.5 9.5 0 0 1 0 19H19V0z" fill="#F24E1E" />
                <path d="M28.5 28.5a9.5 9.5 0 1 1-9.5-9.5 9.5 9.5 0 0 1 9.5 9.5z" fill="#A259FF" />
              </svg>
              <span className="text-[var(--exec-ink)] text-sm font-semibold">Click to open Figma embed</span>
            </div>
            <p className="mt-3 text-[var(--exec-muted)] text-[11px]">Interactive prototype / live Figma file</p>
          </div>
        ) : (
          <>
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--exec-card-subtle)] z-10">
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: `${data.accentColor} transparent transparent transparent` }}
                  />
                  <p className="text-[var(--exec-muted)] text-xs">Loading Figma file...</p>
                </div>
              </div>
            )}
            <iframe
              className="absolute inset-0 w-full h-full border-0"
              src={data.figmaUrl}
              title={data.title}
              onLoad={() => setLoaded(true)}
            />
          </>
        )}
      </div>

      <div
        className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        style={{
          background: 'rgba(255,255,255,0.58)',
          borderTop: '1px solid var(--exec-line)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#0ACF83]" />
          <span className="text-[11px] text-[var(--exec-muted)] font-mono">figma / live file</span>
        </div>
        {opened && (
          <button
            className="text-[10px] text-[var(--exec-muted)] hover:text-[var(--exec-ink)] transition-colors"
            onClick={(e) => { e.stopPropagation(); setOpened(false); setLoaded(false); }}
          >
            collapse
          </button>
        )}
      </div>
    </CanvasCardShell>
  );
}
