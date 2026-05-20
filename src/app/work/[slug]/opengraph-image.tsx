import { ImageResponse } from 'next/og';
import { projects, getProject } from '@/content/projects';

// Generates a unique OG image per case study, served at edge runtime.
// When sharing /work/onde-estao-os-netos on social, the preview shows the
// project's specific kanji + title + tagline, not the home page one.

export const runtime = 'edge';
export const alt = 'Case study';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateImageMetadata() {
  return projects.map((p) => ({
    id: p.slug,
    alt: `${p.title} — case study`,
    contentType,
    size,
  }));
}

const moodPalette = {
  dark: {
    bg:    'radial-gradient(ellipse at 70% 30%, #1F1B17 0%, #14120F 60%, #0A0907 100%)',
    text:  '#F2EFE9',
    mute:  'rgba(242, 239, 233, 0.55)',
    title: '#F2EFE9',
  },
  light: {
    bg:    'radial-gradient(ellipse at 30% 30%, #FAF7F0 0%, #F3EFE7 60%, #E7E2D7 100%)',
    text:  '#0E0D0B',
    mute:  'rgba(14, 13, 11, 0.55)',
    title: '#0E0D0B',
  },
  glass: {
    bg:    'radial-gradient(ellipse at 70% 30%, #1A1814 0%, #0F0E0C 60%, #06050A 100%)',
    text:  '#F2EFE9',
    mute:  'rgba(242, 239, 233, 0.55)',
    title: '#F2EFE9',
  },
};

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) {
    return new Response('Not found', { status: 404 });
  }

  const palette = moodPalette[project.mood];
  const accent = '#8C2A1F';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: palette.bg,
          color: palette.text,
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
            opacity: 0.6,
            fontFamily: 'monospace',
            color: palette.mute,
          }}
        >
          <span>{project.index} / 03 · Case study</span>
          <span>{project.year}</span>
        </div>

        {/* Giant kanji watermark */}
        <div
          style={{
            position: 'absolute',
            top: -60,
            right: -40,
            fontSize: 640,
            lineHeight: 0.85,
            color: accent,
            opacity: 0.13,
            fontWeight: 300,
            display: 'flex',
          }}
        >
          {project.jp}
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
              fontSize: 96,
              lineHeight: 0.96,
              fontWeight: 300,
              letterSpacing: -2,
              color: palette.title,
              display: 'flex',
              maxWidth: '85%',
            }}
          >
            {project.title}
          </div>
          <div
            style={{
              fontSize: 36,
              lineHeight: 1.25,
              fontWeight: 300,
              fontStyle: 'italic',
              color: palette.text,
              opacity: 0.78,
              maxWidth: '75%',
              display: 'flex',
            }}
          >
            {project.tagline}
          </div>

          <div
            style={{
              marginTop: 28,
              paddingTop: 24,
              borderTop: `1px solid ${palette.mute}`,
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 22,
              letterSpacing: 3,
              textTransform: 'uppercase',
              opacity: 0.7,
              fontFamily: 'monospace',
              color: palette.mute,
            }}
          >
            <span>Lucas Sckenal · {project.roles[0]}</span>
            <span style={{ color: accent }}>{project.jpLabel}</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
