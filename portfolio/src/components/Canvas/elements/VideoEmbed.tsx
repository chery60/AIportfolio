import { useState } from 'react';
import type { VideoEmbedElement } from '../../../types';
import { CanvasCardShell } from '@/components/ui/executive';
import { hexToRgb } from '@/lib/executive';

interface Props {
  element: VideoEmbedElement;
  isSelected: boolean;
  onClick: () => void;
}

export default function VideoEmbed({ element, isSelected, onClick }: Props) {
  const { data, width, height } = element;
  const [playing, setPlaying] = useState(false);
  const rgb = hexToRgb(data.accentColor);

  // Detect if it's a YouTube embed URL
  const isYouTube = data.videoUrl.includes('youtube.com') || data.videoUrl.includes('youtu.be');

  // Build autoplay URL for YouTube
  const autoplayUrl = isYouTube
    ? `${data.videoUrl}${data.videoUrl.includes('?') ? '&' : '?'}autoplay=1&rel=0&modestbranding=1`
    : data.videoUrl;

  const resolvedVideoUrl = isYouTube 
    ? data.videoUrl 
    : data.videoUrl.startsWith('/') 
      ? `${import.meta.env.BASE_URL}${data.videoUrl.slice(1)}` 
      : data.videoUrl;

  return (
    <CanvasCardShell
      onClick={onClick}
      selected={isSelected}
      accentColor={data.accentColor}
      className="flex flex-col"
      style={{
        width,
        height,
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{
          background: `linear-gradient(90deg, rgba(${rgb},0.08), rgba(255,255,255,0.55))`,
          borderBottom: `1px solid rgba(${rgb},0.12)`,
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <div className="h-2 w-2 rounded-full bg-[var(--exec-red)] opacity-90" />
            <div className="h-2 w-2 rounded-full bg-[var(--exec-amber)] opacity-90" />
            <div className="h-2 w-2 rounded-full bg-[var(--exec-green)] opacity-90" />
          </div>
          <span className="text-[11px] font-semibold text-[var(--exec-ink-soft)] tracking-wide">{data.title}</span>
        </div>
        <div
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{
            background: `rgba(${rgb},0.09)`,
            color: data.accentColor,
            border: `1px solid rgba(${rgb},0.18)`,
          }}
        >
          VIDEO
        </div>
      </div>

      <div className="relative flex-1 bg-[#111318] overflow-hidden">
        {!playing ? (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group"
            style={{
              background: `radial-gradient(ellipse at center, rgba(${rgb},0.12) 0%, #191b22 70%)`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setPlaying(true);
            }}
          >
            {/* Animated ring */}
            <div className="relative">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${data.accentColor}, rgba(${rgb},0.78))`,
                  boxShadow: `0 18px 38px rgba(${rgb},0.28)`,
                }}
              >
                <svg width="22" height="22" viewBox="0 0 20 20" fill="white">
                  <path d="M6 4l12 6-12 6V4z" />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-white/70 text-xs font-medium tracking-wide">Click to play</p>
            {data.description && (
              <p className="mt-1.5 text-white/45 text-[11px] px-6 text-center leading-relaxed max-w-[80%]">
                {data.description}
              </p>
            )}
          </div>
        ) : isYouTube ? (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={autoplayUrl}
            title={data.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src={resolvedVideoUrl}
            controls
            autoPlay
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>

      <div
        className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        style={{
          background: `rgba(${rgb},0.035)`,
          borderTop: `1px solid rgba(${rgb},0.09)`,
        }}
      >
        <span className="text-[11px] text-[var(--exec-muted)] font-mono">prototype / video</span>
        {playing && (
          <button
            className="text-[10px] text-[var(--exec-muted)] hover:text-[var(--exec-ink)] transition-colors"
            onClick={(e) => { e.stopPropagation(); setPlaying(false); }}
          >
            close
          </button>
        )}
      </div>
    </CanvasCardShell>
  );
}
