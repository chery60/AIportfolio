import type { CanvasElement } from '../../types';

export type GalleryLayoutType = 
  | 'linear'
  | 'curved'
  | 'zigzag'
  | 'grid';

export interface GalleryLayoutConfig {
  type: GalleryLayoutType;
  spacing: number;
  cardHeight: number;
  cardTilt: number;
  pathWidth: number;
  startPosition: [number, number, number];
}

export interface PositionedElement {
  element: CanvasElement;
  position: [number, number, number];
  rotation: [number, number, number];
}

const DEFAULT_CONFIG: GalleryLayoutConfig = {
  type: 'linear',
  spacing: 6,
  cardHeight: 1.8,
  cardTilt: -Math.PI / 4,
  pathWidth: 4,
  startPosition: [0, 0, 0],
};

export function calculateLinearLayout(
  elements: CanvasElement[],
  config: Partial<GalleryLayoutConfig> = {}
): PositionedElement[] {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const results: PositionedElement[] = [];
  
  let currentX = cfg.startPosition[0];
  const y = cfg.cardHeight;
  const z = cfg.startPosition[2];
  
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const side = i % 2 === 0 ? 1 : -1;
    const offset = cfg.pathWidth / 2 + 1;
    
    results.push({
      element: el,
      position: [currentX, y, z + offset * side],
      rotation: [cfg.cardTilt, side === 1 ? Math.PI : 0, 0],
    });
    
    if (i % 2 === 1) {
      currentX += cfg.spacing;
    }
  }
  
  return results;
}

export function calculateCurvedLayout(
  elements: CanvasElement[],
  config: Partial<GalleryLayoutConfig> = {}
): PositionedElement[] {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const results: PositionedElement[] = [];
  
  const radius = Math.max(elements.length * cfg.spacing / (Math.PI * 1.5), 15);
  const angleSpan = Math.PI * 1.2;
  const startAngle = -angleSpan / 2;
  
  const centerX = cfg.startPosition[0];
  const centerZ = cfg.startPosition[2] + radius;
  
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const t = elements.length > 1 ? i / (elements.length - 1) : 0.5;
    const angle = startAngle + t * angleSpan;
    
    const x = centerX + Math.sin(angle) * radius;
    const z = centerZ - Math.cos(angle) * radius;
    const faceAngle = angle + Math.PI;
    
    results.push({
      element: el,
      position: [x, cfg.cardHeight, z],
      rotation: [cfg.cardTilt, faceAngle, 0],
    });
  }
  
  return results;
}

export function calculateZigzagLayout(
  elements: CanvasElement[],
  config: Partial<GalleryLayoutConfig> = {}
): PositionedElement[] {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const results: PositionedElement[] = [];
  
  let currentZ = cfg.startPosition[2];
  const baseX = cfg.startPosition[0];
  const offset = cfg.pathWidth / 2 + 2;
  
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const side = i % 2 === 0 ? -1 : 1;
    
    results.push({
      element: el,
      position: [baseX + offset * side, cfg.cardHeight, currentZ],
      rotation: [cfg.cardTilt, side === -1 ? Math.PI * 0.15 : -Math.PI * 0.15, 0],
    });
    
    currentZ += cfg.spacing;
  }
  
  return results;
}

export function calculateGridLayout(
  elements: CanvasElement[],
  config: Partial<GalleryLayoutConfig> = {},
  columns: number = 3
): PositionedElement[] {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const results: PositionedElement[] = [];
  
  const startX = cfg.startPosition[0] - ((columns - 1) * cfg.spacing) / 2;
  let currentZ = cfg.startPosition[2];
  
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const col = i % columns;
    const row = Math.floor(i / columns);
    
    const x = startX + col * cfg.spacing;
    const z = currentZ + row * (cfg.spacing * 1.5);
    
    results.push({
      element: el,
      position: [x, cfg.cardHeight, z],
      rotation: [cfg.cardTilt, 0, 0],
    });
  }
  
  return results;
}

export function calculateGalleryLayout(
  elements: CanvasElement[],
  layoutType: GalleryLayoutType = 'zigzag',
  config: Partial<GalleryLayoutConfig> = {}
): PositionedElement[] {
  switch (layoutType) {
    case 'linear':
      return calculateLinearLayout(elements, config);
    case 'curved':
      return calculateCurvedLayout(elements, config);
    case 'zigzag':
      return calculateZigzagLayout(elements, config);
    case 'grid':
      return calculateGridLayout(elements, config);
    default:
      return calculateZigzagLayout(elements, config);
  }
}

export function getGalleryBounds(positions: PositionedElement[]): {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  centerX: number;
  centerZ: number;
  width: number;
  depth: number;
} {
  if (positions.length === 0) {
    return { minX: 0, maxX: 0, minZ: 0, maxZ: 0, centerX: 0, centerZ: 0, width: 0, depth: 0 };
  }
  
  let minX = Infinity, maxX = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  
  for (const p of positions) {
    minX = Math.min(minX, p.position[0]);
    maxX = Math.max(maxX, p.position[0]);
    minZ = Math.min(minZ, p.position[2]);
    maxZ = Math.max(maxZ, p.position[2]);
  }
  
  return {
    minX,
    maxX,
    minZ,
    maxZ,
    centerX: (minX + maxX) / 2,
    centerZ: (minZ + maxZ) / 2,
    width: maxX - minX,
    depth: maxZ - minZ,
  };
}

export function getSpawnForGallery(positions: PositionedElement[]): [number, number, number] {
  const bounds = getGalleryBounds(positions);
  return [bounds.centerX, 0, bounds.minZ - 5];
}
