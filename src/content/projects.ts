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
    tech: ['React', 'SCSS', 'Web Speech API', 'Render'],
    team: 'Team of 4 · SENAC · UI / Frontend systems',
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
          'Built during PI-3 at SENAC, this is a multilingual conversational interface designed around low-anxiety conversation. Patients describe what they\'re feeling, the AI assembles a structured summary, and the clinical team gets context before the appointment begins.',
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
          'Multilingual interface (Portuguese, Spanish, English)',
          'Persistent medical profile (blood type, weight, allergies)',
          'Diagnostic history tracked per user',
          'Full UI theming including dark mode and accent color',
          'Symptom auto-tagging extracted from the conversation',
        ],
      },

      {
        type: 'gallery',
        images: [
          { src: '/projects/chatbot/Home.png', alt: 'Dashboard view', caption: 'Dashboard — diagnostics, frequent symptoms, history.' },
          { src: '/projects/chatbot/Settings.png', alt: 'Settings view', caption: 'Settings — dark mode, language, theming.' },
        ],
      },

      {
        type: 'paragraph',
        body:
          'The value sits at the bridge — patient anxiety on one side, structured clinical context on the other. Built in React + SCSS, deployed on Render.',
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
          'The chatbot is live. Use the Live link above to register and try a conversation in any of the three supported languages.',
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
      'A gaming-focused commerce concept built around premium product presentation, animated interactions, and a glass-deep visual language.',
    roles: ['Ecommerce UI', 'Motion Design', 'Frontend Architecture', 'Brand'],
    tech: ['Next.js', 'React', 'SCSS'],
    href: 'https://github.com/LucasSckenal/PhantomCommercee',
    mood: 'glass',
    sections: [
      {
        type: 'lead',
        body:
          'A gaming-focused commerce concept built around premium product presentation and a glass-deep visual language.',
      },
      {
        type: 'image',
        src: '/projects/PhantomComerce/example_productpage.png',
        alt: 'Product detail page',
        caption: 'Product detail — exhibition over catalogue.',
      },
      {
        type: 'paragraph',
        body:
          'Phantom treats each product as the subject of an exhibition rather than an entry in a catalogue. Heavy use of glass, neon edges, and patient motion.',
      },
      {
        type: 'image',
        src: '/projects/PhantomComerce/homepage.png',
        alt: 'Store homepage',
        caption: 'Store homepage.',
      },
      {
        type: 'paragraph',
        body:
          'More case study content coming as the project develops — process notes, animation studies, and reflections on translating retail into a visual narrative.',
      },
    ],
  },
];

export function getProject(slug: string): ProjectCase | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getAdjacentProjects(
  slug: string
): { prev: ProjectCase; next: ProjectCase } | null {
  const i = projects.findIndex((p) => p.slug === slug);
  if (i === -1) return null;
  return {
    prev: projects[(i - 1 + projects.length) % projects.length],
    next: projects[(i + 1) % projects.length],
  };
}
