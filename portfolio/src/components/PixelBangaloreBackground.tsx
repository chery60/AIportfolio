import { useEffect, useRef } from 'react';

interface PixelBangaloreBackgroundProps {
    className?: string;
}

type CoverRect = {
    x: number;
    y: number;
    width: number;
    height: number;
    scale: number;
};

type FoliageZone = {
    kind: 'canopy' | 'vine' | 'foreground';
    x: number;
    y: number;
    width: number;
    height: number;
    count: number;
    sourceMin: number;
    sourceMax: number;
    ampX: number;
    ampY: number;
    alpha: number;
};

type LightZone = {
    x: number;
    y: number;
    width: number;
    height: number;
    count: number;
    sizeMin: number;
    sizeMax: number;
    ampXMin: number;
    ampXMax: number;
    alphaMin: number;
    alphaMax: number;
    colors: string[];
};

type BackgroundScene = {
    id: 'bangalore' | 'hyderabad' | 'gurgaon';
    label: string;
    src: string;
    foliageZones: FoliageZone[];
    lightZones: LightZone[];
};

type PreparedScene = BackgroundScene & {
    image: HTMLImageElement;
    leafParticles: LeafParticle[];
    lightParticles: LightParticle[];
};

type LeafParticle = {
    kind: FoliageZone['kind'];
    x: number;
    y: number;
    phase: number;
    rate: number;
    sourceSize: number;
    ampX: number;
    ampY: number;
    alpha: number;
};

type LightParticle = {
    x: number;
    y: number;
    size: number;
    phase: number;
    rate: number;
    ampX: number;
    alpha: number;
    color: string;
};

const PIXEL_SCALE = 2;
const HOLD_DURATION_MS = 12000;
const TRANSITION_DURATION_MS = 4500;
const CYCLE_DURATION_MS = HOLD_DURATION_MS + TRANSITION_DURATION_MS;

const BASE_FOLIAGE_ZONES: FoliageZone[] = [
    { kind: 'canopy', x: 0.01, y: 0.01, width: 0.39, height: 0.2, count: 118, sourceMin: 7, sourceMax: 17, ampX: 10.2, ampY: 3.8, alpha: 0.66 },
    { kind: 'canopy', x: 0.03, y: 0.17, width: 0.29, height: 0.17, count: 76, sourceMin: 6, sourceMax: 15, ampX: 8.8, ampY: 3.4, alpha: 0.58 },
    { kind: 'vine', x: 0.1, y: 0.12, width: 0.2, height: 0.32, count: 66, sourceMin: 4, sourceMax: 11, ampX: 8.4, ampY: 6.8, alpha: 0.6 },
    { kind: 'foreground', x: 0.01, y: 0.62, width: 0.42, height: 0.35, count: 84, sourceMin: 6, sourceMax: 18, ampX: 6.4, ampY: 3.4, alpha: 0.52 },
    { kind: 'foreground', x: 0.38, y: 0.66, width: 0.4, height: 0.29, count: 58, sourceMin: 6, sourceMax: 15, ampX: 5.8, ampY: 2.8, alpha: 0.42 },
];

const BASE_LIGHT_ZONES: LightZone[] = [
    {
        x: 0.48,
        y: 0.61,
        width: 0.43,
        height: 0.18,
        count: 24,
        sizeMin: 2,
        sizeMax: 4,
        ampXMin: 1,
        ampXMax: 2.7,
        alphaMin: 0.14,
        alphaMax: 0.34,
        colors: ['255,223,143', '246,191,91', '132,210,255'],
    },
    {
        x: 0.5,
        y: 0.72,
        width: 0.39,
        height: 0.23,
        count: 40,
        sizeMin: 1,
        sizeMax: 3,
        ampXMin: 2,
        ampXMax: 5,
        alphaMin: 0.08,
        alphaMax: 0.24,
        colors: ['255,223,143', '246,191,91'],
    },
];

