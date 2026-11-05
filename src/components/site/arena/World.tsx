'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { step, windup, type Events, type Game, type Input, type Phase } from './game';
import Armor from './Armor';
import Scenery, { FOG } from './Scenery';

// ── the opening's timeline (seconds) ──
export const CREDIT_LEN = 1.75;
export const CREDIT_AT = (i: number) => 1.0 + i * 1.9;
export const TITLE_AT = 10.6;
export const CINE_END = 13.2;
const AWAKEN_T = 2.2;

// the duel's fixed places: the armor at the centre, you facing it
export const P_POS = new THREE.Vector3(0, 0, 3.1);

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

// over the shoulder, framing the armor
function fightCam(tall: boolean) {
  return tall
    ? { pos: v(1.1, 3.4, P_POS.z + 7.6), look: v(0, 2.1, 0) }
    : { pos: v(1.6, 2.7, P_POS.z + 5.4), look: v(-0.2, 2.0, 0) };
}

// The film: a high circling shot over the ruins → a slow push in on the
// kneeling armor → its name → down to your shoulder
function cineCam(t: number, tall: boolean) {
  if (t < 6) {
    const k = t / 6;
    // inside the walls, above the ruins, circling down
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
  const to = fightCam(tall);
  return { pos: from.pos.lerp(to.pos, k), look: from.look.lerp(to.look, k) };
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
        c.awaken += Math.min(raw, 0.25);
        if (c.awaken >= AWAKEN_T) onAwake();
      }
      if (ph === 'fight') onEvents(step(g, input.current, dt));
      else if (ph === 'dead' || ph === 'won') step(g, { roll: false, attack: false }, dt);
      input.current.roll = input.current.attack = false;

      want = fightCam(tall);
      if (ph === 'won') {
        // a slow turn around the fallen armor
        wonT.current += dt;
        const ang = 0.3 + wonT.current * 0.12;
        want = { pos: v(Math.sin(ang) * 6.5, 2.4, Math.cos(ang) * 6.5), look: v(0, 1.1, 0) };
      } else wonT.current = 0;
      // frame-rate independent easing: same glide at 30 or 144 fps
      camera.position.lerp(want.pos, 1 - Math.exp(-dt * 3.2));
      look.current.lerp(want.look, 1 - Math.exp(-dt * 4.5));
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
      <Player game={game} phase={phase} />
      <Armor game={game} phase={phase} cine={cine} awakenT={AWAKEN_T} />
      <Sparks game={game} />
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
    const c = closing.current;
    if (c) {
      c.visible = fighting && (b.state === 'wind' || b.state === 'hold');
      c.scale.setScalar(1 + (1 - w) * 3.2);
      (c.material as THREE.MeshBasicMaterial).opacity = 0.25 + w * 0.65;
    }
    if (mine.current) mine.current.visible = fighting;
    const o = open.current;
    if (o) {
      o.visible = fighting && b.state === 'open';
      const pulse = 1 + Math.sin(clock.elapsedTime * 12) * 0.04;
      o.scale.setScalar(pulse);
      (o.material as THREE.MeshBasicMaterial).opacity = b.state === 'open' ? Math.max(0.15, 1 - b.st / b.dur) : 0;
    }
  });
  return (
    <>
      <mesh ref={closing} position={[P_POS.x, 0.06, P_POS.z]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.62, 0.7, 24]} />
        <meshBasicMaterial color="#ffffff" transparent depthWrite={false} />
      </mesh>
      <mesh ref={mine} position={[P_POS.x, 0.05, P_POS.z]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
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

const flat = (color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.6, metalness: 0.1, ...extra });

