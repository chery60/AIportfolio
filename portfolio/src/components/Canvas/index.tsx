import { useEffect, useState } from 'react';
import type { Project } from '../../types';
import { useCanvas } from '../../hooks/useCanvas';
import CanvasElementRenderer from './CanvasElement';
import Character from './Character';
import { usePresence } from '../../hooks/usePresence';

interface Props {
  project: Project;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onTransformChange: (scale: number) => void;
  canvasControlsRef: React.MutableRefObject<CanvasControlsRef>;
}

export interface CanvasControlsRef {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  fitToScreen: () => void;
  getScale: () => number;
}

export default function Canvas({
  project,
  selectedElementId,
  onSelectElement,
  onTransformChange,
  canvasControlsRef,
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
  } = useCanvas({ defaultTransform: project.defaultView });

  const { remoteCursors, updateCursor, localColor } = usePresence();

  // Expose controls to parent
  useEffect(() => {
    canvasControlsRef.current = {
      zoomIn,
      zoomOut,
      resetZoom,
      fitToScreen,
      getScale: () => transform.scale,
    };
  }, [canvasControlsRef, zoomIn, zoomOut, resetZoom, fitToScreen, transform.scale]);

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

  const handleBackgroundClick = () => {
    onSelectElement(null);
  };

  const [mouseGridPos, setMouseGridPos] = useState({ x: 0, y: 0 });

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
      updateCursor(gridX, gridY);
    }
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
    >
      {/* Project transition overlay */}
      {isTransitioning && (
        <div
          className="absolute inset-0 z-50 pointer-events-none"
          style={{ background: '#FFFFFF', opacity: isTransitioning ? 0.6 : 0, transition: 'opacity 0.4s ease' }}
        />
      )}

      {/* Grid dots overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.08) 1.5px, transparent 1.5px)',
          backgroundSize: `${24 * transform.scale}px ${24 * transform.scale}px`,
          backgroundPosition: `${transform.x % (24 * transform.scale)}px ${transform.y % (24 * transform.scale)}px`,
        }}
      />

      {/* Ambient glow effects */}
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
        <Character targetX={mouseGridPos.x} targetY={mouseGridPos.y} color={localColor} />

        {/* Remote Characters (Other Visitors) */}
        {Object.entries(remoteCursors).map(([id, cursor]) => (
          <Character key={id} targetX={cursor.x} targetY={cursor.y} color={cursor.color} />
        ))}

        {/* Render all elements */}
        {project.canvasElements.map(element => (
          <CanvasElementRenderer
            key={element.id}
            element={element}
            isSelected={selectedElementId === element.id}
            onSelect={onSelectElement}
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

function projectAccent(project: Project): string {
  const hex = project.accentColor;
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '124, 92, 252';
}
