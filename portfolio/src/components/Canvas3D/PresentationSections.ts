import type { CanvasElement, CanvasElementType } from '../../types';

const BOUNDS_EXCLUDED_TYPES = new Set<CanvasElementType>(['connector', 'comment-board']);

export interface SectionBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PresentationSection {
  id: string;
  /** section-label title, or element type for the per-element fallback */
  label: string;
  /** section-label accent color, or '' for fallback */
  color: string;
  /** All elements in this section, including the section-label itself */
  elements: CanvasElement[];
  /** Bounding box computed from elements, excluding connectors/comment-boards */
  bounds: SectionBounds;
}

/**
 * Compute the bounding box of the given elements, ignoring types that have no
 * meaningful canvas footprint (connectors, comment-boards).
 */
export function computeSectionBounds(elements: CanvasElement[]): SectionBounds {
  const eligible = elements.filter(e => !BOUNDS_EXCLUDED_TYPES.has(e.type));
  if (eligible.length === 0) return { x: 0, y: 0, width: 400, height: 280 };

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const el of eligible) {
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x + el.width);
    maxY = Math.max(maxY, el.y + el.height);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/**
 * Partition `canvasElements` into presentation sections, one per `section-label`.
 *
 * Algorithm:
 * - Scan the array in declaration order (matches the visual left-to-right / top-to-bottom
 *   layout used in projects.ts).
 * - Each `section-label` opens a new section; all subsequent non-label elements belong
 *   to it until the next `section-label`.
 * - Elements that appear before the first `section-label` are discarded (rare decorations).
 *
 * Fallback: if no `section-label` elements are found at all, returns one section per
 * element (mirrors the previous single-element slide behavior).
 */
export function buildPresentationSections(elements: CanvasElement[]): PresentationSection[] {
  const sections: PresentationSection[] = [];
  let current: {
    id: string;
    label: string;
    color: string;
    elements: CanvasElement[];
  } | null = null;

  for (const el of elements) {
    if (el.type === 'section-label') {
      // Flush previous section
      if (current) {
        sections.push({ ...current, bounds: computeSectionBounds(current.elements) });
      }
      current = {
        id: el.id,
        label: (el.data as { title?: string }).title ?? 'Section',
        color: (el.data as { color?: string }).color ?? '',
        elements: [el],
      };
    } else if (current) {
      current.elements.push(el);
    }
    // else: pre-section elements — discard silently
  }

  // Flush final section
  if (current) {
    sections.push({ ...current, bounds: computeSectionBounds(current.elements) });
  }

  // Fallback: no section-labels found → one slide per element
  if (sections.length === 0) {
    return elements.map(el => ({
      id: el.id,
      label: el.type,
      color: '',
      elements: [el],
      bounds: computeSectionBounds([el]),
    }));
  }

  return sections;
}
