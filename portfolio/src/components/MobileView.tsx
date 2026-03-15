import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, MessageCircle, Grid2X2, Gamepad2 } from 'lucide-react';
import { Dock, DockIcon, DOCK_HEIGHT } from './ui/dock';
import { SmoothCursor } from './ui/smooth-cursor';
import MobileHomeTab from './MobileHomeTab';
import MobileProjectsTab from './MobileProjectsTab';
import MobileGameTab from './MobileGameTab';
import MobileChatPanel from './MobileChatPanel';
import MobileCanvasView from './MobileCanvasView';
import type { Project } from '../types';
import type { ActiveViewer } from '../hooks/useRealtimeSession';

type Tab = 'home' | 'projects' | 'game';

interface Props {
  activeViewers: ActiveViewer[];
}

export default function MobileView({ activeViewers }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setIsChatOpen(false);
  };

  const handleBack = () => {
    setSelectedProject(null);
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setIsChatOpen(false);
  };

  const handleChatToggle = () => {
    setIsChatOpen(prev => !prev);
  };

  return (
    <div className="fixed inset-0 bg-[#0A0B0F] flex flex-col">
      {/* Custom cursor — self-disables on real touch devices */}
      <SmoothCursor />
      {/* ── Content Area ─────────────────────────────────────── */}
      <div
        className="flex-1 overflow-hidden"
        style={{
          paddingBottom: selectedProject
            ? 0
            : `calc(${DOCK_HEIGHT}px + env(safe-area-inset-bottom, 0px))`,
        }}
      >
        <AnimatePresence mode="wait">
          {selectedProject ? (
            <motion.div
              key="detail"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="h-full"
            >
              <MobileCanvasView
                project={selectedProject}
                onSelectProject={handleSelectProject}
                onBack={handleBack}
                activeViewers={activeViewers}
              />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'home' ? (
                <MobileHomeTab />
              ) : activeTab === 'projects' ? (
                <MobileProjectsTab onSelectProject={handleSelectProject} />
              ) : (
                <MobileGameTab />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Chat Overlay ─────────────────────────────────────── */}
      <AnimatePresence>
        {isChatOpen && (
          <MobileChatPanel
            dockHeight={DOCK_HEIGHT}
            onClose={() => setIsChatOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Bottom Dock ──────────────────────────────────────── */}
      {!selectedProject && (
        <Dock>
          <DockIcon
            icon={<Home className="w-5 h-5" />}
            label="Home"
            isActive={activeTab === 'home' && !isChatOpen}
            onClick={() => handleTabChange('home')}
          />
          <DockIcon
            icon={<MessageCircle className="w-5 h-5" />}
            label="Chat"
            isActive={isChatOpen}
            onClick={handleChatToggle}
          />
          <DockIcon
            icon={<Grid2X2 className="w-5 h-5" />}
            label="Projects"
            isActive={activeTab === 'projects' && !isChatOpen}
            onClick={() => handleTabChange('projects')}
          />
          <DockIcon
            icon={<Gamepad2 className="w-5 h-5" />}
            label="Game"
            isActive={activeTab === 'game' && !isChatOpen}
            onClick={() => handleTabChange('game')}
          />
        </Dock>
      )}
    </div>
  );
}
