import { useState } from 'react';
import { Send, Link2, Twitter, Linkedin, MessageSquare, CheckCircle2 } from 'lucide-react';
import type { Project, CanvasElement } from '../../types';

interface Props {
  project: Project;
  selectedElement: CanvasElement | null;
}

const VIEWERS = [
  { id: 'v1', name: 'Alex M.', initials: 'AM', color: '#7C5CFC', location: 'San Francisco' },
  { id: 'v2', name: 'Priya S.', initials: 'PS', color: '#FF6B9D', location: 'London' },
  { id: 'v3', name: 'Sam W.', initials: 'SW', color: '#34D399', location: 'New York' },
];

const INITIAL_COMMENTS = [
  { id: 'c1', author: 'Alex M.', initials: 'AM', color: '#7C5CFC', text: 'This structure is incredibly clean! How long did the audit take?', time: '2m' },
  { id: 'c2', author: 'Priya S.', initials: 'PS', color: '#FF6B9D', text: 'Love the use of a spatial canvas for presenting.', time: '15m' },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function RightPanel(_props: Props) {

  const [reactions, setReactions] = useState<Record<string, number>>({ '❤️': 12, '🔥': 7, '🎯': 4, '💡': 3 });
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [newComment, setNewComment] = useState('');
  const [contactState, setContactState] = useState<'idle' | 'form' | 'sent'>('idle');

  const handleReaction = (emoji: string) => {
    setReactions(prev => ({ ...prev, [emoji]: prev[emoji] + 1 }));
  };

  const handlePostComment = () => {
    if (!newComment.trim()) return;
    setComments([{
      id: Date.now().toString(),
      author: 'Guest',
      initials: 'GU',
      color: '#22D3EE',
      text: newComment,
      time: 'Just now'
    }, ...comments]);
    setNewComment('');
  };

  return (
    <div
      className="flex flex-col h-full bg-white border border-panel-border shadow-2xl shadow-black/5 rounded-2xl flex-shrink-0 relative pointer-events-auto transition-all overflow-hidden"
      style={{ width: '280px' }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-panel-border bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold text-text-primary">Engagement</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-16">

        {/* Viewing Now */}
        <div className="p-4 border-b border-panel-border">
          <SectionTitle>VIEWING NOW</SectionTitle>
          <div className="flex items-center gap-2 mb-3 mt-2">
            <div className="flex -space-x-1.5">
              {VIEWERS.map(v => (
                <div key={v.id} className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-sm" style={{ backgroundColor: v.color }}>
                  {v.initials}
                </div>
              ))}
            </div>
            <span className="text-xs text-text-secondary font-medium pl-1">3 viewing right now</span>
          </div>
          <div className="space-y-1.5 mt-2">
            {VIEWERS.slice(0, 2).map(v => (
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

        {/* Comments */}
        <div className="p-4 border-b border-panel-border">
          <SectionTitle>COMMENTS</SectionTitle>
          <div className="space-y-3 mt-3 mb-4">
            {comments.map(c => (
              <div key={c.id} className="bg-surface-1 p-2.5 rounded-lg border border-transparent relative group">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white" style={{ backgroundColor: c.color }}>
                      {c.initials}
                    </div>
                    <span className="text-xs font-semibold text-text-primary">{c.author}</span>
                  </div>
                  <span className="text-[9px] text-text-secondary font-medium bg-surface-2 px-1 rounded">{c.time}</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed pl-5.5">{c.text}</p>
              </div>
            ))}
          </div>

          <div className="relative mt-2">
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Leave a comment..."
              className="w-full bg-white border border-panel-border rounded-lg pl-3 pr-10 py-2.5 text-xs text-text-primary outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple resize-none placeholder-text-secondary shadow-sm"
              rows={2}
            />
            <button
              onClick={handlePostComment}
              className={`absolute right-2 bottom-2 p-1.5 rounded-md transition-colors ${newComment.trim() ? 'bg-accent-purple text-white hover:bg-opacity-90' : 'bg-surface-2 text-text-secondary cursor-not-allowed'}`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Share */}
        <div className="p-4 border-b border-panel-border">
          <SectionTitle>SHARE</SectionTitle>
          <div className="space-y-1.5 mt-2">
            <ShareButton icon={<Link2 className="w-3.5 h-3.5" />} label="Copy link" onClick={() => { }} />
            <ShareButton icon={<Twitter className="w-3.5 h-3.5" />} label="Share on X" onClick={() => { }} />
            <ShareButton icon={<Linkedin className="w-3.5 h-3.5" />} label="Share on LinkedIn" onClick={() => { }} />
          </div>
        </div>

        {/* Get in Touch */}
        <div className="p-4 border-b border-panel-border">
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
