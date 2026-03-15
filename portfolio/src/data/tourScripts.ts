/**
 * Tour narration scripts for each project.
 * Each section has a target element (section-label ID), narration text,
 * emote, and optional arrival animation.
 */

export type Emote = 'wave' | 'thinking' | 'excited' | 'serious' | 'proud' | 'wink';
export type ArrivalAnimation = 'confetti' | 'glow' | 'bounce' | 'none';

export interface TourStep {
  /** The section-label element ID to navigate to */
  sectionId: string;
  /** Offset from the section-label position where the avatar should stand */
  targetOffset: { x: number; y: number };
  /** The narration text shown in the speech bubble */
  narration: string;
  /** Emote displayed alongside the narration */
  emote: Emote;
  /** Animation triggered when avatar arrives at this section */
  animationOnArrival?: ArrivalAnimation;
  /** Optional brief label for the progress bar */
  progressLabel?: string;
}

export interface ProjectTour {
  projectId: string;
  /** Greeting shown in the intro prompt */
  introGreeting: string;
  steps: TourStep[];
}

// ─── Oracle Symphony Kiosk ──────────────────────────────────────────────────
const oracleKioskTour: ProjectTour = {
  projectId: 'alchemy-design-system',
  introGreeting: "Hey! 👋 I'm your crewmate guide. Want me to walk you through the Oracle Symphony Kiosk project?",
  steps: [
    {
      sectionId: 'sl-1',
      targetOffset: { x: -60, y: 180 },
      narration: "Welcome! This is the Oracle Symphony Kiosk — a self-ordering system I designed from scratch for restaurants, stadiums & food courts. Let me show you what went into it 🔍",
      emote: 'wave',
      animationOnArrival: 'confetti',
      progressLabel: 'Overview',
    },
    {
      sectionId: 'sl-2',
      targetOffset: { x: -60, y: 100 },
      narration: "These sticky notes? Each one is a real pain point I heard during field research. Staff shortages, order errors, accessibility — the problems were everywhere 😤",
      emote: 'serious',
      animationOnArrival: 'glow',
      progressLabel: 'Problems',
    },
    {
      sectionId: 'sl-arch',
      targetOffset: { x: -60, y: 180 },
      narration: "Here's the system before and after. The kiosk doesn't replace anything — it adds a new touchpoint that talks to everything else. That integration was the hard part 🤔",
      emote: 'thinking',
      animationOnArrival: 'bounce',
      progressLabel: 'Architecture',
    },
    {
      sectionId: 'sl-3',
      targetOffset: { x: -60, y: 80 },
      narration: "The impact! Fewer staff needed at the counter, way fewer order errors, faster checkout, and 6+ payment methods. These metrics made stakeholders very happy 📊",
      emote: 'proud',
      animationOnArrival: 'confetti',
      progressLabel: 'Impact',
    },
    {
      sectionId: 'sl-4',
      targetOffset: { x: -60, y: 120 },
      narration: "I identified two types of guests: Express users who know exactly what they want, and Browsers who want to explore the menu. Each needed a different flow 🧠",
      emote: 'thinking',
      animationOnArrival: 'glow',
      progressLabel: 'Personas',
    },
    {
      sectionId: 'sl-5',
      targetOffset: { x: -60, y: 100 },
      narration: "My process — from problem discovery through user goals, success matrix, data shapes, sitemaps, to prototyping. Six clear phases, each building on the last 🚀",
      emote: 'excited',
      animationOnArrival: 'bounce',
      progressLabel: 'Process',
    },
    {
      sectionId: 'sl-6',
      targetOffset: { x: -60, y: 100 },
      narration: "The ordering journey broken into three phases: Pre-order, Order & Pay, Post-order. I mapped every pain point in each phase to make sure nothing slipped through 🗺️",
      emote: 'serious',
      progressLabel: 'Journey',
    },
    {
      sectionId: 'sl-sod',
      targetOffset: { x: -60, y: 100 },
      narration: "This is where it gets nerdy! I mapped every data constraint — price levels, condiment groups, menu items — to make sure the UI could handle any restaurant's data 🔢",
      emote: 'thinking',
      animationOnArrival: 'glow',
      progressLabel: 'Data',
    },
    {
      sectionId: 'sl-7',
      targetOffset: { x: -60, y: 120 },
      narration: "Live Figma files! The sitemap, view summary, and task flows — all interactive. This is how I hand off to developers. Click into any of these to explore 📐",
      emote: 'proud',
      animationOnArrival: 'bounce',
      progressLabel: 'Figma',
    },
    {
      sectionId: 'sl-10',
      targetOffset: { x: -60, y: 180 },
      narration: "And here's the story — literally! A storyboard showing the problem in action and the kiosk solution. Meet Harry and his wife's lunch journey 🎬",
      emote: 'excited',
      animationOnArrival: 'confetti',
      progressLabel: 'Story',
    },
    {
      sectionId: 'sl-thanks',
      targetOffset: { x: -60, y: 120 },
      narration: "That's a wrap! You've seen the full case study — from problem to solution. Want to play Crewmate Dash below, or head back and explore more projects? 🎮",
      emote: 'wave',
      animationOnArrival: 'confetti',
      progressLabel: 'Finish',
    },
  ],
};

