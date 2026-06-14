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
        background: '#0f1011',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Logo / App name */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{
            background: '#5e6ad2',
            color: 'white',
            fontSize: '10px',
          }}
        >
          DS
        </div>
        <span className="text-xs font-semibold" style={{ color: '#8a8f98' }}>Dev Shah</span>
        <span style={{ color: '#62666d' }}>/</span>
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
              background: p.id === currentProject.id ? p.accentColor : '#28282c',
            }}
          />
        ))}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs" style={{ color: '#62666d' }}>Portfolio · 2024</span>
      </div>
    </div>
  );
}
