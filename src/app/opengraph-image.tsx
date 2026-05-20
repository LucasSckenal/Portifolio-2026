import { ImageResponse } from 'next/og';

// next/og — generates the OG share image at build/edge time.
// Renders to PNG via Vercel's satori under the hood.

export const runtime = 'edge';
export const alt = 'Lucas Sckenal — Cinematic interfaces, game UI, motion.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background:
            'radial-gradient(ellipse at 70% 30%, #2A2522 0%, #1A1816 60%, #0E0D0B 100%)',
          color: '#EEEAE3',
          display: 'flex',
          flexDirection: 'column',
          padding: '80px',
          fontFamily: 'Georgia, serif',
          position: 'relative',
        }}
      >
        {/* Top label row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 22,
            letterSpacing: 4,
            textTransform: 'uppercase',
            opacity: 0.55,
            fontFamily: 'monospace',
          }}
        >
          <span>Lucas — 001 / Portfolio</span>
          <span>MMXXVI · Frontend / Motion</span>
        </div>

        {/* Giant kanji watermark */}
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -20,
            fontSize: 600,
            lineHeight: 0.85,
            color: '#8C2A1F',
            opacity: 0.12,
            fontWeight: 300,
            display: 'flex',
          }}
        >
          静
        </div>

        {/* Bottom content */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <div
            style={{
              fontSize: 108,
              lineHeight: 0.95,
              fontWeight: 300,
              letterSpacing: -2,
              display: 'flex',
            }}
          >
            Interfaces that move
          </div>
          <div
            style={{
              fontSize: 108,
              lineHeight: 0.95,
              fontWeight: 300,
              letterSpacing: -2,
              fontStyle: 'italic',
              color: 'rgba(238, 234, 227, 0.82)',
              paddingLeft: 36,
              display: 'flex',
            }}
          >
            like cinema.
          </div>

          <div
            style={{
              marginTop: 28,
              paddingTop: 24,
              borderTop: '1px solid rgba(238, 234, 227, 0.18)',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 22,
              letterSpacing: 3,
              textTransform: 'uppercase',
              opacity: 0.65,
              fontFamily: 'monospace',
            }}
          >
            <span>Lucas Sckenal · Creative Frontend Developer</span>
            <span style={{ color: '#8C2A1F' }}>静寂 · Quiet practice</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
