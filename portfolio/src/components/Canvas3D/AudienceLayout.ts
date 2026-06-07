import * as THREE from 'three';

export interface AudiencePosition {
  feet: THREE.Vector3;
  /** Y rotation (radians) so the character faces the screen center */
  yaw: number;
}

export interface AudienceLayoutConfig {
  /** Number of canvas elements in the project (drives audience size). */
  elementCount: number;
  /** World position the audience should look toward (e.g. screen center). */
  screenLookAt: THREE.Vector3;
  /** Center of the semi-circle on the floor (world XZ). */
  arcCenter: THREE.Vector3;
  /** Radius of the arc in world units. */
  arcRadius?: number;
  /** Total arc angle in radians (spread in front of the screen). */
  arcSpan?: number;
}

/**
 * Theater presentation always uses 5 audience members for visual balance.
 */
export function getAudienceCharacterCount(_elementCount: number): number {
  return 5;
}

/**
 * Places crewmates on a shallow arc facing the screen.
 * Assumes models use +Z as forward (same convention as ThirdPersonControls).
 */
export function calculateAudiencePositions(config: AudienceLayoutConfig): AudiencePosition[] {
  const {
    elementCount,
    screenLookAt,
    arcCenter,
    arcRadius = 5.2,
    arcSpan = Math.PI * 0.72,
  } = config;

  const n = getAudienceCharacterCount(elementCount);
  const out: AudiencePosition[] = [];

  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const angle = -arcSpan / 2 + t * arcSpan;

    const x = arcCenter.x + Math.sin(angle) * arcRadius;
    const z = arcCenter.z + Math.cos(angle) * arcRadius;
    const feet = new THREE.Vector3(x, 0, z);

    const dx = screenLookAt.x - feet.x;
    const dz = screenLookAt.z - feet.z;
    const yaw = Math.atan2(dx, dz);

    out.push({ feet, yaw });
  }

  return out;
}

/** Preset colors for audience variety (names match AMONG_US_COLORS keys where possible). */
export const AUDIENCE_PALETTE = [
  'red',
  'blue',
  'green',
  'pink',
  'orange',
  'yellow',
  'purple',
  'cyan',
  'lime',
  'brown',
  'white',
  'black',
] as const;
