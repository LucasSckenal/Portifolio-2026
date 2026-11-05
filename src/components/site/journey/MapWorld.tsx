'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import Player, { type Drive } from '../arena/Player';
import { ARRIVE, BOUNDS, NO_GEAR, ROAD, START, STOPS, STOP_AT, nearestRoad, siteOf } from './stops';

// The map: an overcast, low-poly countryside in greys. A road runs from the
// village up to the arena gate; each experience is a place beside it. The
// wanderer walks where you tap (or with WASD); the camera follows from above.

export const SKY = '#c9c9c4';
const SPEED = 4.4;

const flat = (color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.9, metalness: 0, ...extra });

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

export type Walker = { x: number; z: number; path: Array<{ x: number; z: number }>; keys: Set<string> };
export type MapCmd = { next: number; goto: number | null };

export default function MapWorld({
  drive,
  walker,
  cmd,
  visited,
  won,
  tall,
  reduced,
  onStop,
}: {
  drive: React.RefObject<Drive>;
  walker: React.RefObject<Walker>;
  cmd: React.RefObject<MapCmd>;
  visited: React.RefObject<Set<number>>;
  won: boolean;
  tall: boolean;
  reduced: boolean;
  onStop: (i: number | null) => void;
}) {
  const { camera } = useThree();
  const sun = useRef<THREE.DirectionalLight>(null);
  const look = useRef(new THREE.Vector3(START.x, 1, START.z - 3));
  const at = useRef<number | null>(null);
  const seen = useRef(0);
  const m = useMaterials();

  // keys: WASD / arrows walk
  useEffect(() => {
    const w = walker.current;
    const map: Record<string, string> = { w: 'u', arrowup: 'u', s: 'd', arrowdown: 'd', a: 'l', arrowleft: 'l', d: 'r', arrowright: 'r' };
    const down = (e: KeyboardEvent) => {
      const k = map[e.key.toLowerCase()];
      if (!k) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return;
      e.preventDefault();
      w.keys.add(k);
      w.path = [];
    };
    const up = (e: KeyboardEvent) => {
      const k = map[e.key.toLowerCase()];
      if (k) w.keys.delete(k);
    };
    const blur = () => w.keys.clear();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, [walker]);

  useFrame((_, raw) => {
    const dt = Math.min(raw, 1 / 20);
    const w = walker.current;
    const dv = drive.current;
    const c = cmd.current;

    // ── commands from the page: follow the road to the next stop, or to one ──
    if (c.next !== seen.current || c.goto !== null) {
      seen.current = c.next;
      let target = c.goto;
      c.goto = null;
      if (target === null) {
        // the first stop not yet visited, past the furthest one you've been to
        const far = Math.max(...Array.from(visited.current));
        target = Math.min(STOPS.length - 1, far + 1);
        for (let i = 1; i < STOPS.length; i++)
          if (!visited.current.has(i)) {
            target = i;
            break;
          }
      }
      const from = nearestRoad(w.x, w.z).i;
      const to = STOP_AT[target];
      const step = to >= from ? 3 : -3;
      const path: Array<{ x: number; z: number }> = [];
      for (let i = from; step > 0 ? i < to : i > to; i += step) path.push(ROAD[i]);
      path.push({ x: STOPS[target].x, z: STOPS[target].z });
      w.path = path;
      w.keys.clear();
    }

    // ── walking ──
    let dx = 0;
    let dz = 0;
    if (w.keys.size) {
      if (w.keys.has('u')) dz -= 1;
      if (w.keys.has('d')) dz += 1;
      if (w.keys.has('l')) dx -= 1;
      if (w.keys.has('r')) dx += 1;
    } else if (w.path.length) {
      const p = w.path[0];
      dx = p.x - w.x;
      dz = p.z - w.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.35) {
        w.path.shift();
        dx = dz = 0;
      }
    }
    const len = Math.hypot(dx, dz);
    let speed = 0;
    if (len > 0.001) {
      const v = Math.min(SPEED, w.path.length === 1 ? Math.max(1.4, len * 3) : SPEED);
      w.x += (dx / len) * v * dt;
      w.z += (dz / len) * v * dt;
      speed = v / SPEED;
      dv.yaw = Math.atan2(dx, dz);
    }
    w.x = THREE.MathUtils.clamp(w.x, -BOUNDS.x, BOUNDS.x);
    w.z = THREE.MathUtils.clamp(w.z, BOUNDS.zMin, BOUNDS.zMax);
    // buildings push you round them
    for (const [cx, cz, r] of COLLIDERS) {
      const ox = w.x - cx;
      const oz = w.z - cz;
      const d = Math.hypot(ox, oz);
      if (d < r && d > 0.0001) {
        w.x = cx + (ox / d) * r;
        w.z = cz + (oz / d) * r;
      }
    }
    dv.x = w.x;
    dv.z = w.z;
    dv.speed += (speed - dv.speed) * (1 - Math.exp(-dt * 10));
    dv.flash = Math.max(0, dv.flash - dt * 1.4);

    // ── arriving ──
    let here: number | null = null;
    STOPS.forEach((s, i) => {
      if (Math.hypot(s.x - w.x, s.z - w.z) < ARRIVE) here = i;
    });
    if (here !== at.current) {
      at.current = here;
      onStop(here);
    }

    // ── camera: above and behind, a little ahead of you ──
    const off = tall ? new THREE.Vector3(0, 15, 12) : new THREE.Vector3(0, 10.5, 11.5);
    // at a stop, frame the place too, not only him
    let fx = w.x;
    if (at.current !== null) fx += (siteOf(STOPS[at.current]).x - w.x) * (tall ? 0.55 : 0.3);
    const want = new THREE.Vector3(fx, 0, w.z).add(off);
    const k = reduced ? 1 : 1 - Math.exp(-dt * 3.2);
    camera.position.lerp(want, k);
    look.current.lerp(new THREE.Vector3(fx, 0.8, w.z + (tall ? 2.2 : -3.5)), k);
    camera.lookAt(look.current);

    // the sun's shadow box rides with you
    if (sun.current) {
      sun.current.position.set(w.x + 10, 22, w.z + 6);
      sun.current.target.position.set(w.x, 0, w.z);
      sun.current.target.updateMatrixWorld();
    }
  });

  const onGround = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const w = walker.current;
    w.keys.clear();
    w.path = [{ x: e.point.x, z: e.point.z }];
  };

  return (
    <>
      <color attach="background" args={[SKY]} />
      <fog attach="fog" args={[SKY, 26, 62]} />
      <hemisphereLight args={['#f4f4f0', '#6a6b6f', 1.15]} />
      <directionalLight
        ref={sun}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1536, 1536]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-bias={-0.0006}
        shadow-normalBias={0.03}
      />

      {/* ground: tap it to walk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -45]} receiveShadow onClick={onGround} material={m.ground}>
        <planeGeometry args={[150, 190]} />
      </mesh>
      <Road m={m} />
      <Nature m={m} />
      <Roadside m={m} />
      <Fluff walker={walker} />

      <Village m={m} won={won} />
      <Tower m={m} />
      <Camp m={m} />
      <Caravan m={m} />
      <Workshop m={m} walker={walker} />
      <Tavern m={m} />
      <ArenaGate m={m} />
      <Markers m={m} visited={visited} />

      <Player drive={drive} />
    </>
  );
}

// ── materials, shared ──
type M = ReturnType<typeof makeMaterials>;
function makeMaterials() {
  return {
    ground: flat('#a5a6a8'),
    road: flat('#d7d7d2'),
    grass: flat('#8f9093'),
    wall: flat('#e6e6e1'),
    stone: flat('#9b9ca0'),
    darkStone: flat('#4b4c51'),
    roof: flat('#2c2d31'),
    wood: flat('#5a5b60'),
    cloth: flat('#efefea', { side: THREE.DoubleSide }),
    darkCloth: flat('#3b3c41', { side: THREE.DoubleSide }),
    leaf: flat('#3e3f44'),
    crown: flat('#5c5d62'),
    bush: flat('#6e6f73'),
    tuft: flat('#5f6064', { side: THREE.DoubleSide }),
    flower: new THREE.MeshBasicMaterial({ color: '#f6f6f2' }),
    patch: new THREE.MeshStandardMaterial({ color: '#ffffff', flatShading: true, roughness: 1, transparent: true, opacity: 0.55, depthWrite: false }),
    trunk: flat('#55565b'),
    metal: flat('#8d9097', { metalness: 0.5, roughness: 0.4 }),
    glow: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
    window: flat('#26272b'),
    marker: new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.95 }),
    ring: new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55, depthWrite: false }),
  };
}
function useMaterials() {
  return useMemo(makeMaterials, []);
}

// buildings you can't walk through: [x, z, radius]
const COLLIDERS: Array<[number, number, number]> = [];
function block(x: number, z: number, r: number) {
  // pieces register once, however often the map is opened
  if (!COLLIDERS.some(([a, b]) => Math.abs(a - x) < 0.01 && Math.abs(b - z) < 0.01)) COLLIDERS.push([x, z, r]);
}

// ── the road ──
function Road({ m }: { m: M }) {
  const geo = useMemo(() => {
    const pos: number[] = [];
    const idx: number[] = [];
    const W = 1.35;
    ROAD.forEach((p, i) => {
      const a = ROAD[Math.max(0, i - 1)];
      const b = ROAD[Math.min(ROAD.length - 1, i + 1)];
      let nx = -(b.z - a.z);
      let nz = b.x - a.x;
      const l = Math.hypot(nx, nz) || 1;
      nx /= l;
      nz /= l;
      pos.push(p.x + nx * W, 0.02, p.z + nz * W, p.x - nx * W, 0.02, p.z - nz * W);
      if (i > 0) {
        const o = (i - 1) * 2;
        idx.push(o, o + 2, o + 1, o + 1, o + 2, o + 3);
      }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, []);
  return <mesh geometry={geo} material={m.road} receiveShadow />;
}

// ── trees, rocks and hills, kept off the road and the stops ──
function Nature({ m }: { m: M }) {
  const pines = useRef<THREE.InstancedMesh>(null);
  const crowns = useRef<THREE.InstancedMesh>(null);
  const trunks = useRef<THREE.InstancedMesh>(null);
  const bushes = useRef<THREE.InstancedMesh>(null);
  const grass = useRef<THREE.InstancedMesh>(null);
  const flowers = useRef<THREE.InstancedMesh>(null);
  const rocks = useRef<THREE.InstancedMesh>(null);
  const patches = useRef<THREE.InstancedMesh>(null);
  const hills = useRef<THREE.InstancedMesh>(null);
  const NP = 190; // pines
  const NC = 110; // round trees
  const NB = 200; // bushes
  const NG = 1600; // grass tufts
  const NF = 700; // little white flowers
  const NR = 80; // rocks
  const NPa = 70; // ground patches
  const H = 34; // hills
  useEffect(() => {
    const r = rng(7);
    const o = new THREE.Object3D();
    // keep clear of the road, the arrival rings and the buildings; the
    // village square gets more room than the rest
    const clear = (x: number, z: number, road: number, stop: number) =>
      Math.abs(x) < BOUNDS.x + 6 &&
      nearestRoad(x, z).d > road &&
      STOPS.every((s, i) => {
        const k = i === 0 ? 1.6 : 1;
        return Math.hypot(siteOf(s).x - x, siteOf(s).z - z) > stop * k && Math.hypot(s.x - x, s.z - z) > Math.min(stop, 5) * k;
      });
    const put = (im: THREE.InstancedMesh | null, i: number) => {
      o.updateMatrix();
      im?.setMatrixAt(i, o.matrix);
    };

    // trees grow in groves, set back from the road and clear of every stop
    const groves: Array<[number, number]> = [];
    for (let tries = 0; groves.length < 26 && tries < 3000; tries++) {
      const p = ROAD[Math.floor(r() * ROAD.length)];
      const a = r() * Math.PI * 2;
      const d = 6.5 + r() * 11;
      const x = p.x + Math.cos(a) * d;
      const z = p.z + Math.sin(a) * d;
      if (clear(x, z, 5.5, 8)) groves.push([x, z]);
    }
    const spot = (near: number) => {
      for (let tries = 0; tries < 60; tries++) {
        let x: number;
        let z: number;
        if (r() < near && groves.length) {
          const [gx, gz] = groves[Math.floor(r() * groves.length)];
          const a = r() * Math.PI * 2;
          const d = Math.sqrt(r()) * 5.5;
          x = gx + Math.cos(a) * d;
          z = gz + Math.sin(a) * d;
        } else {
          x = (r() * 2 - 1) * 36;
          z = 16 - r() * 124;
        }
        if (clear(x, z, 3.2, 6)) return [x, z] as const;
      }
      return null;
    };
    let ti = 0;
    let pi = 0;
    let ci = 0;
    let bi = 0;
    let gi = 0;
    let fi = 0;
    for (let i = 0; i < NP; i++) {
      const p = spot(0.7);
      if (!p) continue;
      const s = 0.8 + r() * 0.9;
      o.position.set(p[0], 1.7 * s, p[1]);
      o.rotation.set(0, r() * 6, 0);
      o.scale.set(s, s * (0.9 + r() * 0.5), s);
      put(pines.current, pi++);
      o.position.y = 0.45 * s;
      o.scale.set(s, s, s);
      put(trunks.current, ti++);
    }
    for (let i = 0; i < NC; i++) {
      const p = spot(0.6);
      if (!p) continue;
      const s = 0.8 + r() * 0.6;
      o.position.set(p[0], 1.75 * s, p[1]);
      o.rotation.set(r(), r() * 6, r());
      o.scale.set(s * (1 + r() * 0.3), s * (0.85 + r() * 0.3), s);
      put(crowns.current, ci++);
      o.position.y = 0.6 * s;
      o.rotation.set(0, 0, 0);
      o.scale.set(s, s * 1.4, s);
      put(trunks.current, ti++);
    }
    if (trunks.current) trunks.current.count = ti;
    if (pines.current) pines.current.count = pi;
    if (crowns.current) crowns.current.count = ci;
    // bushes: along the road's edges and round the groves
    for (let i = 0; i < NB; i++) {
      let p: readonly [number, number] | null = null;
      if (i % 2) {
        const q = ROAD[Math.floor(r() * ROAD.length)];
        const a = r() * Math.PI * 2;
        const x = q.x + Math.cos(a) * (2.6 + r() * 3);
        const z = q.z + Math.sin(a) * (2.6 + r() * 3);
        if (clear(x, z, 2.3, 4.2)) p = [x, z];
      } else p = spot(0.8);
      if (!p) continue;
      const s = 0.35 + r() * 0.45;
      o.position.set(p[0], s * 0.45, p[1]);
      o.rotation.set(r() * 3, r() * 3, r() * 3);
      o.scale.set(s * 1.3, s * 0.9, s * 1.1);
      put(bushes.current, bi++);
    }
    // grass tufts everywhere but the road, thicker near it
    for (let i = 0; i < NG; i++) {
      let x: number;
      let z: number;
      if (r() < 0.55) {
        const q = ROAD[Math.floor(r() * ROAD.length)];
        const a = r() * Math.PI * 2;
        const d = 1.9 + r() * 7;
        x = q.x + Math.cos(a) * d;
        z = q.z + Math.sin(a) * d;
      } else {
        x = (r() * 2 - 1) * 36;
        z = 16 - r() * 124;
      }
      if (nearestRoad(x, z).d < 1.75) continue;
      const s = 0.2 + r() * 0.22;
      o.position.set(x, s * 0.8, z);
      o.rotation.set((r() - 0.5) * 0.4, r() * 6, (r() - 0.5) * 0.4);
      o.scale.set(s, s * (1.6 + r()), s);
      put(grass.current, gi++);
    }
    for (let i = 0; i < NF; i++) {
      const q = ROAD[Math.floor(r() * ROAD.length)];
      const a = r() * Math.PI * 2;
      const d = 2 + r() * 10;
      const x = q.x + Math.cos(a) * d + (r() - 0.5) * 0.6;
      const z = q.z + Math.sin(a) * d + (r() - 0.5) * 0.6;
      if (nearestRoad(x, z).d < 1.8) continue;
      o.position.set(x, 0.14 + r() * 0.08, z);
      o.rotation.set(0, 0, 0);
      o.scale.setScalar(0.04 + r() * 0.035);
      put(flowers.current, fi++);
    }
    if (bushes.current) bushes.current.count = bi;
    if (grass.current) grass.current.count = gi;
    if (flowers.current) flowers.current.count = fi;
    let k = 0;
    for (let tries = 0; k < NR && tries < 3000; tries++) {
      const x = (r() * 2 - 1) * 32;
      const z = 12 - r() * 116;
      if (!clear(x, z, 2.2, 5)) continue;
      const s = 0.25 + r() * 0.55;
      o.position.set(x, s * 0.3, z);
      o.rotation.set(r() * 3, r() * 3, r() * 3);
      o.scale.set(s * 1.3, s * 0.7, s);
      put(rocks.current, k++);
    }
    if (rocks.current) rocks.current.count = k;
    // the ground isn't one grey: soft patches of lighter and darker earth
    for (let i = 0; i < NPa; i++) {
      const x = (r() * 2 - 1) * 34;
      const z = 14 - r() * 120;
      const s = 2.5 + r() * 6;
      o.position.set(x, 0.008 + (i % 3) * 0.002, z);
      o.rotation.set(-Math.PI / 2, 0, r() * 6);
      o.scale.set(s, s * (0.5 + r() * 0.5), 1);
      put(patches.current, i);
      patches.current?.setColorAt(i, new THREE.Color(i % 2 ? '#b1b2b3' : '#9a9b9e'));
    }
    // hills ring the land, so its edge never shows
    for (let i = 0; i < H; i++) {
      const side = i % 2 ? 1 : -1;
      const z = 16 - (i >> 1) * 7.5;
      const s = 7 + r() * 6;
      o.position.set(side * (40 + r() * 6), -s * 0.35, z);
      o.rotation.set(0, r() * 6, 0);
      o.scale.set(s, s * (0.5 + r() * 0.3), s);
      put(hills.current, i);
    }
    for (const im of [pines, crowns, trunks, bushes, grass, flowers, rocks, patches, hills]) {
      if (!im.current) continue;
      im.current.instanceMatrix.needsUpdate = true;
      if (im.current.instanceColor) im.current.instanceColor.needsUpdate = true;
      // its bounds were taken before anything was placed: retake them, or
      // everything away from the village gets culled
      im.current.computeBoundingSphere();
    }
  }, []);
  return (
    <>
      <instancedMesh ref={pines} args={[undefined, undefined, NP]} castShadow material={m.leaf}>
        <coneGeometry args={[0.95, 2.6, 6]} />
      </instancedMesh>
      <instancedMesh ref={crowns} args={[undefined, undefined, NC]} castShadow material={m.crown}>
        <icosahedronGeometry args={[1.05, 0]} />
      </instancedMesh>
      <instancedMesh ref={trunks} args={[undefined, undefined, NP + NC]} castShadow material={m.trunk}>
        <cylinderGeometry args={[0.12, 0.16, 0.9, 5]} />
      </instancedMesh>
      <instancedMesh ref={bushes} args={[undefined, undefined, NB]} castShadow receiveShadow material={m.bush}>
        <icosahedronGeometry args={[1, 0]} />
      </instancedMesh>
      <instancedMesh ref={grass} args={[undefined, undefined, NG]} material={m.tuft}>
        <coneGeometry args={[0.5, 1, 3]} />
      </instancedMesh>
      <instancedMesh ref={flowers} args={[undefined, undefined, NF]} material={m.flower}>
        <icosahedronGeometry args={[1, 0]} />
      </instancedMesh>
      <instancedMesh ref={rocks} args={[undefined, undefined, NR]} castShadow receiveShadow material={m.stone}>
        <icosahedronGeometry args={[1, 0]} />
      </instancedMesh>
      <instancedMesh ref={patches} args={[undefined, undefined, NPa]} receiveShadow material={m.patch}>
        <circleGeometry args={[1, 9]} />
      </instancedMesh>
      <instancedMesh ref={hills} args={[undefined, undefined, H]} receiveShadow material={m.grass}>
        <icosahedronGeometry args={[1, 1]} />
      </instancedMesh>
    </>
  );
}

// ── the road's edges: stones, stretches of fence, lamp posts, signs ──
function Roadside({ m }: { m: M }) {
  const stones = useRef<THREE.InstancedMesh>(null);
  const posts = useRef<THREE.InstancedMesh>(null);
  const rails = useRef<THREE.InstancedMesh>(null);
  const poles = useRef<THREE.InstancedMesh>(null);
  const heads = useRef<THREE.InstancedMesh>(null);
  const NS = 360;
  const NPo = 140;
  const NL = 14;
  // which stretches of road get a fence, and on which side
  const FENCES: Array<[number, number, 1 | -1]> = [
    [30, 70, 1],
    [95, 130, -1],
    [160, 200, 1],
    [225, 255, -1],
    [290, 330, 1],
    [345, 372, -1],
  ];
  const signs = useMemo(
    () =>
      STOPS.slice(0, -1).map((s, i) => {
        const at = Math.min(ROAD.length - 2, STOP_AT[i] + 16);
        const p = ROAD[at];
        const q = ROAD[at + 1];
        const ang = Math.atan2(q.x - p.x, q.z - p.z);
        const side = i % 2 ? 1 : -1;
        return { x: p.x + Math.cos(ang) * 2.1 * side, z: p.z - Math.sin(ang) * 2.1 * side, ang };
      }),
    []
  );
  useEffect(() => {
    const r = rng(23);
    const o = new THREE.Object3D();
    const dirAt = (i: number) => {
      const a = ROAD[Math.max(0, i - 1)];
      const b = ROAD[Math.min(ROAD.length - 1, i + 1)];
      return Math.atan2(b.x - a.x, b.z - a.z);
    };
    // stones line both edges, unevenly
    let n = 0;
    for (let i = 2; i < ROAD.length - 2 && n < NS; i += 2) {
      if (STOPS.some((s) => Math.hypot(s.x - ROAD[i].x, s.z - ROAD[i].z) < 3)) continue;
      for (const side of [-1, 1]) {
        if (r() < 0.45 || n >= NS) continue;
        const a = dirAt(i);
        const d = 1.55 + r() * 0.35;
        o.position.set(ROAD[i].x + Math.cos(a) * d * side, 0.05, ROAD[i].z - Math.sin(a) * d * side);
        o.rotation.set(r(), r() * 6, r());
        const s = 0.12 + r() * 0.16;
        o.scale.set(s * 1.4, s * 0.6, s);
        o.updateMatrix();
        stones.current?.setMatrixAt(n++, o.matrix);
      }
    }
    if (stones.current) stones.current.count = n;
    // fence: posts every few steps, two rails between them
    let p = 0;
    let q = 0;
    for (const [from, to, side] of FENCES) {
      for (let i = from; i < to && p < NPo; i += 4) {
        const a = dirAt(i);
        const x = ROAD[i].x + Math.cos(a) * 2.5 * side;
        const z = ROAD[i].z - Math.sin(a) * 2.5 * side;
        o.position.set(x, 0.5, z);
        o.rotation.set(0, a, (r() - 0.5) * 0.08);
        o.scale.set(1, 1, 1);
        o.updateMatrix();
        posts.current?.setMatrixAt(p++, o.matrix);
        if (i + 4 < to) {
          const a2 = dirAt(i + 4);
          const x2 = ROAD[i + 4].x + Math.cos(a2) * 2.5 * side;
          const z2 = ROAD[i + 4].z - Math.sin(a2) * 2.5 * side;
          const len = Math.hypot(x2 - x, z2 - z);
          for (const y of [0.42, 0.78]) {
            o.position.set((x + x2) / 2, y, (z + z2) / 2);
            o.rotation.set(0, Math.atan2(x2 - x, z2 - z), 0);
            o.scale.set(1, 1, len);
            o.updateMatrix();
            rails.current?.setMatrixAt(q++, o.matrix);
          }
        }
      }
    }
    if (posts.current) posts.current.count = p;
    if (rails.current) rails.current.count = q;
    // lamp posts at intervals, alternating sides
    let l = 0;
    for (let i = 24; i < ROAD.length - 20 && l < NL; i += 30) {
      if (STOPS.some((s) => Math.hypot(s.x - ROAD[i].x, s.z - ROAD[i].z) < 5)) continue;
      const a = dirAt(i);
      const side = l % 2 ? 1 : -1;
      const x = ROAD[i].x + Math.cos(a) * 2.2 * side;
      const z = ROAD[i].z - Math.sin(a) * 2.2 * side;
      o.position.set(x, 1.15, z);
      o.rotation.set(0, 0, 0);
      o.scale.set(1, 1, 1);
      o.updateMatrix();
      poles.current?.setMatrixAt(l, o.matrix);
      o.position.set(x, 2.35, z);
      o.updateMatrix();
      heads.current?.setMatrixAt(l, o.matrix);
      l++;
    }
    if (poles.current) poles.current.count = l;
    if (heads.current) heads.current.count = l;
    for (const im of [stones, posts, rails, poles, heads])
      if (im.current) {
        im.current.instanceMatrix.needsUpdate = true;
        im.current.computeBoundingSphere();
      }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <instancedMesh ref={stones} args={[undefined, undefined, NS]} castShadow receiveShadow material={m.stone}>
        <icosahedronGeometry args={[1, 0]} />
      </instancedMesh>
      <instancedMesh ref={posts} args={[undefined, undefined, NPo]} castShadow material={m.wood}>
        <boxGeometry args={[0.12, 1, 0.12]} />
      </instancedMesh>
      <instancedMesh ref={rails} args={[undefined, undefined, NPo * 2]} castShadow material={m.wood}>
        <boxGeometry args={[0.06, 0.07, 1]} />
      </instancedMesh>
      <instancedMesh ref={poles} args={[undefined, undefined, NL]} castShadow material={m.wood}>
        <cylinderGeometry args={[0.05, 0.07, 2.3, 5]} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[undefined, undefined, NL]} material={m.glow}>
        <boxGeometry args={[0.2, 0.24, 0.2]} />
      </instancedMesh>
      {/* a wooden sign after each stop, pointing on up the road */}
      {signs.map((s, i) => (
        <group key={i} position={[s.x, 0, s.z]} rotation={[0, s.ang, 0]}>
          <mesh position={[0, 0.75, 0]} castShadow material={m.wood}>
            <boxGeometry args={[0.1, 1.5, 0.1]} />
          </mesh>
          <mesh position={[0, 1.32, 0.3]} castShadow material={m.wall}>
            <boxGeometry args={[0.08, 0.26, 0.75]} />
          </mesh>
          <mesh position={[0, 1.32, 0.72]} rotation={[0, 0, 0]} castShadow material={m.wall}>
            <coneGeometry args={[0.13, 0.18, 3]} />
          </mesh>
        </group>
      ))}
    </>
  );
}

