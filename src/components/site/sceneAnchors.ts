// Where the halo sits on screen, written by the 3D scene every frame and read
// by the side notes' leader lines. Plain mutable state (no React): the lines
// follow the panels at frame rate without re-rendering anything.
//
// Coordinates are normalised device coordinates of the canvas (-1..1, y up).
// The canvas and the wires' SVG both cover the hero, so they share a frame.
export type Point = { x: number; y: number };

export const anchors: {
  /** the ring's left and right edges at eye level */
  left: Point | null;
  right: Point | null;
  /** the pointed-at panel's screen box, when there is one */
  focus: { x0: number; y0: number; x1: number; y1: number } | null;
} = { left: null, right: null, focus: null };
