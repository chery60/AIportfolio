import { Canvas } from '@react-three/fiber';
import type { Project, CanvasElement, SceneViewMode } from '../../types';
import type { ActiveViewer } from '../../hooks/useRealtimeSession';
import ExplorerScene, { type ViewMode3D } from './ExplorerScene';
import PresentationScene from './PresentationScene';
import { DEFAULT_CAMERA_FOV, EYE_HEIGHT } from './constants';
import type { CanvasControlsRef } from '../Canvas';
import { VIEW_MODE_CONFIGS } from '../../types';
import type { GalleryLayoutType } from './GalleryLayout';

export interface PortfolioCanvas3DProps {
  project: Project;
  sceneViewMode: SceneViewMode;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onTransformChange: (scale: number) => void;
  registerCanvasControls: (api: CanvasControlsRef) => void;
  isEditing: boolean;
  isCommentMode: boolean;
  onDeleteElement?: (id: string) => void;
  onUpdateElement?: (element: CanvasElement) => void;
  setCharacterWorldPosition: (x: number, y: number) => void;
  characterColor: string;
  activeViewers: ActiveViewer[];
  cursors: Record<string, { x: number; y: number; projectId: string }>;
  localIdentity: ActiveViewer | null;
  broadcastCursor?: (x: number, y: number) => void;
  galleryLayout?: GalleryLayoutType;
  amongUsModelPath?: string;
  /** Projector model URL under `public/` (FBX via three.js). `null` = procedural screen only. */
  projectorModelPath?: string | null;
}

function asExplorerMode(m: Exclude<SceneViewMode, 'third-person'>): ViewMode3D {
  return m;
}

/**
 * Full-viewport react-three-fiber canvas: third-person presentation (projector slides) or explorer / gallery / cinematic.
 */
export default function PortfolioCanvas3D({
  project,
  sceneViewMode,
  selectedElementId,
  onSelectElement,
  onTransformChange,
  registerCanvasControls,
  isEditing,
  isCommentMode,
  onDeleteElement,
  onUpdateElement,
  setCharacterWorldPosition,
  characterColor,
  activeViewers,
  cursors,
  localIdentity,
  broadcastCursor,
  galleryLayout = 'zigzag',
  amongUsModelPath,
  projectorModelPath,
}: PortfolioCanvas3DProps) {
  void galleryLayout;
  const config = VIEW_MODE_CONFIGS[sceneViewMode];
  const worldScale = config.worldScale;
  const moveSpeed = config.movementSpeed * 0.5;
  const initialFov = config.cameraFov ?? DEFAULT_CAMERA_FOV;

  const sharedSceneProps = {
    project,
    worldScale,
    moveSpeed,
    characterColor,
    selectedElementId,
    onSelectElement,
    isEditing,
    isCommentMode,
    onDeleteElement,
    onUpdateElement,
    setCharacterWorldPosition,
    broadcastCursor,
    onTransformChange,
    registerCanvasControls,
    activeViewers,
    cursors,
    localIdentity,
    initialCameraFov: initialFov,
  };

  return (
    <Canvas
      shadows
      camera={{
        fov: initialFov,
        near: 0.08,
        far: 560,
        position: [0, EYE_HEIGHT, 12],
      }}
      gl={{ antialias: true, alpha: false }}
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      {sceneViewMode === 'third-person' ? (
        <PresentationScene
          {...sharedSceneProps}
          amongUsModelPath={amongUsModelPath}
          projectorModelPath={projectorModelPath}
        />
      ) : (
        <ExplorerScene
          {...sharedSceneProps}
          viewMode={asExplorerMode(sceneViewMode)}
        />
      )}
    </Canvas>
  );
}
