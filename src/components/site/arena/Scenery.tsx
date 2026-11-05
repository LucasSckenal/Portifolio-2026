'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PANELS } from '../panels';
import { drawCard, loadImage } from '../HeroScene';

// A ruined arena, low poly and in black and white like the site. Built from
// Lucas's work: his projects hang as tablets on the wall, and his real last
// year on GitHub rises as the ring of stones around the fighting floor.

export const FOG = '#7a7b7f';
const ARENA = 9.4; // fighting floor
const WALL = 15.5;

const flat = (color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.92, metalness: 0, ...extra });

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

export default function Scenery() {
  return (
    <>
      <hemisphereLight args={['#f0f0f2', '#4a4b4f', 1.15]} />
      {/* a low, cold light from behind the armor: rims and long shadows */}
      <directionalLight
        position={[-8, 13, -12]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-bias={-0.0006}
        shadow-normalBias={0.05}
      />
      <directionalLight position={[6, 6, 10]} intensity={0.55} />
      <Floor />
      <CodeRing />
      <Walls />
      <Gate />
      <Braziers />
      <Ash />
    </>
  );
}

// flagstones in rings, each a little sunk or raised, a shade apart
function Floor() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const tiles = useMemo(() => {
    const r = rng(11);
    const out: Array<{ x: number; z: number; ry: number; w: number; d: number; y: number; c: number }> = [];
    out.push({ x: 0, z: 0, ry: 0, w: 1.7, d: 1.7, y: 0, c: 0.16 });
    for (let ring = 1.4; ring < ARENA; ring += 0.95) {
      const n = Math.max(6, Math.round((Math.PI * 2 * ring) / 1.15));
      const off = r() * 2;
      for (let i = 0; i < n; i++) {
        const a = ((i + off) / n) * Math.PI * 2;
        if (r() < 0.04) continue; // a missing stone here and there
        out.push({
          x: Math.sin(a) * ring,
          z: Math.cos(a) * ring,
          ry: a,
          w: ((Math.PI * 2 * ring) / n) * 0.9,
          d: 0.84,
          y: (r() - 0.5) * 0.06,
          c: 0.11 + r() * 0.09, // linear: mid greys on screen
        });
      }
    }
    return out;
  }, []);
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const col = new THREE.Color();
    tiles.forEach((t, i) => {
      o.position.set(t.x, -0.06 + t.y, t.z);
      o.rotation.set(0, t.ry, 0);
      o.scale.set(t.w, 0.16, t.d);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, col.setScalar(t.c));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [tiles]);
  const ground = useMemo(() => {
    const g = new THREE.CircleGeometry(70, 40);
    const pos = g.attributes.position;
    const r = rng(5);
    for (let k = 0; k < pos.count; k++) {
      const d = Math.hypot(pos.getX(k), pos.getY(k));
      if (d > WALL + 2) pos.setZ(k, (r() - 0.3) * 1.4 + (d - WALL) * 0.08);
    }
    g.computeVertexNormals();
    return g.toNonIndexed();
  }, []);
  return (
    <>
      <mesh geometry={ground} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} receiveShadow material={flat('#4b4c50')} />
      <instancedMesh ref={ref} args={[undefined, undefined, tiles.length]} receiveShadow castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial flatShading roughness={0.95} />
      </instancedMesh>
      {/* a worn seal at the centre */}
      {[1.5, 2.6].map((r) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
          <ringGeometry args={[r, r + 0.05, 7]} />
          <meshBasicMaterial color="#1b1c1f" transparent opacity={0.5} />
        </mesh>
      ))}
    </>
  );
}

// his GitHub year as a ring of stones: one per day, taller where he coded more
function CodeRing() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const [levels, setLevels] = useState<number[] | null>(null);
  useEffect(() => {
    fetch('/api/contributions')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setLevels(d?.levels ?? []))
      .catch(() => setLevels([]));
  }, []);
  const N = 371;
  useEffect(() => {
    const m = ref.current;
    if (!m || !levels) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    for (let k = 0; k < N; k++) {
      const lv = levels[k] ?? 0;
      const a = (Math.floor(k / 7) / 53) * Math.PI * 2;
      const r = ARENA + 0.6 + (k % 7) * 0.32;
      const h = 0.14 + lv * 0.5;
      o.position.set(Math.sin(a) * r, h / 2 - 0.05, Math.cos(a) * r);
      o.rotation.set(0, a, 0);
      o.scale.set(1, h, 1);
      o.updateMatrix();
      m.setMatrixAt(k, o.matrix);
      m.setColorAt(k, c.setScalar(0.2 - lv * 0.04));
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [levels]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N]} castShadow receiveShadow>
      <boxGeometry args={[0.26, 1, 0.26]} />
      <meshStandardMaterial flatShading roughness={0.9} />
    </instancedMesh>
  );
}

