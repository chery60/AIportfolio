import { useEffect, useRef, useCallback } from 'react';

interface Props {
  playerColor: string;
  onGameOver: (score: number) => void;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color: string;
  speed: number;
}

const OBSTACLE_LABELS = [
  'Scope Creep',
  'Dev Says No',
  'Missing Brief',
  'Last Minute Change',
  'Stakeholder Opinion',
  'Unclear Requirements',
  'No Design System',
  'Pixel Perfect Request',
  'Infinite Revisions',
  'No User Research',
];

const OBSTACLE_COLORS = ['#C74B18', '#F59E0B', '#6366F1', '#EC4899', '#10B981', '#7C5CFC'];

const CANVAS_WIDTH = 860;
const CANVAS_HEIGHT = 360;
const GROUND_Y = CANVAS_HEIGHT - 60;
const PLAYER_X = 100;
const PLAYER_W = 36;
const PLAYER_H = 44;
const GRAVITY = 0.6;
const JUMP_FORCE = -13;
const INITIAL_SPEED = 4;
const SPEED_INCREMENT = 0.0008;

export default function GameEngine({ playerColor, onGameOver }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const onGameOverRef = useRef(onGameOver);

  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  // Game state refs (no re-renders during game loop)
  const stateRef = useRef({
    playerY: GROUND_Y - PLAYER_H,
    playerVY: 0,
    isOnGround: true,
    score: 0,
    speed: INITIAL_SPEED,
    frame: 0,
    obstacles: [] as Obstacle[],
    gameOver: false,
    walkFrame: 0,
  });

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.isOnGround && !s.gameOver) {
      s.playerVY = JUMP_FORCE;
      s.isOnGround = false;
    }
  }, []);

  // Draw Among Us crewmate on canvas
  const drawCrewmate = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    isWalking: boolean,
    frame: number
  ) => {
    ctx.save();
    ctx.translate(x + PLAYER_W / 2, y + PLAYER_H);

    const bobY = isWalking ? Math.sin(frame * 0.3) * 2 : 0;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Backpack
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-22, -38 + bobY, 12, 20, 5);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.roundRect(-22, -28 + bobY, 12, 10, [0, 0, 5, 5]);
    ctx.fill();

    // Legs with walking animation
    const leg1Rot = isWalking ? Math.sin(frame * 0.4) * 0.4 : 0;
    const leg2Rot = isWalking ? Math.sin(frame * 0.4 + Math.PI) * 0.4 : 0;

    // Back leg
    ctx.save();
    ctx.translate(-6, -10);
    ctx.rotate(leg1Rot);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-5, 0, 10, 14, [2, 2, 5, 5]);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(-5, 6, 10, 8);
    ctx.restore();

    // Front leg
    ctx.save();
    ctx.translate(4, -10);
    ctx.rotate(leg2Rot);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-5, 0, 10, 14, [2, 2, 5, 5]);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(-5, 6, 10, 8);
    ctx.restore();

    // Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-10, -44 + bobY, 26, 34, [12, 12, 5, 5]);
    ctx.fill();

    // Body shading
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.roundRect(2, -38 + bobY, 12, 28, [0, 12, 5, 0]);
    ctx.fill();

    // Visor
    ctx.fillStyle = '#92D1DF';
    ctx.beginPath();
    ctx.ellipse(8, -36 + bobY, 10, 6, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Visor reflection
    ctx.fillStyle = 'white';
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.ellipse(11, -39 + bobY, 4, 2, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Visor shadow
    ctx.fillStyle = '#527F8B';
    ctx.beginPath();
    ctx.ellipse(8, -33 + bobY, 8, 4, -0.2, 0, Math.PI);
    ctx.fill();

    // Outline using stroke
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-10, -44 + bobY, 26, 34, [12, 12, 5, 5]);
    ctx.stroke();

    ctx.restore();
  }, []);

  // Draw obstacle
  const drawObstacle = useCallback((ctx: CanvasRenderingContext2D, obs: Obstacle) => {
    const radius = 8;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.roundRect(obs.x + 4, obs.y + 4, obs.width, obs.height, radius);
    ctx.fill();

    // Main body
    ctx.fillStyle = obs.color;
    ctx.beginPath();
    ctx.roundRect(obs.x, obs.y, obs.width, obs.height, radius);
    ctx.fill();

    // Lighter top stripe
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.roundRect(obs.x, obs.y, obs.width, obs.height / 2, [radius, radius, 0, 0]);
    ctx.fill();

    // Border
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(obs.x, obs.y, obs.width, obs.height, radius);
    ctx.stroke();

    // ⚠️ icon
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText('⚠️', obs.x + obs.width / 2, obs.y + 22);

    // Label text
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    const words = obs.label.split(' ');
    if (words.length <= 2) {
      ctx.fillText(obs.label, obs.x + obs.width / 2, obs.y + obs.height - 12);
    } else {
      ctx.fillText(words.slice(0, 2).join(' '), obs.x + obs.width / 2, obs.y + obs.height - 22);
      ctx.fillText(words.slice(2).join(' '), obs.x + obs.width / 2, obs.y + obs.height - 10);
    }
  }, []);

  // Spawn obstacle
  const spawnObstacle = useCallback((speed: number): Obstacle => {
    const heights = [50, 65, 80];
    const h = heights[Math.floor(Math.random() * heights.length)];
    return {
      x: CANVAS_WIDTH + 20,
      y: GROUND_Y - h,
      width: 90,
      height: h,
      label: OBSTACLE_LABELS[Math.floor(Math.random() * OBSTACLE_LABELS.length)],
      color: OBSTACLE_COLORS[Math.floor(Math.random() * OBSTACLE_COLORS.length)],
      speed,
    };
  }, []);

  // Main game loop
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = stateRef.current;
    if (s.gameOver) return;

    s.frame++;
    s.score = Math.floor(s.frame * 0.15);
    s.speed = INITIAL_SPEED + s.frame * SPEED_INCREMENT;

    // Physics
    s.playerVY += GRAVITY;
    s.playerY += s.playerVY;
    if (s.playerY >= GROUND_Y - PLAYER_H) {
      s.playerY = GROUND_Y - PLAYER_H;
      s.playerVY = 0;
      s.isOnGround = true;
    }

    // Spawn obstacles every ~90 frames (with some randomness)
    if (s.frame % Math.max(60, 100 - Math.floor(s.frame / 100)) === 0) {
      s.obstacles.push(spawnObstacle(s.speed));
    }

    // Move obstacles
    s.obstacles = s.obstacles
      .map(obs => ({ ...obs, x: obs.x - s.speed }))
      .filter(obs => obs.x + obs.width > -10);

    // Collision detection (with margin for forgiveness)
    const margin = 8;
    const px = PLAYER_X + margin;
    const py = s.playerY + margin;
    const pw = PLAYER_W - margin * 2;
    const ph = PLAYER_H - margin * 2;

    for (const obs of s.obstacles) {
      if (
        px < obs.x + obs.width &&
        px + pw > obs.x &&
        py < obs.y + obs.height &&
        py + ph > obs.y
      ) {
        s.gameOver = true;
        onGameOverRef.current(s.score);
        return;
      }
    }

    // ── Draw ──

    // Background
    ctx.fillStyle = '#0A0B0F';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Stars / dots background
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 137.5 + s.frame * 0.3) % CANVAS_WIDTH);
      const sy = (i * 83.7) % (GROUND_Y - 20);
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ground line
    ctx.fillStyle = '#1A1B24';
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

    // Ground glow line
    ctx.strokeStyle = '#C74B18';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#C74B18';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw obstacles
    for (const obs of s.obstacles) {
      drawObstacle(ctx, obs);
    }

    // Draw crewmate
    s.walkFrame = s.isOnGround ? s.frame : s.walkFrame;
    drawCrewmate(ctx, PLAYER_X, s.playerY, playerColor, s.isOnGround, s.frame);

    // Score HUD
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 22px Inter, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${s.score}`, CANVAS_WIDTH - 20, 36);

    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('SCORE', CANVAS_WIDTH - 20, 52);

    // Speed indicator
    const speedLevel = Math.min(10, Math.floor((s.speed - INITIAL_SPEED) / 0.5) + 1);
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(`SPEED LVL ${speedLevel}`, 20, 36);

    // Jump hint (first 3 seconds)
    if (s.frame < 180) {
      ctx.fillStyle = `rgba(255,255,255,${0.7 - s.frame / 260})`;
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SPACE or CLICK to jump!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
    }

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [playerColor, drawCrewmate, drawObstacle, spawnObstacle]);

  // Keyboard & click handler
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jump]);

  // Start loop
  useEffect(() => {
    // Reset state
    stateRef.current = {
      playerY: GROUND_Y - PLAYER_H,
      playerVY: 0,
      isOnGround: true,
      score: 0,
      speed: INITIAL_SPEED,
      frame: 0,
      obstacles: [],
      gameOver: false,
      walkFrame: 0,
    };
    rafRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [gameLoop]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="rounded-xl cursor-pointer block"
      style={{ imageRendering: 'pixelated' }}
      onClick={jump}
    />
  );
}