// ── seed fluff drifting across the land ──
function Fluff({ walker }: { walker: React.RefObject<Walker> }) {
  const N = 260;
  const pts = useRef<THREE.Points>(null);
  const seed = useMemo(() => {
    const r = rng(41);
    return Array.from({ length: N }, () => [(r() * 2 - 1) * 22, 0.4 + r() * 3.2, (r() * 2 - 1) * 22, r() * 6]);
  }, []);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(N * 3), 3));
    return g;
  }, []);
  const mat = useMemo(() => new THREE.PointsMaterial({ color: '#ffffff', size: 0.07, transparent: true, opacity: 0.85, depthWrite: false }), []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const w = walker.current;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    // a field of fluff that travels with you, wrapped round a box
    for (let i = 0; i < N; i++) {
      const [x, y, z, ph] = seed[i];
      const wx = ((((x + t * 0.6 - w.x) % 44) + 44) % 44) - 22 + w.x;
      const wz = ((((z + Math.sin(t * 0.3 + ph) * 2 - w.z) % 44) + 44) % 44) - 22 + w.z;
      pos.setXYZ(i, wx, y + Math.sin(t * 0.8 + ph) * 0.3, wz);
    }
    pos.needsUpdate = true;
  });
  return <points ref={pts} geometry={geo} material={mat} frustumCulled={false} />;
}

