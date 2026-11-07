'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { PerformanceMonitor } from '@react-three/drei/core/PerformanceMonitor';
import { PANELS, type Panel, type PanelId } from './panels';
import { ORBIT, ORBIT_DEFAULTS } from './orbitTuning';
import { anchors } from './sceneAnchors';

// ── Hero scene ───────────────────────────────────────────────────────
// The portrait is a relief: a subdivided plane pushed forward by a depth
// map, cut by its own alpha matte, drawn first so it writes depth. Curved
// glass panels (open cylinder slices) orbit the head; wherever they pass
// behind the figure the depth buffer hides them, everywhere else they
// stay visible. The camera drifts with the pointer, so the relief reads
// as a 3D photo.

export type OrbitControl = {
  spin: () => void;
  focus: (panelIndex: number) => void;
  // fly panel i to the centre and open it; false when the flight can't run
  open: (panelIndex: number) => boolean;
};

export type Rect = { x: number; y: number; w: number; h: number };

type Props = {
  reduced: boolean;
  onReady?: () => void;
  onOpen: (slug: PanelId, from: Rect) => void;
  openSlug?: PanelId | null;
  // a panel is flying between the ring and the centre (the page lifts the
  // scene above the headline meanwhile)
  onFlight?: (active: boolean) => void;
  controlRef: React.MutableRefObject<OrbitControl | null>;
  // another scene has the screen (the About arena): stop drawing this one
  paused?: boolean;
};

const PHOTO_ASPECT = 1600 / 900;

// ── Layout, derived from however many panels there are ──
// Panels alternate between two rows. Every panel draws its own size and
// vertical drift, and each row's leftover arc is split into uneven gaps,
// so the halo reads as a loose cloud of windows, never a printed strip.
// Widths are reserved before gaps are dealt, so panels never collide.
// The draw is seeded: the same set of panels always lays out the same way.
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FILL = 0.58; // share of each row covered by glass
const TAU = Math.PI * 2;
const { ARC, LAYOUT } = (() => {
  const rand = seeded(PANELS.length * 7919 + 23);
  const slots = PANELS.map((_, i) => ({
    row: i % 2,
    size: 0.74 + rand() * 0.5,
    drift: (rand() - 0.5) * 0.3,
    angle: 0,
  }));
  const rows = [0, 1].map((r) => slots.filter((x) => x.row === r));
  // one unit arc for the shared geometry, sized by the fuller row
  const arc = (FILL * TAU) / Math.max(...rows.map((r) => r.reduce((a, x) => a + x.size, 0)));
  rows.forEach((row, r) => {
    const widths = row.map((x) => x.size * arc);
    const spare = TAU - widths.reduce((a, w) => a + w, 0);
    const weights = row.map(() => 0.3 + rand() * 1.4);
    const total = weights.reduce((a, w) => a + w, 0);
    let a = r === 0 ? 0 : (spare / row.length) * (0.4 + rand() * 0.4);
    row.forEach((x, k) => {
      a += widths[k] / 2;
      x.angle = a;
      a += widths[k] / 2 + (spare * weights[k]) / total;
    });
  });
  return { ARC: arc, LAYOUT: slots };
})();

const IDLE = 0.12; // rad/s

// ── Panel textures, drawn once on a 2D canvas ──
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function glassBase(ctx: CanvasRenderingContext2D, W: number, H: number) {
  roundRect(ctx, 3, 3, W - 6, H - 6, 46);
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, 'rgba(255,255,255,0.86)');
  g.addColorStop(0.55, 'rgba(246,246,246,0.62)');
  g.addColorStop(1, 'rgba(236,236,236,0.5)');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.stroke();
  // top sheen
  ctx.save();
  ctx.clip();
  const s = ctx.createLinearGradient(0, 0, 0, H * 0.5);
  s.addColorStop(0, 'rgba(255,255,255,0.55)');
  s.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = s;
  ctx.fillRect(0, 0, W, H * 0.5);
  ctx.restore();
}

// Card layout on its 640×400 texture (the shader uses the same screen rect)
const SCREEN = { x: 18, y: 128, w: 604, h: 254, r: 26 };

export const loadImage = (src: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src.startsWith('http') || src.endsWith('.png') || src.endsWith('.webp')
      ? `/_next/image?url=${encodeURIComponent(src)}&w=640&q=80`
      : src;
  });

