// Shape of the translation dictionary. Each locale provides the same keys.

export type Locale = 'en' | 'pt' | 'es' | 'it' | 'ja';

export type Dictionary = {
  meta: {
    available: string;
  };
  nav: {
    index: string;
    work: string;
    about: string;
    lab: string;
    contact: string;
  };
  hero: {
    label1: string;
    label2: string;
    title: [string, string, string];
    bio1: string;
    bio2: string;
    scroll: string;
    // Night variants — swapped in by Hero.tsx when theme is inverted
    titleNight: [string, string, string];
    bio1Night: string;
    bio2Night: string;
  };
  about: {
    label: string;
    labelJp: string;
    titleLine1: string;
    titleLine2: string;
    paragraphs: string[];
    caption: string;
    statFocusLabel: string;
    statFocusValue: string;
    statBuildingLabel: string;
    statBuildingValue: string;
    statCurrentlyLabel: string;
    statCurrentlyValue: string;
  };
  projects: {
    label: string;
    labelJp: string;
    titleLine1: string;
    titleLine2: string;
    intro: string;
    caseStudyCta: string;
    liveCta: string;
    repoCta: string;
    moreLine: string;
    moreLink: string;
  };
  // NIGHT portfolio header (Projects.tsx NightBlock — academic university work)
  projectsNight: {
    label: string;
    titleLine1: string;
    titleLine2: string;
    intro: string;
    moreLine: string;
    moreLink: string;
  };
  // Night-only interstitial (NightReading.tsx)
  nightReading: {
    label: string;
    titleLine1: string;
    titleLine2: string;
    intro: string;
  };
  // Day interstitial inside the Game project (GameWorlds.tsx)
  gameWorlds: {
    label: string;
    titleLine1: string;
    titleLine2: string;
    intro: string;
    worldPrefix: string;
  };
  stack: {
    label: string;
    labelJp: string;
    titleLine1: string;
    titleLine2: string;
    philosophyMotion: string;
    philosophyMotionDesc: string;
    philosophyComposition: string;
    philosophyCompositionDesc: string;
    philosophyCraft: string;
    philosophyCraftDesc: string;
    // Night philosophy — swapped in by Stack.tsx when theme is inverted
    philosophyCuriosity: string;
    philosophyCuriosityDesc: string;
    philosophyPatience: string;
    philosophyPatienceDesc: string;
    philosophyDrift: string;
    philosophyDriftDesc: string;
  };
  contact: {
    label: string;
    labelJp: string;
    titleLine1: string;
    titleLine2: string;
    titleLine3: string;
    body: string;
    languagesLabel: string;
    footerIndexLabel: string;
    footerIndexValue: string;
    footerDisciplineLabel: string;
    footerDisciplineValue: string;
    footerSignalLabel: string;
    footerSignalValue: string;
    footerMadeWithLabel: string;
    footerMadeWithValue: string;
    emailHover: string;
    emailCopied: string;
    // Night extras — appended/swapped when theme is inverted
    bodyNightExtra: string;
    footerSignalValueNight: string;
  };
  // About → "Now" card (update monthly)
  now: {
    label: string;
    items: string[];
  };
  // Home entry point to the Lab (LabPromo.tsx)
  labPromo: {
    label: string;
    titleLine1: string;
    titleLine2: string;
    body: string;
    cta: string;
    enter: string;
  };
  // /lab gallery page
  lab: {
    titleLine1: string;
    titleLine2: string;
    intro: string;
    enter: string;
    footer: string;
    pieces: Record<string, { status: string; tagline: string; description: string }>;
  };
  // /work filmography page
  work: {
    label: string;
    titleLine1: string;
    titleLine2: string;
    // {year} and {count} are replaced at render time
    intro: string;
    filters: {
      all: string;
      commercial: string;
      personal: string;
      academic: string;
      experiment: string;
    };
    piece: string;
    pieces: string;
    footer: string;
    footerLink: string;
    readCase: string;
    open: string;
  };
  // Case study page chrome
  caseStudy: {
    builtWith: string;
    live: string;
    download: string;
    repo: string;
    previous: string;
    next: string;
    // Shown above the body when the case text is not in this locale
    bodyNote: string;
  };
  // ── 2027 home (src/components/site) ──
  site: {
    nav: { work: string; about: string; contact: string; cta: string; language: string; back: string; menu: string; quoteMessage: string };
    hero: {
      line1: string;
      line2: string;
      sub: string;
      primary: string;
      secondary: string;
      cardLeftTitle: string;
      cardLeftBody: string;
      cardRightTitle: string;
      cardRightBody: string;
      openHint: string;
      noteWhat: string;
      noteFocus: string;
      noteNow: string;
      noteStatus: string;
      activity: string;
      activityRelease: string;
      liveLabel: string;
      motto: string;
      badge: string;
      dragHint: string;
      viewProject: string;
      privacy: string;
      close: string;
    };
    versions: { label: string; title: string; current: string; archived: string; backToCurrent: string };
    projects: { title: string; sub: string };
    notFound: { label: string; title: string; body: string; home: string; projects: string };
    about: {
      nav: string;
      label: string;
      title: string;
      body: string;
      offLabel: string;
      offTitle: string;
      offBody: string;
      teaser: string;
      facts: Array<{ label: string; value: string }>;
    };
    social: {
      label: string;
      title: string;
      body: string;
      center: string;
      copy: string;
      copied: string;
      clockPlace: string;
      clockLabel: string;
    };
  };
};
