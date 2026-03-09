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
    defaultView: { x: 290, y: 42, scale: 0.72 },
    canvasSize: { width: 2700, height: 9400 },
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
      // SPACING: section-label at y=60, h=40 → card starts at y=60+40+16=116 (SECTION_LABEL_GAP=16)
      {
        id: 'sl-1', type: 'section-label', x: 80, y: 60, width: 340, height: 40,
        data: { title: 'PROJECT OVERVIEW', color: '#C74B18' }
      },
      {
        id: 'cs-1', type: 'case-study-card', x: 80, y: 116, width: 560, height: 320,
        data: {
          title: 'Oracle Symphony Kiosk',
          subtitle: 'Product Design · Oracle FBGBU · 2024',
          description: "Oracle's Food & Beverage Global Business Unit needed a guest self-ordering kiosk for QSRs, fast casuals, stadiums & food courts. The kiosk connects the Enterprise Management Console, Point of Sale, and Kitchen Display System to create a seamless end-to-end ordering experience — built from scratch, hardware and software.",
          tags: ['Kiosk UX', '0→1 Product', 'Enterprise', 'Individual'],
          accentColor: '#C74B18',
          metrics: [
            { label: 'Problem Areas', value: '8' },
            { label: 'User Goals', value: '2 types' },
            { label: 'Contribution', value: 'Individual' },
          ],
        }
      },
      {
        id: 'sl-2', type: 'section-label', x: 720, y: 60, width: 340, height: 40,
        data: { title: 'PROBLEMS SOLVED', color: '#F59E0B' }
      },
      // sn col-1: x=720, width=240 → col-2 x = 720+240+80 = 1040
      // sn row-1: y=116, height=145 → row-2 y = 116+145+80 = 341 → row-3 y = 341+145+80 = 566
      {
        id: 'sn-1', type: 'sticky-note', x: 720, y: 116, width: 240, height: 145,
        data: { content: '🐌 Staff shortage\nToo few staff to serve high order volumes at peak times.', color: 'yellow', rotation: -1 }
      },
      {
        id: 'sn-2', type: 'sticky-note', x: 1040, y: 116, width: 240, height: 145,
        data: { content: '❌ Order errors\nManual entry led to frequent mistakes and re-orders.', color: 'pink', rotation: 1.2 }
      },
      {
        id: 'sn-3', type: 'sticky-note', x: 720, y: 341, width: 240, height: 145,
        data: { content: '♿ Accessibility\nGuests with disabilities struggled with traditional ordering.', color: 'purple', rotation: 0.5 }
      },
      {
        id: 'sn-4', type: 'sticky-note', x: 1040, y: 341, width: 240, height: 145,
        data: { content: '🌐 Language barrier\nForeigners & non-English speakers couldn\'t order efficiently.', color: 'cyan', rotation: -0.8 }
      },
      {
        id: 'sn-5', type: 'sticky-note', x: 720, y: 566, width: 240, height: 145,
        data: { content: '🤫 Introversion\nSocially anxious guests avoided ordering at busy counters.', color: 'green', rotation: 0.8 }
      },
      {
        id: 'sn-6', type: 'sticky-note', x: 1040, y: 566, width: 240, height: 145,
        data: { content: '💳 Payment pain\nMaking payments on receiving orders was slow and error-prone.', color: 'yellow', rotation: -1.2 }
      },

      // ── ROW 1b: SYSTEM ARCHITECTURE ──────────────────────────────────────
      // sn-5/sn-6 bottom: y=566+145=711 → section label y=711+80=791
      // label h=40 → fd y=791+40+16=847
      {
        id: 'sl-arch', type: 'section-label', x: 80, y: 791, width: 400, height: 40,
        data: { title: 'SYSTEM ARCHITECTURE', color: '#1E3A5F' }
      },
      {
        id: 'fd-current', type: 'flow-diagram', x: 80, y: 847, width: 620, height: 520,
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
        id: 'fd-kiosk', type: 'flow-diagram', x: 780, y: 847, width: 620, height: 520,
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
      // fd bottom: y=847+520=1367 → sl-3 y=1367+80=1407
      // sl h=40 → mc y=1447+40+16=1463
      {
        id: 'sl-3', type: 'section-label', x: 80, y: 1447, width: 340, height: 40,
        data: { title: 'IMPACT & OUTCOMES', color: '#10B981' }
      },
      {
        id: 'mc-1', type: 'metric-card', x: 80, y: 1503, width: 190, height: 120,
        data: { label: 'Staff Required', value: '↓ Less', change: 'Focus on delivery', changePositive: true, accentColor: '#C74B18' }
      },
      {
        id: 'mc-2', type: 'metric-card', x: 350, y: 1503, width: 190, height: 120,
        data: { label: 'Order Errors', value: '↓ Low', change: 'Self-entry accuracy', changePositive: true, accentColor: '#F59E0B' }
      },
      {
        id: 'mc-3', type: 'metric-card', x: 620, y: 1503, width: 190, height: 120,
        data: { label: 'Order Speed', value: 'Fast', change: 'Seamless UX flow', changePositive: true, accentColor: '#10B981' }
      },
      {
        id: 'mc-4', type: 'metric-card', x: 890, y: 1503, width: 190, height: 120,
        data: { label: 'Payment Options', value: '6+', change: 'Cards, mobile & more', changePositive: true, accentColor: '#6366F1' }
      },

      // ── ROW 3: USER GOALS & PERSONAS ─────────────────────────────────────
      // mc bottom: y=1503+120=1583 → sl-4 y=1623+80=1663
      // sl h=40 → quotes y=1703+40+16=1719
      // q-1 right: 80+440=520 → q-2 x=520+80=600
      // quotes bottom: y=1759+210=1929 → sn y=1969+80=2009
      {
        id: 'sl-4', type: 'section-label', x: 80, y: 1703, width: 340, height: 40,
        data: { title: 'USER GOALS & PERSONAS', color: '#6366F1' }
      },
      {
        id: 'q-1', type: 'quote-block', x: 80, y: 1759, width: 440, height: 210,
        data: {
          quote: '"As a Restaurant guest, I need to order food on kiosk so that I can get my food served quickly."',
          author: 'Megan Diaz',
          role: 'Restaurant Guest · Express Mode — Knows what they want',
          accentColor: '#C74B18',
        }
      },
      {
        id: 'q-2', type: 'quote-block', x: 600, y: 1759, width: 460, height: 210,
        data: {
          quote: '"As a Restaurant guest, I need to order food on kiosk so that I can get my food served without human interaction."',
          author: 'Luffy',
          role: 'Restaurant Guest · Browsing Mode — Introversion, Social anxiety, Language barrier',
          accentColor: '#6366F1',
        }
      },
      {
        id: 'sn-7', type: 'sticky-note', x: 80, y: 2049, width: 220, height: 120,
        data: { content: '🏃 Express Mode\nGuests who know what they want — fast, minimal taps.', color: 'yellow', rotation: -0.5 }
      },
      {
        id: 'sn-8', type: 'sticky-note', x: 380, y: 2049, width: 220, height: 120,
        data: { content: '🛍 Browsing Mode\nGuests who want to explore options — visual-first layout.', color: 'purple', rotation: 1 }
      },

      // ── ROW 4: MY PROCESS ────────────────────────────────────────────────
      // sn bottom: y=2205+120=2285 → sl-5 y=2325+80=2365
      // sl h=40 → ps y=2405+40+55=2460
      // ps width=210, gap=80 → x: 80, 370, 660, 950, 1240, 1530
      {
        id: 'sl-5', type: 'section-label', x: 80, y: 2249, width: 340, height: 40,
        data: { title: 'MY PROCESS', color: '#F59E0B' }
      },
      {
        id: 'ps-1', type: 'process-step', x: 80, y: 2305, width: 210, height: 190,
        data: { stepNumber: 1, title: 'Problem Discovery', description: 'Identified 8 pain points across QSRs, food courts & stadiums through research & stakeholder interviews.', color: '#C74B18' }
      },
      {
        id: 'ps-2', type: 'process-step', x: 370, y: 2305, width: 210, height: 190,
        data: { stepNumber: 2, title: 'User Goals & Personas', description: 'Defined 2 mental models — Express Mode & Browsing Mode. Created user goal cards for each.', color: '#F59E0B' }
      },
      {
        id: 'ps-3', type: 'process-step', x: 660, y: 2305, width: 210, height: 190,
        data: { stepNumber: 3, title: 'Success Matrix', description: 'Broke ordering journey into Pre-order, Order & Pay, Post-order phases. Identified gaps in each.', color: '#10B981' }
      },
      {
        id: 'ps-4', type: 'process-step', x: 950, y: 2305, width: 210, height: 190,
        data: { stepNumber: 4, title: 'Shape of Data', description: 'Defined UI data constraints: price levels, condiment groups, menu items, payment options & characters.', color: '#6366F1' }
      },
      {
        id: 'ps-5', type: 'process-step', x: 1240, y: 2305, width: 210, height: 190,
        data: { stepNumber: 5, title: 'Sitemap & Flows', description: 'Built full sitemap covering the entire journey from entering the restaurant to food pickup.', color: '#A855F7' }
      },
      {
        id: 'ps-6', type: 'process-step', x: 1530, y: 2305, width: 210, height: 190,
        data: { stepNumber: 6, title: 'Prototype & Test', description: 'Built portrait & landscape low-fi designs, tested with users, then moved to high-fidelity prototypes.', color: '#EC4899' }
      },

      // ── ROW 5: SUCCESS MATRIX ─────────────────────────────────────────────
      // ps bottom: y=2500+190=2650 → sl-6 y=2690+80=2730
      // sl h=40 → ufs y=2770+40+55=2825
      // ufs width=260, gap=80 → x: 80, 420, 760
      {
        id: 'sl-6', type: 'section-label', x: 80, y: 2575, width: 400, height: 40,
        data: { title: 'SUCCESS MATRIX — 3 PHASE JOURNEY', color: '#10B981' }
      },
      {
        id: 'ufs-1', type: 'user-flow-step', x: 80, y: 2631, width: 260, height: 190,
        data: { label: 'Pre-Order', description: 'Time finding a stand · Wait time placing an order', shape: 'rectangle', color: '#C74B18', stepNumber: 1 }
      },
      {
        id: 'ufs-2', type: 'user-flow-step', x: 420, y: 2631, width: 260, height: 190,
        data: { label: 'Order & Pay', description: 'Taps required · Completion rate · Accuracy · Payment success', shape: 'rectangle', color: '#F59E0B', stepNumber: 2 }
      },
      {
        id: 'ufs-3', type: 'user-flow-step', x: 760, y: 2631, width: 260, height: 190,
        data: { label: 'Post-Order', description: 'Wait time for pickup · Clarity of pickup info · Time at venue', shape: 'rectangle', color: '#10B981', stepNumber: 3 }
      },

      // ── ROW 5b: USER JOURNEY FLOW ─────────────────────────────────────────
      // ufs bottom: y=2865+190=3015 → sl-uj y=3055+80=3095
      // sl h=40 → fd y=3135+40+55=3190
      // fd right: 80+900=980 → sn-pain1 x=980+80=1060
      // sn-pain1 bottom: y=3230+110=3300 → sn-pain2 y=3340+80=3380
      {
        id: 'sl-uj', type: 'section-label', x: 80, y: 2901, width: 400, height: 40,
        data: { title: 'USER JOURNEY — KEY INSIGHTS', color: '#6366F1' }
      },
      {
        id: 'fd-journey', type: 'flow-diagram', x: 80, y: 2957, width: 1200, height: 560,
        data: {
          title: 'User Journeys × Persona — Pain Points Mapped',
          subtitle: 'Browsing mode (green) vs Express mode (pink) — dots show pain points at each step',
          accentColor: '#6366F1',
          journeyMap: {
            phases: [
              { label: 'pre-order experience', startStep: 0, endStep: 2 },
              { label: 'order experience', startStep: 3, endStep: 4 },
              { label: 'post-order experience', startStep: 5, endStep: 6 },
            ],
            browsingPath: [
              { id: 'b-browse', label: 'Browse' },
              { id: 'b-locate', label: 'Locate' },
              { id: 'b-decide', label: 'Decide' },
            ],
            expressPath: [
              { id: 'e-decide', label: 'Decide' },
              { id: 'e-locate', label: 'Locate' },
            ],
            sharedSteps: [
              { id: 's-queue', label: 'Queue' },
              { id: 's-order', label: 'Order' },
              { id: 's-pay', label: 'Pay' },
              { id: 's-collect', label: 'Collect' },
              { id: 's-return', label: 'Return' },
            ],
            painPointsInPerson: ['b-decide', 's-queue', 's-return'],
            painPointsKiosk: ['b-decide', 's-queue', 's-order', 's-collect', 's-return'],
          },
          nodes: [],
          connections: [],
        }
      },
      // ── ROW 5c: SHAPE OF DATA ─────────────────────────────────────────────
      // fd bottom: y=3230+560=3750 → sl-sod y=3790+80=3830
      // sl h=40 → dd row-1 y=3870+40+55=3925
      // dd width=270, gap=80 → x: 80, 430, 780
      // dd row-1 bottom: y=3965+190=4115 → dd row-2 y=4155+80=4195
      {
        id: 'sl-sod', type: 'section-label', x: 80, y: 3597, width: 400, height: 40,
        data: { title: 'SHAPE OF DATA — UI CONSTRAINTS', color: '#A855F7' }
      },
      {
        id: 'dd-1', type: 'data-dimension', x: 80, y: 3653, width: 270, height: 190,
        data: { dimension: 'Dimension + Objectives', title: 'Number of Price Levels present for a given menu item', highlight: 'Price Levels', min: '1', max: '4', typical: '3', accentColor: '#C74B18' }
      },
      {
        id: 'dd-2', type: 'data-dimension', x: 430, y: 3653, width: 270, height: 190,
        data: { dimension: 'Dimension + Objectives', title: 'Number of Condiment Groups present for a given menu item', highlight: 'Condiment Groups', min: '0', max: '10', typical: '1–2', accentColor: '#F59E0B' }
      },
      {
        id: 'dd-3', type: 'data-dimension', x: 780, y: 3653, width: 270, height: 190,
        data: { dimension: 'Dimension + Objectives', title: 'Number of Menu Items present in a Combo meal', highlight: 'Menu Items', min: '2', max: '5', typical: '2–3', accentColor: '#10B981' }
      },
      {
        id: 'dd-4', type: 'data-dimension', x: 80, y: 3923, width: 270, height: 190,
        data: { dimension: 'Dimension + Objectives', title: 'Number of Categories the menu page can have', highlight: 'Categories', min: '4', max: '9', typical: '4', accentColor: '#6366F1' }
      },
      {
        id: 'dd-5', type: 'data-dimension', x: 430, y: 3923, width: 270, height: 190,
        data: { dimension: 'Dimension + Objectives', title: '# of payment options available at checkout', highlight: 'payment options', min: '2', max: '6', typical: '4', note: 'Cash, Credit/Debit, Apple/Google Pay, Paypal, Loyalty token', accentColor: '#A855F7' }
      },
      {
        id: 'dd-6', type: 'data-dimension', x: 780, y: 3923, width: 270, height: 190,
        data: { dimension: 'Dimension + Objectives', title: 'Number of characters that can be present in a menu item description', highlight: 'characters', min: '0', max: '1024', typical: '128+', accentColor: '#EC4899' }
      },

      // ── ROW 6: FIGMA EMBEDS ───────────────────────────────────────────────
      // dd row-2 bottom: y=3923+190=4073 → sl-7 y=4113+80=4153
      // sl h=40 → fe y=4193+40+56=4249
      // 2 embeds side by side max: width=720 each, gap=80
      // fe-3 on next row
      {
        id: 'sl-7', type: 'section-label', x: 80, y: 4193, width: 560, height: 40,
        data: { title: 'LIVE FIGMA FILES — SITEMAP, VIEW SUMMARY & TASK FLOWS', color: '#A855F7' }
      },
      {
        id: 'fe-1', type: 'figma-embed', x: 80, y: 4289, width: 720, height: 540,
        data: {
          title: 'Kiosk · Sitemap',
          description: 'Full sitemap — from entering restaurant to food pickup',
          figmaUrl: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2Fo3nHV47UkzxHDz7OMfDrn2%2FKiosk%3Fnode-id%3D2436-101059%26t%3DeZhWgo3YibYXDxqn-4',
          accentColor: '#A855F7',
        }
      },
      {
        id: 'fe-2', type: 'figma-embed', x: 880, y: 4289, width: 720, height: 540,
        data: {
          title: 'Kiosk · View Summary',
          description: 'High-level view summary of the kiosk design',
          figmaUrl: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2Fo3nHV47UkzxHDz7OMfDrn2%2FKiosk%3Fnode-id%3D65860-7363%26t%3D7aXa5YustdH1dbnO-4',
          accentColor: '#6366F1',
        }
      },
      {
        id: 'fe-3', type: 'figma-embed', x: 80, y: 4909, width: 720, height: 540,
        data: {
          title: 'Kiosk · Task Flows',
          description: 'Developer-ready task flows broken into buildable phases',
          figmaUrl: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2Fo3nHV47UkzxHDz7OMfDrn2%2FKiosk%3Fnode-id%3D5470-288291',
          accentColor: '#EC4899',
        }
      },

      // ── ROW 7: VIDEO EMBEDS ───────────────────────────────────────────────
      // fe bottom: y=4909+540=5449 → sl-8 y=5449+80=5529
      // sl h=40 → ve y=5529+40+56=5625
      {
        id: 'sl-8', type: 'section-label', x: 80, y: 5529, width: 400, height: 40,
        data: { title: 'PROTOTYPE PRESENTATION — VIDEO WALKTHROUGHS', color: '#EC4899' }
      },
      {
        id: 've-1', type: 'video-embed', x: 80, y: 5625, width: 720, height: 540,
        data: {
          title: 'Kiosk Prototype · Walk-through 1',
          description: 'Full order flow — start to payment. Portrait mode. Redwood Cafe theme.',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          accentColor: '#C74B18',
        }
      },
      {
        id: 've-2', type: 'video-embed', x: 880, y: 5625, width: 720, height: 540,
        data: {
          title: 'Kiosk Prototype · Walk-through 2',
          description: 'Bilingual flow with Spanish support. Landscape mode walkthrough.',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          accentColor: '#6366F1',
        }
      },

      // ── ROW 8: TAGS ───────────────────────────────────────────────────────
      // ve bottom: y=5625+540=6165 → sl-9 y=6165+80=6245
      // sl h=40 → tc y=6245+40+56=6341
      {
        id: 'sl-9', type: 'section-label', x: 80, y: 6245, width: 340, height: 40,
        data: { title: 'SKILLS APPLIED', color: '#C74B18' }
      },
      {
        id: 'tc-1', type: 'tag-cluster', x: 80, y: 6341, width: 820, height: 110,
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
      // tc bottom: y=6341+110=6451 → sl-10 y=6451+80=6531
      // sl h=40 → sb y=6531+40+56=6627
      {
        id: 'sl-10', type: 'section-label', x: 80, y: 6531, width: 400, height: 40,
        data: { title: 'THE PROBLEM & SOLUTION — STORYBOARD', color: '#F59E0B' }
      },
      {
        id: 'sb-problem', type: 'storyboard', x: 80, y: 6627, width: 1000, height: 900, zIndex: 10,
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
        id: 'sb-solution', type: 'storyboard', x: 1160, y: 6627, width: 1000, height: 900, zIndex: 10,
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

      // ── THANK YOU / GAME HOOK ─────────────────────────────────────────────
      // sb bottom: y=6627+900=7527 → sl-thanks y=7527+100=7627
      // sl h=40 → card y=7627+40+16=7683, height=300 → ends=7983
      // sticky notes y=7983+80=8063, h=130 → ends=8193
      // gap 100 → sl-game y=8193+100=8293
      // sl h=40 → gz y=8293+40+16=8349, h=680 → ends=9029
      // hints y=9029+60=9089
      {
        id: 'sl-thanks', type: 'section-label', x: 80, y: 7627, width: 480, height: 40,
        data: { title: '👋 THAT\'S A WRAP — YOU MADE IT!', color: '#F59E0B' }
      },
      {
        id: 'cs-thanks', type: 'case-study-card', x: 80, y: 7683, width: 1080, height: 300,
        data: {
          title: 'You just reviewed the entire Oracle Symphony Kiosk case study.',
          subtitle: 'Thanks for going through every screen, every decision, every pixel.',
          description: "You've seen the problem space, the research, the architecture, the process, the prototypes — and just now, the story play out in a restaurant. That's the full picture of how I think and build. If this kind of work excites you, I'd love to chat. But first — you've earned a game. 🎮 Play Crewmate Dash below, get on the leaderboard, and then let's talk.",
          tags: ['Thanks for reading', 'Let\'s connect', 'Now go play 🕹️'],
          accentColor: '#F59E0B',
          metrics: [
            { label: 'Sections Covered', value: '10+' },
            { label: 'Time Well Spent', value: '✓' },
            { label: 'Ready to Chat?', value: 'Yes!' },
          ],
        }
      },
      {
        id: 'sn-thanks-1', type: 'sticky-note', x: 80, y: 8063, width: 280, height: 130,
        data: {
          content: '🧠 You now know more about this kiosk than most people at the company.',
          color: 'cyan',
          rotation: -1,
        }
      },
      {
        id: 'sn-thanks-2', type: 'sticky-note', x: 400, y: 8048, width: 280, height: 130,
        data: {
          content: '🏆 Beat the leaderboard and I\'ll know you were thorough AND competitive.',
          color: 'green',
          rotation: 1.2,
        }
      },
      {
        id: 'sn-thanks-3', type: 'sticky-note', x: 720, y: 8058, width: 280, height: 130,
        data: {
          content: '💌 Liked what you saw? Hit "Message Me" on the right panel — let\'s talk!',
          color: 'purple',
          rotation: -0.8,
        }
      },

      // ── GAME ZONE ─────────────────────────────────────────────────────────
      // sl-game y=8293, gz y=8349 (well below storyboard bottom at 7527)
      {
        id: 'sl-game', type: 'section-label', x: 80, y: 8293, width: 480, height: 40,
        data: { title: '🎮 CREWMATE DASH — PLAY & HIRE ME', color: '#C74B18' }
      },
      {
        id: 'gz-1', type: 'game-zone', x: 80, y: 8349, width: 1160, height: 680,
        data: {
          title: 'Crewmate Dash',
          accentColor: '#C74B18',
          contactEmail: 'saicharan@example.com',
          contactLinkedIn: 'https://linkedin.com/in/saicharan',
        }
      },
      {
        id: 'sn-game-hint', type: 'sticky-note', x: 80, y: 9089, width: 280, height: 120,
        data: {
          content: '🕹️ Dodge obstacles & get on the leaderboard. Space or tap to jump!',
          color: 'yellow',
          rotation: -1.2,
        }
      },
      {
        id: 'sn-game-hint2', type: 'sticky-note', x: 380, y: 9104, width: 260, height: 110,
        data: {
          content: '⚠️ Only 1 player at a time — queue up if someone is already playing!',
          color: 'pink',
          rotation: 1,
        }
      },
    ]
  },
  {
    id: 'user-management',
    title: 'User Management',
    description: 'Allowing customers to fully onboard, provision, and manage users or employees from a common place.',
    category: 'Design',
    year: '2024',
    tags: ['UX Design', 'Enterprise', 'Oracle', 'OJET', 'Collaborative'],
    accentColor: '#1E3A8A',
    gradientFrom: '#1E40AF',
    gradientTo: '#3B82F6',
    defaultView: { x: 290, y: 42, scale: 0.72 },
    canvasSize: { width: 2700, height: 12500 },
    files: [
      { id: 'f1', label: 'Figma Master File', type: 'figma' },
      { id: 'f2', label: 'User Flows', type: 'figma' },
      { id: 'f3', label: 'Information Architecture', type: 'figma' },
      { id: 'f4', label: 'View Summary', type: 'figma' },
    ],
    assets: [
      { id: 'a1', label: 'User Management UI', thumbnailColor: '#1E3A8A', type: 'image' },
      { id: 'a2', label: 'User Personas', thumbnailColor: '#6366F1', type: 'illustration' },
      { id: 'a3', label: 'Data Dimensions', thumbnailColor: '#F59E0B', type: 'image' },
      { id: 'a4', label: 'Wireframes', thumbnailColor: '#10B981', type: 'component' },
      { id: 'a5', label: 'Hi-Fi Screens', thumbnailColor: '#EF4444', type: 'image' },
    ],
    canvasElements: [

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 1: PROJECT OVERVIEW
      // ══════════════════════════════════════════════════════════════════════
      {
        id: 'sl-1', type: 'section-label', x: 80, y: 60, width: 340, height: 40,
        data: { title: 'PROJECT OVERVIEW', color: '#1E3A8A' }
      },
      {
        id: 'cs-1', type: 'case-study-card', x: 80, y: 116, width: 560, height: 320,
        data: {
          title: 'User Management',
          subtitle: 'Design · Oracle FBGBU · 2024',
          description: "Oracle's Food and Beverage Global Business Unit offers several enterprise software solutions, including the Enterprise Management Console (EMC), Backoffice, Point of Sale (POS), and Kitchen Display System (KDS). Each of these had its own user management system, which made it challenging to manage users across multiple products. To solve this, the team decided to create a unified user management system to streamline user management across all the platforms.",
          tags: ['Enterprise', 'Oracle', 'OJET', 'Collaborative'],
          accentColor: '#1E3A8A',
          metrics: [
            { label: 'Category', value: 'Design' },
            { label: 'Contribution', value: 'Collaborative' },
          ],
        }
      },

      // ── BACK STORY (right of overview) ─────────────────────────────────
      {
        id: 'sl-story', type: 'section-label', x: 720, y: 60, width: 340, height: 40,
        data: { title: 'BACK STORY', color: '#6366F1' }
      },
      {
        id: 'sn-bg', type: 'sticky-note', x: 720, y: 116, width: 240, height: 160,
        data: { content: 'The team decided to build a single platform to fully maintain Back Office, POS, EMC users, and their access. The entire back office software is built on a different architecture (OJET-6).', color: 'purple', rotation: 0.5 }
      },
      {
        id: 'sn-bg2', type: 'sticky-note', x: 990, y: 116, width: 240, height: 160,
        data: { content: 'The Enterprise Management Console software was upgraded to a new OJET 12 which supported a complete stack of components to make for a new redwood design system.', color: 'cyan', rotation: -0.8 }
      },

      // ── PROBLEM STATEMENT ──────────────────────────────────────────────
      {
        id: 'q-prob', type: 'quote-block', x: 720, y: 300, width: 510, height: 140,
        data: {
          quote: 'How might we help an administrator add and manage user access of all employees across the Back Office, EMC, and POS from a single unified platform?',
          author: 'Problem Statement',
          role: '("How might we" statement)',
          accentColor: '#EF4444',
        }
      },

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 2: IDENTIFICATION OF PROBLEMS — KNOWN PROBLEMS
      // ══════════════════════════════════════════════════════════════════════
      // cs bottom = 116+320 = 436 → sl y = 436+80 = 516
      {
        id: 'sl-prob', type: 'section-label', x: 80, y: 516, width: 440, height: 40,
        data: { title: 'IDENTIFICATION OF PROBLEMS — KNOWN', color: '#EF4444' }
      },
      // sn y = 516+40+16 = 572
      {
        id: 'sn-p1', type: 'sticky-note', x: 80, y: 572, width: 300, height: 145,
        data: { content: '1. Building a Unified platform supporting both the architectures (i.e. OJET 6 and OJET 12 level architectural components should be collaborated)', color: 'pink', rotation: -1 }
      },
      {
        id: 'sn-p2', type: 'sticky-note', x: 410, y: 572, width: 300, height: 145,
        data: { content: '2. Unifying the data flows (defining data points and saving triggers) for both the respective product\'s onboarding journeys was different and the data got saved to their respective database tables.', color: 'yellow', rotation: 1.2 }
      },
      {
        id: 'sn-p3', type: 'sticky-note', x: 740, y: 572, width: 300, height: 145,
        data: { content: '3. Filtering of Users as the users for both the plates will be migrated to a new unified platform.', color: 'cyan', rotation: -0.5 }
      },
      // sn row 2: y = 572+145+80 = 797
      {
        id: 'sn-p4', type: 'sticky-note', x: 80, y: 797, width: 300, height: 145,
        data: { content: '4. Building two different workflows one which supports labor management products and one which doesn\'t support.', color: 'green', rotation: 0.8 }
      },
      {
        id: 'sn-p5', type: 'sticky-note', x: 410, y: 797, width: 300, height: 145,
        data: { content: '5. Managing access of common employees present on both platforms which includes deletion of users, and managing permission among zones, revenue centers, and locations.', color: 'yellow', rotation: -1.2 }
      },

      // ── UNKNOWN PROBLEMS ───────────────────────────────────────────────
      {
        id: 'sl-unk', type: 'section-label', x: 740, y: 797, width: 340, height: 40,
        data: { title: 'UNKNOWN PROBLEMS', color: '#A855F7' }
      },
      {
        id: 'sn-up1', type: 'sticky-note', x: 740, y: 853, width: 290, height: 130,
        data: { content: '🔍 Unknown Problem 1\nImproving the information architecture. To build the right workflows.', color: 'purple', rotation: 1 }
      },
      {
        id: 'sn-up2', type: 'sticky-note', x: 1060, y: 853, width: 290, height: 130,
        data: { content: '🧩 Unknown Problem 2\nImproving the overall product experience by handling the component mismatch and screen responsiveness.', color: 'pink', rotation: -0.5 }
      },

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 3: DEFINING THE USER GOALS
      // ══════════════════════════════════════════════════════════════════════
      // sn row2 bottom = 797+145 = 942 → sl y = 942+100 = 1062
      {
        id: 'sl-goals', type: 'section-label', x: 80, y: 1062, width: 340, height: 40,
        data: { title: 'DEFINING THE USER GOALS', color: '#10B981' }
      },
      {
        id: 'ps-goals', type: 'process-step', x: 80, y: 1118, width: 300, height: 170,
        data: { stepNumber: 1, title: 'Stakeholder Alignment', description: 'Connected with the respective PMs and stakeholders and defined all the user goals so that the system could be built. Authors: Sai Charan Kalla, Meha Gupta, LutZ.', color: '#10B981' }
      },

      // USER GOAL 1 — Add User
      {
        id: 'sl-ug1', type: 'section-label', x: 80, y: 1318, width: 560, height: 36,
        data: { title: 'USER GOAL 1 — ADD USER · System Administrator', color: '#1E3A8A' }
      },
      {
        id: 'cs-ug1', type: 'case-study-card', x: 80, y: 1370, width: 1240, height: 240,
        data: {
          title: 'As a System administrator, I need to add User, so that I can assign roles, locations, Revenue Centers.',
          subtitle: 'Add User · System Administrator — Mike Rose',
          description: 'Success Metrics: Easier to onboard and manage all application users from one place.\n\nExample: At present, we manage our application users from different locations, which makes the overall system administration difficult. This is to streamlined the onboarding process from single solution.',
          tags: ['Add User', 'System Administrator', 'Roles', 'Locations'],
          accentColor: '#1E3A8A',
          metrics: [
            { label: 'Persona', value: 'Sys Admin' },
            { label: 'Metric', value: 'Unified UX' },
            { label: 'Goal', value: 'Add User' },
          ],
        }
      },

      // USER GOAL 2 — Add User/Edit User (Onboard from EBO)
      {
        id: 'sl-ug2', type: 'section-label', x: 80, y: 1638, width: 560, height: 36,
        data: { title: 'USER GOAL 2 — ADD/EDIT USER FROM EBO · System Administrator', color: '#6366F1' }
      },
      {
        id: 'cs-ug2', type: 'case-study-card', x: 80, y: 1690, width: 1240, height: 270,
        data: {
          title: 'As a System administrator, I need to onboard all users from EBO, so that I can manage all our application users (R&A, EMC G2, POS,) from a single user interface and workflow if HR is not in use.',
          subtitle: 'Add User/Edit User · System Administrator — Mike Rose',
          description: 'Success Metrics:\n• System administrator can hire all application users from a common place.\n• System administrator can manage all application users from a common place.\n• Easier to onboard and manage all application users from one place.\n\nExample: At present, we manage our application users from different locations, which makes the overall system administration difficult. This is to streamlined the onboarding process from single solution.',
          tags: ['Onboard from EBO', 'R&A', 'EMC G2', 'POS', 'Single UI'],
          accentColor: '#6366F1',
          metrics: [
            { label: 'Persona', value: 'Sys Admin' },
            { label: 'Platform', value: 'EBO' },
            { label: 'Workflow', value: 'Unified' },
          ],
        }
      },

      // USER GOAL 3 — Add User Using User Template
      {
        id: 'sl-ug3', type: 'section-label', x: 80, y: 1988, width: 560, height: 36,
        data: { title: 'USER GOAL 3 — ADD USER USING USER TEMPLATE', color: '#F59E0B' }
      },
      {
        id: 'cs-ug3', type: 'case-study-card', x: 80, y: 2040, width: 1240, height: 290,
        data: {
          title: 'As a System administrator/IT Admin / HR rep / store manager, I need to create a new user/employee from a template, so that I do not need to complete common attributes, permissions, and privileges again and can create the user/employee much faster.',
          subtitle: 'Add User Using User Template · System Administrator — Mike Rose',
          description: 'Success Metrics:\n• Save time when hiring new user as copying all privileges and common attributes from template employee record.\n• System Administrator can select an user/employee to copy from the list of already created users.\n• System Administrator can provide the value to attributes that will be unique to every user while copying.\n• System Administrator can edit the newly created user after adding it using template user.\n\nExample: HR representative needs to hire multiple POS users to work in specific location/revenue center with same Role privileges for example: Waiter, Bartender.',
          tags: ['User Template', 'IT Admin', 'HR Rep', 'Store Manager', 'Copy User'],
          accentColor: '#F59E0B',
          metrics: [
            { label: 'Persona', value: 'Multi-Role' },
            { label: 'Goal', value: 'Speed' },
            { label: 'Method', value: 'Template' },
          ],
        }
      },

      // USER GOAL 4 — Hire POS User
      {
        id: 'sl-ug4', type: 'section-label', x: 80, y: 2358, width: 560, height: 36,
        data: { title: 'USER GOAL 4 — HIRE POS USER · HR Representative', color: '#EC4899' }
      },
      {
        id: 'cs-ug4', type: 'case-study-card', x: 80, y: 2410, width: 1240, height: 260,
        data: {
          title: 'As an HR representative, I need to specify appropriate details and roles, so that I can hire them with all necessary details.',
          subtitle: 'Hire POS User · System Administrator — Mike Rose',
          description: 'Success Metrics:\n• All the important information specified, which is required for a POS user to work in a restaurant.\n\nExample:\n• Cashier needs an employee ID to login into workstation.\n• Preferred Language to view the user interface in it.\n• Roles to understand the permission related behavior for example: Ability to perform void.',
          tags: ['Hire POS User', 'HR Representative', 'Roles', 'Employee ID'],
          accentColor: '#EC4899',
          metrics: [
            { label: 'Persona', value: 'HR Rep' },
            { label: 'Goal', value: 'Hire POS' },
            { label: 'Key Item', value: 'Roles' },
          ],
        }
      },

      // USER GOAL 5 — Assign Location Access to POS User
      {
        id: 'sl-ug5', type: 'section-label', x: 80, y: 2698, width: 560, height: 36,
        data: { title: 'USER GOAL 5 — ASSIGN LOCATION ACCESS TO POS USER', color: '#22D3EE' }
      },
      {
        id: 'cs-ug5', type: 'case-study-card', x: 80, y: 2750, width: 1240, height: 270,
        data: {
          title: 'As an HR Representative/system administrator working in a chain restaurant, I need to provide the access to specific locations to POS user and specify the details, so that I can enable a POS user to access the same.',
          subtitle: 'Assign Location access to POS User · System Administrator — Mike Rose',
          description: 'Success Metrics:\n• All the important information specified with location access, which is required for a POS user to work in a restaurant.\n\nExample: HR rep of a restaurant need to provide the access to their location with specific configuration for instance Employee class which controls the transaction related behavior of the POS user in that location.',
          tags: ['Location Access', 'HR Representative', 'POS User', 'Chain Restaurant'],
          accentColor: '#22D3EE',
          metrics: [
            { label: 'Persona', value: 'HR Rep' },
            { label: 'Action', value: 'Location' },
            { label: 'Product', value: 'POS' },
          ],
        }
      },

      // USER GOAL 6 — Assign Revenue Center Access to POS User
      {
        id: 'sl-ug6', type: 'section-label', x: 80, y: 3070, width: 620, height: 36,
        data: { title: 'USER GOAL 6 — ASSIGN REVENUE CENTER ACCESS TO POS USER', color: '#EF4444' }
      },
      {
        id: 'cs-ug6', type: 'case-study-card', x: 80, y: 3122, width: 1240, height: 290,
        data: {
          title: 'As an HR Representative/system administrator working in a chain restaurant, I need to provide the access to revenue centers under a location to a POS user and specify the details, so that I can enable a POS user to work in a revenue center.',
          subtitle: 'Assign Revenue center access to POS User · System Administrator — Mike Rose',
          description: 'Success Metrics:\n• All the important information specified with Revenue center access, which is required for a POS user to work in a restaurant.\n\nExample:\n• HR rep need to assign access to specific revenue center in a location and specify attributes for POS user like Cash drawer, Table count, Server efficiency, TMS color.\n• Sometimes HR rep needs to override the employee class options at revenue center level like cash management method, Server bank, Transaction related options.',
          tags: ['Revenue Center', 'HR Representative', 'POS User', 'Location Access'],
          accentColor: '#EF4444',
          metrics: [
            { label: 'Persona', value: 'HR Rep' },
            { label: 'Action', value: 'Rev Center' },
            { label: 'Product', value: 'POS' },
          ],
        }
      },

      // USER GOAL 7 — Add Locations Access via Location Template
      {
        id: 'sl-ug7', type: 'section-label', x: 80, y: 3462, width: 620, height: 36,
        data: { title: 'USER GOAL 7 — ADD LOCATION ACCESS VIA LOCATION TEMPLATE', color: '#10B981' }
      },
      {
        id: 'cs-ug7', type: 'case-study-card', x: 80, y: 3514, width: 1240, height: 270,
        data: {
          title: 'As an HR Representative/store manager, I want to be able to provide other location access to user/employee from a location template, so that I do not need to specify all the attributes again and can provide the access much faster.',
          subtitle: 'Add Locations access through location template (only the location for which employee is having the access) · System Administrator — Mike Rose',
          description: 'Success Metrics:\n• Save time for providing access to other locations based on the template location configuration.\n\nExample: John Doe is working in Joye\'s café Baltimore and need access to Joye\'s café Annapolis with similar configuration as Joye\'s café Baltimore.',
          tags: ['Location Template', 'HR Representative', 'Store Manager', 'Faster Access'],
          accentColor: '#10B981',
          metrics: [
            { label: 'Persona', value: 'HR Rep' },
            { label: 'Method', value: 'Template' },
            { label: 'Goal', value: 'Speed' },
          ],
        }
      },

      // USER GOAL 8 — Add Revenue Center Access via Revenue Center Template
      {
        id: 'sl-ug8', type: 'section-label', x: 80, y: 3834, width: 620, height: 36,
        data: { title: 'USER GOAL 8 — ADD REVENUE CENTER ACCESS VIA RC TEMPLATE', color: '#A855F7' }
      },
      {
        id: 'cs-ug8', type: 'case-study-card', x: 80, y: 3886, width: 1240, height: 270,
        data: {
          title: 'As an HR Representative/store manager, I want to be able to provide other revenue center access to user/employee from a revenue center template, so that I do not need to specify all the attributes again and can provide the access much faster.',
          subtitle: 'Add Revenue center access through Revenue center template (Same location different revenue center) · System Administrator — Mike Rose',
          description: 'Success Metrics:\n• Save time for providing access to other revenue centers under same location based on already added revenue center configuration.\n\nExample: John Doe is working in Joye\'s café Baltimore for Patio Bar (Revenue center) and need access to Nightclub (another revenue center) with similar configuration as he is having in Patio Bar.',
          tags: ['Revenue Center Template', 'HR Representative', 'Store Manager', 'Same Location'],
          accentColor: '#A855F7',
          metrics: [
            { label: 'Persona', value: 'HR Rep' },
            { label: 'Method', value: 'RC Template' },
            { label: 'Scope', value: 'Same Loc' },
          ],
        }
      },

      // USER GOAL 9 — Override Class Settings
      {
        id: 'sl-ug9', type: 'section-label', x: 80, y: 4206, width: 620, height: 36,
        data: { title: 'USER GOAL 9 — OVERRIDE CLASS SETTINGS AT REVENUE CENTER LEVEL', color: '#F59E0B' }
      },
      {
        id: 'cs-ug9', type: 'case-study-card', x: 80, y: 4258, width: 1240, height: 250,
        data: {
          title: 'As an HR Representative/store manager, I need to review and override the employee class options at revenue center level, so that I can control transaction related behavior for POS user at revenue center level.',
          subtitle: 'Override Class Settings · System Administrator — Mike Rose',
          description: 'Success Metrics:\n• Employee class options control at revenue center level.\n\nExample: Override the employee class options at revenue center level like cash management method, Server bank, Transaction related options.',
          tags: ['Override Class Settings', 'HR Representative', 'Revenue Center', 'Transaction Behavior'],
          accentColor: '#F59E0B',
          metrics: [
            { label: 'Persona', value: 'HR Rep' },
            { label: 'Action', value: 'Override' },
            { label: 'Scope', value: 'RC Level' },
          ],
        }
      },

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 4: APPROACH TO PROBLEMS
      // ══════════════════════════════════════════════════════════════════════
      // ug9 bottom = 4258+250 = 4508 → sl y = 4508+80 = 4588
      {
        id: 'sl-approach', type: 'section-label', x: 80, y: 4588, width: 440, height: 40,
        data: { title: 'APPROACH TO PROBLEMS', color: '#F59E0B' }
      },

      // approach sub-section 1: Unified platform
      {
        id: 'ps-app1', type: 'process-step', x: 80, y: 4644, width: 350, height: 200,
        data: { stepNumber: 1, title: 'Unified Platform Architecture', description: 'The entire product of the back office was built on OJET 6, so uplifting the entire product to OJET 12 to build using the new redwood design system would take a lot of time. The team decided to build the user management using the ALTA 5C component library (an intermediate component stack used to upgrade the very old Oracle products before the full all-new redwood design system build).', color: '#EF4444' }
      },
      {
        id: 'ps-app1b', type: 'process-step', x: 460, y: 4644, width: 350, height: 200,
        data: { stepNumber: 2, title: 'Component Framework', description: 'Made a list of all the components that could support the framework and build a low-fidelity workflow to conduct the first-level user interviews.', color: '#F59E0B' }
      },

      // approach sub-section 2: Unifying the data flows
      {
        id: 'ps-app2', type: 'process-step', x: 840, y: 4644, width: 350, height: 200,
        data: { stepNumber: 3, title: 'Unifying Data Flows', description: 'The process of user creation and copying users from the platforms was different for the two respective products so built a UI that supported setting the save triggers and fetching data in the workflow.', color: '#6366F1' }
      },
      {
        id: 'ps-app2b', type: 'process-step', x: 80, y: 4864, width: 350, height: 200,
        data: { stepNumber: 4, title: 'Shape of the Data', description: 'After talking to the stakeholders and understanding the current system built the shape of the data so that I could use that data to build the layout.', color: '#A855F7' }
      },


      // ══════════════════════════════════════════════════════════════════════
      // SECTION 5: SHAPE OF DATA — DATA DIMENSIONS
      // ══════════════════════════════════════════════════════════════════════
      // ps-app2b bottom = 4864+200 = 5064 → sl y = 5064+100 = 5164
      {
        id: 'sl-data', type: 'section-label', x: 80, y: 5144, width: 400, height: 40,
        data: { title: 'SHAPE OF DATA — UI CONSTRAINTS', color: '#A855F7' }
      },
      // dd row 1: y = 5144+40+16 = 5200
      {
        id: 'dd-1', type: 'data-dimension', x: 80, y: 5200, width: 270, height: 190,
        data: { dimension: 'Dimension + Objectives', title: 'Number of users added at a time', highlight: 'users added', min: '1', max: '3-4', typical: '2', accentColor: '#EF4444' }
      },
      {
        id: 'dd-2', type: 'data-dimension', x: 380, y: 5200, width: 270, height: 190,
        data: { dimension: 'Dimension + Objectives', title: 'Number of locations assigned to a user', highlight: 'locations', min: '0', max: '1-3', typical: '1', accentColor: '#F59E0B' }
      },
      {
        id: 'dd-3', type: 'data-dimension', x: 680, y: 5200, width: 270, height: 190,
        data: { dimension: 'Dimension + Objectives', title: 'Number of revenue centers assigned to a user', highlight: 'revenue centers', min: '0', max: '3-3', typical: '1', accentColor: '#10B981' }
      },
      {
        id: 'dd-4', type: 'data-dimension', x: 980, y: 5200, width: 270, height: 190,
        data: { dimension: 'Dimension + Objectives', title: 'Number of job Roles can be assigned to a user', highlight: 'job Roles', min: '0', max: '5', typical: '1', accentColor: '#6366F1' }
      },
      // dd row 2: y = 5200+190+30 = 5420
      {
        id: 'dd-5', type: 'data-dimension', x: 80, y: 5420, width: 270, height: 190,
        data: { dimension: 'Dimension + Objectives', title: 'Number of revenue centers under a location', highlight: 'revenue centers', min: '1', max: '2-3', typical: '1', accentColor: '#EC4899' }
      },
      {
        id: 'dd-6', type: 'data-dimension', x: 380, y: 5420, width: 270, height: 190,
        data: { dimension: 'Dimension + Objectives', title: 'Number of Report Roles can be assigned to a user', highlight: 'Report Roles', min: '0', max: '5+', typical: '1', accentColor: '#A855F7' }
      },
      {
        id: 'dd-7', type: 'data-dimension', x: 680, y: 5420, width: 270, height: 190,
        data: { dimension: 'Dimension + Objectives', title: 'Number of Payment Roles can be assigned to a user', highlight: 'Payment Roles', min: '0', max: '1', typical: '1', accentColor: '#22D3EE' }
      },
      {
        id: 'dd-8', type: 'data-dimension', x: 980, y: 5420, width: 270, height: 190,
        data: { dimension: 'Dimension + Objectives', title: 'Number of Enterprise locations can be assigned to a user', highlight: 'Enterprise locations', min: '0', max: '5+', typical: '1', accentColor: '#F59E0B' }
      },
      // dd row 3: y = 5420+190+30 = 5640
      {
        id: 'dd-9', type: 'data-dimension', x: 80, y: 5640, width: 270, height: 190,
        data: { dimension: 'Dimension + Objectives', title: 'Number of Revenue Center Restrictions can be assigned to a user', highlight: 'Revenue Center Restrictions', min: '0', max: '3-20', typical: '2000', note: 'Some statistics: Typical 200 with', accentColor: '#EF4444' }
      },

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 6: FILTERING OF USERS
      // ══════════════════════════════════════════════════════════════════════
      // dd bottom = 5640+190 = 5830 → sl y = 5830+100 = 5930
      {
        id: 'sl-filter', type: 'section-label', x: 80, y: 5910, width: 500, height: 40,
        data: { title: 'FILTERING OF USERS — ADVANCED SEARCH', color: '#22D3EE' }
      },
      {
        id: 'ps-filt1', type: 'process-step', x: 80, y: 5966, width: 350, height: 180,
        data: { stepNumber: 1, title: 'Admin Table Design', description: 'As the user persona was an administrator based on the persona I designed the table and added an advanced search bar using which the administrator could easily filter out the users.', color: '#22D3EE' }
      },
      {
        id: 'ps-filt2', type: 'process-step', x: 460, y: 5966, width: 350, height: 180,
        data: { stepNumber: 2, title: 'Column Selection', description: 'I talked to the users and understood what columns they would require which they came across on the landing page.', color: '#3B82F6' }
      },

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 7: BUILDING TWO DIFFERENT WORKFLOWS
      // ══════════════════════════════════════════════════════════════════════
      // ps bottom = 5966+180 = 6146 → sl y = 6146+100 = 6246
      {
        id: 'sl-wf', type: 'section-label', x: 80, y: 6226, width: 560, height: 40,
        data: { title: 'BUILDING TWO DIFFERENT WORKFLOWS', color: '#EC4899' }
      },
      {
        id: 'sn-wf1', type: 'sticky-note', x: 80, y: 6282, width: 300, height: 145,
        data: { content: '⚙️ Workflow A: With Labor Management\nFor a user if the labor management is enabled some of the settings were changed for the user in the entire workflow.', color: 'pink', rotation: -0.5 }
      },
      {
        id: 'sn-wf2', type: 'sticky-note', x: 410, y: 6282, width: 300, height: 145,
        data: { content: '🔧 Workflow B: Without Labor Management\nConnected with the stakeholders and understood the behavior of the system.', color: 'cyan', rotation: 0.8 }
      },

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 8: UNKNOWN PROBLEMS — APPROACH
      // ══════════════════════════════════════════════════════════════════════
      // sn bottom = 6282+145 = 6427 → sl y = 6427+100 = 6527
      {
        id: 'sl-unk-app', type: 'section-label', x: 80, y: 6507, width: 500, height: 40,
        data: { title: 'UNKNOWN PROBLEMS — APPROACH', color: '#A855F7' }
      },
      {
        id: 'ps-unk1', type: 'process-step', x: 80, y: 6563, width: 350, height: 200,
        data: { stepNumber: 1, title: 'Information Architecture', description: 'After building the initial low-fidelity workflow and testing with the real users, I got some observations and re-iterated the designs based on the developer\'s feedback and the user\'s feedback.', color: '#A855F7' }
      },
      {
        id: 'ps-unk2', type: 'process-step', x: 460, y: 6563, width: 350, height: 200,
        data: { stepNumber: 2, title: 'Component Mismatch', description: 'Improving the overall product experience by handling the component mismatch and screen responsiveness.', color: '#6366F1' }
      },

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 9: FIGMA EMBEDS — USER FLOW & INFO ARCH
      // ══════════════════════════════════════════════════════════════════════
      // ps bottom = 6563+200 = 6763 → sl y = 6763+100 = 6863
      {
        id: 'sl-figma1', type: 'section-label', x: 80, y: 6843, width: 560, height: 40,
        data: { title: 'LIVE FIGMA FILES — USER FLOW & INFORMATION ARCHITECTURE', color: '#A855F7' }
      },
      {
        id: 'fe-1', type: 'figma-embed', x: 80, y: 6899, width: 720, height: 540,
        data: {
          title: 'User Management · User Flows',
          description: 'User flow and information level — complete user journey mapped out',
          figmaUrl: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2Fo3nHV47UkzxHDz7OMfDrn2%2FKiosk%3Fnode-id%3D2436-101059',
          accentColor: '#6366F1',
        }
      },
      {
        id: 'fe-2', type: 'figma-embed', x: 880, y: 6899, width: 720, height: 540,
        data: {
          title: 'User Management · Information Architecture',
          description: 'Information architecture — structural organization of the platform',
          figmaUrl: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2Fo3nHV47UkzxHDz7OMfDrn2%2FKiosk%3Fnode-id%3D65860-7363',
          accentColor: '#A855F7',
        }
      },

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 10: FIGMA EMBEDS — WIREFRAMES
      // ══════════════════════════════════════════════════════════════════════
      // fe bottom = 6899+540 = 7439 → sl y = 7439+80 = 7519
      {
        id: 'sl-figma2', type: 'section-label', x: 80, y: 7519, width: 560, height: 40,
        data: { title: 'WIREFRAMES — LOW FIDELITY & HIGH FIDELITY', color: '#10B981' }
      },
      {
        id: 'fe-3', type: 'figma-embed', x: 80, y: 7575, width: 720, height: 540,
        data: {
          title: 'User Management · Lo-fi Wireframes',
          description: 'Low-fidelity wireframes — initial explorations and layout decisions',
          figmaUrl: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2Fo3nHV47UkzxHDz7OMfDrn2%2FKiosk%3Fnode-id%3D5470-288291',
          accentColor: '#10B981',
        }
      },
      {
        id: 'fe-4', type: 'figma-embed', x: 880, y: 7575, width: 720, height: 540,
        data: {
          title: 'User Management · Happy Paths',
          description: 'High-fidelity wireframes — happy paths and polished flows',
          figmaUrl: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2Fo3nHV47UkzxHDz7OMfDrn2%2FKiosk%3Fnode-id%3D2436-101059',
          accentColor: '#EC4899',
        }
      },

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 11: BUILDING HI-FI IN OJET 16
      // ══════════════════════════════════════════════════════════════════════
      // fe-4 bottom = 7575+540 = 8115 → sl y = 8115+80 = 8195
      {
        id: 'sl-hifi', type: 'section-label', x: 80, y: 8195, width: 560, height: 40,
        data: { title: 'BUILDING THE HIGH-FIDELITY WIREFRAMES IN OJET 16', color: '#EF4444' }
      },
      {
        id: 'ps-hf1', type: 'process-step', x: 80, y: 8251, width: 260, height: 190,
        data: { stepNumber: 1, title: 'User Interviews & Iteration', description: 'After conducting the user interviews and talking to developers, iterated the workflows and built the high-fidelity wireframes.', color: '#EF4444' }
      },
      {
        id: 'ps-hf2', type: 'process-step', x: 370, y: 8251, width: 260, height: 190,
        data: { stepNumber: 2, title: 'Responsive Screens', description: 'Based on the requirements build responsive screens.', color: '#F59E0B' }
      },
      {
        id: 'ps-hf3', type: 'process-step', x: 660, y: 8251, width: 260, height: 190,
        data: { stepNumber: 3, title: 'Error Cases', description: 'Worked on all the error cases and handled them.', color: '#10B981' }
      },
      {
        id: 'ps-hf4', type: 'process-step', x: 950, y: 8251, width: 260, height: 190,
        data: { stepNumber: 4, title: 'A11Y Specs', description: 'Worked on the A11Y specs.', color: '#6366F1' }
      },

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 12: SKILLS APPLIED
      // ══════════════════════════════════════════════════════════════════════
      // ps-hf bottom = 8251+190 = 8441 → sl y = 8441+100 = 8541
      {
        id: 'sl-skills', type: 'section-label', x: 80, y: 8541, width: 340, height: 40,
        data: { title: 'SKILLS APPLIED', color: '#1E3A8A' }
      },
      {
        id: 'tc-1', type: 'tag-cluster', x: 80, y: 8597, width: 820, height: 110,
        data: {
          title: 'SKILLS APPLIED',
          tags: [
            { label: 'UX Research', color: '#1E3A8A' },
            { label: 'Information Architecture', color: '#6366F1' },
            { label: 'User Flows', color: '#A855F7' },
            { label: 'Enterprise Design', color: '#EF4444' },
            { label: 'OJET Framework', color: '#F59E0B' },
            { label: 'Wireframing', color: '#10B981' },
            { label: 'Accessibility', color: '#22D3EE' },
            { label: 'Data Modeling', color: '#EC4899' },
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 13: THANK YOU / CLOSING
      // ══════════════════════════════════════════════════════════════════════
      // tc bottom = 8597+110 = 8707 → sl y = 8707+100 = 8807
      {
        id: 'sl-thanks', type: 'section-label', x: 80, y: 8807, width: 480, height: 40,
        data: { title: '👋 THAT\'S A WRAP — THANKS FOR READING!', color: '#F59E0B' }
      },
      {
        id: 'cs-thanks', type: 'case-study-card', x: 80, y: 8863, width: 1080, height: 300,
        data: {
          title: 'That\'s how the product workflow was built and handed off to the developers.',
          subtitle: 'I learned a lot from the senior designers and stakeholders during this journey.',
          description: 'Please 👏 if you enjoyed this article. Feel free to get in touch with me at kc60488charan@gmail.com for any recommendations and suggestions. Namaste! 🙏',
          tags: ['Thanks for reading', 'Let\'s connect', 'Namaste 🙏'],
          accentColor: '#F59E0B',
          metrics: [
            { label: 'Problems Solved', value: '9' },
            { label: 'Data Dimensions', value: '9' },
            { label: 'Figma Files', value: '4+' },
          ],
        }
      },
      {
        id: 'sn-thanks-1', type: 'sticky-note', x: 80, y: 9243, width: 280, height: 130,
        data: {
          content: '🧠 You now know as much about this user management system as the team that built it.',
          color: 'cyan',
          rotation: -1,
        }
      },
      {
        id: 'sn-thanks-2', type: 'sticky-note', x: 400, y: 9228, width: 280, height: 130,
        data: {
          content: '🏆 From OJET 6 to OJET 16 — a complete platform evolution.',
          color: 'green',
          rotation: 1.2,
        }
      },
      {
        id: 'sn-thanks-3', type: 'sticky-note', x: 720, y: 9238, width: 280, height: 130,
        data: {
          content: '💌 Liked what you saw? Hit "Message Me" on the right panel — let\'s talk!',
          color: 'purple',
          rotation: -0.8,
        }
      },

      // ── GAME ZONE ─────────────────────────────────────────────────────────
      {
        id: 'sl-game', type: 'section-label', x: 80, y: 9468, width: 480, height: 40,
        data: { title: '🎮 CREWMATE DASH — PLAY & HIRE ME', color: '#1E3A8A' }
      },
      {
        id: 'gz-1', type: 'game-zone', x: 80, y: 9524, width: 1160, height: 680,
        data: {
          title: 'Crewmate Dash',
          accentColor: '#1E3A8A',
          contactEmail: 'kc60488charan@gmail.com',
          contactLinkedIn: 'https://linkedin.com/in/saicharan',
        }
      },
      {
        id: 'sn-game-hint', type: 'sticky-note', x: 80, y: 10264, width: 280, height: 120,
        data: {
          content: '🕹️ Dodge obstacles & get on the leaderboard. Space or tap to jump!',
          color: 'yellow',
          rotation: -1.2,
        }
      },
      {
        id: 'sn-game-hint2', type: 'sticky-note', x: 380, y: 10279, width: 260, height: 110,
        data: {
          content: '⚠️ Only 1 player at a time — queue up if someone is already playing!',
          color: 'pink',
          rotation: 1,
        }
      },
    ]
  },
  {
    id: 'companies-platform',
    title: 'Companies Platform',
    description: 'Creating clear information architecture for easier user navigation in the companies platform.',
    category: 'Design',
    year: '2023',
    tags: ['UX Design', 'Information Architecture', 'Fintech', 'Individual'],
    accentColor: '#1E3A5F',
    gradientFrom: '#1E3A5F',
    gradientTo: '#F59E0B',
    defaultView: { x: 290, y: 42, scale: 0.72 },
    canvasSize: { width: 2700, height: 11000 },
    files: [
      { id: 'f1', label: 'Figma — Design Review', type: 'figma' },
      { id: 'f2', label: 'Figma — Information Architecture', type: 'figma' },
      { id: 'f3', label: 'Navigation Prototype', type: 'figma' },
      { id: 'f4', label: 'User Persona Research', type: 'pdf' },
    ],
    assets: [
      { id: 'a1', label: 'Dashboard UI', thumbnailColor: '#1E3A5F', type: 'image' },
      { id: 'a2', label: 'User Personas', thumbnailColor: '#F59E0B', type: 'illustration' },
      { id: 'a3', label: 'Navigation Flow', thumbnailColor: '#10B981', type: 'image' },
      { id: 'a4', label: 'IA Diagram', thumbnailColor: '#6366F1', type: 'component' },
      { id: 'a5', label: 'Heuristic Review', thumbnailColor: '#A855F7', type: 'image' },
    ],
    canvasElements: [

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 1: PROJECT OVERVIEW
      // ══════════════════════════════════════════════════════════════════════
      {
        id: 'sl-1', type: 'section-label', x: 80, y: 60, width: 340, height: 40,
        data: { title: 'PROJECT OVERVIEW', color: '#1E3A5F' }
      },
      {
        id: 'cs-1', type: 'case-study-card', x: 80, y: 116, width: 560, height: 320,
        data: {
          title: 'Companies Platform',
          subtitle: 'Design · Recur Club · 2023',
          description: "Recur Club is a financial platform that provides hassle-free financing for startups. It offers a variety of benefits including quick and easy access to capital, flexible repayment options tailored to each startup's needs, no collateral required, and expert support throughout the financing process. The Companies platform needed a complete navigation and information architecture overhaul to improve user experience.",
          tags: ['Fintech', 'Information Architecture', 'UX Research', 'Individual'],
          accentColor: '#1E3A5F',
          metrics: [
            { label: 'Category', value: 'Design' },
            { label: 'Contribution', value: 'Individual' },
          ],
        }
      },

      // ── BACK STORY (right of overview) ─────────────────────────────────
      {
        id: 'sl-story', type: 'section-label', x: 720, y: 60, width: 340, height: 40,
        data: { title: 'BACK STORY', color: '#F59E0B' }
      },
      {
        id: 'sn-bg', type: 'sticky-note', x: 720, y: 116, width: 240, height: 160,
        data: { content: '💰 Quick and easy access to capital\nRecur Club can provide startups with the capital they need to grow and succeed, quickly and easily.', color: 'yellow', rotation: -0.5 }
      },
      {
        id: 'sn-bg2', type: 'sticky-note', x: 990, y: 116, width: 240, height: 160,
        data: { content: '🔄 Flexible repayment options\nRecur Club offers flexible repayment options that are tailored to the needs of each startup.', color: 'cyan', rotation: 0.8 }
      },
      {
        id: 'sn-bg3', type: 'sticky-note', x: 720, y: 300, width: 240, height: 160,
        data: { content: '🔓 No collateral required\nRecur Club does not require any collateral, making it a good option for startups with limited assets.', color: 'green', rotation: 1 }
      },
      {
        id: 'sn-bg4', type: 'sticky-note', x: 990, y: 300, width: 240, height: 160,
        data: { content: '🤝 Expert support\nRecur Club provides expert support to startups throughout the financing process.', color: 'purple', rotation: -0.8 }
      },

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 2: PROBLEM IDENTIFICATION
      // ══════════════════════════════════════════════════════════════════════
      // cs bottom = 116+320 = 436, sn bottom = 300+160 = 460 → sl y = 460+80 = 540
      {
        id: 'sl-prob', type: 'section-label', x: 80, y: 540, width: 440, height: 40,
        data: { title: 'PROBLEM IDENTIFICATION', color: '#EF4444' }
      },
      {
        id: 'sn-p1', type: 'sticky-note', x: 80, y: 596, width: 300, height: 145,
        data: { content: '🧭 Navigation Confusion\nUsers struggled to find key features due to unclear information hierarchy and inconsistent navigation patterns across the platform.', color: 'pink', rotation: -1 }
      },
      {
        id: 'sn-p2', type: 'sticky-note', x: 410, y: 596, width: 300, height: 145,
        data: { content: '📊 Data Overload\nDashboard presented too much information at once without proper prioritization, making it hard for users to focus on what matters.', color: 'yellow', rotation: 1.2 }
      },
      {
        id: 'sn-p3', type: 'sticky-note', x: 740, y: 596, width: 300, height: 145,
        data: { content: '🔍 Drop-off Points\nHigh user drop-off at critical points: Invoices (10.5%) and Downloads (2.7%), indicating serious usability issues in those flows.', color: 'cyan', rotation: -0.5 }
      },
      {
        id: 'sn-p4', type: 'sticky-note', x: 80, y: 821, width: 300, height: 145,
        data: { content: '⚡ Onboarding Friction\nNew companies found the signup and onboarding process confusing, leading to delays in accessing financing options.', color: 'green', rotation: 0.8 }
      },
      {
        id: 'sn-p5', type: 'sticky-note', x: 410, y: 821, width: 300, height: 145,
        data: { content: '📱 Repayment Tracking\nUsers had difficulty tracking repayments and understanding their current financial status at a glance.', color: 'purple', rotation: -1.2 }
      },

      // ── PROBLEM STATEMENT ──────────────────────────────────────────────
      {
        id: 'q-prob', type: 'quote-block', x: 740, y: 821, width: 510, height: 140,
        data: {
          quote: 'How might we create a clear information architecture for easier user navigation in the companies platform?',
          author: 'Problem Statement',
          role: '("How might we" statement)',
          accentColor: '#EF4444',
        }
      },

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 3: USER PERSONA
      // ══════════════════════════════════════════════════════════════════════
      // sn bottom = 821+145 = 966 → sl y = 966+100 = 1066
      {
        id: 'sl-persona', type: 'section-label', x: 80, y: 1066, width: 500, height: 40,
        data: { title: 'USER PERSONA — PLATFORM ENGAGEMENT', color: '#6366F1' }
      },
      {
        id: 'q-persona', type: 'quote-block', x: 80, y: 1122, width: 1200, height: 100,
        data: {
          quote: 'User personas visiting the product in different phases of the entire journey of raising debt capital and followed by repayments.',
          author: 'Research Insight',
          role: 'Comparing average sign-in before listing vs after listing',
          accentColor: '#6366F1',
        }
      },
      // Persona engagement data as metric cards — Average sign-in before vs after listing
      // Row 1: CEO
      {
        id: 'mc-ceo-label', type: 'metric-card', x: 80, y: 1252, width: 160, height: 100,
        data: { label: 'CEO', value: 'CEO', accentColor: '#F59E0B' }
      },
      {
        id: 'mc-ceo-before', type: 'metric-card', x: 260, y: 1252, width: 190, height: 100,
        data: { label: 'Before Listing', value: '6.47', change: 'Avg sign-ins', changePositive: true, accentColor: '#F59E0B' }
      },
      {
        id: 'mc-ceo-after', type: 'metric-card', x: 470, y: 1252, width: 190, height: 100,
        data: { label: 'After Listing', value: '3', change: 'Avg sign-ins', changePositive: false, accentColor: '#9CA3AF' }
      },
      // Row 2: CFO & FM
      {
        id: 'mc-cfo-label', type: 'metric-card', x: 80, y: 1372, width: 160, height: 100,
        data: { label: 'CFO', value: 'CFO', accentColor: '#F59E0B' }
      },
      {
        id: 'mc-cfo-before', type: 'metric-card', x: 260, y: 1372, width: 190, height: 100,
        data: { label: 'Before Listing', value: '2.73', change: 'Avg sign-ins', changePositive: true, accentColor: '#F59E0B' }
      },
      {
        id: 'mc-cfo-after', type: 'metric-card', x: 470, y: 1372, width: 190, height: 100,
        data: { label: 'After Listing', value: '1.83', change: 'Avg sign-ins', changePositive: false, accentColor: '#9CA3AF' }
      },
      {
        id: 'mc-fm-label', type: 'metric-card', x: 700, y: 1372, width: 160, height: 100,
        data: { label: 'FM', value: 'FM', accentColor: '#F59E0B' }
      },
      {
        id: 'mc-fm-before', type: 'metric-card', x: 880, y: 1372, width: 190, height: 100,
        data: { label: 'Before Listing', value: '3.63', change: 'Avg sign-ins', changePositive: true, accentColor: '#F59E0B' }
      },
      {
        id: 'mc-fm-after', type: 'metric-card', x: 1090, y: 1372, width: 190, height: 100,
        data: { label: 'After Listing', value: '2.13', change: 'Avg sign-ins', changePositive: false, accentColor: '#9CA3AF' }
      },
      // Row 3: Director & Others
      {
        id: 'mc-dir-label', type: 'metric-card', x: 80, y: 1492, width: 160, height: 100,
        data: { label: 'Director', value: 'DIR', accentColor: '#F59E0B' }
      },
      {
        id: 'mc-dir-before', type: 'metric-card', x: 260, y: 1492, width: 190, height: 100,
        data: { label: 'Before Listing', value: '0.7', change: 'Avg sign-ins', changePositive: true, accentColor: '#F59E0B' }
      },
      {
        id: 'mc-dir-after', type: 'metric-card', x: 470, y: 1492, width: 190, height: 100,
        data: { label: 'After Listing', value: '1.1', change: 'Avg sign-ins', changePositive: true, accentColor: '#F59E0B' }
      },
      {
        id: 'mc-oth-label', type: 'metric-card', x: 700, y: 1492, width: 160, height: 100,
        data: { label: 'Others', value: 'Others', accentColor: '#F59E0B' }
      },
      {
        id: 'mc-oth-before', type: 'metric-card', x: 880, y: 1492, width: 190, height: 100,
        data: { label: 'Before Listing', value: '8.3', change: 'Avg sign-ins', changePositive: true, accentColor: '#F59E0B' }
      },
      {
        id: 'mc-oth-after', type: 'metric-card', x: 1090, y: 1492, width: 190, height: 100,
        data: { label: 'After Listing', value: '5.8', change: 'Avg sign-ins', changePositive: true, accentColor: '#9CA3AF' }
      },

      // ── Task level visits subtitle ─────────────────────────────────────
      {
        id: 'sl-task', type: 'section-label', x: 80, y: 1622, width: 560, height: 40,
        data: { title: 'TASK LEVEL VISITS BY PERSONA PER PHASE', color: '#A855F7' }
      },
      // Task visit data per persona — condensed into metric cards
      // Row: CEO metrics
      {
        id: 'mc-t-ceo', type: 'metric-card', x: 80, y: 1678, width: 190, height: 100,
        data: { label: 'CEO · Signup', value: '0', change: 'Task visits', accentColor: '#F59E0B' }
      },
      {
        id: 'mc-t-cfo', type: 'metric-card', x: 290, y: 1678, width: 190, height: 100,
        data: { label: 'CFO · Signup', value: '0.7', change: 'Task visits', accentColor: '#F59E0B' }
      },
      {
        id: 'mc-t-fm', type: 'metric-card', x: 500, y: 1678, width: 190, height: 100,
        data: { label: 'FM · Signup', value: '2.46', change: 'Task visits', accentColor: '#F59E0B' }
      },
      {
        id: 'mc-t-oth', type: 'metric-card', x: 710, y: 1678, width: 190, height: 100,
        data: { label: 'Others · Signup', value: '3.29', change: 'Task visits', accentColor: '#F59E0B' }
      },
      // Row: Onboarding metrics
      {
        id: 'mc-t-ceo2', type: 'metric-card', x: 80, y: 1798, width: 190, height: 100,
        data: { label: 'CEO · Onboard', value: '0', change: 'Task visits', accentColor: '#6366F1' }
      },
      {
        id: 'mc-t-cfo2', type: 'metric-card', x: 290, y: 1798, width: 190, height: 100,
        data: { label: 'CFO · Onboard', value: '3', change: 'Task visits', accentColor: '#6366F1' }
      },
      {
        id: 'mc-t-fm2', type: 'metric-card', x: 500, y: 1798, width: 190, height: 100,
        data: { label: 'FM · Onboard', value: '6', change: 'Task visits', accentColor: '#6366F1' }
      },
      // Row: Repayment metrics
      {
        id: 'mc-t-ceo3', type: 'metric-card', x: 80, y: 1918, width: 190, height: 100,
        data: { label: 'CEO · Repayment', value: '0', change: 'Task visits', accentColor: '#10B981' }
      },
      {
        id: 'mc-t-cfo3', type: 'metric-card', x: 290, y: 1918, width: 190, height: 100,
        data: { label: 'CFO · Repayment', value: '1', change: 'Task visits', accentColor: '#10B981' }
      },
      {
        id: 'mc-t-fm3', type: 'metric-card', x: 500, y: 1918, width: 190, height: 100,
        data: { label: 'FM · Repayment', value: '1.67', change: 'Task visits', accentColor: '#10B981' }
      },
      {
        id: 'mc-t-oth3', type: 'metric-card', x: 710, y: 1918, width: 190, height: 100,
        data: { label: 'Others · Repay', value: '2.67', change: 'Task visits', accentColor: '#10B981' }
      },

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 4: NAVIGATION FLOW — DROP-OFF ANALYSIS
      // ══════════════════════════════════════════════════════════════════════
      // mc bottom = 1918+100 = 2018 → sl y = 2018+100 = 2118
      {
        id: 'sl-nav', type: 'section-label', x: 80, y: 2118, width: 560, height: 40,
        data: { title: 'NAVIGATION FLOW — DROP-OFF ANALYSIS', color: '#EF4444' }
      },
      {
        id: 'fd-dropoff', type: 'flow-diagram', x: 80, y: 2174, width: 1200, height: 400,
        data: {
          title: 'User Navigation Drop-off Rates',
          subtitle: 'Dashboard 100% → Trade 83% → Tradebook 61% → Finances 42% → Invoices 10.5% → Download 2.7%',
          accentColor: '#EF4444',
          nodes: [
            { id: 'dash', label: 'Dashboard\n100%', color: '#1E3A5F', x: 20, y: 80, width: 130, height: 90 },
            { id: 'trade', label: 'Trade\n83%', color: '#F59E0B', x: 190, y: 80, width: 130, height: 90 },
            { id: 'tradebook', label: 'Tradebook\n61%', color: '#10B981', x: 360, y: 80, width: 130, height: 90 },
            { id: 'finances', label: 'Finances\n42%', color: '#6366F1', x: 530, y: 80, width: 130, height: 90 },
            { id: 'invoices', label: 'Invoices\n10.5%', color: '#EF4444', x: 700, y: 80, width: 130, height: 90 },
            { id: 'download', label: 'Download\n2.7%', color: '#EF4444', x: 870, y: 80, width: 130, height: 90 },
          ],
          connections: [
            { from: 'dash', to: 'trade' },
            { from: 'trade', to: 'tradebook' },
            { from: 'tradebook', to: 'finances' },
            { from: 'finances', to: 'invoices' },
            { from: 'invoices', to: 'download' },
          ],
        }
      },

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 5: USING QUALITATIVE METHODS
      // ══════════════════════════════════════════════════════════════════════
      // fd bottom = 2174+400 = 2574 → sl y = 2574+80 = 2654
      {
        id: 'sl-qual', type: 'section-label', x: 80, y: 2654, width: 500, height: 40,
        data: { title: 'USING QUALITATIVE METHODS', color: '#10B981' }
      },
      {
        id: 'ps-qual1', type: 'process-step', x: 80, y: 2710, width: 350, height: 200,
        data: { stepNumber: 1, title: 'Company Feedback Process', description: 'There was a process set by the organization to talk to companies regularly and take timely feedback on the product\'s journey. After going through the hot jar recording and the mix panel user flow analysis, prepared a list of questions.', color: '#10B981' }
      },
      {
        id: 'ps-qual2', type: 'process-step', x: 460, y: 2710, width: 350, height: 200,
        data: { stepNumber: 2, title: 'User Pain Points', description: 'Made a couple of questions to be asked along with understanding the user pain points. Focused on understanding the signup process, onboarding, file requirements, and repayment tracking behaviors.', color: '#22D3EE' }
      },
      {
        id: 'ps-qual3', type: 'process-step', x: 840, y: 2710, width: 350, height: 200,
        data: { stepNumber: 3, title: 'User Interviews', description: 'Conducted user interviews and found all the pain points and understood user expectations. This helped shape the redesigned information architecture.', color: '#6366F1' }
      },

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 6: EXAMPLE LIST OF QUESTIONS
      // ══════════════════════════════════════════════════════════════════════
      // ps bottom = 2710+200 = 2910 → sl y = 2910+80 = 2990
      {
        id: 'sl-questions', type: 'section-label', x: 80, y: 2990, width: 500, height: 40,
        data: { title: 'EXAMPLE LIST OF QUESTIONS', color: '#F59E0B' }
      },
      {
        id: 'cs-questions', type: 'case-study-card', x: 80, y: 3046, width: 1200, height: 340,
        data: {
          title: 'Research Questions Asked During User Interviews',
          subtitle: 'Understanding the complete user journey — from signup to repayment',
          description: '1. Understanding the signup process.\n2. Where do they get all the required files to complete the onboarding?\n3. How do they add the finance manager to complete the onboarding process?\n4. What time does it take to get all those files?\n5. What are the tasks that people are doing after post-listing?\n6. How they are making Repayments?\n7. Why do they use payments and payouts? and how frequently?\n8. What do people do in the collections module?\n9. How do they make financial reports using our product?\n10. How they are tracking their repayments? etc.',
          tags: ['Signup', 'Onboarding', 'Repayments', 'Collections', 'Reports'],
          accentColor: '#F59E0B',
          metrics: [
            { label: 'Questions', value: '10+' },
            { label: 'Users Interviewed', value: 'Multiple' },
            { label: 'Method', value: 'Qualitative' },
          ],
        }
      },

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 7: CONDUCTED THE UX REVIEW
      // ══════════════════════════════════════════════════════════════════════
      // cs bottom = 3046+340 = 3386 → sl y = 3386+80 = 3466
      {
        id: 'sl-ux', type: 'section-label', x: 80, y: 3466, width: 500, height: 40,
        data: { title: 'CONDUCTED THE UX REVIEW', color: '#A855F7' }
      },
      {
        id: 'ps-ux1', type: 'process-step', x: 80, y: 3522, width: 350, height: 200,
        data: { stepNumber: 1, title: 'Jakob Nielsen\'s Heuristics', description: 'After understanding the current user behavior and all the pain points, did a UX review on all the pages by using Jakob Nielsen\'s heuristics to identify usability issues systematically.', color: '#A855F7' }
      },
      {
        id: 'ps-ux2', type: 'process-step', x: 460, y: 3522, width: 350, height: 200,
        data: { stepNumber: 2, title: 'Heuristic Findings', description: 'Identified visibility of system status issues, match between system and real world gaps, user control and freedom problems, and consistency and standards violations across the platform.', color: '#6366F1' }
      },
      {
        id: 'ps-ux3', type: 'process-step', x: 840, y: 3522, width: 350, height: 200,
        data: { stepNumber: 3, title: 'Restructuring IA', description: 'Based on the UX review findings, restructured the information architecture to provide clearer navigation paths and reduce cognitive load for all user personas.', color: '#EC4899' }
      },

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 8: FIGMA EMBEDS — DESIGN REVIEW
      // ══════════════════════════════════════════════════════════════════════
      // ps bottom = 3522+200 = 3722 → sl y = 3722+80 = 3802
      {
        id: 'sl-figma1', type: 'section-label', x: 80, y: 3802, width: 560, height: 40,
        data: { title: 'LIVE FIGMA — DESIGN REVIEW & INFORMATION ARCHITECTURE', color: '#A855F7' }
      },
      {
        id: 'fe-1', type: 'figma-embed', x: 80, y: 3858, width: 720, height: 540,
        data: {
          title: 'Design Review · Companies',
          description: 'Design review of the companies platform — UX audit and findings',
          figmaUrl: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2Fo3nHV47UkzxHDz7OMfDrn2%2FKiosk%3Fnode-id%3D2436-101059',
          accentColor: '#6366F1',
        }
      },
      {
        id: 'fe-2', type: 'figma-embed', x: 880, y: 3858, width: 720, height: 540,
        data: {
          title: 'Design Review · Information Architecture',
          description: 'Restructured information architecture — navigation redesign',
          figmaUrl: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2Fo3nHV47UkzxHDz7OMfDrn2%2FKiosk%3Fnode-id%3D65860-7363',
          accentColor: '#A855F7',
        }
      },

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 9: AFTER ALL FINDINGS — VISUAL DESIGN
      // ══════════════════════════════════════════════════════════════════════
      // fe bottom = 3858+540 = 4398 → sl y = 4398+80 = 4478
      {
        id: 'sl-visual', type: 'section-label', x: 80, y: 4478, width: 620, height: 40,
        data: { title: 'AFTER ALL FINDINGS — BUILD THE NEW NAVIGATIONAL FLOW', color: '#1E3A5F' }
      },
      {
        id: 'cs-visual', type: 'case-study-card', x: 80, y: 4534, width: 1200, height: 260,
        data: {
          title: 'After restructuring the product, the number of queries was reduced, and we received positive feedback from customers.',
          subtitle: 'Visual Design for the New Navigational Flow',
          description: 'After restructuring the product, the number of queries was reduced, and we received positive feedback from customers. We started working on new feature requests and process standardization. The redesigned navigation included a cleaner Dashboard, reorganized Trade and Tradebook sections, and a streamlined Finances dropdown with Transactions, Reports, Invoices, and Data Vault.',
          tags: ['Navigation Redesign', 'Positive Feedback', 'Reduced Queries', 'Standardization'],
          accentColor: '#1E3A5F',
          metrics: [
            { label: 'Queries', value: '↓ Reduced' },
            { label: 'Feedback', value: 'Positive' },
            { label: 'Result', value: 'New Features' },
          ],
        }
      },

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 10: VIDEO SECTION
      // ══════════════════════════════════════════════════════════════════════
      // cs bottom = 4534+260 = 4794 → sl y = 4794+80 = 4874
      {
        id: 'sl-video', type: 'section-label', x: 80, y: 4874, width: 560, height: 40,
        data: { title: 'VIDEO WALKTHROUGH — RECUR COMPANIES DESIGN', color: '#EC4899' }
      },
      {
        id: 've-1', type: 'video-embed', x: 80, y: 4930, width: 720, height: 540,
        data: {
          title: 'Recur Companies · Design Walkthrough',
          description: 'Signup flow and financing options — complete design team walkthrough (3:14)',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          accentColor: '#1E3A5F',
        }
      },
      {
        id: 've-2', type: 'video-embed', x: 880, y: 4930, width: 720, height: 540,
        data: {
          title: 'Companies Portal · Navigation Flow',
          description: 'Redesigned companies portal navigation — high-fidelity screen walkthrough',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          accentColor: '#F59E0B',
        }
      },

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 11: DASHBOARD COMPONENTS
      // ══════════════════════════════════════════════════════════════════════
      // ve bottom = 4930+540 = 5470 → sl y = 5470+80 = 5550
      {
        id: 'sl-dash', type: 'section-label', x: 80, y: 5550, width: 560, height: 40,
        data: { title: 'DASHBOARD COMPONENTS — REDESIGNED', color: '#F59E0B' }
      },
      {
        id: 'mc-d1', type: 'metric-card', x: 80, y: 5606, width: 190, height: 120,
        data: { label: 'Trade Limit', value: '$48.2Cr', change: 'Available: $962.39', changePositive: true, accentColor: '#1E3A5F' }
      },
      {
        id: 'mc-d2', type: 'metric-card', x: 290, y: 5606, width: 190, height: 120,
        data: { label: 'Trade Price', value: '89.85%', change: 'For 12 months', changePositive: true, accentColor: '#F59E0B' }
      },
      {
        id: 'mc-d3', type: 'metric-card', x: 500, y: 5606, width: 190, height: 120,
        data: { label: 'Total Capital', value: '10,00,000', change: 'Capital raised', changePositive: true, accentColor: '#10B981' }
      },
      {
        id: 'mc-d4', type: 'metric-card', x: 710, y: 5606, width: 190, height: 120,
        data: { label: 'Collections', value: 'NACH', change: 'Applied via Razorpay', changePositive: true, accentColor: '#6366F1' }
      },
      {
        id: 'mc-d5', type: 'metric-card', x: 920, y: 5606, width: 190, height: 120,
        data: { label: 'Payments Due', value: '$70.4L', change: 'NACH Applied', changePositive: false, accentColor: '#EF4444' }
      },

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 12: MY PROCESS
      // ══════════════════════════════════════════════════════════════════════
      // mc bottom = 5606+120 = 5726 → sl y = 5726+80 = 5806
      {
        id: 'sl-process', type: 'section-label', x: 80, y: 5806, width: 340, height: 40,
        data: { title: 'MY PROCESS', color: '#F59E0B' }
      },
      {
        id: 'ps-p1', type: 'process-step', x: 80, y: 5862, width: 210, height: 190,
        data: { stepNumber: 1, title: 'User Research', description: 'Analyzed hot jar recordings and Mixpanel user flows. Identified key drop-off points and pain areas.', color: '#1E3A5F' }
      },
      {
        id: 'ps-p2', type: 'process-step', x: 370, y: 5862, width: 210, height: 190,
        data: { stepNumber: 2, title: 'Qualitative Methods', description: 'Conducted structured interviews with companies to understand their journey and pain points.', color: '#F59E0B' }
      },
      {
        id: 'ps-p3', type: 'process-step', x: 660, y: 5862, width: 210, height: 190,
        data: { stepNumber: 3, title: 'UX Heuristic Review', description: 'Applied Jakob Nielsen\'s 10 heuristics to audit every page of the platform systematically.', color: '#10B981' }
      },
      {
        id: 'ps-p4', type: 'process-step', x: 950, y: 5862, width: 210, height: 190,
        data: { stepNumber: 4, title: 'IA Restructuring', description: 'Rebuilt the information architecture to create clear, intuitive navigation paths for all personas.', color: '#6366F1' }
      },
      {
        id: 'ps-p5', type: 'process-step', x: 1240, y: 5862, width: 210, height: 190,
        data: { stepNumber: 5, title: 'Visual Design', description: 'Created high-fidelity designs for the new navigational flow with the redesigned dashboard and components.', color: '#A855F7' }
      },
      {
        id: 'ps-p6', type: 'process-step', x: 1530, y: 5862, width: 210, height: 190,
        data: { stepNumber: 6, title: 'Validation & Ship', description: 'Validated with users, received positive feedback, reduced queries, and began new feature work.', color: '#EC4899' }
      },

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 13: PLATFORM SIDE NAVIGATION
      // ══════════════════════════════════════════════════════════════════════
      // ps bottom = 5862+190 = 6052 → sl y = 6052+80 = 6132
      {
        id: 'sl-sidenav', type: 'section-label', x: 80, y: 6132, width: 560, height: 40,
        data: { title: 'COMPANIES PORTAL — SIDE NAVIGATION STRUCTURE', color: '#1E3A5F' }
      },
      {
        id: 'sn-nav1', type: 'sticky-note', x: 80, y: 6188, width: 220, height: 120,
        data: { content: '📊 Dashboard\nMain overview with Trade Limit, Collections, and Payments widgets.', color: 'yellow', rotation: -0.5 }
      },
      {
        id: 'sn-nav2', type: 'sticky-note', x: 330, y: 6188, width: 220, height: 120,
        data: { content: '💱 Trade\nTrade management and limit overview with circular progress indicators.', color: 'cyan', rotation: 0.8 }
      },
      {
        id: 'sn-nav3', type: 'sticky-note', x: 580, y: 6188, width: 220, height: 120,
        data: { content: '📋 Tradebook\nSearchable table with filters, status indicators, and "View Trade Book" actions.', color: 'green', rotation: -1 }
      },
      {
        id: 'sn-nav4', type: 'sticky-note', x: 830, y: 6188, width: 220, height: 120,
        data: { content: '💰 Finances\nDropdown: Transactions, Reports, Invoices, Data Vault.', color: 'purple', rotation: 1.2 }
      },
      {
        id: 'sn-nav5', type: 'sticky-note', x: 80, y: 6338, width: 220, height: 120,
        data: { content: '📝 Reports\nFinancial reports generated via the platform for company use.', color: 'pink', rotation: 0.5 }
      },
      {
        id: 'sn-nav6', type: 'sticky-note', x: 330, y: 6338, width: 220, height: 120,
        data: { content: '🧾 Invoices\nInvoice management — a key drop-off area addressed in redesign.', color: 'yellow', rotation: -0.8 }
      },
      {
        id: 'sn-nav7', type: 'sticky-note', x: 580, y: 6338, width: 220, height: 120,
        data: { content: '🔒 Data Vault\nSecure document storage for company files and downloads.', color: 'cyan', rotation: 1 }
      },

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 14: SKILLS APPLIED
      // ══════════════════════════════════════════════════════════════════════
      // sn bottom = 6338+120 = 6458 → sl y = 6458+100 = 6558
      {
        id: 'sl-skills', type: 'section-label', x: 80, y: 6558, width: 340, height: 40,
        data: { title: 'SKILLS APPLIED', color: '#1E3A5F' }
      },
      {
        id: 'tc-1', type: 'tag-cluster', x: 80, y: 6614, width: 820, height: 110,
        data: {
          title: 'SKILLS APPLIED',
          tags: [
            { label: 'UX Research', color: '#1E3A5F' },
            { label: 'Information Architecture', color: '#6366F1' },
            { label: 'Heuristic Evaluation', color: '#A855F7' },
            { label: 'User Interviews', color: '#F59E0B' },
            { label: 'Fintech Design', color: '#10B981' },
            { label: 'Navigation Design', color: '#22D3EE' },
            { label: 'Data Analysis', color: '#EC4899' },
            { label: 'Visual Design', color: '#EF4444' },
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 15: THANK YOU / CLOSING
      // ══════════════════════════════════════════════════════════════════════
      // tc bottom = 6614+110 = 6724 → sl y = 6724+100 = 6824
      {
        id: 'sl-thanks', type: 'section-label', x: 80, y: 6824, width: 480, height: 40,
        data: { title: '👋 THAT\'S A WRAP — THANKS FOR READING!', color: '#F59E0B' }
      },
      {
        id: 'cs-thanks', type: 'case-study-card', x: 80, y: 6880, width: 1080, height: 300,
        data: {
          title: 'From cluttered navigation to clear information architecture — that\'s the Companies Platform redesign.',
          subtitle: 'The entire journey from research to visual design, captured.',
          description: 'You\'ve seen how user research, qualitative methods, heuristic evaluation, and IA restructuring came together to transform the Recur Club companies platform. The result: fewer queries, happier customers, and a foundation for new feature development. If this kind of work excites you, let\'s connect! 🎮 Play Crewmate Dash below and get on the leaderboard.',
          tags: ['Thanks for reading', 'Let\'s connect', 'Now go play 🕹️'],
          accentColor: '#F59E0B',
          metrics: [
            { label: 'Sections Covered', value: '15' },
            { label: 'Research Methods', value: '3+' },
            { label: 'Ready to Chat?', value: 'Yes!' },
          ],
        }
      },
      {
        id: 'sn-thanks-1', type: 'sticky-note', x: 80, y: 7260, width: 280, height: 130,
        data: {
          content: '🧠 You now understand the full journey of restructuring a fintech platform\'s navigation.',
          color: 'cyan',
          rotation: -1,
        }
      },
      {
        id: 'sn-thanks-2', type: 'sticky-note', x: 400, y: 7245, width: 280, height: 130,
        data: {
          content: '🏆 From confused users to clear paths — that\'s the power of good IA.',
          color: 'green',
          rotation: 1.2,
        }
      },
      {
        id: 'sn-thanks-3', type: 'sticky-note', x: 720, y: 7255, width: 280, height: 130,
        data: {
          content: '💌 Liked what you saw? Hit "Message Me" on the right panel — let\'s talk!',
          color: 'purple',
          rotation: -0.8,
        }
      },

      // ── GAME ZONE ─────────────────────────────────────────────────────────
      {
        id: 'sl-game', type: 'section-label', x: 80, y: 7485, width: 480, height: 40,
        data: { title: '🎮 CREWMATE DASH — PLAY & HIRE ME', color: '#1E3A5F' }
      },
      {
        id: 'gz-1', type: 'game-zone', x: 80, y: 7541, width: 1160, height: 680,
        data: {
          title: 'Crewmate Dash',
          accentColor: '#1E3A5F',
          contactEmail: 'kc60488charan@gmail.com',
          contactLinkedIn: 'https://linkedin.com/in/saicharan',
        }
      },
      {
        id: 'sn-game-hint', type: 'sticky-note', x: 80, y: 8281, width: 280, height: 120,
        data: {
          content: '🕹️ Dodge obstacles & get on the leaderboard. Space or tap to jump!',
          color: 'yellow',
          rotation: -1.2,
        }
      },
      {
        id: 'sn-game-hint2', type: 'sticky-note', x: 380, y: 8296, width: 260, height: 110,
        data: {
          content: '⚠️ Only 1 player at a time — queue up if someone is already playing!',
          color: 'pink',
          rotation: 1,
        }
      },
    ]
  },
];
