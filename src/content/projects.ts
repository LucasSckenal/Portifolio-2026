// =========================================
// Single source of truth for project data.
// Used by both the home Projects section and the /work/[slug] case study pages.
//
// Two parallel portfolios:
//   Day   → professional / showcase pieces (Game, Nexo, LJ)
//   Night → academic university work (Chatbot, Phantom)
// =========================================

export type CaseSection =
  | { type: 'lead'; body: string }
  | { type: 'paragraph'; body: string }
  | { type: 'heading'; text: string; jp?: string; jpLabel?: string }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  // `variant`: 'wide' (default) for landscape desktop captures,
  //            'mobile' for phone portrait shots — caps at ~360px wide so
  //            a 390x844 capture renders close to its real screen size.
  | { type: 'image'; src: string; alt: string; caption?: string; variant?: 'wide' | 'mobile' }
  | { type: 'gallery'; images: Array<{ src: string; alt: string; caption?: string; variant?: 'wide' | 'mobile' }> }
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
  // 01 — Onde Estão os Netos? (game showcase)
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
  // 02 — Nexo (workspace SaaS with AI)
  // ─────────────────────────────────────────
  {
    slug: 'nexo',
    index: '02',
    title: 'Nexo',
    jp: '繋',
    jpLabel: '繋 · Connect',
    year: '2026',
    status: 'Live · In production',
    tagline: 'A team workspace where AI is part of the team.',
    description:
      'A management and collaboration platform — Kanban, backlog, client tracking, analytics, and a Gemini-powered assistant that drafts tasks and refines text. Built on Next 16 + React 19 + Firebase.',
    roles: ['Product Design', 'Full-Stack', 'AI Integration', 'SaaS'],
    tech: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind v4', 'Firebase', 'Gemini'],
    href: 'https://github.com/LucasSckenal/nexo',
    live: 'https://nexo-8yq8.vercel.app/',
    mood: 'dark',
    sections: [
      {
        type: 'lead',
        body:
          'Nexo is a workspace for small teams — Kanban boards, backlog, client and member management, analytics, and an AI assistant that drafts tasks and refines copy as you write.',
      },
      {
        type: 'paragraph',
        body:
          'It started as the answer to a small frustration: every project tool I used either treated AI as a sidebar afterthought or buried collaboration under settings. I wanted a workspace where the AI is part of the daily loop — generating a card from a sentence, polishing a description, summarizing a backlog — without ever becoming a chatbot you have to remember to open.',
      },
      {
        type: 'image',
        src: '/projects/nexo/Dashboard.png',
        alt: 'Nexo dashboard — the workspace at first open',
        caption: 'Dashboard — the workspace at first open, sidebar holding the room together.',
      },

      {
        type: 'heading',
        text: 'The shape of the product',
        jp: '型',
        jpLabel: '型 · Form',
      },
      {
        type: 'list',
        items: [
          'Customizable Kanban boards with per-column search and filters',
          'Backlog with priority, estimates, and drag-to-board flow',
          'Client and member directories with role-based context',
          'Analytics dashboards — throughput, cycle time, member load',
          'AI assistant (Gemini) — generate tasks from a brief, refine text, summarize threads',
          'Real-time notifications with sender avatars',
          'Dark / light themes, per-user accent color',
        ],
      },
      {
        type: 'image',
        src: '/projects/nexo/Kanbam.png',
        alt: 'Nexo Kanban board populated with cards across columns',
        caption: 'Kanban — cards across columns, AI-suggested items marked.',
      },

      {
        type: 'heading',
        text: 'Why AI as a teammate, not a sidebar',
        jp: '助',
        jpLabel: '助 · Aid',
      },
      {
        type: 'paragraph',
        body:
          'Most products bolt an AI panel onto an existing UI. The friction is real — you switch context, paste content in, copy the output back. The AI ends up used once and forgotten.',
      },
      {
        type: 'paragraph',
        body:
          'Nexo inverts that. When you start writing a card, a quick prompt drafts five candidate cards. When you describe a sprint goal in one sentence, the assistant breaks it into a backlog. When you finish typing a description, you can ask for a tighter version inline. The AI lives where the work lives.',
      },
      {
        type: 'image',
        src: '/projects/nexo/CrateTask.png',
        alt: 'Nexo — Gemini assistant generating tasks from a sentence',
        caption: 'A sentence becomes a backlog — Gemini drafts candidate cards inline.',
      },
      {
        type: 'quote',
        text:
          'The point isn\'t to replace the person typing. It\'s to make typing feel less like typing.',
      },

      {
        type: 'heading',
        text: 'Stack & architecture',
        jp: '構',
        jpLabel: '構 · Structure',
      },
      {
        type: 'paragraph',
        body:
          'Next.js 16 with the App Router on React 19. TypeScript 5 strict. Tailwind v4 for the design system — every token in CSS variables, theme switching is a single class flip. Firebase for auth, Firestore for the data, Firebase Storage for uploads.',
      },
      {
        type: 'paragraph',
        body:
          'The AI surface is Google Gemini via the generative-AI SDK, routed through Next API endpoints so the API key never reaches the client. TipTap 3 handles rich text — extensible enough to wrap AI actions inline. Recharts powers the analytics dashboards. Phosphor and Lucide icons throughout.',
      },
      {
        type: 'image',
        src: '/projects/nexo/analytics.png',
        alt: 'Nexo analytics — throughput and cycle-time dashboards',
        caption: 'Analytics — throughput, cycle time, and member load via Recharts.',
      },
      {
        type: 'paragraph',
        body:
          'The codebase is organized by feature, not by file type — auth, analytics, backlog, clients, kanban, members each get their own folder with components, contexts, and routes co-located. It scales without the typical "where does this live?" tax.',
      },
      {
        type: 'image',
        src: '/projects/nexo/Backlog.png',
        alt: 'Nexo backlog — prioritized list with estimates',
        caption: 'Backlog — priorities and estimates, draggable straight to the board.',
      },

      {
        type: 'heading',
        text: 'What\'s next',
        jp: '次',
        jpLabel: '次 · Next',
      },
      {
        type: 'list',
        items: [
          'Public marketing landing in front of the auth wall',
          'Demo workspace seeded with example data — no sign-up to explore',
          'GitHub bidirectional sync for issues',
          'Per-workspace AI memory so the assistant gets sharper over time',
        ],
      },
    ],
  },

  // ─────────────────────────────────────────
  // 03 — LJ Treinamento Integrado (client work)
  // ─────────────────────────────────────────
  {
    slug: 'lj-treinamento-integrado',
    index: '03',
    title: 'LJ Treinamento Integrado',
    jp: '体',
    jpLabel: '体 · Body',
    year: '2026',
    status: 'Live · Production',
    tagline: 'A boutique training studio that sells trust before it sells classes.',
    description:
      'Marketing site and booking front for an integrated training studio in Ijuí — schedule, plans, methodology, WhatsApp-driven reservations. Designed to read like a private practice, not a gym.',
    roles: ['Brand Web', 'Booking UX', 'Client Work', 'Responsive'],
    tech: ['Next.js', 'TypeScript', 'TailwindCSS'],
    team: 'Solo · Client: Luis Joris',
    live: 'https://lj-nu.vercel.app/',
    mood: 'light',
    sections: [
      {
        type: 'lead',
        body:
          'A site for Luis Joris — a personal trainer in Ijuí who works with no more than four people per class. The brief was simple: don\'t sell like a gym. The product is attention, not access.',
      },
      {
        type: 'paragraph',
        body:
          'Most fitness studio sites push you to a wall of plan cards and a CTA before they\'ve earned a second of trust. We did the opposite — open with the room, the method, the cap of four students, and only then the prices.',
      },
      {
        type: 'image',
        src: '/projects/lj/hero.png',
        alt: 'LJ homepage hero — Corpo em movimento. Mente em transformação.',
        caption: 'Homepage hero — the room and the promise before the price tag.',
      },

      {
        type: 'heading',
        text: 'What the site does',
        jp: '機',
        jpLabel: '機 · Function',
      },
      {
        type: 'list',
        items: [
          'Hero stating the method, not the discount — "Corpo em movimento. Mente em transformação."',
          'Five-pillar methodology breakdown (Mobility, Stability, Strength, Conditioning, Balance)',
          'Three modalities with their distinct character: Funcional, Five Konzept, Cardio Premium',
          'Live weekly schedule showing real openings — each slot links straight to WhatsApp reservation',
          'Three pricing tiers with a marked "Most Chosen" plan and a trial single-class option',
          'Location, opening hours, social proof from the studio Instagram',
        ],
      },
      {
        type: 'image',
        src: '/projects/lj/method.png',
        alt: 'LJ method section — five pillars of integrated training',
        caption: 'The five-pillar methodology — Mobility, Stability, Strength, Conditioning, Balance.',
      },

      {
        type: 'heading',
        text: 'Design choices',
        jp: '構',
        jpLabel: '構 · Composition',
      },
      {
        type: 'paragraph',
        body:
          'Neutral palette — whites, grays, accent black — with all weight given to typography and white space. The trainer is a single specialist; the site needed to feel like a private practice, not a chain. Long-form sections breathe; CTAs appear only after the reader has been given enough to decide.',
      },
      {
        type: 'image',
        src: '/projects/lj/plans.png',
        alt: 'LJ plans — three pricing tiers',
        caption: 'Three plans, the middle one marked. No coupons, no fake urgency.',
      },
      {
        type: 'paragraph',
        body:
          'Booking is intentionally not a form. Each free slot is a WhatsApp deep-link with a pre-filled message — the client reaches Luis in one tap, conversation already started, no friction account creation. For a boutique studio this is conversion at the right grain.',
      },
      {
        type: 'image',
        src: '/projects/lj/schedule.png',
        alt: 'LJ weekly schedule — each open slot links to WhatsApp',
        caption: 'Weekly schedule — every open slot is a one-tap WhatsApp deep-link.',
      },
      {
        type: 'quote',
        text:
          'A gym sells access. A boutique studio sells the trainer\'s attention. The website has to feel like the latter.',
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
          'Built in Next.js with TypeScript and Tailwind. Deployed on Vercel. The schedule data is editable without touching code — Luis can rotate slots and capacity from a content file, which keeps the site honest about availability without me being a bottleneck.',
      },
      {
        type: 'image',
        src: '/projects/lj/mobile.png',
        alt: 'LJ mobile view — same hierarchy at phone width',
        caption: 'Mobile view — same hierarchy, same restraint. Booking still one tap.',
        variant: 'mobile',
      },
    ],
  },
];

