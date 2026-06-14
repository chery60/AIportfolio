import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, List, Heart, MessageSquare, Send, ExternalLink } from 'lucide-react';
import type {
    Project,
    CanvasElement,
    StickyNoteElement,
    MetricCardElement,
    ProcessStepElement,
    QuoteBlockElement,
    UserFlowStepElement,
    TagClusterElement,
    VideoEmbedElement,
    FigmaEmbedElement,
    DataDimensionElement,
} from '../types';
import type { ActiveViewer } from '../hooks/useRealtimeSession';
import { useReactions } from '../hooks/useReactions';
import MobileProjectSwitcher from './MobileProjectSwitcher';
import MobileEngagementSheet from './MobileEngagementSheet';
import MobileCaseStudyCard from './MobileCaseStudyCard';
import { hexToRgb } from '@/lib/executive';

import Storyboard from './Canvas/elements/Storyboard';
import FlowDiagram from './Canvas/elements/FlowDiagram';
import MobileGameZone from './Game/MobileGameZone';

interface Props {
    project: Project;
    onSelectProject: (project: Project) => void;
    onBack: () => void;
    activeViewers: ActiveViewer[];
}

// ── Section grouping ─────────────────────────────────────────────────
interface Section {
    label: CanvasElement | null;
    elements: CanvasElement[];
}

function groupIntoSections(elements: CanvasElement[]): Section[] {
    const filtered = elements.filter(el => el.type !== 'connector' && el.type !== 'comment-board');

    const labels = filtered
        .filter(el => el.type === 'section-label')
        .sort((a, b) => a.y !== b.y ? a.y - b.y : a.x - b.x);

    const sectionMap = new Map<string, Section>();
    const unassigned: CanvasElement[] = [];

    for (const label of labels) {
        sectionMap.set(label.id, { label, elements: [] });
    }

    const nonLabels = filtered.filter(el => el.type !== 'section-label');

    for (const el of nonLabels) {
        const validLabels = labels.filter(l => l.y <= el.y);

        if (validLabels.length === 0) {
            unassigned.push(el);
            continue;
        }

        const maxY = Math.max(...validLabels.map(l => l.y));
        const labelsAtMaxY = validLabels.filter(l => l.y === maxY);

        let bestLabel = labelsAtMaxY[0];
        let minXDist = Math.abs(el.x - bestLabel.x);

        for (let i = 1; i < labelsAtMaxY.length; i++) {
            const dist = Math.abs(el.x - labelsAtMaxY[i].x);
            if (dist < minXDist) {
                minXDist = dist;
                bestLabel = labelsAtMaxY[i];
            }
        }

        sectionMap.get(bestLabel.id)!.elements.push(el);
    }

    for (const section of sectionMap.values()) {
        section.elements.sort((a, b) => a.y !== b.y ? a.y - b.y : a.x - b.x);
    }
    unassigned.sort((a, b) => a.y !== b.y ? a.y - b.y : a.x - b.x);

    const result: Section[] = [];
    if (unassigned.length > 0) {
        result.push({ label: null, elements: unassigned });
    }

    for (const label of labels) {
        const section = sectionMap.get(label.id)!;
        if (section.elements.length > 0 || section.label !== null) {
            result.push(section);
        }
    }

    return result;
}

// ── Layout modes ─────────────────────────────────────────────────────
type LayoutMode = 'full-width' | 'grid-2' | 'horizontal-scroll';

function getLayoutForType(type: CanvasElement['type']): LayoutMode {
    switch (type) {
        case 'sticky-note':
        case 'metric-card':
        case 'data-dimension':
            return 'grid-2';
        case 'process-step':
        case 'user-flow-step':
            return 'full-width';
        default:
            return 'full-width';
    }
}

// Elements that use a mobile-native component (no canvas-element-base, always fluid)
const NATIVE_MOBILE_TYPES = new Set<CanvasElement['type']>(['case-study-card', 'game-zone']);

// Elements that need the scale-transform path (fixed canvas layout)
const SCALE_TYPES = new Set<CanvasElement['type']>(['flow-diagram', 'storyboard']);

