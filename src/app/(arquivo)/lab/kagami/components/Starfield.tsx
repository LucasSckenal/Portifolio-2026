'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BufferGeometry,
  Float32BufferAttribute,
  ShaderMaterial,
  AdditiveBlending,
} from 'three';

// ── Starfield — custom procedural stars in the void ───────────
// Why custom (not HDRI background): we explicitly worked to remove the
// HDRI from the visible background to keep the pure void feel. Bringing
// the HDRI back would also re-introduce the horizon tint we polished out.
// A custom Points field gives us pure stars on pure void — exactly what
// the conceptual pivot wanted.
//
// Setup:
//   · ~600 stars distributed on a sphere of radius 80
//   · Mix of bright (10%) and faint (90%) — natural night sky histogram
//   · Per-star phase offset for asynchronous twinkle
//   · Additive blending so stars feel like emitted light, not painted dots
//   · Custom shader: circular point + soft falloff + sin-driven alpha twinkle

const STAR_COUNT = 650;  // 950 → 650 (perf, still feels dense)
const STAR_RADIUS = 80;

const vertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vTwinkle;
  varying vec3 vColor;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aSize * uPixelRatio * (220.0 / -mvPosition.z);

    // Twinkle: two stacked sines at different freqs = more organic than single sin
    float t1 = sin(uTime * 1.8 + aPhase);
    float t2 = sin(uTime * 0.7 + aPhase * 1.3);
    vTwinkle = 0.5 + 0.35 * t1 + 0.15 * t2;
    vColor = aColor;
  }
`;

const fragmentShader = /* glsl */ `
  varying float vTwinkle;
  varying vec3 vColor;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);

    // Soft round star with bright core, fading at edges
    float core = smoothstep(0.5, 0.0, dist);
    float bloom = smoothstep(0.5, 0.15, dist) * 0.5;
    float alpha = (core + bloom) * vTwinkle;
    if (alpha < 0.02) discard;

    gl_FragColor = vec4(vColor, alpha);
  }
`;

export default function Starfield() {
  const materialRef = useRef<ShaderMaterial>(null);

  // Geometry built once, deterministic random for stable layout
  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const positions = new Float32Array(STAR_COUNT * 3);
    const sizes = new Float32Array(STAR_COUNT);
    const phases = new Float32Array(STAR_COUNT);
    const colors = new Float32Array(STAR_COUNT * 3);

    for (let i = 0; i < STAR_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3 + 0] = STAR_RADIUS * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = STAR_RADIUS * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = STAR_RADIUS * Math.cos(phi);

      // 3-tier brightness — natural sky has many faint + some medium + a few bright
      const r = Math.random();
      if (r < 0.04) {
        sizes[i] = 6.0 + Math.random() * 3.0;        // "headline" stars: 6-9
      } else if (r < 0.14) {
        sizes[i] = 3.0 + Math.random() * 2.0;        // bright: 3-5
      } else {
        sizes[i] = 1.0 + Math.random() * 1.5;        // faint: 1-2.5
      }

      phases[i] = Math.random() * Math.PI * 2;

      // Color variation — stars in real sky aren't uniform white. Mostly
      // warm white, with some warmer (orange-ish) and cooler (blue-ish).
      const colorPick = Math.random();
      if (colorPick < 0.15) {
        // Warm/yellow star
        colors[i * 3 + 0] = 1.00;
        colors[i * 3 + 1] = 0.88;
        colors[i * 3 + 2] = 0.72;
      } else if (colorPick < 0.30) {
        // Cool/blue star
        colors[i * 3 + 0] = 0.78;
        colors[i * 3 + 1] = 0.88;
        colors[i * 3 + 2] = 1.00;
      } else {
        // Default warm-white
        colors[i * 3 + 0] = 0.96;
        colors[i * 3 + 1] = 0.94;
        colors[i * 3 + 2] = 0.87;
      }
    }

    geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geo.setAttribute('aSize', new Float32BufferAttribute(sizes, 1));
    geo.setAttribute('aPhase', new Float32BufferAttribute(phases, 1));
    geo.setAttribute('aColor', new Float32BufferAttribute(colors, 3));
    return geo;
  }, []);

  // Uniforms — uTime drives the twinkle, uPixelRatio keeps sizes consistent on retina
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: {
        value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1,
      },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return (
    // frustumCulled=false ensures the reflection camera doesn't skip stars
    // that happen to fall outside the main camera's frustum but ARE in the
    // reflection's frustum. Without this, water reflection misses many stars.
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        fog={false}
      />
    </points>
  );
}
