// =========================================
// Single source of truth for project data.
// Used by both the home Projects section and the /work/[slug] case study pages.
// =========================================

export type CaseSection =
  | { type: 'lead'; body: string }
  | { type: 'paragraph'; body: string }
  | { type: 'heading'; text: string; jp?: string; jpLabel?: string }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'gallery'; images: Array<{ src: string; alt: string; caption?: string }> }
  | { type: 'stats'; items: Array<{ label: string; value: string; jp?: string }> }
  | { type: 'divider' };

export type ProjectCase = {
  slug: string;
  index: string;
  title: string;
  jp: string;
  jpLabel: string;
  year: string;
  status: string;
  tagline: string;
  description: string;
  roles: string[];
  tech: string[];
  team?: string;
  href?: string;
  live?: string;
  mood: 'dark' | 'light' | 'glass';
  sections: CaseSection[];
};

export const projects: ProjectCase[] = [
  // ─────────────────────────────────────────
  // 01 — Onde Estão os Netos?
  // ─────────────────────────────────────────
  {
    slug: 'onde-estao-os-netos',
    index: '01',
    title: 'Onde Estão os Netos?',
    jp: '戦',
    jpLabel: '戦 · Battle',
    year: '2025',
    status: 'v1.0 · In development',
    tagline: 'A Tower Defense built for the player we never see.',
    description:
      'Two grandparents pulled into an antique board game must cross six perilous worlds to rescue their grandchildren. Built in Godot 4.6, designed from day one around accessibility for elderly players.',
    roles: ['Game UI', 'Tower Defense', 'Roguelike', 'Accessibility'],
    tech: ['Godot 4.6', 'GDScript', 'CSV-driven balancing'],
    team: 'Team of 4 · SENAC · UI / Frontend systems',
    href: 'https://github.com/LucasSckenal/pi-4',
    mood: 'dark',
    sections: [
      {
        type: 'lead',
        body:
          'A family is pulled into an antique board game. Two grandparents — Afonso and Berta — must cross six perilous worlds to rescue their grandchildren and find their way back home.',
      },
      {
        type: 'paragraph',
        body:
          'This is the seed of Onde Estão os Netos?, a Tower Defense game developed as Projeto Integrador IV at SENAC. It\'s a strange premise on purpose — most build-defense games drop you into a generic fantasy battlefield. We wanted players to feel like they had been transported somewhere personal.',
      },

      {
        type: 'heading',
        text: 'Designing for the player we never see',
        jp: '誰',
        jpLabel: '誰 · The other',
      },
      {
        type: 'paragraph',
        body:
          'Tower defense is, traditionally, a genre built around twitch responses. Place towers fast, react to threats, manage tempo, stack power-ups in tight windows.',
      },
      { type: 'paragraph', body: 'The audience for this game is the opposite of that.' },
      {
        type: 'paragraph',
        body:
          'We designed Onde Estão os Netos? for elderly players from day one — players who have never picked up a gamepad, who don\'t read fast on small screens, who get anxious when an interface punishes hesitation. Every design decision flows from there:',
      },
      {
        type: 'list',
        items: [
          'Large fonts and clear icons — readable from a comfortable distance',
          'Two well-defined phases per round (Day to prepare, Night to defend) — predictable rhythm, never rushed',
          'Fixed isometric camera — no spatial disorientation, ever',
          'Touch-only or click-only controls — no keyboard, no gamepad required',
          'Auto-attacking towers — the player makes the strategy, the game executes',
          'Lo-fi / Bossa Nova soundtrack — genuinely relaxing under pressure',
        ],
      },

      {
        type: 'image',
        src: 'https://raw.githubusercontent.com/LucasSckenal/pi-4/main/docs/screenshots/gameplay_noite.png',
        alt: 'Gameplay during a combat (night) phase',
        caption: 'Combat phase — auto-attacking towers, player controls only the tempo.',
      },

      {
        type: 'heading',
        text: 'The AI Advisor',
        jp: '師',
        jpLabel: '師 · Mentor',
      },
      {
        type: 'paragraph',
        body:
          'One of the systems I\'m proudest of in the project: an in-game advisor that watches what the player is doing and offers contextual suggestions.',
      },
      {
        type: 'paragraph',
        body:
          'It reads HP of the base, income per wave, free slots, threat level. Then it ranks recommendations from Urgent down to Low priority — "Build a sniper at the eastern choke point" or "You\'re falling behind on income; place a market this round."',
      },
      {
        type: 'quote',
        text:
          'It\'s not an autopilot. It\'s a calm voice over your shoulder — especially valuable for players who\'ve never played a strategy game.',
      },

      {
        type: 'heading',
        text: 'Six themed worlds',
        jp: '世界',
        jpLabel: '世界 · Sekai',
      },
      {
        type: 'paragraph',
        body:
          'Each map is its own self-contained chamber — unique theme, NavMesh, enemy roster, base architecture and soundtrack. The player crosses them in sequence.',
      },
      {
        type: 'stats',
        items: [
          { label: 'Floresta Medieval', value: 'Tutorial', jp: '森' },
          { label: 'Deserto Carmesim', value: 'Egípcio', jp: '砂' },
          { label: 'Mansão Assombrada', value: 'Terror', jp: '幽' },
          { label: 'Fenda dos Piratas', value: 'Oceano', jp: '海' },
          { label: 'Planeta Maluco', value: 'Sci-Fi', jp: '宙' },
          { label: 'Covil do Dragão', value: 'Final', jp: '龍' },
        ],
      },

      {
        type: 'heading',
        text: 'Roguelike between rounds',
        jp: '札',
        jpLabel: '札 · Cards',
      },
      {
        type: 'paragraph',
        body:
          'At the end of each phase, the player picks one power-up card from three random options. Seven cards drive build variety across runs — Balística Pesada (heavy artillery), Frequência Crítica (more crits), Fúria (faster attacks), Gelo (slowing towers), Imposto de Guerra (more income), Muralhas Reforçadas (stronger walls), and Engenharia Eficiente (cheaper builds).',
      },

      {
        type: 'heading',
        text: 'Stack & process',
        jp: '工',
        jpLabel: '工 · Craft',
      },
      {
        type: 'paragraph',
        body:
          'Built in Godot 4.6 with GDScript. Game balancing is driven by a CSV file — multipliers for HP, damage, and speed are read at runtime, so the team can rebalance without rebuilding the project.',
      },
      {
        type: 'paragraph',
        body:
          'Autoloads (singletons) handle global state: game manager, balance parser, music, build slot manager, achievement popups, AI memory. The result is a clean separation between gameplay logic and presentation that made the UI iteration fast.',
      },

      {
        type: 'heading',
        text: 'Reflection',
        jp: '思',
        jpLabel: '思 · Reflection',
      },
      {
        type: 'paragraph',
        body:
          'The hardest part wasn\'t the towers, the enemies, or the cards. It was teaching ourselves to remove things — extra animation, extra punctuation, extra steps — until what was left felt effortless to someone unfamiliar with games.',
      },
      {
        type: 'paragraph',
        body: 'That\'s the design lesson I\'m taking forward into web work.',
      },
    ],
  },

  // ─────────────────────────────────────────
  // 02 — Medical AI Chatbot
  // ─────────────────────────────────────────
  {
    slug: 'medical-chatbot',
    index: '02',
    title: 'Medical AI Chatbot',
    jp: '話',
    jpLabel: '話 · Speak',
    year: '2025',
    status: 'Live · Production',
    tagline: 'Voice or text symptoms, translated into structured triage.',
    description:
      'A multilingual medical assistant that turns patient symptoms — spoken or typed — into structured reports for faster clinical triage.',
    roles: ['Conversational UX', 'Voice + Text', 'Medical Triage', 'Multilingual'],
    tech: ['React', 'Vite', 'Node + Express', 'Firebase'],
    team: 'Team of 3 · Unijui · Front-End lead',
    href: 'https://github.com/LucasSckenal/PI3-4l',
    live: 'https://fourl-aplicativocov.onrender.com/login',
    mood: 'light',
    sections: [
      {
        type: 'lead',
        body:
          'A medical assistant that turns patient symptoms — spoken or typed — into structured reports for faster clinical triage.',
      },
      {
        type: 'paragraph',
        body:
          'Built during Projeto Integrador III at Unijui (Ciência de Dados e Analytics), this is a multilingual conversational interface designed around low-anxiety conversation. Patients describe what they\'re feeling — by voice or text — and the AI assembles a structured summary so the clinical team has context before the appointment begins.',
      },

      {
        type: 'image',
        src: '/projects/chatbot/Chat.png',
        alt: 'Chat interface with glowing AI orb',
        caption: 'The chat view — voice or text input, multilingual.',
      },

      {
        type: 'heading',
        text: 'What it does',
        jp: '機',
        jpLabel: '機 · Function',
      },
      {
        type: 'list',
        items: [
          'Voice or text input for symptom description',
          'Multilingual interface — Portuguese, Spanish, English',
          'Firebase authentication with persistent sessions',
          'Diagnostic history tracked per user',
          'Medical profile — blood type, weight, allergies, basic data',
          'Full UI theming — dark / light mode + custom accent color',
          'Symptom auto-tagging extracted from the conversation',
        ],
      },

      {
        type: 'gallery',
        images: [
          { src: '/projects/chatbot/Home.png', alt: 'Home dashboard view', caption: 'Home — diagnostic count, frequent symptoms, recent history.' },
          { src: '/projects/chatbot/Settings.png', alt: 'Settings view', caption: 'Settings — dark mode, language, custom accent color.' },
        ],
      },

      {
        type: 'quote',
        text:
          'The whole product sits at one bridge: patient anxiety on one side, clinical context on the other.',
      },

      {
        type: 'heading',
        text: 'Stack & integration',
        jp: '工',
        jpLabel: '工 · Craft',
      },
      {
        type: 'paragraph',
        body:
          'The frontend is React with Vite — fast HMR during development, clean ESM-first build. SCSS Modules for component-scoped styles. React Router for navigation. Context API for theme, auth and chat state. Axios for the API layer with JWT in the header.',
      },
      {
        type: 'paragraph',
        body:
          'The backend is Node + Express, exposing REST endpoints that proxy to language providers for the AI side. Firebase Authentication handles login; Firestore stores user profiles and conversation history. The whole thing is hosted on Render.',
      },

      {
        type: 'heading',
        text: 'The team',
        jp: '組',
        jpLabel: '組 · Group',
      },
      {
        type: 'paragraph',
        body:
          'A three-person collaboration at Unijui. I led the entire frontend — design system, theming, chat UX, voice integration, and profile management. Luan Vitor built the backend and AI integration. Henrique handled documentation and process.',
      },

      {
        type: 'heading',
        text: 'Try it',
        jp: '試',
        jpLabel: '試 · Try',
      },
      {
        type: 'paragraph',
        body:
          'The chatbot is live in production. Use the Live link above to register and try a full conversation in any of the three supported languages.',
      },
    ],
  },

  // ─────────────────────────────────────────
  // 03 — Phantom Commerce
  // ─────────────────────────────────────────
  {
    slug: 'phantom-commerce',
    index: '03',
    title: 'Phantom Commerce',
    jp: '幻',
    jpLabel: '幻 · Phantom',
    year: '2025',
    status: 'Live · Concept',
    tagline: 'The store as exhibit, not as catalogue.',
    description:
      'A gaming-focused commerce platform built around premium product presentation, animated interactions, and a glass-deep visual language.',
    roles: ['Ecommerce', 'Motion Design', 'Full-Stack', 'Brand'],
    tech: ['Next.js', 'Firebase', 'SCSS', 'Lucide'],
    team: 'Team of 3 · Unijui',
    href: 'https://github.com/LucasSckenal/PhantomCommercee',
    mood: 'glass',
    sections: [
      {
        type: 'lead',
        body:
          'A gaming-focused commerce platform built around premium product presentation and a glass-deep visual language.',
      },
      {
        type: 'paragraph',
        body:
          'Phantom treats each product as the subject of an exhibition rather than an entry in a catalogue. Heavy use of glass, neon edges, and patient motion — every page is composed like a gallery wall.',
      },
      {
        type: 'image',
        src: '/projects/PhantomComerce/example_productpage.png',
        alt: 'Product detail page',
        caption: 'Product detail — exhibition over catalogue.',
      },

      {
        type: 'heading',
        text: 'Why exhibition, not catalogue',
        jp: '場',
        jpLabel: '場 · Stage',
      },
      {
        type: 'paragraph',
        body:
          'Most game stores prioritize density — fitting as many products into the viewport as possible. We went the opposite way: each product gets room to breathe, soft lighting, and visual weight. The hypothesis is that the experience of browsing itself is part of what people pay for in premium retail.',
      },
      {
        type: 'quote',
        text:
          'Density treats every product as interchangeable. Exhibition makes each one feel chosen.',
      },

      {
        type: 'image',
        src: '/projects/PhantomComerce/homepage.png',
        alt: 'Store homepage',
        caption: 'Homepage — composed like a gallery wall.',
      },

      {
        type: 'heading',
        text: 'What\'s in it',
        jp: '機',
        jpLabel: '機 · Function',
      },
      {
        type: 'list',
        items: [
          'Game catalogue with filters and search',
          'Product detail pages — imagery, description, pricing',
          'Cart and checkout flow',
          'User authentication (login / logout)',
          'Admin panel for adding new products',
          'Responsive UI built for desktop-first browsing',
        ],
      },

      {
        type: 'heading',
        text: 'Stack',
        jp: '工',
        jpLabel: '工 · Craft',
      },
      {
        type: 'paragraph',
        body:
          'Built as a Next.js full-stack application — pages, API routes, and database access in one codebase. SCSS for styling, Lucide and React-Icons for the icon system, Firebase for authentication and Firestore for the product / user data.',
      },

      {
        type: 'heading',
        text: 'The team',
        jp: '組',
        jpLabel: '組 · Group',
      },
      {
        type: 'paragraph',
        body:
          'A three-person build at Unijui — Henrique, Luan, and myself. The project is open source on GitHub; pull requests and feedback welcome.',
      },
    ],
  },
];