// ─── User Management ────────────────────────────────────────────────────────
const userManagementTour: ProjectTour = {
  projectId: 'user-management',
  introGreeting: "Hey! 👋 Ready to see how I unified user management across Oracle's entire product suite?",
  steps: [
    {
      sectionId: 'sl-1',
      targetOffset: { x: -60, y: 180 },
      narration: "Oracle had separate user management in every product — EMC, Backoffice, POS, KDS. My job? Unify them all into one experience ✨",
      emote: 'wave',
      animationOnArrival: 'confetti',
      progressLabel: 'Overview',
    },
    {
      sectionId: 'sl-story',
      targetOffset: { x: -60, y: 100 },
      narration: "The back story — two different architectures (OJET 6 and OJET 12) that needed to work together. This was an engineering and design puzzle 🧩",
      emote: 'thinking',
      animationOnArrival: 'glow',
      progressLabel: 'Context',
    },
    {
      sectionId: 'sl-prob',
      targetOffset: { x: -60, y: 100 },
      narration: "Five known problems and two unknown ones we discovered along the way. The unknown ones were actually harder — information architecture and component mismatches 🔍",
      emote: 'serious',
      animationOnArrival: 'bounce',
      progressLabel: 'Problems',
    },
    {
      sectionId: 'sl-goals',
      targetOffset: { x: -60, y: 100 },
      narration: "Seven user goals we defined with stakeholders. From adding a single user to managing location access across chain restaurants — each one a mini-project 📋",
      emote: 'proud',
      animationOnArrival: 'glow',
      progressLabel: 'Goals',
    },
  ],
};

// ─── Contextual micro-tips for free-roam mode ───────────────────────────────
export interface ContextualTip {
  sectionId: string;
  tip: string;
}

export const CONTEXTUAL_TIPS: Record<string, ContextualTip[]> = {
  'alchemy-design-system': [
    { sectionId: 'sl-1', tip: "This is the project overview — the big picture 📋" },
    { sectionId: 'sl-2', tip: "Real problems from real restaurants 🍕" },
    { sectionId: 'sl-arch', tip: "The system diagram — zoom in! 🔧" },
    { sectionId: 'sl-3', tip: "Impact metrics that made stakeholders smile 📊" },
    { sectionId: 'sl-4', tip: "Two user personas, two different needs 👥" },
    { sectionId: 'sl-5', tip: "My 6-step design process ✏️" },
    { sectionId: 'sl-6', tip: "The full ordering journey mapped out 🗺️" },
    { sectionId: 'sl-sod', tip: "Data constraints that shaped the UI 🔢" },
    { sectionId: 'sl-7', tip: "Live Figma files — click to explore! 📐" },
    { sectionId: 'sl-10', tip: "A storyboard — the problem and solution told as a story 🎬" },
    { sectionId: 'sl-game', tip: "Play the game I built! 🎮" },
  ],
  'user-management': [
    { sectionId: 'sl-1', tip: "Unified user management across Oracle products 🔗" },
    { sectionId: 'sl-story', tip: "The technical backstory 📖" },
    { sectionId: 'sl-prob', tip: "5 known + 2 unknown problems 🔍" },
    { sectionId: 'sl-goals', tip: "7 user goals defined with stakeholders 📋" },
  ],
};

// ─── Export all tours ───────────────────────────────────────────────────────
export const PROJECT_TOURS: Record<string, ProjectTour> = {
  'alchemy-design-system': oracleKioskTour,
  'user-management': userManagementTour,
};

/** "Come back!" messages when the user wanders during a tour */
export const COMEBACK_MESSAGES = [
  "Hey! Come back! I wasn't done yet! 🏃",
  "Wait up! There's more to see! 👋",
  "Psst! Over here! The good part is coming! 🤫",
  "Don't leave me hanging! 😅",
  "I was just getting to the juicy bits! 🍿",
];

/** Idle messages when the user hasn't moved for a while */
export const IDLE_MESSAGES = [
  "Still here? Take your time! ☕",
  "👀 ...",
  "Need a moment? I'll wait! 😊",
  "*adjusts visor* 🪖",
  "*taps foot impatiently* ⏰",
];
