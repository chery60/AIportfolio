import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import type { Project, CanvasElement } from './types';
import { PROJECTS } from './data/projects';
import LeftPanel from './components/LeftPanel';
import Canvas, { type CanvasControlsRef } from './components/Canvas';
import RightPanel from './components/RightPanel';
import BottomToolbar from './components/BottomToolbar';
import LandingPage from './components/LandingPage';
import EditToolbar from './components/EditToolbar';
import PropertiesPanel from './components/PropertiesPanel';
import UnsavedChangesModal from './components/UnsavedChangesModal';
import MobileCanvasView from './components/MobileCanvasView';
import MobileProjectList from './components/MobileProjectList';
import MobileView from './components/MobileView';
import { supabase } from './lib/supabase';
import { useRealtimeSession } from './hooks/useRealtimeSession';
import { useIsMobile } from './hooks/useIsMobile';
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import { useCharacterChat } from './hooks/useCharacterChat';

const defaultControls: CanvasControlsRef = {
  zoomIn: () => { },
  zoomOut: () => { },
  resetZoom: () => { },
  fitToScreen: () => { },
  getScale: () => 1,
  getCenterPos: () => ({ x: 0, y: 0 }),
  navigateTo: () => { },
};

type FollowTarget = {
  x: number;
  y: number;
  scale?: number;
};

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'canvas'>('landing');
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');
  const [selectedProject, setSelectedProject] = useState<Project>(PROJECTS[0]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isCommentMode, setIsCommentMode] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'switch-project'; project: Project } | { type: 'exit-edit' } | { type: 'exit-canvas' } | null>(null);
  const canvasControls = useRef<CanvasControlsRef>(defaultControls);
  const editSnapshotRef = useRef<CanvasElement[] | null>(null);
  const { activeViewers, cursors, localIdentity, broadcastCursor, updatePresencePosition } = useRealtimeSession(selectedProject.id);
  const pendingNavRef = useRef<FollowTarget | null>(null);
  const isMobile = useIsMobile();
  const previewCanvasControls = useRef<CanvasControlsRef>(defaultControls);
  const canvasRevealRawProgress = useMotionValue(0);
  const canvasRevealProgress = useSpring(canvasRevealRawProgress, { stiffness: 120, damping: 20 });
  const canvasRevealScale = useTransform(canvasRevealProgress, [0, 1], [0.82, 1]);
  const canvasRevealY = useTransform(canvasRevealProgress, [0, 1], ['18vh', '0vh']);
  const canvasRevealOpacity = useTransform(canvasRevealProgress, [0, 0.15], [0, 1]);
  const canvasRevealRadius = useTransform(canvasRevealProgress, [0, 1], ['18px', '0px']);
  const [canvasRevealValue, setCanvasRevealValue] = useState(0);
  const [isEnteringFromReveal, setIsEnteringFromReveal] = useState(false);

  // Among Us crewmate AI chat
  const chat = useCharacterChat({ project: selectedProject });

  useEffect(() => {
    return canvasRevealRawProgress.on('change', setCanvasRevealValue);
  }, [canvasRevealRawProgress]);

  // Dirty tracking — compare current elements to snapshot
  const isDirty = (() => {
    if (!editSnapshotRef.current) return false;
    return JSON.stringify(selectedProject.canvasElements) !== JSON.stringify(editSnapshotRef.current);
  })();

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
        
        // If we currently have an edit snapshot active, update it to the fetched baseline
        if (editSnapshotRef.current !== null) {
          editSnapshotRef.current = JSON.parse(JSON.stringify(data.canvas_elements));
        }
      }
    }
    loadProject();
  }, [selectedProject.id]);

  // Save to Supabase helper
  const saveToSupabase = useCallback(async () => {
    if (!supabase) return;
    await supabase
      .from('projects')
      .upsert({
        id: selectedProject.id,
        canvas_elements: selectedProject.canvasElements
      }, { onConflict: 'id' });
  }, [selectedProject.id, selectedProject.canvasElements]);

  // Enter edit mode: snapshot current state
  const handleToggleEdit = useCallback((editing: boolean) => {
    if (editing) {
      // Entering edit mode — take snapshot
      editSnapshotRef.current = JSON.parse(JSON.stringify(selectedProject.canvasElements));
      setIsEditing(true);
    } else {
      // "Save & Exit" via the LeftPanel button
      handleSaveAndExit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject.canvasElements]);

  // Save & Exit: persist and leave edit mode (or switch project)
  const handleSaveAndExit = useCallback(async () => {
    await saveToSupabase();
    
    const isSwitching = pendingAction?.type === 'switch-project';
    if (!isSwitching) {
      editSnapshotRef.current = null;
      setIsEditing(false);
      setIsPreviewMode(false);
    }
    
    setShowUnsavedModal(false);

    if (pendingAction?.type === 'switch-project') {
      setSelectedProject(pendingAction.project);
      setSelectedElementId(null);
      editSnapshotRef.current = JSON.parse(JSON.stringify(pendingAction.project.canvasElements));
    } else if (pendingAction?.type === 'exit-canvas') {
      canvasRevealRawProgress.set(0);
      setCurrentView('landing');
    }
    
    setPendingAction(null);
  }, [saveToSupabase, pendingAction, canvasRevealRawProgress]);

  // Discard & Exit: restore snapshot and leave edit mode (or switch project)
  const handleDiscardAndExit = useCallback(() => {
    if (editSnapshotRef.current) {
      setSelectedProject(prev => ({
        ...prev,
        canvasElements: editSnapshotRef.current!,
      }));
    }
    
    const isSwitching = pendingAction?.type === 'switch-project';
    if (!isSwitching) {
      editSnapshotRef.current = null;
      setIsEditing(false);
      setIsPreviewMode(false);
    }
    
    setShowUnsavedModal(false);

    // Execute pending action
    if (pendingAction?.type === 'switch-project') {
      setSelectedProject(pendingAction.project);
      setSelectedElementId(null);
      editSnapshotRef.current = JSON.parse(JSON.stringify(pendingAction.project.canvasElements));
    } else if (pendingAction?.type === 'exit-canvas') {
      canvasRevealRawProgress.set(0);
      setCurrentView('landing');
    }
    setPendingAction(null);
  }, [pendingAction, canvasRevealRawProgress]);

  // Cancel modal — close it, keep editing
  const handleCancelModal = useCallback(() => {
    setShowUnsavedModal(false);
    setPendingAction(null);
  }, []);

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
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          handleDeleteElement(selectedElementId);
          return;
        default: return; // Not a handled key
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
    if (isEditing && isDirty) {
      // Guard: show unsaved changes modal
      setPendingAction({ type: 'switch-project', project });
      setShowUnsavedModal(true);
      return;
    }
    
    setSelectedProject(project);
    setSelectedElementId(null);
    
    if (isEditing) {
      // Maintain edit mode for new project
      editSnapshotRef.current = JSON.parse(JSON.stringify(project.canvasElements));
      setIsPreviewMode(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, isDirty]);

  // Navigate to a viewer's project and position (Figma-style click-to-follow)
  const handleViewerClick = useCallback((viewer: import('./hooks/useRealtimeSession').ActiveViewer) => {
    const target = PROJECTS.find(p => p.id === viewer.projectId);
    const cursor = cursors[viewer.id];
    const cursorMatchesProject = cursor?.projectId === viewer.projectId && cursor.hasCursor;
    const hasViewerCursor = viewer.hasCursor && Number.isFinite(viewer.x) && Number.isFinite(viewer.y);
    const hasViewport = Number.isFinite(viewer.viewportX) && Number.isFinite(viewer.viewportY);
    const fallbackProjectView = target?.defaultView;
    const followTarget: FollowTarget = cursorMatchesProject
      ? { x: cursor.x, y: cursor.y }
      : hasViewerCursor
        ? { x: viewer.x, y: viewer.y }
        : hasViewport
          ? { x: viewer.viewportX, y: viewer.viewportY, scale: viewer.viewportScale }
          : {
              x: fallbackProjectView ? -fallbackProjectView.x / fallbackProjectView.scale : 0,
              y: fallbackProjectView ? -fallbackProjectView.y / fallbackProjectView.scale : 0,
              scale: fallbackProjectView?.scale,
            };

    pendingNavRef.current = followTarget;

    if (target && target.id !== selectedProject.id) {
      setSelectedProject(target);
      setSelectedElementId(null);
    } else {
      // Same project — navigate immediately
      canvasControls.current.navigateTo(followTarget.x, followTarget.y, followTarget.scale);
      pendingNavRef.current = null;
    }
  }, [cursors, selectedProject.id]);

  // After a project switch triggered by handleViewerClick, execute deferred navigation
  useEffect(() => {
    if (!pendingNavRef.current) return;
    const { x, y, scale } = pendingNavRef.current;
    pendingNavRef.current = null;
    // Small delay to let canvas initialize to the new project's default view first
    const id = setTimeout(() => {
      canvasControls.current.navigateTo(x, y, scale);
    }, 50);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject.id]);

  // Mobile: select a project and go to detail view
  const handleMobileSelectProject = useCallback((project: Project) => {
    setSelectedProject(project);
    setSelectedElementId(null);
    setMobileView('detail');
  }, []);

  // Mobile: back from detail to list
  const handleMobileBackToList = useCallback(() => {
    setMobileView('list');
  }, []);

  // Mobile: back from list to landing
  const handleMobileExitToLanding = useCallback(() => {
    setCurrentView('landing');
    setMobileView('list');
  }, []);

  const handleSelectElement = useCallback((id: string | null) => {
    setSelectedElementId(id);
  }, []);

  const handleAddElement = useCallback((element: CanvasElement) => {
    setSelectedProject(prev => ({
      ...prev,
      canvasElements: [...prev.canvasElements, element]
    }));
  }, []);

  const handleDeleteElement = useCallback((id: string) => {
    setSelectedProject(prev => ({
      ...prev,
      canvasElements: prev.canvasElements.filter(el => el.id !== id)
    }));
    setSelectedElementId(prev => prev === id ? null : prev);
  }, []);

  const handleUpdateElement = useCallback((updated: CanvasElement) => {
    setSelectedProject(prev => ({
      ...prev,
      canvasElements: prev.canvasElements.map(el =>
        el.id === updated.id ? updated : el
      )
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
          color: 'cyan'
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

  // Recovery: when the browser exits fullscreen (e.g. after expanding a Figma embed
  // iframe and pressing Escape), force a re-render so panels reappear correctly.
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        // Fullscreen exited — nudge React to re-paint the panels
        setScale(s => s);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Prevent native browser zoom when pinching over floating panels
  useEffect(() => {
    const preventNativeZoom = (e: WheelEvent) => {
      // Pinch-to-zoom on Mac trackpads fires wheel events with ctrlKey=true
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    // Needs { passive: false } to allow e.preventDefault()
    document.addEventListener('wheel', preventNativeZoom, { passive: false });
    return () => {
      document.removeEventListener('wheel', preventNativeZoom);
    };
  }, []);

  // Handle entering canvas with transition
  const handleEnterCanvas = useCallback(() => {
    setIsEnteringFromReveal(canvasRevealRawProgress.get() > 0.01);
    canvasRevealRawProgress.set(1);
    setCurrentView('canvas');
  }, [canvasRevealRawProgress]);

  // Handle exiting canvas back to landing (with unsaved changes guard)
  const handleExitCanvas = useCallback(() => {
    if (isEditing && isDirty) {
      setPendingAction({ type: 'exit-canvas' });
      setShowUnsavedModal(true);
      return;
    }
    if (isEditing) {
      editSnapshotRef.current = null;
      setIsEditing(false);
      setIsPreviewMode(false);
    }
    canvasRevealRawProgress.set(0);
    setCurrentView('landing');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, isDirty, canvasRevealRawProgress]);

  useEffect(() => {
    if (currentView === 'landing') {
      canvasRevealRawProgress.set(0);
      setIsEnteringFromReveal(false);
    }
  }, [currentView, canvasRevealRawProgress]);

  useEffect(() => {
    if (!isEnteringFromReveal) return;
    const timeout = window.setTimeout(() => setIsEnteringFromReveal(false), 500);
    return () => window.clearTimeout(timeout);
  }, [isEnteringFromReveal]);

  const renderDesktopCanvasContent = (isRevealPreview = false) => {
    const activeCanvasControls = isRevealPreview ? previewCanvasControls : canvasControls;
    const activeEditing = !isRevealPreview && isEditing && !isPreviewMode;

    return (
      <>
        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Canvas */}
          <div className="absolute inset-0 w-full h-full flex flex-col">
            <Canvas
              project={selectedProject}
              selectedElementId={selectedElementId}
              onSelectElement={handleSelectElement}
              onTransformChange={handleTransformChange}
              canvasControlsRef={activeCanvasControls}
              isEditing={activeEditing}
              isCommentMode={!isRevealPreview && isCommentMode}
              onDeleteElement={handleDeleteElement}
              onUpdateElement={handleUpdateElement}
              onAddElement={handleAddElement}
              onUpdateElementPosition={handleUpdateElementPosition}
              onCanvasClick={handleCanvasClick}
              activeViewers={isRevealPreview ? [] : activeViewers}
              cursors={cursors}
              localIdentity={localIdentity}
              broadcastCursor={isRevealPreview ? undefined : broadcastCursor}
              updatePresencePosition={isRevealPreview ? undefined : updatePresencePosition}
              onCharacterClick={undefined}
              characterChatBubble={chat.characterBubble}
              isPreviewOnly={isRevealPreview}
            />
          </div>

          {/* Floating Left Panel */}
          <div className="absolute top-3 bottom-3 left-3 z-10 pointer-events-none flex flex-col">
            <LeftPanel
              selectedProject={selectedProject}
              onSelectProject={handleSelectProject}
              isEditing={activeEditing}
              onToggleEdit={handleToggleEdit}
              onSaveAndExit={handleSaveAndExit}
              isDirty={!isRevealPreview && isDirty}
              onExit={isRevealPreview ? undefined : handleExitCanvas}
              isPreviewOnly={isRevealPreview}
            />
          </div>

          {/* Floating Right Panel or Edit Toolbar */}
          <div className="absolute top-3 bottom-3 right-3 z-10 pointer-events-none flex flex-col w-[280px]">
            {activeEditing ? (
              selectedElement ? (
                <PropertiesPanel
                  element={selectedElement}
                  onUpdate={handleUpdateElement}
                  onDelete={handleDeleteElement}
                />
              ) : (
                <EditToolbar project={selectedProject} />
              )
            ) : (
              <RightPanel
                project={selectedProject}
                selectedElement={selectedElement}
                activeViewers={activeViewers}
                onViewerClick={isRevealPreview ? undefined : handleViewerClick}
                localIdentity={localIdentity}
              />
            )}
          </div>
        </div>

        {/* Bottom Toolbar */}
        <BottomToolbar
          project={selectedProject}
          scale={scale}
          isEditing={activeEditing}
          isPreviewMode={!isRevealPreview && isPreviewMode}
          onTogglePreview={isRevealPreview ? undefined : setIsPreviewMode}
          onZoomIn={() => activeCanvasControls.current.zoomIn()}
          onZoomOut={() => activeCanvasControls.current.zoomOut()}
          onResetZoom={() => activeCanvasControls.current.resetZoom()}
          onFitToScreen={() => activeCanvasControls.current.fitToScreen()}
          onAddNote={isRevealPreview ? () => { } : handleAddNote}
          onSendAI={isRevealPreview ? undefined : chat.sendMessage}
          isAILoading={!isRevealPreview && chat.isLoading}
        />
      </>
    );
  };

  const shouldShowCanvasReveal = currentView === 'landing' && canvasRevealValue > 0.01;
  const handleCanvasRevealClick = () => {
    canvasRevealRawProgress.set(1);
    window.setTimeout(() => handleEnterCanvas(), 100);
  };

  // Mobile gets its own self-contained experience
  if (isMobile) {
    return <MobileView activeViewers={activeViewers} />;
  }

  return (
    <>
      <div className="hidden md:block">
        <SmoothCursor />
      </div>
      <AnimatePresence initial={false}>
        {currentView === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={isEnteringFromReveal ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            transition={isEnteringFromReveal ? { duration: 0.12 } : { duration: 0.4 }}
          >
            <LandingPage
              onEnterCanvas={handleEnterCanvas}
              canvasRevealRawProgress={canvasRevealRawProgress}
              canvasRevealProgress={canvasRevealProgress}
            />
          </motion.div>
        )}

        {shouldShowCanvasReveal && (
          <div key="canvas-reveal" className="fixed inset-0 z-[70] pointer-events-none overflow-hidden">
            <motion.div
              className="noon-canvas-shell w-full h-full flex flex-col text-text-primary overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.22)] pointer-events-auto cursor-pointer"
              style={{
                scale: canvasRevealScale,
                y: canvasRevealY,
                opacity: canvasRevealOpacity,
                borderRadius: canvasRevealRadius,
                transformOrigin: '50% 100%',
              }}
              onClick={handleCanvasRevealClick}
            >
              <div className="w-full h-full flex flex-col pointer-events-none" aria-hidden="true" inert>
                {renderDesktopCanvasContent(true)}
              </div>
            </motion.div>
          </div>
        )}

        {currentView === 'canvas' && (
          <motion.div
            key="canvas"
            initial={isEnteringFromReveal ? false : { opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={isEnteringFromReveal ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
            className="noon-canvas-shell fixed inset-0 z-[80] flex flex-col text-text-primary overflow-hidden"
          >
            {isMobile ? (
              /* ── Mobile Views ── */
              mobileView === 'list' ? (
                <MobileProjectList
                  onSelectProject={handleMobileSelectProject}
                  onExit={handleMobileExitToLanding}
                />
              ) : (
                <MobileCanvasView
                  project={selectedProject}
                  onSelectProject={handleMobileSelectProject}
                  onBack={handleMobileBackToList}
                  activeViewers={activeViewers}
                />
              )
            ) : (
              /* ── Desktop Canvas View ── */
              renderDesktopCanvasContent()
            )}

            {/* Unsaved Changes Modal */}
            {showUnsavedModal && (
              <UnsavedChangesModal
                onSave={handleSaveAndExit}
                onDiscard={handleDiscardAndExit}
                onCancel={handleCancelModal}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
