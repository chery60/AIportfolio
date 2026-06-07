import { useMemo, Suspense, type ReactNode } from 'react';
import { useLoader } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import * as THREE from 'three';

export interface ProjectorScreen3DProps {
  /** URL under `public/` (`.fbx`, `.glb`, `.gltf`). Omit or pass `null` for procedural projector only. */
  modelUrl?: string | null;
  /** Group position in world space. */
  position?: [number, number, number];
  /** Target height in world units after normalization. */
  targetHeight?: number;
  /** Extra rotation applied after centering (radians, Euler order XYZ). */
  modelRotation?: [number, number, number];
  /** Local offset (after model group) for the HTML slide plane. */
  screenContentOffset?: [number, number, number];
  /** Local rotation (radians) for the HTML plane so it faces the audience. */
  screenContentRotation?: [number, number, number];
  /** Passed to `Html` `distanceFactor`. */
  screenDistanceFactor?: number;
  children?: ReactNode;
}

function normalizeModelToGround(root: THREE.Object3D, targetHeight: number): THREE.Group {
  const clone = root.clone(true) as THREE.Group;
  clone.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(clone);
  const center = box.getCenter(new THREE.Vector3());
  clone.position.sub(center);
  clone.updateMatrixWorld(true);
  const size = new THREE.Box3().setFromObject(clone).getSize(new THREE.Vector3());
  const h = Math.max(size.y, 0.001);
  const s = targetHeight / h;
  clone.scale.multiplyScalar(s);
  clone.updateMatrixWorld(true);
  const box2 = new THREE.Box3().setFromObject(clone);
  clone.position.y -= box2.min.y;
  return clone;
}

function applyModelRotationAndReground(
  n: THREE.Group,
  modelRotation?: [number, number, number]
) {
  const [rx, ry, rz] = modelRotation ?? [0, 0, 0];
  n.rotation.set(rx, ry, rz);
  n.updateMatrixWorld(true);
  const box2 = new THREE.Box3().setFromObject(n);
  n.position.y -= box2.min.y;
}

type LoadedProjectorExtras = Required<Pick<ProjectorScreen3DProps, 'targetHeight'>> &
  Pick<
    ProjectorScreen3DProps,
    | 'modelRotation'
    | 'screenContentOffset'
    | 'screenContentRotation'
    | 'screenDistanceFactor'
    | 'children'
  >;

function SlideHtmlOverlay({
  screenContentOffset,
  screenContentRotation,
  screenDistanceFactor,
  children,
}: Pick<
  ProjectorScreen3DProps,
  'screenContentOffset' | 'screenContentRotation' | 'screenDistanceFactor' | 'children'
>) {
  const offset = screenContentOffset ?? [0, 1.35, 0.06];
  const rot = screenContentRotation ?? [0, Math.PI, 0];
  const dist = screenDistanceFactor ?? 7.5;

  return (
    <group position={offset} rotation={rot}>
      <Html transform center distanceFactor={dist} zIndexRange={[80, 0]} style={{ pointerEvents: 'auto' }}>
        <div className="canvas-3d-html-root presentation-screen-html" style={{ pointerEvents: 'auto' }}>
          {children}
        </div>
      </Html>
    </group>
  );
}

/** FBX-loaded projector. */
function ProjectorFbxModel({ url, targetHeight, modelRotation, ...rest }: LoadedProjectorExtras & { url: string }) {
  const raw = useLoader(FBXLoader, url);

  const normalized = useMemo(() => {
    const g = raw as unknown as THREE.Object3D;
    const n = normalizeModelToGround(g, targetHeight);
    applyModelRotationAndReground(n, modelRotation);
    return n;
  }, [raw, targetHeight, modelRotation]);

  return (
    <group>
      <primitive object={normalized} />
      {rest.children != null && (
        <SlideHtmlOverlay
          screenContentOffset={rest.screenContentOffset}
          screenContentRotation={rest.screenContentRotation}
          screenDistanceFactor={rest.screenDistanceFactor}
          children={rest.children}
        />
      )}
    </group>
  );
}

/** glTF projector */
function ProjectorGltfModel({ url, targetHeight, modelRotation, ...rest }: LoadedProjectorExtras & { url: string }) {
  const { scene } = useGLTF(url);

  const normalized = useMemo(() => {
    const n = normalizeModelToGround(scene, targetHeight);
    applyModelRotationAndReground(n, modelRotation);
    return n;
  }, [scene, targetHeight, modelRotation]);

  return (
    <group>
      <primitive object={normalized} />
      {rest.children != null && (
        <SlideHtmlOverlay
          screenContentOffset={rest.screenContentOffset}
          screenContentRotation={rest.screenContentRotation}
          screenDistanceFactor={rest.screenDistanceFactor}
          children={rest.children}
        />
      )}
    </group>
  );
}

