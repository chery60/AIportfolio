import type { Project } from '../types';

export const PROJECTS: Project[] = [
  {
    id: 'alchemy-design-system',
    title: 'Alchemy Design System',
    description: 'A comprehensive design system built for scale — from atoms to ecosystems.',
    category: 'Design Systems',
    year: '2024',
    tags: ['Design System', 'Tokens', 'Figma', 'React'],
    accentColor: '#7C5CFC',
    gradientFrom: '#7C5CFC',
    gradientTo: '#FF6B9D',
    defaultView: { x: -160, y: -80, scale: 0.85 },
    canvasSize: { width: 3000, height: 2000 },
    files: [
      { id: 'f1', label: 'Figma Master File', type: 'figma' },
      { id: 'f2', label: 'Component Docs', type: 'doc' },
      { id: 'f3', label: 'Storybook', type: 'link' },
      { id: 'f4', label: 'Design Tokens Spec', type: 'pdf' },
    ],
    assets: [
      { id: 'a1', label: 'Button States', thumbnailColor: '#7C5CFC', type: 'component' },
      { id: 'a2', label: 'Color Palette', thumbnailColor: '#FF6B9D', type: 'image' },
      { id: 'a3', label: 'Typography', thumbnailColor: '#22D3EE', type: 'image' },
      { id: 'a4', label: 'Icon Set', thumbnailColor: '#FBBF24', type: 'component' },
      { id: 'a5', label: 'Form Components', thumbnailColor: '#34D399', type: 'component' },
      { id: 'a6', label: 'Data Viz', thumbnailColor: '#F472B6', type: 'illustration' },
    ],
    canvasElements: [
      {
        id: 'sl-1', type: 'section-label', x: 80, y: 60, width: 300, height: 40,
        data: { title: 'PROJECT OVERVIEW', color: '#7C5CFC' }
      },
      {
        id: 'cs-1', type: 'case-study-card', x: 80, y: 120, width: 520, height: 300,
        data: {
          title: 'Alchemy Design System',
          subtitle: 'Design Systems · 2024',
          description: 'Built a unified design language for a 40-person product team. From tokens to documentation — every decision made to ship faster without sacrificing craft.',
          tags: ['Design System', '200+ Components', 'Multi-brand'],
          accentColor: '#7C5CFC',
          metrics: [
            { label: 'Components', value: '240+' },
            { label: 'Teams Served', value: '12' },
            { label: 'Ship Speed', value: '+60%' },
          ],
        }
      },
      {
        id: 'sl-2', type: 'section-label', x: 660, y: 60, width: 300, height: 40,
        data: { title: 'DESIGN PRINCIPLES', color: '#FF6B9D' }
      },
      {
        id: 'sn-1', type: 'sticky-note', x: 660, y: 120, width: 220, height: 160,
        data: { content: '🎯 Composable\nEvery component is an atom. Build anything by combining parts.', color: 'purple', rotation: -1 }
      },
      {
        id: 'sn-2', type: 'sticky-note', x: 900, y: 140, width: 220, height: 160,
        data: { content: '⚡ Performant\nZero runtime overhead. Tokens compiled at build time.', color: 'cyan', rotation: 1.5 }
      },
      {
        id: 'sn-3', type: 'sticky-note', x: 660, y: 300, width: 220, height: 160,
        data: { content: '♿ Accessible\nWCAG 2.1 AA compliance built into every interaction state.', color: 'green', rotation: 0.5 }
      },
      {
        id: 'sn-4', type: 'sticky-note', x: 900, y: 315, width: 220, height: 160,
        data: { content: '📐 Consistent\nOne source of truth — Figma and code always in sync.', color: 'yellow', rotation: -0.8 }
      },
      {
        id: 'sl-3', type: 'section-label', x: 80, y: 480, width: 300, height: 40,
        data: { title: 'IMPACT METRICS', color: '#22D3EE' }
      },
      {
        id: 'mc-1', type: 'metric-card', x: 80, y: 540, width: 200, height: 120,
        data: { label: 'Components Built', value: '240+', change: '+80 this quarter', changePositive: true, accentColor: '#7C5CFC' }
      },
      {
        id: 'mc-2', type: 'metric-card', x: 300, y: 540, width: 200, height: 120,
        data: { label: 'Dev Handoff Time', value: '-70%', change: 'Per feature', changePositive: true, accentColor: '#22D3EE' }
      },
      {
        id: 'mc-3', type: 'metric-card', x: 520, y: 540, width: 200, height: 120,
        data: { label: 'Design Consistency', value: '98%', change: 'Audit score', changePositive: true, accentColor: '#34D399' }
      },
      {
        id: 'sl-4', type: 'section-label', x: 80, y: 720, width: 300, height: 40,
        data: { title: 'MY PROCESS', color: '#FBBF24' }
      },
      {
        id: 'ps-1', type: 'process-step', x: 80, y: 780, width: 200, height: 140,
        data: { stepNumber: 1, title: 'Audit', description: 'Catalogued 800+ inconsistent UI patterns across 6 products.', color: '#7C5CFC' }
      },
      {
        id: 'ps-2', type: 'process-step', x: 300, y: 780, width: 200, height: 140,
        data: { stepNumber: 2, title: 'Token System', description: 'Designed a semantic token architecture supporting multi-brand theming.', color: '#FF6B9D' }
      },
      {
        id: 'ps-3', type: 'process-step', x: 520, y: 780, width: 200, height: 140,
        data: { stepNumber: 3, title: 'Component Library', description: 'Built 240+ components with Figma variants and React implementation.', color: '#22D3EE' }
      },
      {
        id: 'ps-4', type: 'process-step', x: 740, y: 780, width: 200, height: 140,
        data: { stepNumber: 4, title: 'Documentation', description: 'Created living docs with interactive examples and usage guidelines.', color: '#34D399' }
      },
      {
        id: 'q-1', type: 'quote-block', x: 660, y: 480, width: 480, height: 160,
        data: {
          quote: '"The design system didn\'t just standardize our UI — it changed how our entire team thinks about building products."',
          author: 'Sarah Chen',
          role: 'VP of Engineering',
          accentColor: '#7C5CFC'
        }
      },
      {
        id: 'tc-1', type: 'tag-cluster', x: 80, y: 980, width: 400, height: 120,
        data: {
          title: 'TOOLS & TECHNOLOGIES',
          tags: [
            { label: 'Figma', color: '#7C5CFC' },
            { label: 'React', color: '#22D3EE' },
            { label: 'TypeScript', color: '#3B82F6' },
            { label: 'Storybook', color: '#FF6B9D' },
            { label: 'Style Dictionary', color: '#FBBF24' },
            { label: 'Chromatic', color: '#34D399' },
            { label: 'Zeroheight', color: '#F472B6' },
          ]
        }
      },
      {
        id: 'sb-problem', type: 'storyboard', x: 1150, y: 120, width: 1080, height: 832, zIndex: 10,
        data: {
          boardType: 'problem',
          dialogues: [
            { characterName: 'Harry', text: "Let's grab some lunch here, I'm starving.", color: '#3B82F6' },
            { characterName: 'Wife', text: "Sure, let's go inside.", color: '#F97316' },
            { characterName: 'Harry', text: "Whoa, look at that queue...", color: '#3B82F6' },
            { characterName: 'Harry', text: "This is taking forever.", color: '#3B82F6' },
            { characterName: 'Wife', text: "We've been waiting for 30 minutes! This is ridiculous.", color: '#F97316' },
            { characterName: 'Janice (Manager)', text: "Carl is the only one taking orders. We're so short-staffed.", color: '#06B6D4' },
            { characterName: 'Carl (Cashier)', text: "Sorry, let me fix that order...", color: '#22C55E' },
            { characterName: 'Janice (Manager)', text: "This manual process is too slow. Guests are leaving!", color: '#06B6D4' }
          ]
        }
      },
      {
        id: 'sb-solution', type: 'storyboard', x: 2350, y: 120, width: 1080, height: 832, zIndex: 10,
        data: {
          boardType: 'solution',
          dialogues: [
            { characterName: 'Harry', text: "Let's try this place again. They have new screens.", color: '#3B82F6' },
            { characterName: 'Wife', text: "Oh, self-service kiosks? Let's see if it's faster.", color: '#F97316' },
            { characterName: 'Harry', text: "Wow, ordering was so easy and quick!", color: '#3B82F6' },
            { characterName: 'Wife', text: "And no waiting in a huge line!", color: '#F97316' },
            { characterName: 'Carl (Cashier)', text: "With the kiosks taking orders, I have time to prep food faster!", color: '#22C55E' },
            { characterName: 'Janice (Manager)', text: "Our service times are down, and our average order size has increased! The kiosks are a huge success.", color: '#06B6D4' }
          ]
        }
      }
    ]
  },
  {
    id: 'flow-app',
    title: 'Flow — Task Management',
    description: 'Redesigning how teams stay in flow state. A calm, focused task manager.',
    category: 'Mobile App',
    year: '2024',
    tags: ['iOS', 'Android', 'UX Research', 'Prototyping'],
    accentColor: '#22D3EE',
    gradientFrom: '#22D3EE',
    gradientTo: '#7C5CFC',
    defaultView: { x: -120, y: -60, scale: 0.85 },
    canvasSize: { width: 3000, height: 2000 },
    files: [
      { id: 'f1', label: 'Figma Prototype', type: 'figma' },
      { id: 'f2', label: 'User Research Report', type: 'pdf' },
      { id: 'f3', label: 'Case Study Article', type: 'link' },
    ],
    assets: [
      { id: 'a1', label: 'Onboarding Screens', thumbnailColor: '#22D3EE', type: 'image' },
      { id: 'a2', label: 'Task View', thumbnailColor: '#7C5CFC', type: 'image' },
      { id: 'a3', label: 'Illustrations', thumbnailColor: '#FF6B9D', type: 'illustration' },
      { id: 'a4', label: 'Motion Specs', thumbnailColor: '#FBBF24', type: 'component' },
    ],
    canvasElements: [
      {
        id: 'sl-1', type: 'section-label', x: 80, y: 60, width: 280, height: 40,
        data: { title: 'THE PROBLEM', color: '#22D3EE' }
      },
      {
        id: 'cs-1', type: 'case-study-card', x: 80, y: 120, width: 500, height: 280,
        data: {
          title: 'Flow — Task Management',
          subtitle: 'iOS & Android · 2024',
          description: '73% of knowledge workers feel overwhelmed by their tools. Flow is a task manager designed around calm productivity — surfacing only what matters, right when it matters.',
          tags: ['0→1', 'Mobile', 'UX Research'],
          accentColor: '#22D3EE',
          metrics: [
            { label: 'DAU Growth', value: '+145%' },
            { label: 'Task Complete Rate', value: '89%' },
            { label: 'App Store', value: '4.8★' },
          ],
        }
      },
      {
        id: 'sl-2', type: 'section-label', x: 640, y: 60, width: 280, height: 40,
        data: { title: 'USER RESEARCH INSIGHTS', color: '#FF6B9D' }
      },
      {
        id: 'sn-1', type: 'sticky-note', x: 640, y: 120, width: 240, height: 140,
        data: { content: '😩 "I have 5 different apps open and I still miss things"', color: 'pink', rotation: -1.2 }
      },
      {
        id: 'sn-2', type: 'sticky-note', x: 900, y: 100, width: 240, height: 140,
        data: { content: '🔔 "Notifications are the worst. Too many, too often."', color: 'yellow', rotation: 1 }
      },
      {
        id: 'sn-3', type: 'sticky-note', x: 640, y: 280, width: 240, height: 140,
        data: { content: '⏰ "I spend more time organizing tasks than doing them."', color: 'cyan', rotation: 0.5 }
      },
      {
        id: 'sn-4', type: 'sticky-note', x: 900, y: 260, width: 240, height: 140,
        data: { content: '✨ "I just want to open an app and know exactly what to do."', color: 'green', rotation: -0.8 }
      },
      {
        id: 'sl-3', type: 'section-label', x: 80, y: 460, width: 280, height: 40,
        data: { title: 'USER FLOW — CORE TASK', color: '#FBBF24' }
      },
      {
        id: 'ufs-1', type: 'user-flow-step', x: 80, y: 520, width: 160, height: 80,
        data: { label: 'Open App', description: 'Morning context', shape: 'circle', color: '#22D3EE', stepNumber: 1 }
      },
      {
        id: 'ufs-2', type: 'user-flow-step', x: 280, y: 520, width: 160, height: 80,
        data: { label: 'Today View', description: 'AI-prioritized tasks', shape: 'rectangle', color: '#7C5CFC', stepNumber: 2 }
      },
      {
        id: 'ufs-3', type: 'user-flow-step', x: 480, y: 520, width: 160, height: 80,
        data: { label: 'Select Task', description: 'Tap to start', shape: 'rectangle', color: '#FF6B9D', stepNumber: 3 }
      },
      {
        id: 'ufs-4', type: 'user-flow-step', x: 680, y: 520, width: 160, height: 80,
        data: { label: 'Focus Mode', description: 'Distraction-free', shape: 'rectangle', color: '#FBBF24', stepNumber: 4 }
      },
      {
        id: 'ufs-5', type: 'user-flow-step', x: 880, y: 520, width: 160, height: 80,
        data: { label: 'Complete', description: 'Celebrate ✓', shape: 'circle', color: '#34D399', stepNumber: 5 }
      },
      {
        id: 'sl-4', type: 'section-label', x: 80, y: 660, width: 280, height: 40,
        data: { title: 'KEY DECISIONS', color: '#7C5CFC' }
      },
      {
        id: 'ps-1', type: 'process-step', x: 80, y: 720, width: 220, height: 160,
        data: { stepNumber: 1, title: 'No Inbox', description: 'All tasks auto-sorted by AI context. No manual prioritization needed.', color: '#22D3EE' }
      },
      {
        id: 'ps-2', type: 'process-step', x: 320, y: 720, width: 220, height: 160,
        data: { stepNumber: 2, title: 'Calm Notifications', description: 'Batched, time-aware nudges. Never interrupts flow state.', color: '#FF6B9D' }
      },
      {
        id: 'ps-3', type: 'process-step', x: 560, y: 720, width: 220, height: 160,
        data: { stepNumber: 3, title: 'One Tap Entry', description: 'Voice or text. Task captured in under 3 seconds.', color: '#FBBF24' }
      },
      {
        id: 'mc-1', type: 'metric-card', x: 80, y: 940, width: 200, height: 110,
        data: { label: 'User Interviews', value: '48', accentColor: '#22D3EE' }
      },
      {
        id: 'mc-2', type: 'metric-card', x: 300, y: 940, width: 200, height: 110,
        data: { label: 'Usability Sessions', value: '12', accentColor: '#FF6B9D' }
      },
      {
        id: 'mc-3', type: 'metric-card', x: 520, y: 940, width: 200, height: 110,
        data: { label: 'Iterations', value: '6', accentColor: '#7C5CFC' }
      },
      {
        id: 'q-1', type: 'quote-block', x: 640, y: 660, width: 440, height: 160,
        data: {
          quote: '"Flow finally got me to inbox zero — not by hiding tasks, but by helping me trust the system."',
          author: 'Beta User, Product Manager',
          accentColor: '#22D3EE'
        }
      },
    ]
  },
  {
    id: 'nexus-dashboard',
    title: 'Nexus — B2B Analytics',
    description: 'Turning petabytes of business data into clarity. A zero-learning-curve analytics platform.',
    category: 'Web App · B2B',
    year: '2023',
    tags: ['Dashboard', 'Data Visualization', 'B2B', 'Enterprise'],
    accentColor: '#34D399',
    gradientFrom: '#34D399',
    gradientTo: '#22D3EE',
    defaultView: { x: -100, y: -60, scale: 0.85 },
    canvasSize: { width: 3000, height: 2000 },
    files: [
      { id: 'f1', label: 'Figma File', type: 'figma' },
      { id: 'f2', label: 'Research Deck', type: 'pdf' },
      { id: 'f3', label: 'Live Product', type: 'link' },
    ],
    assets: [
      { id: 'a1', label: 'Dashboard Overview', thumbnailColor: '#34D399', type: 'image' },
      { id: 'a2', label: 'Chart Library', thumbnailColor: '#22D3EE', type: 'component' },
      { id: 'a3', label: 'Data Tables', thumbnailColor: '#7C5CFC', type: 'component' },
      { id: 'a4', label: 'Empty States', thumbnailColor: '#FF6B9D', type: 'illustration' },
    ],
    canvasElements: [
      {
        id: 'sl-1', type: 'section-label', x: 80, y: 60, width: 280, height: 40,
        data: { title: 'THE CHALLENGE', color: '#34D399' }
      },
      {
        id: 'cs-1', type: 'case-study-card', x: 80, y: 120, width: 520, height: 280,
        data: {
          title: 'Nexus Analytics Platform',
          subtitle: 'Enterprise SaaS · 2023',
          description: 'Enterprise analytics were broken. 6-figure contracts being lost because users couldn\'t interpret their own data. Redesigned the platform end-to-end, reducing onboarding from weeks to hours.',
          tags: ['Enterprise', 'Data Viz', 'Zero-to-Revenue'],
          accentColor: '#34D399',
          metrics: [
            { label: 'Onboarding', value: '-80%' },
            { label: 'NPS Score', value: '+42' },
            { label: 'ARR Impact', value: '$2.4M' },
          ],
        }
      },
      {
        id: 'sl-2', type: 'section-label', x: 660, y: 60, width: 300, height: 40,
        data: { title: 'DESIGN CHALLENGES', color: '#FBBF24' }
      },
      {
        id: 'sn-1', type: 'sticky-note', x: 660, y: 120, width: 220, height: 150,
        data: { content: '📊 Data density vs clarity\nUsers need depth but not overwhelm.', color: 'yellow', rotation: -1 }
      },
      {
        id: 'sn-2', type: 'sticky-note', x: 900, y: 110, width: 220, height: 150,
        data: { content: '🔐 Enterprise needs\nRole-based views, audit logs, SSO.', color: 'cyan', rotation: 1.5 }
      },
      {
        id: 'sn-3', type: 'sticky-note', x: 660, y: 290, width: 220, height: 150,
        data: { content: '⚡ Real-time updates\nLive data without cognitive overload.', color: 'purple', rotation: 0.5 }
      },
      {
        id: 'sn-4', type: 'sticky-note', x: 900, y: 280, width: 220, height: 150,
        data: { content: '📱 Multi-device\nSame insights, optimized per device.', color: 'green', rotation: -0.8 }
      },
      {
        id: 'sl-3', type: 'section-label', x: 80, y: 460, width: 280, height: 40,
        data: { title: 'IMPACT', color: '#22D3EE' }
      },
      {
        id: 'mc-1', type: 'metric-card', x: 80, y: 520, width: 200, height: 120,
        data: { label: 'Onboarding Time', value: '2hrs', change: 'Was 3 weeks', changePositive: true, accentColor: '#34D399' }
      },
      {
        id: 'mc-2', type: 'metric-card', x: 300, y: 520, width: 200, height: 120,
        data: { label: 'Support Tickets', value: '-65%', change: 'Post-redesign', changePositive: true, accentColor: '#22D3EE' }
      },
      {
        id: 'mc-3', type: 'metric-card', x: 520, y: 520, width: 200, height: 120,
        data: { label: 'Enterprise NPS', value: '78', change: 'Was 36', changePositive: true, accentColor: '#FBBF24' }
      },
      {
        id: 'sl-4', type: 'section-label', x: 80, y: 700, width: 280, height: 40,
        data: { title: 'PROCESS', color: '#7C5CFC' }
      },
      {
        id: 'ps-1', type: 'process-step', x: 80, y: 760, width: 200, height: 150,
        data: { stepNumber: 1, title: 'Stakeholder Map', description: 'Identified 8 distinct user personas across data analyst, exec, and ops roles.', color: '#34D399' }
      },
      {
        id: 'ps-2', type: 'process-step', x: 300, y: 760, width: 200, height: 150,
        data: { stepNumber: 2, title: 'Information Architecture', description: 'Restructured nav from 23 unclear sections to 5 goal-oriented hubs.', color: '#22D3EE' }
      },
      {
        id: 'ps-3', type: 'process-step', x: 520, y: 760, width: 200, height: 150,
        data: { stepNumber: 3, title: 'Visualization System', description: 'Built 40+ chart templates with consistent grammar and accessibility.', color: '#7C5CFC' }
      },
      {
        id: 'ps-4', type: 'process-step', x: 740, y: 760, width: 200, height: 150,
        data: { stepNumber: 4, title: 'Validated & Shipped', description: 'Ran A/B tests with 200 enterprise users. Shipped to 50k seat deployment.', color: '#FF6B9D' }
      },
      {
        id: 'q-1', type: 'quote-block', x: 660, y: 460, width: 480, height: 180,
        data: {
          quote: '"We went from losing deals because the product felt too complex, to winning deals because it feels intuitive. The redesign was transformational."',
          author: 'Marcus Williams',
          role: 'Chief Product Officer',
          accentColor: '#34D399'
        }
      },
    ]
  },
  {
    id: 'beacon-ai',
    title: 'Beacon — AI Navigation',
    description: 'Designing trust in AI. How do you show intelligence without overwhelming users?',
    category: 'AI Product',
    year: '2024',
    tags: ['AI/ML', 'Conversational UI', 'Trust Design'],
    accentColor: '#FF6B9D',
    gradientFrom: '#FF6B9D',
    gradientTo: '#FBBF24',
    defaultView: { x: -100, y: -60, scale: 0.85 },
    canvasSize: { width: 3000, height: 2000 },
    files: [
      { id: 'f1', label: 'Figma Prototype', type: 'figma' },
      { id: 'f2', label: 'AI Ethics Framework', type: 'doc' },
      { id: 'f3', label: 'Research Paper', type: 'pdf' },
    ],
    assets: [
      { id: 'a1', label: 'Beacon UI', thumbnailColor: '#FF6B9D', type: 'image' },
      { id: 'a2', label: 'Conversation Flows', thumbnailColor: '#FBBF24', type: 'illustration' },
      { id: 'a3', label: 'Trust Patterns', thumbnailColor: '#7C5CFC', type: 'component' },
    ],
    canvasElements: [
      {
        id: 'sl-1', type: 'section-label', x: 80, y: 60, width: 280, height: 40,
        data: { title: 'THE BRIEF', color: '#FF6B9D' }
      },
      {
        id: 'cs-1', type: 'case-study-card', x: 80, y: 120, width: 520, height: 280,
        data: {
          title: 'Beacon AI Navigation',
          subtitle: 'AI Product Design · 2024',
          description: 'How do you design trust in an AI system that makes consequential decisions? Beacon is a route optimization AI for logistics fleets. The challenge: make AI recommendations feel transparent, not scary.',
          tags: ['AI/ML', '0→1', 'Trust Design'],
          accentColor: '#FF6B9D',
          metrics: [
            { label: 'AI Acceptance Rate', value: '94%' },
            { label: 'Fuel Efficiency', value: '+23%' },
            { label: 'Driver Trust Score', value: '4.7/5' },
          ],
        }
      },
      {
        id: 'sl-2', type: 'section-label', x: 660, y: 60, width: 280, height: 40,
        data: { title: 'TRUST DESIGN PRINCIPLES', color: '#FBBF24' }
      },
      {
        id: 'sn-1', type: 'sticky-note', x: 660, y: 120, width: 230, height: 155,
        data: { content: '🔍 Explainability\nAlways show WHY the AI made a recommendation.', color: 'yellow', rotation: -1 }
      },
      {
        id: 'sn-2', type: 'sticky-note', x: 910, y: 105, width: 230, height: 155,
        data: { content: '🎛️ Control\nHumans can always override. AI suggests, humans decide.', color: 'pink', rotation: 1.5 }
      },
      {
        id: 'sn-3', type: 'sticky-note', x: 660, y: 295, width: 230, height: 155,
        data: { content: '📈 Confidence Levels\nVisual cues show AI certainty. Never overclaims.', color: 'purple', rotation: 0.5 }
      },
      {
        id: 'sn-4', type: 'sticky-note', x: 910, y: 280, width: 230, height: 155,
        data: { content: '🔄 Feedback Loops\nEvery override teaches the system. Users feel heard.', color: 'cyan', rotation: -0.8 }
      },
      {
        id: 'sl-3', type: 'section-label', x: 80, y: 460, width: 300, height: 40,
        data: { title: 'RESEARCH INSIGHTS', color: '#22D3EE' }
      },
      {
        id: 'mc-1', type: 'metric-card', x: 80, y: 520, width: 200, height: 120,
        data: { label: 'Drivers Interviewed', value: '62', accentColor: '#FF6B9D' }
      },
      {
        id: 'mc-2', type: 'metric-card', x: 300, y: 520, width: 200, height: 120,
        data: { label: 'Trust Barrier Found', value: '#1', change: 'Lack of explanation', accentColor: '#FBBF24' }
      },
      {
        id: 'mc-3', type: 'metric-card', x: 520, y: 520, width: 200, height: 120,
        data: { label: 'Prototype Tests', value: '8 rounds', accentColor: '#7C5CFC' }
      },
      {
        id: 'ps-1', type: 'process-step', x: 80, y: 700, width: 220, height: 150,
        data: { stepNumber: 1, title: 'Contextual Inquiry', description: 'Rode along with 20 drivers to understand their mental models of AI tools.', color: '#FF6B9D' }
      },
      {
        id: 'ps-2', type: 'process-step', x: 320, y: 700, width: 220, height: 150,
        data: { stepNumber: 2, title: 'Mental Model Mapping', description: 'Mapped how drivers conceptualize "good" vs "bad" routing decisions.', color: '#FBBF24' }
      },
      {
        id: 'ps-3', type: 'process-step', x: 560, y: 700, width: 220, height: 150,
        data: { stepNumber: 3, title: 'Trust Pattern Library', description: 'Designed 15 reusable patterns for showing AI confidence and reasoning.', color: '#22D3EE' }
      },
      {
        id: 'q-1', type: 'quote-block', x: 660, y: 460, width: 480, height: 180,
        data: {
          quote: '"At first I didn\'t trust it. But when it showed me WHY it picked the route, I started believing in it. Now I use it 100% of the time."',
          author: 'Carlos Rivera',
          role: 'Fleet Driver, Early Adopter',
          accentColor: '#FF6B9D'
        }
      },
      {
        id: 'tc-1', type: 'tag-cluster', x: 80, y: 910, width: 400, height: 110,
        data: {
          title: 'SKILLS APPLIED',
          tags: [
            { label: 'Contextual Inquiry', color: '#FF6B9D' },
            { label: 'Trust Design', color: '#FBBF24' },
            { label: 'AI/ML UX', color: '#7C5CFC' },
            { label: 'Ethical Design', color: '#34D399' },
            { label: 'Concept Testing', color: '#22D3EE' },
          ]
        }
      },
    ]
  },
];
