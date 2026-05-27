'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { MeshReflectorMaterial } from '@react-three/drei';
import { CanvasTexture, RepeatWrapping } from 'three';

// ── Water — dynamic mirror with REAL cursor ripples ───────────
// Architecture:
//   1. Off-screen 2D canvas (512×512) acts as the distortion map
//   2. onPointerMove over water → R3F auto-raycasts and gives `e.uv`
//      (normalized hit coords) → spawn a ripple
//   3. Each frame: age ripples, redraw canvas with expanding rings,
//      mark CanvasTexture for upload
//   4. MeshReflectorMaterial samples that map via `distortionMap` and
//      warps the reflection sampling locally
//
// Texture is created in a state-managed way so React handles the prop
// binding cleanly (avoids the "first render has no map" timing issues
// you get from setting it imperatively on a ref).

type Ripple = { x: number; y: number; age: number };

const MAX_RIPPLES = 16;
const RIPPLE_LIFETIME = 2.6;
const RIPPLE_EXPAND_SPEED = 0.32;
const RIPPLE_THROTTLE_MS = 55;
const CANVAS_SIZE = 512;

export default function Water() {
  const ripples = useRef<Ripple[]>([]);
  const lastAddRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Texture lives in state so the MeshReflectorMaterial gets it as a normal
  // prop the moment it's ready. Initial render: undefined (material has no
  // distortion map → that's fine, behaves as if distortion=0). Once ready,
  // re-render hooks the texture in.
  const [distortionTexture, setDistortionTexture] = useState<CanvasTexture | undefined>(undefined);

  // ── Setup off-screen canvas + texture (once on mount) ──
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    canvasRef.current = canvas;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgb(128, 128, 128)';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }

    const tex = new CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = RepeatWrapping;
    setDistortionTexture(tex);

    return () => {
      tex.dispose();
    };
  }, []);

  // ── Per-frame: age ripples + redraw canvas + flag texture for upload ──
  useFrame((_, delta) => {
    const canvas = canvasRef.current;
    if (!canvas || !distortionTexture) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Age + cull expired ripples
    for (const r of ripples.current) r.age += delta;
    ripples.current = ripples.current.filter((r) => r.age < RIPPLE_LIFETIME);

    // Clear to neutral
    ctx.fillStyle = 'rgb(128, 128, 128)';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw each ripple as expanding bright ring with feathered edges
    for (const r of ripples.current) {
      const cx = r.x * CANVAS_SIZE;
      const cy = (1 - r.y) * CANVAS_SIZE;
      const t = r.age / RIPPLE_LIFETIME;
      const radius = t * RIPPLE_EXPAND_SPEED * CANVAS_SIZE;
      const alpha = (1 - t) * 0.85;
      const thickness = Math.max(6, 18 * (1 - t * 0.6));

      const inner = Math.max(0, radius - thickness);
      const outer = radius + thickness;

      const grad = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
      grad.addColorStop(0, 'rgba(128, 128, 128, 1)');
      grad.addColorStop(0.5, `rgba(255, 255, 255, ${alpha})`);
      grad.addColorStop(1, 'rgba(128, 128, 128, 1)');

      ctx.fillStyle = grad;
      const r2 = outer + 4;
      ctx.fillRect(cx - r2, cy - r2, r2 * 2, r2 * 2);
    }

    distortionTexture.needsUpdate = true;
  });

  // ── Spawn ripple on cursor over water ──
  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!e.uv) return;
    const now = performance.now();
    if (now - lastAddRef.current < RIPPLE_THROTTLE_MS) return;
    lastAddRef.current = now;

    ripples.current.push({ x: e.uv.x, y: e.uv.y, age: 0 });
    if (ripples.current.length > MAX_RIPPLES) ripples.current.shift();
  };

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      receiveShadow
      onPointerMove={handlePointerMove}
    >
      <planeGeometry args={[200, 200, 1, 1]} />
      <MeshReflectorMaterial
        resolution={2048}        // bumped — captures stars cleaner before blur eats them
        mirror={0.85}
        mixStrength={1.6}
        mixBlur={0.25}           // slightly less blur
        blur={[30, 15]}          // halved — small detail like stars survives now
        roughness={0.30}
        metalness={0.0}
        color="#050810"
        distortion={0.6}
        distortionMap={distortionTexture}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        depthScale={1.0}
      />
    </mesh>
  );
}