// the projects' cards, in grey, for the wall tablets
function useProjectTablets() {
  const [maps, setMaps] = useState<THREE.Texture[] | null>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      await document.fonts.ready;
      const fam = getComputedStyle(document.documentElement).getPropertyValue('--font-geist').trim() || 'system-ui';
      const list = PANELS.filter((p) => p.slug !== 'about');
      const out = await Promise.all(
        list.map(async (p) => {
          const [icon, shot] = await Promise.all([p.icon ? loadImage(p.icon) : null, p.shot ? loadImage(p.shot) : null]);
          const card = drawCard(p, icon, shot, `${fam}, system-ui, sans-serif`);
          const grey = document.createElement('canvas');
          grey.width = card.width;
          grey.height = card.height;
          const ctx = grey.getContext('2d')!;
          ctx.filter = 'grayscale(1) contrast(1.05)';
          ctx.drawImage(card, 0, 0);
          const tx = new THREE.CanvasTexture(grey);
          tx.colorSpace = THREE.SRGBColorSpace;
          return tx;
        })
      );
      if (alive) setMaps(out);
    })();
    return () => {
      alive = false;
    };
  }, []);
  return maps;
}

// the ring wall: pillars (some broken), wall stretches, arches, banners and
// the project tablets set into the stone
function Walls() {
  const maps = useProjectTablets();
  const SEG = 20;
  const parts = useMemo(() => {
    const r = rng(23);
    return Array.from({ length: SEG }, (_, i) => {
      const a = (i / SEG) * Math.PI * 2;
      return { a, broken: r() < 0.3, h: 6 + r() * 3, wallH: 3.8 + r() * 2.6, arch: r() < 0.35, banner: r() < 0.4, lean: (r() - 0.5) * 0.3 };
    });
  }, []);
  const stone = useMemo(() => flat('#77787c'), []);
  const stoneDark = useMemo(() => flat('#5e5f63'), []);
  const cloth = useMemo(() => flat('#202124', { side: THREE.DoubleSide }), []);
  const chord = 2 * WALL * Math.sin(Math.PI / SEG);
  let tablet = 0;
  return (
    <>
      {parts.map((p, i) => {
        const x = Math.sin(p.a) * WALL;
        const z = Math.cos(p.a) * WALL;
        const mid = p.a + Math.PI / SEG;
        const mx = Math.sin(mid) * WALL * Math.cos(Math.PI / SEG);
        const mz = Math.cos(mid) * WALL * Math.cos(Math.PI / SEG);
        // the stretch right behind the armor is the gate
        const isGate = Math.abs(Math.atan2(Math.sin(mid - Math.PI), Math.cos(mid - Math.PI))) < 0.1;
        const hasTablet = !isGate && i % 2 === 0 && maps && tablet < maps.length;
        const map = hasTablet ? maps![tablet++] : null;
        const ph = p.broken ? p.h * 0.45 : p.h;
        return (
          <group key={i}>
            {/* pillar */}
            <group position={[x, 0, z]}>
              <mesh position={[0, 0.3, 0]} castShadow receiveShadow material={stoneDark}>
                <cylinderGeometry args={[0.85, 0.95, 0.6, 8]} />
              </mesh>
              <mesh position={[0, ph / 2, 0]} castShadow receiveShadow material={stone}>
                <cylinderGeometry args={[0.55, 0.62, ph, 8]} />
              </mesh>
              {p.broken ? (
                // its top lies where it fell
                <mesh position={[-Math.sin(p.a) * 1.6, 0.45, -Math.cos(p.a) * 1.6]} rotation={[Math.PI / 2, p.a, 0.4]} castShadow material={stone}>
                  <cylinderGeometry args={[0.55, 0.58, p.h * 0.4, 8]} />
                </mesh>
              ) : (
                <mesh position={[0, ph + 0.2, 0]} castShadow material={stoneDark}>
                  <boxGeometry args={[1.5, 0.4, 1.5]} />
                </mesh>
              )}
              {p.banner && !p.broken && (
                <mesh position={[-Math.sin(p.a) * 0.6, ph - 1.9, -Math.cos(p.a) * 0.6]} rotation={[0, p.a + Math.PI, 0]} castShadow material={cloth}>
                  <shapeGeometry args={[banner()]} />
                </mesh>
              )}
            </group>
            {/* wall stretch, or an arch */}
            {!isGate && (
              <group position={[mx, 0, mz]} rotation={[0, mid, 0]}>
                {p.arch ? (
                  <>
                    <mesh position={[0, 3.4, 0]} rotation={[0, 0, 0]} castShadow material={stone}>
                      <torusGeometry args={[chord / 2 - 0.4, 0.42, 4, 8, Math.PI]} />
                    </mesh>
                    <mesh position={[0, 0.4, 0]} castShadow receiveShadow material={stoneDark}>
                      <boxGeometry args={[chord - 0.8, 0.8, 1]} />
                    </mesh>
                  </>
                ) : (
                  <mesh position={[0, p.wallH / 2, 0]} rotation={[0, 0, p.lean * 0.1]} castShadow receiveShadow material={stone}>
                    <boxGeometry args={[chord - 0.9, p.wallH, 1]} />
                  </mesh>
                )}
                {map && (
                  // the tablet faces the arena (the stretch's −z side)
                  <group position={[0, Math.min(p.wallH, 4.6) - 1.9, -0.56]} rotation={[0, Math.PI, 0]}>
                    <mesh position={[0, 0, 0]} material={stoneDark}>
                      <boxGeometry args={[3.5, 2.3, 0.12]} />
                    </mesh>
                    <mesh position={[0, 0, 0.08]}>
                      <planeGeometry args={[3.2, 2]} />
                      <meshBasicMaterial map={map} toneMapped={false} fog />
                    </mesh>
                  </group>
                )}
              </group>
            )}
          </group>
        );
      })}
      <Rubble />
    </>
  );
}

