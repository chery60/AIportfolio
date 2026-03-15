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

const DARK_BG = '#111218';
const SURFACE = 'rgba(255,255,255,0.05)';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT_PRIMARY = '#F0F0FF';
const TEXT_SECONDARY = 'rgba(240,240,255,0.45)';
const TEXT_MUTED = 'rgba(240,240,255,0.25)';

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
        if (deletingId) return;
        setDeletingId(id);
        await deleteComment(id);
        setDeletingId(null);
    };

    const canPost = authorName.trim().length > 0 && newComment.trim().length > 0 && !posting;

    if (!isOpen) return null;

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: 'comments', label: 'Comments', icon: <MessageSquare className="w-3.5 h-3.5" /> },
        { id: 'viewers', label: 'Viewers', icon: <Users className="w-3.5 h-3.5" /> },
        { id: 'share', label: 'Share', icon: <Share2 className="w-3.5 h-3.5" /> },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
                        onClick={onClose}
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col"
                        style={{
                            background: DARK_BG,
                            borderRadius: '20px 20px 0 0',
                            border: `1px solid ${BORDER}`,
                            borderBottom: 'none',
                            maxHeight: '82vh',
                        }}
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div
                                className="w-10 h-1 rounded-full"
                                style={{ background: 'rgba(255,255,255,0.15)' }}
                            />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 pt-2 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div
                                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white"
                                    style={{ background: `linear-gradient(135deg, ${project.accentColor}, ${project.accentColor}80)` }}
                                >
                                    {project.title.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-xs font-bold" style={{ color: TEXT_PRIMARY }}>{project.title}</p>
                                    <p className="text-[10px]" style={{ color: TEXT_MUTED }}>Engagement</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                                style={{ background: SURFACE, color: TEXT_SECONDARY }}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Reactions row */}
                        <div className="px-5 pb-3">
                            <div className="flex gap-2 overflow-x-auto mobile-no-scrollbar pb-1">
                                {Object.entries(reactions).map(([emoji, count]) => (
                                    <button
                                        key={emoji}
                                        onClick={() => incrementReaction(emoji)}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-full flex-shrink-0 transition-all active:scale-95"
                                        style={{
                                            background: count > 0 ? `${project.accentColor}22` : SURFACE,
                                            border: `1px solid ${count > 0 ? project.accentColor + '40' : BORDER}`,
                                        }}
                                    >
                                        <span className="text-base leading-none">{emoji}</span>
                                        <span className="text-xs font-bold" style={{ color: count > 0 ? project.accentColor : TEXT_SECONDARY }}>
                                            {count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div
                            className="flex px-5"
                            style={{ borderBottom: `1px solid ${BORDER}` }}
                        >
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all border-b-2"
                                    style={{
                                        color: activeTab === tab.id ? TEXT_PRIMARY : TEXT_SECONDARY,
                                        borderBottomColor: activeTab === tab.id ? project.accentColor : 'transparent',
                                    }}
                                >
                                    {tab.icon}
                                    {tab.label}
                                    {tab.id === 'comments' && comments.length > 0 && (
                                        <span
                                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                            style={{ background: `${project.accentColor}25`, color: project.accentColor }}
                                        >
                                            {comments.length}
                                        </span>
                                    )}
                                    {tab.id === 'viewers' && (
                                        <span
                                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                            style={{ background: SURFACE, color: TEXT_SECONDARY }}
                                        >
                                            {activeViewers.length}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="overflow-y-auto flex-1">

                            {/* Comments Tab */}
                            {activeTab === 'comments' && (
                                <div className="flex flex-col h-full">
                                    {error && (
                                        <p className="text-xs text-red-400 px-5 pt-3">{error}</p>
                                    )}

                                    <div ref={commentsListRef} className="px-5 py-3 overflow-y-auto flex-1">
                                        {loading ? (
                                            <div className="flex items-center justify-center py-10">
                                                <Loader2 className="w-5 h-5 animate-spin" style={{ color: TEXT_SECONDARY }} />
                                            </div>
                                        ) : comments.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                                <div
                                                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                                                    style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
                                                >
                                                    <MessageSquareDashed className="w-5 h-5" style={{ color: TEXT_SECONDARY }} />
                                                </div>
                                                <p className="text-sm font-semibold mb-1" style={{ color: TEXT_PRIMARY }}>
                                                    No comments yet
                                                </p>
                                                <p className="text-xs leading-relaxed max-w-[200px]" style={{ color: TEXT_MUTED }}>
                                                    Be the first to leave a thought!
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2.5">
                                                {comments.map(c => (
                                                    <div
                                                        key={c.id}
                                                        className="p-3 rounded-2xl relative"
                                                        style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0"
                                                                    style={{ backgroundColor: c.color }}
                                                                >
                                                                    {c.initials}
                                                                </div>
                                                                <span className="text-xs font-semibold truncate" style={{ color: TEXT_PRIMARY }}>
                                                                    {c.author}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span
                                                                    className="text-[9px] font-medium px-1.5 py-0.5 rounded"
                                                                    style={{ background: 'rgba(255,255,255,0.07)', color: TEXT_MUTED }}
                                                                >
                                                                    {timeAgo(c.created_at)}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleDeleteComment(c.id)}
                                                                    disabled={deletingId === c.id}
                                                                    className="p-0.5 rounded transition-colors disabled:opacity-40"
                                                                    style={{ color: 'rgba(239,68,68,0.6)' }}
                                                                >
                                                                    {deletingId === c.id
                                                                        ? <Loader2 className="w-3 h-3 animate-spin" />
                                                                        : <Trash2 className="w-3 h-3" />
                                                                    }
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs leading-relaxed pl-7" style={{ color: TEXT_SECONDARY }}>
                                                            {c.content}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Add Comment */}
                                    <div
                                        className="px-5 pb-5 pt-3"
                                        style={{ borderTop: `1px solid ${BORDER}` }}
                                    >
                                        <input
                                            type="text"
                                            value={authorName}
                                            onChange={e => setAuthorName(e.target.value)}
                                            placeholder="Your name"
                                            maxLength={50}
                                            className="w-full rounded-xl px-3 py-2.5 text-xs outline-none mb-2 transition-colors"
                                            style={{
                                                background: SURFACE,
                                                border: `1px solid ${BORDER}`,
                                                color: TEXT_PRIMARY,
                                            }}
                                        />
                                        <div className="relative">
                                            <textarea
                                                value={newComment}
                                                onChange={e => setNewComment(e.target.value)}
                                                placeholder="Leave a comment…"
                                                maxLength={500}
                                                className="w-full rounded-xl pl-3 pr-10 py-2.5 text-xs outline-none resize-none transition-colors"
                                                style={{
                                                    background: SURFACE,
                                                    border: `1px solid ${BORDER}`,
                                                    color: TEXT_PRIMARY,
                                                }}
                                                rows={2}
                                            />
                                            <button
                                                onClick={handlePostComment}
                                                disabled={!canPost}
                                                className="absolute right-2 bottom-2.5 p-1.5 rounded-lg transition-colors"
                                                style={{
                                                    background: canPost ? project.accentColor : 'rgba(255,255,255,0.08)',
                                                    color: canPost ? 'white' : TEXT_MUTED,
                                                }}
                                            >
                                                {posting
                                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    : <Send className="w-3.5 h-3.5" />
                                                }
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
                                                <div
                                                    key={v.id}
                                                    className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
                                                    style={{
                                                        backgroundColor: v.color,
                                                        border: `2px solid ${DARK_BG}`,
                                                    }}
                                                >
                                                    {v.initials}
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-xs font-medium" style={{ color: TEXT_SECONDARY }}>
                                            {activeViewers.length} viewing right now
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {activeViewers.map(v => (
                                            <div
                                                key={v.id}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl"
                                                style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
                                            >
                                                <div
                                                    className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                                                    style={{ backgroundColor: v.color }}
                                                >
                                                    {v.initials}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold truncate" style={{ color: TEXT_PRIMARY }}>
                                                        {v.name}
                                                    </p>
                                                    <p className="text-[10px] truncate mt-0.5" style={{ color: TEXT_MUTED }}>
                                                        {v.location}
                                                    </p>
                                                </div>
                                                <div
                                                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                    style={{ background: '#10B981' }}
                                                />
                                            </div>
                                        ))}
                                        {activeViewers.length === 0 && (
                                            <div className="py-8 text-center">
                                                <p className="text-xs" style={{ color: TEXT_MUTED }}>No active viewers right now</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Share Tab */}
                            {activeTab === 'share' && (
                                <div className="px-5 py-4 space-y-2">
                                    {[
                                        {
                                            icon: <Link2 className="w-4 h-4" />,
                                            label: 'Copy link',
                                            action: () => navigator.clipboard?.writeText(window.location.href).catch(() => { }),
                                        },
                                        {
                                            icon: <Twitter className="w-4 h-4" />,
                                            label: 'Share on X',
                                            action: () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`, '_blank'),
                                        },
                                        {
                                            icon: <Linkedin className="w-4 h-4" />,
                                            label: 'Share on LinkedIn',
                                            action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank'),
                                        },
                                    ].map(item => (
                                        <button
                                            key={item.label}
                                            onClick={item.action}
                                            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-left"
                                            style={{
                                                background: SURFACE,
                                                border: `1px solid ${BORDER}`,
                                                color: TEXT_PRIMARY,
                                            }}
                                        >
                                            <span style={{ color: TEXT_SECONDARY }}>{item.icon}</span>
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </button>
                                    ))}
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
