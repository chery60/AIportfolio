import type { Project } from '../types';
import { PROJECTS } from '../data/projects';

interface Props {
  currentProject: Project;
}

export default function TitleBar({ currentProject }: Props) {
  return (
    <div
      className="flex-shrink-0 flex items-center px-4 gap-3"
      style={{
        height: '44px',
        background: '#0E0F16',
        borderBottom: '1px solid #1A1B24',
      }}
    >
      {/* Logo / App name */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{
            background: 'linear-gradient(135deg, #7C5CFC, #FF6B9D)',
            color: 'white',
            fontSize: '10px',
          }}
        >
          DS
        </div>
        <span className="text-xs font-semibold" style={{ color: '#6B6D8A' }}>Dev Shah</span>
        <span style={{ color: '#2A2B3C' }}>/</span>
        <span className="text-xs font-medium text-white">{currentProject.title}</span>
      </div>

      {/* Center: breadcrumb page indicator */}
      <div className="flex-1 flex items-center justify-center gap-1.5">
        {PROJECTS.map(p => (
          <div
            key={p.id}
            className="transition-all duration-300"
            style={{
              width: p.id === currentProject.id ? '20px' : '6px',
              height: '4px',
              borderRadius: '9999px',
              background: p.id === currentProject.id ? p.accentColor : '#2A2B3C',
            }}
          />
        ))}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <StatusDot label="Available for work" />
        <div className="h-4 w-px" style={{ background: '#1E1F2C' }} />
        <span className="text-xs" style={{ color: '#4A4B6A' }}>Portfolio · 2024</span>
      </div>
    </div>
  );
}

function StatusDot({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative flex h-2 w-2">
        <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-40" />
        <div className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
      </div>
      <span className="text-xs" style={{ color: '#4A4B6A' }}>{label}</span>
    </div>
  );
}