function useMeasuredWidth(fallback = 360) {
    const ref = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(fallback);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        const update = () => {
            const nextWidth = Math.round(node.getBoundingClientRect().width);
            if (nextWidth > 0) setWidth(nextWidth);
        };

        update();

        if (typeof ResizeObserver !== 'undefined') {
            const observer = new ResizeObserver(update);
            observer.observe(node);
            return () => observer.disconnect();
        }

        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    return { ref, width };
}

function MobileStickyNote({ element }: { element: StickyNoteElement }) {
    const colors = {
        yellow: { bg: 'rgba(212,146,10,0.07)', border: '#d4920a', text: '#4d3f20' },
        purple: { bg: 'rgba(94,106,210,0.07)', border: '#5e6ad2', text: '#34345f' },
        pink: { bg: 'rgba(184,90,123,0.07)', border: '#b85a7b', text: '#513241' },
        cyan: { bg: 'rgba(43,127,139,0.07)', border: '#2b7f8b', text: '#264d54' },
        green: { bg: 'rgba(20,120,95,0.07)', border: '#14785f', text: '#244d3f' },
    }[element.data.color];

    return (
        <div
            className="py-3 pl-4 pr-1"
            style={{
                background: colors.bg,
                borderLeft: `2px solid ${colors.border}`,
            }}
        >
            <p className="whitespace-pre-line text-[14px] leading-[1.7]" style={{ color: colors.text }}>
                {element.data.content}
            </p>
        </div>
    );
}

function MobileMetricCard({ element }: { element: MetricCardElement }) {
    const { data } = element;
    const rgb = hexToRgb(data.accentColor);

    return (
        <div
            className="flex items-start justify-between gap-4 border-b border-[var(--exec-line)] py-3.5"
            style={{ borderLeft: `2px solid rgba(${rgb},0.52)`, paddingLeft: '12px' }}
        >
            <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold leading-snug text-[var(--exec-ink)]">{data.label}</p>
                {data.change && <p className="mt-1 text-[12px] leading-relaxed text-[var(--exec-muted)]">{data.change}</p>}
            </div>
            <p className="max-w-[42%] text-right text-[22px] font-semibold leading-none tracking-normal" style={{ color: data.accentColor }}>
                {data.value}
            </p>
        </div>
    );
}

function MobileStepCard({ element }: { element: ProcessStepElement | UserFlowStepElement }) {
    const data = element.data;
    const color = 'color' in data ? data.color : '#5e6ad2';
    const title = 'title' in data ? data.title : data.label;
    const description = data.description;
    const stepNumber = data.stepNumber;

    return (
        <div className="flex gap-3 border-b border-[var(--exec-line)] py-3.5 last:border-b-0">
            {stepNumber && (
                <span
                    className="mt-0.5 w-7 shrink-0 text-[12px] font-semibold tabular-nums"
                    style={{ color }}
                >
                    {String(stepNumber).padStart(2, '0')}
                </span>
            )}
            <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold leading-snug text-[var(--exec-ink)]">{title}</p>
                {description && (
                    <p className="mt-1 text-[13px] leading-relaxed text-[var(--exec-muted)]">{description}</p>
                )}
            </div>
        </div>
    );
}

function MobileQuoteBlock({ element }: { element: QuoteBlockElement }) {
    const { data } = element;
    const accent = data.accentColor ?? '#5e6ad2';

    return (
        <figure
            className="py-3 pl-4"
            style={{ borderLeft: `2px solid ${accent}` }}
        >
            <blockquote className="text-[16px] font-medium leading-[1.65] text-[var(--exec-ink-soft)]">
                {data.quote}
            </blockquote>
            <figcaption className="mt-3 text-[12px] font-semibold leading-relaxed text-[var(--exec-muted)]">
                {data.author}
                {data.role && <span className="font-medium"> / {data.role}</span>}
            </figcaption>
        </figure>
    );
}

