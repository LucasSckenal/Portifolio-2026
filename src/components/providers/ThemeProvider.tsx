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
// Holds two pieces of state:
//   · `inverted`     — current theme (false = Day, true = Night)
//   · `transitioning` — true during the 1.5s cinematic flip
//
// The toggle() function runs a coordinated sequence:
//   t=0.00s  → transitioning = true, all listeners begin choreography
//   t=0.75s  → totality. The actual class flip happens behind the shadow disc.
//              Video crossfade, particles swap, palette inversion all align here.
//   t=1.50s  → transitioning = false. Click re-enabled.
//
// All sub-components (EclipseToggle, ThemeTransitionOverlay, Hero, Particles)
// read from this context so the rhythm stays unified.
// =========================================

const STORAGE_KEY = 'theme-inverted';
const TRANSITION_MS = 1500;
const TOTALITY_MS = 750; // 50% of the transition — when the shadow disc is centered

type ThemeState = {
  inverted: boolean;
  transitioning: boolean;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeState | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initial state synced from the DOM (set by the pre-hydration script in layout.tsx)
  const [inverted, setInverted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const timersRef = useRef<number[]>([]);

  // Sync once on mount — the pre-hydration script may have set the class already
  useEffect(() => {
    setInverted(document.documentElement.classList.contains('theme-inverted'));
  }, []);

  // Clean up any pending timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(window.clearTimeout);
    };
  }, []);

  const toggle = useCallback(() => {
    // Lock the toggle while the choreography is playing — prevents stutters
    // if the user clicks rapidly.
    setTransitioning((wasTransitioning) => {
      if (wasTransitioning) return wasTransitioning;

      // Schedule the actual class flip at totality.
      const flipTimer = window.setTimeout(() => {
        setInverted((prev) => {
          const next = !prev;
          document.documentElement.classList.toggle('theme-inverted', next);
          try {
            localStorage.setItem(STORAGE_KEY, String(next));
          } catch {
            // Safari private mode etc — ignore
          }
          return next;
        });
      }, TOTALITY_MS);

      // Release the lock when the curtain falls
      const releaseTimer = window.setTimeout(() => {
        setTransitioning(false);
      }, TRANSITION_MS);

      timersRef.current.push(flipTimer, releaseTimer);
      return true;
    });
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