// =========================================
// NIGHT PORTFOLIO — appears only when the user toggles to Night mode.
// These are experiments and personal explorations — the "after-hours studio"
// version of the practice. Fill in real content as you ship pieces.
// =========================================

export const nightProjects: ProjectCase[] = [
  {
    slug: 'yokai-shader-gallery',
    index: '01',
    title: 'Yōkai',
    jp: '妖',
    jpLabel: '妖 · Spirit',
    year: '2026',
    status: 'In progress · experiments',
    tagline: 'A gallery of shaders shaped like Japanese spirits.',
    description:
      'A personal series of fragment shaders, each one inspired by a yōkai — the strange creatures of Japanese folklore. Procedural, atmospheric, never the same on two refreshes.',
    roles: ['Shaders', 'WebGL', 'Procedural Art'],
    tech: ['Three.js', 'GLSL', 'WebGL'],
    href: 'https://github.com/LucasSckenal',
    mood: 'glass',
    sections: [
      {
        type: 'lead',
        body:
          'A gallery of fragment shaders, each shaped like a different yōkai — the strange creatures of Japanese folklore.',
      },
      {
        type: 'paragraph',
        body:
          'After the client work is shipped and the briefs are answered, I write shaders. Procedural, atmospheric, untethered from product requirements. This gallery is a small archive of them.',
      },
      {
        type: 'heading',
        text: 'Why yōkai',
        jp: '妖',
        jpLabel: '妖 · Spirit',
      },
      {
        type: 'paragraph',
        body:
          'Yōkai sit between things — between alive and dead, between visible and invisible, between threatening and friendly. That ambiguity is what shaders do too: each pixel is a function, but the result feels almost alive. It seemed honest to name them after spirits.',
      },
      {
        type: 'quote',
        text:
          'A shader is the closest a programmer gets to drawing with breath instead of lines.',
      },
      {
        type: 'paragraph',
        body:
          'More entries coming as I finish them. Each shader sketches a different creature — kasa-obake, kappa, tsukumogami — and the gallery is the way to wander through them.',
      },
    ],
  },

  {
    slug: 'tsuki-type-studies',
    index: '02',
    title: 'Tsuki',
    jp: '月',
    jpLabel: '月 · Moon',
    year: '2026',
    status: 'Ongoing · personal',
    tagline: 'Animated typography studies in kanji and latin.',
    description:
      'Slow letter-by-letter and stroke-by-stroke type animations. The kanji draw themselves in the order they would be written by hand; the latin glyphs morph through related forms.',
    roles: ['Motion Design', 'Type', 'SVG'],
    tech: ['GSAP', 'SVG', 'After Effects'],
    href: 'https://github.com/LucasSckenal',
    mood: 'dark',
    sections: [
      {
        type: 'lead',
        body:
          'Slow, deliberate type animations — kanji drawing themselves stroke by stroke, latin glyphs morphing through related forms.',
      },
      {
        type: 'paragraph',
        body:
          'When you watch a Japanese calligrapher, the order of strokes is fixed and reads almost like choreography. I started animating kanji in that exact order, then asked the same of latin letterforms — drawing them as if they were brush gestures, not glyphs sitting in place.',
      },
      {
        type: 'heading',
        text: 'Technical notes',
        jp: '工',
        jpLabel: '工 · Craft',
      },
      {
        type: 'paragraph',
        body:
          'Each character is an SVG path animated via GSAP\'s DrawSVG. The stroke order metadata for kanji comes from the KanjiVG project. Latin morphing uses a custom shape-tween built on flubber.',
      },
      {
        type: 'paragraph',
        body:
          'Still figuring out the rhythm — too fast and it reads as a load animation, too slow and it becomes precious. Somewhere around 1.2s per kanji feels right.',
      },
    ],
  },

  {
    slug: 'ame-audio-visuals',
    index: '03',
    title: 'Ame',
    jp: '雨',
    jpLabel: '雨 · Rain',
    year: '2026',
    status: 'Concept · weekend builds',
    tagline: 'Audio-reactive interfaces for lo-fi tracks.',
    description:
      'Small visual sketches that listen to music — minimal, atmospheric, never overwhelming. Each visualization corresponds to a specific lo-fi track, designed to feel like rain on glass rather than a visualizer.',
    roles: ['Audio · Visual', 'Canvas', 'Sound Design'],
    tech: ['Web Audio API', 'Canvas', 'WebGL'],
    href: 'https://github.com/LucasSckenal',
    mood: 'glass',
    sections: [
      {
        type: 'lead',
        body:
          'Audio-reactive sketches that listen instead of decorate. Each one is paired with a specific lo-fi track.',
      },
      {
        type: 'paragraph',
        body:
          'Most music visualizers are loud — bouncing bars, exploding particles, neon. I wanted the opposite. Visuals that respond to the audio but stay below the music\'s threshold. Like rain on a window during a slow song.',
      },
      {
        type: 'heading',
        text: 'How',
        jp: '法',
        jpLabel: '法 · Method',
      },
      {
        type: 'paragraph',
        body:
          'Web Audio API extracts amplitude and frequency. A canvas renders soft particle systems or warped gradients driven by the analysis. The visuals never spike — they only breathe slightly faster on louder sections.',
      },
      {
        type: 'paragraph',
        body:
          'This isn\'t a tool; it\'s a series of small pieces. Each one is married to one track. You can\'t swap them.',
      },
    ],
  },
];

