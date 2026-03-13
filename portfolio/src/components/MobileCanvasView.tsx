import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MoreVertical, Heart, MessageSquare, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Project, CanvasElement } from '../types';
import type { ActiveViewer } from '../hooks/useRealtimeSession';
import { PROJECTS } from '../data/projects';
import { useReactions } from '../hooks/useReactions';
import MobileProjectSwitcher from './MobileProjectSwitcher';
import MobileEngagementSheet from './MobileEngagementSheet';

// Import canvas element components directly
import CaseStudyCard from './Canvas/elements/CaseStudyCard';
import StickyNote from './Canvas/elements/StickyNote';
import MetricCard from './Canvas/elements/MetricCard';
import ProcessStep from './Canvas/elements/ProcessStep';
import QuoteBlock from './Canvas/elements/QuoteBlock';
import UserFlowStep from './Canvas/elements/UserFlowStep';
import SectionLabel from './Canvas/elements/SectionLabel';
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

    // Collect section labels sorted by Y then X
    const labels = filtered
        .filter(el => el.type === 'section-label')
        .sort((a, b) => a.y !== b.y ? a.y - b.y : a.x - b.x);

    // Initialize sections for all labels, plus an unassigned one
    const sectionMap = new Map<string, Section>();
    const unassigned: CanvasElement[] = [];

    for (const label of labels) {
        sectionMap.set(label.id, { label, elements: [] });
    }

    // Assign non-label elements to the best label
    const nonLabels = filtered.filter(el => el.type !== 'section-label');

    for (const el of nonLabels) {
        // Find all labels above or at the same Y as this element
        const validLabels = labels.filter(l => l.y <= el.y);

        if (validLabels.length === 0) {
            unassigned.push(el);
            continue;
        }

        // Find the maximum Y among valid labels (the closest row above)
        const maxY = Math.max(...validLabels.map(l => l.y));
        const labelsAtMaxY = validLabels.filter(l => l.y === maxY);

        // Tie-breaker: pick the label that is closest on the X-axis
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

    // Sort elements inside each section
    for (const section of sectionMap.values()) {
        section.elements.sort((a, b) => a.y !== b.y ? a.y - b.y : a.x - b.x);
    }
    unassigned.sort((a, b) => a.y !== b.y ? a.y - b.y : a.x - b.x);

    const result: Section[] = [];
    if (unassigned.length > 0) {
        result.push({ label: null, elements: unassigned });
    }

    // Add assigned sections in the original label order
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

// ── Mobile element renderer — native sizing ──────────────────────────
function MobileElement({ element }: { element: CanvasElement }) {
    const noop = () => { };
    const commonProps = { isSelected: false, onClick: noop };

    switch (element.type) {
        case 'case-study-card':
            return <CaseStudyCard element={element} {...commonProps} />;
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
        case 'section-label':
            return <SectionLabel element={element} {...commonProps} />;
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
        <div className="flex items-center gap-3 py-2">
            <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: data.color }}
            />
            <span
                className="text-[11px] font-bold tracking-wider uppercase flex-shrink-0"
                style={{ color: data.color }}
            >
                {data.title}
            </span>
            <div className="flex-1 h-px bg-panel-border" />
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
        <div className="fixed inset-0 flex flex-col bg-white text-text-primary">
            {/* ── Top Navigation Bar ────────────────────────────────── */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-panel-border bg-white/80 backdrop-blur-xl z-30 mobile-safe-top flex-shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                    <button
                        onClick={onBack}
                        className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-1 text-text-secondary hover:text-text-primary transition-colors flex-shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-text-primary truncate max-w-[160px]">{project.title}</p>
                        <p className="text-[10px] text-text-secondary">{project.category} · {project.year}</p>
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
                                    className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
                                    style={{ backgroundColor: v.color, zIndex: 10 - i }}
                                >
                                    {v.initials}
                                </div>
                            ))}
                            {activeViewers.length > 3 && (
                                <div
                                    className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-text-secondary bg-surface-1 shadow-sm"
                                    style={{ zIndex: 0 }}
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
                        className="w-7 h-7 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-1 transition-colors disabled:opacity-30"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-mono text-text-secondary px-0.5">
                        {currentIdx + 1}/{PROJECTS.length}
                    </span>
                    <button
                        onClick={handleNextProject}
                        disabled={currentIdx >= PROJECTS.length - 1}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-1 transition-colors disabled:opacity-30"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>

                    <div className="w-px h-4 bg-panel-border mx-0.5" />

                    <button
                        onClick={() => setShowProjectSwitcher(true)}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-1 text-text-secondary hover:text-text-primary transition-colors"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── Main Scrollable Content ──────────────────────────── */}
            <div className="flex-1 overflow-y-auto mobile-no-scrollbar">
                {/* Project accent header */}
                <div
                    className="px-5 py-6"
                    style={{ background: `linear-gradient(135deg, ${project.accentColor}15, transparent)` }}
                >
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {project.tags.slice(0, 5).map(tag => (
                            <span
                                key={tag}
                                className="text-[10px] font-semibold px-2 py-1 rounded-full"
                                style={{ background: `${project.accentColor}15`, color: project.accentColor }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{project.description}</p>
                </div>

                {/* Sections */}
                <div className="px-4 pb-28">
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
                                <div className="mb-4 pt-3">
                                    <MobileSectionDivider element={section.label} />
                                </div>
                            )}

                            {/* Grouped elements */}
                            {groupConsecutiveElements(section.elements).map((group, gIdx) => (
                                <div key={gIdx} className="mb-4">
                                    {group.layout === 'grid-2' ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            {group.elements.map(el => {
                                                // Override element dimensions for mobile grid
                                                const mobileEl = {
                                                    ...el,
                                                    width: Math.floor((window.innerWidth - 44) / 2),
                                                    height: Math.min(el.height, 180),
                                                };
                                                return (
                                                    <div key={el.id} className="mobile-grid-item overflow-hidden rounded-xl">
                                                        <MobileElement element={mobileEl} />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : group.layout === 'horizontal-scroll' ? (
                                        <div className="overflow-x-auto mobile-snap-x mobile-no-scrollbar -mx-4 px-4">
                                            <div className="flex gap-3" style={{ width: 'max-content' }}>
                                                {group.elements.map(el => {
                                                    const cardWidth = Math.min(el.width, window.innerWidth * 0.72);
                                                    const mobileEl = { ...el, width: cardWidth, height: Math.min(el.height, 200) };
                                                    return (
                                                        <div
                                                            key={el.id}
                                                            className="mobile-snap-item flex-shrink-0 overflow-hidden rounded-xl"
                                                            style={{ width: cardWidth }}
                                                        >
                                                            <MobileElement element={mobileEl} />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        // Full-width elements
                                        group.elements.map(el => {
                                            const containerWidth = window.innerWidth - 32;
                                            const needsScale = el.width > containerWidth;
                                            const scaleFactor = needsScale ? containerWidth / el.width : 1;

                                            return (
                                                <div key={el.id} className="mb-4 overflow-hidden rounded-xl">
                                                    {needsScale ? (
                                                        <div className="overflow-x-auto mobile-no-scrollbar">
                                                            <div
                                                                style={{
                                                                    width: el.width,
                                                                    height: el.height * scaleFactor,
                                                                    transform: `scale(${scaleFactor})`,
                                                                    transformOrigin: 'top left',
                                                                }}
                                                            >
                                                                <MobileElement element={el} />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div style={{ width: '100%' }}>
                                                            <MobileElement element={{ ...el, width: containerWidth }} />
                                                        </div>
                                                    )}
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

            {/* ── Bottom Engagement Bar ────────────────────────────── */}
            <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none pb-4 px-4 flex items-end justify-end mobile-safe-bottom">
                <div className="flex flex-col items-center gap-5 pointer-events-auto mr-1">
                    <div className="flex flex-col items-center gap-1">
                        <button
                            onClick={() => setShowEngagement(true)}
                            className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors border border-white/10 shadow-lg active:scale-90"
                        >
                            <Heart className={totalReactions > 0 ? "w-5 h-5 fill-red-500 text-red-500" : "w-5 h-5"} />
                        </button>
                        <span className="text-white text-[11px] font-bold drop-shadow-md">
                            {totalReactions > 0 ? totalReactions.toLocaleString() : 'Like'}
                        </span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <button
                            onClick={() => setShowEngagement(true)}
                            className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors border border-white/10 shadow-lg active:scale-90"
                        >
                            <MessageSquare className="w-5 h-5" style={{ transform: 'scaleX(-1)' }} />
                        </button>
                        <span className="text-white text-[11px] font-bold drop-shadow-md">Comment</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <button
                            onClick={() => setShowEngagement(true)}
                            className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors border border-white/10 shadow-lg active:scale-90"
                        >
                            <Send className="w-4 h-4 transform -rotate-45 -mt-0.5 ml-0.5" />
                        </button>
                        <span className="text-white text-[11px] font-bold drop-shadow-md">Share</span>
                    </div>
                </div>
            </div>

            {/* ── Bottom Sheets ───────────────────────────────────── */}
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