const SCENES: BackgroundScene[] = [
    {
        id: 'bangalore',
        label: 'Bangalore',
        src: `${import.meta.env.BASE_URL}bangalore-pixel-hero-left-tree.png`,
        foliageZones: BASE_FOLIAGE_ZONES,
        lightZones: BASE_LIGHT_ZONES,
    },
    {
        id: 'hyderabad',
        label: 'Hyderabad',
        src: `${import.meta.env.BASE_URL}hyderabad-pixel-hero.png`,
        foliageZones: BASE_FOLIAGE_ZONES,
        lightZones: BASE_LIGHT_ZONES,
    },
    {
        id: 'gurgaon',
        label: 'Gurgaon',
        src: `${import.meta.env.BASE_URL}gurgaon-pixel-hero.png`,
        foliageZones: BASE_FOLIAGE_ZONES,
        lightZones: BASE_LIGHT_ZONES,
    },
];

function seededRandom(seed: number) {
    const value = Math.sin(seed) * 10000;
    return value - Math.floor(value);
}

function easeInOutCubic(value: number) {
    const t = Math.max(0, Math.min(1, value));
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getLeafRate(kind: FoliageZone['kind'], randomValue: number) {
    if (kind === 'canopy') return 0.9 + randomValue * 1;
    if (kind === 'vine') return 1.2 + randomValue * 1.05;
    return 0.75 + randomValue * 0.7;
}

function createLeafParticles(zones: FoliageZone[]): LeafParticle[] {
    const particles: LeafParticle[] = [];

    zones.forEach((zone, zoneIndex) => {
        for (let index = 0; index < zone.count; index++) {
            const seed = (zoneIndex + 1) * 131 + index * 29.7;
            const rand = (offset: number) => seededRandom(seed * offset);

            particles.push({
                kind: zone.kind,
                x: zone.x + rand(11.3) * zone.width,
                y: zone.y + rand(19.9) * zone.height,
                phase: rand(7.1) * Math.PI * 2,
                rate: getLeafRate(zone.kind, rand(23.7)),
                sourceSize: Math.round(zone.sourceMin + rand(31.1) * (zone.sourceMax - zone.sourceMin)),
                ampX: zone.ampX * (0.45 + rand(41.3) * 0.75),
                ampY: zone.ampY * (0.45 + rand(47.9) * 0.75),
                alpha: zone.alpha * (0.65 + rand(53.5) * 0.5),
            });
        }
    });

    return particles;
}

function createLightParticles(zones: LightZone[], sceneIndex: number): LightParticle[] {
    const particles: LightParticle[] = [];

    zones.forEach((zone, zoneIndex) => {
        for (let index = 0; index < zone.count; index++) {
            const seed = 913 + sceneIndex * 67.5 + zoneIndex * 113 + index * 37.1;
            const rand = (offset: number) => seededRandom(seed * offset);

            particles.push({
                x: zone.x + rand(11.7) * zone.width,
                y: zone.y + rand(19.1) * zone.height,
                size: Math.round(zone.sizeMin + rand(29.3) * (zone.sizeMax - zone.sizeMin)),
                phase: rand(37.5) * Math.PI * 2,
                rate: 0.75 + rand(41.1) * 1.1,
                ampX: zone.ampXMin + rand(47.3) * (zone.ampXMax - zone.ampXMin),
                alpha: zone.alphaMin + rand(59.7) * (zone.alphaMax - zone.alphaMin),
                color: zone.colors[Math.floor(rand(61.3) * zone.colors.length)] ?? zone.colors[0],
            });
        }
    });

    return particles;
}

function getCoverRect(image: HTMLImageElement, width: number, height: number): CoverRect {
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight) * 1.02;
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;

    return {
        x: (width - drawWidth) / 2,
        y: (height - drawHeight) / 2,
        width: drawWidth,
        height: drawHeight,
        scale,
    };
}

