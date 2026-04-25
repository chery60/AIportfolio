import type { Project } from '../types';

export const splittoProject: Project = {
  id: 'splitto',
  title: 'SplitTo App',
  description: 'A mobile app to split bills seamlessly with friends. Features OCR receipt scanning and item-level selection for fair splitting.',
  category: 'Wireframed',
  year: '2024',
  tags: ['Mobile App', 'React Native', 'Expo', 'UX Design', 'OCR'],
  accentColor: '#6366F1',
  gradientFrom: '#6366F1',
  gradientTo: '#A855F7',
  defaultView: { x: 290, y: 42, scale: 0.72 },
  canvasSize: { width: 2700, height: 4000 },
  files: [
    { id: 'f1', label: 'Wireframes', type: 'figma' },
    { id: 'f2', label: 'App Architecture', type: 'doc' },
  ],
  assets: [
    { id: 'a1', label: 'OCR Flow', thumbnailColor: '#6366F1', type: 'component' },
    { id: 'a2', label: 'Split Modes', thumbnailColor: '#A855F7', type: 'component' },
    { id: 'a3', label: 'User Management', thumbnailColor: '#EC4899', type: 'component' },
  ],
  canvasElements: [
    // ── SECTION 1: PROJECT OVERVIEW ─────────────────────────────────────
    {
      id: 'sl-1', type: 'section-label', x: 80, y: 60, width: 340, height: 40,
      data: { title: 'PROJECT OVERVIEW', color: '#6366F1' }
    },
    {
      id: 'cs-1', type: 'case-study-card', x: 80, y: 116, width: 560, height: 320,
      data: {
        title: 'SplitTo - Bill Splitting App',
        subtitle: 'Mobile App · React Native / Expo · 2024',
        description: "Whenever a group of friends go to a restaurant, splitting the bill is often a hassle and rarely fair. SplitTo solves this by letting users upload a bill, scanning it using OCR to extract items, and allowing each friend to select exactly what they ordered. The app calculates the exact split fairly.",
        tags: ['React Native', 'Mobile App', 'OCR', 'Supabase'],
        accentColor: '#6366F1',
        metrics: [
          { label: 'Status', value: 'Wireframed' },
          { label: 'Modules', value: '7 Core' },
          { label: 'Tech', value: 'Expo & Zustand' },
        ],
      }
    },

    // ── SECTION 2: THE PROBLEM ──────────────────────────────────────────
    {
      id: 'sl-2', type: 'section-label', x: 720, y: 60, width: 340, height: 40,
      data: { title: 'THE PROBLEM', color: '#EC4899' }
    },
    {
      id: 'sn-prob1', type: 'sticky-note', x: 720, y: 116, width: 240, height: 145,
      data: { content: '🧮 Mental Math\nFiguring out exact amounts with tax and tip is painful.', color: 'pink', rotation: -1 }
    },
    {
      id: 'sn-prob2', type: 'sticky-note', x: 1040, y: 116, width: 240, height: 145,
      data: { content: '😤 Unfair Splits\nDividing evenly when someone only ordered a salad feels unfair.', color: 'yellow', rotation: 1.2 }
    },
    {
      id: 'sn-prob3', type: 'sticky-note', x: 720, y: 341, width: 240, height: 145,
      data: { content: '💬 Awkward Convos\nAsking friends to pay you back can be socially awkward.', color: 'cyan', rotation: 0.5 }
    },

    // ── SECTION 3: THE SOLUTION ─────────────────────────────────────────
    {
      id: 'sl-3', type: 'section-label', x: 80, y: 516, width: 340, height: 40,
      data: { title: 'THE SOLUTION', color: '#10B981' }
    },
    {
      id: 'q-sol', type: 'quote-block', x: 80, y: 572, width: 560, height: 240,
      data: {
        quote: "Upload a receipt, let OCR extract the items, and just tap what you ate. The app handles the math, tax, and tip.",
        author: 'SplitTo Concept',
        role: 'Core Value Proposition',
        accentColor: '#10B981',
      }
    },
    {
      id: 'ps-1', type: 'process-step', x: 80, y: 852, width: 240, height: 180,
      data: { stepNumber: 1, title: 'Upload Receipt', description: 'Take a photo of the restaurant bill.', color: '#6366F1' }
    },
    {
      id: 'ps-2', type: 'process-step', x: 360, y: 852, width: 240, height: 180,
      data: { stepNumber: 2, title: 'OCR Scan', description: 'Google Cloud Vision extracts items and prices.', color: '#A855F7' }
    },
    {
      id: 'ps-3', type: 'process-step', x: 640, y: 852, width: 240, height: 180,
      data: { stepNumber: 3, title: 'Select Items', description: 'Friends select only the items they ordered.', color: '#EC4899' }
    },
    {
      id: 'ps-4', type: 'process-step', x: 920, y: 852, width: 240, height: 180,
      data: { stepNumber: 4, title: 'Fair Split', description: 'Tax and tip are divided proportionally.', color: '#10B981' }
    },

    // ── SECTION 4: HOW IT WORKS (FLOW DIAGRAM) ──────────────────────────
    {
      id: 'sl-4', type: 'section-label', x: 80, y: 1112, width: 400, height: 40,
      data: { title: 'APP ARCHITECTURE & FLOW', color: '#3B82F6' }
    },
    {
      id: 'fd-arch', type: 'flow-diagram', x: 80, y: 1168, width: 800, height: 500,
      data: {
        title: '7 Core Modules',
        subtitle: 'System structure of the React Native application',
        accentColor: '#3B82F6',
        nodes: [
          { id: 'auth', label: 'Auth & Profile\n(Supabase)', color: '#6366F1', x: 40, y: 180, width: 140, height: 100 },
          { id: 'home', label: 'Home Dashboard', color: '#10B981', x: 240, y: 180, width: 140, height: 100 },
          { id: 'split', label: 'Bill Split\n(OCR Engine)', color: '#EC4899', x: 440, y: 40, width: 140, height: 100 },
          { id: 'groups', label: 'Trips/Groups', color: '#A855F7', x: 440, y: 320, width: 140, height: 100 },
          { id: 'history', label: 'History & Timeline', color: '#F59E0B', x: 640, y: 180, width: 140, height: 100 },
        ],
        connections: [
          { from: 'auth', to: 'home', bidirectional: true },
          { from: 'home', to: 'split', bidirectional: true },
          { from: 'home', to: 'groups', bidirectional: true },
          { from: 'split', to: 'history', bidirectional: true },
          { from: 'groups', to: 'history', bidirectional: true },
        ],
      }
    },

    // ── SECTION 5: DESIGN SYSTEM ────────────────────────────────────────
    {
      id: 'sl-ds', type: 'section-label', x: 80, y: 1748, width: 400, height: 40,
      data: { title: 'DESIGN SYSTEM & TOKENS', color: '#8B5CF6' }
    },
    {
      id: 'mc-c1', type: 'metric-card', x: 80, y: 1804, width: 220, height: 120,
      data: { label: 'Primary Brand', value: 'Indigo', change: '#6366F1', changePositive: true, accentColor: '#6366F1' }
    },
    {
      id: 'mc-c2', type: 'metric-card', x: 320, y: 1804, width: 220, height: 120,
      data: { label: 'Secondary Color', value: 'Purple', change: '#A855F7', changePositive: true, accentColor: '#A855F7' }
    },
    {
      id: 'mc-c3', type: 'metric-card', x: 560, y: 1804, width: 220, height: 120,
      data: { label: 'Accent Color', value: 'Pink', change: '#EC4899', changePositive: true, accentColor: '#EC4899' }
    },
    {
      id: 'mc-c4', type: 'metric-card', x: 800, y: 1804, width: 220, height: 120,
      data: { label: 'Color Tokens', value: '60+', change: 'Semantic palette', changePositive: true, accentColor: '#10B981' }
    },

    // ── SECTION 6: TECH STACK ───────────────────────────────────────────
    {
      id: 'tc-tech', type: 'tag-cluster', x: 80, y: 1964, width: 940, height: 110,
      data: {
        title: 'TECHNOLOGY STACK',
        tags: [
          { label: 'Expo SDK 54', color: '#000000' },
          { label: 'React Native', color: '#61DAFB' },
          { label: 'TypeScript', color: '#3178C6' },
          { label: 'Zustand', color: '#764ABC' },
          { label: 'Supabase (Auth/DB)', color: '#3ECF8E' },
          { label: 'React Native Paper', color: '#6200EE' },
          { label: 'Google Cloud Vision', color: '#4285F4' },
          { label: 'Victory Native', color: '#FF6347' },
        ]
      }
    },

    // ── SECTION 7: DATA DIMENSIONS ──────────────────────────────────────
    {
      id: 'sl-data', type: 'section-label', x: 80, y: 2154, width: 400, height: 40,
      data: { title: 'DATA DIMENSIONS', color: '#A855F7' }
    },
    {
      id: 'dd-1', type: 'data-dimension', x: 80, y: 2210, width: 270, height: 190,
      data: { dimension: 'Receipt Items', title: 'Number of items recognized on a single receipt', highlight: 'Items', min: '1', max: '50+', typical: '10–15', accentColor: '#6366F1' }
    },
    {
      id: 'dd-2', type: 'data-dimension', x: 380, y: 2210, width: 270, height: 190,
      data: { dimension: 'Group Size', title: 'Number of friends splitting a single bill', highlight: 'Participants', min: '2', max: '20', typical: '3–6', accentColor: '#EC4899' }
    },
    {
      id: 'dd-3', type: 'data-dimension', x: 680, y: 2210, width: 270, height: 190,
      data: { dimension: 'Split Accuracy', title: 'Precision of calculated splits', highlight: 'Precision', min: 'Cents', max: 'Exact', typical: 'Exact', note: 'Tax & tip proportionally distributed based on individual subtotal.', accentColor: '#10B981' }
    },

    // ── SECTION 8: IMPLEMENTATION STATUS ────────────────────────────────
    {
      id: 'sl-status', type: 'section-label', x: 80, y: 2480, width: 400, height: 40,
      data: { title: 'IMPLEMENTATION STATUS', color: '#F59E0B' }
    },
    {
      id: 'sn-stat1', type: 'sticky-note', x: 80, y: 2536, width: 260, height: 150,
      data: { content: '✅ Completed\n- Database schema w/ RLS\n- Auth system (Email + Guest)\n- Design token system\n- Zustand state management', color: 'green', rotation: -0.5 }
    },
    {
      id: 'sn-stat2', type: 'sticky-note', x: 370, y: 2536, width: 260, height: 150,
      data: { content: '🚧 In Progress\n- Bottom tab navigation\n- Dashboard analytics\n- Core OCR workflow', color: 'yellow', rotation: 0.5 }
    },
    {
      id: 'sn-stat3', type: 'sticky-note', x: 660, y: 2536, width: 260, height: 150,
      data: { content: '📅 Planned\n- Realtime collaboration (Rooms)\n- History & timelines\n- Debt simplification algorithm', color: 'purple', rotation: -0.2 }
    },

    // ── GAME ZONE ───────────────────────────────────────────────────────
    {
      id: 'sl-game', type: 'section-label', x: 80, y: 2766, width: 480, height: 40,
      data: { title: '🎮 CREWMATE DASH — PLAY & HIRE ME', color: '#10B981' }
    },
    {
      id: 'gz-1', type: 'game-zone', x: 80, y: 2822, width: 1160, height: 680,
      data: {
        title: 'Crewmate Dash',
        accentColor: '#10B981',
        contactEmail: 'hello@example.com',
        contactLinkedIn: 'https://linkedin.com/in/example',
      }
    },
  ]
};
