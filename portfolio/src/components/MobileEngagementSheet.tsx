import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Link2, Twitter, Linkedin, MessageSquare, Trash2, Loader2, MessageSquareDashed, Users, Share2 } from 'lucide-react';
import type { Project } from '../types';
import { useComments } from '../hooks/useComments';
import { useReactions } from '../hooks/useReactions';
import type { ActiveViewer } from '../hooks/useRealtimeSession';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    project: Project;
    activeViewers: ActiveViewer[];
}

type Tab = 'comments' | 'viewers' | 'share';

export default function MobileEngagementSheet({ isOpen, onClose, project, activeViewers }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('comments');
    const { reactions, incrementReaction } = useReactions(project.id);
    const { comments, loading, error, addComment, deleteComment, timeAgo } = useComments(project.id);
    const [authorName, setAuthorName] = useState('');
    const [newComment, setNewComment] = useState('');
    const [posting, setPosting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const commentsListRef = useRef<HTMLDivElement>(null);

    const handlePostComment = async () => {
        const trimmedName = authorName.trim();
        const trimmedText = newComment.trim();
        if (!trimmedName || !trimmedText || posting) return;
        setPosting(true);
        const ok = await addComment(trimmedName, trimmedText);
        setPosting(false);
        if (ok) setNewComment('');
    };

    const handleDeleteComment = async (id: string) => {
        setDeletingId(id);
        await deleteComment(id);
        setDeletingId(null);
    };

    const canPost = authorName.trim().length > 0 && newComment.trim().length > 0 && !posting;

    if (!isOpen) return null;

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: 'comments', label: 'Comments', icon: <MessageSquare className="w-4 h-4" /> },
        { id: 'viewers', label: 'Viewers', icon: <Users className="w-4 h-4" /> },
        { id: 'share', label: 'Share', icon: <Share2 className="w-4 h-4" /> },
    ];

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
                        style={{ maxHeight: '80vh' }}
                    >
                        <div className="bottom-sheet-handle" />

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 pt-2 pb-3">
                            <h3 className="text-sm font-bold text-text-primary">Engagement</h3>
                            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-1 text-text-secondary hover:text-text-primary transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Reactions */}
                        <div className="px-5 pb-3">
                            <div className="flex gap-2 overflow-x-auto mobile-no-scrollbar pb-1">
                                {Object.entries(reactions).map(([emoji, count]) => (
                                    <button
                                        key={emoji}
                                        onClick={() => incrementReaction(emoji)}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-surface-1 hover:bg-surface-2 rounded-full border border-transparent hover:border-panel-border transition-all active:scale-95 flex-shrink-0"
                                    >
                                        <span className="text-base">{emoji}</span>
                                        <span className="text-xs font-bold text-text-secondary">{count}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-panel-border px-5">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all border-b-2 ${activeTab === tab.id
                                        ? 'text-accent-purple border-accent-purple'
                                        : 'text-text-secondary border-transparent hover:text-text-primary'
                                        }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                    {tab.id === 'comments' && comments.length > 0 && (
                                        <span className="text-[9px] font-bold bg-surface-2 px-1.5 py-0.5 rounded-full">{comments.length}</span>
                                    )}
                                    {tab.id === 'viewers' && (
                                        <span className="text-[9px] font-bold bg-surface-2 px-1.5 py-0.5 rounded-full">{activeViewers.length}</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="overflow-y-auto" style={{ maxHeight: '50vh' }}>
                            {/* Comments Tab */}
                            {activeTab === 'comments' && (
                                <div className="flex flex-col">
                                    {error && <p className="text-xs text-red-500 px-5 pt-3">{error}</p>}

                                    <div ref={commentsListRef} className="px-5 py-3 overflow-y-auto" style={{ maxHeight: '35vh' }}>
                                        {loading ? (
                                            <div className="flex items-center justify-center py-8">
                                                <Loader2 className="w-5 h-5 text-text-secondary animate-spin" />
                                            </div>
                                        ) : comments.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                                <div className="w-10 h-10 bg-surface-1 rounded-xl flex items-center justify-center mb-3 border border-panel-border">
                                                    <MessageSquareDashed className="w-5 h-5 text-text-secondary" />
                                                </div>
                                                <p className="text-xs font-semibold text-text-primary mb-1">No comments yet</p>
                                                <p className="text-[10px] text-text-secondary leading-relaxed max-w-[200px]">
                                                    Be the first to leave a thought!
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2.5">
                                                {comments.map(c => (
                                                    <div key={c.id} className="bg-surface-1 p-3 rounded-xl border border-transparent relative group">
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0" style={{ backgroundColor: c.color }}>
                                                                    {c.initials}
                                                                </div>
                                                                <span className="text-xs font-semibold text-text-primary truncate">{c.author}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[9px] text-text-secondary font-medium bg-surface-2 px-1.5 rounded">{timeAgo(c.created_at)}</span>
                                                                <button
                                                                    onClick={() => handleDeleteComment(c.id)}
                                                                    disabled={deletingId === c.id}
                                                                    className="p-0.5 rounded hover:bg-red-50 text-red-400 hover:text-red-600 disabled:opacity-40 transition-colors"
                                                                >
                                                                    {deletingId === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-text-secondary leading-relaxed pl-7">{c.content}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Add Comment */}
                                    <div className="px-5 pb-4 pt-2 border-t border-panel-border">
                                        <input
                                            type="text"
                                            value={authorName}
                                            onChange={e => setAuthorName(e.target.value)}
                                            placeholder="Your name"
                                            maxLength={50}
                                            className="w-full bg-white border border-panel-border rounded-lg px-3 py-2.5 text-xs text-text-primary outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple placeholder-text-secondary shadow-sm mb-2"
                                        />
                                        <div className="relative">
                                            <textarea
                                                value={newComment}
                                                onChange={e => setNewComment(e.target.value)}
                                                placeholder="Leave a comment…"
                                                maxLength={500}
                                                className="w-full bg-white border border-panel-border rounded-lg pl-3 pr-10 py-2.5 text-xs text-text-primary outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple resize-none placeholder-text-secondary shadow-sm"
                                                rows={2}
                                            />
                                            <button
                                                onClick={handlePostComment}
                                                disabled={!canPost}
                                                className={`absolute right-2 bottom-2.5 p-1.5 rounded-md transition-colors ${canPost ? 'bg-accent-purple text-white hover:bg-opacity-90' : 'bg-surface-2 text-text-secondary cursor-not-allowed'}`}
                                            >
                                                {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Viewers Tab */}
                            {activeTab === 'viewers' && (
                                <div className="px-5 py-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="flex -space-x-2">
                                            {activeViewers.slice(0, 5).map(v => (
                                                <div key={v.id} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-sm" style={{ backgroundColor: v.color }}>
                                                    {v.initials}
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-xs text-text-secondary font-medium">
                                            {activeViewers.length} viewing right now
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {activeViewers.map(v => (
                                            <div key={v.id} className="flex items-center gap-3 bg-surface-1 px-3 py-2.5 rounded-xl">
                                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm" style={{ backgroundColor: v.color }}>
                                                    {v.initials}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-text-primary truncate">{v.name}</p>
                                                    <p className="text-[10px] text-text-secondary truncate mt-0.5">{v.location}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Share Tab */}
                            {activeTab === 'share' && (
                                <div className="px-5 py-4 space-y-2">
                                    <button
                                        onClick={() => navigator.clipboard?.writeText(window.location.href).catch(() => { })}
                                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-surface-1 hover:bg-surface-2 border border-transparent hover:border-panel-border transition-all text-text-primary text-sm font-medium"
                                    >
                                        <Link2 className="w-4 h-4 text-text-secondary" />
                                        Copy link
                                    </button>
                                    <button
                                        onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-surface-1 hover:bg-surface-2 border border-transparent hover:border-panel-border transition-all text-text-primary text-sm font-medium"
                                    >
                                        <Twitter className="w-4 h-4 text-text-secondary" />
                                        Share on X
                                    </button>
                                    <button
                                        onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-surface-1 hover:bg-surface-2 border border-transparent hover:border-panel-border transition-all text-text-primary text-sm font-medium"
                                    >
                                        <Linkedin className="w-4 h-4 text-text-secondary" />
                                        Share on LinkedIn
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mobile-safe-bottom" />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