// Combined lookup — case study routes serve from either array.
const allProjects = [...projects, ...nightProjects];

export function getProject(slug: string): ProjectCase | undefined {
  return allProjects.find((p) => p.slug === slug);
}

export function getAdjacentProjects(
  slug: string
): { prev: ProjectCase; next: ProjectCase } | null {
  // Adjacent navigation stays within the same portfolio (day↔day, night↔night)
  for (const list of [projects, nightProjects]) {
    const i = list.findIndex((p) => p.slug === slug);
    if (i !== -1) {
      return {
        prev: list[(i - 1 + list.length) % list.length],
        next: list[(i + 1) % list.length],
      };
    }
  }
  return null;
}

// Used by sitemap to include both portfolios
export function getAllProjectSlugs(): string[] {
  return allProjects.map((p) => p.slug);
}

// =========================================
// FILMOGRAPHY — every piece, including small ones without case studies
// Powers the /work route. Director-style chronological table.
// =========================================

export type ArchiveKind = 'commercial' | 'personal' | 'academic' | 'experiment';

export type ArchiveEntry = {
  year: string;
  title: string;
  type: string;          // short — "Game UI · Godot" or "Frontend · React"
  kind: ArchiveKind;
  href?: string;         // internal /work/[slug] OR external URL
  external?: boolean;    // if true, href opens in new tab
  oneLiner: string;      // shown on hover, single sentence
};

