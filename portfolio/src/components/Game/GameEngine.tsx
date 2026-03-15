import { useEffect, useRef, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// CREWMATE DASH — Super Mario-style Among Us side-scroller
// Hazards: Knife (fast, low) · Thief (tall, medium) · Ghost (floaty, random)
// Features: parallax BG · coin collectibles · double-jump · death animation
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  playerColor: string;
  onGameOver: (score: number) => void;
  isSpectator?: boolean;
  onStateSync?: (state: any) => void;
}

type HazardKind = 'knife' | 'thief' | 'ghost';

interface Hazard {
  id: number;
  kind: HazardKind;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  frame: number;
}

interface Coin {
  id: number;
  x: number;
  y: number;
  collected: boolean;
  frame: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Cloud {
  x: number;
  y: number;
  speed: number;
  width: number;
  opacity: number;
}

// ── Constants ──────────────────────────────────────────────────────────────
const CW = 1100;
const CH = 420;
const GROUND_Y = CH - 70;
const PLAYER_X = 110;
const PW = 36;
const PH = 44;
const GRAVITY = 0.55;
const JUMP_FORCE = -13;
const DOUBLE_JUMP_FORCE = -11;
const INITIAL_SPEED = 3.5;
// Increase difficulty scaling: speed increases faster over time
const SPEED_INC = 0.002;

// Hazard configs
const HAZARD_CONFIGS: Record<HazardKind, { w: number; h: number; label: string; points: number }> = {
  knife: { w: 32, h: 36, label: '🔪 Scope Creep', points: 10 },
  thief: { w: 38, h: 58, label: '🕵️ Stakeholder', points: 15 },
  ghost: { w: 44, h: 44, label: '👻 Bad Brief', points: 20 },
};

// Hazard accent colors (used for particles on hit)
const _HAZARD_COLORS: Record<HazardKind, string> = {
  knife: '#EF4444',
  thief: '#8B5CF6',
  ghost: '#06B6D4',
};
void _HAZARD_COLORS; // suppress unused warning — used for future particle color lookup

// ── Draw the Among Us crewmate — pixel-perfect match to Character.tsx ─────────
// Origin: bottom-center of the character (same as CSS: ml-[-18px] mt-[-44px])
// Character.tsx container: 36w × 44h px
// All coords below are in canvas space with (0,0) = bottom-center anchor.
//
// Mapping from CSS (top-left origin) to canvas (bottom-center origin):
//   canvas_x = css_left - 18
//   canvas_y = css_top  - 44
//
function drawCrewmate(
  ctx: CanvasRenderingContext2D,
  cx: number,   // center-x (bottom-center anchor)
  by: number,   // bottom-y  (bottom-center anchor)
  color: string,
  frame: number,
  isWalking: boolean,
  isDead: boolean,
  deadFrame: number,
) {
  ctx.save();

  if (isDead) {
    // Spin and rise then fall, fade out — same feel as the canvas character dying
    const spin = (deadFrame / 18) * Math.PI * 2;
    const arc = Math.sin((deadFrame / 40) * Math.PI) * -40; // arc up then down
    const fade = Math.max(0, 1 - deadFrame / 38);
    ctx.translate(cx, by + arc);
    ctx.rotate(spin);
    ctx.globalAlpha = fade;
  } else {
    ctx.translate(cx, by);
  }

  // Walking bob — matches animate-amongus-bob (subtle vertical oscillation)
  const bobY = (isWalking && !isDead) ? Math.sin(frame * 0.28) * 2 : 0;

  // ── Ground shadow (bottom-2.5, left-1/2, w-8 h-2, bg-black/15) ───────────
  if (!isDead) {
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    // w-8=32, h-2=8, positioned at bottom -2.5 → y ≈ +10 in canvas coords
    ctx.ellipse(0, 10, 16, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── OUTLINE HELPER ─────────────────────────────────────────────────────────
  // Matches Character.tsx CSS: drop-shadow(2px 0 0 #111) drop-shadow(-2px 0 0 #111)
  // drop-shadow(0 2px 0 #111) drop-shadow(0 -2px 0 #111)
  // We achieve this by drawing the shape's outline stroke FIRST (in dark), then filling on top.
  const strokeShape = (path: () => void) => {
    path();
    ctx.save();
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();
  };

  // ── BACKPACK (top-[10px] left-[-6px] w-[14px] h-[22px] rounded-[6px]) ────
  // canvas: x=-6-18=-24, y=10-44=-34, w=14, h=22, r=6
  ctx.beginPath();
  ctx.roundRect(-24, -34 + bobY, 14, 22, 6);
  ctx.fillStyle = color;
  ctx.fill();
  strokeShape(() => {
    ctx.beginPath();
    ctx.roundRect(-24, -34 + bobY, 14, 22, 6);
  });
  // bottom-half shade (bg-black/20)
  ctx.beginPath();
  ctx.roundRect(-24, -23 + bobY, 14, 11, [0, 0, 6, 6]);
  ctx.fillStyle = 'rgba(0,0,0,0.20)';
  ctx.fill();

  // ── LEFT LEG / BACK LEG (bottom-[2px] left-[6px] w-[12px] h-[14px]) ──────
  // canvas leg pivot: top-center at (-6, -16) in bottom-center space
  // animate-amongus-leg-1
  const legAngle1 = (isWalking && !isDead) ? Math.sin(frame * 0.38) * 0.35 : 0;
  ctx.save();
  ctx.translate(-6, -16);
  ctx.rotate(legAngle1);
  ctx.beginPath();
  ctx.roundRect(-6, 0, 12, 14, [2, 2, 6, 6]);
  ctx.fillStyle = color;
  ctx.fill();
  strokeShape(() => { ctx.beginPath(); ctx.roundRect(-6, 0, 12, 14, [2, 2, 6, 6]); });
  ctx.beginPath();
  ctx.roundRect(-6, 6, 12, 8, [0, 0, 6, 6]);
  ctx.fillStyle = 'rgba(0,0,0,0.20)';
  ctx.fill();
  ctx.restore();

  // ── RIGHT LEG / FRONT LEG (bottom-[2px] right-[4px] w-[12px] h-[14px]) ───
  // canvas: right=4px from right edge → left = 36-4-12-18 = 2 → pivot at (8, -16)
  const legAngle2 = (isWalking && !isDead) ? Math.sin(frame * 0.38 + Math.PI) * 0.35 : 0;
  ctx.save();
  ctx.translate(8, -16);
  ctx.rotate(legAngle2);
  ctx.beginPath();
  ctx.roundRect(-6, 0, 12, 14, [2, 2, 6, 6]);
  ctx.fillStyle = color;
  ctx.fill();
  strokeShape(() => { ctx.beginPath(); ctx.roundRect(-6, 0, 12, 14, [2, 2, 6, 6]); });
  ctx.beginPath();
  ctx.roundRect(-6, 6, 12, 8, [0, 0, 6, 6]);
  ctx.fillStyle = 'rgba(0,0,0,0.20)';
  ctx.fill();
  ctx.restore();

  // ── BODY (top-0 right-0 w-[28px] h-[32px] rounded-t-[14px] rounded-b-[6px]) ──
  // canvas: x = right-0 → left = 36-28-18 = -10, y = top-0 → -44
  ctx.beginPath();
  ctx.roundRect(-10, -44 + bobY, 28, 32, [14, 14, 6, 6]);
  ctx.fillStyle = color;
  ctx.fill();
  strokeShape(() => {
    ctx.beginPath();
    ctx.roundRect(-10, -44 + bobY, 28, 32, [14, 14, 6, 6]);
  });

  // Body dark shading (clip to body, draw offset dark rect)
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(-10, -44 + bobY, 28, 32, [14, 14, 6, 6]);
  ctx.clip();
  // translate-y-3 -translate-x-3 in CSS → shift dark overlay +3y, +3x
  ctx.fillStyle = 'rgba(0,0,0,0.20)';
  ctx.beginPath();
  ctx.roundRect(-10 + 3, -44 + 3 + bobY, 28, 32, [14, 14, 6, 6]);
  ctx.fill();
  // White glow highlight: translate-y-[-4] translate-x-2 blur
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath();
  ctx.ellipse(-10 + 14 + 2, -44 + 16 - 4 + bobY, 14, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── VISOR (top-[6px] right-[-4px] w-[20px] h-[12px] bg-[#92D1DF] rounded-full) ──
  // right-[-4px] → overflows right by 4 → left = 36 - 20 + 4 - 18 = 2, y = 6-44 = -38
  // center of ellipse = (2+10, -38+6) = (12, -32)
  const vx = 12, vy = -32 + bobY;
  ctx.beginPath();
  ctx.ellipse(vx, vy, 10, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#92D1DF';
  ctx.fill();
  strokeShape(() => {
    ctx.beginPath();
    ctx.ellipse(vx, vy, 10, 6, 0, 0, Math.PI * 2);
  });

  // Visor inner shadow (translate-y-1 inside visor → ellipse shifted down by ~4px)
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(vx, vy, 10, 6, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#527F8B';
  ctx.beginPath();
  ctx.ellipse(vx, vy + 4, 9, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Visor shine (top-[2px] right-[4px] w-[10px] h-[3px] bg-white rotate-[-8deg])
  // Visor element top-left is at (2, -38), so shine at (2 + 20-4-10, -38+2) = (8, -36)
  // Center of shine = (8+5, -36+1.5) = (13, -34.5)
  ctx.save();
  ctx.translate(13, -34.5 + bobY);
  ctx.rotate(-8 * Math.PI / 180);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 5, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore(); // end of main translate
}

// ── Draw Knife hazard ──────────────────────────────────────────────────────
function drawKnife(ctx: CanvasRenderingContext2D, h: Hazard) {
  ctx.save();
  ctx.translate(h.x + h.width / 2, h.y + h.height / 2);
  // Wobble
  ctx.rotate(Math.sin(h.frame * 0.18) * 0.12);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(2, h.height / 2 - 2, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Blade
  ctx.fillStyle = '#C0C0C0';
  ctx.beginPath();
  ctx.moveTo(0, -h.height / 2);
  ctx.lineTo(6, h.height / 2 - 8);
  ctx.lineTo(-6, h.height / 2 - 8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Blade shine
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.moveTo(1, -h.height / 2 + 4);
  ctx.lineTo(3, h.height / 2 - 10);
  ctx.lineTo(0, h.height / 2 - 10);
  ctx.closePath();
  ctx.fill();

  // Handle
  ctx.fillStyle = '#8B4513';
  ctx.beginPath();
  ctx.roundRect(-6, h.height / 2 - 10, 12, 10, 3);
  ctx.fill();
  ctx.strokeStyle = '#5D2F0A';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Guard
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(-8, h.height / 2 - 12, 16, 3);

  // Label
  ctx.font = 'bold 9px Inter, sans-serif';
  ctx.fillStyle = '#EF4444';
  ctx.textAlign = 'center';
  ctx.fillText('SCOPE CREEP', 0, h.height / 2 + 12);

  ctx.restore();
}

// ── Draw Thief hazard ──────────────────────────────────────────────────────
function drawThief(ctx: CanvasRenderingContext2D, h: Hazard) {
  ctx.save();
  ctx.translate(h.x + h.width / 2, h.y + h.height);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Walk bob
  const bob = Math.sin(h.frame * 0.35) * 2;

  // Legs
  const legL = Math.sin(h.frame * 0.35) * 0.3;
  const legR = Math.sin(h.frame * 0.35 + Math.PI) * 0.3;
  for (const [lx, rot] of [[-7, legL], [7, legR]] as [number, number][]) {
    ctx.save();
    ctx.translate(lx, -14);
    ctx.rotate(rot);
    ctx.fillStyle = '#1F1F1F';
    ctx.beginPath();
    ctx.roundRect(-4, 0, 8, 14, [2, 2, 4, 4]);
    ctx.fill();
    ctx.restore();
  }

  // Body (trenchcoat)
  ctx.fillStyle = '#2D1B4E';
  ctx.beginPath();
  ctx.roundRect(-12, -44 + bob, 24, 32, [6, 6, 4, 4]);
  ctx.fill();

  // Coat collar
  ctx.fillStyle = '#3D2A62';
  ctx.beginPath();
  ctx.moveTo(-12, -44 + bob);
  ctx.lineTo(0, -36 + bob);
  ctx.lineTo(12, -44 + bob);
  ctx.closePath();
  ctx.fill();

  // Head
  ctx.fillStyle = '#FDBCB4';
  ctx.beginPath();
  ctx.ellipse(0, -52 + bob, 10, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mask (bottom half of face)
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.ellipse(0, -46 + bob, 10, 7, 0, 0, Math.PI);
  ctx.fill();

  // Hat
  ctx.fillStyle = '#111';
  ctx.fillRect(-11, -66 + bob, 22, 4);
  ctx.beginPath();
  ctx.roundRect(-8, -82 + bob, 16, 18, 2);
  ctx.fill();

  // Eyes (shifty)
  const eyeShift = Math.sin(h.frame * 0.1) * 2;
  ctx.fillStyle = '#FF3333';
  ctx.beginPath();
  ctx.ellipse(-3 + eyeShift, -56 + bob, 2.5, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(3 + eyeShift, -56 + bob, 2.5, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Label
  ctx.font = 'bold 9px Inter, sans-serif';
  ctx.fillStyle = '#8B5CF6';
  ctx.textAlign = 'center';
  ctx.fillText('STAKEHOLDER', 0, 14);

  ctx.restore();
}

// ── Draw Ghost hazard ──────────────────────────────────────────────────────
function drawGhost(ctx: CanvasRenderingContext2D, h: Hazard) {
  ctx.save();
  ctx.translate(h.x + h.width / 2, h.y + h.height / 2);

  const fl = Math.sin(h.frame * 0.08) * 6;
  const wobble = Math.sin(h.frame * 0.15) * 0.1;
  ctx.rotate(wobble);
  ctx.translate(0, fl);

  // Glow
  const grd = ctx.createRadialGradient(0, 0, 2, 0, 0, 26);
  grd.addColorStop(0, 'rgba(6,182,212,0.35)');
  grd.addColorStop(1, 'rgba(6,182,212,0)');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 26, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = 'rgba(180,240,255,0.88)';
  ctx.beginPath();
  ctx.arc(0, -4, 18, Math.PI, 0);
  // Wavy bottom
  ctx.lineTo(18, 10);
  ctx.quadraticCurveTo(12, 18, 6, 10);
  ctx.quadraticCurveTo(0, 18, -6, 10);
  ctx.quadraticCurveTo(-12, 18, -18, 10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(6,182,212,0.5)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Eyes
  ctx.fillStyle = '#06B6D4';
  for (const ex of [-6, 6]) {
    ctx.beginPath();
    ctx.ellipse(ex, -6, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#001A20';
  for (const ex of [-6, 6]) {
    ctx.beginPath();
    ctx.ellipse(ex, -5, 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Label
  ctx.rotate(-wobble);
  ctx.translate(0, -fl);
  ctx.font = 'bold 9px Inter, sans-serif';
  ctx.fillStyle = '#06B6D4';
  ctx.textAlign = 'center';
  ctx.fillText('BAD BRIEF', 0, h.height / 2 + 12);

  ctx.restore();
}

// ── Draw a coin ─────────────────────────────────────────────────────────────
function drawCoin(ctx: CanvasRenderingContext2D, coin: Coin) {
  ctx.save();
  const scaleX = Math.cos(coin.frame * 0.08);
  ctx.translate(coin.x + 10, coin.y + 10);
  ctx.scale(scaleX, 1);

  // Coin body
  const grd = ctx.createRadialGradient(-3, -3, 1, 0, 0, 10);
  grd.addColorStop(0, '#FFE566');
  grd.addColorStop(0.6, '#FFD700');
  grd.addColorStop(1, '#B8860B');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();

  // Star inside
  ctx.fillStyle = 'rgba(255,255,200,0.7)';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★', 0, 1);

  ctx.restore();
}

// ── Draw parallax background platforms ─────────────────────────────────────
function drawPlatform(ctx: CanvasRenderingContext2D, x: number, y: number, w: number) {
  ctx.fillStyle = '#1E2340';
  ctx.beginPath();
  ctx.roundRect(x, y, w, 18, 5);
  ctx.fill();
  ctx.fillStyle = '#2A3060';
  ctx.fillRect(x + 4, y + 2, w - 8, 5);
  ctx.strokeStyle = 'rgba(99,102,241,0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

export default function GameEngine({ playerColor, onGameOver, isSpectator, onStateSync }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const onGameOverRef = useRef(onGameOver);
  const spectatorStateRef = useRef<any>(null);
  const spectatorConsumedRef = useRef<boolean>(false);
  const lastTimeRef = useRef<number>(performance.now());
  const accumulatorRef = useRef<number>(0);

  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  useEffect(() => {
    if (!isSpectator) return;
    const onSync = (e: any) => {
      spectatorStateRef.current = e.detail;
      spectatorConsumedRef.current = false; // Mark new packet as ready to consume
    };
    window.addEventListener('spectator-sync', onSync);
    return () => window.removeEventListener('spectator-sync', onSync);
  }, [isSpectator]);

  type GameState = {
    playerY: number;
    playerVY: number;
    jumpsLeft: number;
    score: number;
    coins: number;
    speed: number;
    frame: number;
    hazards: Hazard[];
    coinItems: Coin[];
    particles: Particle[];
    clouds: Cloud[];
    platformX: number;
    gameOver: boolean;
    deadFrame: number;
    idCounter: number;
    bgStars: { x: number; y: number; r: number }[];
    bgPlatforms: { x: number; y: number; w: number; speed: number }[];
  };

  const stateRef = useRef<GameState>({
    playerY: GROUND_Y - PH,
    playerVY: 0,
    jumpsLeft: 2,
    score: 0,
    coins: 0,
    speed: INITIAL_SPEED,
    frame: 0,
    hazards: [],
    coinItems: [],
    particles: [],
    platformX: CW,
    gameOver: false,
    deadFrame: 0,
    idCounter: 0,
    bgStars: Array.from({ length: 50 }, (_, i) => ({
      x: (i * 137.508) % CW,
      y: (i * 83.7) % (GROUND_Y - 60),
      r: 0.8 + (i % 3) * 0.6,
    })),
    bgPlatforms: [
      { x: 200, y: GROUND_Y - 80, w: 100, speed: 1.5 },
      { x: 500, y: GROUND_Y - 130, w: 80, speed: 1.2 },
      { x: 720, y: GROUND_Y - 100, w: 120, speed: 1.8 },
    ],
    clouds: [
      { x: 100, y: 40, speed: 0.4, width: 90, opacity: 0.06 },
      { x: 350, y: 70, speed: 0.25, width: 120, opacity: 0.04 },
      { x: 600, y: 30, speed: 0.5, width: 70, opacity: 0.08 },
    ],
  });

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.gameOver) return;
    if (s.jumpsLeft > 0) {
      s.playerVY = s.jumpsLeft === 2 ? JUMP_FORCE : DOUBLE_JUMP_FORCE;
      s.jumpsLeft--;
    }
  }, []);

  // ── DUMMY to satisfy old references before full removal ──────────────────
  const gameLoop = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const s = stateRef.current;

    let dt = time - lastTimeRef.current;
    lastTimeRef.current = time;
    if (dt > 100) dt = 16.666;
    accumulatorRef.current += dt;
    const TIME_STEP = 1000 / 60;

    let shouldReturn = false;
    while (accumulatorRef.current >= TIME_STEP) {
      accumulatorRef.current -= TIME_STEP;

      if (isSpectator) {
        const sp = spectatorStateRef.current;
        // 1. Consume the sync packet if it's new
        if (sp && !spectatorConsumedRef.current) {
          s.playerY = sp.y;
          s.playerVY = sp.vy;
          s.jumpsLeft = sp.jumpsLeft;
          s.score = sp.score;
          s.coins = sp.coins;
          s.speed = sp.speed;
          s.frame = sp.frame;
          s.hazards = JSON.parse(JSON.stringify(sp.hazards || [])); // Deep copy to prevent mutating React state
          s.coinItems = JSON.parse(JSON.stringify(sp.coinItems || [])); // Deep copy
          s.gameOver = sp.gameOver;
          s.deadFrame = sp.deadFrame;
          spectatorConsumedRef.current = true;
        }

        // 2. Client-side prediction (interpolate physics locally until next packet arrives)
        if (!s.gameOver) {
          s.frame++;
          s.playerVY += GRAVITY;
          s.playerY += s.playerVY;
          if (s.playerY >= GROUND_Y - PH) {
            s.playerY = GROUND_Y - PH;
            s.playerVY = 0;
            s.jumpsLeft = 2;
          }

          s.hazards = s.hazards.map(h => ({ ...h, x: h.x - h.speed, frame: h.frame + 1 }));
          s.coinItems = s.coinItems.map(c => ({ ...c, x: c.x - s.speed * 0.8, frame: c.frame + 1 }));
        } else {
          if (s.deadFrame < 40) s.deadFrame++;
        }

        // Advance platforms and clouds visually even if no update received
        s.bgPlatforms = s.bgPlatforms.map(p => {
          let nx = p.x - p.speed;
          if (nx + p.w < 0) nx = CW + p.w;
          return { ...p, x: nx };
        });
        s.clouds = s.clouds.map(c => {
          let nx = c.x - c.speed;
          if (nx + c.width < 0) nx = CW + c.width;
          return { ...c, x: nx };
        });

        if (s.deadFrame >= 40 && s.gameOver) {
          // end game locally for spectator if needed
          shouldReturn = true;
          break;
        }
      } else {
        s.frame++;
        s.score = Math.floor(s.frame * 0.18) + s.coins * 5;
        s.speed = INITIAL_SPEED + s.frame * SPEED_INC;

        // ── Physics ──────────────────────────────────────────────────────────
        if (!s.gameOver) {
          s.playerVY += GRAVITY;
          s.playerY += s.playerVY;
          if (s.playerY >= GROUND_Y - PH) {
            s.playerY = GROUND_Y - PH;
            s.playerVY = 0;
            s.jumpsLeft = 2;
          }

          // Spawn hazards
          const spawnInterval = Math.max(55, 110 - Math.floor(s.frame / 80));
          if (s.frame % spawnInterval === 0) {
            const kinds: HazardKind[] = ['knife', 'thief', 'ghost'];
            // Ghosts only after frame 300
            const available = s.frame > 300 ? kinds : kinds.slice(0, 2);
            const kind = available[Math.floor(Math.random() * available.length)];
            const cfg = HAZARD_CONFIGS[kind];
            let yPos = GROUND_Y - cfg.h;
            if (kind === 'ghost') {
              yPos = GROUND_Y - cfg.h - 20 - Math.random() * (GROUND_Y * 0.4);
            }
            s.idCounter++;
            s.hazards.push({ id: s.idCounter, kind, x: CW + 20, y: yPos, width: cfg.w, height: cfg.h, speed: s.speed, frame: 0 });
          }

          // Spawn coins every ~140 frames
          if (s.frame % 140 === 70) {
            s.idCounter++;
            const coinY = GROUND_Y - PH - 40 - Math.random() * 80;
            s.coinItems.push({ id: s.idCounter, x: CW + 20, y: coinY, collected: false, frame: 0 });
          }

          // Move hazards
          s.hazards = s.hazards.map(h => ({ ...h, x: h.x - h.speed, frame: h.frame + 1 })).filter(h => h.x + h.width > -20);
          s.coinItems = s.coinItems.map(c => ({ ...c, x: c.x - s.speed * 0.8, frame: c.frame + 1 })).filter(c => c.x + 20 > -20 && !c.collected);

          // Move bg platforms
          s.bgPlatforms = s.bgPlatforms.map(p => {
            let nx = p.x - p.speed;
            if (nx + p.w < 0) nx = CW + p.w;
            return { ...p, x: nx };
          });

          // Move clouds
          s.clouds = s.clouds.map(c => {
            let nx = c.x - c.speed;
            if (nx + c.width < 0) nx = CW + c.width;
            return { ...c, x: nx };
          });

          // Collision with hazards (with generous margin)
          const margin = 10;
          const px = PLAYER_X - PW / 2 + margin;
          const py = s.playerY + margin;
          const pw2 = PW - margin * 2;
          const ph2 = PH - margin * 2;
          for (const h of s.hazards) {
            if (px < h.x + h.width && px + pw2 > h.x && py < h.y + h.height && py + ph2 > h.y) {
              s.gameOver = true;
              // Spawn death particles
              for (let i = 0; i < 16; i++) {
                const angle = (i / 16) * Math.PI * 2;
                s.particles.push({
                  x: PLAYER_X, y: s.playerY + PH / 2,
                  vx: Math.cos(angle) * (2 + Math.random() * 4),
                  vy: Math.sin(angle) * (2 + Math.random() * 4),
                  life: 40, maxLife: 40,
                  color: [playerColor, '#FF4444', '#FFD700'][Math.floor(Math.random() * 3)],
                  size: 3 + Math.random() * 5,
                });
              }
              break;
            }
          }

          // Coin collection
          for (const c of s.coinItems) {
            if (!c.collected && PLAYER_X > c.x && PLAYER_X < c.x + 20 && s.playerY < c.y + 20 && s.playerY + PH > c.y) {
              c.collected = true;
              s.coins++;
              for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                s.particles.push({
                  x: c.x + 10, y: c.y + 10,
                  vx: Math.cos(angle) * (1 + Math.random() * 3),
                  vy: Math.sin(angle) * (1 + Math.random() * 3) - 2,
                  life: 25, maxLife: 25,
                  color: '#FFD700', size: 3 + Math.random() * 3,
                });
              }
            }
          }
        } else {
          // Dead animation
          s.deadFrame++;
          if (s.deadFrame === 40) {
            onGameOverRef.current(s.score);
            shouldReturn = true;
            break;
          }
        }

        if (!isSpectator && onStateSync && s.frame % 4 === 0) {
          onStateSync({
            y: s.playerY,
            vy: s.playerVY,
            jumpsLeft: s.jumpsLeft,
            score: s.score,
            coins: s.coins,
            speed: s.speed,
            frame: s.frame,
            hazards: s.hazards,
            coinItems: s.coinItems,
            gameOver: s.gameOver,
            deadFrame: s.deadFrame,
          });
        }
      } // End of outer else (!isSpectator)

      // Update particles
      s.particles = s.particles.map(p => ({
        ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.2, life: p.life - 1,
      })).filter(p => p.life > 0);
    } // End of while loop

    if (shouldReturn) return;

    // ── Draw ─────────────────────────────────────────────────────────────

    // Sky gradient
    const skyGrd = ctx.createLinearGradient(0, 0, 0, CH);
    skyGrd.addColorStop(0, '#050714');
    skyGrd.addColorStop(0.6, '#0A0B1A');
    skyGrd.addColorStop(1, '#0D0E20');
    ctx.fillStyle = skyGrd;
    ctx.fillRect(0, 0, CW, CH);

    // Stars (parallax layer 1 — slow)
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (const star of s.bgStars) {
      const sx = ((star.x - s.frame * 0.15) % CW + CW) % CW;
      ctx.beginPath();
      ctx.arc(sx, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Clouds (parallax layer 2)
    for (const cloud of s.clouds) {
      ctx.fillStyle = `rgba(255,255,255,${cloud.opacity})`;
      ctx.beginPath();
      ctx.ellipse(cloud.x, cloud.y, cloud.width / 2, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cloud.x - 25, cloud.y + 8, cloud.width / 3, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cloud.x + 28, cloud.y + 6, cloud.width / 3.5, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Background floating platforms
    for (const p of s.bgPlatforms) {
      drawPlatform(ctx, p.x, p.y, p.w);
    }

    // Scrolling ground
    ctx.fillStyle = '#111420';
    ctx.fillRect(0, GROUND_Y, CW, CH - GROUND_Y);
    // Ground tiles
    const tileW = 60;
    const tileOffset = (s.frame * s.speed) % tileW;
    ctx.fillStyle = '#181B2E';
    for (let tx = -tileOffset; tx < CW; tx += tileW) {
      ctx.fillRect(tx, GROUND_Y + 4, tileW - 2, 8);
    }
    // Ground glow line
    ctx.strokeStyle = '#7C5CFC';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#7C5CFC';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CW, GROUND_Y);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw coins
    for (const coin of s.coinItems) {
      if (!coin.collected) drawCoin(ctx, coin);
    }

    // Draw hazards
    for (const h of s.hazards) {
      if (h.kind === 'knife') drawKnife(ctx, h);
      else if (h.kind === 'thief') drawThief(ctx, h);
      else drawGhost(ctx, h);
    }

    // Draw particles
    for (const p of s.particles) {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Draw crewmate
    const isOnGround = s.playerY >= GROUND_Y - PH - 2;
    drawCrewmate(ctx, PLAYER_X, s.playerY + PH, playerColor, s.frame, isOnGround, s.gameOver, s.deadFrame);

    // Double-jump indicator (mid-air second jump available)
    if (!isOnGround && s.jumpsLeft > 0 && !s.gameOver) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('↑ JUMP', PLAYER_X, s.playerY - 8);
    }

    // ── HUD ────────────────────────────────────────────────────────────
    // Score panel
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.roundRect(CW - 110, 10, 100, 52, 8);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 24px Inter, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${s.score}`, CW - 18, 40);
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillText('SCORE', CW - 18, 54);

    // Coin counter
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.roundRect(10, 10, 90, 38, 8);
    ctx.fill();
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`★ ${s.coins}`, 18, 34);

    // Speed level
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`LVL ${Math.min(10, Math.floor((s.speed - INITIAL_SPEED) / 0.3) + 1)}`, 18, 54);

    // Hint (first 4 seconds)
    if (s.frame < 240) {
      const hintAlpha = s.frame < 180 ? 0.85 : 0.85 * (1 - (s.frame - 180) / 60);
      ctx.fillStyle = `rgba(255,255,255,${hintAlpha})`;
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SPACE / TAP to jump  ·  Double-jump allowed!', CW / 2, CH / 2 - 30);
    }

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [playerColor]);

  // Keyboard handler
  useEffect(() => {
    if (isSpectator) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jump, isSpectator]);

  // Start / reset game loop
  useEffect(() => {
    lastTimeRef.current = performance.now();
    accumulatorRef.current = 0;
    stateRef.current = {
      playerY: GROUND_Y - PH,
      playerVY: 0,
      jumpsLeft: 2,
      score: 0,
      coins: 0,
      speed: INITIAL_SPEED,
      frame: 0,
      hazards: [],
      coinItems: [],
      particles: [],
      clouds: [
        { x: 100, y: 40, speed: 0.4, width: 90, opacity: 0.06 },
        { x: 350, y: 70, speed: 0.25, width: 120, opacity: 0.04 },
        { x: 600, y: 30, speed: 0.5, width: 70, opacity: 0.08 },
      ],
      platformX: CW,
      gameOver: false,
      deadFrame: 0,
      idCounter: 0,
      bgStars: Array.from({ length: 50 }, (_, i) => ({
        x: (i * 137.508) % CW,
        y: (i * 83.7) % (GROUND_Y - 60),
        r: 0.8 + (i % 3) * 0.6,
      })),
      bgPlatforms: [
        { x: 200, y: GROUND_Y - 80, w: 100, speed: 1.5 },
        { x: 500, y: GROUND_Y - 130, w: 80, speed: 1.2 },
        { x: 720, y: GROUND_Y - 100, w: 120, speed: 1.8 },
      ],
    };
    rafRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [gameLoop]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <canvas
        ref={canvasRef}
        width={CW}
        height={CH}
        className={isSpectator ? 'cursor-default' : 'cursor-pointer'}
        style={{ display: 'block', maxWidth: '100%', maxHeight: '100%', aspectRatio: `${CW}/${CH}` }}
        onClick={isSpectator ? undefined : jump}
      />
    </div>
  );
}
