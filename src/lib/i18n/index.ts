import type { Dictionary, Locale } from './types';
import { en } from './dictionaries/en';
import { pt } from './dictionaries/pt';
import { es } from './dictionaries/es';
import { it } from './dictionaries/it';
import { ja } from './dictionaries/ja';

export type { Dictionary, Locale };

export const dictionaries: Record<Locale, Dictionary> = {
  en,
  pt,
  es,
  it,
  ja,
};

export const localeMeta: Record<Locale, { name: string; short: string; htmlLang: string }> = {
  en: { name: 'English',   short: 'EN', htmlLang: 'en'    },
  pt: { name: 'Português', short: 'PT', htmlLang: 'pt-BR' },
  es: { name: 'Español',   short: 'ES', htmlLang: 'es'    },
  it: { name: 'Italiano',  short: 'IT', htmlLang: 'it'    },
  ja: { name: '日本語',     short: 'JP', htmlLang: 'ja'    },
};

export const LOCALES: Locale[] = ['en', 'pt', 'es', 'it', 'ja'];
export const DEFAULT_LOCALE: Locale = 'en';
