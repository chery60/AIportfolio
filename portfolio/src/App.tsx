import { useState, useRef, useCallback } from 'react';
import type { Project } from './types';
import { PROJECTS } from './data/projects';
import LeftPanel from './components/LeftPanel';
import Canvas, { type CanvasControlsRef } from './components/Canvas';
import RightPanel from './components/RightPanel';
import BottomToolbar from './components/BottomToolbar';
import Splash from './components/Splash';

const defaultControls: CanvasControlsRef = {
  zoomIn: () => { },
  zoomOut: () => { },
  resetZoom: () => { },
  fitToScreen: () => { },
  getScale: () => 1,
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project>(PROJECTS[0]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const canvasControls = useRef<CanvasControlsRef>(defaultControls);

  const selectedElement = selectedProject.canvasElements.find(
    el => el.id === selectedElementId
  ) ?? null;

  const handleSelectProject = useCallback((project: Project) => {
    setSelectedProject(project);
    setSelectedElementId(null);
  }, []);

  const handleSelectElement = useCallback((id: string | null) => {
    setSelectedElementId(id);
  }, []);

  const handleTransformChange = useCallback((newScale: number) => {
    setScale(newScale);
  }, []);

  const handleAddNote = useCallback(() => {
    setSelectedProject(prev => {
      // Create a local sticky note element
      const newNote = {
        id: `sn-local-${Date.now()}`,
        type: 'sticky-note' as const,
        x: 400 + Math.random() * 100, // roughly center-ish with some jitter
        y: 200 + Math.random() * 50,
        width: 220,
        height: 160,
        data: {
          content: 'New sticky note! (Local Demo)',
          color: ['yellow', 'pink', 'cyan', 'purple', 'green'][Math.floor(Math.random() * 5)] as any,
          rotation: Math.random() * 4 - 2 // slight random rotation
        }
      };

      return {
        ...prev,
        canvasElements: [...prev.canvasElements, newNote]
      };
    });
  }, []);

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-surface-1 text-text-primary">
      {showSplash && <Splash onDone={() => setShowSplash(false)} />}

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Canvas */}
        <div className="absolute inset-0 w-full h-full flex flex-col">
          <Canvas
            project={selectedProject}
            selectedElementId={selectedElementId}
            onSelectElement={handleSelectElement}
            onTransformChange={handleTransformChange}
            canvasControlsRef={canvasControls}
          />
        </div>

        {/* Floating Left Panel */}
        <div className="absolute top-3 bottom-3 left-3 z-10 pointer-events-none flex flex-col">
          <LeftPanel
            selectedProject={selectedProject}
            onSelectProject={handleSelectProject}
          />
        </div>

        {/* Floating Right Panel */}
        <div className="absolute top-3 bottom-3 right-3 z-10 pointer-events-none flex flex-col w-[280px]">
          <RightPanel
            project={selectedProject}
            selectedElement={selectedElement}
          />
        </div>
      </div>

      {/* Bottom Toolbar */}
      <BottomToolbar
        project={selectedProject}
        scale={scale}
        onZoomIn={() => canvasControls.current.zoomIn()}
        onZoomOut={() => canvasControls.current.zoomOut()}
        onResetZoom={() => canvasControls.current.resetZoom()}
        onFitToScreen={() => canvasControls.current.fitToScreen()}
        onAddNote={handleAddNote}
      />
    </div>
  );
}
