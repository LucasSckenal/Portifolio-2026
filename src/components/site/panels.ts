// =========================================
// The showcase: every project that orbits the head, in priority order.
//
// Everything on the home derives from this one list — the orbit panels,
// their layout, the keyboard list and the expanded view. To add a project,
// add an entry here (and its case in src/content/projects.ts); the ring
// re-lays itself out.
// =========================================

import { KERN_NAME } from '@/content/names';

export type ProjectId =
  | 'ilha'
  | 'kern'
  | 'designon'
  | 'ma-finance-os'
  | 'nexo'
  | 'lj-treinamento-integrado'
  | 'onde-estao-os-netos'
  | 'medical-chatbot'
  | 'phantom-commerce';

type Shot = { src: string; clip?: string }; // clip: 5 s, 640×400 loop (plays while facing you)

type Showcase = {
  slug: ProjectId;
  title: string; // full name, used in the expanded view
  short: string; // name on the glass card
  note: string;
  tone: string;
  shots: Shot[]; // screen tiles in the orbit (0–2 is plenty)
  media: ProjectView['media'];
};

export type ProjectView = {
  title: string;
  media:
    | { kind: 'video'; poster: string; sources: Array<{ src: string; type: string }> }
    | { kind: 'image'; src: string }
    // internal work: no screens can be shown, the panel carries a line instead
    | { kind: 'note'; text: string };
};

const video = (dir: string, poster: string, file = 'preview'): ProjectView['media'] => ({
  kind: 'video',
  poster,
  sources: [
    { src: `/projects/${dir}/${file}.webm`, type: 'video/webm' },
    { src: `/projects/${dir}/${file}.mp4`, type: 'video/mp4' },
  ],
});

export const SHOWCASE: Showcase[] = [
  {
    slug: 'ilha',
    title: 'Ilha',
    short: 'Ilha',
    note: 'Rust · Ayla',
    tone: '#38bdf8',
    shots: [
      { src: '/projects/ilha/inicio.webp', clip: '/projects/ilha/panel.mp4' },
      { src: '/projects/ilha/musica.webp' },
    ],
    media: video('ilha', '/projects/ilha/inicio.webp'),
  },
  {
    slug: 'kern',
    title: KERN_NAME,
    short: KERN_NAME,
    note: 'CAD / CAM · C++',
    tone: '#3b82f6',
    shots: [{ src: '/projects/kern/tela.webp' }, { src: '/projects/kern/chapa.webp' }],
    media: { kind: 'image', src: '/projects/kern/tela.webp' },
  },
  {
    slug: 'designon',
    title: 'DesignOn',
    short: 'DesignOn',
    note: 'App interno · PWA',
    tone: '#e879f9',
    shots: [],
    media: { kind: 'note', text: 'Estoque, pedidos e caixa de uma empresa num app só — no bolso de quem está na obra.' },
  },
  {
    slug: 'ma-finance-os',
    title: 'Ma Finance OS',
    short: 'Ma Finance',
    note: 'SaaS · Gemini',
    tone: '#9be15d',
    shots: [{ src: '/projects/ma-finance-os/dashboard.png', clip: '/projects/ma-finance-os/panel.mp4' }],
    media: video('ma-finance-os', '/projects/ma-finance-os/dashboard.png', 'Preview'),
  },
  {
    slug: 'nexo',
    title: 'Nexo',
    short: 'Nexo',
    note: 'Kanban · Gemini',
    tone: '#a78bfa',
    shots: [{ src: '/projects/nexo/Kanbam.png', clip: '/projects/nexo/panel.mp4' }],
    media: video('nexo', '/projects/nexo/Kanbam.png'),
  },
  {
    slug: 'lj-treinamento-integrado',
    title: 'LJ Treinamento Integrado',
    short: 'LJ Studio',
    note: 'Next.js · WhatsApp',
    tone: '#fb923c',
    shots: [{ src: '/projects/lj/hero.png', clip: '/projects/lj/panel.mp4' }],
    media: video('lj', '/projects/lj/hero.png'),
  },
  {
    slug: 'onde-estao-os-netos',
    title: 'Onde Estão os Netos?',
    short: 'Netos?',
    note: 'Godot · Tower Defense',
    tone: '#60a5fa',
    shots: [],
    media: {
      kind: 'image',
      src: 'https://raw.githubusercontent.com/LucasSckenal/pi-4/main/docs/screenshots/gameplay_noite.png',
    },
  },
  {
    slug: 'medical-chatbot',
    title: 'Medical AI Chatbot',
    short: 'Medical AI',
    note: 'React · Voz + texto',
    tone: '#2dd4bf',
    shots: [{ src: '/projects/chatbot/Chat.png' }],
    media: { kind: 'image', src: '/projects/chatbot/Chat.png' },
  },
  {
    slug: 'phantom-commerce',
    title: 'Phantom Commerce',
    short: 'Phantom',
    note: 'Next.js · Firebase',
    tone: '#f472b6',
    shots: [{ src: '/projects/PhantomComerce/example_productpage.png' }],
    media: { kind: 'image', src: '/projects/PhantomComerce/example_productpage.png' },
  },
];

// ── Derived ──────────────────────────────

export type Panel =
  | { kind: 'label'; slug: ProjectId; title: string; note: string; tone: string }
  | { kind: 'image'; slug: ProjectId; src: string; clip?: string };

// Each project's glass card first, then its screens. Interleaving by round
// keeps the leading projects spread around the ring instead of bunched.
export const PANELS: Panel[] = (() => {
  const queues = SHOWCASE.map((p) => [
    { kind: 'label' as const, slug: p.slug, title: p.short, note: p.note, tone: p.tone },
    ...p.shots.map((s) => ({ kind: 'image' as const, slug: p.slug, ...s })),
  ]);
  const out: Panel[] = [];
  for (let round = 0; queues.some((q) => q.length); round++) {
    for (const q of queues) {
      const next = q.shift();
      if (next) out.push(next);
    }
  }
  return out;
})();

export const PROJECTS = Object.fromEntries(
  SHOWCASE.map((p) => [p.slug, { title: p.title, media: p.media }])
) as Record<ProjectId, ProjectView>;

export const PROJECT_ORDER = SHOWCASE.map((p) => p.slug);
