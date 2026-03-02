import { useState } from 'react';
import type { VideoEmbedElement } from '../../../types';

interface Props {
  element: VideoEmbedElement;
  isSelected: boolean;
  onClick: () => void;
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '124, 92, 252';
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

  return (
    <div
      onClick={onClick}
      className={`canvas-element-base rounded-2xl overflow-hidden bg-[#0D0D1A] border shadow-xl flex flex-col ${isSelected ? 'selected' : ''}`}
      style={{
        width,
        height,
        borderColor: isSelected ? data.accentColor : 'rgba(255,255,255,0.08)',
      }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{
          background: `linear-gradient(90deg, rgba(${rgb},0.18), rgba(${rgb},0.06))`,
          borderBottom: `1px solid rgba(${rgb},0.15)`,
        }}
      >
        <div className="flex items-center gap-2.5">
          {/* Traffic lights */}
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          </div>
          <span className="text-[11px] font-semibold text-white/70 tracking-wide">{data.title}</span>
        </div>
        <div
          className="text-[10px] font-bold px-2 py-0.5 rounded-md"
          style={{
            background: `rgba(${rgb},0.2)`,
            color: data.accentColor,
            border: `1px solid rgba(${rgb},0.3)`,
          }}
        >
          ▶ VIDEO
        </div>
      </div>

      {/* Video area */}
      <div className="relative flex-1 bg-black overflow-hidden">
        {!playing ? (
          // Thumbnail / play button state
          <div
            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group"
            style={{
              background: `radial-gradient(ellipse at center, rgba(${rgb},0.12) 0%, #0D0D1A 70%)`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setPlaying(true);
            }}
          >
            {/* Animated ring */}
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full opacity-30 animate-ping"
                style={{ background: data.accentColor, width: 72, height: 72, margin: '-8px' }}
              />
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${data.accentColor}, rgba(${rgb},0.7))`,
                  boxShadow: `0 0 32px rgba(${rgb},0.5)`,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                  <path d="M6 4l12 6-12 6V4z" />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-white/60 text-xs font-medium tracking-wide">Click to play</p>
            {data.description && (
              <p className="mt-1.5 text-white/35 text-[11px] px-6 text-center leading-relaxed max-w-[280px]">
                {data.description}
              </p>
            )}

            {/* Decorative scan lines */}
            <div
              className="absolute inset-0 pointer-events-none opacity-5"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 3px)',
              }}
            />
          </div>
        ) : isYouTube ? (
          // YouTube iframe
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
          // Native video player
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src={data.videoUrl}
            controls
            autoPlay
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        style={{
          background: `rgba(${rgb},0.04)`,
          borderTop: `1px solid rgba(${rgb},0.08)`,
        }}
      >
        <span className="text-[10px] text-white/30 font-mono">prototype · video</span>
        {playing && (
          <button
            className="text-[10px] text-white/40 hover:text-white/70 transition-colors"
            onClick={(e) => { e.stopPropagation(); setPlaying(false); }}
          >
            ✕ close
          </button>
        )}
      </div>
    </div>
  );
}
