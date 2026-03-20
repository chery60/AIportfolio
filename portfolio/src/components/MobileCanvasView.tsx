import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MoreVertical, Heart, MessageSquare, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Project, CanvasElement } from '../types';
import type { ActiveViewer } from '../hooks/useRealtimeSession';
import { PROJECTS } from '../data/projects';
import { useReactions } from '../hooks/useReactions';
import MobileProjectSwitcher from './MobileProjectSwitcher';
import MobileEngagementSheet from './MobileEngagementSheet';
import MobileCaseStudyCard from './MobileCaseStudyCard';

// Import canvas element components directly
import StickyNote from './Canvas/elements/StickyNote';
import MetricCard from './Canvas/elements/MetricCard';
import ProcessStep from './Canvas/elements/ProcessStep';
import QuoteBlock from './Canvas/elements/QuoteBlock';
import UserFlowStep from './Canvas/elements/UserFlowStep';
import TagCluster from './Canvas/elements/TagCluster';
import Storyboard from './Canvas/elements/Storyboard';
import VideoEmbed from './Canvas/elements/VideoEmbed';
import FigmaEmbed from './Canvas/elements/FigmaEmbed';
import FlowDiagram from './Canvas/elements/FlowDiagram';
import DataDimension from './Canvas/elements/DataDimension';
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
            return 'horizontal-scroll';
        default:
            return 'full-width';
    }
}

// Elements that use a mobile-native component (no canvas-element-base, always fluid)
const NATIVE_MOBILE_TYPES = new Set<CanvasElement['type']>(['case-study-card', 'game-zone']);

// Elements that need the scale-transform path (fixed canvas layout)
const SCALE_TYPES = new Set<CanvasElement['type']>(['flow-diagram', 'storyboard']);

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
            return <StickyNote element={element} {...commonProps} />;
        case 'metric-card':
            return <MetricCard element={element} {...commonProps} />;
        case 'process-step':
            return <ProcessStep element={element} {...commonProps} />;
        case 'quote-block':
            return <QuoteBlock element={element} {...commonProps} />;
        case 'user-flow-step':
            return <UserFlowStep element={element} {...commonProps} />;
        case 'tag-cluster':
            return <TagCluster element={element} {...commonProps} />;
        case 'storyboard':
            return <Storyboard element={element} {...commonProps} />;
        case 'video-embed':
            return <VideoEmbed element={element} {...commonProps} />;
        case 'figma-embed':
            return <FigmaEmbed element={element} {...commonProps} />;
        case 'flow-diagram':
            return <FlowDiagram element={element} {...commonProps} />;
        case 'data-dimension':
            return <DataDimension element={element} {...commonProps} />;
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
        <div className="flex items-center gap-3 py-1">
            <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: data.color }}
            />
            <span
                className="text-[10px] font-bold tracking-widest uppercase flex-shrink-0"
                style={{ color: data.color }}
            >
                {data.title}
            </span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
        </div>
    );
}

