import type { FlowDiagramElement } from '../../../types';

interface Props {
  element: FlowDiagramElement;
  isSelected: boolean;
  onClick: () => void;
}

// ─── Journey Map Renderer ────────────────────────────────────────────────────

function JourneyMap({ data, width, height }: { data: NonNullable<FlowDiagramElement['data']['journeyMap']>; width: number; height: number }) {
  const { browsingPath, expressPath, sharedSteps, painPointsInPerson, painPointsKiosk } = data;

  // ── Dynamic layout: spread all nodes to fill full width ─────────────────
  const PAD_LEFT = 30;
  const PAD_RIGHT = 30;
  const PAD_TOP = 55;        // space for phase labels + bracket
  const NODE_R = 36;         // circle radius
  const NODE_D = NODE_R * 2;

  // Total columns: browsingPath.length pre-cols + sharedSteps.length shared-cols
  const browseCount = browsingPath.length;   // 3
  const expressCount = expressPath.length;   // 2
  const sharedCount = sharedSteps.length;    // 5
  const totalCols = browseCount + sharedCount; // 8

  // Compute column centers so they span exactly from PAD_LEFT+NODE_R to width-PAD_RIGHT-NODE_R
  const usableW = width - PAD_LEFT - PAD_RIGHT - NODE_D;
  const colStep = usableW / (totalCols - 1);

  // Column X centers (indices 0..totalCols-1)
  const colX = (col: number) => PAD_LEFT + NODE_R + col * colStep;

  // Browsing top row: cols 0,1,2 → Browse, Locate, Decide
  const browseXs = browsingPath.map((_, i) => colX(i));

  // Shared row (middle): cols 3..7 → Queue, Order, Pay, Collect, Return
  const sharedXs = sharedSteps.map((_, i) => colX(browseCount + i));

  // Express bottom row: Decide at col 1, Locate at col 2 (same X as top Locate/Decide)
  // They live BELOW the shared row, starting at col (browseCount - expressCount)
  const expressStartCol = browseCount - expressCount; // col 1
  const expressXs = expressPath.map((_, i) => colX(expressStartCol + i));

  // Row Y positions
  const BROWSE_Y = PAD_TOP + 20;                      // top row (Browsing)
  const SHARED_Y = BROWSE_Y + NODE_D + 55;            // middle shared row
  const EXPRESS_Y = SHARED_Y + NODE_D + 30;           // bottom row (Express)

  // Node colors
  const NODE_FILL = '#3A3A3A';
  const NODE_TEXT = '#FFFFFF';

  // Path colors
  const GREEN = '#4CAF50';
  const PINK = '#F48FB1';
  const GRAY = '#9E9E9E';

  // Pain point dot
  const DOT_COLOR = '#F5A623';
  const DOT_R = 7;

  // Legend + pain rows below the diagram
  const LEGEND_Y = EXPRESS_Y + NODE_D + 36;
  const PAIN_ROW_1_Y = LEGEND_Y + 52;
  const PAIN_ROW_2_Y = PAIN_ROW_1_Y + 34;

  // Coordinate helpers
  const queueX = sharedXs[0];
  const queueY = SHARED_Y + NODE_R;
  const lastBrowseX = browseXs[browseCount - 1];
  const lastBrowseY = BROWSE_Y + NODE_R;
  const lastExpressX = expressXs[expressCount - 1];
  const lastExpressY = EXPRESS_Y + NODE_R;

  // getCx for pain dot alignment
  const getCx = (id: string): number => {
    const bi = browsingPath.findIndex(n => n.id === id);
    if (bi >= 0) return browseXs[bi];
    const si = sharedSteps.findIndex(n => n.id === id);
    if (si >= 0) return sharedXs[si];
    const ei = expressPath.findIndex(n => n.id === id);
    if (ei >= 0) return expressXs[ei];
    return 0;
  };

  // Phase bracket data — spans column ranges
  const phaseData = [
    {
      label: 'pre-order experience',
      x1: browseXs[0] - NODE_R,
      x2: browseXs[browseCount - 1] + NODE_R,
    },
    {
      label: 'order experience',
      x1: sharedXs[0] - NODE_R,
      x2: sharedXs[2] + NODE_R,   // Queue, Order, Pay
    },
    {
      label: 'post-order experience',
      x1: sharedXs[3] - NODE_R,
      x2: sharedXs[sharedCount - 1] + NODE_R,  // Collect, Return
    },
  ];

  // Dashed bounding box (green) — spans all columns, top browse row to bottom express row
  const BOX_TOP = PAD_TOP + 4;
  const BOX_BOTTOM = EXPRESS_Y + NODE_D + 10;
  const BOX_LEFT = browseXs[0] - NODE_R - 10;
  const BOX_RIGHT = sharedXs[sharedCount - 1] + NODE_R + 10;

  const svgWidth = width;
  const svgHeight = height;

  // Unused but needed to suppress TS
  void lastBrowseY;

  return (
    <svg width={svgWidth} height={svgHeight} style={{ display: 'block' }}>
      <defs>
        <marker id="jm-arrow" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,5 L7,2.5 z" fill={GRAY} />
        </marker>
        <marker id="jm-arrow-green" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,5 L7,2.5 z" fill={GREEN} />
        </marker>
        <marker id="jm-arrow-pink" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,5 L7,2.5 z" fill={PINK} />
        </marker>
        <marker id="jm-arrow-gray" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,5 L7,2.5 z" fill={GRAY} />
        </marker>
      </defs>

      {/* ── Phase labels & bracket lines at top ─────────────────────────── */}
      {phaseData.map((ph, i) => {
        const midX = (ph.x1 + ph.x2) / 2;
        const bracketY = PAD_TOP - 8;
        return (
          <g key={i}>
            <line x1={ph.x1} y1={bracketY} x2={ph.x2} y2={bracketY} stroke="#BBBBBB" strokeWidth="1.5" />
            {/* end ticks */}
            <line x1={ph.x1} y1={bracketY - 4} x2={ph.x1} y2={bracketY + 4} stroke="#BBBBBB" strokeWidth="1.5" />
            <line x1={ph.x2} y1={bracketY - 4} x2={ph.x2} y2={bracketY + 4} stroke="#BBBBBB" strokeWidth="1.5" />
            <text x={midX} y={bracketY - 12} textAnchor="middle" fontSize="10" fill="#999999" fontFamily="sans-serif">
              {ph.label}
            </text>
          </g>
        );
      })}

      {/* ── Dashed bounding box ──────────────────────────────────────────── */}
      <rect
        x={BOX_LEFT} y={BOX_TOP}
        width={BOX_RIGHT - BOX_LEFT} height={BOX_BOTTOM - BOX_TOP}
        fill="none" stroke="#C8E6C9" strokeWidth="1.5" strokeDasharray="6,4" rx="6"
      />

      {/* ── Express mode dashed inner box (bottom section) ──────────────── */}
      <rect
        x={expressXs[0] - NODE_R - 6} y={EXPRESS_Y - 10}
        width={(lastExpressX + NODE_R + 6) - (expressXs[0] - NODE_R - 6)} height={NODE_D + 20}
        fill="none" stroke="#FFCDD2" strokeWidth="1.2" strokeDasharray="5,3" rx="6"
      />

      {/* ── Browsing path line (green) ───────────────────────────────────── */}
      {/* Segments between browse nodes */}
      {browsingPath.map((_, i) => {
        if (i === browsingPath.length - 1) return null;
        return (
          <line key={`b-seg-${i}`}
            x1={browseXs[i] + NODE_R} y1={BROWSE_Y + NODE_R}
            x2={browseXs[i + 1] - NODE_R} y2={BROWSE_Y + NODE_R}
            stroke={GREEN} strokeWidth="2.5"
            markerEnd="url(#jm-arrow-green)"
          />
        );
      })}
      {/* Browsing diagonal: last browse node → Queue */}
      <line
        x1={lastBrowseX + NODE_R * 0.7} y1={lastBrowseY + NODE_R * 0.7}
        x2={queueX - NODE_R * 0.7} y2={queueY - NODE_R * 0.7}
        stroke={GREEN} strokeWidth="2.5"
        markerEnd="url(#jm-arrow-green)"
      />

      {/* ── Express path line (pink) ─────────────────────────────────────── */}
      {expressPath.map((_, i) => {
        if (i === expressPath.length - 1) return null;
        return (
          <line key={`e-seg-${i}`}
            x1={expressXs[i] + NODE_R} y1={EXPRESS_Y + NODE_R}
            x2={expressXs[i + 1] - NODE_R} y2={EXPRESS_Y + NODE_R}
            stroke={PINK} strokeWidth="2.5"
            markerEnd="url(#jm-arrow-pink)"
          />
        );
      })}
      {/* Express diagonal: last express node → Queue */}
      <line
        x1={lastExpressX + NODE_R * 0.7} y1={lastExpressY - NODE_R * 0.7}
        x2={queueX - NODE_R * 0.7} y2={queueY + NODE_R * 0.7}
        stroke={PINK} strokeWidth="2.5"
        markerEnd="url(#jm-arrow-pink)"
      />

      {/* ── Shared path line (gray) ──────────────────────────────────────── */}
      {sharedSteps.map((_, i) => {
        if (i === sharedSteps.length - 1) return null;
        return (
          <line key={`s-seg-${i}`}
            x1={sharedXs[i] + NODE_R} y1={SHARED_Y + NODE_R}
            x2={sharedXs[i + 1] - NODE_R} y2={SHARED_Y + NODE_R}
            stroke={GRAY} strokeWidth="2.5"
            markerEnd="url(#jm-arrow-gray)"
          />
        );
      })}

      {/* ── Browsing path nodes (top row) ───────────────────────────────── */}
      {browsingPath.map((node, i) => (
        <g key={node.id}>
          <circle cx={browseXs[i]} cy={BROWSE_Y + NODE_R} r={NODE_R} fill={NODE_FILL} />
          <text x={browseXs[i]} y={BROWSE_Y + NODE_R + 5} textAnchor="middle" fontSize="13" fontWeight="600" fill={NODE_TEXT} fontFamily="sans-serif">
            {node.label}
          </text>
        </g>
      ))}

      {/* ── Express path nodes (bottom row) ─────────────────────────────── */}
      {expressPath.map((node, i) => (
        <g key={node.id}>
          <circle cx={expressXs[i]} cy={EXPRESS_Y + NODE_R} r={NODE_R} fill={NODE_FILL} />
          <text x={expressXs[i]} y={EXPRESS_Y + NODE_R + 5} textAnchor="middle" fontSize="13" fontWeight="600" fill={NODE_TEXT} fontFamily="sans-serif">
            {node.label}
          </text>
        </g>
      ))}

      {/* ── Shared step nodes (middle row) ───────────────────────────────── */}
      {sharedSteps.map((node, i) => (
        <g key={node.id}>
          <circle cx={sharedXs[i]} cy={SHARED_Y + NODE_R} r={NODE_R} fill={NODE_FILL} />
          <text x={sharedXs[i]} y={SHARED_Y + NODE_R + 5} textAnchor="middle" fontSize="13" fontWeight="600" fill={NODE_TEXT} fontFamily="sans-serif">
            {node.label}
          </text>
        </g>
      ))}

      {/* ── Legend ───────────────────────────────────────────────────────── */}
      <g>
        <line x1={PAD_LEFT} y1={LEGEND_Y} x2={PAD_LEFT + 28} y2={LEGEND_Y} stroke={GREEN} strokeWidth="2.5" />
        <text x={PAD_LEFT + 34} y={LEGEND_Y + 4} fontSize="11" fill="#444" fontFamily="sans-serif" fontWeight="600">Browsing mode journey</text>
        <line x1={PAD_LEFT} y1={LEGEND_Y + 20} x2={PAD_LEFT + 28} y2={LEGEND_Y + 20} stroke={PINK} strokeWidth="2.5" />
        <text x={PAD_LEFT + 34} y={LEGEND_Y + 24} fontSize="11" fill="#444" fontFamily="sans-serif" fontWeight="600">Express mode journey</text>
      </g>

      {/* ── Pain points section ───────────────────────────────────────────── */}
      {/* Row labels — left-aligned */}
      <text x={PAD_LEFT} y={PAIN_ROW_1_Y + 5} fontSize="11" fill="#444" fontFamily="sans-serif" fontWeight="600">Pain points (In-person)</text>
      <text x={PAD_LEFT} y={PAIN_ROW_2_Y + 5} fontSize="11" fill="#444" fontFamily="sans-serif" fontWeight="600">Pain points (Kiosk/Self-ordering)</text>

      {/* Pain point dots — aligned to step column centers */}
      {(() => {
        // Use browsingPath + sharedSteps as the canonical column list (no express duplication)
        const allSteps = [
          ...browsingPath.map(n => ({ id: n.id, cx: getCx(n.id) })),
          ...sharedSteps.map(n => ({ id: n.id, cx: getCx(n.id) })),
        ];
        return allSteps.map(s => (
          <g key={`dot-${s.id}`}>
            {painPointsInPerson.includes(s.id) && (
              <circle cx={s.cx} cy={PAIN_ROW_1_Y} r={DOT_R} fill={DOT_COLOR} />
            )}
            {painPointsKiosk.includes(s.id) && (
              <circle cx={s.cx} cy={PAIN_ROW_2_Y} r={DOT_R} fill={DOT_COLOR} />
            )}
          </g>
        ));
      })()}
    </svg>
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '124, 92, 252';
}

/** Get the nearest edge point from a node rectangle toward a target point */
function getEdgePoint(
  node: { x: number; y: number; width?: number; height?: number },
  targetX: number,
  targetY: number,
  nodeW: number,
  nodeH: number
): { x: number; y: number; side: 'top' | 'bottom' | 'left' | 'right' } {
  const nW = node.width ?? nodeW;
  const nH = node.height ?? nodeH;
  const cx = node.x + nW / 2;
  const cy = node.y + nH / 2;
  const dx = targetX - cx;
  const dy = targetY - cy;

  // Determine which side the connection exits from
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const ratio = nW / nH;

  if (absDx / absDy > ratio) {
    // left or right
    if (dx > 0) return { x: node.x + nW, y: cy, side: 'right' };
    else return { x: node.x, y: cy, side: 'left' };
  } else {
    // top or bottom
    if (dy > 0) return { x: cx, y: node.y + nH, side: 'bottom' };
    else return { x: cx, y: node.y, side: 'top' };
  }
}

/** Build a smart SVG path between two edge points — straight when aligned, single-bend otherwise */
function buildOrthogonalPath(
  from: { x: number; y: number; side: string },
  to: { x: number; y: number; side: string }
): string {
  const fx = from.x, fy = from.y;
  const tx = to.x, ty = to.y;
  const THRESHOLD = 6; // px — treat as aligned if within this distance

  const horizToHoriz =
    (from.side === 'right' || from.side === 'left') &&
    (to.side === 'right' || to.side === 'left');
  const vertToVert =
    (from.side === 'top' || from.side === 'bottom') &&
    (to.side === 'top' || to.side === 'bottom');
  const horizToVert =
    (from.side === 'right' || from.side === 'left') &&
    (to.side === 'top' || to.side === 'bottom');
  const vertToHoriz =
    (from.side === 'top' || from.side === 'bottom') &&
    (to.side === 'right' || to.side === 'left');

  // Straight line — exits right/left and target is on the same horizontal axis
  if (horizToHoriz && Math.abs(fy - ty) <= THRESHOLD) {
    return `M ${fx} ${fy} L ${tx} ${ty}`;
  }
  // Straight line — exits top/bottom and target is on the same vertical axis
  if (vertToVert && Math.abs(fx - tx) <= THRESHOLD) {
    return `M ${fx} ${fy} L ${tx} ${ty}`;
  }

  // Single right-angle bend: horizontal exit → vertical arrival
  if (horizToHoriz) {
    const midX = (fx + tx) / 2;
    return `M ${fx} ${fy} L ${midX} ${fy} L ${midX} ${ty} L ${tx} ${ty}`;
  }

  // Single right-angle bend: vertical exit → horizontal arrival
  if (vertToVert) {
    const midY = (fy + ty) / 2;
    return `M ${fx} ${fy} L ${fx} ${midY} L ${tx} ${midY} L ${tx} ${ty}`;
  }

  // L-shaped: horizontal exit then vertical to target
  if (horizToVert) {
    return `M ${fx} ${fy} L ${tx} ${fy} L ${tx} ${ty}`;
  }

  // L-shaped: vertical exit then horizontal to target
  if (vertToHoriz) {
    return `M ${fx} ${fy} L ${fx} ${ty} L ${tx} ${ty}`;
  }

  // Fallback straight line
  return `M ${fx} ${fy} L ${tx} ${ty}`;
}

interface AnimatedParticleProps {
  pathId: string;
  color: string;
  duration: number;
  delay: number;
  size?: number;
}

function AnimatedParticle({ pathId, color, duration, delay, size = 5 }: AnimatedParticleProps) {
  return (
    <circle r={size / 2} fill={color} opacity={0.85}>
      <animateMotion
        dur={`${duration}s`}
        begin={`${delay}s`}
        repeatCount="indefinite"
        rotate="auto"
      >
        <mpath href={`#${pathId}`} />
      </animateMotion>
      <animate
        attributeName="opacity"
        values="0;1;1;0"
        keyTimes="0;0.1;0.9;1"
        dur={`${duration}s`}
        begin={`${delay}s`}
        repeatCount="indefinite"
      />
    </circle>
  );
}

export default function FlowDiagram({ element, isSelected, onClick }: Props) {
  const { data, width, height } = element;
  const nodeW = 130;
  const nodeH = 80;
  const headerH = 64;
  const svgH = height - headerH;

  // ── Journey map mode ──────────────────────────────────────────────────────
  if (data.journeyMap) {
    return (
      <div
        onClick={onClick}
        className={`canvas-element-base rounded-2xl overflow-hidden bg-white border border-panel-border shadow-sm ${isSelected ? 'selected' : ''}`}
        style={{ width, height }}
      >
        {/* Accent bar */}
        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${data.accentColor}, ${data.accentColor}88)` }} />
        {/* Header */}
        <div className="px-5 py-3 border-b border-panel-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{data.title}</h3>
            {data.subtitle && <p className="text-xs text-text-secondary mt-0.5">{data.subtitle}</p>}
          </div>
        </div>
        {/* Journey map SVG */}
        <div style={{ width, height: height - headerH, overflow: 'hidden' }}>
          <JourneyMap data={data.journeyMap} width={width} height={height - headerH} />
        </div>
      </div>
    );
  }

  const getNodeCenter = (node: typeof data.nodes[0]) => ({
    x: node.x + (node.width ?? nodeW) / 2,
    y: node.y + (node.height ?? nodeH) / 2,
  });

  return (
    <div
      onClick={onClick}
      className={`canvas-element-base rounded-2xl overflow-hidden bg-white border border-panel-border shadow-sm ${isSelected ? 'selected' : ''}`}
      style={{ width, height }}
    >
      {/* Accent bar */}
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${data.accentColor}, ${data.accentColor}88)` }} />

      {/* Header */}
      <div className="px-5 py-3 border-b border-panel-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">{data.title}</h3>
          {data.subtitle && <p className="text-xs text-text-secondary mt-0.5">{data.subtitle}</p>}
        </div>
      </div>

      {/* Diagram */}
      <div style={{ position: 'relative', width, height: svgH }}>
        <svg width={width} height={svgH} style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            {/* Single arrow marker for all connections — end */}
            <marker
              id={`arrow-${element.id}`}
              markerWidth="8" markerHeight="6"
              refX="8" refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L8,3 z" fill="#94A3B8" />
            </marker>
            {/* Reversed marker for bidirectional start */}
            <marker
              id={`arrow-start-${element.id}`}
              markerWidth="8" markerHeight="6"
              refX="0" refY="3"
              orient="auto-start-reverse"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L8,3 z" fill="#94A3B8" />
            </marker>
          </defs>

          {/* Draw connections — one arrowhead per unique endpoint */}
          {(() => {
            // Pre-compute all edges so we can detect shared endpoints
            const edgeData = data.connections.map((conn) => {
              const fromNode = data.nodes.find(n => n.id === conn.from);
              const toNode = data.nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;
              const tCenter = getNodeCenter(toNode);
              const fCenter = getNodeCenter(fromNode);
              const fromEdge = getEdgePoint(fromNode, tCenter.x, tCenter.y, nodeW, nodeH);
              const toEdge = getEdgePoint(toNode, fCenter.x, fCenter.y, nodeW, nodeH);
              return { conn, fromEdge, toEdge };
            });

            // Track which endpoint coords already have an arrowhead
            const usedEndPoints = new Set<string>();
            const usedStartPoints = new Set<string>();
            const ptKey = (x: number, y: number) => `${Math.round(x)},${Math.round(y)}`;

            return edgeData.map((ed, i) => {
              if (!ed) return null;
              const { conn, fromEdge, toEdge } = ed;

              const pathD = buildOrthogonalPath(fromEdge, toEdge);
              const pathId = `path-${element.id}-${i}`;
              const isBidi = conn.bidirectional !== false;
              const connColor = conn.color ?? '#94A3B8';
              const particleColor = conn.color ?? data.accentColor;
              const dur = 2.2 + (i * 0.4);

              // End arrowhead — only if this toEdge point hasn't been claimed yet
              const endKey = ptKey(toEdge.x, toEdge.y);
              const showEnd = !usedEndPoints.has(endKey);
              if (showEnd) usedEndPoints.add(endKey);

              // Start arrowhead (bidirectional) — only if this fromEdge point hasn't been claimed yet
              const startKey = ptKey(fromEdge.x, fromEdge.y);
              const showStart = isBidi && !usedStartPoints.has(startKey);
              if (showStart) usedStartPoints.add(startKey);

              return (
                <g key={i}>
                  <path
                    id={pathId}
                    d={pathD}
                    fill="none"
                    stroke={connColor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    markerEnd={showEnd ? `url(#arrow-${element.id})` : undefined}
                    markerStart={showStart ? `url(#arrow-start-${element.id})` : undefined}
                  />
                  {/* Animated flowing particle */}
                  <AnimatedParticle
                    pathId={pathId}
                    color={particleColor}
                    duration={dur}
                    delay={i * 0.6}
                    size={6}
                  />
                  {/* Second particle offset for density */}
                  <AnimatedParticle
                    pathId={pathId}
                    color={particleColor}
                    duration={dur}
                    delay={i * 0.6 + dur / 2}
                    size={4}
                  />
                </g>
              );
            });
          })()}
        </svg>

        {/* Nodes rendered on top */}
        {data.nodes.map(node => {
          const nW = node.width ?? nodeW;
          const nH = node.height ?? nodeH;
          const isNew = node.id === data.highlightNodeId;
          const rgb = hexToRgb(node.color);
          return (
            <div
              key={node.id}
              style={{
                position: 'absolute',
                left: node.x,
                top: node.y,
                width: nW,
                height: nH,
                background: isNew ? `rgba(${rgb}, 0.18)` : `rgba(${rgb}, 0.1)`,
                border: `2px solid rgba(${rgb}, ${isNew ? 0.9 : 0.35})`,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                boxShadow: isNew
                  ? `0 0 16px rgba(${rgb}, 0.35), 0 2px 8px rgba(0,0,0,0.06)`
                  : '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <span
                className="text-xs font-semibold text-center px-3 leading-snug"
                style={{ color: node.color }}
              >
                {node.label}
              </span>
              {isNew && (
                <span
                  className="text-[9px] font-bold mt-1 px-1.5 py-0.5 rounded-full"
                  style={{ color: '#fff', background: node.color }}
                >
                  ✦ NEW
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