function isGltfUrl(url: string) {
  return /\.(glb|gltf)(\?|$)/i.test(url);
}

function LoadedProjectorModel(props: LoadedProjectorExtras & { url: string }) {
  return isGltfUrl(props.url) ? <ProjectorGltfModel {...props} /> : <ProjectorFbxModel {...props} />;
}

/**
 * Clean theater screen — white frame, bright surface, content faces +Z (toward camera).
 * No Y-axis flip: the group sits at world Z=-5, camera is at +Z, so content naturally
 * faces the camera without any rotation.
 */
function FallbackProjector({
  screenContentOffset,
  screenContentRotation,
  screenDistanceFactor,
  children,
}: Pick<
  ProjectorScreen3DProps,
  'screenContentOffset' | 'screenContentRotation' | 'screenDistanceFactor' | 'children'
>) {
  const SCREEN_W = 16.0;
  const SCREEN_H = 9.0;
  const SCREEN_CY = 5.0;   // center Y — bottom at 0.5, top at 9.5 (cinema scale)
  const FRAME_T = 0.28;    // frame border thickness

  // Faces +Z (toward camera at positive Z). No Y-rotation needed.
  const offset = screenContentOffset ?? [0, SCREEN_CY, 0.07];
  const rot = screenContentRotation ?? [0, 0, 0];
  const dist = screenDistanceFactor ?? 5.2;

  return (
    <group>
      {/* Outer cream/off-white frame */}
      <mesh position={[0, SCREEN_CY, 0]} castShadow receiveShadow>
        <boxGeometry args={[SCREEN_W + FRAME_T * 2, SCREEN_H + FRAME_T * 2, 0.1]} />
        <meshStandardMaterial color="#D6D2C4" roughness={0.75} metalness={0.04} />
      </mesh>

      {/* Inner screen surface — white, gently self-illuminated */}
      <mesh position={[0, SCREEN_CY, 0.055]}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshStandardMaterial
          color="#FAFAF6"
          emissive="#F5F2E8"
          emissiveIntensity={0.14}
          roughness={0.96}
          metalness={0}
        />
      </mesh>

      {/* Left stand leg — screen bottom is at SCREEN_CY - SCREEN_H/2 = 5.0-4.5 = 0.5 */}
      <mesh position={[-7.2, 0.28, -0.04]} castShadow>
        <cylinderGeometry args={[0.09, 0.14, 0.56, 12]} />
        <meshStandardMaterial color="#B8B2A0" roughness={0.65} metalness={0.1} />
      </mesh>
      {/* Right stand leg */}
      <mesh position={[7.2, 0.28, -0.04]} castShadow>
        <cylinderGeometry args={[0.09, 0.14, 0.56, 12]} />
        <meshStandardMaterial color="#B8B2A0" roughness={0.65} metalness={0.1} />
      </mesh>

      {children != null && (
        <group position={offset as [number, number, number]} rotation={rot as [number, number, number]}>
          <Html transform center distanceFactor={dist} zIndexRange={[80, 0]} style={{ pointerEvents: 'auto' }}>
            <div className="canvas-3d-html-root presentation-screen-html" style={{ pointerEvents: 'auto' }}>
              {children}
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}

/**
 * Projector asset + optional `Html` slide content. Loads **FBX** or **glTF** when `modelUrl` is set.
 */
export default function ProjectorScreen3D({
  modelUrl = '/models/projector-screen.fbx',
  position = [0, 0, -5],
  targetHeight = 5.6,
  modelRotation = [-Math.PI / 2, 0, 0],
  screenContentOffset,
  screenContentRotation,
  screenDistanceFactor,
  children,
}: ProjectorScreen3DProps) {
  return (
    <group position={position}>
      {modelUrl ? (
        <Suspense
          fallback={
            <FallbackProjector
              screenContentOffset={screenContentOffset}
              screenContentRotation={screenContentRotation}
              screenDistanceFactor={screenDistanceFactor}
              children={children}
            />
          }
        >
          <LoadedProjectorModel
            url={modelUrl}
            targetHeight={targetHeight}
            modelRotation={modelRotation}
            screenContentOffset={screenContentOffset}
            screenContentRotation={screenContentRotation}
            screenDistanceFactor={screenDistanceFactor}
            children={children}
          />
        </Suspense>
      ) : (
        <FallbackProjector
          screenContentOffset={screenContentOffset}
          screenContentRotation={screenContentRotation}
          screenDistanceFactor={screenDistanceFactor}
          children={children}
        />
      )}
    </group>
  );
}
