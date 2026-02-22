import { useState } from 'react';
import type { Project } from '../../types';
import { PROJECTS } from '../../data/projects';
import { ChevronDown, Search, Layers, PanelLeft, PanelRight } from 'lucide-react';

interface Props {
  selectedProject: Project;
  onSelectProject: (project: Project) => void;
}

export default function LeftPanel({ selectedProject, onSelectProject }: Props) {
  const [activeTab, setActiveTab] = useState<'file' | 'assets'>('file');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredProjects = PROJECTS.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* Tabs */}
      <div className="px-4 pb-4 border-b border-panel-border">
        <div className="flex bg-surface-1 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'file' ? 'bg-white shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
          >
            Pages
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'assets' ? 'bg-white shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
          >
            Assets
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'file' ? (
          <>
            <div className="flex items-center gap-2 mb-3 text-text-primary">
              <Layers className="w-4 h-4" />
              <span className="text-xs font-bold">Projects</span>
            </div>

            {/* List of Projects */}
            <div className="space-y-1">
              {filteredProjects.map((project, idx) => {
                const isActive = selectedProject.id === project.id;
                return (
                  <div
                    key={project.id}
                    onClick={() => onSelectProject(project)}
                    className={`flex items-center gap-2.5 py-2 px-2.5 rounded-lg cursor-pointer transition-all ${isActive ? 'bg-surface-2 shadow-sm border border-panel-border' : 'hover:bg-surface-1 border border-transparent'
                      }`}
                  >
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0 font-mono font-medium"
                      style={{
                        background: isActive ? `${project.accentColor}25` : '#F3F4F6',
                        color: isActive ? project.accentColor : '#9CA3AF',
                        fontSize: '10px'
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
          </>
        ) : (
          <div className="flex justify-center items-center h-full text-text-secondary text-xs">
            Assets View
          </div>
        )}
      </div>

      {/* Search */}
      <div className="p-4 border-t border-panel-border">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Find project"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-12 py-2 text-xs rounded-lg outline-none border border-panel-border bg-white placeholder-text-secondary text-text-primary focus:border-accent-purple focus:ring-1 focus:ring-accent-purple transition-shadow"
          />
          <span className="absolute right-3 text-[10px] text-text-secondary font-medium px-1.5 py-0.5 border border-panel-border rounded bg-surface-0 shadow-sm">Ctrl + F</span>
        </div>
      </div>
    </div>
  );
}
