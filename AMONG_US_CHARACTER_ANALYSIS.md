# Among Us Character Movement & Navigation Analysis

## Overview
This portfolio project features an interactive Among Us character that navigates a canvas-based environment with real-time movement, collision detection, and element interaction. The character moves smoothly toward cursor targets while respecting boundaries of canvas elements.

---

## 1. CHARACTER SIZE & DIMENSIONS

### Visual Dimensions
- **Width**: 36px
- **Height**: 44px
- **Anchor Point**: Top-left offset by `-18px` horizontally and `-44px` vertically (centers the character)
- **Z-Index**: 50 (always rendered above other elements)
- **Pointer Events**: Disabled (`pointer-events-none`) to allow clicking through to canvas

### Component Breakdown
The character is composed of several visual elements:

1. **Backpack** (back layer)
   - Dimensions: 14px × 22px
   - Position: Top-left offset
   - Rounded corners: 6px
   - Includes shadow gradient for depth

2. **Body** (main torso)
   - Dimensions: 28px × 32px
   - Position: Right side, top-aligned
   - Rounded top (14px radius) and bottom (6px radius)
   - Includes lighting effects (shadow and highlight)

3. **Left Leg** (back leg when moving)
   - Dimensions: 12px × 14px
   - Position: Bottom-left area
   - Animated during walking

4. **Right Leg** (front leg when moving)
   - Dimensions: 12px × 14px
   - Position: Bottom-right area
   - Animated during walking

