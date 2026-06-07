import { useRef, useMemo, Suspense, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface AmongUsCharacter3DProps {
  feetPosition: THREE.Vector3;
  color: string;
  scale?: number;
  facingYawRef?: MutableRefObject<number>;
  modelPath?: string;
  isMoving?: boolean;
}

const AMONG_US_COLORS: Record<string, string> = {
  red: '#C51111',
  blue: '#132ED1',
  green: '#117F2D',
  pink: '#ED54BA',
  orange: '#EF7D0D',
  yellow: '#F5F557',
  black: '#3F474E',
  white: '#D6E0F0',
  purple: '#6B2FBB',
  brown: '#71491E',
  cyan: '#38FEDC',
  lime: '#50EF39',
  maroon: '#6B2C3B',
  rose: '#ECC0D3',
  banana: '#FFFFBE',
  gray: '#758691',
  tan: '#918877',
  coral: '#EC7458',
};

function getAmongUsColor(colorInput: string): string {
  const lower = colorInput.toLowerCase();
  if (AMONG_US_COLORS[lower]) return AMONG_US_COLORS[lower];
  if (colorInput.startsWith('#')) return colorInput;
  return AMONG_US_COLORS.red;
}

function AmongUsModel({
  feetPosition,
  color,
  scale = 0.52,
  facingYawRef,
  modelPath,
  isMoving = false,
}: AmongUsCharacter3DProps & { modelPath: string }) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath);
  const bobPhase = useRef(0);

  const coloredScene = useMemo(() => {
    const cloned = scene.clone();
    const targetColor = new THREE.Color(getAmongUsColor(color));

    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat.isMeshStandardMaterial) {
          const newMat = mat.clone();
          if (
            child.name.toLowerCase().includes('body') ||
            child.name.toLowerCase().includes('suit') ||
            !child.name.toLowerCase().includes('visor')
          ) {
            newMat.color = targetColor;
          }
          child.material = newMat;
        }
      }
    });

    return cloned;
  }, [scene, color]);

  useFrame((_, dt) => {
    if (!group.current) return;

    group.current.position.x = feetPosition.x;
    group.current.position.z = feetPosition.z;

    if (isMoving) {
      bobPhase.current += dt * 12;
      const bob = Math.sin(bobPhase.current) * 0.05;
      group.current.position.y = bob;
    } else {
      group.current.position.y = 0;
      bobPhase.current = 0;
    }

    if (facingYawRef) {
      group.current.rotation.y = facingYawRef.current;
    }
  });

  return (
    <group ref={group} scale={scale}>
      <primitive object={coloredScene} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.45, 24]} />
        <meshBasicMaterial color="#000" transparent opacity={0.35} depthWrite={false} />
      </mesh>
    </group>
  );
}

function FallbackCharacter({
  feetPosition,
  color,
  scale = 0.52,
  facingYawRef,
  isMoving = false,
}: Omit<AmongUsCharacter3DProps, 'modelPath'>) {
  const group = useRef<THREE.Group>(null);
  const bobPhase = useRef(0);
  const characterColor = getAmongUsColor(color);
  const visorColor = '#92D1DF';

  useFrame((_, dt) => {
    if (!group.current) return;

    group.current.position.x = feetPosition.x;
    group.current.position.z = feetPosition.z;

    if (isMoving) {
      bobPhase.current += dt * 12;
      const bob = Math.sin(bobPhase.current) * 0.05;
      group.current.position.y = 0.35 * scale + bob;
    } else {
      group.current.position.y = 0.35 * scale;
      bobPhase.current = 0;
    }

    if (facingYawRef) {
      group.current.rotation.y = facingYawRef.current;
    }
  });

  return (
    <group ref={group}>
      {/* rotation-y = -π/2 so the visor (+X local) aligns with -Z, matching
          the atan2(dx,dz) yaw formula that points characters toward the screen */}
      <group scale={scale} rotation={[0, -Math.PI / 2, 0]}>
        <mesh castShadow position={[0, 0.55, 0]}>
          <capsuleGeometry args={[0.35, 0.65, 6, 12]} />
          <meshStandardMaterial color={characterColor} metalness={0.05} roughness={0.65} />
        </mesh>
        <mesh castShadow position={[-0.38, 0.45, 0]}>
          <boxGeometry args={[0.22, 0.55, 0.45]} />
          <meshStandardMaterial color={characterColor} metalness={0.05} roughness={0.65} />
        </mesh>
        <mesh castShadow position={[0.22, 0.65, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <capsuleGeometry args={[0.12, 0.28, 4, 8]} />
          <meshStandardMaterial color={visorColor} metalness={0.3} roughness={0.2} />
        </mesh>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.45 * scale, 24]} />
        <meshBasicMaterial color="#000" transparent opacity={0.35} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function AmongUsCharacter3D({
  feetPosition,
  color,
  scale = 0.52,
  facingYawRef,
  modelPath,
  isMoving = false,
}: AmongUsCharacter3DProps) {
  if (modelPath) {
    return (
      <Suspense
        fallback={
          <FallbackCharacter
            feetPosition={feetPosition}
            color={color}
            scale={scale}
            facingYawRef={facingYawRef}
            isMoving={isMoving}
          />
        }
      >
        <AmongUsModel
          feetPosition={feetPosition}
          color={color}
          scale={scale}
          facingYawRef={facingYawRef}
          modelPath={modelPath}
          isMoving={isMoving}
        />
      </Suspense>
    );
  }

  return (
    <FallbackCharacter
      feetPosition={feetPosition}
      color={color}
      scale={scale}
      facingYawRef={facingYawRef}
      isMoving={isMoving}
    />
  );
}

export { AMONG_US_COLORS, getAmongUsColor };