// ── pieces ──
// a gable roof: a triangle pushed along the depth, ridge on top
function gable(w: number, h: number, d: number) {
  const sh = new THREE.Shape();
  sh.moveTo(-w / 2, 0);
  sh.lineTo(w / 2, 0);
  sh.lineTo(0, h);
  sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false });
  g.translate(0, 0, -d / 2);
  return g;
}

function House({ m, x, z, ry = 0, w = 3, d = 2.6, h = 2.2 }: { m: M; x: number; z: number; ry?: number; w?: number; d?: number; h?: number }) {
  useMemo(() => block(x, z, Math.max(w, d) * 0.62), [x, z, w, d]);
  const roof = useMemo(() => gable(w + 0.5, w * 0.42, d + 0.4), [w, d]);
  return (
    <group position={[x, 0, z]} rotation={[0, ry, 0]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow material={m.wall}>
        <boxGeometry args={[w, h, d]} />
      </mesh>
      {/* a gable roof: a three-sided prism along the depth */}
      <mesh position={[0, h, 0]} geometry={roof} castShadow material={m.roof} />
      <mesh position={[0, 0.65, d / 2 + 0.01]} material={m.window}>
        <boxGeometry args={[0.6, 1.3, 0.04]} />
      </mesh>
      <mesh position={[w * 0.28, h * 0.62, d / 2 + 0.01]} material={m.window}>
        <boxGeometry args={[0.45, 0.45, 0.04]} />
      </mesh>
    </group>
  );
}

function Fire({ m, x, z, y = 0, s = 1 }: { m: M; x: number; z: number; y?: number; s?: number }) {
  const flame = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + x;
    if (flame.current) flame.current.scale.set(1, 0.85 + Math.sin(t * 9) * 0.12 + Math.sin(t * 23) * 0.05, 1);
    if (light.current) light.current.intensity = 6 + Math.sin(t * 11) * 1.2;
  });
  return (
    <group position={[x, y, z]} scale={s}>
      <mesh ref={flame} position={[0, 0.42, 0]} material={m.glow}>
        <coneGeometry args={[0.22, 0.75, 5]} />
      </mesh>
      <pointLight ref={light} position={[0, 0.8, 0]} distance={7} decay={2} color="#ffffff" />
    </group>
  );
}

