import { useState } from 'react';
import type { Project } from '../../types';
import { PROJECTS } from '../../data/projects';
import { ChevronDown, PanelLeft, PanelRight, Pencil, Zap, Box, Save, Lock, X, LogOut } from 'lucide-react';

// ── Vibe Coded Tools list ──────────────────────────────────────────────────────
const VIBE_TOOLS = [
  {
    id: 'vt-1',
    title: 'Oracle Kiosk Story',
    description: 'Among Us storytelling canvas',
    icon: '🎮',
    accentColor: '#C74B18',
  },
  {
    id: 'vt-2',
    title: 'Canvas Portfolio',
    description: 'This very site — Figma-style UX',
    icon: '🖼️',
    accentColor: '#7C5CFC',
  },
  {
    id: 'vt-3',
    title: 'Design Audit Bot',
    description: 'AI-powered heuristic checker',
    icon: '🤖',
    accentColor: '#10B981',
  },
  {
    id: 'vt-4',
    title: 'Color Contrast Lab',
    description: 'WCAG contrast ratio tester',
    icon: '🎨',
    accentColor: '#F59E0B',
  },
];

interface Props {
  selectedProject: Project;
  onSelectProject: (project: Project) => void;
  isEditing?: boolean;
  onToggleEdit?: (edit: boolean) => void;
  onExit?: () => void;
}