function banner() {
  const s = new THREE.Shape();
  s.moveTo(-0.45, 0);
  s.lineTo(0.45, 0);
  s.lineTo(0.42, -2.2);
  s.lineTo(0.12, -1.85);
  s.lineTo(-0.05, -2.4);
  s.lineTo(-0.25, -1.95);
  s.lineTo(-0.44, -2.1);
  s.closePath();
  return s;
}

function Rubble() {
  const rocks = useMemo(() => {
    const r = rng(41);
    return Array.from({ length: 34 }, () => {
      const a = r() * Math.PI * 2;
      const d = WALL - 1.6 + r() * 1.2 + (r() < 0.3 ? -3 : 0);
      return { x: Math.sin(a) * d, z: Math.cos(a) * d, s: 0.25 + r() * 0.6, ry: r() * 6, rx: r() * 3 };
    });
  }, []);
  const mat = useMemo(() => flat('#6a6b6f'), []);
  return (
    <>
      {rocks.map((r, i) => (
        <mesh key={i} position={[r.x, r.s * 0.4, r.z]} rotation={[r.rx, r.ry, 0]} scale={r.s} castShadow receiveShadow material={mat}>
          <dodecahedronGeometry args={[1, 0]} />
        </mesh>
      ))}
    </>
  );
}

// the great gate behind the armor, its portcullis half down
function Gate() {
  const stone = useMemo(() => flat('#6f7074'), []);
  const iron = useMemo(() => flat('#18191c', { metalness: 0.4, roughness: 0.6 }), []);
  return (
    <group position={[0, 0, -WALL]}>
      {[-2.6, 2.6].map((x) => (
        <mesh key={x} position={[x, 4, 0]} castShadow receiveShadow material={stone}>
          <boxGeometry args={[1.6, 8, 1.8]} />
        </mesh>
      ))}
      <mesh position={[0, 7.2, 0]} castShadow material={stone}>
        <torusGeometry args={[2.2, 0.6, 4, 9, Math.PI]} />
      </mesh>
      <mesh position={[0, 9.2, 0]} castShadow material={stone}>
        <boxGeometry args={[7, 1.4, 1.9]} />
      </mesh>
      <mesh position={[0, 4, -0.5]} material={iron}>
        <boxGeometry args={[3.6, 8, 0.1]} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[-1.5 + i * 0.5, 5.2, 0.1]} castShadow material={iron}>
          <boxGeometry args={[0.1, 5.6, 0.1]} />
        </mesh>
      ))}
      {[3.2, 4.6, 6].map((y) => (
        <mesh key={y} position={[0, y, 0.12]} castShadow material={iron}>
          <boxGeometry args={[3.4, 0.1, 0.1]} />
        </mesh>
      ))}
    </group>
  );
}

