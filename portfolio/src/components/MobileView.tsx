import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, MessageCircle, Grid2X2, Gamepad2 } from 'lucide-react';
import { Dock, DockIcon, DOCK_HEIGHT } from './ui/dock';
import { SmoothCursor } from './ui/smooth-cursor';
import PixelBangaloreBackground from './PixelBangaloreBackground';
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
    <div className="fixed inset-0 bg-[#08090a] flex flex-col overflow-hidden">
      {!selectedProject && (
        <>
          <PixelBangaloreBackground className="z-0 opacity-75 brightness-[0.72] saturate-[0.86]" />
          <div className="pointer-events-none fixed inset-0 z-[1] bg-[linear-gradient(180deg,rgba(0,0,0,0.58)_0%,rgba(0,0,0,0.34)_32%,rgba(0,0,0,0.5)_62%,rgba(0,0,0,0.82)_100%)]" />
          <div className="pointer-events-none fixed inset-0 z-[2] bg-[radial-gradient(circle_at_34%_36%,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.42)_60%,rgba(0,0,0,0.72)_100%)]" />
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-44 bg-[linear-gradient(180deg,rgba(8,9,10,0)_0%,rgba(8,9,10,0.9)_48%,rgba(8,9,10,1)_100%)]" />
        </>
      )}

      {/* Custom cursor — self-disables on real touch devices */}
      <SmoothCursor />
      {/* ── Content Area ─────────────────────────────────────── */}
      <div
        className="relative z-10 flex-1 overflow-hidden"
        style={{
          marginBottom: selectedProject ? 0 : `calc(${DOCK_HEIGHT + 24}px + env(safe-area-inset-bottom, 0px))`,
        }}
      >
        <AnimatePresence mode="wait">
          {selectedProject ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
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

      {/* ── Footer (transparent) + floating Dock ───────────────── */}
      {!selectedProject && (
        <footer className="fixed bottom-0 left-0 right-0 z-50 pt-4 pb-6 flex justify-center pointer-events-none mobile-safe-bottom bg-transparent">
          <div className="pointer-events-auto bg-transparent">
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
          </div>
        </footer>
      )}
    </div>
  );
}
