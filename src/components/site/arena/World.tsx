'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { step, windup, type Events, type Game, type Input, type Phase } from './game';
import { AW, CINE_END, DIST } from './timeline';
import Armor from './Armor';
import { bossPos, halberdTip, hilt } from './shared';
import Player from './Player';
import Scenery, { FOG } from './Scenery';

export { CINE_END, CREDIT_AT, CREDIT_LEN, TITLE_AT } from './timeline';

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

// over your shoulder, framing the armor, wherever you are on the circle
function fightCam(ang: number, tall: boolean) {
  const dx = Math.sin(ang);
  const dz = Math.cos(ang);
  // the shoulder side: to your right as you face the armor
  const rx = -dz;
  const rz = dx;
  const back = tall ? DIST + 7.6 : DIST + 5.4;
  const side = tall ? 1.1 : 1.6;
  return {
    pos: v(dx * back + rx * side, tall ? 3.4 : 2.7, dz * back + rz * side),
    look: v(-rx * 0.2, 2.0, -rz * 0.2),
  };
}

// The film: a high circling shot over the ruins → a slow push in on the
// kneeling armor → its name → down to your shoulder
function cineCam(t: number, tall: boolean) {
  if (t < 6) {
    const k = t / 6;
    const ang = 2.2 + k * 1.5;
    const r = 12.5 - k * 3;
    return { pos: v(Math.sin(ang) * r, 10.5 - k * 5, Math.cos(ang) * r), look: v(0, 0.8 + k * 0.6, 0) };
  }
  if (t < 10.4) {
    const k = ease((t - 6) / 4.4);
    return { pos: v(-2.4 + k * 1.6, 1.0 + k * 0.6, 9 - k * 4.6), look: v(0, 1.5, 0) };
  }
  const k = ease(clamp01((t - 10.4) / (CINE_END - 10.4)));
  const from = { pos: v(-0.8, 1.6, 4.4), look: v(0, 1.5, 0) };
  const to = fightCam(0, tall);
  return { pos: from.pos.lerp(to.pos, k), look: from.look.lerp(to.look, k) };
}

// The awakening, from the side: you walk up and pull the sword, leap back,
// then the camera swings behind you as it stands
function awakenCam(a: number, tall: boolean) {
  const side = { pos: v(tall ? 7.2 : 5.8, 2.1, 3.4), look: v(0, 1.45, 1.1) };
  if (a < AW.rise) return side;
  const k = ease(clamp01((a - AW.rise) / (AW.end - AW.rise)));
  const to = fightCam(0, tall);
  return { pos: side.pos.lerp(to.pos, k), look: side.look.lerp(to.look, k) };
}

export default function World({
  game,
  input,
  phase,
  cine,
  onEvents,
  onCine,
  onAwake,
}: {
  game: React.RefObject<Game>;
  input: React.RefObject<Input>;
  phase: React.RefObject<Phase>;
  cine: React.RefObject<{ t: number; skip: boolean; awaken: number }>;
  onEvents: (ev: Events) => void;
  onCine: (t: number) => void;
  onAwake: () => void;
}) {
  const { camera, scene } = useThree();
  useEffect(() => {
    scene.background = new THREE.Color(FOG);
    scene.fog = new THREE.Fog(FOG, 16, 52);
  }, [scene]);
  const look = useRef(v(0, 1.2, 0));
  const wonT = useRef(0);

  useFrame((_, raw) => {
    const dt = Math.min(raw, 1 / 20);
    const g = game.current;
    const c = cine.current;
    const ph = phase.current;
    const cam = camera as THREE.PerspectiveCamera;
    const tall = cam.aspect < 1;
    // a punch-in on big impacts
    const fov = (tall ? 60 : 42) - g.kick * 3.5;
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }

    let want: { pos: THREE.Vector3; look: THREE.Vector3 };
    if (ph === 'cine') {
      // the film keeps wall-clock time even when frames are slow
      c.t = c.skip ? CINE_END : c.t + Math.min(raw, 0.25);
      onCine(c.t);
      want = cineCam(Math.min(c.t, CINE_END), tall);
      camera.position.copy(want.pos);
      look.current.copy(want.look);
    } else {
      if (ph === 'awaken') {
        const step_ = Math.min(raw, 0.25);
        const before = c.awaken;
        c.awaken += step_;
        if (before < AW.pull && c.awaken >= AW.pull) {
          // the sword comes out: a burst and a jolt
          g.spark = { at: 0, t: -c.awaken, big: true };
          g.shake = 0.5;
          g.kick = 0.8;
        }
        g.shake = Math.max(0, g.shake - dt * 2);
        g.kick = Math.max(0, g.kick - dt * 4);
        if (c.awaken >= AW.end) onAwake();
      }
      if (ph === 'fight') onEvents(step(g, input.current, dt));
      else if (ph === 'dead' || ph === 'won') step(g, { roll: false, attack: false }, dt);
      input.current.roll = input.current.attack = false;

      if (ph === 'awaken') want = awakenCam(c.awaken, tall);
      else if (ph === 'won') {
        // a slow turn around the fallen armor
        wonT.current += dt;
        const ang = g.p.ang + 0.3 + wonT.current * 0.12;
        want = { pos: v(Math.sin(ang) * 6.5, 2.4, Math.cos(ang) * 6.5), look: v(0, 1.1, 0) };
      } else want = fightCam(g.p.ang, tall);
      if (ph !== 'won') wonT.current = 0;
      // frame-rate independent easing: same glide at 30 or 144 fps
      camera.position.lerp(want.pos, 1 - Math.exp(-dt * (ph === 'fight' ? 4.5 : 3.2)));
      look.current.lerp(want.look, 1 - Math.exp(-dt * 5));
    }
    if (g.shake > 0) {
      camera.position.x += (Math.random() - 0.5) * g.shake * 0.35;
      camera.position.y += (Math.random() - 0.5) * g.shake * 0.35;
    }
    camera.lookAt(look.current);
  });

  return (
    <>
      <Scenery />
      <TimingRing game={game} phase={phase} />
      <Player game={game} phase={phase} cine={cine} />
      <Armor game={game} phase={phase} cine={cine} />
      <Sparks game={game} phase={phase} />
      <Dust game={game} />
      <Shock game={game} />
    </>
  );
}

