import { useState, useRef, useCallback, useEffect } from 'react';
import type { Project } from './types';
import { PROJECTS } from './data/projects';
import LeftPanel from './components/LeftPanel';
import Canvas, { type CanvasControlsRef } from './components/Canvas';
import RightPanel from './components/RightPanel';
import BottomToolbar from './components/BottomToolbar';
import Splash from './components/Splash';
import EditToolbar from './components/EditToolbar';
import { supabase } from './lib/supabase';

const defaultControls: CanvasControlsRef = {
  zoomIn: () => { },
  zoomOut: () => { },
  resetZoom: () => { },
  fitToScreen: () => { },
  getScale: () => 1,
  getCenterPos: () => ({ x: 0, y: 0 }),
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project>(PROJECTS[0]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isCommentMode, setIsCommentMode] = useState(false);
  const canvasControls = useRef<CanvasControlsRef>(defaultControls);

  const selectedElement = selectedProject.canvasElements.find(
    el => el.id === selectedElementId
  ) ?? null;

  // Fetch initial project data from Supabase
  useEffect(() => {
    async function loadProject() {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('projects')
        .select('canvas_elements')
        .eq('id', selectedProject.id)
        .single();

      if (!error && data && data.canvas_elements) {
        setSelectedProject((prev) => ({
          ...prev,
          canvasElements: data.canvas_elements
        }));
      }
    }
    loadProject();
  }, [selectedProject.id]);

  // Auto-save canvas elements when editing
  useEffect(() => {
    if (!isEditing || !supabase) return;

    const sb = supabase;
    const timer = setTimeout(async () => {
      await sb
        .from('projects')
        .upsert({
          id: selectedProject.id,
          canvas_elements: selectedProject.canvasElements
        }, { onConflict: 'id' });
    }, 1000);

    return () => clearTimeout(timer);
  }, [selectedProject.canvasElements, selectedProject.id, isEditing]);

  // Keyboard controls for moving selected elements
  useEffect(() => {
    if (!isEditing || !selectedElementId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      const increment = e.shiftKey ? 10 : 1;
      let dx = 0, dy = 0;

      switch (e.key) {
        case 'ArrowUp': dy = -increment; break;
        case 'ArrowDown': dy = increment; break;
        case 'ArrowLeft': dx = -increment; break;
        case 'ArrowRight': dx = increment; break;
        default: return; // Not an arrow key
      }

      e.preventDefault(); // Stop page scrolling

      setSelectedProject(prev => {
        const el = prev.canvasElements.find(e => e.id === selectedElementId);
        if (!el) return prev;
        return {
          ...prev,
          canvasElements: prev.canvasElements.map(e =>
            e.id === selectedElementId ? { ...e, x: e.x + dx, y: e.y + dy } : e
          )
        };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, selectedElementId]);

  const handleSelectProject = useCallback((project: Project) => {
    setSelectedProject(project);
    setSelectedElementId(null);
  }, []);

  const handleSelectElement = useCallback((id: string | null) => {
    setSelectedElementId(id);
  }, []);

  const handleAddElement = useCallback((element: import('./types').CanvasElement) => {
    setSelectedProject(prev => ({
      ...prev,
      canvasElements: [...prev.canvasElements, element]
    }));
  }, []);

  const handleAddNote = useCallback(() => {
    if (!isEditing) {
      // Add regular viewer note near center
      const { x, y } = canvasControls.current.getCenterPos();
      const newElement: import('./types').CanvasElement = {
        id: `note-${Date.now()}`,
        type: 'sticky-note',
        x,
        y,
        width: 220,
        height: 160,
        data: {
          content: 'New Note',
          color: 'yellow'
        }
      };

      setSelectedProject(prev => ({
        ...prev,
        canvasElements: [...prev.canvasElements, newElement]
      }));
      setSelectedElementId(newElement.id);
      return;
    }

    // Editing mode Comment Board logic
    const hasBoard = selectedProject.canvasElements.some(e => e.type === 'comment-board');
    if (!hasBoard) {
      const { x, y } = canvasControls.current.getCenterPos();
      const boardElement: import('./types').CanvasElement = {
        id: `board-${Date.now()}`,
        type: 'comment-board',
        x: x - 500,
        y: y - 500,
        width: 1000,
        height: 1000,
        data: {}
      };
      setSelectedProject(prev => ({
        ...prev,
        canvasElements: [...prev.canvasElements, boardElement]
      }));
    }

    setIsCommentMode(true);
  }, [selectedProject.canvasElements, isEditing]);

  // Click on canvas while in comment mode to add a note
  const handleCanvasClick = useCallback((x: number, y: number) => {
    if (!isEditing || !isCommentMode) return;

    // Verify click is inside the Comment Board
    const board = selectedProject.canvasElements.find(e => e.type === 'comment-board');
    if (!board) return;

    const isInside = x >= board.x && x <= board.x + board.width &&
      y >= board.y && y <= board.y + board.height;

    if (isInside) {
      const newElement: import('./types').CanvasElement = {
        id: `comment-${Date.now()}`,
        type: 'sticky-note',
        x: x - 110, // centered on click
        y: y - 80,
        width: 220,
        height: 160,
        zIndex: 50, // above the board
        data: {
          content: 'New Comment',
          color: 'blue' as any
        }
      };

      setSelectedProject(prev => ({
        ...prev,
        canvasElements: [...prev.canvasElements, newElement]
      }));
      setSelectedElementId(newElement.id);
      setIsCommentMode(false); // turn off after adding
    }
  }, [isEditing, isCommentMode, selectedProject.canvasElements]);

  const handleUpdateElementPosition = useCallback((id: string, newX: number, newY: number) => {
    setSelectedProject(prev => ({
      ...prev,
      canvasElements: prev.canvasElements.map(el =>
        el.id === id ? { ...el, x: newX, y: newY } : el
      )
    }));
  }, []);

  const handleTransformChange = useCallback((newScale: number) => {
    setScale(newScale);
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
            isEditing={isEditing && !isPreviewMode}
            isCommentMode={isCommentMode}
            onAddElement={handleAddElement}
            onUpdateElementPosition={handleUpdateElementPosition}
            onCanvasClick={handleCanvasClick}
          />
        </div>

        {/* Floating Left Panel */}
        <div className="absolute top-3 bottom-3 left-3 z-10 pointer-events-none flex flex-col">
          <LeftPanel
            selectedProject={selectedProject}
            onSelectProject={handleSelectProject}
            isEditing={isEditing}
            onToggleEdit={setIsEditing}
          />
        </div>

        {/* Floating Right Panel or Edit Toolbar */}
        <div className="absolute top-3 bottom-3 right-3 z-10 pointer-events-none flex flex-col w-[280px]">
          {isEditing && !isPreviewMode ? (
            <EditToolbar />
          ) : (
            <RightPanel
              project={selectedProject}
              selectedElement={selectedElement}
            />
          )}
        </div>
      </div>

      {/* Bottom Toolbar */}
      <BottomToolbar
        project={selectedProject}
        scale={scale}
        isEditing={isEditing}
        isPreviewMode={isPreviewMode}
        onTogglePreview={setIsPreviewMode}
        onZoomIn={() => canvasControls.current.zoomIn()}
        onZoomOut={() => canvasControls.current.zoomOut()}
        onResetZoom={() => canvasControls.current.resetZoom()}
        onFitToScreen={() => canvasControls.current.fitToScreen()}
        onAddNote={handleAddNote}
      />
    </div>
  );
}
