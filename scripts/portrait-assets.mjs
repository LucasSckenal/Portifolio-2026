// Builds the hero portrait assets from a photo shot on a plain light ground:
//   public/home/retrato-cut.webp   RGBA, the figure cut out (alpha matte)
//   public/home/retrato-depth.png  grayscale relief map for the 3D effect
//
// usage: node scripts/portrait-assets.mjs <photo>
// The matte is a flood fill of the light ground from the frame edges, so
// highlights inside the figure (forehead, nose) are never punched out.
import sharp from 'sharp';

const src = process.argv[2];
if (!src) {
  console.error('usage: node scripts/portrait-assets.mjs <photo>');
  process.exit(1);
}

const OUT_W = 1600;
const { data, info } = await sharp(src)
  .resize({ width: OUT_W })
  .greyscale()
  .raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;
const N = W * H;

// ── Ground: flood fill from the border through light pixels ──
const SEED = 232; // ground is ~243–245
const GROW = 226; // allow its soft falloff
const ground = new Uint8Array(N);
const stack = [];
const push = (i) => {
  if (!ground[i] && data[i] >= GROW) {
    ground[i] = 1;
    stack.push(i);
  }
};
for (let x = 0; x < W; x++) {
  if (data[x] >= SEED) push(x);
  const b = (H - 1) * W + x;
  if (data[b] >= SEED) push(b);
}
for (let y = 0; y < H; y++) {
  if (data[y * W] >= SEED) push(y * W);
  const r = y * W + W - 1;
  if (data[r] >= SEED) push(r);
}
while (stack.length) {
  const i = stack.pop();
  const x = i % W;
  if (x > 0) push(i - 1);
  if (x < W - 1) push(i + 1);
  if (i >= W) push(i - W);
  if (i < N - W) push(i + W);
}

// ── Separable box blur on a Float32 field ──
function blur(field, r, passes = 1) {
  let a = field;
  let b = new Float32Array(N);
  for (let p = 0; p < passes; p++) {
    for (let y = 0; y < H; y++) {
      let acc = 0;
      const row = y * W;
      for (let x = -r; x <= r; x++) acc += a[row + Math.min(W - 1, Math.max(0, x))];
      for (let x = 0; x < W; x++) {
        b[row + x] = acc / (2 * r + 1);
        acc += a[row + Math.min(W - 1, x + r + 1)] - a[row + Math.max(0, x - r)];
      }
    }
    for (let x = 0; x < W; x++) {
      let acc = 0;
      for (let y = -r; y <= r; y++) acc += b[Math.min(H - 1, Math.max(0, y)) * W + x];
      for (let y = 0; y < H; y++) {
        a[y * W + x] = acc / (2 * r + 1);
        acc += b[Math.min(H - 1, y + r + 1) * W + x] - b[Math.max(0, y - r) * W + x];
      }
    }
  }
  return a;
}

// Matte with a one-pixel feather; light-ground fringe is softened by the
// pixel's own lightness so stray hairs keep their weight.
const matte = new Float32Array(N);
for (let i = 0; i < N; i++) matte[i] = ground[i] ? 0 : 1;
blur(matte, 1, 1);

const rgba = Buffer.alloc(N * 4);
const color = await sharp(src).resize({ width: OUT_W }).removeAlpha().raw().toBuffer();
for (let i = 0; i < N; i++) {
  rgba[i * 4] = color[i * 3];
  rgba[i * 4 + 1] = color[i * 3 + 1];
  rgba[i * 4 + 2] = color[i * 3 + 2];
  rgba[i * 4 + 3] = Math.round(Math.min(1, matte[i]) * 255);
}
await sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
  .webp({ quality: 88, alphaQuality: 90 })
  .toFile('public/home/retrato-cut.webp');

// ── Depth: an inflated silhouette — far edges, near centre mass ──
const depth = new Float32Array(N);
for (let i = 0; i < N; i++) depth[i] = ground[i] ? 0 : 1;
blur(depth, 42, 3);
let max = 0;
for (let i = 0; i < N; i++) max = Math.max(max, depth[i]);
const depthBytes = Buffer.alloc(N);
for (let i = 0; i < N; i++) depthBytes[i] = Math.round(Math.pow(depth[i] / max, 0.75) * 255);
await sharp(depthBytes, { raw: { width: W, height: H, channels: 1 } })
  .resize({ width: 512 })
  .png()
  .toFile('public/home/retrato-depth.png');

console.log(`ok ${W}x${H}`);
