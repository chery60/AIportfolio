import { useEffect, useRef, useCallback, type MutableRefObject } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface ThirdPersonControlsProps {
  enabled: boolean;
  moveSpeed: number;
  characterFeet: MutableRefObject<THREE.Vector3>;
  facingYaw: MutableRefObject<number>;
  orbitYaw: MutableRefObject<number>;
  orbitPitch: MutableRefObject<number>;
  orbitDistance: MutableRefObject<number>;
  minPitch: number;
  maxPitch: number;
  minDistance: number;
  maxDistance: number;
  lookAtY: number;
  mouseSensitivity?: number;
}

const tmpForward = new THREE.Vector3();
const tmpRight = new THREE.Vector3();
const tmpMove = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const intersectPoint = new THREE.Vector3();

export default function ThirdPersonControls({
  enabled,
  moveSpeed,
  characterFeet,
  facingYaw,
  orbitYaw,
  orbitPitch,
  orbitDistance,
  minPitch,
  maxPitch,
  minDistance,
  maxDistance,
  lookAtY,
  mouseSensitivity = 0.003,
}: ThirdPersonControlsProps) {
  const { camera, gl } = useThree();
  const keys = useRef(new Set<string>());
  const rightDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const mouseNDC = useRef(new THREE.Vector2(0, 0));
  const isPointerLocked = useRef(false);
  const targetFacingYaw = useRef(0);

  const requestPointerLock = useCallback(() => {
    const el = gl.domElement;
    if (document.pointerLockElement !== el) {
      el.requestPointerLock?.();
    }
  }, [gl.domElement]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k)) {
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

  useEffect(() => {
    const onLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === gl.domElement;
    };
    document.addEventListener('pointerlockchange', onLockChange);
    return () => document.removeEventListener('pointerlockchange', onLockChange);
  }, [gl.domElement]);

  useEffect(() => {
    const el = gl.domElement;

    const onDown = (e: PointerEvent) => {
      if (!enabled) return;
      
      if (e.button === 0) {
        requestPointerLock();
      }
      
      if (e.button === 2) {
        rightDragging.current = true;
        lastPointer.current = { x: e.clientX, y: e.clientY };
        e.preventDefault();
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!enabled) return;

      if (isPointerLocked.current) {
        const dx = e.movementX;
        targetFacingYaw.current -= dx * mouseSensitivity;
        orbitYaw.current -= dx * mouseSensitivity;
        
        const dy = e.movementY;
        orbitPitch.current = THREE.MathUtils.clamp(
          orbitPitch.current + dy * 0.002,
          minPitch,
          maxPitch
        );
      } else {
        const rect = el.getBoundingClientRect();
        const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        mouseNDC.current.set(ndcX, ndcY);

        if (rightDragging.current) {
          const dx = e.clientX - lastPointer.current.x;
          const dy = e.clientY - lastPointer.current.y;
          lastPointer.current = { x: e.clientX, y: e.clientY };
          orbitYaw.current -= dx * 0.005;
          orbitPitch.current = THREE.MathUtils.clamp(
            orbitPitch.current + dy * 0.004,
            minPitch,
            maxPitch
          );
        }
      }
    };

    const onUp = (e: PointerEvent) => {
      if (e.button === 2) {
        rightDragging.current = false;
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (!enabled) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? 1.5 : -1.5;
      orbitDistance.current = THREE.MathUtils.clamp(
        orbitDistance.current + delta,
        minDistance,
        maxDistance
      );
    };

    const onContextMenu = (e: Event) => {
      e.preventDefault();
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('contextmenu', onContextMenu);

    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('contextmenu', onContextMenu);
    };
  }, [gl.domElement, enabled, minPitch, maxPitch, minDistance, maxDistance, mouseSensitivity, requestPointerLock]);

  useFrame((_, dt) => {
    if (!enabled) return;

    const char = characterFeet.current;

    if (!isPointerLocked.current && !rightDragging.current) {
      raycaster.setFromCamera(mouseNDC.current, camera);
      if (raycaster.ray.intersectPlane(groundPlane, intersectPoint)) {
        const dx = intersectPoint.x - char.x;
        const dz = intersectPoint.z - char.z;
        if (dx * dx + dz * dz > 1) {
          targetFacingYaw.current = Math.atan2(dx, dz);
        }
      }
    }

    const angleDiff = ((targetFacingYaw.current - facingYaw.current + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    const rotateSpeed = 8;
    facingYaw.current += angleDiff * Math.min(1, rotateSpeed * dt);

    const thMove = facingYaw.current;
    tmpForward.set(Math.sin(thMove), 0, Math.cos(thMove)).normalize();
    tmpRight.set(Math.cos(thMove), 0, -Math.sin(thMove)).normalize();

    tmpMove.set(0, 0, 0);
    if (keys.current.has('arrowup') || keys.current.has('w')) tmpMove.add(tmpForward);
    if (keys.current.has('arrowdown') || keys.current.has('s')) tmpMove.sub(tmpForward);
    if (keys.current.has('arrowright') || keys.current.has('d')) tmpMove.add(tmpRight);
    if (keys.current.has('arrowleft') || keys.current.has('a')) tmpMove.sub(tmpRight);

    if (tmpMove.lengthSq() > 0) {
      tmpMove.normalize();
      const step = moveSpeed * Math.min(dt, 0.05);
      char.x += tmpMove.x * step;
      char.z += tmpMove.z * step;
    }

    const r = THREE.MathUtils.clamp(orbitDistance.current, minDistance, maxDistance);
    const phi = orbitPitch.current;
    const th = orbitYaw.current;

    const h = r * Math.cos(phi);
    const offsetX = h * Math.sin(th);
    const offsetY = r * Math.sin(phi);
    const offsetZ = h * Math.cos(th);

    camera.position.set(char.x + offsetX, char.y + offsetY + 0.85, char.z + offsetZ);
    camera.lookAt(char.x, lookAtY, char.z);
  });

  return null;
}