// =========================================
// NIGHT PORTFOLIO — academic university work
// Projects shaped during my degree at Unijui, kept here as foundations
// rather than client deliverables. The toggle reframes them as "after hours" —
// the work that lives outside billable scope.
// =========================================

export const nightProjects: ProjectCase[] = [
  // ─────────────────────────────────────────
  // 01 — Medical AI Chatbot (PI-3 Unijui)
  // ─────────────────────────────────────────
  {
    slug: 'medical-chatbot',
    index: '01',
    title: 'Medical AI Chatbot',
    jp: '話',
    jpLabel: '話 · Speak',
    year: '2025',
    status: 'Academic · Live demo',
    tagline: 'Voice or text symptoms, translated into structured triage.',
    description:
      'A multilingual medical assistant that turns patient symptoms — spoken or typed — into structured reports for faster clinical triage. PI-3 at Unijui.',
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
  // 02 — Phantom Commerce (Unijui)
  // ─────────────────────────────────────────
  {
    slug: 'phantom-commerce',
    index: '02',
    title: 'Phantom Commerce',
    jp: '幻',
    jpLabel: '幻 · Phantom',
    year: '2025',
    status: 'Academic · Concept',
    tagline: 'The store as exhibit, not as catalogue.',
    description:
      'A gaming-focused commerce platform built around premium product presentation, animated interactions, and a glass-deep visual language. Coursework at Unijui.',
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
// Empty for now; fill in older work as it becomes worth documenting.
export const archiveExtras: ArchiveEntry[] = [];

// Combines featured day + night projects with archive extras into one
// chronologically-sorted filmography. Used by /work page.
export function getFilmography(): ArchiveEntry[] {
  // Day projects: Game stays academic (it's PI-4), Nexo is personal product,
  // LJ is commercial client work. We classify per project, not per portfolio.
  const featuredDay: ArchiveEntry[] = projects.map((p) => {
    const kind: ArchiveKind =
      p.slug === 'lj-treinamento-integrado' ? 'commercial'
      : p.slug === 'nexo' ? 'personal'
      : 'academic';
    return {
      year: p.year,
      title: p.title,
      type: p.roles.slice(0, 2).join(' · '),
      kind,
      href: `/work/${p.slug}`,
      external: false,
      oneLiner: p.tagline,
    };
  });

  // Night portfolio holds academic work (Chatbot + Phantom from Unijui)
  const featuredNight: ArchiveEntry[] = nightProjects.map((p) => ({
    year: p.year,
    title: p.title,
    type: p.roles.slice(0, 2).join(' · '),
    kind: 'academic',
    href: `/work/${p.slug}`,
    external: false,
    oneLiner: p.tagline,
  }));

  return [...featuredDay, ...featuredNight, ...archiveExtras]
    // newest first, stable tie-break by title for deterministic order
    .sort((a, b) => {
      if (a.year !== b.year) return b.year.localeCompare(a.year);
      return a.title.localeCompare(b.title);
    });
}