export function drawCard(p: Panel, icon: HTMLImageElement | null, shot: HTMLImageElement | null, font: string) {
  const W = 640;
  const H = 400;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  glassBase(ctx, W, H);

  // icon: the app's own, or a monogram in the project's tone
  const ix = 30;
  const iy = 28;
  const is = 76;
  ctx.save();
  roundRect(ctx, ix, iy, is, is, 18); // same corner as the icon tiles
  ctx.clip();
  if (icon) {
    ctx.fillStyle = '#111';
    ctx.fillRect(ix, iy, is, is);
    const k = Math.min(is / icon.width, is / icon.height); // tile fills the box
    const w = icon.width * k;
    const h = icon.height * k;
    ctx.drawImage(icon, ix + (is - w) / 2, iy + (is - h) / 2, w, h);
  } else {
    const g = ctx.createLinearGradient(ix, iy, ix + is, iy + is);
    g.addColorStop(0, p.tone);
    g.addColorStop(1, '#111');
    ctx.fillStyle = g;
    ctx.fillRect(ix, iy, is, is);
    ctx.fillStyle = '#fff';
    ctx.font = `600 40px ${font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.title.charAt(0), ix + is / 2, iy + is / 2 + 2);
    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';
  }
  ctx.restore();

  ctx.fillStyle = '#111';
  ctx.font = `600 40px ${font}`;
  ctx.fillText(p.title, 128, 66);
  ctx.fillStyle = 'rgba(17,17,17,0.5)';
  ctx.font = `500 24px ${font}`;
  ctx.fillText(p.note, 129, 100);

  // screen
  const { x, y, w, h, r } = SCREEN;
  ctx.save();
  roundRect(ctx, x, y, w, h, r);
  ctx.clip();
  ctx.fillStyle = '#121214';
  ctx.fillRect(x, y, w, h);
  if (shot) {
    const k = Math.max(w / shot.width, h / shot.height);
    ctx.drawImage(shot, x, y, shot.width * k, shot.height * k); // cover, anchored top-left
  } else {
    // no screen can be shown (internal work): interface as shapes, no data
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(x + 20, y + 20, 120, h - 40);
    const bars = [0.62, 0.44, 0.78, 0.36, 0.55];
    bars.forEach((b, k) => {
      ctx.fillStyle = k === 0 ? p.tone : 'rgba(255,255,255,0.14)';
      roundRect(ctx, x + 160, y + 26 + k * 42, (w - 190) * b, 18, 9);
      ctx.fill();
    });
  }
  ctx.restore();
  return c;
}

function usePanelTextures() {
  const [textures, setTextures] = useState<THREE.Texture[] | null>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      await document.fonts.ready;
      const fam = getComputedStyle(document.documentElement).getPropertyValue('--font-geist').trim() || 'system-ui';
      const font = `${fam}, system-ui, sans-serif`;
      const canvases = await Promise.all(
        PANELS.map(async (p) => {
          const [icon, shot] = await Promise.all([
            p.icon ? loadImage(p.icon) : Promise.resolve(null),
            p.shot ? loadImage(p.shot) : Promise.resolve(null),
          ]);
          return drawCard(p, icon, shot, font);
        })
      );
      if (!alive) return;
      setTextures(
        canvases.map((cv) => {
          const t = new THREE.CanvasTexture(cv);
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = 4;
          return t;
        })
      );
    })();
    return () => {
      alive = false;
    };
  }, []);
  return textures;
}

// ── Shaders ──
const portraitVert = /* glsl */ `
  uniform sampler2D uDepth;
  uniform float uRelief;
  uniform float uReveal;
  uniform float uFrame;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    // relief of the frame on screen, from the 5×5 depth atlas
    vec2 tile = vec2(mod(uFrame, 5.0), floor(uFrame / 5.0));
    vec2 duv = vec2((tile.x + uv.x) / 5.0, 1.0 - (tile.y + (1.0 - uv.y)) / 5.0);
    p.z += texture2D(uDepth, duv).r * uRelief * uReveal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const portraitFrag = /* glsl */ `
  uniform sampler2D uMap;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(uMap, vUv);
    if (c.a < 0.5) discard;
    float g = dot(c.rgb, vec3(0.299, 0.587, 0.114));
    gl_FragColor = vec4(vec3(g), c.a);
    #include <colorspace_fragment>
  }
`;
const panelVert = /* glsl */ `
  uniform float uFlat;
  uniform float uRadius;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vUv = uv;
    // uFlat 0 → the slice of cylinder on the ring; 1 → a flat card
    vec3 pos = position;
    float th = atan(pos.x, pos.z + uRadius);
    pos = mix(pos, vec3(uRadius * th, pos.y, 0.0), uFlat);
    vec3 nrm = normalize(mix(normal, vec3(0.0, 0.0, 1.0), uFlat));
    vec4 wp = modelMatrix * vec4(pos, 1.0);
    vN = normalize(mat3(modelMatrix) * nrm);
    vV = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;
const panelFrag = /* glsl */ `
  uniform sampler2D uMap;
  uniform sampler2D uVideo;
  uniform float uVideoOn;
  uniform float uHover;
  uniform float uAlpha;
  uniform float uDim;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec4 c = texture2D(uMap, vUv);
    // Live clip inside the screen inset (same rounded rect the canvas drew)
    if (uVideoOn > 0.001 && gl_FrontFacing) {
      vec2 px = vec2(vUv.x * 640.0, (1.0 - vUv.y) * 400.0);
      // SCREEN = 18,128 · 604×254 · r26; the 16:10 clip covers its width
      vec2 d = abs(px - vec2(320.0, 255.0)) - (vec2(302.0, 127.0) - 26.0);
      float sd = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - 26.0;
      if (sd < 0.0) {
        vec2 vu = vec2((px.x - 18.0) / 604.0, (px.y - 128.0) / 377.5);
        vec3 vc = texture2D(uVideo, vec2(vu.x, 1.0 - vu.y)).rgb;
        c.rgb = mix(c.rgb, vc, uVideoOn);
      }
    }
    float fres = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0);
    if (!gl_FrontFacing) {
      // the inside of the ring: a plain frosted pane
      c = vec4(vec3(0.93), c.a * 0.6);
    }
    c.rgb += fres * 0.22 + uHover * 0.05;
    // another panel has focus: this one steps back
    c.a *= uAlpha * (1.0 - 0.38 * uDim);
    gl_FragColor = c;
    #include <colorspace_fragment>
  }