// ── 1 · the village (Brazil): houses round a square, a well, a flagpole ──
function Village({ m, won }: { m: M; won: boolean }) {
  const flag = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (flag.current) flag.current.rotation.y = Math.sin(clock.elapsedTime * 2.2) * 0.18;
  });
  useMemo(() => block(0, 8, 1.3), []);
  const wellRoof = useMemo(() => gable(2.2, 0.8, 1.4), []);
  return (
    <group>
      <House m={m} x={-6.5} z={3} ry={Math.PI / 2} />
      <House m={m} x={6.5} z={2.5} ry={-Math.PI / 2} w={3.4} />
      <House m={m} x={-6} z={-4.5} ry={Math.PI / 2.4} w={2.8} h={2} />
      <House m={m} x={6.2} z={-5} ry={-Math.PI / 2.3} />
      <House m={m} x={0} z={11} ry={0} w={3.6} h={2.6} />
      {/* the well */}
      <group position={[0, 0, 8]}>
        <mesh position={[0, 0.4, 0]} castShadow material={m.stone}>
          <cylinderGeometry args={[0.9, 1, 0.8, 8, 1, true]} />
        </mesh>
        <mesh position={[0, 0.79, 0]} material={m.window}>
          <circleGeometry args={[0.85, 8]} />
        </mesh>
        {[-0.8, 0.8].map((x) => (
          <mesh key={x} position={[x, 1.2, 0]} castShadow material={m.wood}>
            <boxGeometry args={[0.12, 1.6, 0.12]} />
          </mesh>
        ))}
        <mesh position={[0, 2, 0]} rotation={[0, Math.PI / 2, 0]} geometry={wellRoof} castShadow material={m.roof} />
      </group>
      {/* the flagpole: a banner rises here once the armor falls */}
      <group position={[2.6, 0, 1.2]}>
        <mesh position={[0, 2, 0]} castShadow material={m.wood}>
          <cylinderGeometry args={[0.05, 0.07, 4, 6]} />
        </mesh>
        <mesh position={[0, 4.05, 0]} material={m.metal}>
          <sphereGeometry args={[0.1, 6, 4]} />
        </mesh>
        {won && (
          <group position={[0, 3.55, 0]}>
            <mesh ref={flag} position={[0.55, 0, 0]} castShadow material={m.cloth}>
              <planeGeometry args={[1.1, 0.75, 3, 1]} />
            </mesh>
          </group>
        )}
      </group>
      {/* lamp posts round the square */}
      {[
        [-2.8, 4.5],
        [2.8, -2],
      ].map(([x, z]) => (
        <group key={x} position={[x, 0, z]}>
          <mesh position={[0, 1.1, 0]} castShadow material={m.wood}>
            <cylinderGeometry args={[0.05, 0.06, 2.2, 5]} />
          </mesh>
          <mesh position={[0, 2.25, 0]} material={m.glow}>
            <boxGeometry args={[0.18, 0.22, 0.18]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── 2 · the tower (Unijuí) ──
function Tower({ m }: { m: M }) {
  const s = siteOf(STOPS[1]);
  useMemo(() => block(s.x, s.z, 2.3), [s.x, s.z]);
  return (
    <group position={[s.x, 0, s.z]}>
      <mesh position={[0, 4, 0]} castShadow receiveShadow material={m.wall}>
        <cylinderGeometry args={[1.5, 1.8, 8, 8]} />
      </mesh>
      <mesh position={[0, 8.3, 0]} castShadow material={m.stone}>
        <cylinderGeometry args={[2, 1.6, 0.6, 8]} />
      </mesh>
      <mesh position={[0, 9.9, 0]} castShadow material={m.roof}>
        <coneGeometry args={[2.05, 2.8, 8]} />
      </mesh>
      {/* windows climb the side that faces the road */}
      {[2.2, 4.4, 6.6].map((y, i) => (
        <mesh key={y} position={[1.62 - (i % 2) * 0.05, y, (i - 1) * 0.3]} rotation={[0, Math.PI / 2, 0]} material={m.window}>
          <boxGeometry args={[0.45, 0.8, 0.08]} />
        </mesh>
      ))}
      <mesh position={[1.72, 0.75, 0]} rotation={[0, Math.PI / 2, 0]} material={m.window}>
        <boxGeometry args={[0.8, 1.5, 0.08]} />
      </mesh>
      {/* a lamp by the door: the light he takes with him */}
      <group position={[2.4, 0, 1.2]}>
        <mesh position={[0, 0.9, 0]} castShadow material={m.wood}>
          <cylinderGeometry args={[0.05, 0.06, 1.8, 5]} />
        </mesh>
        <mesh position={[0, 1.88, 0]} material={m.glow}>
          <boxGeometry args={[0.2, 0.26, 0.2]} />
        </mesh>
      </group>
      {/* books stacked by the steps */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[2.3, 0.1 + i * 0.14, -1]} rotation={[0, i * 0.4, 0]} castShadow material={i % 2 ? m.roof : m.wall}>
          <boxGeometry args={[0.5, 0.12, 0.36]} />
        </mesh>
      ))}
    </group>
  );
}

// ── 3 · the camp (Compass UOL) ──
function Camp({ m }: { m: M }) {
  const s = siteOf(STOPS[2]);
  const tents: Array<[number, number, number, number]> = [
    [-0.8, 2.3, 0.4, 1.1],
    [2.4, -0.6, -0.5, 1.3],
    [-0.4, -3, 0.9, 1],
  ];
  useMemo(() => tents.forEach(([x, z, , sc]) => block(s.x + x, s.z + z, 1.5 * sc)), [s.x, s.z]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <group position={[s.x, 0, s.z]}>
      {tents.map(([x, z, ry, sc], i) => (
        <group key={i} position={[x, 0, z]} rotation={[0, ry, 0]} scale={sc}>
          <mesh position={[0, 0.85, 0]} castShadow material={i === 1 ? m.darkCloth : m.cloth}>
            <coneGeometry args={[1.3, 1.7, 4, 1, true]} />
          </mesh>
          <mesh position={[0, 1.85, 0]} material={m.wood}>
            <cylinderGeometry args={[0.03, 0.03, 0.5, 4]} />
          </mesh>
        </group>
      ))}
      {/* the fire everyone sits around */}
      <group position={[-2.6, 0, -0.4]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0, 0.08, 0]} rotation={[0, (i / 4) * Math.PI, Math.PI / 2]} castShadow material={m.wood}>
            <cylinderGeometry args={[0.07, 0.07, 0.9, 5]} />
          </mesh>
        ))}
        <Fire m={m} x={0} z={0} />
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[Math.cos(i * 2.1) * 1.3, 0.2, Math.sin(i * 2.1) * 1.3]} rotation={[0, i * 2.1, 0]} castShadow material={m.wood}>
            <boxGeometry args={[0.9, 0.3, 0.32]} />
          </mesh>
        ))}
      </group>
      {/* a banner pole */}
      <group position={[1, 0, 2.6]}>
        <mesh position={[0, 1.6, 0]} castShadow material={m.wood}>
          <cylinderGeometry args={[0.05, 0.06, 3.2, 5]} />
        </mesh>
        <mesh position={[0.3, 2.6, 0]} castShadow material={m.darkCloth}>
          <planeGeometry args={[0.6, 1.1]} />
        </mesh>
      </group>
    </group>
  );
}

