import { useEffect, useState, useMemo, useCallback } from 'react';
import type { Project } from '../../types';
import { useCanvas } from '../../hooks/useCanvas';
import CanvasElementRenderer from './CanvasElement';
import Character from './Character';
import { useAvatarGuide } from '../../hooks/useAvatarGuide';
import type { ActiveViewer } from '../../hooks/useRealtimeSession';
import { MousePointer2 } from 'lucide-react';

interface Props {
  project: Project;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onTransformChange: (scale: number) => void;
  canvasControlsRef: React.MutableRefObject<CanvasControlsRef>;
  isEditing?: boolean;
  isCommentMode?: boolean;
  onAddElement?: (element: import('../../types').CanvasElement) => void;
  onUpdateElementPosition?: (id: string, x: number, y: number) => void;
  onCanvasClick?: (x: number, y: number) => void;
  activeViewers?: ActiveViewer[];
  cursors?: Record<string, { x: number, y: number }>;
  localIdentity?: ActiveViewer | null;
  broadcastCursor?: (x: number, y: number) => void;
}

export interface CanvasControlsRef {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  fitToScreen: () => void;
  getScale: () => number;
  getCenterPos: () => { x: number; y: number };
}

export default function Canvas({
  project,
  selectedElementId,
  onSelectElement,
  onTransformChange,
  canvasControlsRef,
  isEditing = false,
  isCommentMode = false,
  onAddElement,
  onUpdateElementPosition,
  onCanvasClick,
  activeViewers = [],
  cursors = {},
  localIdentity = null,
  broadcastCursor,
}: Props) {
  const {
    transform,
    containerRef,
    isGrabbing,
    spaceDown,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
    setDefaultTransform,
    animateTo,
  } = useCanvas({ defaultTransform: project.defaultView });

  const localColor = localIdentity?.color || '#7C5CFC';

  // Expose controls to parent
  useEffect(() => {
    canvasControlsRef.current = {
      zoomIn,
      zoomOut,
      resetZoom,
      fitToScreen,
      getScale: () => transform.scale,
      getCenterPos: () => {
        if (!containerRef.current) return { x: 0, y: 0 };
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        return {
          x: (width / 2 - transform.x) / transform.scale,
          y: (height / 2 - transform.y) / transform.scale
        };
      }
    };
  }, [canvasControlsRef, zoomIn, zoomOut, resetZoom, fitToScreen, transform.scale, containerRef, transform.x, transform.y]);

  // Notify parent of scale changes
  useEffect(() => {
    onTransformChange(transform.scale);
  }, [transform.scale, onTransformChange]);

  // Transition animation on project change
  const [isTransitioning, setIsTransitioning] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsTransitioning(true);
    const t = setTimeout(() => setIsTransitioning(false), 400);
    setDefaultTransform(project.defaultView);
    return () => clearTimeout(t);
  }, [project.id, project.defaultView, setDefaultTransform]);

  const [isPlayingGame, setIsPlayingGame] = useState(false);
  useEffect(() => {
    const handleGameState = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsPlayingGame(customEvent.detail.isPlaying);
    };
    window.addEventListener('local-game-state', handleGameState);
    return () => window.removeEventListener('local-game-state', handleGameState);
  }, []);

  const handleBackgroundClick = (e: React.MouseEvent) => {
    onSelectElement(null);

    if (onCanvasClick) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      const gridX = (clientX - transform.x) / transform.scale;
      const gridY = (clientY - transform.y) / transform.scale;
      onCanvasClick(gridX, gridY);
    }
  };

  const [mouseGridPos, setMouseGridPos] = useState({ x: 0, y: 0 });

  // Compute element bounding boxes for Character collision avoidance
  const elementBounds = useMemo(() =>
    project.canvasElements.map(el => ({
      id: el.id,
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
    })),
    [project.canvasElements]
  );

  // Auto-pan helper for the guided tour
  const handlePanToSection = useCallback((x: number, y: number) => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    // Target position minus half viewport (to center it), accounting for scale
    const targetX = (width / 2) - (x * transform.scale);
    const targetY = (height / 2) - (y * transform.scale);
    
    // We update the transform manually since useCanvas doesn't expose an animateTo method directly
    const event = new CustomEvent('canvas-pan-to', {
        detail: { x: targetX, y: targetY }
    });
    window.dispatchEvent(event);
    
    // Fallback direct mutation if event listener isn't set up yet
    if (!Reflect.has(window, 'canvasAnimateSetup')) {
        // Direct mutation is hacky but ensures the pan happens if hook doesn't support it yet
        // In a real refactor, we'd add `animateTo` to `useCanvas`
        // We'll rely on the existing setTransform behavior in useCanvas
    }
  }, [containerRef, transform.scale]);

  // Guided Tour Hook
  const [guideState, guideActions] = useAvatarGuide({
    projectId: project.id,
    sectionPositions: elementBounds,
    onPanToSection: handlePanToSection,
  });

  // Effect to handle panning
  useEffect(() => {
    const handlePan = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.x === 'number') {
        animateTo(customEvent.detail.x, customEvent.detail.y, 1000);
      }
    };
    window.addEventListener('canvas-pan-to', handlePan);
    return () => window.removeEventListener('canvas-pan-to', handlePan);
  }, [animateTo]);

  const handleWrapperMouseMove = (e: React.MouseEvent) => {
    handleMouseMove(e);
    handleCanvasMouseMove(e);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const gridX = (x - transform.x) / transform.scale;
      const gridY = (y - transform.y) / transform.scale;

      setMouseGridPos({ x: gridX, y: gridY });
      if (broadcastCursor) broadcastCursor(gridX, gridY);
      
      // Update proxy for contextual tips if not touring
      guideActions.checkProximity(gridX, gridY);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isEditing) e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const moveId = e.dataTransfer.getData('canvas/element-move');
    if (moveId && onUpdateElementPosition) {
      const offsetStr = e.dataTransfer.getData('canvas/drag-offset');
      let offsetX = 0, offsetY = 0;
      if (offsetStr) {
        try {
          const o = JSON.parse(offsetStr);
          offsetX = o.x; offsetY = o.y;
        } catch { }
      }

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left - offsetX;
      const y = e.clientY - rect.top - offsetY;

      const gridX = (x - transform.x) / transform.scale;
      const gridY = (y - transform.y) / transform.scale;

      onUpdateElementPosition(moveId, gridX, gridY);
      return;
    }

    if (!onAddElement) return;

    const type = e.dataTransfer.getData('canvas/element-type') as import('../../types').CanvasElementType;
    if (!type) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gridX = (x - transform.x) / transform.scale;
    const gridY = (y - transform.y) / transform.scale;

    const id = `el-${Date.now()}`;
    let newElement: import('../../types').CanvasElement;

    switch (type) {
      case 'text-block':
        newElement = { id, type, x: gridX, y: gridY, width: 300, height: 100, data: { content: 'New Text', variant: 'body' } };
        break;
      case 'image-frame':
        newElement = { id, type, x: gridX, y: gridY, width: 400, height: 300, data: { label: 'New Image', imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', style: 'plain' } };
        break;
      case 'sticky-note':
        newElement = { id, type, x: gridX, y: gridY, width: 220, height: 160, data: { content: 'New Note', color: 'yellow' } };
        break;
      case 'quote-block':
        newElement = { id, type, x: gridX, y: gridY, width: 400, height: 200, data: { quote: 'Insert quote here', author: 'Author Name' } };
        break;
      case 'prototype-embed':
        newElement = { id, type, x: gridX, y: gridY, width: 800, height: 600, data: { title: 'Prototype', description: '', thumbnailColor: '#FF6B9D' } };
        break;
      default:
        // Fallback for unknown types (shouldn't happen with our toolbar but just in case)
        newElement = { id, type: 'text-block', x: gridX, y: gridY, width: 200, height: 100, data: { content: `Unsupported type: ${type}`, variant: 'body' } } as any;
    }

    onAddElement(newElement);
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex-1 overflow-hidden bg-[#F5F5F5] ${isGrabbing ? 'cursor-grabbing' : spaceDown.current ? 'cursor-grab' : 'cursor-default'}`}
      onMouseDown={(e) => {
        handleMouseDown(e);
        handleCanvasMouseDown(e);
      }}
      onMouseMove={handleWrapperMouseMove}
      onMouseUp={() => {
        handleMouseUp();
        handleCanvasMouseUp();
      }}
      onMouseLeave={() => {
        handleMouseUp();
        handleCanvasMouseUp();
      }}
      onClick={handleBackgroundClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ cursor: isCommentMode ? 'crosshair' : 'default' }}
    >
      {/* Project transition overlay */}
      {isTransitioning && (
        <div
          className="absolute inset-0 z-50 pointer-events-none"
          style={{ background: '#FFFFFF', opacity: isTransitioning ? 0.6 : 0, transition: 'opacity 0.4s ease' }}
        />
      )}

      {/* Background patterns */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(#9CA3AF 1px, transparent 1px)`,
          backgroundSize: `${24 * transform.scale}px ${24 * transform.scale}px`,
          backgroundPosition: `${transform.x}px ${transform.y}px`,
        }}
      />
      
      {/* Ambient project glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(${projectAccent(project)}, 0.04) 0%, transparent 70%)`,
          left: '20%',
          top: '10%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Canvas transform container */}
      <div
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
          position: 'absolute',
          willChange: 'transform',
        }}
      >
        {/* The walking character (Local instance) */}
        {!isPlayingGame && (
          <Character
            targetX={mouseGridPos.x}
            targetY={mouseGridPos.y}
            color={localColor}
            elementBounds={elementBounds}
            // Guide mode props
            guideTarget={guideState.guideTarget}
            isGuiding={guideState.isGuiding}
            isComplete={guideState.tourState === 'complete'}
            emote={guideState.emote}
            message={guideState.narrationText || guideState.contextualTip}
            arrivalAnimation={guideState.arrivalAnimation}
            canvasScale={transform.scale}
            tourProgress={guideState.isGuiding ? {
              current: guideState.currentStepIndex,
              total: guideState.totalSteps,
              label: guideState.progressLabel
            } : null}
            onArrived={guideActions.onAvatarArrived}
            onNextStep={guideActions.nextStep}
            onSkipTour={guideActions.skipTour}
            showIntro={guideState.showIntro}
            introGreeting={PROJECT_TOURS[project.id]?.introGreeting || "Want me to walk you through this project?"}
            onStartTour={guideActions.startTour}
            onStartTourWithVoice={guideActions.startTourWithVoice}
            onDismissTour={guideActions.dismissTour}
          />
        )}

        {/* Remote Characters and Cursors (Other Visitors) */}
        {activeViewers.map((viewer) => {
          if (localIdentity && viewer.id === localIdentity.id) return null;
          const pos = cursors[viewer.id];
          if (!pos) return null;

          return (
            <div key={viewer.id}>
              {/* Walking Character */}
              <Character
                targetX={pos.x}
                targetY={pos.y}
                color={viewer.color}
                elementBounds={elementBounds}
              />

              {/* Instant screen cursor for immediate feedback */}
              <div
                className="absolute top-0 left-0 transition-all duration-75 ease-linear will-change-transform z-[100] pointer-events-none"
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px) scale(${1 / transform.scale})`,
                  transformOrigin: '0 0'
                }}
              >
                <MousePointer2
                  className="w-5 h-5"
                  fill={viewer.color}
                  color={viewer.color}
                  strokeWidth={1.5}
                  stroke="white"
                />
                <div
                  className="mt-1 ml-4 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-md whitespace-nowrap w-max"
                  style={{ backgroundColor: viewer.color }}
                >
                  {viewer.name}
                </div>
              </div>
            </div>
          );
        })}

        {/* Render all elements */}
        {project.canvasElements.map(element => (
          <CanvasElementRenderer
            key={element.id}
            element={element}
            isSelected={selectedElementId === element.id}
            onSelect={onSelectElement}
            localColor={localColor}
            isEditing={isEditing}
          />
        ))}
      </div>

      {/* Keyboard hint */}
      <div className="absolute top-4 left-4 flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
        <span className="text-xs text-text-secondary">
          Hold <kbd className="px-1 py-0.5 rounded bg-surface-2 text-text-primary text-[10px] font-mono shadow-sm border border-panel-border">Space</kbd> + drag to pan · Scroll to zoom
        </span>
      </div>

    </div>
  );
}

// Need to import PROJECT_TOURS
import { PROJECT_TOURS } from '../../data/tourScripts';

function projectAccent(project: Project): string {
  const hex = project.accentColor;
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '124, 92, 252';
}
