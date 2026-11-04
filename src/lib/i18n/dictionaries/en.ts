import type { Dictionary } from '../types';

export const en: Dictionary = {
  meta: {
    available: 'Available · 2026',
  },
  nav: {
    index: 'Index',
    work: 'Work',
    about: 'About',
    lab: 'Lab',
    contact: 'Contact',
  },
  hero: {
    label1: 'Lucas — 001 / Portfolio',
    label2: 'MMXXVI · Frontend / Motion',
    title: ['Six worlds.', 'Three projects.', 'One quiet practice.'],
    bio1: 'Lucas — creative frontend developer',
    bio2: 'crafting immersive, cinematic interfaces.',
    scroll: 'Scroll',
    titleNight: ['Sketches.', 'Experiments.', 'Studies of light.'],
    bio1Night: 'Lucas — frontend developer',
    bio2Night: 'tinkering after the clients are asleep.',
  },
  about: {
    label: '002 — About',
    labelJp: '間 · Ma',
    titleLine1: 'Building worlds',
    titleLine2: 'inside the browser.',
    paragraphs: [
      "I'm Lucas — a frontend developer drawn to digital experiences that go beyond function. The kind that feel cinematic, atmospheric, visually intentional in every detail.",
      'My practice favors modern UI, smooth motion, and the texture of game-inspired interfaces. I try to thread creativity, performance, and a premium feeling into the same work — never one at the cost of the others.',
      'Currently building a Tower Defense game shaped for elderly players, a team workspace where AI sits inside the work instead of in a sidebar, and a boutique training studio site that reads like a private practice. Each one is an attempt to give software an identity, an atmosphere, an intent.',
      'I draw from Japanese minimalism, cinematic motion design, and the Apple / Awwwards school of premium interfaces. The goal: products people remember not for the code, but for the experience they transmit.',
    ],
    caption: 'A self-portrait, in process.',
    statFocusLabel: 'Focus',
    statFocusValue: 'Motion · UI',
    statBuildingLabel: 'Building',
    statBuildingValue: 'Game · Web',
    statCurrentlyLabel: 'Currently',
    statCurrentlyValue: 'Open to work',
  },
  projects: {
    label: '003 — Selected work',
    labelJp: '作 · Sakuhin',
    titleLine1: 'Three worlds',
    titleLine2: 'from the practice.',
    intro:
      'A game built for grandparents, a workspace where AI lives inside the loop, and a boutique studio that sells trust before access — each treated as its own atmosphere rather than a product spec.',
    caseStudyCta: 'Case study',
    liveCta: 'Live',
    repoCta: 'Repo',
    moreLine: 'More work, case studies and process notes —',
    moreLink: 'all work →',
  },
  projectsNight: {
    label: '003 — After hours',
    titleLine1: 'Two studies',
    titleLine2: 'from the university years.',
    intro:
      'Built during my degree at Unijui — full-stack projects shaped in coursework, kept here as foundations rather than client deliverables. Smaller in budget, larger in learning.',
    moreLine: 'More from the foundation years —',
    moreLink: 'all work →',
  },
  nightReading: {
    label: '↳ Night work · references',
    titleLine1: 'The library',
    titleLine2: 'behind the studio.',
    intro:
      'The work that follows is shaped by these — books, films, talks, albums that I keep returning to. Not credits; coordinates.',
  },
  gameWorlds: {
    label: '↳ Onde Estão os Netos? · supplementary',
    titleLine1: 'Six themed worlds',
    titleLine2: 'to cross.',
    intro:
      'Each map carries its own visual identity, NavMesh, enemy roster, base architecture and soundtrack — six self-contained chambers the player moves through in sequence.',
    worldPrefix: 'World',
  },
  stack: {
    label: '004 — Stack',
    labelJp: '道具 · Dōgu',
    titleLine1: 'Tools, never the',
    titleLine2: 'point of the work.',
    philosophyMotion: 'Motion',
    philosophyMotionDesc: 'Slow, intentional, cinematic.',
    philosophyComposition: 'Composition',
    philosophyCompositionDesc: 'Negative space as a feature.',
    philosophyCraft: 'Craft',
    philosophyCraftDesc: 'Polish in the last 10%.',
    philosophyCuriosity: 'Curiosity',
    philosophyCuriosityDesc: "Following what won't shut up.",
    philosophyPatience: 'Patience',
    philosophyPatienceDesc: 'No deadline. No shortcuts.',
    philosophyDrift: 'Drift',
    philosophyDriftDesc: 'Let the work suggest the next move.',
  },
  contact: {
    label: '005 — Contact',
    labelJp: '終 · Owari',
    titleLine1: "Let's make",
    titleLine2: 'something quiet,',
    titleLine3: 'and memorable.',
    body:
      'Available for select frontend, motion and visual-design collaborations in 2026. Game UI, cinematic web, premium product interfaces.',
    languagesLabel: 'Languages',
    footerIndexLabel: 'Index',
    footerIndexValue: 'Lucas Sckenal / MMXXVI',
    footerDisciplineLabel: 'Discipline',
    footerDisciplineValue: 'Frontend · Motion · UI',
    footerSignalLabel: 'Signal',
    footerSignalValue: 'Open to work',
    footerMadeWithLabel: 'Made with',
    footerMadeWithValue: 'Next · GSAP · Lenis',
    emailHover: 'Click — copies & opens',
    emailCopied: 'Copied ✓',
    bodyNightExtra: 'Night replies may come the next morning.',
    footerSignalValueNight: 'Quiet hours',
  },
  now: {
    "label": "Now · January 2026",
    "items": [
      "Building the Yōkai shader gallery — first 3 entries shipping soon.",
      "Reading “The Death of the Heart” (Bowen) and re-reading Tufte.",
      "Currently obsessed with Three.js post-processing and Japanese paper textures."
    ]
  },
  labPromo: {
    "label": "↳ Side experiments",
    "titleLine1": "What I build",
    "titleLine2": "without a brief.",
    "body": "Standalone WebGL pieces — built when the client work is shipped and the question becomes “what if?”. Each one lives on its own full route, no chrome, no exit signs except the way back.",
    "cta": "Enter the lab",
    "enter": "Enter"
  },
  lab: {
    "titleLine1": "Experiments",
    "titleLine2": "without a brief.",
    "intro": "Standalone WebGL pieces — built when the client work is shipped and the question is just “what if?”. Each one is a full immersive route on its own, no header, no chrome, no exit signs except the link back to the portfolio.",
    "enter": "Enter",
    "footer": "More pieces in development — shaders, audio-reactive sketches, kinetic type studies. Drop in occasionally.",
    "pieces": {
      "kagami": {
        "status": "Live",
        "tagline": "A floating torii in an infinite void.",
        "description": "A 3D study in stillness and disturbance. The torii suspended in pure darkness, the lanterns its only warmth. Mouse moves stir the water; sound enters when you ask."
      },
      "niwa": {
        "status": "WIP",
        "tagline": "A shallow pond, weathered stones, a leaf drifting.",
        "description": "A karesansui garden translated to WebGL — momiji leaves falling and rotating on the water surface around an old maple. Companion piece to Kagami."
      }
    }
  },
  work: {
    "label": "007 — Filmography",
    "titleLine1": "Every piece,",
    "titleLine2": "in chronological order.",
    "intro": "Started {year} · {count} pieces. Commercial work, personal experiments, academic projects, and weekend builds — all in one place. The featured three on the home are the highlights; this is the full reel.",
    "filters": {
      "all": "All",
      "commercial": "Commercial",
      "personal": "Personal",
      "academic": "Academic",
      "experiment": "Experiment"
    },
    "piece": "piece",
    "pieces": "pieces",
    "footer": "Looking for something specific?",
    "footerLink": "Ask directly ↗",
    "readCase": "Read case study →",
    "open": "Open ↗"
  },
  caseStudy: {
    "builtWith": "Built with",
    "live": "Live",
    "repo": "Repository",
    "previous": "← Previous",
    "next": "Next →",
    "bodyNote": ""
  },
  site: {
    "nav": {
      "work": "Work",
      "about": "About",
      "contact": "Contact",
      "cta": "Start a project",
      "language": "Language"
    },
    "hero": {
      "line1": "Interfaces that",
      "line2": "stay in your head.",
      "sub": "I'm Lucas. I build software and interfaces — web apps, sites and native desktop programs in Rust and C++, with AI inside.",
      "primary": "See the work",
      "secondary": "Watch it move",
      "cardLeftTitle": "Web and desktop",
      "cardLeftBody": "Next.js on the web, Rust and C++ on the desktop.",
      "cardRightTitle": "Open for freelance",
      "cardRightBody": "Taking on new projects, remote.",
      "liveLabel": "products live right now",
      "motto": "Less template. More intent.",
      "badge": "SOFTWARE · FRONTEND · FREELANCE · ",
      "dragHint": "Drag to spin",
      "viewProject": "See the project",
      "privacy": "Privacy",
      "close": "Close"
    },
    "versions": {
      "label": "Versions",
      "title": "Portfolio history",
      "current": "Current",
      "archived": "You are viewing an earlier edition",
      "backToCurrent": "See the current one"
    },
    "social": {
      "label": "Elsewhere",
      "title": "Find me around.",
      "body": "Hover a cell — every one of them is a door.",
      "center": "Let's talk",
      "copy": "Copy email",
      "copied": "Copied"
    }
  },
};
