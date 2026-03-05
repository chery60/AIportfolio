import { useState, useEffect, useRef } from 'react';
import type { FigmaEmbedElement } from '../../../types';

interface Props {
  element: FigmaEmbedElement;
  isSelected: boolean;
  onClick: () => void;
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '124, 92, 252';
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
    <div
      ref={containerRef}
      onClick={onClick}
      className={`canvas-element-base rounded-2xl overflow-hidden flex flex-col shadow-xl ${isSelected ? 'selected' : ''}`}
      style={{
        width,
        height,
        background: '#1E1E2E',
        border: `1px solid ${isSelected ? data.accentColor : 'rgba(255,255,255,0.07)'}`,
        // Ensure this element always creates its own stacking context so that
        // when the browser exits iframe fullscreen, it doesn't swallow parent UI layers.
        isolation: 'isolate',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* Title bar — mimics Figma's chrome */}
      <div
        className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{
          background: '#2C2C3E',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Figma logo mark */}
          <svg width="16" height="22" viewBox="0 0 38 57" fill="none">
            <path d="M19 28.5A9.5 9.5 0 1 1 28.5 19H19v9.5z" fill="#1ABCFE" />
            <path d="M9.5 47.5A9.5 9.5 0 0 1 19 38v9.5H9.5z" fill="#0ACF83" />
            <path d="M19 0H9.5A9.5 9.5 0 0 0 9.5 19H19V0z" fill="#FF7262" />
            <path d="M19 0h9.5a9.5 9.5 0 0 1 0 19H19V0z" fill="#F24E1E" />
            <path d="M28.5 28.5a9.5 9.5 0 1 1-9.5-9.5 9.5 9.5 0 0 1 9.5 9.5z" fill="#A259FF" />
          </svg>
          <div>
            <p className="text-[12px] font-semibold text-white leading-none">{data.title}</p>
            {data.description && (
              <p className="text-[10px] text-white/40 mt-0.5 leading-none">{data.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="text-[10px] font-bold px-2.5 py-1 rounded-lg cursor-pointer hover:opacity-90 transition-opacity select-none"
            style={{
              background: `linear-gradient(135deg, ${data.accentColor}, rgba(${rgb},0.7))`,
              color: 'white',
              boxShadow: `0 2px 12px rgba(${rgb},0.4)`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              // Extract the original Figma URL from the embed URL and open in new tab
              const match = data.figmaUrl.match(/url=([^&]+)/);
              const originalUrl = match ? decodeURIComponent(match[1]) : data.figmaUrl;
              window.open(originalUrl, '_blank', 'noopener,noreferrer');
            }}
          >
            Open in Figma ↗
          </div>
        </div>
      </div>

      {/* Embed area */}
      <div className="relative flex-1 overflow-hidden">
        {!opened ? (
          // Preview state — click to load embed
          <div
            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group"
            style={{
              background: `radial-gradient(ellipse at 40% 40%, rgba(${rgb},0.10) 0%, #1E1E2E 65%)`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setOpened(true);
            }}
          >
            {/* Fake Figma canvas grid */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Floating preview cards */}
            <div className="relative mb-6">
              <div className="flex gap-3 mb-3">
                {['#FF7262', '#A259FF', '#1ABCFE', '#0ACF83'].map((c, i) => (
                  <div
                    key={i}
                    className="rounded-lg shadow-lg"
                    style={{
                      width: 48, height: 32,
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

            {/* Click to open */}
            <div
              className="relative flex items-center gap-3 px-5 py-3 rounded-xl transition-all group-hover:scale-105"
              style={{
                background: `rgba(${rgb},0.15)`,
                border: `1px solid rgba(${rgb},0.3)`,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 38 57" fill="none">
                <path d="M19 28.5A9.5 9.5 0 1 1 28.5 19H19v9.5z" fill="#1ABCFE" />
                <path d="M9.5 47.5A9.5 9.5 0 0 1 19 38v9.5H9.5z" fill="#0ACF83" />
                <path d="M19 0H9.5A9.5 9.5 0 0 0 9.5 19H19V0z" fill="#FF7262" />
                <path d="M19 0h9.5a9.5 9.5 0 0 1 0 19H19V0z" fill="#F24E1E" />
                <path d="M28.5 28.5a9.5 9.5 0 1 1-9.5-9.5 9.5 9.5 0 0 1 9.5 9.5z" fill="#A259FF" />
              </svg>
              <span className="text-white/80 text-sm font-semibold">Click to open Figma embed</span>
            </div>
            <p className="mt-3 text-white/30 text-[11px]">Interactive prototype · live Figma file</p>
          </div>
        ) : (
          // Live Figma embed
          <>
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#1E1E2E] z-10">
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: `${data.accentColor} transparent transparent transparent` }}
                  />
                  <p className="text-white/40 text-xs">Loading Figma file…</p>
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

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        style={{
          background: '#2C2C3E',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#0ACF83]" />
          <span className="text-[10px] text-white/30 font-mono">figma · live file</span>
        </div>
        {opened && (
          <button
            className="text-[10px] text-white/30 hover:text-white/60 transition-colors"
            onClick={(e) => { e.stopPropagation(); setOpened(false); setLoaded(false); }}
          >
            ✕ collapse
          </button>
        )}
      </div>
    </div>
  );
}
