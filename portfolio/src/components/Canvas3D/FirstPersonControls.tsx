import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { SPRINT_MULTIPLIER } from './constants';

interface FirstPersonControlsProps {
  /** When false, no pointer lock or movement (e.g. cinematic tour) */
  enabled: boolean;
  moveSpeed: number;
  sprintMultiplier?: number;
}

/**
 * WASD / arrows + Shift sprint, mouse look via pointer lock (click canvas).
 */
export default function FirstPersonControls({
  enabled,
  moveSpeed,
  sprintMultiplier = SPRINT_MULTIPLIER,
}: FirstPersonControlsProps) {
  const { camera } = useThree();
  const keys = useRef(new Set<string>());

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();
      if (
        ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(
          k
        )
      ) {
        e.preventDefault();
        keys.current.add(k);
      }
    };
    const up = (e: KeyboardEvent) => {
      keys.current.delete(e.key.toLowerCase());
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  const forward = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const dir = useRef(new THREE.Vector3());
  const yAxis = useRef(new THREE.Vector3(0, 1, 0));

  useFrame((_, dt) => {
    if (!enabled) return;

    camera.getWorldDirection(forward.current);
    forward.current.y = 0;
    if (forward.current.lengthSq() < 1e-6) return;
    forward.current.normalize();

    right.current.crossVectors(forward.current, yAxis.current).normalize();

    dir.current.set(0, 0, 0);
    if (keys.current.has('w') || keys.current.has('arrowup')) dir.current.add(forward.current);
    if (keys.current.has('s') || keys.current.has('arrowdown')) dir.current.sub(forward.current);
    if (keys.current.has('d') || keys.current.has('arrowright')) dir.current.add(right.current);
    if (keys.current.has('a') || keys.current.has('arrowleft')) dir.current.sub(right.current);

    if (dir.current.lengthSq() > 0) {
      dir.current.normalize();
      const speed =
        moveSpeed * (keys.current.has('shift') ? sprintMultiplier : 1) * Math.min(dt, 0.05);
      camera.position.addScaledVector(dir.current, speed);
    }
  });

  if (!enabled) return null;

  return <PointerLockControls />;
}
