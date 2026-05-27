'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sky } from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  HueSaturation,
  Vignette,
} from '@react-three/postprocessing';
import Pond from './components/Pond';
import Stones from './components/Stones';
import Leaves from './components/Leaves';
import Ishidoro from './components/Ishidoro';

// ── Niwa — daytime karesansui, companion to Kagami's night ────
// Where Kagami is cosmic-cold-infinite (torii in void at night with moon),
// Niwa is grounded-warm-intimate (pond garden at morning with sun).
//
// Both pieces share technical DNA but live in opposite atmospheric registers,
// so the Lab gallery reads as "two sides of the same day". Visitor sees
// Kagami and feels suspended in night-time; visits Niwa and feels grounded
// in golden hour morning. Each one strengthens the other by contrast.
//
// Composition:
//   · Sky        — drei's Hosek-Wilkie sky shader with low warm sun
//   · Stones     — same karesansui arrangement, but lit warm now
//   · Pond       — daytime water (lighter, more translucent, sky reflection)
//   · Leaves     — momiji drifting (warm red pops against blue water)
//
// No Starfield, no Moon — those are night-only props.

export default function NiwaScene() {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: false,
        toneMappingExposure: 1.0, // brighter than Kagami's 0.7 — daylight
      }}
      shadows
      camera={{ position: [3, 6, 7], fov: 42, near: 0.1, far: 1000 }}
      style={{ position: 'absolute', inset: 0 }}
    >
      {/* ── Atmospheric sky — drei's procedural Sky shader ── */}
      {/*
        Sun positioned low in the sky for that "early morning" Japanese
        garden feel — soft, slanted light. Turbidity tuned higher so the
        sky has slight haze (not crystal-clear summer noon).
          · sunPosition  — direction the sun is "from" (large radius so it
                           reads as distant)
          · turbidity    — atmospheric haze (higher = mistier)
          · rayleigh     — blue scattering (higher = bluer sky)
          · mieCoefficient — warm scattering near sun
      */}
      <Sky
        distance={450000}
        sunPosition={[15, 3, -8]}
        turbidity={6}
        rayleigh={2}
        mieCoefficient={0.018}
        mieDirectionalG={0.8}
        inclination={0.45}
        azimuth={0.25}
      />

      {/* ── Lighting — warm sun + cool sky bounce ── */}
      {/*
        Strong warm directional matches the Sky's sun position. Hemisphere
        bounces cool sky-blue from above + warm ground-reflected from below.
      */}
      <directionalLight
        position={[15, 12, -8]}
        intensity={2.8}
        color="#FFE5B0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0005}
      />
      <ambientLight intensity={0.35} color="#D0E0F0" />
      <hemisphereLight args={['#B0D0F0', '#5C4A38', 0.6]} />

      {/* ── Geometry ── */}
      <Suspense fallback={null}>
        <Pond />
        <Stones />
        {/*
          Ishidōrō — back-left position so it doesn't compete with the
          hero stone (foreground-right). Asymmetric balance follows the
          same karesansui principle as the stone arrangement: opposite
          quadrants for visual tension.
        */}
        <Ishidoro position={[-2.5, 0, -1.8]} rotation={[0, 0.4, 0]} scale={1.0} />
        <Leaves />
      </Suspense>

      {/* ── Postprocessing — gentler than Kagami's heavy night grade ── */}
      <EffectComposer>
        {/* Bloom on the sun + any specular highlights on water */}
        <Bloom
          intensity={0.4}
          luminanceThreshold={0.9}
          luminanceSmoothing={0.4}
          mipmapBlur
        />
        {/* Slight saturation boost — daytime wants warm, not desat */}
        <HueSaturation saturation={0.08} />
        {/* Very subtle vignette — just enough to focus, not darken */}
        <Vignette eskil={false} offset={0.4} darkness={0.35} />
      </EffectComposer>

      {/* ── Camera + controls ── */}
      <PerspectiveCamera makeDefault position={[3, 6, 7]} fov={42} />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={5}
        maxDistance={15}
        minPolarAngle={0.3}
        maxPolarAngle={1.1}
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.06}
      />
    </Canvas>
  );
}
