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

const STAR_COUNT = 600;
const STAR_RADIUS = 80;

const vertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vTwinkle;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size in screen pixels, falls off with distance
    gl_PointSize = aSize * uPixelRatio * (220.0 / -mvPosition.z);

    // Twinkle: subtle alpha modulation, each star with its own phase
    vTwinkle = 0.55 + 0.45 * sin(uTime * 1.8 + aPhase);
  }
`;

const fragmentShader = /* glsl */ `
  varying float vTwinkle;

  void main() {
    // gl_PointCoord is 0..1 across the point sprite
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);

    // Circular falloff — soft round star instead of square
    float alpha = smoothstep(0.5, 0.0, dist) * vTwinkle;
    if (alpha < 0.02) discard;

    // Slight warm-white tint — feels like real starlight
    vec3 color = vec3(0.96, 0.94, 0.87);

    gl_FragColor = vec4(color, alpha);
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

    for (let i = 0; i < STAR_COUNT; i++) {
      // Even spherical distribution (random theta + acos-mapped phi)
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3 + 0] = STAR_RADIUS * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = STAR_RADIUS * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = STAR_RADIUS * Math.cos(phi);

      // 10% bright stars, 90% faint — natural night sky distribution.
      // Sizes pumped vs first pass — needed to survive the water reflector's
      // downsampling + blur and remain visible as reflected stars on water.
      sizes[i] =
        Math.random() < 0.10
          ? 3.5 + Math.random() * 2.5    // bright: 3.5-6
          : 1.2 + Math.random() * 1.5;   // faint: 1.2-2.7

      phases[i] = Math.random() * Math.PI * 2;
    }

    geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geo.setAttribute('aSize', new Float32BufferAttribute(sizes, 1));
    geo.setAttribute('aPhase', new Float32BufferAttribute(phases, 1));
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