// braziers with white fire, the only warmth in the place
function Braziers() {
  const spots = useMemo(() => [0.75, 1.65, 2.55, 3.75, 4.65, 5.55].map((a) => ({ a, x: Math.sin(a) * (ARENA + 3.4), z: Math.cos(a) * (ARENA + 3.4) })), []);
  const flames = useRef<(THREE.Mesh | null)[]>([]);
  const lights = useRef<(THREE.PointLight | null)[]>([]);
  const stone = useMemo(() => flat('#5a5b5f'), []);
  const iron = useMemo(() => flat('#1d1e21', { metalness: 0.3 }), []);
  const fire = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.92 }), []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    spots.forEach((_, i) => {
      const f = flames.current[i];
      const flick = 0.85 + Math.sin(t * 9 + i * 2) * 0.08 + Math.sin(t * 23 + i) * 0.05;
      if (f) {
        f.scale.set(1, flick * 1.25, 1);
        f.rotation.y = t * 1.5 + i;
      }
      const l = lights.current[i];
      if (l) l.intensity = 9 * flick;
    });
  });
  return (
    <>
      {spots.map((s, i) => (
        <group key={i} position={[s.x, 0, s.z]}>
          <mesh position={[0, 0.6, 0]} castShadow receiveShadow material={stone}>
            <cylinderGeometry args={[0.32, 0.45, 1.2, 6]} />
          </mesh>
          <mesh position={[0, 1.35, 0]} castShadow material={iron}>
            <cylinderGeometry args={[0.62, 0.3, 0.42, 7, 1, true]} />
          </mesh>
          <mesh ref={(e) => void (flames.current[i] = e)} position={[0, 1.85, 0]} material={fire}>
            <coneGeometry args={[0.36, 0.95, 5]} />
          </mesh>
          <pointLight ref={(e) => void (lights.current[i] = e)} position={[0, 2.3, 0]} color="#ffffff" distance={10} decay={1.6} intensity={9} />
          <Embers />
        </group>
      ))}
    </>
  );
}

function Embers() {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 18;
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.5;
      pos[i * 3 + 1] = 1.8 + Math.random() * 2.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  useFrame((_, dt) => {
    const p = ref.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;
    if (!p) return;
    for (let i = 0; i < COUNT; i++) {
      let y = p.getY(i) + dt * (0.6 + (i % 5) * 0.15);
      let x = p.getX(i) + Math.sin(y * 3 + i) * dt * 0.2;
      if (y > 4.6) {
        y = 1.8;
        x = (Math.random() - 0.5) * 0.4;
      }
      p.setXYZ(i, x, y, p.getZ(i));
    }
    p.needsUpdate = true;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#ffffff" size={0.06} transparent opacity={0.85} depthWrite={false} />
    </points>
  );
}

// ash drifting through the whole arena
function Ash() {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 260;
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(COUNT * 3);
    const r = rng(77);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (r() - 0.5) * 36;
      pos[i * 3 + 1] = r() * 10;
      pos[i * 3 + 2] = (r() - 0.5) * 36;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  useFrame((_, dt) => {
    const p = ref.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;
    if (!p) return;
    for (let i = 0; i < COUNT; i++) {
      let y = p.getY(i) - dt * 0.25;
      if (y < 0) y = 10;
      p.setXYZ(i, p.getX(i) + dt * 0.35, y, p.getZ(i));
      if (p.getX(i) > 18) p.setX(i, -18);
    }
    p.needsUpdate = true;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#e8e8e8" size={0.05} transparent opacity={0.7} depthWrite={false} />
    </points>
  );
}