// ── Project hero header ──────────────────────────────────────────────
function MobileProjectHero({ project }: { project: Project }) {
    return (
        <div
            className="relative px-5 pt-7 pb-6 overflow-hidden"
            style={{
                background: `linear-gradient(160deg, ${project.accentColor}28 0%, ${project.accentColor}0a 55%, transparent 100%)`,
                borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
        >
            {/* Decorative glow blob */}
            <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
                style={{
                    background: `radial-gradient(circle, ${project.accentColor}20 0%, transparent 70%)`,
                    transform: 'translate(30%, -30%)',
                }}
            />

            {/* Category + Year badge */}
            <div className="flex items-center gap-2 mb-3">
                <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                    style={{
                        background: `${project.accentColor}20`,
                        color: project.accentColor,
                        border: `1px solid ${project.accentColor}35`,
                    }}
                >
                    {project.category}
                </span>
                <span className="text-[10px] font-semibold" style={{ color: 'rgba(240,240,255,0.35)' }}>
                    {project.year}
                </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-black leading-tight mb-2" style={{ color: '#F0F0FF' }}>
                {project.title}
            </h1>

            {/* Description */}
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(240,240,255,0.55)' }}>
                {project.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
                {project.tags.map(tag => (
                    <span
                        key={tag}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        style={{
                            background: 'rgba(255,255,255,0.07)',
                            color: 'rgba(240,240,255,0.65)',
                            border: '1px solid rgba(255,255,255,0.09)',
                        }}
                    >
                        {tag}
                    </span>
                ))}
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

    const sections = useMemo(() => groupIntoSections(project.canvasElements), [project.canvasElements]);

    const currentIdx = PROJECTS.findIndex(p => p.id === project.id);
    const handlePrevProject = useCallback(() => {
        if (currentIdx > 0) onSelectProject(PROJECTS[currentIdx - 1]);
    }, [currentIdx, onSelectProject]);
    const handleNextProject = useCallback(() => {
        if (currentIdx < PROJECTS.length - 1) onSelectProject(PROJECTS[currentIdx + 1]);
    }, [currentIdx, onSelectProject]);

    const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);

    return (
        <div className="fixed inset-0 flex flex-col" style={{ background: '#0A0B0F', color: '#F0F0FF' }}>
            {/* ── Top Navigation Bar ─────────────────────────────── */}
            <div
                className="flex items-center justify-between px-4 py-3 z-30 mobile-safe-top flex-shrink-0"
                style={{
                    background: 'rgba(10,11,15,0.85)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <button
                        onClick={onBack}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(240,240,255,0.7)' }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="min-w-0">
                        <p className="text-sm font-bold truncate max-w-[150px]" style={{ color: '#F0F0FF' }}>
                            {project.title}
                        </p>
                        <p className="text-[10px]" style={{ color: 'rgba(240,240,255,0.35)' }}>
                            {project.category} · {project.year}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {/* Viewers Avatars */}
                    {activeViewers.length > 0 && (
                        <div
                            className="flex -space-x-1.5 mr-1 cursor-pointer"
                            onClick={() => setShowEngagement(true)}
                        >
                            {activeViewers.slice(0, 3).map((v, i) => (
                                <div
                                    key={v.id}
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
                                    style={{
                                        backgroundColor: v.color,
                                        border: '2px solid #0A0B0F',
                                        zIndex: 10 - i,
                                    }}
                                >
                                    {v.initials}
                                </div>
                            ))}
                            {activeViewers.length > 3 && (
                                <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shadow-sm"
                                    style={{
                                        background: 'rgba(255,255,255,0.10)',
                                        border: '2px solid #0A0B0F',
                                        color: 'rgba(240,240,255,0.6)',
                                        zIndex: 0,
                                    }}
                                >
                                    +{activeViewers.length - 3}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Navigation arrows */}
                    <button
                        onClick={handlePrevProject}
                        disabled={currentIdx <= 0}
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-colors disabled:opacity-25"
                        style={{ color: 'rgba(240,240,255,0.5)' }}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-mono px-0.5" style={{ color: 'rgba(240,240,255,0.35)' }}>
                        {currentIdx + 1}/{PROJECTS.length}
                    </span>
                    <button
                        onClick={handleNextProject}
                        disabled={currentIdx >= PROJECTS.length - 1}
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-colors disabled:opacity-25"
                        style={{ color: 'rgba(240,240,255,0.5)' }}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>

                    <div className="w-px h-4 mx-0.5" style={{ background: 'rgba(255,255,255,0.10)' }} />

                    <button
                        onClick={() => setShowProjectSwitcher(true)}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                        style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(240,240,255,0.55)' }}
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── Main Scrollable Content ─────────────────────────── */}
            <div className="flex-1 overflow-y-scroll mobile-no-scrollbar min-h-0 mobile-smooth-scroll">
                {/* Hero Header */}
                <MobileProjectHero project={project} />

                {/* Sections */}
                <div className="px-4 pb-36 pt-2">
                    {sections.map((section, sIdx) => (
                        <motion.div
                            key={sIdx}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.35, delay: 0.03 * Math.min(sIdx, 4) }}
                            className="mb-6"
                        >
                            {/* Section label as inline divider */}
                            {section.label && (
                                <div className="mb-4 pt-4">
                                    <MobileSectionDivider element={section.label} />
                                </div>
                            )}

                            {/* Grouped elements */}
                            {groupConsecutiveElements(section.elements).map((group, gIdx) => (
                                <div key={gIdx} className="mb-4">
                                    {group.layout === 'grid-2' ? (
                                        // ── 2-column grid (sticky-note, metric-card, data-dimension)
                                        // mobile-el class resets canvas-element-base position:absolute → relative
                                        <div className="grid grid-cols-2 gap-3">
                                            {group.elements.map(el => (
                                                <div key={el.id} className="mobile-el overflow-hidden" style={{ borderRadius: 8 }}>
                                                    <MobileElement element={el} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : group.layout === 'horizontal-scroll' ? (
                                        // ── Horizontal snap scroll (process-step, user-flow-step)
                                        <div className="overflow-x-auto mobile-snap-x mobile-no-scrollbar -mx-4 px-4">
                                            <div className="flex gap-3 pb-1" style={{ width: 'max-content' }}>
                                                {group.elements.map(el => {
                                                    const cardW = Math.min(Math.max(el.width, 200), window.innerWidth * 0.75);
                                                    return (
                                                        <div
                                                            key={el.id}
                                                            className="mobile-scroll-el mobile-snap-item flex-shrink-0 overflow-hidden"
                                                            style={{ width: cardW, borderRadius: 8 }}
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
                                            const containerWidth = window.innerWidth - 32;

                                            // Native mobile components (MobileCaseStudyCard, MobileGameZone)
                                            // — always fluid, never scaled
                                            if (NATIVE_MOBILE_TYPES.has(el.type)) {
                                                return (
                                                    <div key={el.id} className="mb-4" style={{ borderRadius: 8, overflow: 'hidden' }}>
                                                        <MobileElement element={{ ...el, width: containerWidth }} />
                                                    </div>
                                                );
                                            }

                                            // Scale elements (flow-diagram, storyboard)
                                            // — preserve internal layout via CSS scale
                                            if (SCALE_TYPES.has(el.type)) {
                                                const scaleFactor = containerWidth / el.width;
                                                const visualHeight = el.height * scaleFactor;
                                                return (
                                                    <div
                                                        key={el.id}
                                                        className="mb-4 overflow-hidden"
                                                        style={{ width: containerWidth, height: visualHeight, borderRadius: 8 }}
                                                    >
                                                        <div
                                                            className="mobile-scale-el"
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
                                                );
                                            }

                                            // All other full-width elements (quote-block, tag-cluster,
                                            // video-embed, figma-embed, etc.) — fluid sizing
                                            return (
                                                <div
                                                    key={el.id}
                                                    className="mobile-el mb-4 overflow-hidden"
                                                    style={{ borderRadius: 8 }}
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

            {/* ── Right-side Engagement Bar ───────────────────────── */}
            <div className="fixed bottom-20 right-3 z-30 flex flex-col items-center gap-1 pointer-events-auto">
                <div
                    className="flex flex-col items-center gap-4 px-2.5 py-4 rounded-2xl"
                    style={{
                        background: 'rgba(0,0,0,0.55)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.10)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    }}
                >
                    {/* Author dot */}
                    <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white shadow-lg"
                        style={{
                            background: `linear-gradient(135deg, ${project.accentColor}, ${project.accentColor}aa)`,
                            border: '2px solid rgba(255,255,255,0.15)',
                        }}
                    >
                        {project.title.charAt(0)}
                    </div>

                    <div className="w-full h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />

                    {/* Like */}
                    <div className="flex flex-col items-center gap-1">
                        <button
                            onClick={() => setShowEngagement(true)}
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
                            style={{ background: 'rgba(255,255,255,0.07)' }}
                        >
                            <Heart
                                className="w-5 h-5"
                                style={{ color: totalReactions > 0 ? '#ef4444' : 'rgba(240,240,255,0.7)', fill: totalReactions > 0 ? '#ef4444' : 'none' }}
                            />
                        </button>
                        <span className="text-[10px] font-semibold" style={{ color: 'rgba(240,240,255,0.5)' }}>
                            {totalReactions > 0 ? totalReactions : 'Like'}
                        </span>
                    </div>

                    {/* Comment */}
                    <div className="flex flex-col items-center gap-1">
                        <button
                            onClick={() => setShowEngagement(true)}
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
                            style={{ background: 'rgba(255,255,255,0.07)' }}
                        >
                            <MessageSquare className="w-5 h-5" style={{ color: 'rgba(240,240,255,0.7)', transform: 'scaleX(-1)' }} />
                        </button>
                        <span className="text-[10px] font-semibold" style={{ color: 'rgba(240,240,255,0.5)' }}>
                            Note
                        </span>
                    </div>

                    {/* Share */}
                    <div className="flex flex-col items-center gap-1">
                        <button
                            onClick={() => setShowEngagement(true)}
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
                            style={{ background: 'rgba(255,255,255,0.07)' }}
                        >
                            <Send className="w-4.5 h-4.5" style={{ color: 'rgba(240,240,255,0.7)', transform: 'rotate(-40deg) translateY(-1px)' }} />
                        </button>
                        <span className="text-[10px] font-semibold" style={{ color: 'rgba(240,240,255,0.5)' }}>
                            Share
                        </span>
                    </div>
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