// The read: a ring closes on you while the armor winds up; when it meets
// yours, roll. While its guard is open, a ring breathes around the armor.
function TimingRing({ game, phase }: { game: React.RefObject<Game>; phase: React.RefObject<Phase> }) {
  const closing = useRef<THREE.Mesh>(null);
  const mine = useRef<THREE.Mesh>(null);
  const open = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const g = game.current;
    const fighting = phase.current === 'fight';
    const w = windup(g);
    const b = g.b;
    const px = Math.sin(g.p.ang) * DIST;
    const pz = Math.cos(g.p.ang) * DIST;
    const c = closing.current;
    if (c) {
      c.visible = fighting && (b.state === 'wind' || b.state === 'hold');
      c.position.set(px, 0.06, pz);
      c.scale.setScalar(1 + (1 - w) * 3.2);
      (c.material as THREE.MeshBasicMaterial).opacity = 0.25 + w * 0.65;
    }
    if (mine.current) {
      mine.current.visible = fighting;
      mine.current.position.set(px, 0.05, pz);
    }
    const o = open.current;
    if (o) {
      o.visible = fighting && b.state === 'open';
      o.scale.setScalar(1 + Math.sin(clock.elapsedTime * 12) * 0.04);
      (o.material as THREE.MeshBasicMaterial).opacity = b.state === 'open' ? Math.max(0.15, 1 - b.st / b.dur) : 0;
    }
  });
  return (
    <>
      <mesh ref={closing} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.62, 0.7, 24]} />
        <meshBasicMaterial color="#ffffff" transparent depthWrite={false} />
      </mesh>
      <mesh ref={mine} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.6, 0.64, 24]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.45} depthWrite={false} />
      </mesh>
      <mesh ref={open} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[1.5, 1.62, 24]} />
        <meshBasicMaterial color="#ffffff" transparent depthWrite={false} />
      </mesh>
    </>
  );
}

