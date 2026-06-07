import type { CanvasElement, CaseStudyCardElement, MetricCardElement, ProcessStepElement, QuoteBlockElement, StickyNoteElement, TagClusterElement, DataDimensionElement } from '../../types';
import type { PresentationSection } from './PresentationSections';
import CanvasElementRenderer from '../Canvas/CanvasElement';
import {
  STICKY_NOTE_PALETTE,
  STICKY_NOTE_FOOTER_TEXT,
  STICKY_NOTE_MAIN_TEXT,
  STICKY_NOTE_SHADOW,
} from '../Canvas/elements/stickyNoteTheme';

const SLIDE_W = 1920;
const SLIDE_H = 1080;
const HEADER_H = 148;
const CONTENT_H = SLIDE_H - HEADER_H;

// ── Element-specific renderers at presentation scale ─────────────────────────

function CaseStudySlide({ el }: { el: CaseStudyCardElement }) {
  const { title, subtitle, description, tags, accentColor, metrics } = el.data;
  return (
    <div style={{ padding: '60px 120px', height: CONTENT_H, display: 'flex', flexDirection: 'column', gap: 40 }}>
      {/* Title block */}
      <div>
        <div style={{ fontSize: 72, fontWeight: 800, color: '#111', lineHeight: 1.1, letterSpacing: -1 }}>
          {title}
        </div>
        <div style={{ fontSize: 28, color: accentColor, fontWeight: 500, marginTop: 16 }}>
          {subtitle}
        </div>
      </div>

      {/* Tags row */}
      {tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {tags.map((t) => (
            <span
              key={t}
              style={{
                padding: '10px 28px',
                borderRadius: 100,
                border: `2px solid ${accentColor}`,
                color: accentColor,
                fontSize: 22,
                fontWeight: 500,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      <p style={{ fontSize: 26, lineHeight: 1.7, color: '#333', maxWidth: 1440, margin: 0 }}>
        {description}
      </p>

      {/* Metrics row */}
      {metrics && metrics.length > 0 && (
        <div style={{ display: 'flex', gap: 64, marginTop: 'auto', paddingBottom: 20 }}>
          {metrics.map((m) => (
            <div key={m.label}>
              <div style={{ fontSize: 80, fontWeight: 800, color: accentColor, lineHeight: 1 }}>
                {m.value}
              </div>
              <div style={{ fontSize: 22, color: '#666', marginTop: 8 }}>
                {m.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MetricGridSlide({ elements }: { elements: MetricCardElement[] }) {
  const cols = Math.min(elements.length, 4);
  return (
    <div
      style={{
        padding: '60px 100px',
        height: CONTENT_H,
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 40,
        alignItems: 'center',
      }}
    >
      {elements.map((el) => {
        const { label, value, change, changePositive, accentColor } = el.data;
        return (
          <div
            key={el.id}
            style={{
              background: '#fff',
              borderRadius: 24,
              padding: '60px 48px',
              border: `2px solid ${accentColor}22`,
              boxShadow: `0 8px 48px ${accentColor}11`,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 96, fontWeight: 800, color: accentColor, lineHeight: 1 }}>
              {value}
            </div>
            <div style={{ fontSize: 28, color: '#555', marginTop: 20, fontWeight: 500 }}>
              {label}
            </div>
            {change && (
              <div
                style={{
                  fontSize: 22,
                  color: changePositive ? '#22C55E' : '#EF4444',
                  marginTop: 12,
                  fontWeight: 600,
                }}
              >
                {change}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProcessStepSlide({ elements }: { elements: ProcessStepElement[] }) {
  return (
    <div
      style={{
        padding: '60px 80px',
        height: CONTENT_H,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        overflowY: 'hidden',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {elements.map((el) => {
          const { stepNumber, title, description, color } = el.data;
          return (
            <div key={el.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 48 }}>
              {/* Step number circle */}
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: '50%',
                  background: color,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 40,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {stepNumber}
              </div>
              <div style={{ paddingTop: 8 }}>
                <div style={{ fontSize: 40, fontWeight: 700, color: '#111', lineHeight: 1.2 }}>
                  {title}
                </div>
                <div style={{ fontSize: 24, color: '#555', marginTop: 12, lineHeight: 1.6 }}>
                  {description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuoteSlide({ el }: { el: QuoteBlockElement }) {
  const { quote, author, role, accentColor } = el.data;
  const accent = accentColor ?? '#7C5CFC';
  return (
    <div
      style={{
        height: CONTENT_H,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 160px',
        textAlign: 'center',
        gap: 48,
      }}
    >
      <div
        style={{
          width: 80,
          height: 6,
          background: accent,
          borderRadius: 3,
        }}
      />
      <p
        style={{
          fontSize: 52,
          fontStyle: 'italic',
          color: '#111',
          lineHeight: 1.5,
          maxWidth: 1400,
          margin: 0,
        }}
      >
        "{quote}"
      </p>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, color: accent }}>
          {author}
        </div>
        {role && (
          <div style={{ fontSize: 22, color: '#666', marginTop: 8 }}>
            {role}
          </div>
        )}
      </div>
    </div>
  );
}

function StickyMosaicSlide({ elements }: { elements: StickyNoteElement[] }) {
  const cols = Math.min(Math.ceil(Math.sqrt(elements.length)), 4);
  return (
    <div
      style={{
        padding: '40px 60px',
        height: CONTENT_H,
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 32,
        alignContent: 'start',
      }}
    >
      {elements.map((el, i) => {
        const bg = STICKY_NOTE_PALETTE[el.data.color];
        const footer = el.data.footer?.trim();
        return (
          <div
            key={el.id}
            style={{
              background: bg,
              borderRadius: 6,
              padding: '36px 40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 220,
              boxShadow: STICKY_NOTE_SHADOW,
              transform: `rotate(${(i % 3 - 1) * 1.5}deg)`,
            }}
          >
            <div
              style={{
                fontSize: 28,
                lineHeight: 1.6,
                color: STICKY_NOTE_MAIN_TEXT,
                whiteSpace: 'pre-line',
                fontWeight: 500,
              }}
            >
              {el.data.content}
            </div>
            {footer ? (
              <div style={{ fontSize: 22, color: STICKY_NOTE_FOOTER_TEXT, marginTop: 24, fontWeight: 400 }}>
                {footer}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function TagClusterSlide({ el }: { el: TagClusterElement }) {
  return (
    <div
      style={{
        height: CONTENT_H,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 120px',
        gap: 48,
      }}
    >
      <div style={{ fontSize: 48, fontWeight: 700, color: '#111', textAlign: 'center' }}>
        {el.data.title}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center' }}>
        {el.data.tags.map((t) => (
          <span
            key={t.label}
            style={{
              padding: '18px 48px',
              borderRadius: 100,
              background: t.color + '22',
              border: `2px solid ${t.color}`,
              color: t.color,
              fontSize: 28,
              fontWeight: 600,
            }}
          >
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function DataDimensionSlide({ el }: { el: DataDimensionElement }) {
  const { dimension, title, highlight, min, max, typical, note, accentColor } = el.data;
  return (
    <div
      style={{
        height: CONTENT_H,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 120px',
        gap: 48,
      }}
    >
      <div>
        <div style={{ fontSize: 22, color: '#999', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>
          {dimension}
        </div>
        <div style={{ fontSize: 64, fontWeight: 800, color: '#111', marginTop: 12 }}>
          {title}
        </div>
        <div style={{ fontSize: 36, color: accentColor, fontWeight: 600, marginTop: 8 }}>
          {highlight}
        </div>
      </div>
      {/* Range bar */}
      <div style={{ position: 'relative' }}>
        <div style={{ height: 24, borderRadius: 12, background: '#E5E7EB', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: '50%',
              background: `linear-gradient(90deg, ${accentColor}44, ${accentColor})`,
              borderRadius: 12,
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 22, color: '#666' }}>
          <span>{min}</span>
          <span style={{ color: accentColor, fontWeight: 700 }}>Typical: {typical}</span>
          <span>{max}</span>
        </div>
      </div>
      {note && (
        <p style={{ fontSize: 24, color: '#555', lineHeight: 1.6, margin: 0 }}>{note}</p>
      )}
    </div>
  );
}

/** Generic fallback: scale up the raw canvas element to fill available space */
function FallbackSlide({ elements, bounds }: { elements: CanvasElement[]; bounds: { x: number; y: number; width: number; height: number } }) {
  const fitScale = Math.min(1680 / Math.max(bounds.width, 1), (CONTENT_H - 80) / Math.max(bounds.height, 1), 6.0);
  const scaledW = bounds.width * fitScale;
  const scaledH = bounds.height * fitScale;
  const left = (SLIDE_W - scaledW) / 2;
  const top = (CONTENT_H - scaledH) / 2;

  return (
    <div style={{ position: 'relative', height: CONTENT_H, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          width: bounds.width,
          height: bounds.height,
          transformOrigin: 'top left',
          transform: `scale(${fitScale})`,
          left,
          top,
        }}
      >
        {elements.map((el) => {
          const normalized: CanvasElement = {
            ...el,
            x: el.x - bounds.x,
            y: el.y - bounds.y,
          };
          return (
            <CanvasElementRenderer
              key={el.id}
              element={normalized}
              isSelected={false}
              onSelect={() => {}}
              localColor="#7C5CFC"
              isEditing={false}
              canvasScale={fitScale}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  section: PresentationSection;
  slideIndex: number;
  totalSlides: number;
}

export default function PresentationSlideLayout({ section, slideIndex, totalSlides }: Props) {
  const { label, color, elements, bounds } = section;
  const accent = color || '#7C5CFC';

  // Non-label elements for content zone
  const contentEls = elements.filter((e) => e.type !== 'section-label');

  // Determine which specialized layout to use
  const allMetrics = contentEls.filter((e): e is MetricCardElement => e.type === 'metric-card');
  const allProcess = contentEls.filter((e): e is ProcessStepElement => e.type === 'process-step');
  const allSticky = contentEls.filter((e): e is StickyNoteElement => e.type === 'sticky-note');
  const firstCard = contentEls.find((e): e is CaseStudyCardElement => e.type === 'case-study-card');
  const firstQuote = contentEls.find((e): e is QuoteBlockElement => e.type === 'quote-block');
  const firstTag = contentEls.find((e): e is TagClusterElement => e.type === 'tag-cluster');
  const firstData = contentEls.find((e): e is DataDimensionElement => e.type === 'data-dimension');

  let contentZone: React.ReactNode;

  if (firstCard) {
    contentZone = <CaseStudySlide el={firstCard} />;
  } else if (allMetrics.length > 0) {
    contentZone = <MetricGridSlide elements={allMetrics} />;
  } else if (allProcess.length > 0) {
    contentZone = <ProcessStepSlide elements={allProcess} />;
  } else if (firstQuote) {
    contentZone = <QuoteSlide el={firstQuote} />;
  } else if (allSticky.length > 0) {
    contentZone = <StickyMosaicSlide elements={allSticky} />;
  } else if (firstTag) {
    contentZone = <TagClusterSlide el={firstTag} />;
  } else if (firstData) {
    contentZone = <DataDimensionSlide el={firstData} />;
  } else {
    contentZone = <FallbackSlide elements={contentEls.length > 0 ? contentEls : elements} bounds={bounds} />;
  }

  return (
    <div
      style={{
        width: SLIDE_W,
        height: SLIDE_H,
        background: `radial-gradient(ellipse at top left, ${accent}0F 0%, transparent 55%), #FAFAF8`,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Header zone */}
      <div
        style={{
          height: HEADER_H,
          padding: '0 80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 0,
          borderBottom: `4px solid ${accent}33`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: accent,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: accent,
            }}
          >
            {label}
          </span>
        </div>
      </div>

      {/* Content zone */}
      <div style={{ height: CONTENT_H, overflow: 'hidden' }}>
        {contentZone}
      </div>

      {/* Slide counter — bottom right */}
      <div
        style={{
          position: 'absolute',
          bottom: 28,
          right: 60,
          fontSize: 20,
          color: '#AAA',
          fontWeight: 500,
          letterSpacing: 1,
        }}
      >
        {slideIndex + 1} / {totalSlides}
      </div>
    </div>
  );
}
