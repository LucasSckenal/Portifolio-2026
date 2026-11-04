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
  icon?: string; // the app's own icon; without one the card draws a monogram
  shots: Shot[]; // first one is the card's screen (its clip plays while facing you)
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
    icon: '/icons/app/ilha.png',
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
    icon: '/icons/app/kern.png',
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
    icon: '/icons/app/ma-finance-os.png',
    shots: [{ src: '/projects/ma-finance-os/dashboard.png', clip: '/projects/ma-finance-os/panel.mp4' }],
    media: video('ma-finance-os', '/projects/ma-finance-os/dashboard.png', 'Preview'),
  },
  {
    slug: 'nexo',
    title: 'Nexo',
    short: 'Nexo',
    note: 'Kanban · Gemini',
    tone: '#a78bfa',
    icon: '/icons/app/nexo.png',
    shots: [{ src: '/projects/nexo/Kanbam.png', clip: '/projects/nexo/panel.mp4' }],
    media: video('nexo', '/projects/nexo/Kanbam.png'),
  },
  {
    slug: 'lj-treinamento-integrado',
    title: 'LJ Treinamento Integrado',
    short: 'LJ Studio',
    note: 'Next.js · WhatsApp',
    tone: '#fb923c',
    icon: '/icons/app/lj.png',
    shots: [{ src: '/projects/lj/hero.png', clip: '/projects/lj/panel.mp4' }],
    media: video('lj', '/projects/lj/hero.png'),
  },
  {
    slug: 'onde-estao-os-netos',
    title: 'Onde Estão os Netos?',
    short: 'Netos?',
    note: 'Godot · v4.1 lançado',
    tone: '#60a5fa',
    icon: '/icons/app/netos.png',
    // v4.1 captures: title screen, day build, night fight, power-up cards
    shots: [{ src: '/projects/netos/menu.webp', clip: '/projects/netos/panel.mp4' }],
    media: { kind: 'image', src: '/projects/netos/menu.webp' },
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

// One glass card per project: icon, name and note on top, its screen below.
export type Panel = {
  slug: ProjectId;
  title: string;
  note: string;
  tone: string;
  icon?: string;
  shot?: string;
  clip?: string;
};

export const PANELS: Panel[] = SHOWCASE.map((p) => ({
  slug: p.slug,
  title: p.short,
  note: p.note,
  tone: p.tone,
  icon: p.icon,
  shot: p.shots[0]?.src,
  clip: p.shots[0]?.clip,
}));

export const PROJECTS = Object.fromEntries(
  SHOWCASE.map((p) => [p.slug, { title: p.title, media: p.media }])
) as Record<ProjectId, ProjectView>;

export const PROJECT_ORDER = SHOWCASE.map((p) => p.slug);
