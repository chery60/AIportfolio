import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree, type RootState } from '@react-three/fiber';
import * as THREE from 'three';

import type { Project, CanvasElement } from '../../types';
import { resolveViewerPosition, type ActiveViewer, type CursorPosition } from '../../hooks/useRealtimeSession';
import type { CanvasControlsRef } from '../Canvas';
import { useCanvasDomOverlay } from '../../context/CanvasDomOverlayContext';
import Environment3D from './Environment3D';
import AmongUsCharacter3D from './AmongUsCharacter3D';
import ProjectorScreen3D from './ProjectorScreen3D';
import { DEFAULT_CAMERA_FOV } from './constants';
import {
  AUDIENCE_PALETTE,
  calculateAudiencePositions,
} from './AudienceLayout';
import { buildPresentationSections } from './PresentationSections';
import type { PresentationSection } from './PresentationSections';
import PresentationSlideLayout from './PresentationSlideLayout';

export interface PresentationSceneProps {
  project: Project;
  worldScale: number;
  moveSpeed: number;
  characterColor: string;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  isEditing: boolean;
  isCommentMode: boolean;
  onDeleteElement?: (id: string) => void;
  onUpdateElement?: (element: CanvasElement) => void;
  setCharacterWorldPosition: (x: number, y: number) => void;
  broadcastCursor?: (x: number, y: number) => void;
  onTransformChange: (scale: number) => void;
  registerCanvasControls: (api: CanvasControlsRef) => void;
  activeViewers: ActiveViewer[];
  cursors: Record<string, CursorPosition>;
  localIdentity: ActiveViewer | null;
  initialCameraFov?: number;
  /** Optional GLB/GLTF path for Among Us (see `public/models/README.md`). */
  amongUsModelPath?: string;
  /** Optional projector FBX/GLTF URL under `public/`. Set `null` for procedural screen only. */
  projectorModelPath?: string | null;
}

/** Screen focal point — projector group sits at z = -5. */
const SCREEN_LOOK_AT = new THREE.Vector3(0, 4.5, -5);
/** Arc between camera (positive Z) and screen. */
const ARC_CENTER = new THREE.Vector3(0, 0, 1.5);


function VisitorCharacter({
  x,
  y,
  S,
  color,
  scale,
  modelPath,
}: {
  x: number;
  y: number;
  S: number;
  color: string;
  scale: number;
  modelPath?: string;
}) {
  const feetPosition = useMemo(() => new THREE.Vector3(x * S, 0, y * S), [x, y, S]);
  return (
    <AmongUsCharacter3D feetPosition={feetPosition} color={color} scale={scale} modelPath={modelPath} />
  );
}

function AudienceMember({
  feet,
  yaw,
  color,
  scale,
  modelPath,
}: {
  feet: THREE.Vector3;
  yaw: number;
  color: string;
  scale: number;
  modelPath?: string;
}) {
  const feetPosition = useMemo(
    () => new THREE.Vector3(feet.x, feet.y, feet.z),
    [feet.x, feet.y, feet.z]
  );
  const yawRef = useRef(yaw);

  useLayoutEffect(() => {
    yawRef.current = yaw;
  }, [yaw]);

  return (
    <AmongUsCharacter3D
      feetPosition={feetPosition}
      color={color}
      scale={scale}
      facingYawRef={yawRef}
      modelPath={modelPath}
      isMoving={false}
    />
  );
}

function EmptySlidePlaceholder() {
  return (
    <div
      className="rounded-xl border border-black/10 bg-white/80 px-6 py-8 text-center text-sm text-gray-700 max-w-md mx-auto"
      role="status"
    >
      <p className="font-semibold text-gray-800 mb-1">Nothing on the board yet</p>
      <p className="text-xs text-gray-500">Add canvas elements in edit mode — they appear here as sections.</p>
    </div>
  );
}