export default function LeftPanel({ selectedProject, onSelectProject, isEditing = false, onToggleEdit = () => { }, onExit }: Props) {
  const [activeTab, setActiveTab] = useState<'projects' | 'vibe-tools'>('projects');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleEditClick = () => {
    if (isEditing) {
      onToggleEdit(false);
    } else {
      setShowPassword(true);
      setError(false);
      setPassword('');
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin') {
      setShowPassword(false);
      onToggleEdit(true);
      setPassword('');
    } else {
      setError(true);
    }
  };

  if (isCollapsed) {
    return (
      <div className="bg-white border border-panel-border shadow-2xl shadow-black/5 rounded-2xl flex items-center p-2 pointer-events-auto transition-all">
        <button onClick={() => setIsCollapsed(false)} className="p-2 hover:bg-surface-1 rounded-xl text-text-secondary hover:text-text-primary transition-colors">
          <PanelRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full bg-white border border-panel-border shadow-2xl shadow-black/5 rounded-2xl flex-shrink-0 pointer-events-auto transition-all overflow-hidden"
      style={{ width: '260px' }}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between p-4">
        <div className="flex gap-3">
          <div className="pt-1">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 text-white shadow-sm"
              style={{ background: 'linear-gradient(135deg, #7C5CFC, #FF6B9D)' }}
            >
              SC
            </div>
          </div>
          <div className="pt-0.5">
            <div className="flex items-center gap-1 cursor-pointer">
              <span className="font-semibold text-sm text-text-primary">Sai Charan</span>
              <ChevronDown className="w-4 h-4 text-text-secondary" />
            </div>
            <p className="text-xs text-text-secondary mt-0.5">Product Designer</p>
          </div>
        </div>
        <button onClick={() => setIsCollapsed(true)} className="text-text-secondary hover:text-text-primary mt-1 p-1.5 hover:bg-surface-1 rounded-md transition-colors">
          <PanelLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Segment Control */}
      <div className="px-4 pb-4 border-b border-panel-border">
        <div className="flex bg-surface-1 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'projects'
              ? 'bg-white shadow-sm text-text-primary'
              : 'text-text-secondary hover:text-text-primary'
              }`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab('vibe-tools')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1 ${activeTab === 'vibe-tools'
              ? 'bg-white shadow-sm text-text-primary'
              : 'text-text-secondary hover:text-text-primary'
              }`}
          >
            <Zap className="w-3 h-3" />
            Vibe Coded
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'projects' ? (
          /* ── UX Projects list ── */
          <div className="space-y-1">
            {PROJECTS.map((project, idx) => {
              const isActive = selectedProject.id === project.id;
              return (
                <div
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className={`flex items-center gap-2.5 py-2 px-2.5 rounded-lg cursor-pointer transition-all ${isActive
                    ? 'bg-surface-2 shadow-sm border border-panel-border'
                    : 'hover:bg-surface-1 border border-transparent'
                    }`}
                >
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 font-mono font-medium"
                    style={{
                      background: isActive ? `${project.accentColor}25` : '#F3F4F6',
                      color: isActive ? project.accentColor : '#9CA3AF',
                      fontSize: '10px',
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold truncate ${isActive ? 'text-text-primary' : 'text-text-secondary'}`}>
                      {project.title}
                    </p>
                    <p className="text-[10px] truncate text-text-secondary opacity-80 mt-0.5">
                      {project.category}
                    </p>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: project.accentColor }} />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* ── Vibe Coded Tools list ── */
          <div className="space-y-1">
            {VIBE_TOOLS.map((tool) => (
              <div
                key={tool.id}
                className="flex items-center gap-2.5 py-2 px-2.5 rounded-lg border border-transparent hover:bg-surface-1 hover:border-panel-border cursor-pointer transition-all group"
              >
                <div
                  className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-sm"
                  style={{ background: `${tool.accentColor}18` }}
                >
                  {tool.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate text-text-secondary group-hover:text-text-primary transition-colors">
                    {tool.title}
                  </p>
                  <p className="text-[10px] truncate text-text-secondary opacity-70 mt-0.5">
                    {tool.description}
                  </p>
                </div>
                <div
                  className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: tool.accentColor }}
                >
                  <Box className="w-4 h-4" />
                </div>
              </div>
            ))}

            {/* Coming soon hint */}
            <div className="mt-4 px-2.5 py-3 rounded-lg border border-dashed border-panel-border flex items-center gap-2 opacity-60">
              <Zap className="w-3.5 h-3.5 text-accent-purple flex-shrink-0" />
              <p className="text-[10px] text-text-secondary">More tools coming soon…</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom — Edit Button */}
      <div className="p-4 border-t border-panel-border">
        {showPassword ? (
          <form onSubmit={handlePasswordSubmit} className="bg-surface-1 p-3 rounded-lg border border-panel-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
                <Lock className="w-3.5 h-3.5" />
                <span>Enter Password</span>
              </div>
              <button type="button" onClick={() => setShowPassword(false)} className="text-text-secondary hover:text-text-primary">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="Password..."
              className={`w-full bg-white border ${error ? 'border-red-500 focus:ring-red-500' : 'border-panel-border focus:border-accent-purple focus:ring-accent-purple'} rounded-md px-2.5 py-1.5 text-xs outline-none focus:ring-1`}
              autoFocus
            />
            {error && <p className="text-[10px] text-red-500 mt-1">Incorrect password</p>}
            <button type="submit" className="w-full mt-2 py-1.5 rounded-md bg-accent-purple text-white text-xs font-semibold hover:bg-opacity-90 transition-colors">
              Unlock Editor
            </button>
          </form>
        ) : (
          <button
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border transition-all group ${isEditing
              ? 'bg-accent-purple/10 border-accent-purple text-accent-purple hover:bg-accent-purple/20'
              : 'border-panel-border bg-surface-1 hover:bg-surface-2 hover:border-accent-purple/40'
              }`}
            onClick={handleEditClick}
          >
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">Save & Exit</span>
                </>
              ) : (
                <>
                  <Pencil className="w-3.5 h-3.5 text-text-secondary group-hover:text-accent-purple transition-colors" />
                  <span className="text-xs font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
                    Edit
                  </span>
                </>
              )}
            </div>
            {!isEditing && (
              <span className="text-[10px] text-text-secondary font-medium px-1.5 py-0.5 border border-panel-border rounded bg-white shadow-sm font-mono">
                ⌘E
              </span>
            )}
          </button>
        )}

        {/* Exit button — back to landing */}
        {onExit && (
          <button
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-panel-border bg-surface-1 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all group mt-2"
            onClick={onExit}
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5 text-text-secondary group-hover:text-red-500 transition-colors" />
              <span className="text-xs font-semibold text-text-secondary group-hover:text-red-600 transition-colors">
                Exit
              </span>
            </div>
            <span className="text-[10px] text-text-secondary font-medium px-1.5 py-0.5 border border-panel-border rounded bg-white shadow-sm font-mono">
              Esc
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
