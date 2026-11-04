'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { PANELS, type Panel, type ProjectId } from './panels';
import { ORBIT, ORBIT_DEFAULTS } from './orbitTuning';

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
};

type Props = {
  reduced: boolean;
  onReady?: () => void;
  onOpen: (slug: ProjectId, x: number, y: number) => void;
  controlRef: React.MutableRefObject<OrbitControl | null>;
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

const loadImage = (src: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src.startsWith('http') || src.endsWith('.png') || src.endsWith('.webp')
      ? `/_next/image?url=${encodeURIComponent(src)}&w=640&q=80`
      : src;
  });

function drawCard(p: Panel, icon: HTMLImageElement | null, shot: HTMLImageElement | null, font: string) {
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
  roundRect(ctx, ix, iy, is, is, 22);
  ctx.clip();
  if (icon) {
    ctx.fillStyle = '#111';
    ctx.fillRect(ix, iy, is, is);
    const k = Math.min(is / icon.width, is / icon.height) * 0.86;
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
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z += texture2D(uDepth, uv).r * uRelief;
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
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vN = normalize(mat3(modelMatrix) * normal);
    vV = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;
const panelFrag = /* glsl */ `
  uniform sampler2D uMap;
  uniform sampler2D uVideo;
  uniform float uVideoOn;
  uniform float uHover;
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
    c.rgb += fres * 0.22 + uHover * 0.04;
    gl_FragColor = c;
    #include <colorspace_fragment>
  }
`;

function Portrait({ height, y, onReady }: { height: number; y: number; onReady?: () => void }) {
  const [map, depth] = useLoader(THREE.TextureLoader, ['/home/retrato-cut.webp', '/home/retrato-depth.png']);
  map.colorSpace = THREE.SRGBColorSpace;
  // textures are in (useLoader suspends until then): the DOM poster can go
  useEffect(() => {
    const id = requestAnimationFrame(() => onReady?.());
    return () => cancelAnimationFrame(id);
  }, [onReady]);
  const width = height * PHOTO_ASPECT;
  const uniforms = useMemo(
    () => ({ uMap: { value: map }, uDepth: { value: depth }, uRelief: { value: height * 0.16 } }),
    [map, depth, height]
  );
  return (
    <mesh position={[0, y, 0]} renderOrder={-1}>
      <planeGeometry args={[width, height, 220, 124]} />
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
  controlRef,
}: {
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
  // Panel clips: never for reduced-motion or data-saver visitors
  const clipsAllowed = useMemo(() => {
    if (typeof navigator === 'undefined' || reduced) return false;
    const c = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    return !c?.saveData;
  }, [reduced]);
  const [hover, setHover] = useState(-1);
  const { gl } = useThree();

  const s = useRef({
    angle: 0.35,
    velocity: 0,
    target: null as number | null,
    dragging: false,
    lastX: 0,
    lastT: 0,
    moved: 0,
  });

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
            },
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
          })
      ),
    [textures]
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
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
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
    materials.forEach((m, i) => {
      const u = m.uniforms.uHover;
      u.value += ((hover === i ? 1 : 0) - u.value) * Math.min(1, dt * 10);

      // Animated thumbnail: load on first view, play only while the panel
      // faces the camera, pause the moment it turns away
      const p = PANELS[i];
      const mesh = meshes.current[i];
      if (!p.clip || !mesh || !clipsAllowed) return;
      mesh.getWorldPosition(tmp);
      const facing = tmp.z - center[2] > radius * 0.25 && !document.hidden;
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
  });

  return (
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
              position={[Math.sin(a) * radius, rowY, Math.cos(a) * radius]}
              rotation={[0, a, 0]}
              scale={size * (hover === i ? 1.05 : 1)}
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
                s.current.velocity = 0;
                s.current.target = frontAngle(i);
                onOpen(p.slug, e.nativeEvent.clientX, e.nativeEvent.clientY);
              }}
            />
          );
        })}
      </group>
    </group>
    </group>
  );
}

const tmp = new THREE.Vector3();
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

function Stage({ reduced, onOpen, controlRef, onReady }: Props) {
  const { viewport } = useThree();
  const textures = usePanelTextures();
  // The canvas covers the whole hero. The photo sits bottom-aligned and
  // large (on phones it bleeds past the sides — its ground is the page).
  const narrow = viewport.width < viewport.height;
  const h = Math.min(viewport.height * 0.6, (viewport.width / PHOTO_ASPECT) * (narrow ? 1.75 : 1.12));
  const y = -viewport.height / 2 + h / 2;
  const radius = h * ORBIT_DEFAULTS.radius;
  // head centre in the photo ≈ (0.54, 0.40) of the frame, ring at eye level
  const center: [number, number, number] = [h * PHOTO_ASPECT * 0.03, y + h * ORBIT_DEFAULTS.height, 0];

  return (
    <>
      <Portrait height={h} y={y} onReady={onReady} />
      {textures && (
        <Ring
          textures={textures}
          radius={radius}
          center={center}
          photoH={h}
          reduced={reduced}
          onOpen={onOpen}
          controlRef={controlRef}
        />
      )}
      <Rig reduced={reduced} />
    </>
  );
}

export default function HeroScene(props: Props) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.15, 7], fov: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0, touchAction: 'pan-y' }}
    >
      <Stage {...props} />
    </Canvas>
  );
}
