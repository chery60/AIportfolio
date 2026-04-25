import type { Project } from '../types';

export const plukrrProject: Project = {
  id: 'plukrr',
  title: 'Plukrr — Web Extractor',
  description: 'A Chrome extension that extracts pixel-perfect UI replicas from any website. Copy elements, extract full pages, live edit, and stitch multi-step flows.',
  category: 'Vibe Coded',
  year: '2025',
  tags: ['Chrome Extension', 'AI', 'Gemini', 'CSS Extraction', 'Vibe Coded'],
  accentColor: '#FF5B7F',
  gradientFrom: '#FF5B7F',
  gradientTo: '#FF8C5B',
  defaultView: { x: 290, y: 42, scale: 0.72 },
  canvasSize: { width: 2700, height: 6060 },
  files: [
    { id: 'f1', label: 'Extension Source', type: 'link' },
    { id: 'f2', label: 'Chrome Web Store', type: 'link' },
  ],
  assets: [
    { id: 'a1', label: 'Copy Element', thumbnailColor: '#FF5B7F', type: 'component' },
    { id: 'a2', label: 'Extract Full Page', thumbnailColor: '#3B82F6', type: 'component' },
    { id: 'a3', label: 'Live Edit', thumbnailColor: '#8B5CF6', type: 'component' },
    { id: 'a4', label: 'Stitch', thumbnailColor: '#10B981', type: 'component' },
  ],
  canvasElements: [

    // ══════════════════════════════════════════════════════════════════════
    // SECTION 1: PROJECT OVERVIEW
    // ══════════════════════════════════════════════════════════════════════
    {
      id: 'sl-1', type: 'section-label', x: 80, y: 60, width: 340, height: 40,
      data: { title: 'PROJECT OVERVIEW', color: '#FF5B7F' }
    },
    {
      id: 'cs-1', type: 'case-study-card', x: 80, y: 116, width: 560, height: 340,
      data: {
        title: 'Plukrr — Pixel-Perfect Web Extractor',
        subtitle: 'Chrome Extension · Vibe Coded · 2025',
        description: "Plukrr is a Chrome extension that lets you extract a 100% accurate replica of any UI on the web. Point at any element or full page, and Plukrr captures the complete DOM tree, computed CSS (including hover/focus/::before/::after states), assets serialized as data URIs, animation data (GSAP, Three.js, CSS keyframes), and generates a pixel-perfect prompt or code output. It's the ultimate tool for designers and developers who want to replicate or study any UI.",
        tags: ['Chrome Extension', 'AI-Powered', 'Pixel-Perfect', 'Manifest V3'],
        accentColor: '#FF5B7F',
        metrics: [
          { label: 'Features', value: '4 Core' },
          { label: 'Lines of Code', value: '6,400+' },
          { label: 'Accuracy', value: '100%' },
        ],
      }
    },

    // ── THE VISION ──────────────────────────────────────────────────────
    {
      id: 'sl-vision', type: 'section-label', x: 720, y: 60, width: 340, height: 40,
      data: { title: 'THE VISION', color: '#FF8C5B' }
    },
    {
      id: 'q-vision', type: 'quote-block', x: 720, y: 116, width: 280, height: 280,
      data: {
        quote: '"What if you could point at any UI on the web and get an exact, pixel-perfect replica — structure, styles, assets, animations — with one click?"',
        author: 'Plukrr',
        role: 'The core idea behind the extension',
        accentColor: '#FF5B7F',
      }
    },
    {
      id: 'q-vision2', type: 'quote-block', x: 1020, y: 116, width: 280, height: 280,
      data: {
        quote: '"Not a screenshot. Not an approximation. The real thing — every computed style, every pseudo-element, every hover state, every animation keyframe."',
        author: 'The Promise',
        role: '100% UI replication fidelity',
        accentColor: '#FF8C5B',
      }
    },
    {
      id: 'sn-vision1', type: 'sticky-note', x: 720, y: 416, width: 240, height: 130,
      data: { content: '🎯 Not just a screenshot\nPlukrr extracts the actual DOM, computed CSS, and assets — giving you real, editable code.', color: 'pink', rotation: -0.5 }
    },
    {
      id: 'sn-vision2', type: 'sticky-note', x: 1000, y: 416, width: 240, height: 130,
      data: { content: '🤖 AI-Powered Output\nUses Gemini AI to generate structured prompts and shadcn/ui component code from extractions.', color: 'yellow', rotation: 0.8 }
    },

    // ══════════════════════════════════════════════════════════════════════
    // SECTION 2: THE PROBLEM
    // ══════════════════════════════════════════════════════════════════════
    {
      id: 'sl-prob', type: 'section-label', x: 80, y: 596, width: 340, height: 40,
      data: { title: 'THE PROBLEM', color: '#EF4444' }
    },
    {
      id: 'sn-prob1', type: 'sticky-note', x: 80, y: 652, width: 240, height: 145,
      data: { content: '📸 Screenshots are dead pixels\nYou can\'t edit a screenshot. You need real DOM and CSS to replicate a design.', color: 'pink', rotation: -1 }
    },
    {
      id: 'sn-prob2', type: 'sticky-note', x: 400, y: 652, width: 240, height: 145,
      data: { content: '🔍 DevTools are tedious\nManually inspecting 200+ elements, copying styles one-by-one, and stitching them together takes hours.', color: 'yellow', rotation: 1.2 }
    },
    {
      id: 'sn-prob3', type: 'sticky-note', x: 720, y: 652, width: 240, height: 145,
      data: { content: '🎭 Hidden states are invisible\nHover styles, focus rings, ::before/::after pseudo-elements, and animations don\'t show up in static copies.', color: 'cyan', rotation: -0.5 }
    },
    {
      id: 'sn-prob4', type: 'sticky-note', x: 1040, y: 652, width: 240, height: 145,
      data: { content: '🧩 Context is lost\nCopying an element without its CSSOM rules, @media queries, @keyframes, and @font-face rules gives you a broken replica.', color: 'purple', rotation: 0.8 }
    },

    // ══════════════════════════════════════════════════════════════════════
    // SECTION 3: THE 4 FEATURES
    // ══════════════════════════════════════════════════════════════════════
    {
      id: 'sl-features', type: 'section-label', x: 80, y: 877, width: 400, height: 40,
      data: { title: 'THE 4 CORE FEATURES', color: '#8B5CF6' }
    },

    // ── Feature 1: Copy Element ─────────────────────────────────────────
    {
      id: 'cs-f1', type: 'case-study-card', x: 80, y: 933, width: 560, height: 400,
      data: {
        title: '▶ Copy Element',
        subtitle: 'Isolate & extract any UI component with surgical precision',
        description: "Hover over any element on a page, click it, and Plukrr shows an interactive Element Picker panel that lets you navigate the DOM ancestor chain — from the clicked element up to the page body. Each ancestor shows its tag, classes, dimensions, child count, and style hints (bg, border, shadow, flex/grid). Select the scope you want, and Plukrr deep-walks the entire subtree: it captures every computed style, serializes images and background assets to base64 data URIs, collects all matching CSSOM rules (including @media, @keyframes, @font-face, and @supports blocks), detects interactive states (:hover, :focus, ::before, ::after), extracts animation data, and generates a pixel-perfect structured prompt ready for any AI model to replicate.",
        tags: ['Element Picker', 'DOM Tree Walk', 'CSSOM Rules', 'Asset Serialization'],
        accentColor: '#FF5B7F',
        metrics: [
          { label: 'Extraction', value: 'Deep' },
          { label: 'Assets', value: 'Base64' },
          { label: 'States', value: ':hover +:focus' },
        ],
      }
    },

    // ── Feature 2: Extract Full Page ────────────────────────────────────
    {
      id: 'cs-f2', type: 'case-study-card', x: 720, y: 933, width: 560, height: 400,
      data: {
        title: '⊞ Extract Full Page',
        subtitle: 'Capture the entire page — every section, every pixel',
        description: "Extract Full Page performs a global deep extraction of the entire document body. It walks every visible element on the page using a BFS traversal, capturing the complete DOM hierarchy with computed styles, layout properties (flex, grid, positioning), typography tokens, color values, border radii, shadows, and more. It also captures a full-page screenshot by scrolling the viewport in segments and stitching them together on a canvas. The result includes tagged state rules (separating structural CSS from interactive :hover/:focus/::before rules), all @keyframes and @font-face declarations, and interaction hints (links, buttons, toggles) — producing a comprehensive blueprint of the entire page that can be replicated with 100% fidelity.",
        tags: ['Full Page', 'BFS Traversal', 'Screenshot Stitch', 'State Tagging'],
        accentColor: '#3B82F6',
        metrics: [
          { label: 'Scope', value: 'Full Page' },
          { label: 'CSS Rules', value: '4,500 max' },
          { label: 'Screenshot', value: 'Stitched' },
        ],
      }
    },

    // ── Feature 3: Live Edit ────────────────────────────────────────────
    {
      id: 'cs-f3', type: 'case-study-card', x: 80, y: 1413, width: 560, height: 400,
      data: {
        title: '✏ Live Edit',
        subtitle: 'Modify any element on the fly — then extract the edited version',
        description: "Live Edit mode lets you click any element on the page and modify its styles in real-time through an inline property panel. Change colors, typography, spacing, borders, shadows, opacity, and transforms — all with immediate visual feedback. The panel shows the element's tag, classes, and dimensions, and provides controls for every major CSS property. Every change is tracked in an edit history, and you can undo individual modifications. Once you're satisfied with the changes, extract the modified element using Copy Element — the extraction captures your live edits as part of the computed styles, giving you a replica of the UI as you customized it, not as it originally appeared.",
        tags: ['Real-time CSS', 'Inline Editor', 'Edit History', 'Undo Support'],
        accentColor: '#8B5CF6',
        metrics: [
          { label: 'Properties', value: '20+' },
          { label: 'Feedback', value: 'Instant' },
          { label: 'History', value: 'Full Undo' },
        ],
      }
    },

    // ── Feature 4: Stitch ───────────────────────────────────────────────
    {
      id: 'cs-f4', type: 'case-study-card', x: 720, y: 1413, width: 560, height: 400,
      data: {
        title: '☰ Stitch',
        subtitle: 'Record multi-step UI flows — capture state changes across interactions',
        description: "Stitch is a recording mode that captures multiple states of a UI as you interact with it. Hit Start to capture the initial screen, then click, hover, and navigate — Stitch automatically captures a snapshot after each DOM mutation settles (using a MutationObserver with a debounce). A floating toolbar shows step count, pause/resume controls, and recording status with a pulsing dot indicator. Each step captures a full viewport screenshot plus metadata about what element was clicked. When you finish, all steps are assembled into a stitched multi-frame output that shows the complete interaction flow — perfect for capturing dropdown menus, modal sequences, tab switches, accordion expansions, and any multi-state UI pattern that can't be represented in a single extraction.",
        tags: ['Multi-Step', 'MutationObserver', 'Auto-Capture', 'Flow Recording'],
        accentColor: '#10B981',
        metrics: [
          { label: 'Capture', value: 'Auto' },
          { label: 'Trigger', value: 'DOM Mutation' },
          { label: 'Output', value: 'Multi-Frame' },
        ],
      }
    },

    // ══════════════════════════════════════════════════════════════════════
    // SECTION 4: HOW IT WORKS — ARCHITECTURE
    // ══════════════════════════════════════════════════════════════════════
    {
      id: 'sl-arch', type: 'section-label', x: 80, y: 1893, width: 400, height: 40,
      data: { title: 'EXTENSION ARCHITECTURE', color: '#3B82F6' }
    },
    {
      id: 'fd-arch', type: 'flow-diagram', x: 80, y: 1949, width: 1200, height: 520,
      data: {
        title: 'Plukrr Extension Architecture',
        subtitle: 'Content Scripts → Background Service Worker → Results Page',
        accentColor: '#3B82F6',
        nodes: [
          { id: 'popup', label: 'Popup UI\n(popup.html)', color: '#FF5B7F', x: 40, y: 40, width: 140, height: 100 },
          { id: 'content', label: 'Content Script\n(content.js)', color: '#3B82F6', x: 240, y: 40, width: 160, height: 100 },
          { id: 'bg', label: 'Background\nService Worker', color: '#8B5CF6', x: 240, y: 220, width: 160, height: 100 },
          { id: 'prompt', label: 'Prompt Generator\n(enhanced-prompt)', color: '#F59E0B', x: 480, y: 40, width: 160, height: 100 },
          { id: 'results', label: 'Results Page\n(results.html)', color: '#10B981', x: 480, y: 220, width: 160, height: 100 },
          { id: 'gemini', label: 'Gemini AI\nService', color: '#EC4899', x: 700, y: 130, width: 140, height: 100 },
        ],
        connections: [
          { from: 'popup', to: 'content', bidirectional: true },
          { from: 'popup', to: 'bg', bidirectional: true },
          { from: 'content', to: 'prompt' },
          { from: 'content', to: 'bg', bidirectional: true },
          { from: 'bg', to: 'results' },
          { from: 'prompt', to: 'results' },
          { from: 'results', to: 'gemini', bidirectional: true },
        ],
      }
    },

    // ══════════════════════════════════════════════════════════════════════
    // SECTION 5: EXTRACTION PIPELINE
    // ══════════════════════════════════════════════════════════════════════
    {
      id: 'sl-pipeline', type: 'section-label', x: 80, y: 2549, width: 400, height: 40,
      data: { title: 'EXTRACTION PIPELINE', color: '#F59E0B' }
    },
    {
      id: 'ps-1', type: 'process-step', x: 80, y: 2605, width: 210, height: 240,
      data: { stepNumber: 1, title: 'Select Target', description: 'User hovers and clicks an element. The Element Picker shows the ancestor chain for scope selection.', color: '#FF5B7F' }
    },
    {
      id: 'ps-2', type: 'process-step', x: 370, y: 2605, width: 210, height: 240,
      data: { stepNumber: 2, title: 'Deep DOM Walk', description: 'BFS traversal captures every visible child — tag, classes, computed styles, dimensions, text content, and ARIA attributes.', color: '#3B82F6' }
    },
    {
      id: 'ps-3', type: 'process-step', x: 660, y: 2605, width: 210, height: 240,
      data: { stepNumber: 3, title: 'CSSOM Collection', description: 'Walks all stylesheets to collect matching rules — @media, @keyframes, @font-face, @supports, and state selectors (:hover, ::before).', color: '#8B5CF6' }
    },
    {
      id: 'ps-4', type: 'process-step', x: 950, y: 2605, width: 210, height: 240,
      data: { stepNumber: 4, title: 'Asset Serialization', description: 'Images and background URLs are fetched via CORS, or drawn to canvas, and converted to base64 data URIs for self-contained output.', color: '#F59E0B' }
    },
    {
      id: 'ps-5', type: 'process-step', x: 80, y: 2925, width: 210, height: 240,
      data: { stepNumber: 5, title: 'Animation Capture', description: 'Detects CSS animations, GSAP timelines, Three.js scenes, and canvas animations — captures keyframes and generates replication code.', color: '#EC4899' }
    },
    {
      id: 'ps-6', type: 'process-step', x: 370, y: 2925, width: 210, height: 240,
      data: { stepNumber: 6, title: 'Prompt Generation', description: 'The Enhanced Prompt Generator v4.1 formats a pixel-perfect hierarchy with dimensions, spacing, typography, colors, and layout data.', color: '#10B981' }
    },

    // ══════════════════════════════════════════════════════════════════════
    // SECTION 6: WHAT GETS EXTRACTED
    // ══════════════════════════════════════════════════════════════════════
    {
      id: 'sl-data', type: 'section-label', x: 80, y: 3245, width: 400, height: 40,
      data: { title: 'WHAT GETS EXTRACTED', color: '#A855F7' }
    },
    {
      id: 'dd-1', type: 'data-dimension', x: 80, y: 3301, width: 300, height: 190,
      data: { dimension: 'DOM Tree', title: 'Complete element hierarchy with computed styles per node', highlight: 'Nodes', min: '1', max: '500+', typical: '30–80', accentColor: '#FF5B7F' }
    },
    {
      id: 'dd-2', type: 'data-dimension', x: 400, y: 3301, width: 300, height: 190,
      data: { dimension: 'CSSOM Rules', title: 'Matching CSS rules from all stylesheets including @media queries', highlight: 'Rules', min: '10', max: '4,500', typical: '200–800', accentColor: '#3B82F6' }
    },
    {
      id: 'dd-3', type: 'data-dimension', x: 720, y: 3301, width: 300, height: 190,
      data: { dimension: 'State Rules', title: 'Interactive pseudo-class and pseudo-element rules captured separately', highlight: 'States', min: '0', max: '100+', typical: '10–30', note: ':hover, :focus, ::before, ::after, :checked, :disabled', accentColor: '#8B5CF6' }
    },
    {
      id: 'dd-4', type: 'data-dimension', x: 80, y: 3571, width: 300, height: 190,
      data: { dimension: 'Assets', title: 'Images and backgrounds serialized to base64 data URIs', highlight: 'Assets', min: '0', max: '50+', typical: '3–10', note: 'Max 2MB per asset. Fetched via CORS or canvas fallback.', accentColor: '#F59E0B' }
    },
    {
      id: 'dd-5', type: 'data-dimension', x: 400, y: 3571, width: 300, height: 190,
      data: { dimension: 'Animations', title: 'CSS keyframes, GSAP timelines, Three.js scenes, canvas animations', highlight: 'Animations', min: '0', max: '20+', typical: '2–5', note: 'Generates replication code for detected animation libraries.', accentColor: '#EC4899' }
    },
    {
      id: 'dd-6', type: 'data-dimension', x: 720, y: 3571, width: 300, height: 190,
      data: { dimension: 'Interaction Hints', title: 'Links, buttons, toggles, and data attributes detected in the subtree', highlight: 'Interactions', min: '0', max: '220', typical: '5–20', accentColor: '#10B981' }
    },

    // ══════════════════════════════════════════════════════════════════════
    // SECTION 7: TECH STACK
    // ══════════════════════════════════════════════════════════════════════
    {
      id: 'sl-tech', type: 'section-label', x: 80, y: 3841, width: 340, height: 40,
      data: { title: 'TECHNOLOGY STACK', color: '#FF5B7F' }
    },
    {
      id: 'tc-1', type: 'tag-cluster', x: 80, y: 3897, width: 940, height: 110,
      data: {
        title: 'TECHNOLOGY STACK',
        tags: [
          { label: 'Chrome Manifest V3', color: '#4285F4' },
          { label: 'Content Scripts', color: '#FF5B7F' },
          { label: 'Service Worker', color: '#8B5CF6' },
          { label: 'Gemini AI API', color: '#F59E0B' },
          { label: 'Supabase Auth', color: '#3ECF8E' },
          { label: 'CSSOM API', color: '#3B82F6' },
          { label: 'MutationObserver', color: '#10B981' },
          { label: 'Canvas API', color: '#EC4899' },
        ]
      }
    },

    // ══════════════════════════════════════════════════════════════════════
    // SECTION 8: KEY METRICS
    // ══════════════════════════════════════════════════════════════════════
    {
      id: 'sl-metrics', type: 'section-label', x: 80, y: 4087, width: 340, height: 40,
      data: { title: 'KEY METRICS', color: '#10B981' }
    },
    {
      id: 'mc-1', type: 'metric-card', x: 80, y: 4143, width: 220, height: 120,
      data: { label: 'Content Script', value: '6,456', change: 'Lines of JS', changePositive: true, accentColor: '#FF5B7F' }
    },
    {
      id: 'mc-2', type: 'metric-card', x: 320, y: 4143, width: 220, height: 120,
      data: { label: 'Prompt Generator', value: '2,633', change: 'Lines of JS', changePositive: true, accentColor: '#F59E0B' }
    },
    {
      id: 'mc-3', type: 'metric-card', x: 560, y: 4143, width: 220, height: 120,
      data: { label: 'Max CSSOM Rules', value: '4,500', change: 'Per extraction', changePositive: true, accentColor: '#3B82F6' }
    },
    {
      id: 'mc-4', type: 'metric-card', x: 800, y: 4143, width: 220, height: 120,
      data: { label: 'Max Keyframes', value: '100', change: 'Animation rules', changePositive: true, accentColor: '#8B5CF6' }
    },

    // ══════════════════════════════════════════════════════════════════════
    // SECTION 9: WRAP UP + GAME
    // ══════════════════════════════════════════════════════════════════════
    {
      id: 'sl-thanks', type: 'section-label', x: 80, y: 4343, width: 480, height: 40,
      data: { title: '👋 THAT\'S PLUKRR — PIXEL-PERFECT EXTRACTION', color: '#FF5B7F' }
    },
    {
      id: 'cs-thanks', type: 'case-study-card', x: 80, y: 4399, width: 1080, height: 280,
      data: {
        title: 'From any website to exact replica — in one click.',
        subtitle: 'Copy Element · Extract Full Page · Live Edit · Stitch',
        description: "Plukrr turns the browser into a design extraction powerhouse. Whether you need a single button or an entire landing page, it captures every pixel, every style, every state — and generates prompts or code that any AI model can use to build an exact replica. No more manual DevTools inspection. No more approximate screenshots. Just point, click, and replicate.",
        tags: ['Pixel-Perfect', '100% Fidelity', 'Let\'s connect'],
        accentColor: '#FF5B7F',
        metrics: [
          { label: 'Features', value: '4 Core' },
          { label: 'Accuracy', value: '100%' },
          { label: 'Ready to Chat?', value: 'Yes!' },
        ],
      }
    },
    {
      id: 'sn-ty1', type: 'sticky-note', x: 80, y: 4759, width: 280, height: 130,
      data: { content: '🎨 Every computed style. Every pseudo-element. Every animation. Captured.', color: 'pink', rotation: -1 }
    },
    {
      id: 'sn-ty2', type: 'sticky-note', x: 400, y: 4744, width: 280, height: 130,
      data: { content: '⚡ Built entirely with vibe coding — AI wrote every line of the 6,400+ line content script.', color: 'green', rotation: 1.2 }
    },
    {
      id: 'sn-ty3', type: 'sticky-note', x: 720, y: 4754, width: 280, height: 130,
      data: { content: '💌 Liked what you saw? Hit "Message Me" on the right panel — let\'s talk!', color: 'purple', rotation: -0.8 }
    },

    // ── GAME ZONE ─────────────────────────────────────────────────────────
    {
      id: 'sl-game', type: 'section-label', x: 80, y: 4984, width: 480, height: 40,
      data: { title: '🎮 CREWMATE DASH — PLAY & HIRE ME', color: '#FF5B7F' }
    },
    {
      id: 'gz-1', type: 'game-zone', x: 80, y: 5040, width: 1160, height: 680,
      data: {
        title: 'Crewmate Dash',
        accentColor: '#FF5B7F',
        contactEmail: 'kc60488charan@gmail.com',
        contactLinkedIn: 'https://linkedin.com/in/saicharan',
      }
    },
    {
      id: 'sn-game-hint', type: 'sticky-note', x: 80, y: 5780, width: 280, height: 120,
      data: { content: '🕹️ Dodge obstacles & get on the leaderboard. Space or tap to jump!', color: 'yellow', rotation: -1.2 }
    },
    {
      id: 'sn-game-hint2', type: 'sticky-note', x: 380, y: 5795, width: 260, height: 110,
      data: { content: '⚠️ Only 1 player at a time — queue up if someone is already playing!', color: 'pink', rotation: 1 }
    },
  ]
};