function Wagon({ m, x, z, ry }: { m: M; x: number; z: number; ry: number }) {
  useMemo(() => block(x, z, 1.7), [x, z]);
  return (
    <group position={[x, 0, z]} rotation={[0, ry, 0]}>
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow material={m.wood}>
        <boxGeometry args={[1.5, 0.45, 2.8]} />
      </mesh>
      {/* the canvas cover: half a cylinder along the bed */}
      <mesh position={[0, 0.98, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow material={m.cloth}>
        <cylinderGeometry args={[0.8, 0.8, 2.5, 8, 1, true, -Math.PI / 2, Math.PI]} />
      </mesh>
      {[
        [-0.8, -0.95],
        [0.8, -0.95],
        [-0.8, 0.95],
        [0.8, 0.95],
      ].map(([wx, wz]) => (
        <mesh key={`${wx}${wz}`} position={[wx, 0.42, wz]} rotation={[0, 0, Math.PI / 2]} castShadow material={m.roof}>
          <cylinderGeometry args={[0.42, 0.42, 0.1, 8]} />
        </mesh>
      ))}
      <mesh position={[0, 0.55, 1.9]} rotation={[0.25, 0, 0]} material={m.wood}>
        <boxGeometry args={[0.08, 0.08, 1.4]} />
      </mesh>
    </group>
  );
}

// ── 4 · the caravan (Coral, the e-commerce) ──
function Caravan({ m }: { m: M }) {
  const s = siteOf(STOPS[3]);
  return (
    <group>
      <Wagon m={m} x={s.x + 0.6} z={s.z + 2.2} ry={0.35} />
      <Wagon m={m} x={s.x - 1.2} z={s.z - 2.4} ry={-0.25} />
      <group position={[s.x + 2.4, 0, s.z - 0.6]}>
        {/* the goods: crates and barrels for sale */}
        {[
          [0, 0, 0],
          [0.7, 0, 0.2],
          [0.3, 0.6, 0.1],
        ].map(([x, y, z], i) => (
          <mesh key={i} position={[x, 0.3 + y, z]} rotation={[0, i * 0.5, 0]} castShadow material={i === 2 ? m.wall : m.wood}>
            <boxGeometry args={[0.6, 0.6, 0.6]} />
          </mesh>
        ))}
        {[
          [-0.6, 1.1],
          [0.4, 1.3],
        ].map(([x, z]) => (
          <mesh key={x} position={[x, 0.4, z]} castShadow material={m.wood}>
            <cylinderGeometry args={[0.3, 0.3, 0.8, 8]} />
          </mesh>
        ))}
        {/* a stall awning */}
        <mesh position={[0.2, 1.9, 0.5]} rotation={[0.3, 0, 0]} castShadow material={m.darkCloth}>
          <boxGeometry args={[2, 0.04, 1.4]} />
        </mesh>
        {[-0.75, 1.15].map((x) => (
          <mesh key={x} position={[x, 0.95, 0]} castShadow material={m.wood}>
            <cylinderGeometry args={[0.04, 0.04, 1.9, 4]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ── 5 · the workshop (COV): a shed, an anvil, and the robot ──
function Workshop({ m, walker }: { m: M; walker: React.RefObject<Walker> }) {
  const s = siteOf(STOPS[4]);
  const head = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const R = { x: s.x - 2.6, z: s.z + 0.4 };
  useMemo(() => {
    block(s.x + 0.6, s.z, 2.4);
    block(R.x, R.z, 0.7);
  }, [s.x, s.z]); // eslint-disable-line react-hooks/exhaustive-deps
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const w = walker.current;
    // it watches you, bobbing on its hover, and blinks
    if (head.current) {
      const want = Math.atan2(w.x - R.x, w.z - R.z) - Math.PI / 2;
      head.current.rotation.y += (Math.atan2(Math.sin(want - head.current.rotation.y), Math.cos(want - head.current.rotation.y))) * 0.08;
    }
    if (body.current) body.current.position.y = 0.12 + Math.sin(t * 2.4) * 0.06;
    if (eyes.current) eyes.current.scale.y = Math.sin(t * 0.9) > 0.97 ? 0.1 : 1;
  });
  return (
    <group>
      <group position={[s.x + 0.6, 0, s.z]}>
        {/* the shed: four posts, a slanted roof, a back wall */}
        {[
          [-1.8, -1.6],
          [1.8, -1.6],
          [-1.8, 1.6],
          [1.8, 1.6],
        ].map(([x, z]) => (
          <mesh key={`${x}${z}`} position={[x, 1.4, z]} castShadow material={m.wood}>
            <boxGeometry args={[0.16, 2.8, 0.16]} />
          </mesh>
        ))}
        <mesh position={[0.2, 2.95, 0]} rotation={[0, 0, 0.18]} castShadow material={m.roof}>
          <boxGeometry args={[4.4, 0.12, 3.8]} />
        </mesh>
        <mesh position={[1.85, 1.3, 0]} castShadow receiveShadow material={m.wall}>
          <boxGeometry args={[0.12, 2.6, 3.4]} />
        </mesh>
        {/* workbench and tools */}
        <mesh position={[1.2, 0.85, 0]} castShadow material={m.wood}>
          <boxGeometry args={[0.9, 0.1, 2.6]} />
        </mesh>
        {[-1, 1].map((z) => (
          <mesh key={z} position={[1.2, 0.4, z]} material={m.wood}>
            <boxGeometry args={[0.8, 0.8, 0.1]} />
          </mesh>
        ))}
        <mesh position={[1.2, 1.05, -0.6]} rotation={[0, 0.4, 0]} castShadow material={m.metal}>
          <boxGeometry args={[0.5, 0.3, 0.35]} />
        </mesh>
        {/* the anvil */}
        <group position={[-0.6, 0, -0.4]}>
          <mesh position={[0, 0.3, 0]} castShadow material={m.darkStone}>
            <boxGeometry args={[0.45, 0.6, 0.45]} />
          </mesh>
          <mesh position={[0, 0.7, 0]} castShadow material={m.metal}>
            <boxGeometry args={[0.9, 0.22, 0.4]} />
          </mesh>
          <mesh position={[0.55, 0.72, 0]} rotation={[0, 0, Math.PI / 2]} castShadow material={m.metal}>
            <coneGeometry args={[0.13, 0.35, 4]} />
          </mesh>
        </group>
        <Fire m={m} x={-0.8} z={1.2} s={0.6} />
      </group>
      {/* the robot: COV, the medical assistant, waiting by the road */}
      <group position={[R.x, 0, R.z]}>
        <group ref={body}>
          <mesh position={[0, 0.55, 0]} castShadow material={m.metal}>
            <cylinderGeometry args={[0.32, 0.42, 0.75, 8]} />
          </mesh>
          <mesh position={[0, 0.62, 0.36]} material={m.glow}>
            <boxGeometry args={[0.18, 0.06, 0.04]} />
          </mesh>
          <mesh position={[0, 0.62, 0.36]} rotation={[0, 0, Math.PI / 2]} material={m.glow}>
            <boxGeometry args={[0.18, 0.06, 0.04]} />
          </mesh>
          {[-1, 1].map((sx) => (
            <mesh key={sx} position={[sx * 0.48, 0.6, 0]} rotation={[0, 0, sx * 0.25]} castShadow material={m.wall}>
              <boxGeometry args={[0.12, 0.55, 0.14]} />
            </mesh>
          ))}
          <group ref={head} position={[0, 1.15, 0]}>
            <mesh castShadow material={m.wall}>
              <boxGeometry args={[0.62, 0.44, 0.48]} />
            </mesh>
            {/* the screen face, pointing along +x (turned to you at runtime) */}
            <mesh position={[0.25, 0, 0]} material={m.window}>
              <boxGeometry args={[0.05, 0.32, 0.4]} />
            </mesh>
            <group ref={eyes} position={[0.285, 0.03, 0]}>
              {[-0.09, 0.09].map((z) => (
                <mesh key={z} position={[0, 0, z]} material={m.glow}>
                  <boxGeometry args={[0.02, 0.08, 0.06]} />
                </mesh>
              ))}
            </group>
            <mesh position={[0, 0.34, 0]} material={m.metal}>
              <cylinderGeometry args={[0.015, 0.015, 0.25, 4]} />
            </mesh>
            <mesh position={[0, 0.48, 0]} material={m.glow}>
              <sphereGeometry args={[0.05, 6, 4]} />
            </mesh>
          </group>
        </group>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} material={m.ring}>
          <ringGeometry args={[0.3, 0.42, 16]} />
        </mesh>
      </group>
    </group>
  );
}

// ── 6 · the tavern (GuessQuest): an inn and an arcade cabinet outside ──
function Tavern({ m }: { m: M }) {
  const s = siteOf(STOPS[5]);
  const screen = useScreen('/projects/guessquest/game.webp');
  const C = { x: s.x + 2.6, z: s.z + 1.6 };
  useMemo(() => block(C.x, C.z, 0.6), [C.x, C.z]);
  return (
    <group>
      <House m={m} x={s.x - 0.8} z={s.z - 0.4} ry={Math.PI / 2} w={5} d={3.8} h={2.8} />
      {/* the sign */}
      <group position={[s.x + 1.6, 0, s.z - 2.2]}>
        <mesh position={[0, 1.5, 0]} castShadow material={m.wood}>
          <cylinderGeometry args={[0.05, 0.06, 3, 5]} />
        </mesh>
        <mesh position={[0.4, 2.75, 0]} rotation={[0, 0, Math.PI / 2]} material={m.wood}>
          <cylinderGeometry args={[0.03, 0.03, 0.8, 4]} />
        </mesh>
        <mesh position={[0.45, 2.35, 0]} castShadow material={m.wall}>
          <boxGeometry args={[0.7, 0.55, 0.06]} />
        </mesh>
      </group>
      {/* the arcade cabinet, screen to the road */}
      <group position={[C.x, 0, C.z]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 0.9, 0]} castShadow material={m.roof}>
          <boxGeometry args={[0.8, 1.8, 0.7]} />
        </mesh>
        <mesh position={[0, 1.95, 0.05]} castShadow material={m.roof}>
          <boxGeometry args={[0.8, 0.3, 0.6]} />
        </mesh>
        <mesh position={[0, 1.95, 0.36]} material={m.glow}>
          <boxGeometry args={[0.62, 0.14, 0.02]} />
        </mesh>
        <mesh position={[0, 1.35, 0.36]} rotation={[-0.15, 0, 0]}>
          <planeGeometry args={[0.62, 0.48]} />
          <meshBasicMaterial map={screen} color={screen ? '#ffffff' : '#222222'} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.95, 0.42]} rotation={[0.5, 0, 0]} material={m.wood}>
          <boxGeometry args={[0.78, 0.06, 0.35]} />
        </mesh>
      </group>
      {/* tables and barrels out front */}
      {[
        [s.x + 3, s.z - 1.6],
        [s.x + 2.2, s.z + 4],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.7, 0]} castShadow material={m.wood}>
            <cylinderGeometry args={[0.55, 0.55, 0.08, 8]} />
          </mesh>
          <mesh position={[0, 0.35, 0]} material={m.wood}>
            <cylinderGeometry args={[0.07, 0.1, 0.7, 5]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// a picture as a grey screen, like the project tablets in the arena
function useScreen(src: string) {
  const tex = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const c = document.createElement('canvas');
    c.width = 320;
    c.height = 200;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    const img = new Image();
    img.onload = () => {
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.filter = 'grayscale(1) contrast(1.1)';
      ctx.drawImage(img, 0, 0, c.width, c.height);
      t.needsUpdate = true;
    };
    img.src = src;
    return t;
  }, [src]);
  return tex;
}

// ── 7 · the arena gate ──
function ArenaGate({ m }: { m: M }) {
  const s = STOPS[6];
  const z = s.z - 4;
  useMemo(() => {
    block(-3.6, z, 1.6);
    block(3.6, z, 1.6);
  }, [z]);
  return (
    <group position={[0, 0, z]}>
      {[-3.6, 3.6].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 3.2, 0]} castShadow receiveShadow material={m.darkStone}>
            <boxGeometry args={[2.4, 6.4, 2.4]} />
          </mesh>
          <mesh position={[0, 6.8, 0]} castShadow material={m.darkStone}>
            <boxGeometry args={[2.8, 0.6, 2.8]} />
          </mesh>
          {[-1, 0, 1].map((k) => (
            <mesh key={k} position={[k * 0.9, 7.4, 1.1]} castShadow material={m.darkStone}>
              <boxGeometry args={[0.5, 0.6, 0.5]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* the arch, and the portcullis half raised */}
      <mesh position={[0, 4.8, 0]} rotation={[0, 0, 0]} castShadow material={m.darkStone}>
        <torusGeometry args={[2.4, 0.55, 4, 10, Math.PI]} />
      </mesh>
      {[-1.6, -0.8, 0, 0.8, 1.6].map((x) => (
        <mesh key={x} position={[x, 5.6, 0]} castShadow material={m.roof}>
          <boxGeometry args={[0.12, 2.6, 0.12]} />
        </mesh>
      ))}
      <mesh position={[0, 2.4, -0.6]} material={m.roof}>
        <planeGeometry args={[4.8, 4.8]} />
      </mesh>
      {/* walls running off round the ring inside */}
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * 8, 2.4, -4]} rotation={[0, sx * 0.55, 0]} castShadow receiveShadow material={m.darkStone}>
          <boxGeometry args={[9, 4.8, 1.2]} />
        </mesh>
      ))}
      <Fire m={m} x={-5.3} z={2.2} y={1.2} s={1.1} />
      <Fire m={m} x={5.3} z={2.2} y={1.2} s={1.1} />
      {[-5.3, 5.3].map((x) => (
        <mesh key={x} position={[x, 0.6, 2.2]} castShadow material={m.darkStone}>
          <cylinderGeometry args={[0.35, 0.5, 1.2, 6]} />
        </mesh>
      ))}
    </group>
  );
}

// ── a white mark over every stop you haven't reached yet ──
function Markers({ m, visited }: { m: M; visited: React.RefObject<Set<number>> }) {
  const refs = useRef<Array<THREE.Group | null>>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    refs.current.forEach((g, i) => {
      if (!g) return;
      const on = !visited.current.has(i) || i === STOPS.length - 1;
      g.visible = on;
      g.rotation.y = t * 1.2;
      g.position.y = 3.4 + Math.sin(t * 2 + i) * 0.18;
    });
  });
  return (
    <>
      {STOPS.map((s, i) =>
        i === 0 ? null : (
          <group key={s.key}>
            <group ref={(e) => void (refs.current[i] = e)} position={[s.x, 3.4, s.z]}>
              <mesh material={m.marker}>
                <octahedronGeometry args={[0.32, 0]} />
              </mesh>
            </group>
            <mesh position={[s.x, 0.04, s.z]} rotation={[-Math.PI / 2, 0, 0]} material={m.ring}>
              <ringGeometry args={[ARRIVE - 0.25, ARRIVE - 0.1, 40]} />
            </mesh>
          </group>
        )
      )}
    </>
  );
}

export const fresh = () => ({ ...NO_GEAR });