function MobileTagCluster({ element }: { element: TagClusterElement }) {
    return (
        <div className="border-b border-[var(--exec-line)] py-3.5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--exec-muted)]">{element.data.title}</p>
            <div className="flex flex-wrap gap-x-2 gap-y-1.5">
                {element.data.tags.map(tag => {
                    return (
                        <span
                            key={tag.label}
                            className="text-[12px] font-medium"
                            style={{ color: tag.color }}
                        >
                            {tag.label}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}

function MobileDataDimension({ element }: { element: DataDimensionElement }) {
    const { data } = element;
    const rgb = hexToRgb(data.accentColor);

    return (
        <div
            className="border-b border-[var(--exec-line)] py-3.5"
            style={{ borderLeft: `2px solid rgba(${rgb},0.52)`, paddingLeft: '12px' }}
        >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: data.accentColor }}>
                {data.dimension}
            </p>
            <p className="mt-2 text-[14px] font-semibold leading-relaxed text-[var(--exec-ink)]">{data.title}</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
                {[{ label: 'Min', value: data.min }, { label: 'Max', value: data.max }, { label: 'Typical', value: data.typical }].map(item => (
                    <div key={item.label} className="min-w-0">
                        <p className="truncate text-[16px] font-semibold" style={{ color: data.accentColor }}>{item.value}</p>
                        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--exec-muted)]">{item.label}</p>
                    </div>
                ))}
            </div>
            {data.note && <p className="mt-3 text-[11px] font-medium leading-snug text-[var(--exec-muted)]">{data.note}</p>}
        </div>
    );
}

function MobileVideoEmbed({ element }: { element: VideoEmbedElement }) {
    const { data } = element;
    const [playing, setPlaying] = useState(false);
    const rgb = hexToRgb(data.accentColor);
    const isYouTube = data.videoUrl.includes('youtube.com') || data.videoUrl.includes('youtu.be');
    const resolvedVideoUrl = isYouTube
        ? `${data.videoUrl}${data.videoUrl.includes('?') ? '&' : '?'}autoplay=1&rel=0&modestbranding=1`
        : data.videoUrl.startsWith('/')
            ? `${import.meta.env.BASE_URL}${data.videoUrl.slice(1)}`
            : data.videoUrl;

    return (
        <div className="overflow-hidden rounded-lg border border-[var(--exec-line)] bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--exec-line)] px-4 py-3" style={{ background: `rgba(${rgb},0.04)` }}>
                <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-[var(--exec-ink)]">{data.title}</p>
                    {data.description && <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-[var(--exec-muted)]">{data.description}</p>}
                </div>
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: data.accentColor }}>Video</span>
            </div>
            <div className="relative aspect-video bg-[#111318]">
                {!playing ? (
                    <button
                        type="button"
                        onClick={() => setPlaying(true)}
                        className="absolute inset-0 flex flex-col items-center justify-center"
                        style={{ background: `linear-gradient(145deg, rgba(${rgb},0.18), rgba(17,19,24,0.96))` }}
                    >
                        <span className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_18px_38px_rgba(0,0,0,0.3)]" style={{ background: data.accentColor }}>
                            ▶
                        </span>
                    </button>
                ) : isYouTube ? (
                    <iframe className="absolute inset-0 h-full w-full" src={resolvedVideoUrl} title={data.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                ) : (
                    <video className="absolute inset-0 h-full w-full object-cover" src={resolvedVideoUrl} controls autoPlay />
                )}
            </div>
        </div>
    );
}

