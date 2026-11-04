// Builds an edition's animated thumbnail: a short crossfaded loop of
// captures, 480×300, as an H.264 MP4 (far lighter than a GIF), plus the
// still poster.
//
// usage: node scripts/edition-thumb.mjs <id> <frame1> <frame2> [...]
//   → public/editions/<id>.webp  (poster, first frame)
//     public/editions/<id>.mp4   (loop)
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';

const [id, ...frames] = process.argv.slice(2);
if (!id || frames.length < 2) {
  console.error('usage: node scripts/edition-thumb.mjs <id> <frame1> <frame2> [...]');
  process.exit(1);
}

const W = 480;
const H = 300;
const HOLD = 1.1; // seconds each capture stays
const FADE = 0.35;

const dir = mkdtempSync(join(tmpdir(), 'edition-'));
try {
  const pngs = [];
  for (const [i, f] of frames.entries()) {
    const out = join(dir, `f${i}.png`);
    await sharp(f).resize({ width: W, height: H, fit: 'cover', position: 'top' }).png().toFile(out);
    pngs.push(out);
  }
  await sharp(pngs[0]).webp({ quality: 80 }).toFile(`public/editions/${id}.webp`);

  // Loop back to the first frame so the clip repeats seamlessly
  const seq = [...pngs, pngs[0]];
  const inputs = seq.flatMap((p) => ['-loop', '1', '-t', String(HOLD + FADE), '-i', p]);
  let chain = '';
  let prev = '[0:v]';
  for (let i = 1; i < seq.length; i++) {
    const label = i === seq.length - 1 ? '[out]' : `[x${i}]`;
    chain += `${prev}[${i}:v]xfade=transition=fade:duration=${FADE}:offset=${(HOLD * i).toFixed(2)}${label};`;
    prev = `[x${i}]`;
  }
  chain = chain.replace(/;$/, '');
  const total = HOLD * (seq.length - 1);

  const common = ['-v', 'error', '-y', ...inputs, '-filter_complex', chain, '-map', '[out]', '-t', total.toFixed(2), '-r', '24'];
  execFileSync('ffmpeg', [...common, '-c:v', 'libx264', '-crf', '30', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `public/editions/${id}.mp4`]);
  console.log(`ok ${id}: ${frames.length} frames, ${total.toFixed(1)}s`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
