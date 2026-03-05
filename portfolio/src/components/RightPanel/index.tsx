import { useState, useRef } from 'react';
import { Send, Link2, Twitter, Linkedin, MessageSquare, CheckCircle2, Trash2, Loader2, MessageSquareDashed } from 'lucide-react';
import type { Project, CanvasElement } from '../../types';
import { useComments } from '../../hooks/useComments';
import { useReactions } from '../../hooks/useReactions';
import type { ActiveViewer } from '../../hooks/useRealtimeSession';

interface Props {
  project: Project;
  selectedElement: CanvasElement | null;
  isEditMode?: boolean;
  activeViewers?: ActiveViewer[];
}

export default function RightPanel({ isEditMode = false, activeViewers = [] }: Props) {

  const { reactions, incrementReaction } = useReactions();
  const [contactState, setContactState] = useState<'idle' | 'form' | 'sent'>('idle');

  // Comment state
  const [authorName, setAuthorName] = useState('');
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const commentsListRef = useRef<HTMLDivElement>(null);

  const { comments, loading, error, addComment, deleteComment, timeAgo } = useComments();

  const handleReaction = (emoji: string) => {
    incrementReaction(emoji);
  };

  const handlePostComment = async () => {
    const trimmedName = authorName.trim();
    const trimmedText = newComment.trim();
    if (!trimmedName || !trimmedText || posting) return;

    setPosting(true);
    const ok = await addComment(trimmedName, trimmedText);
    setPosting(false);

    if (ok) {
      setNewComment('');
      // Keep author name for convenience
    }
  };

  const handleDeleteComment = async (id: string) => {
    setDeletingId(id);
    await deleteComment(id);
    setDeletingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handlePostComment();
    }
  };

  const canPost = authorName.trim().length > 0 && newComment.trim().length > 0 && !posting;

  return (
    <div
      className="flex flex-col h-full bg-white border border-panel-border shadow-2xl shadow-black/5 rounded-2xl flex-shrink-0 relative pointer-events-auto transition-all overflow-hidden"
      style={{ width: '280px' }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-panel-border bg-white sticky top-0 z-10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold text-text-primary">Engagement</span>
        </div>
      </div>

      {/* Scrollable body — only the outer wrapper scrolls for non-comment sections */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

        {/* Static top sections (no scroll needed individually) */}
        <div className="overflow-y-auto flex-shrink-0" style={{ maxHeight: '340px' }}>

          {/* Viewing Now */}
          <div className="p-4 border-b border-panel-border">
            <SectionTitle>VIEWING NOW</SectionTitle>
            <div className="flex items-center gap-2 mb-3 mt-2">
              <div className="flex -space-x-1.5">
                {activeViewers.slice(0, 5).map(v => (
                  <div key={v.id} className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-sm" style={{ backgroundColor: v.color }}>
                    {v.initials}
                  </div>
                ))}
              </div>
              <span className="text-xs text-text-secondary font-medium pl-1">
                {activeViewers.length} {activeViewers.length === 1 ? 'viewing right now' : 'viewing right now'}
              </span>
            </div>
            <div className="space-y-1.5 mt-2">
              {activeViewers.slice(0, 3).map(v => (
                <div key={v.id} className="flex items-center gap-2 bg-surface-1 px-2.5 py-1.5 rounded-md border border-transparent">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-sm" style={{ backgroundColor: v.color }}>
                    {v.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-primary truncate leading-tight">{v.name}</p>
                    <p className="text-[10px] text-text-secondary truncate leading-tight mt-0.5">{v.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Share Love */}
          <div className="p-4 border-b border-panel-border">
            <SectionTitle>SHARE LOVE</SectionTitle>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {Object.entries(reactions).map(([emoji, count]) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="flex flex-col items-center justify-center py-2 bg-surface-1 hover:bg-surface-2 rounded-lg border border-transparent hover:border-panel-border transition-all hover:scale-105 active:scale-95"
                >
                  <span className="text-lg mb-0.5">{emoji}</span>
                  <span className="text-[10px] font-bold text-text-secondary">{count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── COMMENTS SECTION — fills remaining space with internal scroll ── */}
        <div className="flex-1 flex flex-col min-h-0 border-b border-panel-border">

          {/* Comment section header — sticky */}
          <div className="px-4 pt-4 pb-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <SectionTitle>COMMENTS</SectionTitle>
              {comments.length > 0 && (
                <span className="text-[9px] font-bold text-text-secondary bg-surface-2 px-1.5 py-0.5 rounded-full">
                  {comments.length}
                </span>
              )}
            </div>
            {error && (
              <p className="text-[10px] text-red-500 mt-1">{error}</p>
            )}
          </div>

          {/* Scrollable comments list */}
          <div
            ref={commentsListRef}
            className="flex-1 overflow-y-auto px-4 min-h-0"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-text-secondary animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-10 h-10 bg-surface-1 rounded-xl flex items-center justify-center mb-3 border border-panel-border">
                  <MessageSquareDashed className="w-5 h-5 text-text-secondary" />
                </div>
                <p className="text-xs font-semibold text-text-primary mb-1">No comments yet</p>
                <p className="text-[10px] text-text-secondary leading-relaxed max-w-[160px]">
                  Be the first to leave a thought below!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 pb-2 pt-1">
                {comments.map(c => (
                  <div key={c.id} className="bg-surface-1 p-2.5 rounded-lg border border-transparent relative group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: c.color }}
                        >
                          {c.initials}
                        </div>
                        <span className="text-xs font-semibold text-text-primary truncate">{c.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-text-secondary font-medium bg-surface-2 px-1 rounded">
                          {timeAgo(c.created_at)}
                        </span>
                        {isEditMode && (
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            disabled={deletingId === c.id}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-50 text-red-400 hover:text-red-600 disabled:opacity-40"
                            title="Delete comment"
                          >
                            {deletingId === c.id
                              ? <Loader2 className="w-3 h-3 animate-spin" />
                              : <Trash2 className="w-3 h-3" />
                            }
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed pl-5">{c.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sticky chat box — always visible at bottom of comment section */}
          <div className="px-4 pb-4 pt-2 flex-shrink-0 bg-white border-t border-panel-border">
            {/* Name input */}
            <input
              type="text"
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
              className="w-full bg-white border border-panel-border rounded-lg px-3 py-2 text-xs text-text-primary outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple placeholder-text-secondary shadow-sm mb-1.5"
            />
            {/* Message textarea + send button */}
            <div className="relative">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Leave a comment… (⌘↵ to send)"
                maxLength={500}
                className="w-full bg-white border border-panel-border rounded-lg pl-3 pr-10 py-2.5 text-xs text-text-primary outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple resize-none placeholder-text-secondary shadow-sm"
                rows={2}
              />
              <button
                onClick={handlePostComment}
                disabled={!canPost}
                className={`absolute right-2 bottom-2 p-1.5 rounded-md transition-colors ${canPost ? 'bg-accent-purple text-white hover:bg-opacity-90' : 'bg-surface-2 text-text-secondary cursor-not-allowed'}`}
              >
                {posting
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Send className="w-3.5 h-3.5" />
                }
              </button>
            </div>
          </div>
        </div>

        {/* Bottom sections */}
        <div className="overflow-y-auto flex-shrink-0">

          {/* Share */}
          <div className="p-4 border-b border-panel-border">
            <SectionTitle>SHARE</SectionTitle>
            <div className="space-y-1.5 mt-2">
              <ShareButton icon={<Link2 className="w-3.5 h-3.5" />} label="Copy link" onClick={() => {
                navigator.clipboard?.writeText(window.location.href).catch(() => { });
              }} />
              <ShareButton icon={<Twitter className="w-3.5 h-3.5" />} label="Share on X" onClick={() => {
                window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`, '_blank');
              }} />
              <ShareButton icon={<Linkedin className="w-3.5 h-3.5" />} label="Share on LinkedIn" onClick={() => {
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');
              }} />
            </div>
          </div>

          {/* Get in Touch */}
          <div className="p-4">
            <SectionTitle>GET IN TOUCH</SectionTitle>
            {contactState === 'idle' && (
              <button
                onClick={() => setContactState('form')}
                className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold text-white transition-transform hover:scale-[1.02] shadow-md"
                style={{ background: 'linear-gradient(135deg, #7C5CFC, #FF6B9D)' }}
              >
                <MessageSquare className="w-4 h-4" />
                Message Me
              </button>
            )}

            {contactState === 'form' && (
              <div className="mt-3 space-y-2.5 bg-surface-1 p-3 rounded-xl border border-panel-border shadow-sm">
                <input type="text" placeholder="Your name" className="w-full bg-white border border-panel-border rounded-md px-3 py-2 text-xs outline-none focus:border-accent-purple" />
                <input type="email" placeholder="Email address" className="w-full bg-white border border-panel-border rounded-md px-3 py-2 text-xs outline-none focus:border-accent-purple" />
                <textarea placeholder="What's on your mind?" rows={3} className="w-full bg-white border border-panel-border rounded-md px-3 py-2 text-xs outline-none focus:border-accent-purple resize-none" />
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setContactState('idle')}
                    className="flex-1 py-2 rounded-md bg-white border border-panel-border text-xs font-semibold text-text-primary hover:bg-surface-1 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setContactState('sent')}
                    className="flex-1 py-2 rounded-md text-white text-xs font-semibold flex flex-col justify-center items-center shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #7C5CFC, #FF6B9D)' }}
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            {contactState === 'sent' && (
              <div className="mt-3 bg-green-50 border border-green-100 p-4 rounded-xl text-center flex flex-col items-center">
                <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                <p className="text-sm font-bold text-green-900">Message sent!</p>
                <p className="text-xs text-green-700 mt-1">I'll get back to you soon.</p>
                <button onClick={() => setContactState('idle')} className="mt-3 text-[10px] font-semibold text-green-600 hover:text-green-800 underline">Send another</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[10px] font-bold tracking-widest text-text-secondary uppercase">{children}</h3>;
}

function ShareButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md bg-surface-1 hover:bg-surface-2 border border-transparent hover:border-panel-border transition-all text-text-primary text-xs font-medium"
    >
      <div className="text-text-secondary">{icon}</div>
      {label}
    </button>
  );
}