function MobileFigmaEmbed({ element }: { element: FigmaEmbedElement }) {
    const { data } = element;
    const [opened, setOpened] = useState(false);
    const rgb = hexToRgb(data.accentColor);
    const originalUrl = data.figmaUrl.match(/url=([^&]+)/)?.[1];

    return (
        <div className="overflow-hidden rounded-lg border border-[var(--exec-line)] bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--exec-line)] px-4 py-3" style={{ background: `rgba(${rgb},0.04)` }}>
                <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-[var(--exec-ink)]">{data.title}</p>
                    {data.description && <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-[var(--exec-muted)]">{data.description}</p>}
                </div>
                <button
                    type="button"
                    className="flex shrink-0 items-center gap-1 text-[11px] font-semibold"
                    style={{ color: data.accentColor }}
                    onClick={() => window.open(originalUrl ? decodeURIComponent(originalUrl) : data.figmaUrl, '_blank', 'noopener,noreferrer')}
                >
                    Open <ExternalLink className="h-3 w-3" />
                </button>
            </div>
            <div className="relative aspect-[4/3] bg-[var(--exec-card-subtle)]">
                {!opened ? (
                    <button type="button" onClick={() => setOpened(true)} className="absolute inset-0 flex items-center justify-center">
                        <span className="rounded-md border border-[var(--exec-line)] bg-white/86 px-5 py-3 text-sm font-semibold text-[var(--exec-ink)]">
                            Open Figma embed
                        </span>
                    </button>
                ) : (
                    <iframe className="absolute inset-0 h-full w-full border-0" src={data.figmaUrl} title={data.title} />
                )}
            </div>
        </div>
    );
}

interface ElementGroup {
    layout: LayoutMode;
    elements: CanvasElement[];
}

function groupConsecutiveElements(elements: CanvasElement[]): ElementGroup[] {
    const groups: ElementGroup[] = [];
    let current: ElementGroup | null = null;

    for (const el of elements) {
        const layout = getLayoutForType(el.type);
        if (current && current.layout === layout && layout !== 'full-width') {
            current.elements.push(el);
        } else {
            if (current) groups.push(current);
            current = { layout, elements: [el] };
        }
    }
    if (current) groups.push(current);
    return groups;
}

// ── Mobile element renderer ──────────────────────────────────────────
function MobileElement({ element }: { element: CanvasElement }) {
    const noop = () => { };
    const commonProps = { isSelected: false, onClick: noop };

    switch (element.type) {
        case 'case-study-card':
            return <MobileCaseStudyCard element={element} />;
        case 'sticky-note':
            return <MobileStickyNote element={element} />;
        case 'metric-card':
            return <MobileMetricCard element={element} />;
        case 'process-step':
            return <MobileStepCard element={element} />;
        case 'quote-block':
            return <MobileQuoteBlock element={element} />;
        case 'user-flow-step':
            return <MobileStepCard element={element} />;
        case 'tag-cluster':
            return <MobileTagCluster element={element} />;
        case 'storyboard':
            return <Storyboard element={element} {...commonProps} />;
        case 'video-embed':
            return <MobileVideoEmbed element={element} />;
        case 'figma-embed':
            return <MobileFigmaEmbed element={element} />;
        case 'flow-diagram':
            return <FlowDiagram element={element} {...commonProps} />;
        case 'data-dimension':
            return <MobileDataDimension element={element} />;
        case 'game-zone':
            return <MobileGameZone element={element} />;
        default:
            return null;
    }
}

// ── Section label as inline divider ──────────────────────────────────
function MobileSectionDivider({ element }: { element: CanvasElement }) {
    if (element.type !== 'section-label') return null;
    const { data } = element as { data: { title: string; color: string } };

    return (
        <div className="border-b border-[var(--exec-line)] pb-2">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.16em]" style={{ color: data.color }}>
                {data.title}
            </h2>
        </div>
    );
}

