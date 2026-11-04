// Builds the head-turn frames for the hero from a short video of the
// portrait turning its head (generated from the same photo).
//
//   public/home/head/f00.webp … fNN.webp  RGBA frames, figure cut out
//   public/home/head/depth.png            relief maps of all frames, 5×5 atlas
//   public/home/head/poster.webp          frame 0 at full width (DOM poster)
//
// usage: node scripts/head-frames.mjs <video> [start=0] [end=3] [count=25]
// Frame 0 is the start pose, the last frame the end pose; the site maps
// the pointer across them (see HeroScene → HEAD).
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';

const [video, startArg = '0', endArg = '3', countArg = '25'] = process.argv.slice(2);
if (!video) {
  console.error('usage: node scripts/head-frames.mjs <video> [start] [end] [count]');
  process.exit(1);
}
const START = parseFloat(startArg);
const END = parseFloat(endArg);
const COUNT = parseInt(countArg, 10);
const W = 1024;
const H = 576;
const DW = 256; // depth tile
const DH = 144;
const COLS = 5;

const out = 'public/home/head';
mkdirSync(out, { recursive: true });
const tmp = mkdtempSync(join(tmpdir(), 'head-'));

function matte(gray, w, h) {
  const N = w * h;
  const ground = new Uint8Array(N);
  const stack = [];
  const push = (i) => {
    if (!ground[i] && gray[i] >= 224) {
      ground[i] = 1;
      stack.push(i);
    }
  };
  for (let x = 0; x < w; x++) {
    if (gray[x] >= 230) push(x);
  }
  for (let y = 0; y < h; y++) {
    if (gray[y * w] >= 230) push(y * w);
    if (gray[y * w + w - 1] >= 230) push(y * w + w - 1);
  }
  while (stack.length) {
    const i = stack.pop();
    const x = i % w;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (i >= w) push(i - w);
    if (i < N - w) push(i + w);
  }
  return ground;
}

function boxBlur(field, w, h, r, passes) {
  const N = w * h;
  let a = field;
  const b = new Float32Array(N);
  for (let p = 0; p < passes; p++) {
    for (let y = 0; y < h; y++) {
      let acc = 0;
      const row = y * w;
      for (let x = -r; x <= r; x++) acc += a[row + Math.min(w - 1, Math.max(0, x))];
      for (let x = 0; x < w; x++) {
        b[row + x] = acc / (2 * r + 1);
        acc += a[row + Math.min(w - 1, x + r + 1)] - a[row + Math.max(0, x - r)];
      }
    }
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let y = -r; y <= r; y++) acc += b[Math.min(h - 1, Math.max(0, y)) * w + x];
      for (let y = 0; y < h; y++) {
        a[y * w + x] = acc / (2 * r + 1);
        acc += b[Math.min(h - 1, y + r + 1) * w + x] - b[Math.max(0, y - r) * w + x];
      }
    }
  }
  return a;
}

async function cutFrame(png, width, height) {
  const { data: gray } = await sharp(png).resize({ width, height }).greyscale().raw().toBuffer({ resolveWithObject: true });
  const color = await sharp(png).resize({ width, height }).greyscale().raw().toBuffer();
  const ground = matte(gray, width, height);
  const N = width * height;
  const m = new Float32Array(N);
  for (let i = 0; i < N; i++) m[i] = ground[i] ? 0 : 1;
  boxBlur(m, width, height, 1, 1);
  const rgba = Buffer.alloc(N * 4);
  for (let i = 0; i < N; i++) {
    rgba[i * 4] = rgba[i * 4 + 1] = rgba[i * 4 + 2] = color[i];
    rgba[i * 4 + 3] = Math.round(Math.min(1, m[i]) * 255);
  }
  return { rgba, ground };
}

try {
  const atlas = Buffer.alloc(DW * COLS * DH * Math.ceil(COUNT / COLS));
  const atlasW = DW * COLS;
  for (let k = 0; k < COUNT; k++) {
    const t = START + ((END - START) * k) / (COUNT - 1);
    const png = join(tmp, `f${k}.png`);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', t.toFixed(3), '-i', video, '-frames:v', '1', png]);

    const { rgba, ground } = await cutFrame(png, W, H);
    const name = `f${String(k).padStart(2, '0')}.webp`;
    await sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
      .webp({ quality: 84, alphaQuality: 88 })
      .toFile(join(out, name));

    if (k === 0) {
      const big = await cutFrame(png, 1280, 720);
      await sharp(big.rgba, { raw: { width: 1280, height: 720, channels: 4 } })
        .webp({ quality: 86, alphaQuality: 90 })
        .toFile(join(out, 'poster.webp'));
    }

    // relief: inflated silhouette, small, into the atlas
    const d = new Float32Array(W * H);
    for (let i = 0; i < W * H; i++) d[i] = ground[i] ? 0 : 1;
    boxBlur(d, W, H, 28, 3);
    let max = 0;
    for (const v of d) max = Math.max(max, v);
    const bytes = Buffer.alloc(W * H);
    for (let i = 0; i < W * H; i++) bytes[i] = Math.round(Math.pow(d[i] / (max || 1), 0.75) * 255);
    const small = await sharp(bytes, { raw: { width: W, height: H, channels: 1 } })
      .resize({ width: DW, height: DH })
      .raw()
      .toBuffer();
    const ox = (k % COLS) * DW;
    const oy = Math.floor(k / COLS) * DH;
    for (let y = 0; y < DH; y++) small.copy(atlas, (oy + y) * atlasW + ox, y * DW, y * DW + DW);
  }
  await sharp(atlas, { raw: { width: atlasW, height: DH * Math.ceil(COUNT / COLS), channels: 1 } })
    .png()
    .toFile(join(out, 'depth.png'));
  console.log(`ok: ${COUNT} frames ${START}s → ${END}s`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
