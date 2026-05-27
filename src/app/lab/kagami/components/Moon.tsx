'use client';

import { useMemo } from 'react';
import { Color, Vector3 } from 'three';

// ── Moon — half-moon with custom phase shader ─────────────────
// Plain sphere = boring disc. Real moon has a terminator (the line where
// the lit side meets the shadow side). We fake that with a small GLSL
// shader: each pixel's world-space normal is dotted with a fixed sun
// direction, smoothstepped into a lit/dark mix. Result: a beautiful
// half-moon with a soft terminator, regardless of camera angle.
//
// Tuning:
//   · SUN_DIRECTION — where the "sun" lights from (in world space).
//                     [1, 0.4, 0.6] = from front-right-above, gives a
//                     waxing-gibbous look (most of moon lit, right side bright).
//   · TERMINATOR_SHARPNESS — smoothstep edges. Tighter = harder shadow.
//   · LIT_COLOR / DARK_COLOR — moon palette.

const MOON_POSITION: [number, number, number] = [-9, 11, -38];
const MOON_RADIUS = 2.2;

// Sun direction in world space (will be normalized). The moon's normal
// dotted with this gives the lighting per pixel.
const SUN_DIRECTION: [number, number, number] = [1, 0.4, 0.6];

// Vertex shader: pass world-space normal + UV for surface noise sampling
const vertexShader = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec2 vUv;

  void main() {
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader: phase shading + procedural surface noise (craters/mare).
// Multi-octave value noise gives the lit hemisphere its mottled texture
// without needing a baked texture file. Tuned subtle — visible but not busy.
const fragmentShader = /* glsl */ `
  uniform vec3 uSunDirection;
  uniform vec3 uLitColor;
  uniform vec3 uDarkColor;
  varying vec3 vWorldNormal;
  varying vec2 vUv;

  // Hash + smooth value noise — cheap, no textures needed
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

  // Fractal Brownian Motion — stack noise at different scales for organic look
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // ── Phase shading (terminator) ──
    float NdotL = dot(normalize(vWorldNormal), normalize(uSunDirection));
    float intensity = smoothstep(-0.15, 0.35, NdotL);

    // ── Procedural surface ──
    // Big-scale noise → mare-like dark patches (lunar seas)
    float mare = fbm(vUv * 4.0);
    float mareMask = smoothstep(0.35, 0.55, mare); // only darker patches

    // Fine-scale noise → crater texture, surface variation
    float craters = fbm(vUv * 22.0);
    float crater_variation = (craters - 0.5) * 0.3; // ±15% brightness shift

    // Combine: lit color, darkened in mare regions, modulated by crater noise
    vec3 surfaceColor = mix(uLitColor, uLitColor * 0.55, mareMask * 0.7);
    surfaceColor *= (1.0 + crater_variation);

    // ── Final composition ──
    vec3 color = mix(uDarkColor, surfaceColor, intensity);

    // Warm tint at the terminator — fakes atmospheric scattering on a moon surface
    float edge = smoothstep(0.0, 0.15, abs(NdotL - 0.1));
    color = mix(vec3(0.85, 0.78, 0.68) * intensity * 0.7, color, edge);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function Moon() {
  // useMemo so the uniforms object is stable across re-renders (otherwise
  // shader recompiles each frame).
  const uniforms = useMemo(
    () => ({
      uSunDirection: { value: new Vector3(...SUN_DIRECTION).normalize() },
      uLitColor: { value: new Color('#F5EFDC') },  // warm white moon-lit
      uDarkColor: { value: new Color('#070A14') }, // EXACT void background match → shadow side invisible
    }),
    []
  );

  return (
    <group position={MOON_POSITION}>
      {/*
        Moon body alone — no halo sphere. The halo was creating a dark
        ring artifact due to alpha-blending with the void background.
        The phase shader gives the moon its identity without help.
      */}
      <mesh>
        <sphereGeometry args={[MOON_RADIUS, 96, 96]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          fog={false}
        />
      </mesh>
    </group>
  );
}