5. **Visor** (head/helmet)
   - Dimensions: 20px × 12px
   - Position: Top-right with -4px offset
   - Cyan color (#92D1DF) with border
   - Contains shadow and reflection highlights

6. **Shadow** (under character)
   - Oval shape with blur effect
   - Positioned below character for depth perception

---

## 2. CHARACTER MOVEMENT MECHANICS

### Movement System
The character uses a **smooth animation loop** running at 60 FPS via `requestAnimationFrame`.

#### Speed & Acceleration
- **Movement Speed**: 3.0 pixels per frame
- **Acceleration**: Instantaneous (no ramp-up, full speed applied immediately)
- **Movement Threshold**: Stops when within 5 pixels of target (`distance > 5`)

#### Position Tracking
- Uses **refs** for smooth performance without React re-renders:
  - `posRef`: Current character position
  - `targetRef`: Target position (updated from cursor/props)
  - `facingLeftRef`: Direction character is facing
  - `isWalkingRef`: Whether character is actively moving

#### Movement Loop (updatePosition function)
```
1. Calculate vector from current position to target
2. If distance > 5 pixels:
   a. Calculate normalized velocity (dx/distance * speed, dy/distance * speed)
   b. Predict next position (add velocity to current)
   c. Perform collision detection on predicted position
   d. Apply sliding/corner detection if blocked
   e. Update position if movement is valid
3. Update facing direction based on target direction
4. Update walking animation state
5. Apply transform to DOM element for smooth rendering
6. Schedule next frame
```

---

## 3. COLLISION DETECTION & PATHFINDING

### Collision Detection System
The character implements **axis-aligned bounding box (AABB) collision detection** with sliding mechanics.

#### Element Bounds
- Each canvas element has `ElementBounds`: `{ x, y, width, height }`
- A **15px margin** is applied around each element for interaction zones
- Collision checks use: `isInsideElement(px, py, element, margin=15)`

#### Collision Check Formula
```
isInsideElement(px, py, element, margin):
  return (px > el.x - margin && 
          px < el.x + el.width + margin &&
          py > el.y - margin && 
          py < el.y + el.height + margin)
```

### Sliding Mechanics
When the character hits an obstacle, it attempts to slide along it rather than stopping completely.

#### Three Collision Scenarios:

1. **Horizontal Block (hitX = true, hitY = false)**
   - Character blocked moving left/right
   - Freezes X movement: `nextX = posRef.current.x`
   - Boosts Y velocity to full speed to slide vertically
   - Condition: `Math.abs(dy) > 2` (must have significant Y component)
   - Formula: `slideSpeed = dy > 0 ? speed : -speed`
   - Rechecks corners to prevent sliding into adjacent obstacles

2. **Vertical Block (hitY = true, hitX = false)**
   - Character blocked moving up/down
   - Freezes Y movement: `nextY = posRef.current.y`
   - Boosts X velocity to full speed to slide horizontally
   - Condition: `Math.abs(dx) > 2` (must have significant X component)
   - Formula: `slideSpeed = dx > 0 ? speed : -speed`
   - Rechecks corners to prevent sliding into adjacent obstacles

3. **Diagonal Block (hitX = true, hitY = false)**
   - Character blocked on both axes
   - Full stop: both X and Y frozen at current position
   - Simulates pressing against a corner

#### Corner Detection
After sliding, the algorithm performs a final corner check:
```
if (isInsideElement(nextX, nextY, element)):
  Abort movement and return to previous position
```

### Target Clamping (Border Snapping)
When a target is clicked inside an element, it's automatically clamped to that element's edge:

#### clampToBorder Function
```
1. Calculate the 4 distances from target to each edge
2. Identify closest edge
3. Return point on that edge closest to original target
4. Applied to all edge cases (left, right, top, bottom)
```

This prevents the character from trying to reach unreachable locations inside obstacles.

#### Initial Position Handling
When the character mounts with cursor inside an element, it starts at the clamped border position to prevent spawning inside obstacles.

---

## 4. NAVIGATION & TARGET HANDLING

### Target System
The character navigates toward `targetX` and `targetY` props, which are updated from:
- Mouse cursor position (follows cursor movement)
- Canvas click events (seeks to clicked location)

### Target Update Pipeline
1. **Prop Update**: `targetX` and `targetY` props change
2. **Effect Trigger**: `useEffect([targetX, targetY])` fires
3. **Boundary Check**: New target checked against all element bounds
4. **Clamping**: If inside element, clamped to nearest border
5. **Target Set**: `targetRef.current` updated with clamped position
6. **Movement**: Game loop uses updated target

### Element Bounds Management
- `boundsRef`: Updated whenever `elementBounds` prop changes
- Used in all collision detection calculations
- Allows dynamic addition/removal of obstacles

---

## 5. ANIMATION & VISUAL FEEDBACK

### Walking Animation
When moving (`distance > 5px`):
- Character's body bobs up and down: `animate-amongus-bob`
- Left leg animates: `animate-amongus-leg-1`
- Right leg animates: `animate-amongus-leg-2`
- Visor also bobs with body
- State: `isWalkingRef` / `setIsWalking`

When stopped:
- All animations removed
- Character stands still

### Facing Direction
- Character flips horizontally based on target direction
- Threshold: `dx < -0.5` (left) or `dx > 0.5` (right)
- Applied via: `scaleX(-1)` or `scaleX(1)` in transform
- Prevents jittering when target is near horizontal center

### Visual Effects
1. **Drop Shadow Outline**: 2px black shadow on all sides for visibility
2. **Lighting**: Dark gradient on backpack and legs for depth
3. **Visor Shine**: White reflection highlight on visor
4. **Ground Shadow**: Blurred oval shadow below character
5. **Smooth Rendering**: Uses CSS `will-change-transform` for GPU acceleration

### Transform Implementation
Direct DOM manipulation for 60fps smoothness:
```javascript
charRef.current.style.transform = 
  `translate(${posRef.current.x}px, ${posRef.current.y}px) 
   scaleX(${facingLeftRef.current ? -1 : 1})`
```

---

## 6. MOVEMENT CONSTRAINTS & BOUNDARIES

### Movement Stopping Conditions
1. **Distance Threshold**: Stops when distance < 5px
2. **Obstacles**: Stops when hitting element boundaries (after sliding attempts fail)
3. **No Hard Boundaries**: Canvas itself has no visible bounds; character can move infinitely

### Constraint Systems

#### Element Margin Buffer
- 15px interaction zone around each element
- Provides smooth, readable collision behavior
- Slightly larger than visual element size

#### Sliding Constraints
- Only slides if velocity component is significant: `Math.abs(dx) > 2` or `Math.abs(dy) > 2`
- Prevents "sticky" corners from micro-sliding
- Corner checks prevent sliding into adjacent obstacles

#### Movement Validation
- Actual movement threshold: `Math.abs(nextX - posX) > 0.1 or Math.abs(nextY - posY) > 0.1`
- Prevents animation state updates for negligible movements
- Keeps walking animation synchronized with visible motion

### Canvas Integration (useCanvas Hook)
The character movement integrates with the canvas navigation system:
- **Pan/Zoom**: Canvas can be panned and zoomed independently
- **Character Independence**: Character position is in canvas space, not screen space
- **Scaling**: Character size remains constant (not affected by canvas zoom)

---

## 7. ELEMENT INTERACTION

### Canvas Elements
The character can interact with various canvas elements:
- Projects (component cards)
- Sticky notes
- Other UI components
- Custom canvas elements with bounds

### Interaction Flow
1. **Canvas Element Bounds**: Extracted from `selectedProject.canvasElements`
2. **Boundary Passing**: Passed to Character component as `elementBounds` prop
3. **Collision Testing**: Used in every frame for collision checks
4. **Visual Feedback**: Character animation and position change based on obstacles

### Element Types Supported
- Projects with fixed positions and dimensions
- Sticky notes (dynamically added via `handleAddNote`)
- Any element with `{ x, y, width, height }` bounds

---

## 8. PERFORMANCE OPTIMIZATIONS

### Ref-Based State Management
- Uses refs instead of useState for frequently-updated position values
- Avoids React re-renders on every frame
- Direct DOM manipulation for instant, smooth updates

### AnimationFrame Loop
- `requestAnimationFrame` for 60fps smooth animation
- Only one active loop per character instance
- Cleanup on unmount prevents memory leaks

### GPU Acceleration
- CSS `will-change-transform` hints GPU acceleration
- Transform-only updates (no layout recalculations)
- Efficient CSS filter for drop shadow outline

### Collision Detection Optimization
- Only axis-aligned checks (no complex polygon detection)
- Simple distance calculations
- Early exit on multiple obstacles

---

## 9. KEY IMPLEMENTATION DETAILS

### Movement Vector Calculation
```javascript
const dx = targetRef.current.x - posRef.current.x;
const dy = targetRef.current.y - posRef.current.y;
const distance = Math.sqrt(dx * dx + dy * dy);

// Normalized velocity (capped at speed)
const vx = (dx / distance) * speed;  // 3.0 px/frame
const vy = (dy / distance) * speed;
```

### Sliding Boost Logic
```javascript
// When blocked horizontally, boost vertical sliding speed
const slideSpeed = dy > 0 ? speed : -speed;  // Full speed in sliding direction
if (Math.abs(dy) > 2) {  // Only if significant vertical component
    vy = slideSpeed;
    nextY = posRef.current.y + vy;
}
```

### Facing Direction Threshold
```javascript
if (dx < -0.5 && !facingLeftRef.current) {     // Moving left
    facingLeftRef.current = true;
    setFacingLeft(true);
} else if (dx > 0.5 && facingLeftRef.current) { // Moving right
    facingLeftRef.current = false;
    setFacingLeft(false);
}
```

---

## 10. INTEGRATION WITH APP

### Data Flow
1. **App.tsx**: Manages `selectedProject` and `selectedElementId`
2. **Canvas Component**: Renders character and passes cursor position as target
3. **Character Component**: Navigates toward target with collision detection
4. **BottomToolbar**: Provides zoom/pan controls (separate from character movement)

### Props Chain
```
App.tsx
├── selectedProject (contains canvasElements with bounds)
└── Canvas Component
    ├── character targetX, targetY (from cursor)
    ├── character color (from project data)
    └── character elementBounds (from canvasElements)
```

---

## Summary

The Among Us character implements a **sophisticated navigation system** featuring:
- **Smooth 60fps movement** toward dynamic targets
- **Advanced sliding collision detection** for realistic obstacle interaction
- **Target clamping** to prevent unreachable destinations
- **Directional animation** with walking states and facing direction
- **Performance optimization** through ref-based state and direct DOM updates
- **Flexible obstacle system** supporting dynamic element addition/removal

The design prioritizes **smooth, responsive movement** while maintaining **intelligent obstacle avoidance** through the sliding mechanics system, creating an engaging interactive experience that feels natural and responsive.
