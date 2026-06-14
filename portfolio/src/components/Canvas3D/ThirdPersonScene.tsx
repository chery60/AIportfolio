import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Project, CanvasElement } from '../../types';
import { resolveViewerPosition, type ActiveViewer, type CursorPosition } from '../../hooks/useRealtimeSession';
import type { CanvasControlsRef } from '../Canvas';
import Environment3D from './Environment3D';
import Character3D from './Character3D';
import CanvasElement3D from './CanvasElement3D';
import ThirdPersonControls from './ThirdPersonControls';
import { DEFAULT_CAMERA_FOV } from './constants';

export interface ThirdPersonSceneProps {
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
}

function getSpawnPosition(elements: CanvasElement[], S: number): THREE.Vector3 {
  if (!elements.length) return new THREE.Vector3(5, 0, 8);
  
  let minX = Infinity, maxX = -Infinity;
  let minZ = Infinity;
  
  for (const e of elements) {
    const cx = (e.x + e.width / 2) * S;
    const cz = (e.y + e.height / 2) * S;
    minX = Math.min(minX, cx);
    maxX = Math.max(maxX, cx);
    minZ = Math.min(minZ, cz);
  }
  
  const centerX = (minX + maxX) / 2;
  const spawnZ = minZ + 8;
  
  return new THREE.Vector3(centerX, 0, spawnZ);
}

function elementWorldFlat(el: CanvasElement, S: number): [number, number, number] {
  const yLift = 1.6;
  const wx = (el.x + el.width / 2) * S;
  const wz = (el.y + el.height / 2) * S;
  return [wx, yLift, wz];
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

export default function ThirdPersonScene({
  project,
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
}: ThirdPersonSceneProps) {
  void _isCommentMode;

  const { camera } = useThree();
  const fovRef = useRef(initialCameraFov);
  const elements = project.canvasElements;
  const [ready, setReady] = useState(false);

  const spawnPos = useMemo(
    () => getSpawnPosition(elements, S),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [project.id, S]
  );

  const feet = useRef(spawnPos.clone());
  const facingYaw = useRef(0);
  const orbitYaw = useRef(0);
  const orbitPitch = useRef(0.48);
  const orbitDistance = useRef(14);
  const lastBroadcast = useRef(0);
  const projectRef = useRef(project);
  const SRef = useRef(S);
  projectRef.current = project;
  SRef.current = S;

  useEffect(() => {
    feet.current.copy(getSpawnPosition(project.canvasElements, S));
    orbitYaw.current = 0;
    orbitPitch.current = 0.48;
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id, S]);

  useEffect(() => {
    fovRef.current = initialCameraFov;
    const pCam = camera as THREE.PerspectiveCamera;
    if (pCam.isPerspectiveCamera) {
      pCam.fov = initialCameraFov;
      pCam.updateProjectionMatrix();
    }
  }, [camera, initialCameraFov]);

  const tpEnabled = !isEditing;

  useFrame(() => {
    const pCam = camera as THREE.PerspectiveCamera;
    if (pCam.isPerspectiveCamera) {
      pCam.fov = fovRef.current;
      pCam.updateProjectionMatrix();
    }
    const scaleFactor = initialCameraFov / fovRef.current;
    onTransformChange(scaleFactor);

    setCharacterWorldPosition(feet.current.x / S, feet.current.z / S);

    const now = performance.now();
    if (broadcastCursor && now - lastBroadcast.current > 120) {
      lastBroadcast.current = now;
      broadcastCursor(feet.current.x / S, feet.current.z / S);
    }
  });

  useEffect(() => {
    registerCanvasControls({
      zoomIn: () => {
        orbitDistance.current = Math.max(6, orbitDistance.current - 0.9);
      },
      zoomOut: () => {
        orbitDistance.current = Math.min(28, orbitDistance.current + 0.9);
      },
      resetZoom: () => {
        orbitDistance.current = 11;
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
        feet.current.set(cx, 0, cz);
        const span = Math.max(maxX - minX, maxZ - minZ, 8);
        orbitDistance.current = THREE.MathUtils.clamp(span * 0.85, 10, 36);
        orbitPitch.current = 0.42;
      },
      getScale: () => initialCameraFov / fovRef.current,
      getCenterPos: () => ({
        x: feet.current.x / SRef.current,
        y: feet.current.z / SRef.current,
      }),
      navigateTo: (canvasX: number, canvasY: number) => {
        const s = SRef.current;
        feet.current.set(canvasX * s, 0, canvasY * s);
      },
    });
  }, [registerCanvasControls, camera, project.id, initialCameraFov]);

  return (
    <>
      <Environment3D />
      <ThirdPersonControls
        enabled={tpEnabled && ready}
        moveSpeed={moveSpeed}
        characterFeet={feet}
        facingYaw={facingYaw}
        orbitYaw={orbitYaw}
        orbitPitch={orbitPitch}
        orbitDistance={orbitDistance}
        minPitch={0.18}
        maxPitch={1.25}
        minDistance={5}
        maxDistance={32}
        lookAtY={1.4}
      />
      {tpEnabled && (
        <Character3D
          feetPosition={feet.current}
          color={characterColor}
          scale={0.52}
          facingYawRef={facingYaw}
        />
      )}

      {activeViewers.map((viewer) => {
        if (localIdentity && viewer.id === localIdentity.id) return null;
        if (viewer.projectId !== project.id) return null;
        const pos = resolveViewerPosition(viewer, cursors[viewer.id], { x: 0, y: 0 });
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

      {elements.map((el) => {
        const pos = elementWorldFlat(el, S);
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
            cardPresentation="easel"
          />
        );
      })}
    </>
  );
}