// ── Project hero header ──────────────────────────────────────────────
function MobileProjectHero({ project }: { project: Project }) {
    return (
        <div className="border-b border-[var(--exec-line)] px-5 pb-7 pt-7">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: project.accentColor }}>
                {project.category} · {project.year}
            </p>

            <h1
                className="mb-3 text-[34px] font-semibold leading-[1.05] tracking-normal"
                style={{ color: 'var(--exec-ink)' }}
            >
                {project.title}
            </h1>

            <p className="mb-5 text-[15px] leading-[1.65]" style={{ color: 'var(--exec-muted)' }}>
                {project.description}
            </p>

            <div className="-mx-5 overflow-x-auto px-5 mobile-no-scrollbar mobile-smooth-scroll-x">
                <div className="flex w-max gap-2">
                    {project.tags.map(tag => (
                        <span
                            key={tag}
                            className="border-b pb-0.5 text-[12px] font-medium"
                            style={{
                                color: 'var(--exec-ink-soft)',
                                borderColor: 'var(--exec-line-strong)',
                            }}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function MobileCanvasView({ project, onSelectProject, onBack, activeViewers }: Props) {
    const [showProjectSwitcher, setShowProjectSwitcher] = useState(false);
    const [showEngagement, setShowEngagement] = useState(false);
    const { reactions } = useReactions(project.id);
    const { ref: contentRef, width: contentWidth } = useMeasuredWidth();

    const sections = useMemo(() => groupIntoSections(project.canvasElements), [project.canvasElements]);

    const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);
    const containerWidth = Math.max(280, contentWidth - 40);

    return (
        <div className="fixed inset-0 flex flex-col" style={{ background: 'var(--exec-bg-warm)', color: 'var(--exec-ink)' }}>
            {/* ── Top Navigation Bar ─────────────────────────────── */}
            <div
                className="z-30 flex flex-shrink-0 items-center justify-between px-3 pb-2.5"
                style={{
                    paddingTop: 'calc(0.45rem + env(safe-area-inset-top, 0px))',
                    background: 'rgba(251,250,247,0.9)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: '1px solid var(--exec-line)',
                }}
            >
                <div className="flex min-w-0 items-center gap-2">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-[var(--exec-ink)] transition-colors active:bg-black/[0.04]"
                        aria-label="Back to projects"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="min-w-0">
                        <p className="max-w-[190px] truncate text-[13px] font-semibold" style={{ color: 'var(--exec-ink)' }}>
                            {project.title}
                        </p>
                        <p className="text-[10px] font-medium uppercase tracking-[0.12em]" style={{ color: 'var(--exec-muted)' }}>
                            {project.category} · {project.year}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setShowProjectSwitcher(true)}
                    className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--exec-ink)] transition-colors active:bg-black/[0.04]"
                    aria-label="Switch project"
                >
                    <List className="w-4 h-4" />
                </button>
            </div>

            {/* ── Main Scrollable Content ─────────────────────────── */}
            <div className="flex-1 overflow-y-scroll overflow-x-hidden mobile-no-scrollbar min-h-0 mobile-smooth-scroll">
                {/* Hero Header */}
                <MobileProjectHero project={project} />

                {/* Sections */}
                <div ref={contentRef} className="px-5 pb-10 pt-2">
                    {sections.map((section, sIdx) => (
                        <motion.div
                            key={sIdx}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.35, delay: 0.03 * Math.min(sIdx, 4) }}
                            className="mb-5"
                        >
                            {/* Section label as inline divider */}
                            {section.label && (
                                <div className="mb-2 pt-7">
                                    <MobileSectionDivider element={section.label} />
                                </div>
                            )}

                            {/* Grouped elements */}
                            {groupConsecutiveElements(section.elements).map((group, gIdx) => (
                                <div key={gIdx} className="mb-2">
                                    {group.layout === 'grid-2' ? (
                                        <div className="grid grid-cols-1">
                                            {group.elements.map(el => (
                                                <div key={el.id}>
                                                    <MobileElement element={el} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : group.layout === 'horizontal-scroll' ? (
                                        // ── Horizontal snap scroll (process-step, user-flow-step)
                                        <div className="-mx-5 overflow-x-auto mobile-snap-x mobile-no-scrollbar">
                                            <div className="flex gap-3 pb-1 pl-5 pr-5" style={{ width: 'max-content' }}>
                                                {group.elements.map(el => {
                                                    const cardW = Math.min(Math.max(el.width, 236), containerWidth * 0.82);
                                                    return (
                                                        <div
                                                            key={el.id}
                                                            className="mobile-snap-item flex-shrink-0"
                                                            style={{ width: cardW }}
                                                        >
                                                            <MobileElement element={{ ...el, width: cardW }} />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        // ── Full-width elements
                                        group.elements.map(el => {
                                            // Native mobile components (MobileCaseStudyCard, MobileGameZone)
                                            // — always fluid, never scaled
                                            if (NATIVE_MOBILE_TYPES.has(el.type)) {
                                                return (
                                                    <div key={el.id} className="mb-3">
                                                        <MobileElement element={{ ...el, width: containerWidth }} />
                                                    </div>
                                                );
                                            }

                                            // Scale elements (flow-diagram, storyboard)
                                            // — preserve internal layout, but keep a readable minimum scale with horizontal overflow
                                            if (SCALE_TYPES.has(el.type)) {
                                                const scaleFactor = Math.max(0.48, Math.min(1, containerWidth / el.width));
                                                const visualHeight = el.height * scaleFactor;
                                                const data = el.data as { title?: string; boardType?: string };
                                                return (
                                                    <div
                                                        key={el.id}
                                                        className="mb-4 overflow-hidden rounded-lg border border-[var(--exec-line)] bg-white"
                                                        style={{ width: containerWidth }}
                                                    >
                                                        {(data.title || data.boardType) && (
                                                            <div className="border-b border-[var(--exec-line)] px-4 py-3">
                                                                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--exec-muted)]">
                                                                    {data.title ?? data.boardType}
                                                                </p>
                                                            </div>
                                                        )}
                                                        <div className="overflow-x-auto mobile-no-scrollbar mobile-smooth-scroll-x">
                                                            <div
                                                                className="mobile-scale-el"
                                                                style={{
                                                                    width: el.width * scaleFactor,
                                                                    height: visualHeight,
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        width: el.width,
                                                                        height: el.height,
                                                                        transform: `scale(${scaleFactor})`,
                                                                        transformOrigin: 'top left',
                                                                    }}
                                                                >
                                                                    <MobileElement element={el} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            // All other full-width elements (quote-block, tag-cluster,
                                            // video-embed, figma-embed, etc.) — fluid sizing
                                            return (
                                                <div
                                                    key={el.id}
                                                    className="mb-3"
                                                >
                                                    <MobileElement element={{ ...el, width: containerWidth }} />
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            ))}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ── Bottom Engagement Bar ──────────────────────────── */}
            <div
                className="z-30 flex flex-shrink-0 justify-center border-t border-[var(--exec-line)] px-4 pb-3 pt-2 mobile-safe-bottom"
                style={{
                    background: 'rgba(251,250,247,0.94)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                }}
            >
                <div
                    className="grid w-full max-w-[360px] grid-cols-3"
                >
                    {/* Like — icon + count horizontal */}
                    <button
                        type="button"
                        onClick={() => setShowEngagement(true)}
                        className="flex items-center justify-center gap-1.5 rounded-md px-3 py-2.5 transition-colors active:bg-black/[0.04]"
                    >
                        <Heart
                            className="h-4 w-4 flex-shrink-0"
                            style={{
                                color: totalReactions > 0 ? 'var(--exec-red)' : 'var(--exec-muted)',
                                fill: totalReactions > 0 ? 'var(--exec-red)' : 'none',
                            }}
                        />
                        <span
                            className="text-[12px] font-black tabular-nums"
                            style={{ color: totalReactions > 0 ? 'var(--exec-red)' : 'var(--exec-muted)' }}
                        >
                            {totalReactions > 0 ? totalReactions : 'Like'}
                        </span>
                    </button>

                    {/* Note — icon stacked above label */}
                    <button
                        type="button"
                        onClick={() => setShowEngagement(true)}
                        className="flex items-center justify-center gap-1.5 rounded-md py-2 transition-colors active:bg-black/[0.04]"
                    >
                        <MessageSquare className="h-4 w-4" style={{ color: 'var(--exec-muted)', transform: 'scaleX(-1)' }} />
                        <span className="text-[12px] font-semibold" style={{ color: 'var(--exec-muted)' }}>Note</span>
                    </button>

                    {/* Share — icon stacked above label */}
                    <button
                        type="button"
                        onClick={() => setShowEngagement(true)}
                        className="flex items-center justify-center gap-1.5 rounded-md py-2 transition-colors active:bg-black/[0.04]"
                    >
                        <Send className="h-4 w-4" style={{ color: 'var(--exec-muted)' }} />
                        <span className="text-[12px] font-semibold" style={{ color: 'var(--exec-muted)' }}>Share</span>
                    </button>
                </div>
            </div>

            {/* ── Bottom Sheets ─────────────────────────────────── */}
            <MobileProjectSwitcher
                isOpen={showProjectSwitcher}
                onClose={() => setShowProjectSwitcher(false)}
                selectedProject={project}
                onSelectProject={onSelectProject}
            />

            <MobileEngagementSheet
                isOpen={showEngagement}
                onClose={() => setShowEngagement(false)}
                project={project}
                activeViewers={activeViewers}
            />
        </div>
    );
}