function Player({ game, phase }: { game: React.RefObject<Game>; phase: React.RefObject<Phase> }) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);
  const mats = useRef({
    cloth: flat('#f1f1ee'),
    dark: flat('#1a1b1e'),
    blade: flat('#ffffff', { emissive: '#ffffff', emissiveIntensity: 0.3 }),
  }).current;
  const pos = useRef(new THREE.Vector3().copy(P_POS));
  const armX = useRef(-0.55);
  useFrame(({ clock }, raw) => {
    const dt = Math.min(raw, 1 / 20);
    const { p } = game.current;
    const r = root.current;
    const bd = body.current;
    if (!r || !bd || !arm.current) return;
    const t = clock.elapsedTime;
    r.visible = phase.current !== 'cine';

    // roll: dive right, tuck, spring back up
    const rk = p.roll > 0 ? 1 - p.roll / 0.5 : 0;
    const out = rk ? Math.pow(Math.sin(rk * Math.PI), 0.75) : 0;
    // attack: wind back (anticipation), whip through, settle (follow-through)
    const ak = p.atk > 0 ? 1 - p.atk / 0.32 : 0;
    const lunge = ak ? Math.sin(Math.min(1, ak / 0.7) * Math.PI) * 0.95 : 0;
    const hk = p.hurt > 0 ? p.hurt / 0.9 : 0;

    const want = new THREE.Vector3(P_POS.x + out * 1.3, 0, P_POS.z - lunge + hk * hk * 0.9);
    pos.current.lerp(want, 1 - Math.exp(-dt * (rk || ak ? 30 : 12)));
    r.position.copy(pos.current);
    r.rotation.y = Math.PI;

    bd.rotation.z = rk ? -rk * Math.PI * 2 : 0;
    bd.position.y = rk ? out * 0.18 : Math.sin(t * 2.1) * 0.012;
    // squash into the roll, stretch out of it; breathe when still
    const sq = rk ? 1 - Math.sin(rk * Math.PI) * 0.28 : 1 + Math.sin(t * 2.1) * 0.012;
    bd.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq));
    bd.rotation.x = p.stagger > 0 ? -0.3 : -hk * 0.45 + (ak ? Math.sin(ak * Math.PI) * 0.18 : 0);

    let target = -0.55 + Math.sin(t * 2.1) * 0.03;
    if (ak) target = ak < 0.25 ? -2.7 : ak < 0.6 ? 0.95 : 0.6 - (ak - 0.6) * 2.5;
    armX.current += (target - armX.current) * (1 - Math.exp(-dt * (ak && ak >= 0.25 && ak < 0.6 ? 60 : 16)));
    arm.current.rotation.set(armX.current, 0, ak ? 0.5 - ak * 0.9 : 0.05);

    if (p.hp <= 0) {
      bd.rotation.x += (Math.PI / 2 - bd.rotation.x) * (1 - Math.exp(-dt * 6));
      bd.position.y = 0.25;
    }
    r.visible = r.visible && (p.hurt <= 0 || Math.floor(t * 18) % 2 === 0 || p.hp <= 0);
  });
  return (
    <group ref={root}>
      <group ref={body}>
        <mesh position={[0, 0.62, 0]} castShadow material={mats.cloth}>
          <cylinderGeometry args={[0.2, 0.32, 0.9, 6]} />
        </mesh>
        <mesh position={[0, 1.22, 0]} castShadow material={mats.cloth}>
          <icosahedronGeometry args={[0.2, 0]} />
        </mesh>
        {/* hood shadow */}
        <mesh position={[0, 1.28, 0.1]} material={mats.dark}>
          <boxGeometry args={[0.22, 0.06, 0.06]} />
        </mesh>
        <mesh position={[0, 0.85, -0.18]} rotation={[0.18, 0, 0]} castShadow material={mats.cloth}>
          <coneGeometry args={[0.34, 0.95, 5, 1, true]} />
        </mesh>
        <group ref={arm} position={[0.28, 0.92, 0]}>
          <mesh position={[0, -0.2, 0.05]} castShadow material={mats.cloth}>
            <boxGeometry args={[0.1, 0.42, 0.1]} />
          </mesh>
          <mesh position={[0, -0.42, 0.62]} rotation={[Math.PI / 2, 0, 0]} castShadow material={mats.blade}>
            <boxGeometry args={[0.07, 1.1, 0.02]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// a burst of white sparks where a blow connects
function Sparks({ game }: { game: React.RefObject<Game> }) {
  const ref = useRef<THREE.Points>(null);
  const N = 36;
  const state = useRef({ last: -1, life: 0, vel: new Float32Array(N * 3) });
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
      const o = g.spark.at === 0 ? v(0, 2.3, 0.7) : v(P_POS.x, 1.0, P_POS.z - 0.2);
      const power = g.spark.big ? 7 : 4.5;
      for (let i = 0; i < N; i++) {
        pos.setXYZ(i, o.x, o.y, o.z);
        const a = Math.random() * Math.PI * 2;
        const e = (Math.random() - 0.2) * 1.4;
        const sp = power * (0.4 + Math.random() * 0.6);
        st.vel[i * 3] = Math.cos(a) * Math.cos(e) * sp;
        st.vel[i * 3 + 1] = Math.sin(e) * sp + 1.5;
        st.vel[i * 3 + 2] = Math.sin(a) * Math.cos(e) * sp * 0.6 + (g.spark.at === 0 ? 2 : -2);
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
