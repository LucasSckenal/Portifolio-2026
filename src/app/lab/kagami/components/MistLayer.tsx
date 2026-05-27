'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
  DoubleSide,
  NormalBlending,
} from 'three';

// ── MistLayer — low ground mist for atmospheric depth ─────────
// A thin horizontal plane positioned just above the water surface, with
// a custom shader that fades from semi-opaque blue at the bottom to
// transparent at the top. Slowly drifts via UV offset for life.
//
// Combined with the void background + fog, this creates a sense of
// "ground hugging mist" — the kind you see in moonlit Japanese gardens
// at dawn or after rain. Adds a depth layer between water and sky.

const MIST_SIZE = 60;
const MIST_HEIGHT = 1.5;          // mist plane sits this high above water
const MIST_RADIUS = 30;           // how far it spreads horizontally

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying float vDistance;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    // Distance from world origin (XZ only) — used to fade mist toward edges
    vDistance = length(worldPos.xz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vDistance;

  // Hash + smooth value noise for cloud-like variation
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i),                hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  void main() {
    // Slowly drifting noise — gives mist subtle movement
    vec2 driftUv = vUv * 4.0 + vec2(uTime * 0.015, uTime * 0.008);
    float n = noise(driftUv) * 0.6 + noise(driftUv * 2.0) * 0.4;

    // Cool blue mist tone
    vec3 mistColor = vec3(0.15, 0.20, 0.30);

    // Fade alpha: less near the center, more at distance (mist gathers far)
    float distFade = smoothstep(3.0, 28.0, vDistance);
    float alpha = n * distFade * 0.42;

    if (alpha < 0.02) discard;
    gl_FragColor = vec4(mistColor, alpha);
  }
`;

export default function MistLayer() {
  const meshRef = useRef<Mesh>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), []);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        blending: NormalBlending,
        fog: false,
      }),
    [uniforms]
  );

  const geometry = useMemo(() => new PlaneGeometry(MIST_SIZE, MIST_SIZE, 1, 1), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, MIST_HEIGHT, 0]}
    />
  );
}
