// =========================================
// How the project halo sits around the head.
//
// Tune it live: open the home with ?ajustar in the address, move the
// sliders, press "Copiar valores" and paste the result here.
// =========================================

export type OrbitTuning = {
  roll: number; // side tilt in degrees (+ = right side higher)
  pitch: number; // forward tilt in degrees (+ = front lower, − = front higher)
  height: number; // ring centre above the photo centre, in photo heights
  radius: number; // ring radius, in photo heights
};

export const ORBIT_DEFAULTS: OrbitTuning = {
  roll: 6,
  pitch: -33,
  height: -0.04,
  radius: 0.44,
};

// Live values the scene reads every frame; the tuner writes here.
export const ORBIT: OrbitTuning = { ...ORBIT_DEFAULTS };
