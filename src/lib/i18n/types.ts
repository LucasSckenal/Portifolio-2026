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
    contact: string;
  };
  hero: {
    label1: string;
    label2: string;
    title: [string, string, string];
    bio1: string;
    bio2: string;
    scroll: string;
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
  };
};
