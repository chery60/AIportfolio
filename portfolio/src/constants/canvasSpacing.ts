/**
 * CANVAS SPACING CONSTANTS
 * ========================
 * These values ensure the Among Us character can always navigate
 * freely between all canvas elements.
 *
 * Character dimensions: 36px wide × 44px tall
 * Collision margin in Character.tsx: 15px on each side
 * → Effective blocked zone per element: width+30px × height+30px
 *
 * To guarantee the character can pass through any gap:
 *   Minimum clear passage needed = character body + comfortable buffer
 *   = 36px (body) + 2×15px (margins) + ~20px (comfort) ≈ 86px
 *
 * We use 80px as the standard gap — generous, visually breathing,
 * and ensures the character can always slip through.
 */

/** Minimum gap between any two horizontally adjacent elements (left edge to right edge) */
export const ELEMENT_GAP_H = 80;

/** Minimum gap between any two vertically adjacent elements (top edge to bottom edge) */
export const ELEMENT_GAP_V = 80;

/** Gap between a section label and the first element below it */
export const SECTION_LABEL_GAP = 55;

/** Left margin — where the first column of elements starts */
export const CANVAS_MARGIN_LEFT = 80;

/** Top margin — where the first row of elements starts */
export const CANVAS_MARGIN_TOP = 60;

/**
 * Character navigation clearance.
 * This is the margin used in Character.tsx around each element's bounding box.
 * Must stay in sync with the `margin` parameter in isInsideElement / clampToBorder.
 */
export const CHARACTER_COLLISION_MARGIN = 15;

/**
 * USAGE GUIDE — Adding new canvas elements
 * =========================================
 * When placing a new element on the canvas, always ensure:
 *
 * 1. HORIZONTAL spacing: next_element.x >= prev_element.x + prev_element.width + ELEMENT_GAP_H
 * 2. VERTICAL spacing:   next_element.y >= prev_element.y + prev_element.height + ELEMENT_GAP_V
 * 3. After a section-label: first_element.y >= label.y + label.height + SECTION_LABEL_GAP
 *
 * Example — placing two cards side by side:
 *   Card A: x=80, width=400  →  Card B: x = 80 + 400 + 80 = 560
 *
 * Example — placing a card below a section label:
 *   Label: y=60, height=40  →  Card: y = 60 + 40 + 55 = 155
 *
 * Example — placing a card below another card:
 *   Card A: y=155, height=300  →  Next section label: y = 155 + 300 + 80 = 535
 */
