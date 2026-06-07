import { Html } from '@react-three/drei';
import type { CanvasElement } from '../../types';
import CanvasElementRenderer from '../Canvas/CanvasElement';

export type CardPresentation3D = 'upright' | 'easel';

interface CanvasElement3DProps {
  element: CanvasElement;
  position: [number, number, number];
  rotation?: [number, number, number];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  localColor: string;
  isEditing: boolean;
  onDeleteElement?: (id: string) => void;
  onUpdateElement?: (element: CanvasElement) => void;
  cardPresentation?: CardPresentation3D;
  canvasScale?: number;
}

export default function CanvasElement3D({
  element,
  position,
  rotation,
  selectedElementId,
  onSelectElement,
  localColor,
  isEditing,
  onDeleteElement,
  onUpdateElement,
  cardPresentation = 'upright',
  canvasScale = 1,
}: CanvasElement3DProps) {
  const finalRotation: [number, number, number] = rotation ?? [
    cardPresentation === 'easel' ? -Math.PI / 4 : 0,
    0,
    0,
  ];

  return (
    <group position={position} rotation={finalRotation}>
      <Html
        transform
        center
        distanceFactor={9}
        style={{
          width: element.width,
          minHeight: element.height,
          pointerEvents: 'auto',
        }}
        zIndexRange={[50, 0]}
      >
        <div className="canvas-3d-html-root" style={{ pointerEvents: 'auto' }}>
          <CanvasElementRenderer
            element={element}
            isSelected={selectedElementId === element.id}
            onSelect={onSelectElement}
            localColor={localColor}
            isEditing={isEditing}
            canvasScale={canvasScale}
            onDeleteElement={onDeleteElement}
            onUpdateElement={onUpdateElement}
          />
        </div>
      </Html>
    </group>
  );
}
