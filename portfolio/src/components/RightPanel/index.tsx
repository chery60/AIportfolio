import { useState, useRef } from 'react';
import { Send, Link2, Twitter, Linkedin, MessageSquare, CheckCircle2, Trash2, Loader2, MessageSquareDashed } from 'lucide-react';
import type { Project, CanvasElement } from '../../types';
import { PROJECTS } from '../../data/projects';
import { useComments } from '../../hooks/useComments';
import { useReactions } from '../../hooks/useReactions';
import type { ActiveViewer } from '../../hooks/useRealtimeSession';
import { ShimmerButton } from '../ui/shimmer-button';
import { AnimatedList } from '../ui/animated-list';
import { useWebHaptics } from 'web-haptics/react';
import { SectionHeader } from '@/components/ui/executive';

interface Props {
  project: Project;
  selectedElement: CanvasElement | null;
  isEditMode?: boolean;
  activeViewers?: ActiveViewer[];
  onViewerClick?: (viewer: ActiveViewer) => void;
  localIdentity?: ActiveViewer | null;
}

export default function RightPanel({ project, isEditMode = false, activeViewers = [], onViewerClick, localIdentity }: Props) {
  const { trigger } = useWebHaptics({ debug: true });
  const { reactions, incrementReaction } = useReactions(project.id);
  const [contactState, setContactState] = useState<'idle' | 'form' | 'sent' | 'sending'>('idle');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const handleSendContact = async () => {
    setContactState('sending');
    try {
      await fetch("https://formsubmit.co/ajax/kc60488charan@gmail.com", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `New Portfolio Message from ${contactName}`,
          name: contactName,
          email: contactEmail,
          message: contactMessage,
          _template: 'box'
        })
      });
      setContactState('sent');
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setContactState('form');
      alert('Failed to send message. Please try again later.');
    }
  };

  // Comment state
  const [authorName, setAuthorName] = useState('');
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const commentsListRef = useRef<HTMLDivElement>(null);

  const { comments, loading, error, addComment, deleteComment, timeAgo } = useComments(project.id);

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
      className="noon-panel-light flex flex-col h-full rounded-[18px] flex-shrink-0 relative pointer-events-auto transition-all overflow-hidden"
      style={{ width: '280px' }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--exec-line)] bg-white/60 sticky top-0 z-10 flex-shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--exec-green)]" />
          <span className="text-xs font-semibold text-[var(--exec-ink)]">Engagement</span>
        </div>
      </div>

      {/* Scrollable body — only the outer wrapper scrolls for non-comment sections */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

        {/* Static top sections (no scroll needed individually) */}
        <div className="overflow-y-auto flex-shrink-0" style={{ maxHeight: '340px' }}>

          {/* Viewing Now */}
          <div className="p-4 border-b border-[var(--exec-line)]">
            <SectionTitle>VIEWING NOW</SectionTitle>
            <div className="flex items-center gap-2 mb-3 mt-2">
              <div className="flex -space-x-1.5">
                {activeViewers.slice(0, 5).map(v => {
                  const isMe = v.id === localIdentity?.id;
                  return (
                    <div
                      key={v.id}
                      title={isMe ? 'You' : `${v.name} — click to follow`}
                      onClick={() => !isMe && onViewerClick?.(v)}
                    className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-sm transition-transform ${isMe ? 'cursor-default' : 'cursor-pointer hover:scale-105'}`}
                      style={{ backgroundColor: v.color }}
                    >
                      {v.initials}
                    </div>
                  );
                })}
              </div>
              <span className="text-xs text-[var(--exec-muted)] font-medium pl-1">
                {activeViewers.length} {activeViewers.length === 1 ? 'viewing right now' : 'viewing right now'}
              </span>
            </div>
            <div className="space-y-1.5 mt-2">
              {activeViewers.map(v => {
                const isMe = v.id === localIdentity?.id;
                const viewerProject = PROJECTS.find(p => p.id === v.projectId);
                const isOnSameProject = v.projectId === project.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => !isMe && onViewerClick?.(v)}
                    title={isMe ? 'This is you' : 'Click to follow'}
                    className={`flex items-center gap-2 bg-white/58 px-2.5 py-1.5 rounded-[10px] border border-transparent transition-all ${isMe ? 'cursor-default' : 'cursor-pointer hover:bg-white hover:border-[var(--exec-line)] hover:shadow-sm'}`}
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-sm flex-shrink-0" style={{ backgroundColor: v.color }}>
                      {v.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[var(--exec-ink)] truncate leading-tight">
                        {isMe ? 'You' : v.name}
                      </p>
                      <p className="text-[10px] text-[var(--exec-muted)] truncate leading-tight mt-0.5">{v.location}</p>
                    </div>
                    {viewerProject && (
                      <span
                        className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap"
                        style={{
                          backgroundColor: isOnSameProject ? `${viewerProject.accentColor}22` : '#191a1b',
                          color: isOnSameProject ? viewerProject.accentColor : '#8B8DB0',
                        }}
                      >
                        {viewerProject.title.split(' ').slice(0, 2).join(' ')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Share Love */}
          <div className="p-4 border-b border-[var(--exec-line)]">
            <SectionTitle>REACT</SectionTitle>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {Object.entries(reactions).map(([emoji, count]) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="flex flex-col items-center justify-center py-2 bg-white/58 hover:bg-white rounded-[10px] border border-transparent hover:border-[var(--exec-line)] transition-all hover:scale-[1.02] active:scale-95 hover:shadow-sm"
                >
                  <span className="text-base mb-0.5 saturate-[0.75] opacity-85">{emoji}</span>
                  <span className="text-[10px] font-bold text-[var(--exec-muted)]">{count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── COMMENTS SECTION — fills remaining space with internal scroll ── */}
        <div className="flex-1 flex flex-col min-h-0 border-b border-[var(--exec-line)]">

          {/* Comment section header — sticky */}
          <div className="px-4 pt-4 pb-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <SectionTitle>COMMENTS</SectionTitle>
              {comments.length > 0 && (
                <span className="exec-count-pill">
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
                <Loader2 className="w-5 h-5 text-[var(--exec-muted)] animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-10 h-10 bg-white/70 rounded-xl flex items-center justify-center mb-3 border border-[var(--exec-line)]">
                  <MessageSquareDashed className="w-5 h-5 text-[var(--exec-muted)]" />
                </div>
                <p className="text-xs font-semibold text-[var(--exec-ink)] mb-1">No comments yet</p>
                <p className="text-[10px] text-[var(--exec-muted)] leading-relaxed max-w-[160px]">
                  Be the first to leave a thought below!
                </p>
              </div>
            ) : (
              <div className="pb-2 pt-1">
                <AnimatedList className="gap-2.5">
                  {comments.map(c => (
                    <div key={c.id} className="bg-white/58 p-2.5 rounded-[10px] border border-transparent relative group w-full hover:border-[var(--exec-line)] hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: c.color }}
                        >
                          {c.initials}
                        </div>
                        <span className="text-xs font-semibold text-[var(--exec-ink)] truncate">{c.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-[var(--exec-muted)] font-medium bg-white/70 px-1 rounded">
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
                    <p className="text-xs text-[var(--exec-muted)] leading-relaxed pl-5">{c.content}</p>
                  </div>
                  ))}
                </AnimatedList>
              </div>
            )}
          </div>

          {/* Sticky chat box — always visible at bottom of comment section */}
          <div className="px-4 pb-4 pt-2 flex-shrink-0 bg-white/62 border-t border-[var(--exec-line)] backdrop-blur-md">
            {/* Name input */}
            <input
              type="text"
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
              className="exec-input px-3 py-2 text-xs placeholder:text-[var(--exec-muted)] shadow-sm mb-1.5"
            />
            {/* Message textarea + send button */}
            <div className="relative">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Leave a comment… (⌘↵ to send)"
                maxLength={500}
                className="exec-input pl-3 pr-10 py-2.5 text-xs resize-none placeholder:text-[var(--exec-muted)] shadow-sm"
                rows={2}
              />
              <button
                onClick={handlePostComment}
                disabled={!canPost}
                className={`absolute right-2 bottom-2 p-1.5 rounded-[8px] transition-colors ${canPost ? 'bg-[var(--exec-accent)] text-white' : 'bg-white/70 text-[var(--exec-muted)] cursor-not-allowed'}`}
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
          <div className="p-4 border-b border-[var(--exec-line)]">
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
              <ShimmerButton
                onClick={() => { trigger('light'); setContactState('form'); }}
                className="w-full mt-3 py-2.5 rounded-lg transition-transform hover:scale-[1.02] shadow-md !px-0"
                background="var(--exec-blue)"
              >
                <span className="flex items-center justify-center gap-2 text-xs font-bold text-white relative z-10 w-full">
                  <MessageSquare className="w-4 h-4" />
                  Message Me
                </span>
              </ShimmerButton>
            )}

            {(contactState === 'form' || contactState === 'sending') && (
              <div className="mt-3 space-y-2.5 bg-white/58 p-3 rounded-xl border border-[var(--exec-line)] shadow-sm">
                <input value={contactName} onChange={e => setContactName(e.target.value)} type="text" placeholder="Your name" className="exec-input px-3 py-2 text-xs" />
                <input value={contactEmail} onChange={e => setContactEmail(e.target.value)} type="email" placeholder="Email address" className="exec-input px-3 py-2 text-xs" />
                <textarea value={contactMessage} onChange={e => setContactMessage(e.target.value)} placeholder="What's on your mind?" rows={3} className="exec-input px-3 py-2 text-xs resize-none" />
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setContactState('idle')}
                    className="flex-1 py-2 rounded-[9px] bg-white border border-[var(--exec-line)] text-xs font-semibold text-[var(--exec-ink)] hover:bg-white/70 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { trigger('success'); handleSendContact(); }}
                    disabled={!contactName.trim() || !contactMessage.trim() || contactState === 'sending'}
                    className="flex-1 py-2 rounded-[9px] text-white text-xs font-semibold flex flex-col justify-center items-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: 'var(--exec-blue)' }}
                  >
                    {contactState === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
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
  return <SectionHeader>{children}</SectionHeader>;
}

function ShareButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] bg-white/58 hover:bg-white border border-transparent hover:border-[var(--exec-line)] hover:shadow-sm transition-all text-[var(--exec-ink)] text-xs font-semibold"
    >
      <div className="text-text-secondary">{icon}</div>
      {label}
    </button>
  );
}
