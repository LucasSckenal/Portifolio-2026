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

const saveCookie = (l: Locale) => {
  // a year; read by the root layout so the server renders this language
  document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`;
};

export function LanguageProvider({
  children,
  initial = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  // the language the server rendered (root layout: cookie, then Accept-Language)
  initial?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initial);

  useEffect(() => {
    // an older saved choice that only lives in localStorage wins once,
    // and moves into the cookie so the server renders it from now on
    const resolved = resolveInitialLocale();
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    if (stored && resolved !== initial) setLocaleState(resolved);
    if (stored) saveCookie(resolved);
    document.documentElement.lang = localeMeta[stored ? resolved : initial].htmlLang;
  }, [initial]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    saveCookie(next);
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