function getSceneState(elapsedMs: number, reducedMotion: boolean) {
    if (reducedMotion) {
        return { currentIndex: 0, nextIndex: 0, mix: 0 };
    }

    const slot = Math.floor(elapsedMs / CYCLE_DURATION_MS) % SCENES.length;
    const localMs = elapsedMs % CYCLE_DURATION_MS;
    const isTransitioning = localMs >= HOLD_DURATION_MS;
    const progress = isTransitioning ? (localMs - HOLD_DURATION_MS) / TRANSITION_DURATION_MS : 0;

    return {
        currentIndex: slot,
        nextIndex: (slot + 1) % SCENES.length,
        mix: easeInOutCubic(progress),
    };
}

function loadScene(scene: BackgroundScene, index: number) {
    return new Promise<PreparedScene>((resolve, reject) => {
        const image = new Image();
        image.decoding = 'async';
        image.onload = () => {
            resolve({
                ...scene,
                image,
                leafParticles: createLeafParticles(scene.foliageZones),
                lightParticles: createLightParticles(scene.lightZones, index),
            });
        };
        image.onerror = () => reject(new Error(`Could not load background scene: ${scene.label}`));
        image.src = scene.src;
    });
}

export default function PixelBangaloreBackground({ className = '' }: PixelBangaloreBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const pointer = { x: 0.5, y: 0.48, active: false };
        let animationFrame = 0;
        let scenesReady = false;
        let preparedScenes: PreparedScene[] = [];
        let cssWidth = window.innerWidth;
        let cssHeight = window.innerHeight;
        let reducedMotion = prefersReducedMotion.matches;
        let animationStart = 0;

        const resize = () => {
            cssWidth = Math.max(1, window.innerWidth);
            cssHeight = Math.max(1, window.innerHeight);
            canvas.width = Math.max(320, Math.floor(cssWidth / PIXEL_SCALE));
            canvas.height = Math.max(240, Math.floor(cssHeight / PIXEL_SCALE));
            canvas.style.width = `${cssWidth}px`;
            canvas.style.height = `${cssHeight}px`;
            ctx.imageSmoothingEnabled = false;
            if (scenesReady && reducedMotion) {
                draw(0);
            }
        };

        const drawSceneImage = (scene: PreparedScene, width: number, height: number, alpha: number) => {
            const cover = getCoverRect(scene.image, width, height);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.drawImage(scene.image, cover.x, cover.y, cover.width, cover.height);
            ctx.restore();
            return cover;
        };

        const drawVeil = (width: number, height: number) => {
            const globalShade = ctx.createLinearGradient(0, 0, width, height);
            globalShade.addColorStop(0, 'rgba(3,6,10,0.06)');
            globalShade.addColorStop(0.46, 'rgba(5,8,11,0.02)');
            globalShade.addColorStop(1, 'rgba(5,8,12,0.14)');
            ctx.fillStyle = globalShade;
            ctx.fillRect(0, 0, width, height);

            const leftShade = ctx.createLinearGradient(0, 0, width * 0.56, 0);
            leftShade.addColorStop(0, 'rgba(0,0,0,0.16)');
            leftShade.addColorStop(0.44, 'rgba(0,0,0,0.08)');
            leftShade.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = leftShade;
            ctx.fillRect(0, 0, width, height);

            const rightShade = ctx.createLinearGradient(width * 0.56, 0, width, 0);
            rightShade.addColorStop(0, 'rgba(0,0,0,0)');
            rightShade.addColorStop(1, 'rgba(0,0,0,0.1)');
            ctx.fillStyle = rightShade;
            ctx.fillRect(0, 0, width, height);

            const centerShade = ctx.createRadialGradient(width * 0.52, height * 0.42, 0, width * 0.52, height * 0.42, Math.max(width, height) * 0.72);
            centerShade.addColorStop(0, 'rgba(255,250,210,0.035)');
            centerShade.addColorStop(0.54, 'rgba(255,250,210,0.01)');
            centerShade.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = centerShade;
            ctx.fillRect(0, 0, width, height);

            const bottomShade = ctx.createLinearGradient(0, height * 0.5, 0, height);
            bottomShade.addColorStop(0, 'rgba(0,0,0,0)');
            bottomShade.addColorStop(0.78, 'rgba(1,5,6,0.22)');
            bottomShade.addColorStop(1, 'rgba(0,0,0,0.42)');
            ctx.fillStyle = bottomShade;
            ctx.fillRect(0, 0, width, height);
        };

        const drawFinalReadabilityShade = (width: number, height: number) => {
            const leftTextShade = ctx.createLinearGradient(0, 0, width * 0.48, 0);
            leftTextShade.addColorStop(0, 'rgba(0,0,0,0.12)');
            leftTextShade.addColorStop(0.54, 'rgba(0,0,0,0.06)');
            leftTextShade.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = leftTextShade;
            ctx.fillRect(0, 0, width, height);

            const heroCopyShade = ctx.createRadialGradient(width * 0.19, height * 0.52, 0, width * 0.19, height * 0.52, Math.max(width, height) * 0.42);
            heroCopyShade.addColorStop(0, 'rgba(0,0,0,0.2)');
            heroCopyShade.addColorStop(0.44, 'rgba(0,0,0,0.1)');
            heroCopyShade.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = heroCopyShade;
            ctx.fillRect(0, 0, width, height);

            const chatShade = ctx.createLinearGradient(width * 0.68, 0, width, 0);
            chatShade.addColorStop(0, 'rgba(0,0,0,0)');
            chatShade.addColorStop(1, 'rgba(0,0,0,0.08)');
            ctx.fillStyle = chatShade;
            ctx.fillRect(0, 0, width, height);
        };

        const getPointerBoost = (x: number, y: number) => {
            if (!pointer.active) return 1;

            const dx = x - pointer.x;
            const dy = y - pointer.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const proximity = Math.max(0, 1 - distance / 0.22);
            return 1 + proximity * 0.72;
        };

        const drawFoliage = (scene: PreparedScene, cover: CoverRect, time: number, alphaScale: number) => {
            if (alphaScale <= 0.01) return;
            ctx.save();

            for (const particle of scene.leafParticles) {
                const baseX = cover.x + particle.x * cover.width;
                const baseY = cover.y + particle.y * cover.height;
                const destSize = Math.max(1, Math.round(particle.sourceSize * cover.scale));

                if (
                    baseX < -destSize ||
                    baseX > canvas.width + destSize ||
                    baseY < -destSize ||
                    baseY > canvas.height + destSize
                ) {
                    continue;
                }

                const boost = getPointerBoost(baseX / canvas.width, baseY / canvas.height);
                const gust = 1 + Math.max(0, Math.sin(time * 0.82 + particle.phase * 0.35 + particle.y * 4.2)) * 0.45;
                const windBoost = boost * gust;
                const groupWind = Math.sin(time * 1.55 + particle.y * 9.5 + particle.kind.length);
                const sway = Math.sin(time * particle.rate + particle.phase);
                const bob = Math.cos(time * (particle.rate * 0.72) + particle.phase * 0.9);
                const vineDrop = particle.kind === 'vine'
                    ? Math.sin(time * 1.9 + particle.phase * 1.2) * particle.ampY * 0.92
                    : 0;
                const offsetX = Math.round((sway * 0.62 + groupWind * 0.38) * particle.ampX * windBoost);
                const offsetY = Math.round((bob * particle.ampY + vineDrop) * windBoost);
                const flicker = 0.82 + Math.max(0, Math.sin(time * (particle.rate * 1.95) + particle.phase)) * 0.3;
                const alpha = Math.min(0.94, particle.alpha * flicker * windBoost) * alphaScale;
                const sourceSize = Math.max(2, particle.sourceSize);
                const sourceX = Math.max(
                    0,
                    Math.min(
                        scene.image.naturalWidth - sourceSize,
                        Math.round(particle.x * scene.image.naturalWidth - sourceSize / 2)
                    )
                );
                const sourceY = Math.max(
                    0,
                    Math.min(
                        scene.image.naturalHeight - sourceSize,
                        Math.round(particle.y * scene.image.naturalHeight - sourceSize / 2)
                    )
                );

                ctx.globalAlpha = alpha;
                ctx.drawImage(
                    scene.image,
                    sourceX,
                    sourceY,
                    sourceSize,
                    sourceSize,
                    Math.round(baseX + offsetX),
                    Math.round(baseY + offsetY),
                    destSize,
                    destSize
                );
            }

            ctx.restore();
        };

        const drawLightShimmer = (scene: PreparedScene, cover: CoverRect, time: number, alphaScale: number) => {
            if (alphaScale <= 0.01) return;
            ctx.save();

            for (const particle of scene.lightParticles) {
                const x = cover.x + particle.x * cover.width;
                const y = cover.y + particle.y * cover.height;

                if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
                    continue;
                }

                const flicker = Math.max(0, Math.sin(time * particle.rate + particle.phase));
                const ripple = Math.sin(time * (particle.rate * 0.75) + particle.phase * 0.7);
                const alpha = particle.alpha * (0.25 + flicker * 0.95) * alphaScale;
                const size = Math.max(1, Math.round(particle.size * cover.scale));

                ctx.fillStyle = `rgba(${particle.color},${alpha})`;
                ctx.fillRect(
                    Math.round(x + ripple * particle.ampX),
                    Math.round(y),
                    Math.max(1, size * 2),
                    size
                );
            }

            ctx.restore();
        };

        const draw = (timestamp: number) => {
            if (!scenesReady || preparedScenes.length === 0) return;
            if (animationStart === 0 && timestamp > 0) {
                animationStart = timestamp;
            }

            const elapsedMs = Math.max(0, timestamp - animationStart);
            const time = timestamp * 0.001;
            const width = canvas.width;
            const height = canvas.height;
            const { currentIndex, nextIndex, mix } = getSceneState(elapsedMs, reducedMotion);
            const currentScene = preparedScenes[currentIndex] ?? preparedScenes[0];
            const nextScene = preparedScenes[nextIndex] ?? currentScene;

            ctx.imageSmoothingEnabled = false;
            ctx.clearRect(0, 0, width, height);
            const currentCover = drawSceneImage(currentScene, width, height, 1);
            const nextCover = mix > 0 ? drawSceneImage(nextScene, width, height, mix) : currentCover;
            drawVeil(width, height);

            if (!reducedMotion) {
                drawFoliage(currentScene, currentCover, time, 1 - mix);
                drawFoliage(nextScene, nextCover, time, mix);
                drawLightShimmer(currentScene, currentCover, time, 1 - mix);
                drawLightShimmer(nextScene, nextCover, time, mix);
            }
            drawFinalReadabilityShade(width, height);

            if (!reducedMotion) {
                animationFrame = window.requestAnimationFrame(draw);
            }
        };

        const onPointerMove = (event: PointerEvent) => {
            pointer.x = event.clientX / Math.max(1, cssWidth);
            pointer.y = event.clientY / Math.max(1, cssHeight);
            pointer.active = true;
        };

        const onPointerLeave = () => {
            pointer.active = false;
        };

        const startAnimation = () => {
            window.cancelAnimationFrame(animationFrame);
            animationStart = reducedMotion ? 0 : performance.now();
            draw(animationStart);
        };

        const onMotionChange = (event: MediaQueryListEvent) => {
            reducedMotion = event.matches;
            startAnimation();
        };

        resize();
        Promise.all(SCENES.map(loadScene))
            .then((loadedScenes) => {
                preparedScenes = loadedScenes;
                scenesReady = true;
                resize();
                startAnimation();
            })
            .catch((error) => {
                console.error(error);
            });

        window.addEventListener('resize', resize);
        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('pointerleave', onPointerLeave);
        prefersReducedMotion.addEventListener('change', onMotionChange);

        return () => {
            window.cancelAnimationFrame(animationFrame);
            window.removeEventListener('resize', resize);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerleave', onPointerLeave);
            prefersReducedMotion.removeEventListener('change', onMotionChange);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={`pointer-events-none fixed inset-0 h-full w-full ${className}`}
            style={{ imageRendering: 'pixelated' }}
        />
    );
}