export default function PresentationScene({
  project,
  worldScale: S,
  moveSpeed: _moveSpeed,
  characterColor: _characterColor,
  selectedElementId,
  onSelectElement,
  isEditing: _isEditing,
  isCommentMode: _isCommentMode,
  onDeleteElement: _onDeleteElement,
  onUpdateElement: _onUpdateElement,
  setCharacterWorldPosition,
  broadcastCursor,
  onTransformChange,
  registerCanvasControls,
  activeViewers,
  cursors,
  localIdentity,
  initialCameraFov = DEFAULT_CAMERA_FOV,
  amongUsModelPath,
  projectorModelPath = null,
}: PresentationSceneProps) {
  void _moveSpeed;
  void _characterColor;
  void _isEditing;
  void _isCommentMode;
  void _onDeleteElement;
  void _onUpdateElement;

  const { camera, gl } = useThree();
  const { setPresentationHud } = useCanvasDomOverlay();
  const fovRef = useRef(initialCameraFov);

  // ── Section-based slides ──────────────────────────────────────────────────
  const sections = useMemo(
    () => buildPresentationSections(project.canvasElements),
    [project.canvasElements]
  );
  const totalSlides = sections.length;
  const [sectionIndex, setSectionIndex] = useState(0);
  const safeIndex = totalSlides === 0 ? 0 : Math.min(sectionIndex, totalSlides - 1);
  const currentSection: PresentationSection | null = totalSlides === 0 ? null : sections[safeIndex];

  const projectRef = useRef(project);
  projectRef.current = project;
  const sectionsRef = useRef(sections);
  sectionsRef.current = sections;

  // ── Camera refs ───────────────────────────────────────────────────────────
  const camDistance = useRef(14.0);
  const camHeight   = useRef(4.0);
  const camYaw      = useRef(0);       // horizontal orbit angle (radians, 0 = front view)
  const lookTarget  = useRef(new THREE.Vector3(0, 4.5, -5));
  const lastBroadcast = useRef(0);

  // ── Audience layout ───────────────────────────────────────────────────────
  const audienceLayout = useMemo(
    () =>
      calculateAudiencePositions({
        elementCount: sections.length,
        screenLookAt: SCREEN_LOOK_AT.clone(),
        arcCenter: ARC_CENTER.clone(),
        arcRadius: 3.2,
      }),
    [sections.length]
  );

  // ── useFrame: orbital camera ──────────────────────────────────────────────
  useFrame((_state: RootState) => {
    /* eslint-disable react-hooks/immutability */
    const pCam = camera as THREE.PerspectiveCamera;
    if (pCam.isPerspectiveCamera) {
      pCam.fov = fovRef.current;
      pCam.updateProjectionMatrix();
    }

    // Orbit camera around lookTarget: distance in XZ plane = camDistance - lookTarget.z
    // so that zoom (camDistance) moves the camera closer/farther from the screen.
    const lt = lookTarget.current;
    const orbitR = camDistance.current - lt.z;   // e.g. 13 - (-5) = 18 initially
    camera.position.set(
      lt.x + orbitR * Math.sin(camYaw.current),
      camHeight.current,
      lt.z + orbitR * Math.cos(camYaw.current),
    );
    camera.lookAt(lt);
    /* eslint-enable react-hooks/immutability */

    const scaleFactor = initialCameraFov / fovRef.current;
    onTransformChange(scaleFactor);

    setCharacterWorldPosition(ARC_CENTER.x / S, ARC_CENTER.z / S);

    if (broadcastCursor && currentSection) {
      const now = performance.now();
      if (now - lastBroadcast.current > 220) {
        lastBroadcast.current = now;
        const cx = currentSection.bounds.x + currentSection.bounds.width / 2;
        const cy = currentSection.bounds.y + currentSection.bounds.height / 2;
        broadcastCursor(cx, cy);
      }
    }
  });

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    setSectionIndex(0);
  }, [project.id]);

  // Clamp index + sync selectedElementId to the first element in the section
  useEffect(() => {
    if (totalSlides === 0) {
      onSelectElement(null);
      return;
    }
    const bounded = Math.min(sectionIndex, totalSlides - 1);
    if (bounded !== sectionIndex) setSectionIndex(bounded);
    const sec = sections[bounded];
    const firstEl = sec?.elements.find(e => e.type !== 'section-label') ?? sec?.elements[0];
    onSelectElement(firstEl?.id ?? null);
  }, [sections, sectionIndex, totalSlides, onSelectElement]);

  // If selectedElementId changes externally, jump to the section that contains it
  useEffect(() => {
    if (!selectedElementId) return;
    const idx = sections.findIndex(sec =>
      sec.elements.some(el => el.id === selectedElementId)
    );
    if (idx !== -1 && idx !== safeIndex) setSectionIndex(idx);
  }, [sections, safeIndex, selectedElementId]);

  // Initialize camera on mount / FOV prop change
  useEffect(() => {
    fovRef.current    = initialCameraFov;
    camDistance.current = 14.0;
    camHeight.current   = 4.0;
    camYaw.current      = 0;

    /* eslint-disable react-hooks/immutability */
    const pCam = camera as THREE.PerspectiveCamera;
    if (pCam.isPerspectiveCamera) {
      pCam.fov = initialCameraFov;
      pCam.updateProjectionMatrix();
    }
    const lt = lookTarget.current;
    camera.position.set(0, camHeight.current, camDistance.current);
    camera.lookAt(lt);
    /* eslint-enable react-hooks/immutability */
  }, [camera, initialCameraFov]);

  // ── Pointer-drag orbital rotation ────────────────────────────────────────
  useEffect(() => {
    const canvas = gl.domElement;
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    let totalDrag = 0;

    const onDown = (e: PointerEvent) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      totalDrag = 0;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
    };

    const onMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      totalDrag += Math.abs(dx) + Math.abs(dy);

      // Horizontal drag → orbit yaw; clamp to ±135° so the screen stays visible
      camYaw.current = Math.max(
        -Math.PI * 0.75,
        Math.min(Math.PI * 0.75, camYaw.current - dx * 0.006),
      );

      // Vertical drag → raise/lower camera; clamp to reasonable range
      camHeight.current = Math.max(
        1.5,
        Math.min(11.0, camHeight.current + dy * 0.012),
      );

      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onUp = () => {
      isDragging = false;
      canvas.style.cursor = 'grab';
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointerleave', onUp);
    canvas.style.cursor = 'grab';

    return () => {
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointerleave', onUp);
      canvas.style.cursor = '';
    };
  }, [gl]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const goPrevious = useCallback(() => {
    setSectionIndex((i) => Math.max(i - 1, 0));
  }, []);

  const goNext = useCallback(() => {
    setSectionIndex((i) => Math.min(i + 1, Math.max(totalSlides - 1, 0)));
  }, [totalSlides]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest?.('input, textarea, select, [contenteditable="true"]')) return;

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goPrevious();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goPrevious, goNext]);

  // ── Canvas controls API ───────────────────────────────────────────────────
  useEffect(() => {
    registerCanvasControls({
      zoomIn: () => {
        camDistance.current = Math.max(10.0, camDistance.current - 0.8);
      },
      zoomOut: () => {
        camDistance.current = Math.min(28.0, camDistance.current + 0.8);
      },
      resetZoom: () => {
        camDistance.current = 14.0;
        camHeight.current   = 4.0;
        camYaw.current      = 0;
        fovRef.current      = initialCameraFov;
      },
      fitToScreen: () => {
        camDistance.current = 14.0;
        camHeight.current   = 4.0;
        camYaw.current      = 0;
        fovRef.current      = initialCameraFov;
      },
      getScale: () => initialCameraFov / fovRef.current,
      getCenterPos: () => {
        const sec = sectionsRef.current[safeIndex];
        if (!sec) return { x: 0, y: 0 };
        return {
          x: sec.bounds.x + sec.bounds.width / 2,
          y: sec.bounds.y + sec.bounds.height / 2,
        };
      },
      navigateTo: (canvasX: number, canvasY: number) => {
        const secs = sectionsRef.current;
        let best = 0;
        let bestD = Infinity;
        for (let i = 0; i < secs.length; i++) {
          const b = secs[i].bounds;
          const cx = b.x + b.width / 2;
          const cy = b.y + b.height / 2;
          const d = (cx - canvasX) ** 2 + (cy - canvasY) ** 2;
          if (d < bestD) { bestD = d; best = i; }
        }
        if (secs.length > 0) setSectionIndex(best);
      },
    });
  }, [registerCanvasControls, camera, initialCameraFov, safeIndex]);

  // ── Slide content ─────────────────────────────────────────────────────────
  const projectorChildren = useMemo(() => {
    if (!currentSection) return <EmptySlidePlaceholder />;
    return (
      <PresentationSlideLayout
        section={currentSection}
        slideIndex={safeIndex}
        totalSlides={totalSlides}
      />
    );
  }, [currentSection, safeIndex, totalSlides]);

  // ── HUD ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    setPresentationHud({
      currentIndex: safeIndex,
      totalSlides,
      canGoPrevious: safeIndex > 0,
      canGoNext: safeIndex < totalSlides - 1 && totalSlides > 0,
      onPrevious: goPrevious,
      onNext: goNext,
      sectionLabel: currentSection?.label,
    });
    return () => setPresentationHud(null);
  }, [safeIndex, totalSlides, goPrevious, goNext, setPresentationHud, currentSection]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Environment3D />

      {/* Screen spotlight */}
      <spotLight
        position={[0, 12, 3]}
        target-position={[0, 5.0, -5]}
        intensity={55}
        angle={0.42}
        penumbra={0.4}
        color="#FFF8F0"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      <ProjectorScreen3D modelUrl={projectorModelPath}>{projectorChildren}</ProjectorScreen3D>

      {audienceLayout.map((pos, idx) => (
        <AudienceMember
          key={`aud-${project.id}-${idx}`}
          feet={pos.feet}
          yaw={pos.yaw}
          color={AUDIENCE_PALETTE[idx % AUDIENCE_PALETTE.length]}
          scale={0.44}
          modelPath={amongUsModelPath}
        />
      ))}

      {activeViewers.map((viewer) => {
        if (localIdentity && viewer.id === localIdentity.id) return null;
        if (viewer.projectId !== project.id) return null;
        const pos = resolveViewerPosition(viewer, cursors[viewer.id], { x: 0, y: 0 });
        return (
          <VisitorCharacter
            key={viewer.id}
            x={pos.x}
            y={pos.y}
            S={S}
            color={viewer.color}
            scale={0.34}
            modelPath={amongUsModelPath}
          />
        );
      })}
    </>
  );
}
