import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { BlurFade } from './ui/blur-fade';
import { PROJECTS } from '../data/projects';
import type { Project } from '../types';

interface Props {
  onSelectProject: (project: Project) => void;
}

export default function MobileProjectsTab({ onSelectProject }: Props) {
  return (
    <div className="h-full overflow-y-auto bg-[#0A0B0F]">
      <div className="px-5 pt-4 pb-8">

        {/* Header — same padding as Chat tab (px-5 py-4) */}
        <BlurFade delay={0}>
          <div className="py-4">
            <h2 className="text-2xl font-bold text-[#F0F0FF]">Case Studies</h2>
            <p className="text-sm text-[#4A4B6A] mt-1">{PROJECTS.length} projects · Tap to explore</p>
          </div>
        </BlurFade>

        {/* Project grid — masonry 2 columns */}
        <div className="columns-2 gap-3 space-y-0 mt-2">
          {PROJECTS.map((project, idx) => (
            <BlurFade key={project.id} delay={idx * 0.07} inView>
              <div className="break-inside-avoid mb-3">
                <ProjectTile project={project} index={idx} onSelect={onSelectProject} />
              </div>
            </BlurFade>
          ))}
        </div>

      </div>
    </div>
  );
}

// Alternate tall / short / tall / short… for masonry feel
const ASPECT_RATIOS = ['3/4', '4/5', '2/3', '1/1', '3/4', '4/3'];

function ProjectTile({ project, index, onSelect }: { project: Project; index: number; onSelect: (p: Project) => void }) {
  const aspectRatio = ASPECT_RATIOS[index % ASPECT_RATIOS.length];
  return (
    <motion.button
      onClick={() => onSelect(project)}
      whileTap={{ scale: 0.96 }}
      className="relative w-full rounded-2xl overflow-hidden border border-[#1E1F2C] text-left"
      style={{ aspectRatio }}
    >
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${project.gradientFrom}, ${project.gradientTo})`,
          opacity: 0.85,
        }}
      />

      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Index badge */}
      <div className="absolute top-3 left-3">
        <span
          className="text-[10px] font-bold text-white/80 bg-white/10 backdrop-blur-sm rounded-full px-2 py-0.5"
        >
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* Arrow */}
      <div className="absolute top-3 right-3">
        <div className="w-6 h-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
          <ArrowRight className="w-3 h-3 text-white/60" />
        </div>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-1">
        <span
          className="text-[9px] font-semibold tracking-widest uppercase"
          style={{ color: project.gradientFrom }}
        >
          {project.category}
        </span>
        <h3 className="text-xs font-bold text-white leading-tight line-clamp-2">
          {project.title}
        </h3>
        <div className="flex flex-wrap gap-1 mt-0.5">
          {project.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[9px] text-white/50 bg-white/5 rounded-full px-1.5 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  );
}
