import type { Project } from '../types';

export const webcrmProject: Project = {
  id: 'webcrm',
  title: 'Venture CRM — Product OS',
  description: 'A unified platform defining the entire product development lifecycle: from AI-driven PRDs to Canvas brainstorming, task generation, calendar management, and workspace isolation.',
  category: 'Vibe Coded',
  year: '2026',
  tags: ['Next.js', 'AI', 'Excalidraw', 'TipTap', 'Vibe Coded'],
  accentColor: '#10B981',
  gradientFrom: '#10B981',
  gradientTo: '#3B82F6',
  defaultView: { x: 290, y: 42, scale: 0.72 },
  canvasSize: { width: 2700, height: 6000 },
  files: [
    { id: 'f1', label: 'GitHub Repository', type: 'link' },
    { id: 'f2', label: 'Live Demo', type: 'link' },
  ],
  assets: [
    { id: 'a1', label: 'PRD Generation', thumbnailColor: '#10B981', type: 'component' },
    { id: 'a2', label: 'Canvas Diagrams', thumbnailColor: '#3B82F6', type: 'component' },
    { id: 'a3', label: 'Task Management', thumbnailColor: '#8B5CF6', type: 'component' },
    { id: 'a4', label: 'Workspace Isolation', thumbnailColor: '#F59E0B', type: 'component' },
  ],
  canvasElements: [

    // ══════════════════════════════════════════════════════════════════════
    // SECTION 1: PROJECT OVERVIEW
    // ══════════════════════════════════════════════════════════════════════
    {
      id: 'sl-1', type: 'section-label', x: 80, y: 60, width: 340, height: 40,
      data: { title: 'PROJECT OVERVIEW', color: '#10B981' }
    },
    {
      id: 'cs-1', type: 'case-study-card', x: 80, y: 116, width: 560, height: 340,
      data: {
        title: 'Venture CRM — Unified Product Development OS',
        subtitle: 'Full-stack Platform · Vibe Coded · 2026',
        description: "Currently, product teams juggle a myriad of fragmented tools for PRDs, wireframing, feature tracking, and calendar management. Venture CRM is built to unify the entire product development lifecycle in a single workspace. From creating an AI-assisted PRD in a TipTap editor to brainstorming with a tightly integrated Excalidraw canvas, this platform seamlessly converts requirements into tasks and manages them on a dynamic calendar.",
        tags: ['Product Lifecycle', 'Unified OS', 'AI-Assisted', 'Workspaces'],
        accentColor: '#10B981',
        metrics: [
          { label: 'Diagram Types', value: '15' },
          { label: 'Integration', value: '100%' },
          { label: 'Role Based', value: 'Access' },
        ],
      }
    },

    // ── THE VISION ──────────────────────────────────────────────────────
    {
      id: 'sl-vision', type: 'section-label', x: 720, y: 60, width: 340, height: 40,
      data: { title: 'THE VISION', color: '#3B82F6' }
    },
    {
      id: 'q-vision', type: 'quote-block', x: 720, y: 116, width: 280, height: 280,
      data: {
        quote: '"What if a Product Manager could start with a simple PRD, and the system automatically generated the architecture diagrams, created the tasks, and plotted them on the team\'s calendar?"',
        author: 'Venture CRM',
        role: 'The driving concept',
        accentColor: '#10B981',
      }
    },
    {
      id: 'q-vision2', type: 'quote-block', x: 1020, y: 116, width: 280, height: 280,
      data: {
        quote: '"We are eliminating the context-switching penalty. No more jumping between Notion, Figma, and Jira. Everything lives in one deeply integrated workspace."',
        author: 'The Solution',
        role: 'A unified single source of truth',
        accentColor: '#3B82F6',
      }
    },
    {
      id: 'sn-vision1', type: 'sticky-note', x: 720, y: 410, width: 240, height: 130,
      data: { content: '🎯 Single Source of Truth\nThe PRD is the master document. The diagrams and tasks are inherently linked to the text.', color: 'green', rotation: -0.5 }
    },
    {
      id: 'sn-vision2', type: 'sticky-note', x: 1000, y: 410, width: 240, height: 130,
      data: { content: '🤖 Smart Automation\nAI analyzes the PRD headings to generate fully layout-mapped diagrams.', color: 'cyan', rotation: 0.8 }
    },

    // ══════════════════════════════════════════════════════════════════════
    // SECTION 2: THE PROBLEM
    // ══════════════════════════════════════════════════════════════════════
    {
      id: 'sl-prob', type: 'section-label', x: 80, y: 556, width: 340, height: 40,
      data: { title: 'THE PROBLEM', color: '#EF4444' }
    },
    {
      id: 'sn-prob1', type: 'sticky-note', x: 80, y: 612, width: 240, height: 145,
      data: { content: '💔 Fragmented Workflows\nTeams lose velocity translating requirements from docs to diagrams to task boards.', color: 'pink', rotation: -1 }
    },
    {
      id: 'sn-prob2', type: 'sticky-note', x: 400, y: 612, width: 240, height: 145,
      data: { content: '🔍 Orphaned Data\nWhen tools are separated, updating the PRD doesn\'t update the tickets or the architecture diagrams.', color: 'yellow', rotation: 1.2 }
    },
    {
      id: 'sn-prob3', type: 'sticky-note', x: 720, y: 612, width: 240, height: 145,
      data: { content: '🚧 Workspace Chaos\nManaging who has access to what across 5 different platforms is a security and administrative nightmare.', color: 'cyan', rotation: -0.5 }
    },
    {
      id: 'sn-prob4', type: 'sticky-note', x: 1040, y: 612, width: 240, height: 145,
      data: { content: '⏱️ High Latency\nThe lag time between writing a PRD and developers actually starting to build is too high.', color: 'purple', rotation: 0.8 }
    },

    // ══════════════════════════════════════════════════════════════════════
    // SECTION 3: THE 4 FEATURES
    // ══════════════════════════════════════════════════════════════════════
    {
      id: 'sl-features', type: 'section-label', x: 80, y: 837, width: 400, height: 40,
      data: { title: 'THE CORE PLATFORM FEATURES', color: '#8B5CF6' }
    },

    // ── Feature 1: AI PRD Generation ─────────────────────────────────────────
    {
      id: 'cs-f1', type: 'case-study-card', x: 80, y: 893, width: 560, height: 340,
      data: {
        title: '📝 AI-Driven PRD Editor',
        subtitle: 'Collaborative Rich Text Editing with TipTap',
        description: "The core of the product lifecycle is the PRD. The platform features a customized TipTap editor that supports inline conversational AI. Users can chat with an AI assistant specifically trained to generate structured PRD sections. The system preserves heading structures (h1, h2, etc.) as semantic markers, which later act as the crucial context for diagram and task generation. The editor also supports embedding live Excalidraw canvases directly inline.",
        tags: ['TipTap', 'Conversational AI', 'Semantic Headings', 'Inline Canvas'],
        accentColor: '#10B981',
        metrics: [
          { label: 'Editor', value: 'Rich Text' },
          { label: 'Assistant', value: 'Contextual' },
          { label: 'Structure', value: 'Semantic' },
        ],
      }
    },

    // ── Feature 2: Canvas Integration ────────────────────────────────────
    {
      id: 'cs-f2', type: 'case-study-card', x: 720, y: 893, width: 560, height: 340,
      data: {
        title: '🎨 Intelligent Diagram Generation',
        subtitle: 'Semantic Extraction + Deterministic Layout',
        description: "Instead of relying on AI to hallucinate (x,y) pixel coordinates, the system uses a robust two-phase pipeline. First, the AI reads the PRD and extracts a semantic JSON graph (nodes, edges, grouping). Next, a deterministic layout engine maps this graph onto an Excalidraw canvas, applying precise hierarchical, grid, or flow layouts. It supports 15 different diagram types ranging from Information Architecture and User Flows to ERDs and Risk Matrices.",
        tags: ['Excalidraw', '2-Phase Generation', 'Deterministic Layout', '15 Diagram Types'],
        accentColor: '#3B82F6',
        metrics: [
          { label: 'Diagrams', value: '15 Types' },
          { label: 'Layout', value: 'Deterministic' },
          { label: 'AI Role', value: 'Semantic Graph' },
        ],
      }
    },

    // ── Feature 3: Task & Calendar ────────────────────────────────────────────
    {
      id: 'cs-f3', type: 'case-study-card', x: 80, y: 1313, width: 560, height: 340,
      data: {
        title: '📅 Task Management & Calendar',
        subtitle: 'From Brainstorming to Execution',
        description: "Once the PRD and architecture are mapped, the platform bridges the gap to execution. Features and tasks are generated directly from the PRD requirements and brainstorming sessions. These tasks are assigned to users and immediately synchronized to a comprehensive team Calendar View. PMs can manage deadlines, track progress, and visually ensure no tasks overlap improperly—all within the very same application.",
        tags: ['Calendar View', 'Task Generation', 'Deadline Tracking', 'Execution Alignment'],
        accentColor: '#8B5CF6',
        metrics: [
          { label: 'Sync', value: 'Instant' },
          { label: 'View', value: 'Calendar' },
          { label: 'Tracking', value: 'End-to-End' },
        ],
      }
    },

    // ── Feature 4: Workspaces ───────────────────────────────────────────────
    {
      id: 'cs-f4', type: 'case-study-card', x: 720, y: 1313, width: 560, height: 340,
      data: {
        title: '🏢 Workspace Isolation',
        subtitle: 'Secure Multi-Tenant Architecture',
        description: "Security and data organization are handled via strict Workspace Isolation. Users can create distinct workspaces, invite employees via OTP/magic links, and manage roles. Every PRD, diagram, and task is scoped strictly to its parent workspace. The database uses robust Row Level Security (RLS) policies and automated triggers to ensure no orphaned projects can ever leak across organizational boundaries.",
        tags: ['Supabase Auth', 'RLS Policies', 'Multi-Tenant', 'OTP Invites'],
        accentColor: '#F59E0B',
        metrics: [
          { label: 'Security', value: 'Strict RLS' },
          { label: 'Isolation', value: 'By Workspace' },
          { label: 'Auth', value: 'Magic Link/OTP' },
        ],
      }
    },

    // ══════════════════════════════════════════════════════════════════════
    // SECTION 4: HOW IT WORKS — ARCHITECTURE
    // ══════════════════════════════════════════════════════════════════════
    {
      id: 'sl-arch', type: 'section-label', x: 80, y: 1733, width: 400, height: 40,
      data: { title: 'DIAGRAM GENERATION ARCHITECTURE', color: '#3B82F6' }
    },
    {
      id: 'fd-arch', type: 'flow-diagram', x: 80, y: 1789, width: 1200, height: 520,
      data: {
        title: 'Two-Phase Canvas Generation Pipeline',
        subtitle: 'AI Semantic Extraction → Deterministic Excalidraw Layout Engine',
        accentColor: '#3B82F6',
        nodes: [
          { id: 'prd', label: 'PRD Content\n(TipTap JSON)', color: '#10B981', x: 40, y: 100, width: 140, height: 100 },
          { id: 'extract', label: 'AI Semantic\nGraph Extraction', color: '#8B5CF6', x: 260, y: 100, width: 160, height: 100 },
          { id: 'graph', label: 'JSON Graph Data\n(Nodes, Edges, Groups)', color: '#F59E0B', x: 480, y: 100, width: 180, height: 100 },
          { id: 'layout', label: 'Deterministic\nLayout Engine', color: '#EC4899', x: 740, y: 100, width: 160, height: 100 },
          { id: 'canvas', label: 'Excalidraw Canvas\n(Valid Elements)', color: '#3B82F6', x: 980, y: 100, width: 160, height: 100 },
        ],
        connections: [
          { from: 'prd', to: 'extract' },
          { from: 'extract', to: 'graph' },
          { from: 'graph', to: 'layout' },
          { from: 'layout', to: 'canvas' },
        ],
      }
    },

    // ══════════════════════════════════════════════════════════════════════
    // SECTION 5: EXTRACTION PIPELINE
    // ══════════════════════════════════════════════════════════════════════
    {
      id: 'sl-pipeline', type: 'section-label', x: 80, y: 2389, width: 400, height: 40,
      data: { title: 'THE AI PIPELINE', color: '#F59E0B' }
    },
    {
      id: 'ps-1', type: 'process-step', x: 80, y: 2445, width: 240, height: 240,
      data: { stepNumber: 1, title: 'Content Selection', description: 'User clicks "Generate" and selects a diagram type (e.g., Information Architecture). Plain text is extracted from the rich text PRD preserving heading structures.', color: '#10B981' }
    },
    {
      id: 'ps-2', type: 'process-step', x: 370, y: 2445, width: 240, height: 240,
      data: { stepNumber: 2, title: 'Context Augmentation', description: 'Existing canvas elements are parsed to inform the AI of the current visual state so that it doesn\'t duplicate existing diagrams.', color: '#3B82F6' }
    },
    {
      id: 'ps-3', type: 'process-step', x: 660, y: 2445, width: 240, height: 240,
      data: { stepNumber: 3, title: 'Semantic Output', description: 'The AI uses a strict JSON schema to return a purely structural Graph (Nodes and Edges), grouped logically based on the PRD sections.', color: '#8B5CF6' }
    },
    {
      id: 'ps-4', type: 'process-step', x: 950, y: 2445, width: 240, height: 240,
      data: { stepNumber: 4, title: 'Element Normalization', description: 'The layout engine translates the graph into raw Excalidraw JSON. Normalization ensures lines have start/end bindings and text is bound correctly to shapes.', color: '#F59E0B' }
    },
    {
      id: 'ps-5', type: 'process-step', x: 80, y: 2720, width: 240, height: 240,
      data: { stepNumber: 5, title: 'Progressive Rendering', description: 'For massive diagrams, the layout engine generates the output in "chunks" (e.g. section 1 of 3) to keep the UI snappy and give the user live feedback.', color: '#EC4899' }
    },
    {
      id: 'ps-6', type: 'process-step', x: 370, y: 2720, width: 240, height: 240,
      data: { stepNumber: 6, title: 'Scene Update', description: 'The Excalidraw scene is updated deterministically. Elements are appended without overwriting the user\'s previous handcrafted work.', color: '#10B981' }
    },

    // ══════════════════════════════════════════════════════════════════════
    // SECTION 6: SUPPORTED DIAGRAM TYPES
    // ══════════════════════════════════════════════════════════════════════
    {
      id: 'sl-data', type: 'section-label', x: 80, y: 2985, width: 400, height: 40,
      data: { title: 'SUPPORTED DIAGRAM TYPES', color: '#A855F7' }
    },
    {
      id: 'dd-1', type: 'data-dimension', x: 80, y: 3041, width: 360, height: 190,
      data: { dimension: 'Planning & Design', title: 'Information Architecture, User Flow, Journey Map, Wireframe, Persona', highlight: 'UX & Arch', min: '5', max: 'Types', typical: 'Planning', accentColor: '#10B981' }
    },
    {
      id: 'dd-2', type: 'data-dimension', x: 480, y: 3041, width: 360, height: 190,
      data: { dimension: 'Technical', title: 'System Architecture, Data Model (ERD), API Design', highlight: 'Dev & DB', min: '3', max: 'Types', typical: 'Technical', accentColor: '#3B82F6' }
    },
    {
      id: 'dd-3', type: 'data-dimension', x: 880, y: 3041, width: 360, height: 190,
      data: { dimension: 'Analysis', title: 'Competitive Analysis, Edge Cases, Risk Matrix, Stakeholder Map, Feature Priority', highlight: 'Strategy', min: '5', max: 'Types', typical: 'Analysis', accentColor: '#8B5CF6' }
    },
    {
      id: 'dd-4', type: 'data-dimension', x: 80, y: 3311, width: 360, height: 190,
      data: { dimension: 'Agile & PM', title: 'Sprint Planning, Release Timeline', highlight: 'Execution', min: '2', max: 'Types', typical: 'PM Tasks', accentColor: '#F59E0B' }
    },

    // ══════════════════════════════════════════════════════════════════════
    // SECTION 7: TECH STACK
    // ══════════════════════════════════════════════════════════════════════
    {
      id: 'sl-tech', type: 'section-label', x: 80, y: 3581, width: 340, height: 40,
      data: { title: 'TECHNOLOGY STACK', color: '#10B981' }
    },
    {
      id: 'tc-1', type: 'tag-cluster', x: 80, y: 3637, width: 940, height: 110,
      data: {
        title: 'TECHNOLOGY STACK',
        tags: [
          { label: 'Next.js App Router', color: '#000000' },
          { label: 'Supabase Auth & DB', color: '#3ECF8E' },
          { label: 'TipTap Editor', color: '#FF5B7F' },
          { label: 'Excalidraw Canvas', color: '#8B5CF6' },
          { label: 'Gemini AI API', color: '#F59E0B' },
          { label: 'Row Level Security', color: '#3B82F6' },
        ]
      }
    },

    // ══════════════════════════════════════════════════════════════════════
    // SECTION 8: WRAP UP + GAME
    // ══════════════════════════════════════════════════════════════════════
    {
      id: 'sl-thanks', type: 'section-label', x: 80, y: 3883, width: 480, height: 40,
      data: { title: '👋 THAT\'S VENTURE CRM', color: '#10B981' }
    },
    {
      id: 'cs-thanks', type: 'case-study-card', x: 80, y: 3939, width: 1080, height: 280,
      data: {
        title: 'The entire product development lifecycle, finally unified.',
        subtitle: 'PRDs · Diagrams · Tasks · Calendar',
        description: "Venture CRM solves the context-switching penalty by integrating the most important tools a product team uses into a single workspace. With an AI-driven PRD editor that deterministically generates complex architecture diagrams, seamless task generation, and strict workspace isolation, teams can move from idea to execution faster and more securely than ever before.",
        tags: ['Productivity', 'Unified OS', 'Let\'s connect'],
        accentColor: '#10B981',
        metrics: [
          { label: 'Workflows', value: 'Unified' },
          { label: 'Speed', value: '10x' },
          { label: 'Ready to Chat?', value: 'Yes!' },
        ],
      }
    },
    {
      id: 'sn-ty1', type: 'sticky-note', x: 80, y: 4299, width: 280, height: 130,
      data: { content: '🎨 No more hallucinated diagrams. Pure deterministic rendering based on semantic AI output.', color: 'cyan', rotation: -1 }
    },
    {
      id: 'sn-ty2', type: 'sticky-note', x: 400, y: 4284, width: 280, height: 130,
      data: { content: '⚡ Built entirely with vibe coding — orchestrating AI to build complex full-stack features.', color: 'green', rotation: 1.2 }
    },
    {
      id: 'sn-ty3', type: 'sticky-note', x: 720, y: 4294, width: 280, height: 130,
      data: { content: '💌 Liked what you saw? Hit "Message Me" on the right panel — let\'s talk!', color: 'purple', rotation: -0.8 }
    },

    // ── GAME ZONE ─────────────────────────────────────────────────────────
    {
      id: 'sl-game', type: 'section-label', x: 80, y: 4524, width: 480, height: 40,
      data: { title: '🎮 CREWMATE DASH — PLAY & HIRE ME', color: '#10B981' }
    },
    {
      id: 'gz-1', type: 'game-zone', x: 80, y: 4580, width: 1160, height: 680,
      data: {
        title: 'Crewmate Dash',
        accentColor: '#10B981',
        contactEmail: 'kc60488charan@gmail.com',
        contactLinkedIn: 'https://linkedin.com/in/saicharan',
      }
    },
    {
      id: 'sn-game-hint', type: 'sticky-note', x: 80, y: 5320, width: 280, height: 120,
      data: { content: '🕹️ Dodge obstacles & get on the leaderboard. Space or tap to jump!', color: 'yellow', rotation: -1.2 }
    },
    {
      id: 'sn-game-hint2', type: 'sticky-note', x: 380, y: 5335, width: 260, height: 110,
      data: { content: '⚠️ Only 1 player at a time — queue up if someone is already playing!', color: 'pink', rotation: 1 }
    },
  ]
};
