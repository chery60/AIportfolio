import { useEffect, useState, useMemo } from 'react';
import type { Project } from '../../types';
import { useCanvas } from '../../hooks/useCanvas';
import CanvasElementRenderer from './CanvasElement';
import Character from './Character';
import { useAvatarGuide } from '../../hooks/useAvatarGuide';
import type { ActiveViewer, CursorPosition } from '../../hooks/useRealtimeSession';

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
  onDeleteElement?: (id: string) => void;
  onUpdateElement?: (element: import('../../types').CanvasElement) => void;
  onCanvasClick?: (x: number, y: number) => void;
  activeViewers?: ActiveViewer[];
  cursors?: Record<string, CursorPosition>;
  localIdentity?: ActiveViewer | null;
  broadcastCursor?: (x: number, y: number) => void;
  updatePresencePosition?: (x: number, y: number, scale?: number) => void;
  onCharacterClick?: () => void;
  characterChatBubble?: string | null;
  isPreviewOnly?: boolean;
}

export interface CanvasControlsRef {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  fitToScreen: () => void;
  getScale: () => number;
  getCenterPos: () => { x: number; y: number };
  navigateTo: (canvasX: number, canvasY: number, scale?: number) => void;
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
  onDeleteElement,
  onUpdateElement,
  onCanvasClick,
  activeViewers = [],
  cursors = {},
  localIdentity = null,
  broadcastCursor,
  updatePresencePosition,
  onCharacterClick,
  characterChatBubble = null,
  isPreviewOnly = false,
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
  } = useCanvas({ defaultTransform: project.defaultView, disabled: isPreviewOnly });

  const localColor = localIdentity?.color || '#7170ff';

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
      },
      navigateTo: (canvasX: number, canvasY: number, targetScale?: number) => {
        if (!containerRef.current) return;
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        const nextScale = Number.isFinite(targetScale) ? targetScale as number : transform.scale;
        const targetTx = width / 2 - canvasX * nextScale;
        const targetTy = height / 2 - canvasY * nextScale;
        animateTo(targetTx, targetTy, 800, nextScale);
      },
    };
  }, [canvasControlsRef, zoomIn, zoomOut, resetZoom, fitToScreen, transform.scale, containerRef, transform.x, transform.y, animateTo]);

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

  useEffect(() => {
    if (!updatePresencePosition || isPreviewOnly) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = (rect.width / 2 - transform.x) / transform.scale;
    const centerY = (rect.height / 2 - transform.y) / transform.scale;
    updatePresencePosition(centerX, centerY, transform.scale);
  }, [containerRef, isPreviewOnly, project.id, transform.x, transform.y, transform.scale, updatePresencePosition]);

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
      aiDescription: (el.data as { aiDescription?: string }).aiDescription ?? null,
    })),
    [project.canvasElements]
  );

  // Contextual tip hook — shows small messages when cursor is near a section
  const { contextualTip, checkProximity } = useAvatarGuide({
    projectId: project.id,
    sectionPositions: elementBounds,
  });

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
      
      checkProximity(gridX, gridY);
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
        } catch {
          // Malformed drag offsets fall back to the zero offset above.
        }
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
        newElement = { id, type, x: gridX, y: gridY, width: 800, height: 600, data: { title: 'Prototype', description: '', thumbnailColor: '#5e6ad2' } };
        break;
      case 'case-study-card':
        newElement = { id, type, x: gridX, y: gridY, width: 560, height: 320, data: { title: 'New Case Study', subtitle: 'Subtitle', description: 'Description of the case study.', tags: ['Tag 1', 'Tag 2'], accentColor: '#3B82F6', metrics: [{ label: 'Metric', value: '—' }] } };
        break;
      case 'section-label':
        newElement = { id, type, x: gridX, y: gridY, width: 340, height: 40, data: { title: 'NEW SECTION', color: '#6366F1' } };
        break;
      case 'metric-card':
        newElement = { id, type, x: gridX, y: gridY, width: 190, height: 120, data: { label: 'Metric', value: '—', change: 'Description', changePositive: true, accentColor: '#10B981' } };
        break;
      case 'process-step':
        newElement = { id, type, x: gridX, y: gridY, width: 210, height: 190, data: { stepNumber: 1, title: 'New Step', description: 'Describe this step.', color: '#F59E0B' } };
        break;
      case 'user-flow-step':
        newElement = { id, type, x: gridX, y: gridY, width: 260, height: 190, data: { label: 'New Flow Step', description: 'Step description', shape: 'rectangle', color: '#6366F1', stepNumber: 1 } };
        break;
      case 'tag-cluster':
        newElement = { id, type, x: gridX, y: gridY, width: 600, height: 110, data: { title: 'Tags', tags: [{ label: 'Tag 1', color: '#3B82F6' }, { label: 'Tag 2', color: '#10B981' }] } };
        break;
      case 'video-embed':
        newElement = { id, type, x: gridX, y: gridY, width: 720, height: 540, data: { title: 'New Video', description: 'Video description', videoUrl: '', accentColor: '#EF4444' } };
        break;
      case 'figma-embed':
        newElement = { id, type, x: gridX, y: gridY, width: 720, height: 540, data: { title: 'Figma Embed', description: 'Paste your Figma embed URL', figmaUrl: '', accentColor: '#A855F7' } };
        break;
      case 'flow-diagram':
        newElement = { id, type, x: gridX, y: gridY, width: 620, height: 520, data: { title: 'New Flow Diagram', subtitle: '', accentColor: '#0EA5E9', nodes: [{ id: 'n1', label: 'Start', color: '#3B82F6', x: 50, y: 50, width: 140, height: 110 }, { id: 'n2', label: 'End', color: '#10B981', x: 350, y: 50, width: 140, height: 110 }], connections: [{ from: 'n1', to: 'n2' }] } };
        break;
      case 'data-dimension':
        newElement = { id, type, x: gridX, y: gridY, width: 270, height: 190, data: { dimension: 'Dimension', title: 'Data dimension title', highlight: 'Key Value', min: '0', max: '100', typical: '50', accentColor: '#5e6ad2' } };
        break;
      case 'storyboard':
        newElement = { id, type, x: gridX, y: gridY, width: 1000, height: 900, zIndex: 10, data: { boardType: 'problem', dialogues: [{ characterName: 'Character', text: 'Add dialogue here', color: '#3B82F6' }] } };
        break;
      case 'connector':
        newElement = { id, type, x: gridX, y: gridY, width: 200, height: 50, data: { fromId: '', toId: '', style: 'solid', label: '' } };
        break;
      case 'game-zone':
        newElement = { id, type, x: gridX, y: gridY, width: 1160, height: 680, data: { title: 'Game Zone', accentColor: '#EF4444' } };
        break;
      case 'comment-board':
        newElement = { id, type, x: gridX, y: gridY, width: 1000, height: 1000, data: { title: 'Comment Board' } };
        break;
      default:
        newElement = { id, type: 'text-block', x: gridX, y: gridY, width: 200, height: 100, data: { content: `Unsupported type: ${type}`, variant: 'body' } };
    }

    onAddElement(newElement);
  };

  return (
    <div
      ref={containerRef}
      className={`noon-canvas-shell relative flex-1 overflow-hidden ${isGrabbing ? 'cursor-grabbing' : spaceDown.current ? 'cursor-grab' : 'cursor-default'}`}
      onMouseDown={isPreviewOnly ? undefined : (e) => {
        handleMouseDown(e);
        handleCanvasMouseDown(e);
      }}
      onMouseMove={isPreviewOnly ? undefined : handleWrapperMouseMove}
      onMouseUp={isPreviewOnly ? undefined : () => {
        handleMouseUp();
        handleCanvasMouseUp();
      }}
      onMouseLeave={isPreviewOnly ? undefined : () => {
        handleMouseUp();
        handleCanvasMouseUp();
      }}
      onClick={isPreviewOnly ? undefined : handleBackgroundClick}
      onDragOver={isPreviewOnly ? undefined : handleDragOver}
      onDrop={isPreviewOnly ? undefined : handleDrop}
      style={{ cursor: isCommentMode ? 'crosshair' : 'default' }}
    >
      {/* Project transition overlay */}
      {isTransitioning && (
        <div
          className="absolute inset-0 z-50 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.88), rgba(255,252,247,0.72))',
            opacity: isTransitioning ? 0.7 : 0,
            transition: 'opacity 0.4s ease',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Background patterns */}
      <div 
        className="noon-dot-grid absolute inset-0 pointer-events-none opacity-100"
        style={{
          backgroundSize: `${22 * transform.scale}px ${22 * transform.scale}px, ${110 * transform.scale}px ${110 * transform.scale}px`,
          backgroundPosition: `${transform.x}px ${transform.y}px, ${transform.x}px ${transform.y}px`,
        }}
      />
      <div className="noon-canvas-vignette absolute inset-0 pointer-events-none" />
      
      {/* Ambient project glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(${projectAccent(project)}, 0.055) 0%, transparent 68%)`,
          left: '20%',
          top: '10%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(56px)',
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
        {!isPlayingGame && !isEditing && (
          <Character
            targetX={mouseGridPos.x}
            targetY={mouseGridPos.y}
            color={localColor}
            elementBounds={elementBounds}
            message={characterChatBubble ?? contextualTip}
            onClick={onCharacterClick}
          />
        )}

        {/* Remote Characters (Other Visitors) */}
        {!isEditing && activeViewers.map((viewer) => {
          if (localIdentity && viewer.id === localIdentity.id) return null;
          if (viewer.projectId !== project.id) return null;

          const cursor = cursors[viewer.id];
          const cursorMatchesProject = cursor?.projectId === project.id && cursor.hasCursor;
          const pos = cursorMatchesProject
            ? cursor
            : viewer.hasCursor
              ? { x: viewer.x, y: viewer.y }
              : { x: viewer.viewportX, y: viewer.viewportY };
          if (!Number.isFinite(pos.x) || !Number.isFinite(pos.y)) return null;

          return (
            <div key={viewer.id}>
              <Character
                targetX={pos.x}
                targetY={pos.y}
                color={viewer.color}
                elementBounds={elementBounds}
              />

              {/* Screen-stable name tag */}
              <div
                className="absolute top-0 left-0 transition-all duration-100 ease-linear will-change-transform z-[100] pointer-events-none"
                style={{
                  transform: `translate(${pos.x + 14}px, ${pos.y - 66}px) scale(${1 / transform.scale})`,
                  transformOrigin: '0 0'
                }}
              >
                <div
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-[0_8px_18px_rgba(25,26,27,0.16)] whitespace-nowrap w-max border border-white/80"
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
            canvasScale={transform.scale}
            onDeleteElement={onDeleteElement}
            onUpdateElement={onUpdateElement}
          />
        ))}
      </div>

      {/* Keyboard hint */}
      <div className="noon-hint-pill absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full px-3 py-1.5 opacity-80 hover:opacity-100 transition-all">
        <span className="text-[11px] font-medium text-[#5f6369]">
          Hold <kbd className="px-1.5 py-0.5 rounded-md bg-white text-[#191a1b] text-[10px] font-mono shadow-sm border border-[#dcd8d0]">Space</kbd> + drag to pan <span className="mx-1 text-[#b4aca1]">/</span> Scroll to zoom
        </span>
      </div>

    </div>
  );
}


function projectAccent(project: Project): string {
  const hex = project.accentColor;
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '124, 92, 252';
}