`;

// ── Head frames (scripts/head-frames.mjs) ──
// 25 cut-out frames of the head turning: 0 = facing right (the original
// photo), 8 = facing the viewer, 24 = facing left.
const HEAD = { count: 25, front: 8, w: 1024, h: 576 };
// The panel under the cursor, as a screen x (-1 left … 1 right) relative to
// the head; the ring writes it, the portrait turns to look at it.
const gaze = { x: null as number | null };
const headSrc = (k: number) => `/home/head/f${String(k).padStart(2, '0')}.webp`;

function Portrait({
  height,
  y,
  onReady,
  reduced,
  lookAhead,
}: {
  height: number;
  y: number;
  onReady?: () => void;
  reduced: boolean;
  lookAhead: boolean;
}) {
  const depth = useLoader(THREE.TextureLoader, '/home/head/depth.png');
  const width = height * PHOTO_ASPECT;

  // One canvas texture; the frame on show is drawn into it when it changes
  const canvas = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = HEAD.w;
    c.height = HEAD.h;
    return c;
  }, []);
  const map = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [canvas]);
  const frames = useRef<(HTMLImageElement | null)[]>(Array(HEAD.count).fill(null));
  const shown = useRef(-1);
  const look = useRef(0); // smoothed frame position
  const moved = useRef(false); // until the pointer moves, hold the photo's pose
  const skip = useRef(0);

  const draw = (k: number) => {
    const img = frames.current[k];
    if (!img) return false;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, HEAD.w, HEAD.h);
    ctx.drawImage(img, 0, 0, HEAD.w, HEAD.h);
    map.needsUpdate = true;
    shown.current = k;
    uniforms.uFrame.value = k;
    return true;
  };

  // Frame 0 first (it is the poster's pose), the rest right after
  useEffect(() => {
    let alive = true;
    const load = (k: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          if (alive) frames.current[k] = img;
          resolve();
        };
        img.onerror = () => resolve();
        img.src = headSrc(k);
      });
    load(0).then(() => {
      if (!alive) return;
      draw(0);
      requestAnimationFrame(() => onReady?.());
      for (let k = 1; k < HEAD.count; k++) load(k);
    });
    const onMove = () => (moved.current = true);
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      alive = false;
      window.removeEventListener('pointermove', onMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uniforms = useMemo(
    () => ({
      uMap: { value: map },
      uDepth: { value: depth },
      uRelief: { value: height * 0.16 },
      uReveal: { value: 0 },
      uFrame: { value: 0 },
    }),
    [map, depth, height]
  );

  const born = useRef<number | null>(null);
  useFrame((state, dt) => {
    // Opening, act 1: the flat photo (same as the DOM poster) swells into relief
    if (born.current === null) born.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - born.current;
    uniforms.uReveal.value = reduced ? 1 : easeOut(Math.min(1, t / 1.1));

    // The head follows the pointer: right → turns right, centre → faces
    // you, left → turns left. A project open in the middle: he looks at it.
    const x = Math.max(-1, Math.min(1, state.pointer.x));
    let target = 0;
    if (lookAhead) target = HEAD.front;
    else if (gaze.x !== null) {
      // a hovered project: he turns to it, fully by the time it is a short
      // way off his face
      const g = Math.max(-1, Math.min(1, gaze.x / 0.3));
      target = g >= 0 ? HEAD.front * (1 - g) : HEAD.front + (HEAD.count - 1 - HEAD.front) * -g;
    } else if (moved.current) target = x >= 0 ? HEAD.front * (1 - x) : HEAD.front + (HEAD.count - 1 - HEAD.front) * -x;
    look.current += (target - look.current) * Math.min(1, dt * (reduced ? 3 : 6));

    // show the nearest frame that has arrived
    const want = Math.round(look.current);
    skip.current = TOUCH ? (skip.current + 1) % 2 : 0;
    if (want !== shown.current && skip.current === 0) {
      for (let d = 0; d < HEAD.count; d++) {
        if (draw(Math.min(HEAD.count - 1, want + d)) || draw(Math.max(0, want - d))) break;
      }
    }
  });

  return (
    <mesh position={[0, y, 0]} renderOrder={-1}>
      <planeGeometry args={TOUCH ? [width, height, 110, 62] : [width, height, 220, 124]} />
      <shaderMaterial
        vertexShader={portraitVert}
        fragmentShader={portraitFrag}
        uniforms={uniforms}
        transparent
        depthWrite
      />
    </mesh>
  );
}

function Ring({
  textures,
  radius,
  center,
  photoH,
  reduced,
  onOpen,
  openSlug,
  onFlight,
  controlRef,
}: {
  openSlug?: PanelId | null;
  onFlight?: (active: boolean) => void;
  textures: THREE.Texture[];
  radius: number;
  center: [number, number, number];
  photoH: number;
  reduced: boolean;
  onOpen: Props['onOpen'];
  controlRef: Props['controlRef'];
}) {
  const group = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const outer = useRef<THREE.Group>(null);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const clips = useRef<Array<{ video: HTMLVideoElement; tex: THREE.VideoTexture; ready: boolean } | null>>([]);
  const frozen = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const v = parseFloat(new URLSearchParams(window.location.search).get('orbit') ?? '');
    return Number.isFinite(v) ? v : null;
  }, []);
  // Panel clips: never for data-saver visitors. Reduced motion keeps them,
  // but only the panel you point at plays (nothing moves on its own).
  const clipsAllowed = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    const c = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    return !c?.saveData;
  }, []);
  const [hover, setHover] = useState(-1);
  // the page's side notes caption whichever project the pointer is on
  useEffect(() => {
    const slug = hover >= 0 ? PANELS[hover].slug : null;
    window.dispatchEvent(new CustomEvent('panel:hover', { detail: slug }));
  }, [hover]);
  // the leader lines fall back to nothing once the scene is gone
  useEffect(() => () => {
    anchors.left = anchors.right = anchors.focus = anchors.head = null;
  }, []);
  const { gl, camera } = useThree();
  const born = useRef<number | null>(null);
  const aboutK = useRef(0);
  const flyer = useRef<THREE.Mesh>(null);
  const flight = useRef<{
    i: number;
    phase: 'out' | 'held' | 'back';
    t: number;
    mat: THREE.ShaderMaterial;
  } | null>(null);

  // Panel i leaves the ring: a twin mesh takes its exact world pose and
  // flies to the centre of the screen while the original fades out.
  const launch = (i: number) => {
    const mesh = meshes.current[i];
    const fm = flyer.current;
    if (!mesh || !fm || reduced || flight.current) return false;
    mesh.updateWorldMatrix(true, false);
    mesh.matrixWorld.decompose(fm.position, fm.quaternion, fm.scale);
    const src = materials[i].uniforms;
    const mat = new THREE.ShaderMaterial({
      vertexShader: panelVert,
      fragmentShader: panelFrag,
      uniforms: {
        uMap: { value: src.uMap.value },
        uVideo: { value: src.uVideo.value },
        uVideoOn: { value: src.uVideoOn.value },
        uHover: { value: 0 },
        uAlpha: { value: 1 },
        uDim: { value: 0 },
        uFlat: { value: 0 },
        uRadius: { value: radius },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    fm.material = mat;
    fm.visible = true;
    flight.current = { i, phase: 'out', t: 0, mat };
    onFlight?.(true);
    s.current.velocity = 0;
    s.current.target = frontAngle(i);
    return true;
  };

  const s = useRef({
    angle: 0.35,
    velocity: 0,
    target: null as number | null,
    dragging: false,
    lastX: 0,
    lastT: 0,
    moved: 0,
  });
  // Opening, act 2: the ring arrives spinning and settles to its idle pace
  useEffect(() => {
    s.current.velocity = reduced ? 0.2 : 1.5;
  }, [reduced]);

  const height = (radius * ARC) / 1.6; // texture is 640×400
  const geometry = useMemo(() => {
    const g = new THREE.CylinderGeometry(radius, radius, height, 28, 1, true, -ARC / 2, ARC);
    g.translate(0, 0, -radius); // arc midpoint at the origin, so sorting is per panel
    return g;
  }, [radius, height]);

  const materials = useMemo(
    () =>
      textures.map(
        (t) =>
          new THREE.ShaderMaterial({
            vertexShader: panelVert,
            fragmentShader: panelFrag,
            uniforms: {
              uMap: { value: t },
              uVideo: { value: BLANK },
              uVideoOn: { value: 0 },
              uHover: { value: 0 },
              uAlpha: { value: 0 },
              uDim: { value: 0 },
              uFlat: { value: 0 },
              uRadius: { value: radius },
            },
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
          })
      ),
    [textures, radius]
  );

  // Release the clip players when the scene goes away
  useEffect(
    () => () => {
      clips.current.forEach((c) => {
        if (!c) return;
        c.video.pause();
        c.video.removeAttribute('src');
        c.video.load();
        c.tex.dispose();
      });
    },
    []
  );

  // wheel and arrows rest while a project is open or a panel is flying
  const openRef = useRef(false);
  openRef.current = !!openSlug;
  const busy = () => openRef.current || !!flight.current;

  // Drag anywhere on the canvas spins the ring
  useEffect(() => {
    const el = gl.domElement;
    const st = s.current;
    const down = (e: PointerEvent) => {
      st.dragging = true;
      st.target = null;
      st.lastX = e.clientX;
      st.lastT = performance.now();
      st.moved = 0;
      st.velocity = 0;
    };
    const move = (e: PointerEvent) => {
      if (!st.dragging) return;
      const now = performance.now();
      const dx = e.clientX - st.lastX;
      st.moved += Math.abs(dx);
      const da = dx * 0.006;
      st.angle += da;
      st.velocity = da / Math.max((now - st.lastT) / 1000, 0.001);
      st.lastX = e.clientX;
      st.lastT = now;
    };
    const up = () => {
      st.dragging = false;
      st.velocity = Math.max(-6, Math.min(6, st.velocity));
    };
    // Wheel / trackpad: the page never scrolls, so the wheel turns the ring
    const wheel = (e: WheelEvent) => {
      if (busy()) return;
      e.preventDefault();
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      st.target = null;
      st.velocity = Math.max(-6, Math.min(6, st.velocity + d * 0.012));
    };
    // Arrow keys step to the next panel either way
    const key = (e: KeyboardEvent) => {
      if (busy() || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
      const t = e.target;
      if (t instanceof Element && t.closest('input, textarea, select, [role="dialog"], [contenteditable="true"]')) return;
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const from = st.target ?? st.angle;
      let best = dir * TAU;
      LAYOUT.forEach((slot) => {
        let d = (((-slot.angle - from) % TAU) + TAU) % TAU; // 0..TAU ahead
        if (dir < 0) d -= TAU; // TAU..0 behind
        if (Math.abs(d) > 0.05 && Math.abs(d) < Math.abs(best)) best = d;
      });
      st.velocity = 0;
      st.target = from + best;
    };
    el.addEventListener('wheel', wheel, { passive: false });
    window.addEventListener('keydown', key);
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('wheel', wheel);
      window.removeEventListener('keydown', key);
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [gl]);

  // Panel i faces the camera when the ring angle ≡ -its slot angle
  const frontAngle = (i: number) => {
    const want = -LAYOUT[i].angle;
    const turns = Math.round((s.current.angle - want) / TAU);
    return want + turns * TAU;
  };

  useEffect(() => {
    controlRef.current = {
      spin: () => {
        s.current.target = null;
        s.current.velocity = reduced ? 2 : 7;
      },
      focus: (i) => {
        s.current.velocity = 0;
        s.current.target = frontAngle(i);
      },
      open: (i) => launch(i),
    };
  });

  useFrame((state, dt) => {
    const st = s.current;
    dt = Math.min(dt, 0.05);
    // Calm (reduced motion): the scene is the content, so it slows to ~30%
    // instead of freezing. ?orbit=0.25 pins a quarter turn for testing.
    const idle = reduced ? IDLE * 0.3 : IDLE;
    if (frozen !== null) {
      st.angle = frozen * Math.PI * 2;
    } else if (st.target !== null) {
      const diff = st.target - st.angle;
      st.angle += diff * Math.min(1, dt * 7);
      if (Math.abs(diff) < 0.001) st.target = null;
    } else if (!st.dragging) {
      st.angle += st.velocity * dt;
      st.velocity *= Math.pow(0.05, dt);
      if (Math.abs(st.velocity) < idle) st.velocity += (idle - st.velocity) * Math.min(1, dt * 0.8);
    }
    if (group.current) group.current.rotation.y = st.angle;
    // Live tuning (orbitTuning.ts / ?ajustar): roll, height and size
    if (outer.current) {
      outer.current.rotation.z = THREE.MathUtils.degToRad(ORBIT.roll);
      outer.current.position.y = center[1] + (ORBIT.height - ORBIT_DEFAULTS.height) * photoH;
      outer.current.scale.setScalar(ORBIT.radius / ORBIT_DEFAULTS.radius);
    }
    if (tilt.current) {
      const ty = reduced ? 0 : state.pointer.y * 0.06;
      const pitch = THREE.MathUtils.degToRad(ORBIT.pitch);
      tilt.current.rotation.x += (pitch + ty - tilt.current.rotation.x) * Math.min(1, dt * 4);
    }
    if (born.current === null) born.current = state.clock.elapsedTime;
    const since = state.clock.elapsedTime - born.current;
    // one clip at a time: the panel nearest the viewer
    let lead = -1;
    let leadZ = -Infinity;
    meshes.current.forEach((mesh, k) => {
      if (!mesh || !PANELS[k].clip) return;
      mesh.getWorldPosition(tmp);
      if (tmp.z > leadZ) {
        leadZ = tmp.z;
        lead = k;
      }
    });
    // where the hovered panel sits on screen, relative to the head
    const hm = hover >= 0 ? meshes.current[hover] : null;
    if (hm) {
      hm.getWorldPosition(tmp).project(state.camera);
      const hx = tmp.x;
      tmp.set(center[0], center[1], center[2]).project(state.camera);
      gaze.x = hx - tmp.x;
    } else gaze.x = null;
    // the side notes' leader lines: the ring's edges, and the panel in focus
    if (tilt.current) {
      tilt.current.localToWorld(tmp.set(-radius, 0, 0)).project(state.camera);
      anchors.left = { x: tmp.x, y: tmp.y };
      tilt.current.localToWorld(tmp.set(radius, 0, 0)).project(state.camera);
      anchors.right = { x: tmp.x, y: tmp.y };
    }
    anchors.focus = hm && !flight.current && !openSlug ? ndcBox(hm, state.camera) : null;
    // About me: the ring steps back and the page annotates his head
    const aboutOpen = openSlug === 'about';
    aboutK.current += ((aboutOpen ? 1 : 0) - aboutK.current) * Math.min(1, dt * (reduced ? 12 : 4));
    if (aboutOpen && outer.current) {
      anchors.head = HEAD_POINTS.map(([x, y, z]) => {
        outer.current!.localToWorld(tmp.set(x * radius, y * radius, z * radius)).project(state.camera);
        return { x: tmp.x, y: tmp.y };
      });
    } else anchors.head = null;
    materials.forEach((m, i) => {
      const u = m.uniforms.uHover;
      u.value += ((hover === i ? 1 : 0) - u.value) * Math.min(1, dt * 10);
      const dim = m.uniforms.uDim;
      dim.value += ((hover >= 0 && hover !== i ? 1 : 0) - dim.value) * Math.min(1, dt * 8);

      // Each panel flies in from beyond the frame onto its slot, one after
      // another around the ring (reduced motion: a quiet fade in place)
      const slot = LAYOUT[i];
      const arrive = easeOut(Math.min(1, Math.max(0, (since - 0.45 - i * 0.07) / (reduced ? 0.4 : 0.8))));
      const away = reduced ? 0 : 1 - arrive;
      const hidden = openSlug === PANELS[i].slug || openSlug === 'about' || flight.current?.i === i;
      const alpha = m.uniforms.uAlpha;
      alpha.value += ((hidden ? 0 : arrive) - alpha.value) * Math.min(1, dt * (hidden ? 14 : 18));
      const r = radius * (1 + away * 1.1 + u.value * 0.07 + aboutK.current * 0.9);
      const mesh0 = meshes.current[i];
      if (mesh0) {
        mesh0.position.set(
          Math.sin(slot.angle) * r,
          ((slot.row ? -0.56 : 0.56) * 1.1 + slot.drift) * height + away * height * (slot.row ? -1.4 : 1.4),
          Math.cos(slot.angle) * r
        );
        mesh0.scale.setScalar(slot.size * (1 + u.value * 0.05) * (1 - away * 0.35));
      }

      // Animated thumbnail: load on first view, play only while the panel
      // faces the camera (reduced motion: while you point at it), pause the
      // moment it turns away
      const p = PANELS[i];
      const mesh = meshes.current[i];
      if (!p.clip || !mesh || !clipsAllowed) return;
      mesh.getWorldPosition(tmp);
      const facing = (reduced ? hover === i : i === lead && tmp.z - center[2] > radius * 0.25) && !document.hidden;
      let c = clips.current[i];
      if (facing && !c) {
        const video = document.createElement('video');
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = 'auto';
        video.src = p.clip;
        const tex = new THREE.VideoTexture(video);
        tex.colorSpace = THREE.SRGBColorSpace;
        c = { video, tex, ready: false };
        const entry = c;
        video.addEventListener('canplay', () => (entry.ready = true), { once: true });
        clips.current[i] = c;
        m.uniforms.uVideo.value = tex;
      }
      if (!c) return;
      if (facing && c.ready && c.video.paused) c.video.play().catch(() => {});
      if (!facing && !c.video.paused) c.video.pause();
      const on = m.uniforms.uVideoOn;
      on.value += ((facing && c.ready ? 1 : 0) - on.value) * Math.min(1, dt * 5);
    });

    // ── The flight: ring slot ⇄ centre of the screen ──
    const f = flight.current;
    const fm = flyer.current;
    if (f && fm) {
      const cam = state.camera as THREE.PerspectiveCamera;
      if (f.phase === 'out') f.t = Math.min(1, f.t + dt / 0.72);
      else if (f.phase === 'back') f.t = Math.max(0, f.t - dt / 0.6);
      const e = easeInOut(f.t);

      // from: wherever its slot is right now (the ring keeps turning)
      const home = meshes.current[f.i];
      if (home) {
        home.updateWorldMatrix(true, false);
        home.matrixWorld.decompose(fromP, fromQ, fromS);
      }
      // to: centred in front of the camera, facing it, half the view wide
      const D = cam.position.length() * 0.5;
      dir.set(0, 0, -1).applyQuaternion(cam.quaternion);
      toP.copy(cam.position).addScaledVector(dir, D);
      const viewH = 2 * D * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
      const wantW = Math.min(viewH * cam.aspect * 0.5, viewH * 0.55 * 1.6);
      toS.setScalar(wantW / (radius * ARC));

      fm.position.lerpVectors(fromP, toP, e);
      fm.position.y += Math.sin(Math.PI * e) * 0.18; // a small arc, not a straight slide
      fm.quaternion.slerpQuaternions(fromQ, cam.quaternion, e);
      fm.scale.lerpVectors(fromS, toS, e);
      f.mat.uniforms.uFlat.value = e;
      f.mat.uniforms.uVideoOn.value = materials[f.i].uniforms.uVideoOn.value;

      if (f.phase === 'out' && f.t >= 1) {
        f.phase = 'held';
        onOpen(PANELS[f.i].slug, screenRect(fm, cam, gl.domElement));
      }
      if (f.phase === 'back' && f.t <= 0) {
        fm.visible = false;
        f.mat.dispose();
        flight.current = null;
        onFlight?.(false);
      }
    }
  });

  // The card closed: the panel flies home
  useEffect(() => {
    if (!openSlug && flight.current?.phase === 'held') flight.current.phase = 'back';
  }, [openSlug]);

  return (
    <>
    <group ref={outer} position={center}>
    <group ref={tilt}>
      <group ref={group}>
        {PANELS.map((p, i) => {
          const { angle: a, row, size, drift } = LAYOUT[i];
          const rowY = ((row ? -0.56 : 0.56) * 1.1 + drift) * height;
          return (
            <mesh
              key={i}
              ref={(el) => {
                meshes.current[i] = el;
              }}
              geometry={geometry}
              material={materials[i]}
              position={[Math.sin(a) * radius * 2, rowY, Math.cos(a) * radius * 2]}
              rotation={[0, a, 0]}
              scale={size}
              onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                setHover(i);
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                setHover(-1);
                document.body.style.cursor = '';
              }}
              onClick={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation();
                if (s.current.moved > 6) return; // a drag, not a click
                if (p.slug !== 'about' && launch(i)) return; // the card opens when the panel arrives
                s.current.velocity = 0;
                s.current.target = frontAngle(i);
                onOpen(p.slug, screenRect(e.object as THREE.Mesh, camera, gl.domElement));
              }}
            />
          );
        })}
      </group>
    </group>
    </group>
    <mesh ref={flyer} geometry={geometry} visible={false} renderOrder={20} frustumCulled={false} />
    </>
  );
}

// Points on the portrait's head for the About annotations, in ring radii
// from the ring's centre (order matches the facts, then "away from code")
const HEAD_POINTS: Array<[number, number, number]> = [
  [-0.3, 0.55, 0.3], // temple: origin
  [-0.55, 0.05, 0], // ear: studies
  [0.25, 0.22, 0.45], // eye: code
  [0.05, 0.95, 0], // crown: start
  [0.2, -0.42, 0.35], // chin: soulslike
];
const tmp = new THREE.Vector3();
const dir = new THREE.Vector3();
const fromP = new THREE.Vector3();
const toP = new THREE.Vector3();
const fromS = new THREE.Vector3();
const toS = new THREE.Vector3();
const fromQ = new THREE.Quaternion();
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// A mesh's box on screen, in CSS pixels: where the expanded card is born
const corner = new THREE.Vector3();
function screenRect(mesh: THREE.Mesh, camera: THREE.Camera, canvas: HTMLCanvasElement): Rect {
  const geo = mesh.geometry;
  if (!geo.boundingBox) geo.computeBoundingBox();
  const b = geo.boundingBox!;
  const c = canvas.getBoundingClientRect();
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let k = 0; k < 8; k++) {
    corner.set(k & 1 ? b.max.x : b.min.x, k & 2 ? b.max.y : b.min.y, k & 4 ? b.max.z : b.min.z);
    corner.applyMatrix4(mesh.matrixWorld).project(camera);
    const px = c.left + ((corner.x + 1) / 2) * c.width;
    const py = c.top + ((1 - corner.y) / 2) * c.height;
    x0 = Math.min(x0, px); x1 = Math.max(x1, px);
    y0 = Math.min(y0, py); y1 = Math.max(y1, py);
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}
// The same box in normalised device coordinates (for the leader lines)
function ndcBox(mesh: THREE.Mesh, camera: THREE.Camera) {
  const geo = mesh.geometry;
  if (!geo.boundingBox) geo.computeBoundingBox();
  const b = geo.boundingBox!;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let k = 0; k < 8; k++) {
    corner.set(k & 1 ? b.max.x : b.min.x, k & 2 ? b.max.y : b.min.y, k & 4 ? b.max.z : b.min.z);
    corner.applyMatrix4(mesh.matrixWorld).project(camera);
    x0 = Math.min(x0, corner.x); x1 = Math.max(x1, corner.x);
    y0 = Math.min(y0, corner.y); y1 = Math.max(y1, corner.y);
  }
  return { x0, y0, x1, y1 };
}
// Stand-in until a panel's clip exists
const BLANK = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
BLANK.needsUpdate = true;

function Rig({ reduced }: { reduced: boolean }) {
  useFrame((state, dt) => {
    const k = Math.min(1, dt * 3);
    const amt = reduced ? 0.3 : 1;
    const tx = state.pointer.x * 0.45 * amt;
    const ty = 0.15 + state.pointer.y * 0.25 * amt;
    state.camera.position.x += (tx - state.camera.position.x) * k;
    state.camera.position.y += (ty - state.camera.position.y) * k;
    state.camera.lookAt(0, 0.05, 0);
  });
  return null;
}

function Stage({ reduced, onOpen, controlRef, onReady, openSlug, onFlight }: Props) {
  const { viewport, size } = useThree();
  const textures = usePanelTextures();
  // the hero measures how tall the photo may be under its buttons
  const [cap, setCap] = useState(anchors.photoMax);
  useEffect(() => {
    const on = () => setCap(anchors.photoMax);
    on();
    window.addEventListener('hero:photo', on);
    return () => window.removeEventListener('hero:photo', on);
  }, []);
  // The canvas covers the whole hero. The photo sits bottom-aligned and
  // large (on phones it bleeds past the sides — its ground is the page).
  const narrow = viewport.width < viewport.height;
  const capUnits = cap && size.height ? (cap * viewport.height) / size.height : Infinity;
  // phones: the head fills the space under the buttons instead of leaving a gap
  const h = Math.min(viewport.height * (narrow ? 0.7 : 0.6), (viewport.width / PHOTO_ASPECT) * (narrow ? 2.5 : 1.12), capUnits);
  const y = -viewport.height / 2 + h / 2;
  const radius = h * ORBIT_DEFAULTS.radius;
  // head centre in the photo ≈ (0.54, 0.40) of the frame, ring at eye level
  const center: [number, number, number] = [h * PHOTO_ASPECT * 0.03, y + h * ORBIT_DEFAULTS.height, 0];

  return (
    <>
      <Portrait height={h} y={y} onReady={onReady} reduced={reduced} lookAhead={!!openSlug} />
      {textures && (
        <Ring
          textures={textures}
          radius={radius}
          center={center}
          photoH={h}
          reduced={reduced}
          onOpen={onOpen}
          openSlug={openSlug}
          onFlight={onFlight}
          controlRef={controlRef}
        />
      )}
      <Rig reduced={reduced} />
    </>
  );
}

const TOUCH = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

// Pixel ratio steps: the scene starts sharp and steps down a notch when the
// device can't hold the frame rate (and back up when it recovers).
const DPR_STEPS = TOUCH ? [1, 1.25, 1.5] : [1, 1.5, 2];

export default function HeroScene(props: Props) {
  const cap = typeof window === 'undefined' ? 1 : window.devicePixelRatio;
  const steps = DPR_STEPS.filter((d) => d <= Math.max(1, cap));
  const [level, setLevel] = useState(steps.length - 1);
  return (
    <Canvas
      frameloop={props.paused ? 'never' : 'always'}
      // phones: cap the pixel ratio (3× screens cost 4× the pixels of 1.5×)
      dpr={steps[level]}
      camera={{ position: [0, 0.15, 7], fov: 30 }}
      gl={{ antialias: !TOUCH, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0, touchAction: 'pan-y' }}
    >
      <PerformanceMonitor
        onDecline={() => setLevel((l) => Math.max(0, l - 1))}
        onIncline={() => setLevel((l) => Math.min(steps.length - 1, l + 1))}
        flipflops={3}
        onFallback={() => setLevel(0)}
      >
        <Stage {...props} />
      </PerformanceMonitor>
    </Canvas>
  );
}