// a burst of white sparks where a blow connects (or where the sword comes out)
function Sparks({ game, phase }: { game: React.RefObject<Game>; phase: React.RefObject<Phase> }) {
  const ref = useRef<THREE.Points>(null);
  const N = 40;
  const state = useRef({ last: -1e9, life: 0, vel: new Float32Array(N * 3) });
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    return g;
  }, []);
  const mat = useMemo(() => new THREE.PointsMaterial({ color: '#ffffff', size: 0.09, transparent: true, depthWrite: false }), []);
  useFrame((_, raw) => {
    const dt = Math.min(raw, 1 / 20);
    const g = game.current;
    const st = state.current;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    if (g.spark && g.spark.t !== st.last) {
      st.last = g.spark.t;
      st.life = 1;
      const dx = Math.sin(g.p.ang);
      const dz = Math.cos(g.p.ang);
      const pulling = phase.current === 'awaken';
      const o = pulling ? v(hilt.pos.x, hilt.pos.y, hilt.pos.z) : g.spark.at === 0 ? v(dx * 0.7, 2.1, dz * 0.7) : v(dx * DIST, 1.1, dz * DIST);
      const power = g.spark.big ? 7 : 4.5;
      for (let i = 0; i < N; i++) {
        pos.setXYZ(i, o.x, o.y, o.z);
        const a = Math.random() * Math.PI * 2;
        const e = (Math.random() - 0.2) * 1.4;
        const sp = power * (0.4 + Math.random() * 0.6);
        st.vel[i * 3] = Math.cos(a) * Math.cos(e) * sp;
        st.vel[i * 3 + 1] = Math.sin(e) * sp + 1.5;
        st.vel[i * 3 + 2] = Math.sin(a) * Math.cos(e) * sp;
      }
    }
    if (st.life <= 0) {
      if (ref.current) ref.current.visible = false;
      return;
    }
    if (ref.current) ref.current.visible = true;
    st.life -= dt * 2.4;
    for (let i = 0; i < N; i++) {
      st.vel[i * 3 + 1] -= 14 * dt;
      st.vel[i * 3] *= Math.pow(0.15, dt);
      st.vel[i * 3 + 2] *= Math.pow(0.15, dt);
      pos.setXYZ(i, pos.getX(i) + st.vel[i * 3] * dt, pos.getY(i) + st.vel[i * 3 + 1] * dt, pos.getZ(i) + st.vel[i * 3 + 2] * dt);
    }
    pos.needsUpdate = true;
    mat.opacity = Math.max(0, st.life);
  });
  return <points ref={ref} geometry={geo} material={mat} visible={false} />;
}

// heavy blows raise a ring of dust where they land
function Dust({ game }: { game: React.RefObject<Game> }) {
  const ring = useRef<THREE.Mesh>(null);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#e9e9e6', transparent: true, depthWrite: false }), []);
  useFrame(() => {
    const g = game.current;
    const r = ring.current;
    if (!r) return;
    const q = g.quake;
    r.visible = q > 0.01;
    if (!r.visible) return;
    const k = 1 - q;
    const leap = g.b.blow === 'leap';
    // the ring opens where the blade met the floor, and stays there
    if (q > 0.97) r.position.set(halberdTip.x, 0.07, halberdTip.z);
    r.scale.setScalar(0.3 + k * (leap ? 5 : 3));
    mat.opacity = q * 0.7;
  });
  return (
    <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} material={mat} visible={false}>
      <ringGeometry args={[0.7, 1, 18]} />
    </mesh>
  );
}

// The shockwave from the leap: a ring of light and a low wall running out
// across the floor from where it landed. It reaches you exactly when the
// blow lands, so the roll is timed to the ring, not the armor.
function Shock({ game }: { game: React.RefObject<Game> }) {
  const grp = useRef<THREE.Group>(null);
  const st = useRef({ r: 0, life: 0 });
  const mats = useMemo(
    () => ({
      ring: new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, depthWrite: false, side: THREE.DoubleSide }),
      wall: new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, depthWrite: false, side: THREE.DoubleSide }),
    }),
    []
  );
  useFrame((_, raw) => {
    const dt = Math.min(raw, 1 / 20);
    const g = game.current;
    const b = g.b;
    const s = st.current;
    const G = grp.current;
    if (!G) return;
    if (b.blow === 'wave' && b.state === 'wind') {
      const px = Math.sin(g.p.ang) * DIST;
      const pz = Math.cos(g.p.ang) * DIST;
      const d = Math.hypot(px - bossPos.x, pz - bossPos.z);
      s.r = 0.6 + (d - 0.6) * windup(g);
      s.life = 1;
      G.position.set(bossPos.x, 0, bossPos.z);
    } else if (s.life > 0) {
      s.r += dt * 9;
      s.life = Math.max(0, s.life - dt * 2.2);
    }
    G.visible = s.life > 0.01;
    G.scale.set(Math.max(0.01, s.r), 1 + (1 - s.life) * 0.5, Math.max(0.01, s.r));
    mats.ring.opacity = 0.9 * s.life;
    mats.wall.opacity = 0.32 * s.life;
  });
  return (
    <group ref={grp} visible={false}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} material={mats.ring}>
        <ringGeometry args={[0.9, 1, 48]} />
      </mesh>
      <mesh position={[0, 0.22, 0]} material={mats.wall}>
        <cylinderGeometry args={[1, 1, 0.44, 48, 1, true]} />
      </mesh>
    </group>
  );
}
