import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Project, CanvasElement } from '../../types';
import type { ActiveViewer, CursorPosition } from '../../hooks/useRealtimeSession';
import type { CanvasControlsRef } from '../Canvas';
import { useCanvasDomOverlay } from '../../context/CanvasDomOverlayContext';
import Environment3D from './Environment3D';
import FirstPersonControls from './FirstPersonControls';
import Character3D from './Character3D';
import CanvasElement3D from './CanvasElement3D';
import { DEFAULT_CAMERA_FOV, EYE_HEIGHT, SPRINT_MULTIPLIER } from './constants';

export type ViewMode3D = 'explorer' | 'gallery' | 'cinematic';

interface Waypoint3D {
  id: string;
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  duration: number;
  pauseTime: number;
  label?: string;
}

export interface ExplorerSceneProps {
  project: Project;
  viewMode: ViewMode3D;
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
  /** Initial FOV from view-mode config */
  initialCameraFov?: number;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function buildWaypoints3D(
  elements: CanvasElement[],
  S: number,
  significantTypes: string[]
): Waypoint3D[] {
  if (!elements.length) {
    return [
      {
        id: 'default',
        position: new THREE.Vector3(0, EYE_HEIGHT, 12),
        lookAt: new THREE.Vector3(0, 1.5, 0),
        duration: 2800,
        pauseTime: 800,
        label: 'Portfolio',
      },
    ];
  }

  const centers = elements.map((e) => ({
    cx: (e.x + e.width / 2) * S,
    cz: (e.y + e.height / 2) * S,
  }));
  const mx = centers.reduce((a, c) => a + c.cx, 0) / centers.length;
  const mz = centers.reduce((a, c) => a + c.cz, 0) / centers.length;
  const center = new THREE.Vector3(mx, 1.5, mz);

  const list: Waypoint3D[] = [
    {
      id: 'overview',
      position: new THREE.Vector3(mx, EYE_HEIGHT * 1.35, mz + 42 * S),
      lookAt: center.clone(),
      duration: 1800,
      pauseTime: 1200,
      label: 'Overview',
    },
  ];

  elements
    .filter((el) => significantTypes.includes(el.type))
    .forEach((el, index) => {
      const c = new THREE.Vector3((el.x + el.width / 2) * S, 1.5, (el.y + el.height / 2) * S);
      const dir = new THREE.Vector3().subVectors(c, new THREE.Vector3(mx, 1.5, mz)).normalize();
      if (dir.lengthSq() < 1e-6) dir.set(0, 0, 1);
      const camPos = c.clone().addScaledVector(dir, -10);
      camPos.y = EYE_HEIGHT;
      const label = (el.data as { title?: string }).title ?? `Highlight ${index + 1}`;
      list.push({
        id: el.id,
        position: camPos,
        lookAt: c,
        duration: 2600 + index * 150,
        pauseTime: 2600,
        label,
      });
    });

  list.push({
    id: 'overview-end',
    position: new THREE.Vector3(mx, EYE_HEIGHT * 1.2, mz + 36 * S),
    lookAt: center.clone(),
    duration: 2200,
    pauseTime: 800,
    label: 'Overview',
  });

  return list;
}

function VisitorFeet({
  x,
  y,
  S,
  color,
  scale,
}: {
  x: number;
  y: number;
  S: number;
  color: string;
  scale: number;
}) {
  const v = useRef(new THREE.Vector3(x * S, 0, y * S));
  v.current.set(x * S, 0, y * S);
  return <Character3D feetPosition={v.current} color={color} scale={scale} />;
}

function elementWorldPosition(
  el: CanvasElement,
  index: number,
  total: number,
  viewMode: ViewMode3D,
  centerX: number,
  centerZ: number,
  S: number
): [number, number, number] {
  const yLift = 1.25;
  if (viewMode === 'gallery') {
    const R = Math.max(20, 14 + total * 1.2);
    const angle = (index / Math.max(total, 1)) * Math.PI * 2;
    const wx = centerX + Math.cos(angle) * R;
    const wz = centerZ + Math.sin(angle) * R;
    return [wx, yLift, wz];
  }
  const wx = (el.x + el.width / 2) * S;
  const wz = (el.y + el.height / 2) * S;
  return [wx, yLift, wz];
}

export default function ExplorerScene({
  project,
  viewMode,
  worldScale: S,
  moveSpeed,
  characterColor,
  selectedElementId,
  onSelectElement,
  isEditing,
  isCommentMode: _isCommentMode,
  onDeleteElement,
  onUpdateElement,
  setCharacterWorldPosition,
  broadcastCursor,
  onTransformChange,
  registerCanvasControls,
  activeViewers,
  cursors,
  localIdentity,
  initialCameraFov = DEFAULT_CAMERA_FOV,
}: ExplorerSceneProps) {
  void _isCommentMode;

  const { setCinematicHud } = useCanvasDomOverlay();
  const { camera } = useThree();
  const fovRef = useRef(initialCameraFov);
  const feet = useRef(new THREE.Vector3(0, 0, 0));
  const lastBroadcast = useRef(0);
  const projectRef = useRef(project);
  const SRef = useRef(S);
  projectRef.current = project;
  SRef.current = S;

  const elements = project.canvasElements;
  const significantTypes = useMemo(
    () => ['case-study-card', 'storyboard', 'flow-diagram', 'video-embed', 'figma-embed'],
    []
  );

  const bounds = useMemo(() => {
    if (!elements.length) return { cx: 0, cz: 0 };
    const mx =
      elements.reduce((a, e) => a + (e.x + e.width / 2), 0) / elements.length;
    const mz =
      elements.reduce((a, e) => a + (e.y + e.height / 2), 0) / elements.length;
    return { cx: mx * S, cz: mz * S };
  }, [elements, S]);

  const centerXZ = useMemo(
    () => ({ cx: bounds.cx / S, cz: bounds.cz / S }),
    [bounds.cx, bounds.cz, S]
  );

  const waypoints = useMemo(
    () => buildWaypoints3D(elements, S, significantTypes),
    [elements, S, significantTypes]
  );

  const totalTourDuration = useMemo(
    () => waypoints.reduce((acc, w) => acc + w.duration + w.pauseTime, 0),
    [waypoints]
  );

  const tourRef = useRef({
    playing: viewMode === 'cinematic',
    paused: false,
    speed: 1,
    elapsed: 0,
    segment: 0,
    inPause: false,
  });

  const [tourUi, setTourUi] = useState({
    isPlaying: viewMode === 'cinematic',
    isPaused: false,
    progress: 0,
    speed: 1,
    segment: 0,
    label: '' as string | undefined,
  });

  const bumpTourUi = useCallback(() => {
    const tr = tourRef.current;
    setTourUi({
      isPlaying: tr.playing,
      isPaused: tr.paused,
      progress:
        totalTourDuration > 0 ? (tr.elapsed % totalTourDuration) / totalTourDuration : 0,
      speed: tr.speed,
      segment: tr.segment,
      label: waypoints[tr.segment]?.label,
    });
  }, [totalTourDuration, waypoints]);

  useEffect(() => {
    if (viewMode === 'cinematic') {
      tourRef.current = {
        playing: true,
        paused: false,
        speed: 1,
        elapsed: 0,
        segment: 0,
        inPause: false,
      };
      bumpTourUi();
    }
  }, [viewMode, project.id, bumpTourUi]);

  useEffect(() => {
    if (viewMode === 'cinematic') return;
    camera.position.set(bounds.cx, EYE_HEIGHT, bounds.cz + 28);
    camera.lookAt(bounds.cx, EYE_HEIGHT * 0.55, bounds.cz);
    camera.updateProjectionMatrix();
  }, [viewMode, project.id, bounds.cx, bounds.cz, camera]);

  useEffect(() => {
    fovRef.current = initialCameraFov;
    const pCam = camera as THREE.PerspectiveCamera;
    if (pCam.isPerspectiveCamera) {
      pCam.fov = initialCameraFov;
      pCam.updateProjectionMatrix();
    }
  }, [camera, initialCameraFov, viewMode]);

  const interpolateTourCamera = useCallback(
    (from: Waypoint3D, to: Waypoint3D, t: number) => {
      const e = easeInOutCubic(t);
      camera.position.lerpVectors(from.position, to.position, e);
      const look = new THREE.Vector3().lerpVectors(from.lookAt, to.lookAt, e);
      camera.lookAt(look);
    },
    [camera]
  );

  const cinematicHandlers = useMemo(
    () => ({
      play: () => {
        tourRef.current.playing = true;
        tourRef.current.paused = false;
        bumpTourUi();
      },
      pause: () => {
        tourRef.current.paused = true;
        bumpTourUi();
      },
      resume: () => {
        tourRef.current.paused = false;
        bumpTourUi();
      },
      stop: () => {
        tourRef.current.playing = false;
        tourRef.current.paused = true;
        bumpTourUi();
      },
      skipNext: () => {
        const tr = tourRef.current;
        let acc = 0;
        for (let i = 0; i < waypoints.length; i++) {
          const w = waypoints[i];
          const segEnd = acc + w.duration + w.pauseTime;
          if (segEnd > tr.elapsed) {
            tr.elapsed = segEnd;
            break;
          }
          acc = segEnd;
        }
        bumpTourUi();
      },
      skipPrevious: () => {
        const tr = tourRef.current;
        let acc = 0;
        for (let i = 0; i < waypoints.length; i++) {
          const w = waypoints[i];
          const segEnd = acc + w.duration + w.pauseTime;
          if (segEnd >= tr.elapsed && i > 0) {
            const prev = waypoints[i - 1];
            tr.elapsed = Math.max(0, acc - prev.duration - prev.pauseTime);
            break;
          }
          if (i === waypoints.length - 1) {
            tr.elapsed = 0;
          }
          acc = segEnd;
        }
        bumpTourUi();
      },
      setSpeed: (sp: number) => {
        tourRef.current.speed = sp;
        bumpTourUi();
      },
    }),
    [waypoints, bumpTourUi]
  );

  const uiFrame = useRef(0);
  useFrame((_, delta) => {
    const pCam = camera as THREE.PerspectiveCamera;
    if (pCam.isPerspectiveCamera) {
      pCam.fov = fovRef.current;
      pCam.updateProjectionMatrix();
    }

    const scaleFactor = initialCameraFov / fovRef.current;
    onTransformChange(scaleFactor);

    if (viewMode === 'cinematic' && waypoints.length && totalTourDuration > 0) {
      const tr = tourRef.current;
      if (tr.playing && !tr.paused) {
        tr.elapsed += delta * 1000 * tr.speed;
        if (tr.elapsed >= totalTourDuration) {
          tr.elapsed %= totalTourDuration;
        }
      }

      let acc = 0;
      let seg = 0;
      let localT = 0;
      let inPause = false;

      for (let i = 0; i < waypoints.length; i++) {
        const w = waypoints[i];
        const segLen = w.duration + w.pauseTime;
        if (acc + segLen > tr.elapsed) {
          seg = i;
          const into = tr.elapsed - acc;
          if (w.duration > 0 && into < w.duration) {
            localT = into / w.duration;
            inPause = false;
          } else {
            localT = 1;
            inPause = true;
          }
          break;
        }
        acc += segLen;
        if (i === waypoints.length - 1) {
          seg = waypoints.length - 1;
          localT = 1;
          inPause = true;
        }
      }

      tr.segment = seg;
      tr.inPause = inPause;

      const fromW = seg === 0 ? waypoints[0] : waypoints[seg - 1];
      const toW = waypoints[seg];
      interpolateTourCamera(fromW, toW, inPause ? 1 : localT);

      uiFrame.current++;
      if (uiFrame.current % 10 === 0) {
        bumpTourUi();
      }
    }

    feet.current.set(camera.position.x, 0, camera.position.z);
    setCharacterWorldPosition(camera.position.x / S, camera.position.z / S);

    const now = performance.now();
    if (broadcastCursor && now - lastBroadcast.current > 120) {
      lastBroadcast.current = now;
      broadcastCursor(camera.position.x / S, camera.position.z / S);
    }
  });

  useEffect(() => {
    registerCanvasControls({
      zoomIn: () => {
        fovRef.current = Math.max(35, fovRef.current - 4);
      },
      zoomOut: () => {
        fovRef.current = Math.min(100, fovRef.current + 4);
      },
      resetZoom: () => {
        fovRef.current = initialCameraFov;
      },
      fitToScreen: () => {
        const els = projectRef.current.canvasElements;
        const s = SRef.current;
        if (!els.length) return;
        let minX = Infinity,
          maxX = -Infinity,
          minZ = Infinity,
          maxZ = -Infinity;
        for (const e of els) {
          minX = Math.min(minX, e.x * s);
          maxX = Math.max(maxX, (e.x + e.width) * s);
          minZ = Math.min(minZ, e.y * s);
          maxZ = Math.max(maxZ, (e.y + e.height) * s);
        }
        const cx = (minX + maxX) / 2;
        const cz = (minZ + maxZ) / 2;
        const span = Math.max(maxX - minX, maxZ - minZ, 8);
        const pCam = camera as THREE.PerspectiveCamera;
        const fov = pCam.isPerspectiveCamera ? pCam.fov : initialCameraFov;
        const dist = (span * 1.1) / Math.tan((fov * Math.PI) / 360);
        camera.position.set(cx, EYE_HEIGHT, cz + dist);
        camera.lookAt(cx, 1.2, cz);
      },
      getScale: () => initialCameraFov / fovRef.current,
      getCenterPos: () => ({
        x: camera.position.x / SRef.current,
        y: camera.position.z / SRef.current,
      }),
      navigateTo: (canvasX: number, canvasY: number) => {
        const s = SRef.current;
        const tx = canvasX * s;
        const tz = canvasY * s;
        camera.position.set(tx - 6, EYE_HEIGHT, tz + 10);
        camera.lookAt(tx, 1.2, tz);
      },
    });
  }, [registerCanvasControls, camera, project.id, initialCameraFov]);

  useEffect(() => {
    if (viewMode !== 'cinematic') {
      setCinematicHud(null);
      return;
    }
    setCinematicHud({
      isPlaying: tourUi.isPlaying,
      isPaused: tourUi.isPaused,
      progress: tourUi.progress,
      speed: tourUi.speed,
      currentWaypointLabel: tourUi.label,
      totalWaypoints: waypoints.length,
      currentWaypointIndex: tourUi.segment,
      onPlay: cinematicHandlers.play,
      onPause: cinematicHandlers.pause,
      onResume: cinematicHandlers.resume,
      onStop: cinematicHandlers.stop,
      onSkipNext: cinematicHandlers.skipNext,
      onSkipPrevious: cinematicHandlers.skipPrevious,
      onSetSpeed: cinematicHandlers.setSpeed,
    });
    return () => setCinematicHud(null);
  }, [
    viewMode,
    tourUi.isPlaying,
    tourUi.isPaused,
    tourUi.progress,
    tourUi.speed,
    tourUi.label,
    tourUi.segment,
    waypoints.length,
    cinematicHandlers,
    setCinematicHud,
  ]);

  const fpEnabled = (viewMode === 'explorer' || viewMode === 'gallery') && !isEditing;

  const total = elements.length;

  return (
    <>
      <Environment3D />
      <FirstPersonControls
        enabled={fpEnabled}
        moveSpeed={moveSpeed}
        sprintMultiplier={SPRINT_MULTIPLIER}
      />
      {fpEnabled && (
        <Character3D feetPosition={feet.current} color={characterColor} scale={0.42} />
      )}

      {activeViewers.map((viewer) => {
        if (localIdentity && viewer.id === localIdentity.id) return null;
        const pos = cursors[viewer.id] ?? viewer;
        if (pos.projectId !== project.id) return null;
        return (
          <VisitorFeet
            key={viewer.id}
            x={pos.x}
            y={pos.y}
            S={S}
            color={viewer.color}
            scale={0.32}
          />
        );
      })}

      {elements.map((el, index) => {
        const pos = elementWorldPosition(
          el,
          index,
          total,
          viewMode,
          centerXZ.cx * S,
          centerXZ.cz * S,
          S
        );
        const elOrigin: CanvasElement = { ...el, x: 0, y: 0 };
        return (
          <CanvasElement3D
            key={el.id}
            element={elOrigin}
            position={pos}
            selectedElementId={selectedElementId}
            onSelectElement={onSelectElement}
            localColor={characterColor}
            isEditing={isEditing}
            onDeleteElement={onDeleteElement}
            onUpdateElement={onUpdateElement}
          />
        );
      })}
    </>
  );
}