// Stand-alone archive entries — pieces without a full case study.
// Fill in your real older projects here. Placeholders are fine for the
// shape; the row simply hides if you delete the entry.
export const archiveExtras: ArchiveEntry[] = [
  {
    year: '2024',
    title: '[Academic project — replace]',
    type: 'Course work · React',
    kind: 'academic',
    oneLiner: 'Replace with a real project from your studies.',
  },
  {
    year: '2024',
    title: '[Weekend build — replace]',
    type: 'Personal · Vue',
    kind: 'experiment',
    oneLiner: 'A small thing you built for the fun of it.',
  },
  {
    year: '2023',
    title: '[First freelance — replace]',
    type: 'Client work',
    kind: 'commercial',
    oneLiner: 'The first piece someone paid you for.',
  },
];

// Combines featured day + night projects with archive extras into one
// chronologically-sorted filmography. Used by /work page.
export function getFilmography(): ArchiveEntry[] {
  const featuredCommercial: ArchiveEntry[] = projects.map((p) => ({
    year: p.year,
    title: p.title,
    type: p.roles.slice(0, 2).join(' · '),
    kind: 'commercial',
    href: `/work/${p.slug}`,
    external: false,
    oneLiner: p.tagline,
  }));

  const featuredPersonal: ArchiveEntry[] = nightProjects.map((p) => ({
    year: p.year,
    title: p.title,
    type: p.roles.slice(0, 2).join(' · '),
    kind: 'personal',
    href: `/work/${p.slug}`,
    external: false,
    oneLiner: p.tagline,
  }));

  return [...featuredCommercial, ...featuredPersonal, ...archiveExtras]
    // newest first, stable tie-break by title for deterministic order
    .sort((a, b) => {
      if (a.year !== b.year) return b.year.localeCompare(a.year);
      return a.title.localeCompare(b.title);
    });
}
