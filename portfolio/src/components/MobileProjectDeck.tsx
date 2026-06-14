import { useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '../types';

interface Props {
  projects: Project[];
  onOpenProject: (project: Project) => void;
}

const SWIPE_THRESHOLD = 88;
const VELOCITY_THRESHOLD = 480;
const COMMIT_DELAY_MS = 280;

function ProjectCard({ project, index, layer }: { project: Project; index: number; layer: number }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[28px] border border-white/[0.18] text-left"
      style={{
        background: `linear-gradient(145deg, ${project.gradientFrom}, ${project.gradientTo})`,
        boxShadow: layer === 0
          ? '0 30px 76px rgba(0,0,0,0.52), 0 8px 20px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.25)'
          : '0 18px 42px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.16)',
      }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.02)_30%,rgba(0,0,0,0.42)_66%,rgba(0,0,0,0.82)_100%)]" />
      <div className="absolute inset-0 opacity-[0.16] mix-blend-soft-light bg-[linear-gradient(90deg,rgba(255,255,255,0.28)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.22)_1px,transparent_1px)] bg-[size:34px_34px]" />

      <div className="relative flex h-full flex-col justify-between p-5">
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-white/25 bg-white/12 px-3 py-1 text-[12px] font-black tabular-nums text-white shadow-sm backdrop-blur-md">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/12 text-white backdrop-blur-md">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-white/82">
            {project.category}
          </p>
          <h3 className="text-[28px] font-black leading-[1.02] tracking-tight text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.34)]">
            {project.title}
          </h3>
          <p className="mt-3 line-clamp-3 text-[13px] font-medium leading-relaxed text-white/76">
            {project.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="rounded-full border border-white/18 bg-black/22 px-3 py-1 text-[11px] font-bold text-white/84 backdrop-blur-md"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MobileProjectDeck({ projects, onOpenProject }: Props) {
  const [rotatedIds, setRotatedIds] = useState<string[]>([]);
  const [committingId, setCommittingId] = useState<string | null>(null);
  const dragDistanceRef = useRef(0);
  const isDraggingRef = useRef(false);
  const suppressNextClickRef = useRef(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-180, 0, 180], [-9, 0, 9]);

  const deck = useMemo(() => {
    const projectById = new Map(projects.map(project => [project.id, project]));
    const queuedIds = rotatedIds.filter(id => projectById.has(id));
    const queuedIdSet = new Set(queuedIds);
    const frontProjects = projects.filter(project => !queuedIdSet.has(project.id));
    const queuedProjects = queuedIds
      .map(id => projectById.get(id))
      .filter((project): project is Project => Boolean(project));
    return [...frontProjects, ...queuedProjects];
  }, [projects, rotatedIds]);

  const activeProject = deck[0];
  const visibleCards = deck.slice(0, Math.min(deck.length, 4));

  // Swipe LEFT → card shrinks and sinks to back of stack
  const sendTopToBack = () => {
    if (!activeProject || committingId) return;
    const swipedProject = activeProject;
    suppressNextClickRef.current = true;
    setCommittingId(swipedProject.id);
    x.set(-480);

    window.setTimeout(() => {
      setRotatedIds(current => {
        const valid = new Set(projects.map(p => p.id));
        const filtered = current.filter(id => valid.has(id) && id !== swipedProject.id);
        return [...filtered, swipedProject.id];
      });
      x.set(0);
      setCommittingId(null);
      suppressNextClickRef.current = false;
      dragDistanceRef.current = 0;
      isDraggingRef.current = false;
    }, COMMIT_DELAY_MS);
  };

  // Swipe RIGHT → open project immediately; AnimatePresence handles the enter transition
  const expandAndOpen = () => {
    if (!activeProject || committingId) return;
    dragDistanceRef.current = 0;
    isDraggingRef.current = false;
    suppressNextClickRef.current = false;
    onOpenProject(activeProject);
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    dragDistanceRef.current = Math.abs(info.offset.x);
    isDraggingRef.current = false;
    const shouldSwipe =
      Math.abs(info.offset.x) > SWIPE_THRESHOLD ||
      Math.abs(info.velocity.x) > VELOCITY_THRESHOLD;

    if (!shouldSwipe) {
      x.set(0);
      suppressNextClickRef.current = dragDistanceRef.current > 8;
      window.setTimeout(() => {
        dragDistanceRef.current = 0;
        suppressNextClickRef.current = false;
      }, 0);
      return;
    }

    if (info.offset.x > 0) {
      expandAndOpen();   // swipe right → open project
    } else {
      sendTopToBack();   // swipe left → next card
    }
  };

  if (!activeProject) return null;

  return (
    <div className="relative mx-auto flex min-h-0 w-full max-w-[430px] flex-1 items-start justify-center">
      <div className="relative mx-auto h-[clamp(310px,48dvh,430px)] max-h-full w-[min(84vw,360px)] overflow-visible">
        {visibleCards
          .map((project, layer) => ({ project, layer, index: projects.findIndex(item => item.id === project.id) }))
          .reverse()
          .map(({ project, layer, index }) => {
            const isActive = layer === 0;
            const isCommitting = committingId === project.id;

            return (
              <motion.div
                key={project.id}
                drag={isActive && !committingId ? 'x' : false}
                dragConstraints={{ left: -20, right: 20 }}
                dragElastic={0.28}
                onDragStart={() => {
                  dragDistanceRef.current = 0;
                  isDraggingRef.current = true;
                  suppressNextClickRef.current = false;
                }}
                onDragEnd={isActive ? handleDragEnd : undefined}
                className="absolute inset-0 touch-pan-y overflow-visible rounded-[28px] outline-none cursor-grab active:cursor-grabbing"
                style={{
                  x: isActive ? x : 0,
                  rotate: isActive ? rotate : 0,
                  zIndex: 20 - layer,
                  pointerEvents: isActive && !committingId ? 'auto' : 'none',
                }}
                animate={
                  isActive
                    ? isCommitting
                      // Left-swipe exit: card shrinks and sinks as x flies it off screen
                      ? { scale: 0.86, opacity: 0.4, y: 18, transition: { duration: 0.24, ease: 'easeIn' as const } }
                      : { y: 0, scale: 1, opacity: 1 }
                    : {
                      y: -18 * layer,
                      scale: 1 - layer * 0.055,
                      rotate: layer % 2 === 0 ? -3.5 : 3.5,
                      opacity: 1 - layer * 0.16,
                    }
                }
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <ProjectCard project={project} index={index} layer={layer} />
              </motion.div>
            );
          })}
      </div>
    </div>
  );
}
