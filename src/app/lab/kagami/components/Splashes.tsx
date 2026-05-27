'use client';

import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  InstancedMesh,
  Object3D,
  InstancedBufferAttribute,
  ShaderMaterial,
  RingGeometry,
} from 'three';

// ── Splashes — visible ring impacts on water ───────────────
// Driven IMPERATIVELY now: parent (KagamiScene) gets a ref handle and
// calls `splashesRef.current.add(x, z)` whenever a rain drop hits the
// water. This makes splash positions correlate 1:1 with rain impacts
// (was random before — splashes spawned where no drop fell).
//
// Each splash: ring scales 0.06 → 0.45 over 0.85s, with shader-driven
// fade (quick rise, slow decay).

export type SplashesHandle = {
  add: (x: number, z: number) => void;
};

const MAX_SPLASHES = 36;
const SPLASH_LIFETIME = 0.85;
const SPLASH_MIN_RADIUS = 0.06;
const SPLASH_MAX_RADIUS = 0.45;

type SplashState = {
  active: boolean;
  age: number;
  x: number;
  z: number;
};

const vertexShader = /* glsl */ `
  attribute float aLifetime;
  varying float vLifetime;

  void main() {
    vLifetime = aLifetime;
    vec4 mvPosition = instanceMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  varying float vLifetime;

  void main() {
    float rise = smoothstep(0.0, 0.15, vLifetime);
    float decay = 1.0 - smoothstep(0.3, 1.0, vLifetime);
    float alpha = rise * decay * 0.55;

    if (alpha < 0.01) discard;

    vec3 color = vec3(0.78, 0.86, 0.95);
    gl_FragColor = vec4(color, alpha);
  }
`;

const Splashes = forwardRef<SplashesHandle>((_, ref) => {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  const splashes = useRef<SplashState[]>(
    Array.from({ length: MAX_SPLASHES }, () => ({
      active: false,
      age: 0,
      x: 0,
      z: 0,
    }))
  );

  const lifetimeAttr = useMemo(() => {
    const arr = new Float32Array(MAX_SPLASHES);
    return new InstancedBufferAttribute(arr, 1);
  }, []);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        fog: false,
      }),
    []
  );

  const geometry = useMemo(() => {
    const geo = new RingGeometry(0.85, 1.0, 32);
    geo.setAttribute('aLifetime', lifetimeAttr);
    return geo;
  }, [lifetimeAttr]);

  const findDeadSlot = (): number => {
    for (let i = 0; i < MAX_SPLASHES; i++) {
      if (!splashes.current[i].active) return i;
    }
    return -1;
  };

  // Expose imperative API to parent
  useImperativeHandle(
    ref,
    () => ({
      add: (x: number, z: number) => {
        const idx = findDeadSlot();
        if (idx === -1) return; // pool full — skip
        splashes.current[idx] = { active: true, age: 0, x, z };
      },
    }),
    []
  );

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const dt = Math.min(delta, 0.05);

    splashes.current.forEach((s, i) => {
      if (s.active) {
        s.age += dt;
        if (s.age >= SPLASH_LIFETIME) {
          s.active = false;
          dummy.position.set(0, -1000, 0);
          dummy.scale.setScalar(0);
          dummy.rotation.set(-Math.PI / 2, 0, 0);
          dummy.updateMatrix();
          meshRef.current!.setMatrixAt(i, dummy.matrix);
          lifetimeAttr.array[i] = 1.0;
          return;
        }

        const t = s.age / SPLASH_LIFETIME;
        const radius =
          SPLASH_MIN_RADIUS + (SPLASH_MAX_RADIUS - SPLASH_MIN_RADIUS) * t;

        dummy.position.set(s.x, 0.015, s.z);
        dummy.rotation.set(-Math.PI / 2, 0, 0);
        dummy.scale.setScalar(radius);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
        lifetimeAttr.array[i] = t;
      } else {
        dummy.position.set(0, -1000, 0);
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
        lifetimeAttr.array[i] = 1.0;
      }
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    lifetimeAttr.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, MAX_SPLASHES]}
      frustumCulled={false}
    />
  );
});

Splashes.displayName = 'Splashes';
export default Splashes;
