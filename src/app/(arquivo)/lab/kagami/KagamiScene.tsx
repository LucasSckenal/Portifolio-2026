'use client';

import { Suspense, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Sparkles } from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  BrightnessContrast,
  HueSaturation,
  Vignette,
} from '@react-three/postprocessing';
import Torii from './components/Torii';
import Water from './components/Water';
import Lanterns from './components/Lanterns';
import Moon from './components/Moon';
import Starfield from './components/Starfield';
import Rain from './components/Rain';
import Splashes, { type SplashesHandle } from './components/Splashes';

// ── Kagami — scene root ───────────────────────────────
// Composition:
//   · Camera   — slightly elevated, looking at torii base
//   · Sky      — drei Environment with a sunset HDRI preset (swap for
//                custom HDR once Lucas drops it at /lab/kagami/skybox.hdr)
//   · Water    — large reflective plane at y=0
//   · Torii    — placeholder vermillion gate, will be replaced by .glb
//   · Lighting — warm directional (sun) + cool ambient (sky bounce)
//   · Controls — OrbitControls (drag to rotate); locked vertical so user
//                can't flip the world upside-down
//
// Performance defaults:
//   · dpr clamped to 2 — avoids 4K-retina fps drops without sacrificing crispness
//   · gl.antialias true — clean edges on the torii silhouette
//   · gl.toneMapping ACESFilmicToneMapping — cinematic warmth out of the box
//   · shadows enabled — torii casts soft shadow onto water for depth cue

export default function KagamiScene() {
  // Ref to Splashes component so Rain can fire impacts at exact positions
  // where drops cross the water plane. Routed via stable useCallback so
  // Rain doesn't re-mount each render.
  const splashesRef = useRef<SplashesHandle>(null);
  const handleRainImpact = useCallback((x: number, z: number) => {
    splashesRef.current?.add(x, z);
  }, []);

  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        alpha: false,
        // Bumped up from 0.7 → the torii needs more visibility
        toneMappingExposure: 0.9,
      }}
      shadows
      camera={{ position: [0, 3, 14], fov: 42, near: 0.1, far: 200 }}
      style={{ position: 'absolute', inset: 0 }}
    >
      {/*
        Scene background = deep navy void. Same color as the fog and
        baseline water tone, so the torii appears suspended in an infinite
        dark space with no horizon, no sky boundary, no edge anywhere.
        "Walls" of the scene are simply this color, in every direction.
      */}
      <color attach="background" args={['#070A14']} />

      {/*
        Fog matched to the void background — water fades into the void as
        it recedes. Every distant pixel is the same color regardless of
        whether it's "water" or "sky" or "nothing", so there's nothing to
        distinguish into a horizon line.
      */}
      <fog attach="fog" args={['#070A14', 10, 28]} />
      {/* ── Lighting — Night mode, pulled down for true night feel ── */}
      {/*
        Lights were tuned for "cinematic moon-as-key-light". Now we pull
        them down significantly so the postprocessing pass (below) can push
        the scene into proper midnight register without crushing details.
        The lanterns become the dominant warm light by contrast.
      */}
      <ambientLight intensity={0.12} color="#3A4A65" />
      <directionalLight
        position={[3, 12, 4]}
        intensity={1.3}
        color="#A6B8CC"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0005}
      />
      <hemisphereLight args={['#2A3550', '#06070F', 0.4]} />

      {/* ── Sky / environment — your HDRI ── */}
      {/*
        Source: Poly Haven · qwantani_moon_noon_puresky (CC0).
        Minimal props — drei handles the HDRI loading + background skydome.
        Suspense fallback is `null` so we don't get a bright→dark flash.
      */}
      <Suspense fallback={null}>
        {/*
          Environment WITHOUT `background` prop — the HDRI still contributes
          its lighting (moonlight tone, sky bounce direction) to the scene,
          but never renders as a visible skydome. The infinite void void
          background takes over visually; the moonlight effect persists
          invisibly in how the torii is lit. Best of both worlds.
        */}
        <Environment files="/lab/kagami/skybox.hdr" />
      </Suspense>

      {/* ── Geometry ── */}
      <Starfield />
      <Moon />
      <Water />
      <Torii position={[0, 0, 0]} />

      {/*
        Lanterns — only warm light source in the scene. Hang from the
        kasagi (top beam) ends. They stay correctly positioned regardless
        of whether Torii.tsx is the placeholder or the real .glb, because
        they reference world coordinates that match the torii dimensions.
      */}
      <Lanterns />

      {/*
        Fireflies — drei's GPU-instanced Sparkles. Warm color matches the
        lanterns, drifting around the torii at slow speed. Adds life to the
        void without competing with the focal subject.
          · count   — total particles (more = denser swarm)
          · scale   — volume the particles occupy [width, height, depth]
          · size    — pixel size of each particle
          · speed   — drift velocity
          · noise   — randomness of motion (0 = straight lines, 1 = wandering)
      */}
      <Sparkles
        count={50}                  // 80 → 50 (still feels alive, less GPU)
        scale={[22, 10, 22]}
        size={2.2}
        speed={0.25}
        color="#FFB070"
        position={[0, 4, 0]}
        noise={0.8}
        opacity={0.55}
      />

      {/*
        Rain → onImpact → Splashes. The drop's actual (x, z) at the
        moment it crosses y=0 is forwarded to the Splashes component,
        which spawns a ring at exactly that position. No more random
        splashes appearing where no drop fell.
      */}
      <Rain onImpact={handleRainImpact} />
      <Splashes ref={splashesRef} />

      {/* ── Postprocessing — the night atmosphere lives here ── */}
      {/*
        Stack runs in order (each effect feeds the next):
          1. Bloom        — lanterns and any bright HDRI moon pixel glow
          2. Brightness/  — pulls overall brightness down + pushes contrast
             Contrast       up. This is what turns "dusk" into "night"
          3. HueSaturation — slight desaturation = restrained, cinematic
          4. Vignette     — dark edges focus attention on the torii
        Numbers are tuned for the Kagami composition. If too dark, raise
        BrightnessContrast `brightness` toward 0; if too washed-out, lower it.
      */}
      <EffectComposer>
        {/*
          Bloom only on the brightest pixels (lantern centers). Threshold
          raised even higher so the moon doesn't blow out into a giant
          halo — we want it to read as a distant disc, not a focal star.
        */}
        <Bloom
          intensity={0.35}
          luminanceThreshold={0.95}
          luminanceSmoothing={0.4}
          mipmapBlur
        />
        {/*
          BrightnessContrast removed — it was the main culprit pushing
          reflective pixels into pure white. The toneMappingExposure on
          the Canvas now handles overall darkness more cleanly.
        */}
        <HueSaturation saturation={-0.1} />
        <Vignette eskil={false} offset={0.3} darkness={0.65} />
      </EffectComposer>

      {/* ── Camera + controls ── */}
      {/*
        Camera framed slightly further back and higher than before, giving
        more sky in the default composition. Target is at the torii's
        upper-middle so the user instinctively looks toward the gate's frame.

        Polar angle range opened up:
          minPolarAngle = 0.15  → can tilt almost straight down to look at water
          maxPolarAngle = 1.40  → can lower camera enough to look upward at sky
        Restricted enough to never go below the waterline.
      */}
      <PerspectiveCamera makeDefault position={[0, 3, 14]} fov={42} />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={7}
        maxDistance={28}
        minPolarAngle={0.15}
        maxPolarAngle={1.40}
        target={[0, 2.5, 0]}
        enableDamping
        dampingFactor={0.06}
      />
    </Canvas>
  );
}
