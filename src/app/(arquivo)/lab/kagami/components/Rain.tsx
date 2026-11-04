'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BufferGeometry,
  Float32BufferAttribute,
  LineSegments,
  NormalBlending,
} from 'three';

// ── Rain — cinematic streaks with wind + variation ────────────
// Realism upgrades:
//   1. Wind tilt — top of streak offset diagonally, so drops lean instead
//      of falling perfectly vertical. Consistent direction = "wind".
//   2. Per-drop speed — each streak has its own fall velocity (16-32 units/s)
//      so the rain doesn't move as a uniform sheet.
//   3. Length variation — 3 tiers (small mist, medium drops, big streaks)
//      for visual depth and density variety.
//   4. Per-drop intensity — color brightness varies per streak so some
//      drops "headline" while others recede into atmosphere.
//
// Cinematic palette (cool blue-grey, NormalBlending, opacity 0.6) keeps
// rain feeling like rain — not white spray paint.

type RainProps = {
  onImpact?: (x: number, z: number) => void;
};

const RAIN_COUNT = 500;
const RAIN_RADIUS = 16;
const RAIN_HEIGHT_TOP = 18;

// Wind direction (top vertex offset per unit of streak length).
// Positive X = wind pushing top of streak to the right → drops lean toward
// bottom-left as they fall. Small values keep it subtle (real rain isn't
// at a 45° angle unless there's a storm).
const WIND_TILT_X = 0.18;
const WIND_TILT_Z = 0.06;

// Speed range — varied per drop (some drops "rush", others linger)
const SPEED_MIN = 16;
const SPEED_MAX = 32;

const SPLASH_TRIGGER_CHANCE = 0.05;

// Cool cinematic palette (under 1.0 so it never burns white)
const TOP_COLOR = [0.06, 0.09, 0.13] as const;
const BOTTOM_COLOR = [0.42, 0.55, 0.72] as const;

// Returns a streak length based on a 3-tier distribution:
//   20% small — fast misty hints
//   60% medium — normal drops
//   20% large — long dramatic streaks
function pickStreakLength(): number {
  const r = Math.random();
  if (r < 0.2) return 0.15 + Math.random() * 0.20;   // small: 0.15-0.35
  if (r < 0.8) return 0.40 + Math.random() * 0.45;   // medium: 0.40-0.85
  return 0.90 + Math.random() * 0.50;                // large: 0.90-1.40
}

export default function Rain({ onImpact }: RainProps) {
  const ref = useRef<LineSegments>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(RAIN_COUNT * 6);
    const colors = new Float32Array(RAIN_COUNT * 6);
    const lengths = new Float32Array(RAIN_COUNT);
    const speeds = new Float32Array(RAIN_COUNT);

    for (let i = 0; i < RAIN_COUNT; i++) {
      const x = (Math.random() - 0.5) * RAIN_RADIUS * 2;
      const z = (Math.random() - 0.5) * RAIN_RADIUS * 2;
      const y = Math.random() * RAIN_HEIGHT_TOP;
      const streakLen = pickStreakLength();
      const speed = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
      const intensity = 0.55 + Math.random() * 0.45;

      lengths[i] = streakLen;
      speeds[i] = speed;

      // Top vertex — offset by wind tilt for the diagonal lean
      positions[i * 6 + 0] = x + streakLen * WIND_TILT_X;
      positions[i * 6 + 1] = y + streakLen;
      positions[i * 6 + 2] = z + streakLen * WIND_TILT_Z;
      colors[i * 6 + 0] = TOP_COLOR[0] * intensity;
      colors[i * 6 + 1] = TOP_COLOR[1] * intensity;
      colors[i * 6 + 2] = TOP_COLOR[2] * intensity;

      // Bottom vertex — no offset (this is the "drop head")
      positions[i * 6 + 3] = x;
      positions[i * 6 + 4] = y;
      positions[i * 6 + 5] = z;
      colors[i * 6 + 3] = BOTTOM_COLOR[0] * intensity;
      colors[i * 6 + 4] = BOTTOM_COLOR[1] * intensity;
      colors[i * 6 + 5] = BOTTOM_COLOR[2] * intensity;
    }

    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new Float32BufferAttribute(colors, 3));
    // Persist per-drop data on the geometry for respawn logic
    (geo as BufferGeometry & {
      __lengths?: Float32Array;
      __speeds?: Float32Array;
    }).__lengths = lengths;
    (geo as BufferGeometry & {
      __lengths?: Float32Array;
      __speeds?: Float32Array;
    }).__speeds = speeds;
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const dt = Math.min(delta, 0.05);
    const positions = ref.current.geometry.attributes.position.array as Float32Array;
    const lengths = (ref.current.geometry as BufferGeometry & { __lengths?: Float32Array }).__lengths;
    const speeds = (ref.current.geometry as BufferGeometry & { __speeds?: Float32Array }).__speeds;

    for (let i = 0; i < RAIN_COUNT; i++) {
      // Per-drop fall speed → uniform sheet effect broken
      const fall = (speeds ? speeds[i] : 22) * dt;
      positions[i * 6 + 1] -= fall;
      positions[i * 6 + 4] -= fall;

      if (positions[i * 6 + 4] < 0) {
        // Hit water — maybe trigger a splash at this XZ
        if (onImpact && Math.random() < SPLASH_TRIGGER_CHANCE) {
          onImpact(positions[i * 6 + 0], positions[i * 6 + 2]);
        }

        // Respawn at top — re-randomize position, keep length + speed identity
        const x = (Math.random() - 0.5) * RAIN_RADIUS * 2;
        const z = (Math.random() - 0.5) * RAIN_RADIUS * 2;
        const streakLen = lengths ? lengths[i] : 0.6;

        // Top — wind-tilted
        positions[i * 6 + 0] = x + streakLen * WIND_TILT_X;
        positions[i * 6 + 1] = RAIN_HEIGHT_TOP + streakLen;
        positions[i * 6 + 2] = z + streakLen * WIND_TILT_Z;
        // Bottom — base position
        positions[i * 6 + 3] = x;
        positions[i * 6 + 4] = RAIN_HEIGHT_TOP;
        positions[i * 6 + 5] = z;
      }
    }

    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <lineSegments ref={ref} geometry={geometry} frustumCulled={false}>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.6}
        blending={NormalBlending}
        fog={false}
      />
    </lineSegments>
  );
}
