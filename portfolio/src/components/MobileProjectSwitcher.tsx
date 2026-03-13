import { motion, AnimatePresence } from 'framer-motion';
import type { Project } from '../types';
import { PROJECTS } from '../data/projects';
import { X, ChevronRight } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    selectedProject: Project;
    onSelectProject: (project: Project) => void;
}

export default function MobileProjectSwitcher({ isOpen, onClose, selectedProject, onSelectProject }: Props) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bottom-sheet-overlay"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="bottom-sheet"
                    >
                        <div className="bottom-sheet-handle" />

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-panel-border">
                            <h3 className="text-sm font-bold text-text-primary">Switch Project</h3>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-1 text-text-secondary hover:text-text-primary transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Project List */}
                        <div className="px-4 py-3 max-h-[60vh] overflow-y-auto">
                            <div className="space-y-1">
                                {PROJECTS.map((project, idx) => {
                                    const isActive = selectedProject.id === project.id;
                                    return (
                                        <button
                                            key={project.id}
                                            onClick={() => {
                                                onSelectProject(project);
                                                onClose();
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${isActive
                                                    ? 'bg-surface-2 border border-panel-border shadow-sm'
                                                    : 'hover:bg-surface-1 border border-transparent'
                                                }`}
                                        >
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-mono font-bold text-sm"
                                                style={{
                                                    background: isActive ? `${project.accentColor}20` : '#F3F4F6',
                                                    color: isActive ? project.accentColor : '#9CA3AF',
                                                }}
                                            >
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <p className={`text-sm font-semibold truncate ${isActive ? 'text-text-primary' : 'text-text-secondary'}`}>
                                                    {project.title}
                                                </p>
                                                <p className="text-xs text-text-secondary opacity-70 truncate mt-0.5">
                                                    {project.category} · {project.year}
                                                </p>
                                            </div>
                                            {isActive ? (
                                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: project.accentColor }} />
                                            ) : (
                                                <ChevronRight className="w-4 h-4 text-text-secondary opacity-40 flex-shrink-0" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Bottom safe area */}
                        <div className="mobile-safe-bottom" />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
