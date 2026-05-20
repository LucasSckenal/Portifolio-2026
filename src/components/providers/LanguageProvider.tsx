'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  DEFAULT_LOCALE,
  LOCALES,
  dictionaries,
  localeMeta,
  type Dictionary,
  type Locale,
} from '@/lib/i18n';

// Client-side i18n. Locale persists to localStorage, syncs html[lang] for
// SEO/screen readers, and exposes the translated dictionary via context.
//
// Why client-side instead of route-based (e.g. /pt, /en):
//   - The portfolio is a single-page experience; URL stays the same when the
//     user switches language. Less friction than full route translation.
//   - Case studies share the URL structure across locales.
//   - Search engines see the default locale; the user picks their language.

const STORAGE_KEY = 'lang';

type LanguageState = {
  locale: Locale;
  dict: Dictionary;
  setLocale: (next: Locale) => void;
};

const LanguageContext = createContext<LanguageState | null>(null);

function resolveInitialLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  // Manual preference first
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && LOCALES.includes(stored)) return stored;
  } catch {
    // private mode etc — fall through
  }
  // Browser preference second
  const browser = navigator.language.slice(0, 2).toLowerCase();
  if ((LOCALES as string[]).includes(browser)) return browser as Locale;
  return DEFAULT_LOCALE;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // SSR-safe default; client effect overrides if a preference exists
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const initial = resolveInitialLocale();
    if (initial !== DEFAULT_LOCALE) setLocaleState(initial);
    document.documentElement.lang = localeMeta[initial].htmlLang;
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    document.documentElement.lang = localeMeta[next].htmlLang;
  }, []);

  return (
    <LanguageContext.Provider
      value={{ locale, dict: dictionaries[locale], setLocale }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useT(): Dictionary {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useT must be used inside <LanguageProvider>');
  return ctx.dict;
}

export function useLocale(): { locale: Locale; setLocale: (l: Locale) => void } {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLocale must be used inside <LanguageProvider>');
  return { locale: ctx.locale, setLocale: ctx.setLocale };
}
