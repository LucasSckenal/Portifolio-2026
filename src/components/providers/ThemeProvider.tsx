'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

// =========================================
// Cinematic theme orchestrator.
//
// Two pieces of state:
//   · `inverted`     — current theme (false = Day, true = Night)
//   · `transitioning` — true during the 1.5s cinematic flip
//
// Coordinated sequence on toggle():
//   t=0.00s  → transitioning = true
//   t=0.75s  → totality. The class flips at this exact moment.
//              Video crossfade, particles swap, palette inversion all align.
//   t=1.50s  → transitioning = false. Click re-enabled.
//
// IMPORTANT: state updater functions are kept PURE (no side effects).
// Strict Mode in dev runs them twice; side effects inside would schedule
// the choreography twice. The DOM sync (classList + localStorage) lives in
// a dedicated useEffect that only fires when `inverted` actually changes.
// =========================================

const STORAGE_KEY = 'theme-inverted';
const TRANSITION_MS = 1500;
const TOTALITY_MS = 750;

type ThemeState = {
  inverted: boolean;
  transitioning: boolean;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeState | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [inverted, setInverted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  // Lock as a ref so we can guard against re-entry without a stale closure
  const lockedRef = useRef(false);

  // Timer handles for cleanup on unmount
  const timersRef = useRef<number[]>([]);

  // ── First-paint sync — read what the pre-hydration script wrote ──
  // The inline script in <body> adds `theme-inverted` to <html> based on
  // localStorage. We mirror that into React state once on mount so the
  // useTheme() consumers see the right value.
  useEffect(() => {
    const initial = document.documentElement.classList.contains('theme-inverted');
    setInverted(initial);
  }, []);

  // ── DOM sync — runs ONLY when `inverted` actually flips ──
  // Skips the initial mount because the class is already set by the script.
  const isFirstSync = useRef(true);
  useEffect(() => {
    if (isFirstSync.current) {
      isFirstSync.current = false;
      return;
    }
    document.documentElement.classList.toggle('theme-inverted', inverted);
    try {
      localStorage.setItem(STORAGE_KEY, String(inverted));
    } catch {
      // Safari private mode etc — ignore
    }
  }, [inverted]);

  // ── Timer cleanup on unmount ──
  useEffect(() => {
    return () => {
      timersRef.current.forEach(window.clearTimeout);
      timersRef.current = [];
    };
  }, []);

  // ── Toggle action ──
  // Pure scheduling — no state updaters with side effects.
  // The lockedRef guard prevents double-clicks and re-entry without stale state.
  const toggle = useCallback(() => {
    if (lockedRef.current) return;
    lockedRef.current = true;

    setTransitioning(true);

    // At totality, flip the actual value. The state updater is pure — the
    // classList / localStorage side effects live in the sync useEffect above.
    const flipTimer = window.setTimeout(() => {
      setInverted((prev) => !prev);
    }, TOTALITY_MS);

    // End of transition — release the lock and re-enable the toggle
    const releaseTimer = window.setTimeout(() => {
      setTransitioning(false);
      lockedRef.current = false;
    }, TRANSITION_MS);

    timersRef.current.push(flipTimer, releaseTimer);
  }, []);

  return (
    <ThemeContext.Provider value={{ inverted, transitioning, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return ctx;
}
