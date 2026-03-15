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
                        className="fixed inset-0 z-40"
                        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50"
                        style={{
                            background: '#111218',
                            borderRadius: '20px 20px 0 0',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderBottom: 'none',
                            maxHeight: '75vh',
                        }}
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
                        </div>

                        {/* Header */}
                        <div
                            className="flex items-center justify-between px-5 py-3"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                        >
                            <h3 className="text-sm font-bold" style={{ color: '#F0F0FF' }}>Switch Project</h3>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(240,240,255,0.5)' }}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Project List */}
                        <div className="px-4 py-3 overflow-y-auto" style={{ maxHeight: '55vh' }}>
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
                                            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all"
                                            style={{
                                                background: isActive ? `${project.accentColor}18` : 'rgba(255,255,255,0.04)',
                                                border: `1px solid ${isActive ? project.accentColor + '35' : 'rgba(255,255,255,0.06)'}`,
                                            }}
                                        >
                                            <div
                                                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-mono font-bold text-sm"
                                                style={{
                                                    background: isActive ? `${project.accentColor}25` : 'rgba(255,255,255,0.07)',
                                                    color: isActive ? project.accentColor : 'rgba(240,240,255,0.35)',
                                                }}
                                            >
                                                {String(idx + 1).padStart(2, '0')}
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <p
                                                    className="text-sm font-semibold truncate"
                                                    style={{ color: isActive ? '#F0F0FF' : 'rgba(240,240,255,0.6)' }}
                                                >
                                                    {project.title}
                                                </p>
                                                <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(240,240,255,0.3)' }}>
                                                    {project.category} · {project.year}
                                                </p>
                                            </div>
                                            {isActive ? (
                                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: project.accentColor }} />
                                            ) : (
                                                <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(240,240,255,0.2)' }} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mobile-safe-bottom" />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
