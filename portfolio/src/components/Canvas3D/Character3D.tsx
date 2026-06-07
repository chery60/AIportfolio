import { useFrame } from '@react-three/fiber';
import { useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';

interface Character3DProps {
  /** Mutable world XZ feet position; Y is set internally */
  feetPosition: THREE.Vector3;
  color: string;
  scale?: number;
  /** When provided, crewmate Y rotation follows third-person movement */
  facingYawRef?: MutableRefObject<number>;
}

/**
 * Simple stacked “crewmate” in world space; follows feet XZ each frame.
 */
export default function Character3D({
  feetPosition,
  color,
  scale = 0.45,
  facingYawRef,
}: Character3DProps) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (group.current) {
      group.current.position.x = feetPosition.x;
      group.current.position.z = feetPosition.z;
      group.current.position.y = 0.35 * scale;
      if (facingYawRef) {
        group.current.rotation.y = facingYawRef.current;
      }
    }
  });

  const visor = '#92D1DF';

  return (
    <group ref={group}>
      <group scale={scale}>
        <mesh castShadow position={[0, 0.55, 0]}>
          <capsuleGeometry args={[0.35, 0.65, 6, 12]} />
          <meshStandardMaterial color={color} metalness={0.05} roughness={0.65} />
        </mesh>
        <mesh castShadow position={[-0.38, 0.45, 0]}>
          <boxGeometry args={[0.22, 0.55, 0.45]} />
          <meshStandardMaterial color={color} metalness={0.05} roughness={0.65} />
        </mesh>
        <mesh castShadow position={[0.22, 0.65, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <capsuleGeometry args={[0.12, 0.28, 4, 8]} />
          <meshStandardMaterial color={visor} metalness={0.3} roughness={0.2} />
        </mesh>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.45 * scale, 24]} />
        <meshBasicMaterial color="#000" transparent opacity={0.35} depthWrite={false} />
      </mesh>
    </group>
  );
}
