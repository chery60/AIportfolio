import type { Project } from '../types';

export const PROJECTS: Project[] = [
  {
    id: 'alchemy-design-system',
    title: 'Oracle Symphony Kiosk',
    description: 'Guest self-ordering kiosk — designed for QSRs, stadiums & fast casuals at Oracle FBGBU.',
    category: 'Product Design',
    year: '2024',
    tags: ['UX Design', 'Kiosk', 'Oracle', 'Enterprise', 'Figma'],
    accentColor: '#C74B18',
    gradientFrom: '#C74B18',
    gradientTo: '#F59E0B',
    defaultView: { x: -200, y: -80, scale: 0.72 },
    canvasSize: { width: 2700, height: 6900 },
    files: [
      { id: 'f1', label: 'Figma Master File', type: 'figma' },
      { id: 'f2', label: 'Sitemap', type: 'figma' },
      { id: 'f3', label: 'Task Flows', type: 'figma' },
      { id: 'f4', label: 'View Summary', type: 'figma' },
    ],
    assets: [
      { id: 'a1', label: 'Kiosk Hardware', thumbnailColor: '#1E3A5F', type: 'image' },
      { id: 'a2', label: 'User Personas', thumbnailColor: '#C74B18', type: 'illustration' },
      { id: 'a3', label: 'Success Matrix', thumbnailColor: '#F59E0B', type: 'image' },
      { id: 'a4', label: 'Task Flows', thumbnailColor: '#10B981', type: 'component' },
      { id: 'a5', label: 'Prototype Video', thumbnailColor: '#6366F1', type: 'image' },
    ],
    canvasElements: [
      // ── ROW 1: OVERVIEW ──────────────────────────────────────────────────
      // SPACING: section-label at y=60, h=40 → card starts at y=60+40+55=155 (SECTION_LABEL_GAP=55)
      // SPACING: sticky notes column 2 starts at x=700+240+80=1020 (ELEMENT_GAP_H=80)
      // SPACING: sticky note rows separated by 80px vertically (ELEMENT_GAP_V=80)
      {
        id: 'sl-1', type: 'section-label', x: 80, y: 60, width: 340, height: 40,
        data: { title: 'PROJECT OVERVIEW', color: '#C74B18' }
      },
      {
        id: 'cs-1', type: 'case-study-card', x: 80, y: 155, width: 560, height: 320,
        data: {
          title: 'Oracle Symphony Kiosk',
          subtitle: 'Product Design · Oracle FBGBU · 2024',
          description: "Oracle's Food & Beverage Global Business Unit needed a guest self-ordering kiosk for QSRs, fast casuals, stadiums & food courts. The kiosk connects the Enterprise Management Console, Point of Sale, and Kitchen Display System to create a seamless end-to-end ordering experience — built from scratch, hardware and software.",
          tags: ['Kiosk UX', '0→1 Product', 'Enterprise', 'Collaborative'],
          accentColor: '#C74B18',
          metrics: [
            { label: 'Problem Areas', value: '8' },
            { label: 'User Goals', value: '2 types' },
            { label: 'Contribution', value: 'Collab' },
          ],
        }
      },
      {
        id: 'sl-2', type: 'section-label', x: 720, y: 60, width: 340, height: 40,
        data: { title: 'PROBLEMS SOLVED', color: '#F59E0B' }
      },
      // sn col-1: x=720, width=240 → col-2 x = 720+240+80 = 1040
      // sn row-1: y=155, height=145 → row-2 y = 155+145+80 = 380 → row-3 y = 380+145+80 = 605
      {
        id: 'sn-1', type: 'sticky-note', x: 720, y: 155, width: 240, height: 145,
        data: { content: '🐌 Staff shortage\nToo few staff to serve high order volumes at peak times.', color: 'yellow', rotation: -1 }
      },
      {
        id: 'sn-2', type: 'sticky-note', x: 1040, y: 155, width: 240, height: 145,
        data: { content: '❌ Order errors\nManual entry led to frequent mistakes and re-orders.', color: 'pink', rotation: 1.2 }
      },
      {
        id: 'sn-3', type: 'sticky-note', x: 720, y: 380, width: 240, height: 145,
        data: { content: '♿ Accessibility\nGuests with disabilities struggled with traditional ordering.', color: 'purple', rotation: 0.5 }
      },
      {
        id: 'sn-4', type: 'sticky-note', x: 1040, y: 380, width: 240, height: 145,
        data: { content: '🌐 Language barrier\nForeigners & non-English speakers couldn\'t order efficiently.', color: 'cyan', rotation: -0.8 }
      },
      {
        id: 'sn-5', type: 'sticky-note', x: 720, y: 605, width: 240, height: 145,
        data: { content: '🤫 Introversion\nSocially anxious guests avoided ordering at busy counters.', color: 'green', rotation: 0.8 }
      },
      {
        id: 'sn-6', type: 'sticky-note', x: 1040, y: 605, width: 240, height: 145,
        data: { content: '💳 Payment pain\nMaking payments on receiving orders was slow and error-prone.', color: 'yellow', rotation: -1.2 }
      },

      // ── ROW 1b: SYSTEM ARCHITECTURE ──────────────────────────────────────
      // sn-5/sn-6 bottom: y=605+145=750 → section label y=750+80=830
      // label h=40 → fd y=830+40+55=925; fd-current right: 80+620=700 → fd-kiosk x=700+80=780
      {
        id: 'sl-arch', type: 'section-label', x: 80, y: 830, width: 400, height: 40,
        data: { title: 'SYSTEM ARCHITECTURE', color: '#1E3A5F' }
      },
      {
        id: 'fd-current', type: 'flow-diagram', x: 80, y: 925, width: 620, height: 480,
        data: {
          title: 'Currently — Before Kiosk',
          subtitle: 'EMC connects POS & Kitchen Display System',
          accentColor: '#64748B',
          nodes: [
            { id: 'emc', label: 'Enterprise\nManagement\nConsole', color: '#1E3A5F', x: 25, y: 60, width: 140, height: 110 },
            { id: 'kds', label: 'Kitchen Display\nSystem', color: '#10B981', x: 450, y: 60, width: 140, height: 110 },
            { id: 'pos', label: 'Point of Sale', color: '#F59E0B', x: 235, y: 220, width: 140, height: 110 },
          ],
          connections: [
            { from: 'emc', to: 'kds', bidirectional: true },
            { from: 'emc', to: 'pos', bidirectional: true },
            { from: 'kds', to: 'pos', bidirectional: true },
          ],
        }
      },
      {
        id: 'fd-kiosk', type: 'flow-diagram', x: 780, y: 925, width: 620, height: 480,
        data: {
          title: 'Introducing — Symphony Kiosk',
          subtitle: 'Kiosk added as a new touchpoint in the ecosystem',
          accentColor: '#C74B18',
          nodes: [
            { id: 'kiosk', label: 'Symphony\nKiosk', color: '#C74B18', x: 235, y: 20, width: 140, height: 110 },
            { id: 'emc2', label: 'Enterprise\nManagement\nConsole', color: '#1E3A5F', x: 25, y: 170, width: 140, height: 110 },
            { id: 'kds2', label: 'Kitchen Display\nSystem', color: '#10B981', x: 450, y: 170, width: 140, height: 110 },
            { id: 'pos2', label: 'Point of Sale', color: '#F59E0B', x: 235, y: 310, width: 140, height: 110 },
          ],
          connections: [
            { from: 'kiosk', to: 'emc2', bidirectional: true },
            { from: 'kiosk', to: 'kds2', bidirectional: true },
            { from: 'emc2', to: 'pos2', bidirectional: true },
            { from: 'pos2', to: 'kds2', bidirectional: true },
          ],
          highlightNodeId: 'kiosk',
        }
      },

      // ── ROW 2: METRICS ───────────────────────────────────────────────────
      // fd bottom: y=925+480=1405 → sl-3 y=1405+80=1485
      // sl h=40 → mc y=1485+40+55=1580
      // mc width=190, gap=80 → x positions: 80, 350, 620, 890
      {
        id: 'sl-3', type: 'section-label', x: 80, y: 1485, width: 340, height: 40,
        data: { title: 'IMPACT & OUTCOMES', color: '#10B981' }
      },
      {
        id: 'mc-1', type: 'metric-card', x: 80, y: 1580, width: 190, height: 120,
        data: { label: 'Staff Required', value: '↓ Less', change: 'Focus on delivery', changePositive: true, accentColor: '#C74B18' }
      },
      {
        id: 'mc-2', type: 'metric-card', x: 350, y: 1580, width: 190, height: 120,
        data: { label: 'Order Errors', value: '↓ Low', change: 'Self-entry accuracy', changePositive: true, accentColor: '#F59E0B' }
      },
      {
        id: 'mc-3', type: 'metric-card', x: 620, y: 1580, width: 190, height: 120,
        data: { label: 'Order Speed', value: 'Fast', change: 'Seamless UX flow', changePositive: true, accentColor: '#10B981' }
      },
      {
        id: 'mc-4', type: 'metric-card', x: 890, y: 1580, width: 190, height: 120,
        data: { label: 'Payment Options', value: '6+', change: 'Cards, mobile & more', changePositive: true, accentColor: '#6366F1' }
      },

      // ── ROW 3: USER GOALS & PERSONAS ─────────────────────────────────────
      // mc bottom: y=1580+120=1700 → sl-4 y=1700+80=1780
      // sl h=40 → quotes y=1780+40+55=1875
      // q-1 right: 80+440=520 → q-2 x=520+80=600
      // quotes bottom: y=1875+210=2085 → sn y=2085+80=2165
      // sn-7 right: 80+220=300 → sn-8 x=300+80=380
      {
        id: 'sl-4', type: 'section-label', x: 80, y: 1780, width: 340, height: 40,
        data: { title: 'USER GOALS & PERSONAS', color: '#6366F1' }
      },
      {
        id: 'q-1', type: 'quote-block', x: 80, y: 1875, width: 440, height: 210,
        data: {
          quote: '"As a Restaurant guest, I need to order food on kiosk so that I can get my food served quickly."',
          author: 'Megan Diaz',
          role: 'Restaurant Guest · Express Mode — Knows what they want',
          accentColor: '#C74B18',
        }
      },
      {
        id: 'q-2', type: 'quote-block', x: 600, y: 1875, width: 460, height: 210,
        data: {
          quote: '"As a Restaurant guest, I need to order food on kiosk so that I can get my food served without human interaction."',
          author: 'Luffy',
          role: 'Restaurant Guest · Browsing Mode — Introversion, Social anxiety, Language barrier',
          accentColor: '#6366F1',
        }
      },
      {
        id: 'sn-7', type: 'sticky-note', x: 80, y: 2165, width: 220, height: 120,
        data: { content: '🏃 Express Mode\nGuests who know what they want — fast, minimal taps.', color: 'yellow', rotation: -0.5 }
      },
      {
        id: 'sn-8', type: 'sticky-note', x: 380, y: 2165, width: 220, height: 120,
        data: { content: '🛍 Browsing Mode\nGuests who want to explore options — visual-first layout.', color: 'purple', rotation: 1 }
      },

      // ── ROW 4: MY PROCESS ────────────────────────────────────────────────
      // sn bottom: y=2165+120=2285 → sl-5 y=2285+80=2365
      // sl h=40 → ps y=2365+40+55=2460
      // ps width=210, gap=80 → x: 80, 370, 660, 950, 1240, 1530
      {
        id: 'sl-5', type: 'section-label', x: 80, y: 2365, width: 340, height: 40,
        data: { title: 'MY PROCESS', color: '#F59E0B' }
      },
      {
        id: 'ps-1', type: 'process-step', x: 80, y: 2460, width: 210, height: 190,
        data: { stepNumber: 1, title: 'Problem Discovery', description: 'Identified 8 pain points across QSRs, food courts & stadiums through research & stakeholder interviews.', color: '#C74B18' }
      },
      {
        id: 'ps-2', type: 'process-step', x: 370, y: 2460, width: 210, height: 190,
        data: { stepNumber: 2, title: 'User Goals & Personas', description: 'Defined 2 mental models — Express Mode & Browsing Mode. Created user goal cards for each.', color: '#F59E0B' }
      },
      {
        id: 'ps-3', type: 'process-step', x: 660, y: 2460, width: 210, height: 190,
        data: { stepNumber: 3, title: 'Success Matrix', description: 'Broke ordering journey into Pre-order, Order & Pay, Post-order phases. Identified gaps in each.', color: '#10B981' }
      },
      {
        id: 'ps-4', type: 'process-step', x: 950, y: 2460, width: 210, height: 190,
        data: { stepNumber: 4, title: 'Shape of Data', description: 'Defined UI data constraints: price levels, condiment groups, menu items, payment options & characters.', color: '#6366F1' }
      },
      {
        id: 'ps-5', type: 'process-step', x: 1240, y: 2460, width: 210, height: 190,
        data: { stepNumber: 5, title: 'Sitemap & Flows', description: 'Built full sitemap covering the entire journey from entering the restaurant to food pickup.', color: '#A855F7' }
      },
      {
        id: 'ps-6', type: 'process-step', x: 1530, y: 2460, width: 210, height: 190,
        data: { stepNumber: 6, title: 'Prototype & Test', description: 'Built portrait & landscape low-fi designs, tested with users, then moved to high-fidelity prototypes.', color: '#EC4899' }
      },

      // ── ROW 5: SUCCESS MATRIX ─────────────────────────────────────────────
      // ps bottom: y=2460+190=2650 → sl-6 y=2650+80=2730
      // sl h=40 → ufs y=2730+40+55=2825
      // ufs width=260, gap=80 → x: 80, 420, 760
      {
        id: 'sl-6', type: 'section-label', x: 80, y: 2730, width: 400, height: 40,
        data: { title: 'SUCCESS MATRIX — 3 PHASE JOURNEY', color: '#10B981' }
      },
      {
        id: 'ufs-1', type: 'user-flow-step', x: 80, y: 2825, width: 260, height: 190,
        data: { label: 'Pre-Order', description: 'Time finding a stand · Wait time placing an order', shape: 'rectangle', color: '#C74B18', stepNumber: 1 }
      },
      {
        id: 'ufs-2', type: 'user-flow-step', x: 420, y: 2825, width: 260, height: 190,
        data: { label: 'Order & Pay', description: 'Taps required · Completion rate · Accuracy · Payment success', shape: 'rectangle', color: '#F59E0B', stepNumber: 2 }
      },
      {
        id: 'ufs-3', type: 'user-flow-step', x: 760, y: 2825, width: 260, height: 190,
        data: { label: 'Post-Order', description: 'Wait time for pickup · Clarity of pickup info · Time at venue', shape: 'rectangle', color: '#10B981', stepNumber: 3 }
      },

      // ── ROW 5b: USER JOURNEY FLOW ─────────────────────────────────────────
      // ufs bottom: y=2825+190=3015 → sl-uj y=3015+80=3095
      // sl h=40 → fd y=3095+40+55=3190
      // fd right: 80+900=980 → sn-pain1 x=980+80=1060
      // sn-pain1 bottom: y=3190+110=3300 → sn-pain2 y=3300+80=3380
      {
        id: 'sl-uj', type: 'section-label', x: 80, y: 3095, width: 400, height: 40,
        data: { title: 'USER JOURNEY — KEY INSIGHTS', color: '#6366F1' }
      },
      {
        id: 'fd-journey', type: 'flow-diagram', x: 80, y: 3190, width: 900, height: 320,
        data: {
          title: 'User Journeys × Persona — Pain Points Mapped',
          subtitle: 'Browsing mode (orange) vs Express mode (blue) — dots show pain points at each step',
          accentColor: '#6366F1',
          nodes: [
            { id: 'enter', label: 'Enter', color: '#6366F1', x: 30, y: 100, width: 80, height: 40 },
            { id: 'locate', label: 'Locate', color: '#6366F1', x: 140, y: 100, width: 80, height: 40 },
            { id: 'browse', label: 'Browse', color: '#6366F1', x: 250, y: 100, width: 80, height: 40 },
            { id: 'order', label: 'Order', color: '#C74B18', x: 360, y: 100, width: 80, height: 40 },
            { id: 'pay', label: 'Pay', color: '#C74B18', x: 470, y: 100, width: 80, height: 40 },
            { id: 'collect', label: 'Collect', color: '#10B981', x: 580, y: 100, width: 80, height: 40 },
            { id: 'return', label: 'Return', color: '#10B981', x: 690, y: 100, width: 80, height: 40 },
            { id: 'express-label', label: '🏃 Express\nMode', color: '#3B82F6', x: 30, y: 190, width: 100, height: 50 },
            { id: 'browsing-label', label: '🛍 Browsing\nMode', color: '#F97316', x: 30, y: 255, width: 100, height: 50 },
          ],
          connections: [
            { from: 'enter', to: 'locate' },
            { from: 'locate', to: 'browse' },
            { from: 'browse', to: 'order' },
            { from: 'order', to: 'pay' },
            { from: 'pay', to: 'collect' },
            { from: 'collect', to: 'return' },
          ],
        }
      },
      {
        id: 'sn-pain1', type: 'sticky-note', x: 1060, y: 3190, width: 200, height: 110,
        data: { content: '🔴 Pain Points\nStaff-ordering: long queues, manual errors, payment delays.', color: 'pink', rotation: -0.5 }
      },
      {
        id: 'sn-pain2', type: 'sticky-note', x: 1060, y: 3380, width: 200, height: 110,
        data: { content: '🟡 Self-ordering\nKiosk eliminates queue, reduces errors, speeds up payment.', color: 'yellow', rotation: 0.8 }
      },

      // ── ROW 5c: SHAPE OF DATA ─────────────────────────────────────────────
      // fd bottom: y=3190+320=3510 → sl-sod y=3510+80=3590
      // sl h=40 → dd row-1 y=3590+40+55=3685
      // dd width=270, gap=80 → x: 80, 430, 780
      // dd row-1 bottom: y=3685+190=3875 → dd row-2 y=3875+80=3955
      {
        id: 'sl-sod', type: 'section-label', x: 80, y: 3590, width: 400, height: 40,
        data: { title: 'SHAPE OF DATA — UI CONSTRAINTS', color: '#A855F7' }
      },
      {
        id: 'dd-1', type: 'data-dimension', x: 80, y: 3685, width: 270, height: 190,
        data: { dimension: 'Dimension + Objectives', title: 'Number of Price Levels present for a given menu item', highlight: 'Price Levels', min: '1', max: '4', typical: '3', accentColor: '#C74B18' }
      },
      {
        id: 'dd-2', type: 'data-dimension', x: 430, y: 3685, width: 270, height: 190,
        data: { dimension: 'Dimension + Objectives', title: 'Number of Condiment Groups present for a given menu item', highlight: 'Condiment Groups', min: '0', max: '10', typical: '1–2', accentColor: '#F59E0B' }
      },
      {
        id: 'dd-3', type: 'data-dimension', x: 780, y: 3685, width: 270, height: 190,
        data: { dimension: 'Dimension + Objectives', title: 'Number of Menu Items present in a Combo meal', highlight: 'Menu Items', min: '2', max: '5', typical: '2–3', accentColor: '#10B981' }
      },
      {
        id: 'dd-4', type: 'data-dimension', x: 80, y: 3955, width: 270, height: 190,
        data: { dimension: 'Dimension + Objectives', title: 'Number of Categories the menu page can have', highlight: 'Categories', min: '4', max: '9', typical: '4', accentColor: '#6366F1' }
      },
      {
        id: 'dd-5', type: 'data-dimension', x: 430, y: 3955, width: 270, height: 190,
        data: { dimension: 'Dimension + Objectives', title: '# of payment options available at checkout', highlight: 'payment options', min: '2', max: '6', typical: '4', note: 'Cash, Credit/Debit, Apple/Google Pay, Paypal, Loyalty token', accentColor: '#A855F7' }
      },
      {
        id: 'dd-6', type: 'data-dimension', x: 780, y: 3955, width: 270, height: 190,
        data: { dimension: 'Dimension + Objectives', title: 'Number of characters that can be present in a menu item description', highlight: 'characters', min: '0', max: '1024', typical: '128+', accentColor: '#EC4899' }
      },

      // ── ROW 6: FIGMA EMBED ────────────────────────────────────────────────
      // dd row-2 bottom: y=3955+190=4145 → sl-7 y=4145+80=4225
      // sl h=40 → fe y=4225+40+55=4320
      // fe-1 right: 80+880=960 → fe-2 x=960+80=1040
      {
        id: 'sl-7', type: 'section-label', x: 80, y: 4225, width: 400, height: 40,
        data: { title: 'LIVE FIGMA FILE — SITEMAP & TASK FLOWS', color: '#A855F7' }
      },
      {
        id: 'fe-1', type: 'figma-embed', x: 80, y: 4320, width: 880, height: 520,
        data: {
          title: 'Kiosk · Sitemap',
          description: 'Full sitemap — from entering restaurant to food pickup',
          figmaUrl: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2FkioskSitemap',
          accentColor: '#A855F7',
        }
      },
      {
        id: 'fe-2', type: 'figma-embed', x: 1040, y: 4320, width: 880, height: 520,
        data: {
          title: 'Kiosk · Task Flows',
          description: 'Developer-ready task flows broken into buildable phases',
          figmaUrl: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2FkioskTaskFlows',
          accentColor: '#6366F1',
        }
      },

      // ── ROW 7: VIDEO EMBEDS ───────────────────────────────────────────────
      // fe bottom: y=4320+520=4840 → sl-8 y=4840+80=4920
      // sl h=40 → ve y=4920+40+55=5015
      // ve-1 right: 80+560=640 → ve-2 x=640+80=720
      {
        id: 'sl-8', type: 'section-label', x: 80, y: 4920, width: 400, height: 40,
        data: { title: 'PROTOTYPE PRESENTATION — VIDEO WALKTHROUGHS', color: '#EC4899' }
      },
      {
        id: 've-1', type: 'video-embed', x: 80, y: 5015, width: 560, height: 380,
        data: {
          title: 'Kiosk Prototype · Walk-through 1',
          description: 'Full order flow — start to payment. Portrait mode. Redwood Cafe theme.',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          accentColor: '#C74B18',
        }
      },
      {
        id: 've-2', type: 'video-embed', x: 720, y: 5015, width: 560, height: 380,
        data: {
          title: 'Kiosk Prototype · Walk-through 2',
          description: 'Bilingual flow with Spanish support. Landscape mode walkthrough.',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          accentColor: '#6366F1',
        }
      },

      // ── ROW 8: TAGS ───────────────────────────────────────────────────────
      // ve bottom: y=5015+380=5395 → sl-9 y=5395+80=5475
      // sl h=40 → tc y=5475+40+55=5570
      {
        id: 'sl-9', type: 'section-label', x: 80, y: 5475, width: 340, height: 40,
        data: { title: 'SKILLS APPLIED', color: '#C74B18' }
      },
      {
        id: 'tc-1', type: 'tag-cluster', x: 80, y: 5570, width: 820, height: 110,
        data: {
          title: 'SKILLS APPLIED',
          tags: [
            { label: 'UX Research', color: '#C74B18' },
            { label: 'User Personas', color: '#F59E0B' },
            { label: 'Information Architecture', color: '#10B981' },
            { label: 'Kiosk UX', color: '#6366F1' },
            { label: 'Figma Prototyping', color: '#A855F7' },
            { label: 'Enterprise Design', color: '#EC4899' },
            { label: 'Accessibility', color: '#22D3EE' },
            { label: '0→1 Product', color: '#FBBF24' },
          ]
        }
      },

      // ── STORYBOARDS ──────────────────────────────────────────────────────
      // tc bottom: y=5570+110=5680 → sl-10 y=5680+80=5760
      // sl h=40 → sb y=5760+40+55=5855
      // sb-problem right: 80+1080=1160 → sb-solution x=1160+80=1240
      {
        id: 'sl-10', type: 'section-label', x: 80, y: 5760, width: 400, height: 40,
        data: { title: 'THE PROBLEM & SOLUTION — STORYBOARD', color: '#F59E0B' }
      },
      {
        id: 'sb-problem', type: 'storyboard', x: 80, y: 5855, width: 1080, height: 832, zIndex: 10,
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
        id: 'sb-solution', type: 'storyboard', x: 1240, y: 5855, width: 1080, height: 832, zIndex: 10,
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
      },

      // ── GAME ZONE ─────────────────────────────────────────────────────────
      {
        id: 'sl-game', type: 'section-label', x: 2500, y: 60, width: 480, height: 40,
        data: { title: '🎮 CREWMATE DASH — PLAY & HIRE ME', color: '#C74B18' }
      },
      {
        id: 'gz-1', type: 'game-zone', x: 2500, y: 115, width: 1160, height: 620,
        data: {
          title: 'Crewmate Dash',
          accentColor: '#C74B18',
          contactEmail: 'saicharan@example.com',
          contactLinkedIn: 'https://linkedin.com/in/saicharan',
        }
      },
      {
        id: 'sn-game-hint', type: 'sticky-note', x: 2500, y: 760, width: 280, height: 120,
        data: {
          content: '🕹️ Your Among Us crewmate is the player! Dodge obstacles & get on the leaderboard.',
          color: 'yellow',
          rotation: -1.2,
        }
      },
      {
        id: 'sn-game-hint2', type: 'sticky-note', x: 2800, y: 775, width: 260, height: 110,
        data: {
          content: '⚠️ Only 1 player at a time — queue up if someone is already playing!',
          color: 'pink',
          rotation: 1,
        }
      },
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
        id: 'sn-2', type: 'sticky-note', x: 960, y: 100, width: 240, height: 140,
        data: { content: '🔔 "Notifications are the worst. Too many, too often."', color: 'yellow', rotation: 1 }
      },
      {
        id: 'sn-3', type: 'sticky-note', x: 640, y: 280, width: 240, height: 140,
        data: { content: '⏰ "I spend more time organizing tasks than doing them."', color: 'cyan', rotation: 0.5 }
      },
      {
        id: 'sn-4', type: 'sticky-note', x: 960, y: 260, width: 240, height: 140,
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
        id: 'ufs-2', type: 'user-flow-step', x: 320, y: 520, width: 160, height: 80,
        data: { label: 'Today View', description: 'AI-prioritized tasks', shape: 'rectangle', color: '#7C5CFC', stepNumber: 2 }
      },
      {
        id: 'ufs-3', type: 'user-flow-step', x: 560, y: 520, width: 160, height: 80,
        data: { label: 'Select Task', description: 'Tap to start', shape: 'rectangle', color: '#FF6B9D', stepNumber: 3 }
      },
      {
        id: 'ufs-4', type: 'user-flow-step', x: 800, y: 520, width: 160, height: 80,
        data: { label: 'Focus Mode', description: 'Distraction-free', shape: 'rectangle', color: '#FBBF24', stepNumber: 4 }
      },
      {
        id: 'ufs-5', type: 'user-flow-step', x: 1040, y: 520, width: 160, height: 80,
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
        id: 'ps-2', type: 'process-step', x: 380, y: 720, width: 220, height: 160,
        data: { stepNumber: 2, title: 'Calm Notifications', description: 'Batched, time-aware nudges. Never interrupts flow state.', color: '#FF6B9D' }
      },
      {
        id: 'ps-3', type: 'process-step', x: 680, y: 720, width: 220, height: 160,
        data: { stepNumber: 3, title: 'One Tap Entry', description: 'Voice or text. Task captured in under 3 seconds.', color: '#FBBF24' }
      },
      {
        id: 'mc-1', type: 'metric-card', x: 80, y: 940, width: 200, height: 110,
        data: { label: 'User Interviews', value: '48', accentColor: '#22D3EE' }
      },
      {
        id: 'mc-2', type: 'metric-card', x: 360, y: 940, width: 200, height: 110,
        data: { label: 'Usability Sessions', value: '12', accentColor: '#FF6B9D' }
      },
      {
        id: 'mc-3', type: 'metric-card', x: 640, y: 940, width: 200, height: 110,
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
        id: 'sn-2', type: 'sticky-note', x: 960, y: 110, width: 220, height: 150,
        data: { content: '🔐 Enterprise needs\nRole-based views, audit logs, SSO.', color: 'cyan', rotation: 1.5 }
      },
      {
        id: 'sn-3', type: 'sticky-note', x: 660, y: 290, width: 220, height: 150,
        data: { content: '⚡ Real-time updates\nLive data without cognitive overload.', color: 'purple', rotation: 0.5 }
      },
      {
        id: 'sn-4', type: 'sticky-note', x: 960, y: 280, width: 220, height: 150,
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
        id: 'mc-2', type: 'metric-card', x: 360, y: 520, width: 200, height: 120,
        data: { label: 'Support Tickets', value: '-65%', change: 'Post-redesign', changePositive: true, accentColor: '#22D3EE' }
      },
      {
        id: 'mc-3', type: 'metric-card', x: 640, y: 520, width: 200, height: 120,
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
        id: 'ps-2', type: 'process-step', x: 360, y: 760, width: 200, height: 150,
        data: { stepNumber: 2, title: 'Information Architecture', description: 'Restructured nav from 23 unclear sections to 5 goal-oriented hubs.', color: '#22D3EE' }
      },
      {
        id: 'ps-3', type: 'process-step', x: 640, y: 760, width: 200, height: 150,
        data: { stepNumber: 3, title: 'Visualization System', description: 'Built 40+ chart templates with consistent grammar and accessibility.', color: '#7C5CFC' }
      },
      {
        id: 'ps-4', type: 'process-step', x: 920, y: 760, width: 200, height: 150,
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
        id: 'sn-2', type: 'sticky-note', x: 990, y: 105, width: 230, height: 155,
        data: { content: '🎛️ Control\nHumans can always override. AI suggests, humans decide.', color: 'pink', rotation: 1.5 }
      },
      {
        id: 'sn-3', type: 'sticky-note', x: 660, y: 295, width: 230, height: 155,
        data: { content: '📈 Confidence Levels\nVisual cues show AI certainty. Never overclaims.', color: 'purple', rotation: 0.5 }
      },
      {
        id: 'sn-4', type: 'sticky-note', x: 990, y: 280, width: 230, height: 155,
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
        id: 'mc-2', type: 'metric-card', x: 360, y: 520, width: 200, height: 120,
        data: { label: 'Trust Barrier Found', value: '#1', change: 'Lack of explanation', accentColor: '#FBBF24' }
      },
      {
        id: 'mc-3', type: 'metric-card', x: 640, y: 520, width: 200, height: 120,
        data: { label: 'Prototype Tests', value: '8 rounds', accentColor: '#7C5CFC' }
      },
      {
        id: 'ps-1', type: 'process-step', x: 80, y: 700, width: 220, height: 150,
        data: { stepNumber: 1, title: 'Contextual Inquiry', description: 'Rode along with 20 drivers to understand their mental models of AI tools.', color: '#FF6B9D' }
      },
      {
        id: 'ps-2', type: 'process-step', x: 380, y: 700, width: 220, height: 150,
        data: { stepNumber: 2, title: 'Mental Model Mapping', description: 'Mapped how drivers conceptualize "good" vs "bad" routing decisions.', color: '#FBBF24' }
      },
      {
        id: 'ps-3', type: 'process-step', x: 680, y: 700, width: 220, height: 150,
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
