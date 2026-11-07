import { KERN_NAME } from './names';

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
  // two captures of the same screen, one over the other, with a handle to drag
  | {
      type: 'compare';
      label: string;
      before: { src: string; alt: string; tag: string };
      after: { src: string; alt: string; tag: string };
      caption?: string;
    }
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
  // 'download' when the live link is a release to install, not a site
  liveKind?: 'site' | 'download';
  mood: 'dark' | 'light' | 'glass';
  sections: CaseSection[];
};

export const projects: ProjectCase[] = [
  // ─────────────────────────────────────────
  // 01 — Ma Finance OS (personal SaaS)
  // ─────────────────────────────────────────
  {
    slug: 'ma-finance-os',
    index: '01',
    title: 'Ma Finance OS',
    jp: '間',
    jpLabel: '間 · Space',
    year: '2026',
    status: 'Live · In production',
    tagline: 'A minimalist operating system for personal finance — with AI that acts.',
    description:
      'A full-stack personal finance platform that tracks net worth, budgets, and investments in real time — with a Gemini-powered assistant that doesn\'t just answer questions, it executes actions on your behalf. Built on Next.js 16 + React 19 + Firebase.',
    roles: ['Product Design', 'Full-Stack', 'AI Integration', 'SaaS'],
    tech: ['Next.js 16', 'React 19', 'TypeScript', 'SCSS Modules', 'Firebase', 'Gemini', 'Framer Motion'],
    href: 'https://github.com/LucasSckenal/Project-Organization-finaces',
    live: 'https://project-organization-finaces.vercel.app/',
    mood: 'dark',
    sections: [
      {
        type: 'lead',
        body:
          'Ma (間) treats personal finance as an operating system, not a dashboard. One surface for everything — accounts, budgets, goals, investments — updated live, understood by an AI that can act.',
      },
      {
        type: 'image',
        src: '/projects/ma-finance-os/dashboard.png',
        alt: 'Ma Finance OS — main dashboard with net worth and account overview',
        caption: 'Dashboard — net worth, accounts, and real-time balance at a glance.',
      },
      {
        type: 'paragraph',
        body:
          'Most finance tools give you charts and leave you to figure out what to do next. Ma flips that: the AI assistant doesn\'t just describe your spending — it proposes and executes actions on your behalf, waiting only for your confirmation before applying them to your data.',
      },

      {
        type: 'heading',
        text: 'The OS metaphor',
        jp: '界',
        jpLabel: '界 · World',
      },
      {
        type: 'paragraph',
        body:
          'Calling it an "operating system" is deliberate. Your finances are running whether you\'re looking or not — recurring transactions process automatically, investment prices update live via Yahoo Finance, budget alerts fire before you overspend. Ma keeps everything in motion in the background so the surface stays quiet.',
      },
      {
        type: 'list',
        items: [
          'Automatic net worth calculation across cash, investments, and goals',
          'Multi-account support with real transfer flows',
          'Budget management with live progress — not end-of-month reports',
          'Goal tracking with deposits and deadline monitoring',
          'Automatic recurring transaction processing — set it, forget it',
          'CSV import / export with full data ownership',
          'Bilingual UI — Portuguese and English, with multi-currency conversion',
          'PWA with offline functionality and command palette',
        ],
      },
      {
        type: 'image',
        src: '/projects/ma-finance-os/budget.png',
        alt: 'Ma Finance OS — budget management with category-based limits',
        caption: 'Budgets — live progress per category, alerts before you overspend.',
      },

      {
        type: 'heading',
        text: 'AI that executes, not just explains',
        jp: '行',
        jpLabel: '行 · Action',
      },
      {
        type: 'paragraph',
        body:
          'The Gemini integration uses function calling — a technique where the model proposes a specific action (create transaction, update budget, set goal deposit) and the interface renders a confirmation before writing anything to Firestore. The user stays in control; the AI does the heavy lifting.',
      },
      {
        type: 'image',
        src: '/projects/ma-finance-os/ai-chat.png',
        alt: 'Ma Finance OS — AI assistant executing a budget creation action',
        caption: 'AI assistant — proposes actions with function calling, waits for your confirmation.',
        variant: 'mobile',
      },
      {
        type: 'quote',
        text:
          'The assistant doesn\'t open a chat window. It lives inside the flow you\'re already in.',
      },
      {
        type: 'paragraph',
        body:
          'Ask "how much did I spend on restaurants last month?" — get a direct answer. Say "create a budget for groceries, R$800" — the model calls the budget-create function, shows the preview, and waits for your tap. No copy-paste, no tab switching.',
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
          'Next.js 16 with the App Router, React 19, TypeScript 5 strict. SCSS Modules for the design system — the ink-night palette is a set of CSS variables, so light mode is a single class swap. Framer Motion for micro-interactions; Lenis for smooth scroll.',
      },
      {
        type: 'paragraph',
        body:
          'Firebase handles auth, Firestore for all user data, Storage for uploads. ID tokens are verified via jose on every API route — Gemini and Yahoo Finance calls never reach the client, preventing quota abuse. Recharts powers the analytics views. The full Gemini surface runs through server-side API routes.',
      },
      {
        type: 'stats',
        items: [
          { label: 'Framework', value: 'Next.js 16', jp: '工' },
          { label: 'Runtime', value: 'React 19', jp: '動' },
          { label: 'Database', value: 'Firestore', jp: '庫' },
          { label: 'AI', value: 'Gemini FC', jp: '脳' },
          { label: 'Auth', value: 'Firebase', jp: '鍵' },
          { label: 'Deploy', value: 'Vercel', jp: '雲' },
        ],
      },
      {
        type: 'image',
        src: '/projects/ma-finance-os/reports.png',
        alt: 'Ma Finance OS — financial reports with income, expenses, and net worth history',
        caption: 'Reports — historical income/expense breakdown and net worth evolution.',
      },

      {
        type: 'heading',
        text: 'Design language',
        jp: '美',
        jpLabel: '美 · Aesthetic',
      },
      {
        type: 'paragraph',
        body:
          'Ink-night palette — near-black backgrounds, warm off-whites, tight typographic hierarchy with a serif display face and monospace numerics. Every financial value is a number first; the chrome around it stays invisible. The Japanese name 間 (space / interval) describes the design intent: as much deliberate emptiness as information.',
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
  {
    slug: 'lucas-patterns',
    index: '04',
    title: 'lucas-patterns',
    jp: '型',
    jpLabel: '型 · Pattern',
    year: '2026',
    status: 'Open source · Claude Code skill',
    tagline: 'My way of building front end, written down so an agent can follow it.',
    description:
      'A Claude Code skill that carries my process and my taste, so the pages it helps build reach the level of this portfolio without copying its look.',
    roles: ['Design System', 'Process', 'Tooling'],
    tech: ['Claude Code', 'Node', 'Chrome DevTools Protocol'],
    team: 'Solo · Open source',
    href: 'https://github.com/LucasSckenal/lucas-patterns',
    mood: 'dark',
    sections: [
      {
        type: 'lead',
        body: 'Taste is hard to hand over. This skill writes mine down: little text, a lot of empty space, one idea per page, and one piece a common site does not have.',
      },
      {
        type: 'compare',
        label: 'Drag to compare the old weather station dashboard with the new one',
        before: {
          src: '/projects/lucas-patterns/antes.webp',
          alt: 'The old Unijui weather station dashboard: a grid of charts behind a login',
          tag: '2024',
        },
        after: {
          src: '/projects/lucas-patterns/depois.webp',
          alt: 'Estação São Paulo: one sentence about the hour over a live view of the city',
          tag: '2026',
        },
        caption: 'The first screen, before and after the skill. Drag the line.',
      },
      {
        type: 'paragraph',
        body: 'Before, every chart had the same weight and a menu of switches decided what showed. After, the hour is one sentence, and each reading gets the chart that suits it.',
      },
      {
        type: 'compare',
        label: 'Drag to compare the old charts with the new ones',
        before: {
          src: '/projects/lucas-patterns/antes-graficos.webp',
          alt: 'The old charts: a compass, a dial and three grids with the same purple and green lines',
          tag: '2024',
        },
        after: {
          src: '/projects/lucas-patterns/depois-graficos.webp',
          alt: 'The new charts: a timeline over glass cards, wind bars with gusts, a compass and the rain highlighted',
          tag: '2026',
        },
        caption: 'The charts: one timeline moves them all, and what is out of the ordinary is lit.',
      },
      { type: 'heading', text: 'Four steps, in order', jp: '順', jpLabel: '順 · Order' },
      {
        type: 'list',
        ordered: true,
        items: [
          'The client’s pain, in their words.',
          'A structure reference, from Pinterest or a sketch.',
          'Colours and fonts chosen for this app, never reused.',
          'A blind review, then small fixes.',
        ],
      },
      {
        type: 'paragraph',
        body: 'Two scripts keep it honest: one reads the code for colours outside the tokens and exposed secrets, the other opens the page in a headless Chrome and measures contrast, touch targets, word count and load time, wide and narrow.',
      },
      {
        type: 'paragraph',
        body: 'Install it with one line: npx skills add LucasSckenal/lucas-patterns -g -a claude-code',
      },
    ],
  },
  {
    slug: 'mirante',
    index: '05',
    title: 'Mirante Imóveis',
    jp: '眺',
    jpLabel: '眺 · View',
    year: '2026',
    status: 'Template · Concept',
    tagline: 'Start with the view. The house comes after.',
    description:
      'A site template for a high-end real-estate agency. People who buy these houses are buying what they see from the window, so the search starts there — sea, mountains, lake or city — instead of with neighbourhood and price.',
    roles: ['Concept', 'Front-End', 'WebGL', 'Motion'],
    tech: ['HTML', 'CSS', 'JavaScript', 'WebGL'],
    team: 'Solo · Concept',
    href: 'https://github.com/LucasSckenal/mirante-imoveis',
    mood: 'light',
    sections: [
      {
        type: 'lead',
        body:
          'Real-estate sites make you start like a portal: neighbourhood, bedrooms, price. Mirante starts with the one thing these buyers actually pay for — the view — and lets the house follow.',
      },
      {
        type: 'image',
        src: '/projects/mirante/inicio.webp',
        alt: 'Mirante Imóveis — the first screen: “Comece pela Vista” over the sea, with the featured house, the numbers and the call to sell',
        caption: 'The first screen: pick a view, and the landscape, the featured house and the count all follow.',
      },
      { type: 'heading', text: 'A view, then a house', jp: '景', jpLabel: '景 · Scene' },
      {
        type: 'paragraph',
        body:
          'Choosing Sea, Mountains, Lake or City swaps the landscape with a WebGL wave that rises from the horizon, and the houses below are already filtered. The count, the starting price and the featured house roll to their new values. The filter lives in the address, so a search can be sent over WhatsApp as a link.',
      },
      {
        type: 'image',
        src: '/projects/mirante/serra.webp',
        alt: 'Mirante Imóveis — the mountain view, with three houses and the featured one from Campos do Jordão',
        caption: 'The mountain view. Every number on the screen is counted from the listings, never typed by hand.',
      },
      {
        type: 'paragraph',
        body:
          'On scroll, the first screen stays pinned and shrinks into a rounded frame while the list of houses slides over it. With reduced motion everything simply appears in place, and without JavaScript the full list is already in the HTML.',
      },
      {
        type: 'image',
        src: '/projects/mirante/lista.webp',
        alt: 'Mirante Imóveis — the list of houses with a mountain view, with filters for bedrooms and price',
        caption: 'Each house opens a WhatsApp message with its code already written.',
      },
      {
        type: 'gallery',
        images: [
          { src: '/projects/mirante/celular.webp', alt: 'The first screen on a phone', caption: 'On the phone, the cards stack under the title.', variant: 'mobile' },
          { src: '/projects/mirante/celular-lista.webp', alt: 'The list of houses on a phone', caption: 'The list in one column.', variant: 'mobile' },
        ],
      },
      {
        type: 'paragraph',
        body:
          'It is a template, not a client: listings, prices and the agency are sample data, and the photos are from Unsplash. The layout of the first screen follows a reference shot found on Pinterest; the view-first idea, the WebGL transition, the scroll frame and the build are mine.',
      },
    ],
  },
  {
    slug: 'prancha',
    index: '06',
    title: 'Prancha',
    jp: '板',
    jpLabel: '板 · Board',
    year: '2026',
    status: 'Personal · Live demo',
    tagline: 'Loose ideas from WhatsApp, turned into a brief Claude can build from.',
    description:
      'Clients send ideas in pieces: a voice note, a print of a site they like, three messages at midnight. Prancha is where I paste those pieces, one conversation per client, until they add up to a brief Claude can build from.',
    roles: ['Product', 'Front-End', 'AI', 'WebGL'],
    tech: ['Next.js 16', 'React 19', 'TypeScript', 'Gemini', 'Three.js'],
    team: 'Solo · Personal tool',
    live: 'https://prancha-two.vercel.app',
    mood: 'light',
    sections: [
      {
        type: 'lead',
        body: 'The hard part of building for a client is not the code. It is getting from “I want something clean” to a brief that says what to build. Prancha does that part with me.',
      },
      {
        type: 'image',
        src: '/projects/prancha/inicio.webp',
        alt: 'Prancha — the clients list, the conversation with Studio Pilates Leve and the finished brief in a dark panel',
        caption: 'One conversation per client. The brief sits beside it, ready to copy.',
      },
      { type: 'heading', text: 'I write as the client', jp: '話', jpLabel: '話 · Talk' },
      {
        type: 'paragraph',
        body: 'Each message I send is something the client said, with their prints and audio attached. Gemini reads it all, says what it understood and asks only what is still missing: the pain, the main action, who uses it, the tone, a reference. I forward the questions on WhatsApp in one tap.',
      },
      {
        type: 'paragraph',
        body: 'When nothing is missing, it writes the brief in the order of my own front-end skill, lucas-patterns, and ends by telling Claude Code to use it. A second prompt describes a visual concept of the screen for an image model.',
      },
      {
        type: 'image',
        src: '/projects/prancha/entrar.webp',
        alt: 'Prancha sign-in — a black card with a 3D scene of scattered fragments becoming one sheet, beside the sign-in form',
        caption: 'The sign-in screen tells the product in three acts: pieces arrive, get organised, a sheet comes out.',
      },
      {
        type: 'paragraph',
        body: 'The folded corner of the logo is the signature of the whole app: the sidebar and the black card are cut the same way. Everything is monochrome glass, so the only colour on screen is what the client sent.',
      },
      {
        type: 'image',
        src: '/projects/prancha/arquivos.webp',
        alt: 'Prancha files — folders per client with prints, audio, briefs as Markdown and concepts',
        caption: 'Files: every print, audio, brief and concept, sorted by client.',
      },
      {
        type: 'gallery',
        images: [
          { src: '/projects/prancha/celular-lista.webp', alt: 'The clients list on a phone', caption: 'On the phone, the sidebar becomes a top bar.', variant: 'mobile' },
          { src: '/projects/prancha/celular.webp', alt: 'A conversation on a phone', caption: 'Conversation and brief switch with one tab.', variant: 'mobile' },
        ],
      },
      {
        type: 'paragraph',
        body: 'It is built for one person, so the history lives in the browser and the Gemini key stays on the server. The public demo opens with sample clients and answers from an offline template, so nothing is sent anywhere.',
      },
    ],
  },
];

// =========================================
// Lead work (2026 edition two): native desktop software
// =========================================
export const leadProjects: ProjectCase[] = [
  {
    slug: 'ilha',
    index: '01',
    title: 'Ilha',
    jp: '島',
    jpLabel: '島 · Island',
    year: '2026',
    status: 'Personal · Daily use',
    tagline: 'A Dynamic Island for Windows, with an assistant that acts.',
    description:
      'A lightweight notch at the top of the Windows screen, in native Rust: music with synced lyrics, system notices, agenda, clipboard, focus timer, water tracking and files — and Ayla, a voice and text assistant built on Gemini that controls the PC.',
    roles: ['Desktop App', 'Native UI', 'AI Assistant', 'Motion'],
    tech: ['Rust', 'Direct2D', 'Windows APIs', 'Gemini'],
    mood: 'dark',
    sections: [
      {
        type: 'lead',
        body:
          'Ilha makes Windows behave like a Mac where it matters every day: a notch in the style of the Dynamic Island, built as one native Rust app with no embedded browser and no third-party installer.',
      },
      {
        type: 'image',
        src: '/projects/ilha/inicio.webp',
        alt: 'Ilha — home page: clock, weather, today, water and music',
        caption: 'Home: clock, weather, what is on today, water and the music playing.',
      },
      { type: 'heading', text: 'What it does' },
      {
        type: 'list',
        items: [
          'Music from any player that reports to Windows, with cover, controls and lyrics synced from lrclib.net.',
          'System notices in place of the Windows ones: volume, brightness, keyboard layout, battery, network, headphones.',
          'Agenda with reminders that warn ten minutes before and show a Join button for call links.',
          'Clipboard history in memory, focus timer and stopwatch, water goal with reminders, and files parked on the island.',
          'Alt+Space search for apps, files, settings, maths and unit conversions.',
        ],
      },
      {
        type: 'image',
        src: '/projects/ilha/musica.webp',
        alt: 'Ilha — music page with synced lyrics',
        caption: 'Music page: the line being sung, with the full lyrics a click away.',
      },
      { type: 'heading', text: 'Ayla, inside the island' },
      {
        type: 'paragraph',
        body:
          'Say "Ayla" and the request, or tap her eyes on the open island. Direct commands — next song, volume, timers, water, open an app — run locally with no internet. Questions go to Gemini with a short summary of the moment (time, music, focus, water, weather, agenda), so she answers without asking back, and acts on the result.',
      },
      {
        type: 'paragraph',
        body:
          'Her eyes carry the state: wide while listening, narrowed and glancing while thinking, bouncing while speaking, amber with a tilted head when she needs a yes. Idle, they peek out now and then and fall asleep when the PC rests.',
      },
    ],
  },
  {
    slug: 'designon',
    index: '03',
    title: 'DesignOn',
    jp: '倉',
    jpLabel: '倉 · Storehouse',
    year: '2026',
    status: 'Internal · In daily use',
    tagline: 'Stock, requests and cash for one company, in the pocket of whoever is on site.',
    description:
      'An internal operations app built for a visual communication company: where every material sits, the team\'s material requests, and the cash flow — installed as a PWA on the crew\'s phones and used at the office desk.',
    roles: ['Product Design', 'Full-Stack', 'PWA', 'Internal Tool'],
    tech: ['React', 'Vite', 'Node', 'Supabase', 'Vercel'],
    mood: 'dark',
    sections: [
      {
        type: 'lead',
        body:
          'DesignOn became the company\'s main app. It joins three things that used to live apart: the physical stock, the material requests of the crew, and the money.',
      },
      { type: 'heading', text: 'What it does' },
      {
        type: 'list',
        items: [
          'Physical stock mapped to the company\'s real floors and areas, with QR labels that open a place or a product straight from the phone camera.',
          'Material requests from the team, linked to stock, so nobody runs out on site and nobody buys twice.',
          'Cash flow for the owner: income and expenses, payables and receivables, fixed bills, P&L and profit per job.',
          'A simple mode for field staff — three tabs: ask for material, the jobs they are on (checklist, pause with a reason, finish with a photo) and me.',
          'Native notifications for new requests, low stock, ready orders and bills coming due.',
        ],
      },
      { type: 'heading', text: 'Built for the floor, not the office' },
      {
        type: 'paragraph',
        body:
          'Most use happens one-handed, on a phone, in the warehouse or on site. What the crew marks without signal is kept on the phone and syncs when the connection returns. Money data only ever reaches the administrator\'s device, and finished jobs send their summary and photo to the team chat, keeping only the summary after a week.',
      },
      {
        type: 'image',
        src: '/projects/designon/producao.webp',
        alt: 'Production board: jobs moving from approved to delivered',
        caption: 'Production: every job in one stage; the crew moves it on from the phone.',
      },
      {
        type: 'gallery',
        images: [
          { src: '/projects/designon/pedidos.webp', alt: 'Material requests from the crew with their status', caption: 'Requests: what the crew asked for, and whether it is all in stock.' },
          { src: '/projects/designon/locais.webp', alt: 'Map of the floors and areas with what each one holds', caption: 'Locations: floors, areas and shelves, with what sits on each.' },
          { src: '/projects/designon/caixa.webp', alt: 'Cash summary with income, expenses and the month result', caption: 'Cash: what came in, what went out, what is still to receive and pay.' },
          { src: '/projects/designon/estoque.webp', alt: 'Stock list with low items flagged', caption: 'Stock: where each material is, with the low ones flagged.' },
        ],
      },
      {
        type: 'gallery',
        images: [
          { src: '/projects/designon/celular-inicio.webp', alt: 'Home screen on a phone', caption: 'On the phone, the same app.', variant: 'mobile' },
          { src: '/projects/designon/celular-pedidos.webp', alt: 'Requests on a phone', caption: 'Requests in the field.', variant: 'mobile' },
        ],
      },
      {
        type: 'paragraph',
        body:
          'The screens here run on a demo company with invented materials, jobs and values; the real stock and finances stay private.',
      },
    ],
  },
  {
    slug: 'kern',
    index: '02',
    title: KERN_NAME,
    jp: '核',
    jpLabel: '核 · Core',
    year: '2026',
    status: 'Desktop · Released builds',
    tagline: 'CAD/CAM for the workshop: from drawing to G-code.',
    description:
      'A 2D/2.5D CAD/CAM desktop app for Windows 11 that prepares files and toolpaths for CNC routers, lasers and 3D printing — ACM, acrylic, MDF, PVC and aluminium sheets.',
    roles: ['Desktop App', 'CAD / CAM', 'Product Design', 'C++'],
    tech: ['C++20', 'Qt 6', 'CMake', 'SQLite', 'Clipper2', 'GoogleTest'],
    href: 'https://github.com/LucasSckenal/kern-releases',
    mood: 'dark',
    sections: [
      {
        type: 'lead',
        body:
          'One program for the whole workshop job: draw or import, nest the parts on the sheet, generate the toolpaths, check them, and save the G-code — with Router, Laser and 3D Printing as three work areas side by side.',
      },
      {
        type: 'image',
        src: '/projects/kern/tela.webp',
        alt: 'KERN — the router work area with a toolpath being simulated',
        caption: 'Router area: lettering with its cut path, properties and the toolpath simulation.',
      },
      { type: 'heading', text: 'How it works' },
      {
        type: 'list',
        items: [
          'Native editor with layers, snapping, numeric editing, transform tools and centralised undo/redo.',
          'DXF and SVG import; STL and 3MF go straight to the 3D printing bed.',
          'CAM operations — profile, pocket and drilling — with tool library and G-code output.',
          'A .kern project format in readable, versioned JSON: newer versions keep opening old projects.',
          'Recipes: a repeated job saved once and applied in one click.',
        ],
      },
      {
        type: 'image',
        src: '/projects/kern/chapa.webp',
        alt: 'KERN — parts nested on the sheet',
        caption: 'Nesting: parts arranged on the sheet before cutting.',
      },
      {
        type: 'paragraph',
        body:
          'Each work area keeps its own file, title, undo history and recent list, so opening a drawing for the router never touches what is on the laser. The start screen shows the three areas, the shop machines and recent drawings with thumbnails.',
      },
      {
        type: 'image',
        src: '/projects/kern/conferir.webp',
        alt: 'KERN — checking the job before saving',
        caption: 'Check before cutting.',
      },
    ],
  },
];

// =========================================
// NIGHT PORTFOLIO — academic & experimental work
// Projects shaped during my degree at SENAC / Unijui, kept here as foundations
// rather than client deliverables. The toggle reframes them as "after hours" —
// the work that lives outside billable scope.
// =========================================

export const nightProjects: ProjectCase[] = [
  // ─────────────────────────────────────────
  // 01 — Onde Estão os Netos? (game showcase)
  // ─────────────────────────────────────────
  {
    slug: 'onde-estao-os-netos',
    index: '01',
    title: 'Onde Estão os Netos?',
    jp: '戦',
    jpLabel: '戦 · Battle',
    year: '2025–2026',
    status: 'v4.1 · Released · Windows & Android',
    tagline: 'A Tower Defense built for the player we never see.',
    description:
      'Two grandparents pulled into an antique board game must cross six perilous worlds to rescue their grandchildren. Built in Godot 4.6, designed from day one around accessibility for elderly players.',
    roles: ['Game UI', 'Tower Defense', 'Roguelike', 'Accessibility'],
    tech: ['Godot 4.6', 'GDScript', 'CSV-driven balancing', 'Windows', 'Android'],
    team: 'Team of 4 · SENAC · UI / Frontend systems',
    href: 'https://github.com/LucasSckenal/pi-4',
    // finished game: the main button downloads the latest release
    live: 'https://github.com/LucasSckenal/pi-4/releases/latest',
    liveKind: 'download',
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
        src: '/projects/netos/noite.webp',
        alt: 'Night phase: Afonso fights beside two towers while the castle holds',
        caption: 'Combat phase — auto-attacking towers, player controls only the tempo.',
      },
      {
        type: 'gallery',
        images: [
          { src: '/projects/netos/dia.webp', alt: 'Day phase: two towers built on the first map', caption: 'Day — build and place, no clock running.' },
          { src: '/projects/netos/cartas.webp', alt: 'Three power-up cards to choose from after a wave', caption: 'After each wave, one card out of three.' },
          { src: '/projects/netos/historia.webp', alt: 'Illustrated story panel: the grandchildren arrive at the grandparents’ house', caption: 'The story opens as an illustrated comic.' },
          { src: '/projects/netos/dialogo.webp', alt: 'Afonso speaking in a dialogue box on the first map', caption: 'Afonso and Berta talk the player through each world.' },
        ],
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
  // 02 — Medical AI Chatbot (PI-3 Unijui)
  // ─────────────────────────────────────────
  {
    slug: 'medical-chatbot',
    index: '02',
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
  // 03 — Phantom Commerce (Unijui)
  // ─────────────────────────────────────────
  {
    slug: 'phantom-commerce',
    index: '03',
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
        src: '/projects/PhantomComerce/mobile.png',
        alt: 'Store homepage',
        caption: 'Homepage — composed like a gallery wall.',
        variant: 'mobile',
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

  // ─────────────────────────────────────────
  // 04 — GuessQuest (Unijui)
  // ─────────────────────────────────────────
  {
    slug: 'guessquest',
    index: '04',
    title: 'GuessQuest',
    jp: '謎',
    jpLabel: '謎 · Riddle',
    year: '2025',
    status: 'Academic · Desktop game',
    tagline: 'An arcade quiz: name the game from a single image.',
    description:
      'A retro arcade quiz in JavaFX: each stage shows a game\'s cover or a screenshot and four answers. Fifteen stages, lives, three difficulties and a leaderboard. Built at Unijui.',
    roles: ['Game Design', 'Desktop UI', 'API Integration', 'Sound'],
    tech: ['Java 17', 'JavaFX', 'Maven', 'RAWG API'],
    team: 'Team of 2 · Unijui',
    href: 'https://github.com/LucasSckenal/GuessQuest',
    mood: 'dark',
    sections: [
      {
        type: 'lead',
        body:
          'A retro arcade quiz for people who grew up with games: one image, four answers, and a life on the line.',
      },
      {
        type: 'image',
        src: '/projects/guessquest/game.webp',
        alt: 'GuessQuest — a game cover with four answers on a CRT arcade screen',
        caption: 'A stage — the cover, four answers, and the lifelines below.',
      },
      {
        type: 'heading',
        text: 'How it plays',
        jp: '遊',
        jpLabel: '遊 · Play',
      },
      {
        type: 'list',
        items: [
          'Pick a difficulty: Normal, Hard or Souls',
          'Each stage shows a cover or a screenshot pulled from the RAWG games database, with four answers',
          'A wrong answer costs a life; fifteen stages to reach the end',
          'Three lifelines: call Otacon, ask the students, and the avocado power',
          'Enter your initials and climb the leaderboard, saved on your machine',
          'Sound for every pick, hit, miss and win',
        ],
      },
      {
        type: 'image',
        src: '/projects/guessquest/menu.webp',
        alt: 'GuessQuest — the difficulty select screen',
        caption: 'Insert coin — Normal, Hard or Souls.',
      },
      {
        type: 'heading',
        text: 'Secret initials',
        jp: '猫',
        jpLabel: '猫 · Cat',
      },
      {
        type: 'paragraph',
        body:
          'A few initials are secret words. Type the right one and the arcade summons a cat, a duck or a dog, fetched live from public image APIs.',
      },
      {
        type: 'image',
        src: '/projects/guessquest/easter-egg.webp',
        alt: 'GuessQuest — a cat summoned on the initials screen',
        caption: 'GATO — and a cat appears.',
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
          'Java 17 and JavaFX, with FXML screens styled in CSS and fade transitions between them, built with Maven and packaged as a desktop executable with jpackage. The RAWG API supplies the games; the GitHub API shows the developers\' avatars.',
      },
      {
        type: 'heading',
        text: 'The team',
        jp: '組',
        jpLabel: '組 · Group',
      },
      {
        type: 'paragraph',
        body: 'A two-person build at Unijui — Luan and myself. The project is open source on GitHub.',
      },
    ],
  },
  {
    slug: 'estacao-sao-paulo',
    index: '05',
    title: 'Estação São Paulo',
    jp: '天',
    jpLabel: '天 · Sky',
    year: '2026',
    status: 'Academic · Live demo',
    tagline: 'A weather station that tells you what is wrong before you ask.',
    description:
      'A new front end for a weather station dashboard first built at Unijui: instead of picking a sensor and a line from menus, the first screen says what is out of the ordinary right now, over a camera on the city.',
    roles: ['Product Design', 'Front-End', 'Data Viz', 'Motion'],
    tech: ['React', 'Vite', 'SCSS', 'NestJS', 'PostgreSQL'],
    href: 'https://github.com/LucasSckenal/estacao-sao-paulo',
    live: 'https://estacao-sao-paulo.vercel.app/',
    mood: 'dark',
    sections: [
      {
        type: 'lead',
        body:
          'The old dashboard made people open menus to find out anything. This one answers first: UV too high, a strong gust, rain, fine particles in the air — or simply that all is normal.',
      },
      {
        type: 'image',
        src: '/projects/estacao/inicio.webp',
        alt: 'Estação São Paulo — the first screen: the reading of the hour over the city at night',
        caption: 'The first screen: the hour in one sentence, the temperature, and the readings on glass.',
      },
      { type: 'heading', text: 'Every reading, in its own shape', jp: '形', jpLabel: '形 · Form' },
      {
        type: 'paragraph',
        body:
          'Fourteen readings from two devices, each drawn the way it reads best: a heat strip for UV, a barometer for pressure, bars with a gust mark for wind, a compass for direction, stems for fine particles. One timeline moves every chart at once, back as far as thirty days.',
      },
      {
        type: 'image',
        src: '/projects/estacao/graficos.webp',
        alt: 'Estação São Paulo — the twenty-four hours of every sensor',
        caption: 'The last twenty-four hours, with the chosen hour marked across every chart.',
      },
      {
        type: 'gallery',
        images: [
          { src: '/projects/estacao/celular.webp', alt: 'The first screen on a phone', caption: 'On the phone, the same first screen.', variant: 'mobile' },
          { src: '/projects/estacao/celular-graficos.webp', alt: 'The charts on a phone', caption: 'Charts stack into one column.', variant: 'mobile' },
        ],
      },
      {
        type: 'paragraph',
        body:
          'It reads the station API from the original project; when that API does not answer, the numbers are sample data and the screen says so. The city video is from Pexels.',
      },
    ],
  },
];

// Combined lookup — case study routes serve from either array.
const allProjects = [...leadProjects, ...projects, ...nightProjects];

export function getProject(slug: string): ProjectCase | undefined {
  return allProjects.find((p) => p.slug === slug);
}

export function getAdjacentProjects(
  slug: string
): { prev: ProjectCase; next: ProjectCase } | null {
  // Adjacent navigation stays within the same portfolio (day↔day, night↔night)
  for (const list of [leadProjects, projects, nightProjects]) {
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
      : p.slug === 'nexo' || p.slug === 'ma-finance-os' ? 'personal'
      : 'academic';
    return {
      year: p.year,
      title: p.title,
      type: p.roles.slice(0, 2).join(' · '),
      kind,
      href: `/2026/work/${p.slug}`,
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
    href: `/2026/work/${p.slug}`,
    external: false,
    oneLiner: p.tagline,
  }));

  const lead: ArchiveEntry[] = leadProjects.map((p) => ({
    year: p.year,
    title: p.title,
    type: p.roles.slice(0, 2).join(' · '),
    kind: 'personal',
    href: `/2026/work/${p.slug}`,
    external: false,
    oneLiner: p.tagline,
  }));

  return [...lead, ...featuredDay, ...featuredNight, ...archiveExtras]
    // newest first, stable tie-break by title for deterministic order
    .sort((a, b) => {
      if (a.year !== b.year) return b.year.localeCompare(a.year);
      return a.title.localeCompare(b.title);
    });
}
