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
import Tree from './components/Tree';
import FallingPetals from './components/FallingPetals';

// ── Niwa — lone tree on an island, sheds petals onto still water ──────
// Pivoted from karesansui rock garden → single-tree island composition.
// Inspired by Studio Ghibli painted moments: solitary sakura/momiji-style
// tree on a tiny earth island in the middle of a misty mountain lake.
//
// Composition:
//   · Sky        — drei's procedural Hosek-Wilkie with low warm sun (golden hour)
//   · Pond       — translucent water reflecting sky + tree canopy
//   · Tree       — curved trunk + 400 leaf canopy + island base
//   · Falling petals — shed from canopy, settle on water, drift, respawn
//   · Leaves     — already-floating leaves (added density, organic feel)
//
// No stones, no lantern — the tree is the FULL subject. Karesansui rocks
// would compete; here the silence around the tree IS the composition.

export default function NiwaScene() {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: false,
        toneMappingExposure: 1.0,
      }}
      shadows
      camera={{ position: [4, 3.5, 6], fov: 40, near: 0.1, far: 1000 }}
      style={{ position: 'absolute', inset: 0 }}
    >
      {/* ── Atmospheric sky ── */}
      <Sky
        distance={450000}
        sunPosition={[15, 3, -8]}
        turbidity={7}
        rayleigh={2.5}
        mieCoefficient={0.022}
        mieDirectionalG={0.82}
      />

      {/* ── Lighting — warm golden-hour sun + cool sky bounce ── */}
      <directionalLight
        position={[15, 12, -8]}
        intensity={2.6}
        color="#FFD8A8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0005}
      />
      <ambientLight intensity={0.4} color="#D8E0F0" />
      <hemisphereLight args={['#C0D8F0', '#5C4A38', 0.7]} />

      {/* ── Geometry ── */}
      {/*
        Removed standalone <Leaves /> — was spawning random sprites all over
        the pond with no visible source. FallingPetals replaces it (petals
        come FROM the tree, fall, settle on water, drift) which is
        narratively coherent. Same visual density, organic origin.
      */}
      <Suspense fallback={null}>
        <Pond />
        <Tree />
        <FallingPetals />
      </Suspense>

      {/* ── Postprocessing ── */}
      <EffectComposer>
        <Bloom
          intensity={0.45}
          luminanceThreshold={0.85}
          luminanceSmoothing={0.4}
          mipmapBlur
        />
        <HueSaturation saturation={0.10} />
        <Vignette eskil={false} offset={0.4} darkness={0.4} />
      </EffectComposer>

      {/* ── Camera + controls ── */}
      {/*
        Camera tightened — was too pulled back, tree felt small in empty
        pond. Now framed close-medium, target slightly higher to put tree
        canopy near upper third of viewport (rule of thirds composition).
      */}
      <PerspectiveCamera makeDefault position={[2.8, 2.5, 4.5]} fov={42} />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3.5}
        maxDistance={10}
        minPolarAngle={0.5}
        maxPolarAngle={1.3}
        target={[0, 1.0, 0]} // look at canopy lower-third, not base
        enableDamping
        dampingFactor={0.06}
      />
    </Canvas>
  );
}
