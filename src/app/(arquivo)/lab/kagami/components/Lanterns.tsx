'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { PointLight, Mesh, MeshStandardMaterial } from 'three';

// ── Lanterns — chōchin hanging from the torii's kasagi ──────
// Two warm paper lanterns hang from the ends of the top beam, the ONLY
// warm light source in an otherwise cool moonlit scene. Cinematic contrast.
//
// Live independently of Torii.tsx so they survive when the placeholder
// geometry is swapped for the real .glb model — both reference the same
// world coordinates that match a standard myojin-style torii.
//
// Each lantern has:
//   · Sphere mesh with warm emissive material (the lantern body)
//   · Point light below the mesh (the light it casts on water/torii)
//   · Subtle flicker animation (sin noise on light intensity)
//
// World positions assume the torii spans x=[-2.8, 2.8] with kasagi at y=5.0,
// matching Torii.tsx placeholder dimensions. When the Blender model lands,
// adjust x values if needed.

const LANTERN_Y = 2.8;       // hanging position — properly below kasagi, in the gate opening
const LANTERN_X = 2.8;       // distance from torii center — hangs OUTSIDE the pillars, under kasagi overhang
const STRING_TOP_Y = 4.3;    // attaches under the kasagi underside

// Warm tones matching the lantern-warm accent (--accent-night #E89A4F)
const LANTERN_BODY = '#FFD9A0';      // slightly warmer base
const LANTERN_EMISSIVE = '#FF7A2A';  // saturated orange — pops against blue scene
const LANTERN_LIGHT = '#FFA050';     // warm spill light

function Lantern({ x, phase }: { x: number; phase: number }) {
  const bodyRef = useRef<Mesh>(null);
  const lightRef = useRef<PointLight>(null);

  // Subtle flicker — sin wave at slightly different phase per lantern so
  // they don't pulse in unison (would look mechanical). Real flames flicker
  // around 5-10Hz randomly; we approximate with two stacked sines.
  useFrame(({ clock }) => {
    if (!lightRef.current || !bodyRef.current) return;
    const t = clock.getElapsedTime();
    const flicker =
      1 +
      Math.sin(t * 7 + phase) * 0.06 +
      Math.sin(t * 13 + phase * 2) * 0.04;
    lightRef.current.intensity = 12 * flicker;

    // Body emissive intensity follows the same flicker
    const mat = bodyRef.current.material as MeshStandardMaterial;
    if ('emissiveIntensity' in mat) {
      mat.emissiveIntensity = 2.8 * flicker;
    }
  });

  return (
    <group position={[x, 0, 0]}>
      {/* String — thin dark line from kasagi down to lantern top */}
      <mesh position={[0, (STRING_TOP_Y + LANTERN_Y + 0.15) / 2, 0]}>
        <cylinderGeometry args={[0.012, 0.012, STRING_TOP_Y - (LANTERN_Y + 0.15), 6]} />
        <meshStandardMaterial color="#1A1A1A" roughness={1} />
      </mesh>

      {/* Lantern body — paper sphere with warm emissive */}
      <mesh ref={bodyRef} position={[0, LANTERN_Y, 0]} castShadow>
        <sphereGeometry args={[0.28, 20, 16]} />
        <meshStandardMaterial
          color={LANTERN_BODY}
          emissive={LANTERN_EMISSIVE}
          emissiveIntensity={2.8}
          roughness={0.6}
          metalness={0}
          // toneMapped left true (default) — was bypassing tonemap and
          // creating runaway brightness when bloom amplified the reflection
        />
      </mesh>

      {/* Top cap — small dark disk where the string attaches */}
      <mesh position={[0, LANTERN_Y + 0.22, 0]}>
        <cylinderGeometry args={[0.08, 0.10, 0.06, 12]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.9} />
      </mesh>

      {/* Bottom cap */}
      <mesh position={[0, LANTERN_Y - 0.22, 0]}>
        <cylinderGeometry args={[0.10, 0.08, 0.06, 12]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.9} />
      </mesh>

      {/* Point light — emits warm glow on torii + water below */}
      <pointLight
        ref={lightRef}
        position={[0, LANTERN_Y - 0.05, 0]}
        color={LANTERN_LIGHT}
        intensity={18}
        distance={16}
        decay={1.6}
        castShadow={false}
      />
    </group>
  );
}

export default function Lanterns() {
  return (
    <>
      <Lantern x={-LANTERN_X} phase={0} />
      <Lantern x={LANTERN_X}  phase={Math.PI * 0.7} />
    </>
  );
}
