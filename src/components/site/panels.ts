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
  | 'phantom-commerce'
  | 'guessquest'
  | 'estacao-sao-paulo'
  | 'lucas-patterns'
  | 'mirante'
  | 'prancha';

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
    // video built from the real KERN screens (recent files on the live app show client work)
    shots: [{ src: '/projects/kern/tela.webp', clip: '/projects/kern/panel.mp4' }, { src: '/projects/kern/chapa.webp' }],
    media: video('kern', '/projects/kern/tela.webp'),
  },
  {
    slug: 'designon',
    title: 'DesignOn',
    short: 'DesignOn',
    note: 'App interno · PWA',
    tone: '#e879f9',
    icon: '/icons/app/designon.png',
    // screens from a local run with a fictional demo company (no real data, name or logo)
    shots: [{ src: '/projects/designon/inicio.webp', clip: '/projects/designon/panel.mp4' }],
    media: video('designon', '/projects/designon/preview-poster.webp'),
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
    media: video('netos', '/projects/netos/preview-poster.webp'),
  },
  {
    slug: 'medical-chatbot',
    title: 'Medical AI Chatbot',
    short: 'Medical AI',
    note: 'React · Voz + texto',
    tone: '#2dd4bf',
    icon: '/icons/app/medical-chatbot.png',
    // the repo's own tutorial recording (PI3-4l/frontend/src/assets/tutorial.mp4)
    shots: [{ src: '/projects/chatbot/Chat.png', clip: '/projects/chatbot/panel.mp4' }],
    media: video('chatbot', '/projects/chatbot/preview-poster.webp'),
  },
  {
    slug: 'phantom-commerce',
    title: 'Phantom Commerce',
    short: 'Phantom',
    note: 'Next.js · Firebase',
    tone: '#f472b6',
    icon: '/icons/app/phantom-commerce.png',
    // video built from the real screens (the app needs its private Firebase keys to run)
    shots: [{ src: '/projects/PhantomComerce/example_productpage.png', clip: '/projects/PhantomComerce/panel.mp4' }],
    media: video('PhantomComerce', '/projects/PhantomComerce/example_productpage.png'),
  },
  {
    slug: 'guessquest',
    title: 'GuessQuest',
    short: 'GuessQuest',
    note: 'JavaFX · RAWG',
    tone: '#22d3ee',
    icon: '/icons/app/guessquest.png',
    // cut from Lucas's own play-through recording
    shots: [{ src: '/projects/guessquest/game.webp', clip: '/projects/guessquest/panel.mp4' }],
    media: video('guessquest', '/projects/guessquest/preview-poster.webp'),
  },
  {
    slug: 'estacao-sao-paulo',
    title: 'Dashboard Meteorológica',
    short: 'Meteorológica',
    note: 'React · Clima',
    tone: '#ffb357',
    icon: '/icons/app/estacao.png',
    // recorded from the live site (sample data); the city footage is from Pexels
    shots: [{ src: '/projects/estacao/inicio.webp', clip: '/projects/estacao/panel.mp4' }],
    media: video('estacao', '/projects/estacao/inicio.webp'),
  },
  {
    slug: 'lucas-patterns',
    title: 'lucas-patterns',
    short: 'lucas-patterns',
    note: 'Skill · Claude Code',
    tone: '#e8e4dc',
    icon: '/icons/app/lucas-patterns.png',
    // the weather station before and after the skill, wiped from one to the other
    shots: [{ src: '/projects/lucas-patterns/inicio.webp', clip: '/projects/lucas-patterns/panel.mp4' }],
    media: video('lucas-patterns', '/projects/lucas-patterns/inicio.webp'),
  },
  {
    slug: 'mirante',
    title: 'Mirante Imóveis',
    short: 'Mirante',
    note: 'HTML · WebGL',
    tone: '#c08a66',
    icon: '/icons/app/mirante.png',
    // recorded from the site (sample listings); landscape photos from Unsplash
    shots: [{ src: '/projects/mirante/inicio.webp', clip: '/projects/mirante/panel.mp4' }],
    media: video('mirante', '/projects/mirante/inicio.webp'),
  },
  {
    slug: 'prancha',
    title: 'Prancha',
    short: 'Prancha',
    note: 'Next.js · Gemini',
    tone: '#8e8e93',
    icon: '/icons/app/prancha.png',
    // recorded from the live demo (sample clients, replies from the offline template)
    shots: [{ src: '/projects/prancha/inicio.webp', clip: '/projects/prancha/panel.mp4' }],
    media: video('prancha', '/projects/prancha/inicio.webp'),
  },
];

// ── Derived ──────────────────────────────

// Every card on the ring: the projects, plus one about Lucas himself.
export type PanelId = ProjectId | 'about';

// One glass card per project: icon, name and note on top, its screen below.
export type Panel = {
  slug: PanelId;
  title: string;
  note: string;
  tone: string;
  icon?: string;
  shot?: string;
  clip?: string;
};

// "About me" rides the ring like a project; it opens into the bio, not a case
export const ABOUT_PANEL: Panel = {
  slug: 'about',
  title: 'Lucas Sckenal',
  note: 'Unijuí · RS',
  tone: '#8a8a8a',
  icon: '/icons/app/lucas.webp',
  shot: '/home/about-panel.webp',
};

const projectPanels: Panel[] = SHOWCASE.map((p) => ({
  slug: p.slug,
  title: p.short,
  note: p.note,
  tone: p.tone,
  icon: p.icon,
  shot: p.shots[0]?.src,
  clip: p.shots[0]?.clip,
}));
// second on the ring: near the front when the page opens, after the lead project
export const PANELS: Panel[] = [projectPanels[0], ABOUT_PANEL, ...projectPanels.slice(1)];

export const PROJECTS = Object.fromEntries(
  SHOWCASE.map((p) => [p.slug, { title: p.title, media: p.media }])
) as Record<ProjectId, ProjectView>;

export const PROJECT_ORDER = SHOWCASE.map((p) => p.slug);
