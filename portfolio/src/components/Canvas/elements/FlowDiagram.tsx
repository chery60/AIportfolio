import type { FlowDiagramElement } from '../../../types';

interface Props {
  element: FlowDiagramElement;
  isSelected: boolean;
  onClick: () => void;
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
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
          style={{ background: `rgba(${hexToRgb(data.accentColor)}, 0.12)`, color: data.accentColor }}
        >⬡</div>
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
              const toNode   = data.nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;
              const tCenter  = getNodeCenter(toNode);
              const fCenter  = getNodeCenter(fromNode);
              const fromEdge = getEdgePoint(fromNode, tCenter.x, tCenter.y, nodeW, nodeH);
              const toEdge   = getEdgePoint(toNode,   fCenter.x, fCenter.y, nodeW, nodeH);
              return { conn, fromEdge, toEdge };
            });

            // Track which endpoint coords already have an arrowhead
            const usedEndPoints   = new Set<string>();
            const usedStartPoints = new Set<string>();
            const ptKey = (x: number, y: number) => `${Math.round(x)},${Math.round(y)}`;

            return edgeData.map((ed, i) => {
              if (!ed) return null;
              const { conn, fromEdge, toEdge } = ed;

              const pathD = buildOrthogonalPath(fromEdge, toEdge);
              const pathId = `path-${element.id}-${i}`;
              const isBidi = conn.bidirectional !== false;
              const connColor   = conn.color ?? '#94A3B8';
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
