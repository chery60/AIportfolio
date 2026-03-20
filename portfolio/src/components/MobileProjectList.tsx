import { motion } from 'framer-motion';
import type { Project } from '../types';
import { PROJECTS } from '../data/projects';
import { X, ChevronRight } from 'lucide-react';

interface Props {
    onSelectProject: (project: Project) => void;
    onExit: () => void;
}

export default function MobileProjectList({ onSelectProject, onExit }: Props) {
    return (
        <div className="fixed inset-0 bg-[#FAFAFA] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-5 pt-12 pb-3 mobile-safe-top bg-[#FAFAFA]/80 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-text-primary tracking-tight">Projects</h1>
                    <p className="text-[11px] text-text-secondary font-medium mt-0.5">{PROJECTS.length} case studies</p>
                </div>
                <button
                    onClick={onExit}
                    className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-white text-text-secondary hover:text-text-primary transition-colors shadow-sm border border-black/[0.04]"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Project Cards */}
            <div className="flex-1 overflow-y-scroll px-5 pb-10 min-h-0 mobile-no-scrollbar mobile-smooth-scroll">
                <div className="flex flex-col gap-4 pt-2">
                    {PROJECTS.map((project, idx) => (
                        <motion.button
                            key={project.id}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
                            onClick={() => onSelectProject(project)}
                            className="w-full text-left bg-white rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] border border-black/[0.04] active:scale-[0.98] transition-transform duration-150"
                        >
                            {/* Accent gradient strip */}
                            <div
                                className="h-1.5 w-full"
                                style={{
                                    background: `linear-gradient(90deg, ${project.gradientFrom}, ${project.gradientTo})`,
                                }}
                            />

                            <div className="p-5">
                                {/* Meta row */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm"
                                            style={{
                                                background: `linear-gradient(135deg, ${project.gradientFrom}, ${project.gradientTo})`,
                                            }}
                                        >
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                                                {project.category}
                                            </p>
                                            <p className="text-[10px] text-text-muted">{project.year}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-text-muted" />
                                </div>

                                {/* Title */}
                                <h2 className="text-lg font-bold text-text-primary leading-tight mb-1.5">
                                    {project.title}
                                </h2>

                                {/* Description */}
                                <p className="text-[13px] text-text-secondary leading-relaxed line-clamp-2 mb-4">
                                    {project.description}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1.5">
                                    {project.tags.slice(0, 4).map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                                            style={{
                                                backgroundColor: `${project.accentColor}0D`,
                                                color: project.accentColor,
                                            }}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                    {project.tags.length > 4 && (
                                        <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-surface-2 text-text-muted">
                                            +{project.tags.length - 4}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Footer */}
                <div className="text-center pt-8 pb-4">
                    <p className="text-[11px] text-text-muted font-medium">Designed by Sai Charan</p>
                </div>
            </div>
        </div>
    );
}
