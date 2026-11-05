import * as THREE from 'three';
import type { Gear } from '../arena/Player';

// The road through Lucas's story: a village, then one stop per experience,
// oldest first, and the arena at the end. Each stop sits on the road (where
// you arrive); its buildings stand to one side (`side`). What the wanderer
// picks up there (`gain`) is drawn on him from then on.

export type StopKey = 'village' | 'tower' | 'camp' | 'caravan' | 'workshop' | 'tavern' | 'arena';

export type Stop = {
  key: StopKey;
  x: number;
  z: number;
  side: -1 | 0 | 1;
  gain: keyof Gear | null;
  href?: string;
};

export const STOPS: Stop[] = [
  { key: 'village', x: 0, z: 0, side: 0, gain: null },
  { key: 'tower', x: -9, z: -17, side: -1, gain: 'lantern' },
  { key: 'camp', x: 8, z: -32, side: 1, gain: 'cape' },
  { key: 'caravan', x: -8, z: -47, side: -1, gain: 'bag' },
  { key: 'workshop', x: 8, z: -62, side: 1, gain: 'shield', href: '/work/medical-chatbot' },
  { key: 'tavern', x: -7, z: -77, side: -1, gain: 'token', href: '/work/guessquest' },
  { key: 'arena', x: 0, z: -93, side: 0, gain: 'sword' },
];

export const ARRIVE = 4.2; // how near a stop counts as being there
export const START = { x: 0, z: 3.5 };
export const BOUNDS = { x: 30, zMin: -104, zMax: 14 };

// the road: a smooth curve through every stop, sampled once
const curve = new THREE.CatmullRomCurve3(
  [new THREE.Vector3(0, 0, 6), ...STOPS.map((s) => new THREE.Vector3(s.x, 0, s.z)), new THREE.Vector3(0, 0, -97)],
  false,
  'centripetal'
);
export const ROAD = curve.getSpacedPoints(420).map((p) => ({ x: p.x, z: p.z }));
// the sample nearest each stop
export const STOP_AT = STOPS.map((s) => {
  let best = 0;
  let bd = Infinity;
  ROAD.forEach((p, i) => {
    const d = (p.x - s.x) ** 2 + (p.z - s.z) ** 2;
    if (d < bd) ((bd = d), (best = i));
  });
  return best;
});

export function nearestRoad(x: number, z: number) {
  let best = 0;
  let bd = Infinity;
  for (let i = 0; i < ROAD.length; i++) {
    const d = (ROAD[i].x - x) ** 2 + (ROAD[i].z - z) ** 2;
    if (d < bd) ((bd = d), (best = i));
  }
  return { i: best, d: Math.sqrt(bd) };
}

/** where a stop's buildings stand: beside the road, on its side */
export function siteOf(s: Stop) {
  return { x: s.x + s.side * 6, z: s.z };
}

export const NO_GEAR: Gear = { lantern: false, cape: false, bag: false, shield: false, token: false, sword: false };
