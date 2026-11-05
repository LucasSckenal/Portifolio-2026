// Shared beats of the arena's film and the duel's places.

// opening film (seconds)
export const CREDIT_LEN = 1.75;
export const CREDIT_AT = (i: number) => 1.0 + i * 1.9;
export const TITLE_AT = 10.6;
export const CINE_END = 13.2;

// the awakening: you walk up, pull the sword from its chest, leap back, it rises
export const AW = {
  walkEnd: 1.5, // reached the kneeling armor
  grip: 2.0, // hand on the hilt
  pull: 2.45, // sword out
  backEnd: 3.1, // leapt back to your place
  rise: 3.0, // it starts to stand
  end: 4.6,
};

// the duel: the armor at the centre, you on a circle round it
export const DIST = 3.1;
export const CLOSE = 1.5; // how near you walk to pull the sword
