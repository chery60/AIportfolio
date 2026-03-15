import { useState, useRef, useCallback, useEffect } from 'react';
import type { CanvasTransform } from '../types';

const MIN_SCALE = 0.4;
const MAX_SCALE = 3;
const ZOOM_SENSITIVITY = 0.001;

interface UseCanvasOptions {
  defaultTransform?: CanvasTransform;
}

export function useCanvas({ defaultTransform }: UseCanvasOptions = {}) {
  const [transform, setTransform] = useState<CanvasTransform>(
    defaultTransform ?? { x: 0, y: 0, scale: 1 }
  );
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Ref to cancel ongoing animations
  const animationRef = useRef<number | null>(null);

  const setDefaultTransform = useCallback((t: CanvasTransform) => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setTransform(t);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      setTransform(prev => {
        const delta = -e.deltaY * ZOOM_SENSITIVITY;
        const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev.scale * (1 + delta * 3)));
        const scaleRatio = newScale / prev.scale;

        return {
          x: mouseX - scaleRatio * (mouseX - prev.x),
          y: mouseY - scaleRatio * (mouseY - prev.y),
          scale: newScale,
        };
      });
    } else {
      // Pan
      setTransform(prev => ({
        ...prev,
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only pan on middle mouse or space+click (handled separately)
    if (e.button === 1 || e.button === 2) {
      e.preventDefault();
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
    }
  }, [transform]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning || !panStart.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setTransform(prev => ({
      ...prev,
      x: panStart.current!.tx + dx,
      y: panStart.current!.ty + dy,
    }));
  }, [isPanning]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    panStart.current = null;
  }, []);

  // Space + drag panning
  const spaceDown = useRef(false);
  const spacePanStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const [isSpacePanning, setIsSpacePanning] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        spaceDown.current = true;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spaceDown.current = false;
        setIsSpacePanning(false);
        spacePanStart.current = null;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (spaceDown.current) {
      e.preventDefault();
      setIsSpacePanning(true);
      spacePanStart.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
    }
  }, [transform]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isSpacePanning || !spacePanStart.current) return;
    const dx = e.clientX - spacePanStart.current.x;
    const dy = e.clientY - spacePanStart.current.y;
    setTransform(prev => ({
      ...prev,
      x: spacePanStart.current!.tx + dx,
      y: spacePanStart.current!.ty + dy,
    }));
  }, [isSpacePanning]);

  const handleCanvasMouseUp = useCallback(() => {
    if (isSpacePanning) {
      setIsSpacePanning(false);
      spacePanStart.current = null;
    }
  }, [isSpacePanning]);

  const zoomIn = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setTransform(prev => {
      const newScale = Math.min(MAX_SCALE, prev.scale * 1.2);
      const r = newScale / prev.scale;
      return { x: cx - r * (cx - prev.x), y: cy - r * (cy - prev.y), scale: newScale };
    });
  }, []);

  const zoomOut = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setTransform(prev => {
      const newScale = Math.max(MIN_SCALE, prev.scale / 1.2);
      const r = newScale / prev.scale;
      return { x: cx - r * (cx - prev.x), y: cy - r * (cy - prev.y), scale: newScale };
    });
  }, []);

  const resetZoom = useCallback(() => {
    setTransform(defaultTransform ?? { x: 0, y: 0, scale: 1 });
  }, [defaultTransform]);

  const fitToScreen = useCallback(() => {
    setTransform(defaultTransform ?? { x: 20, y: 20, scale: 0.75 });
  }, [defaultTransform]);

  const animateTo = useCallback((targetX: number, targetY: number, durationMs = 800) => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    
    setTransform(prev => {
      const startX = prev.x;
      const startY = prev.y;
      const distanceX = targetX - startX;
      const distanceY = targetY - startY;
      const startTime = performance.now();
      
      const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);
      
      const step = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const easedProgress = easeOutQuart(progress);
        
        setTransform(current => ({
          ...current,
          x: startX + (distanceX * easedProgress),
          y: startY + (distanceY * easedProgress),
        }));
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(step);
        } else {
          animationRef.current = null;
        }
      };
      
      animationRef.current = requestAnimationFrame(step);
      return prev;
    });
  }, []);

  const isGrabbing = isPanning || isSpacePanning;

  return {
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
  };
}
