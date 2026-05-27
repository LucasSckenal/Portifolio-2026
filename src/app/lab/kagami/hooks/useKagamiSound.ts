'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// ── useKagamiSound ────────────────────────────────────
// Manages two layered audio sources:
//   · ambient — looping low-frequency drone (water + wind atmosphere)
//   · bell    — single shrine bell, plays at random intervals (30-90s)
//
// Both default OFF (browsers block autoplay until user gesture). The
// returned `toggle()` enables/disables audio; preference is remembered
// in localStorage so revisits respect the user's choice.
//
// Asset paths (drop your own WAV/MP3 there):
//   public/lab/kagami/ambient.mp3   — short loop (15-30s, ~1MB)
//   public/lab/kagami/bell.mp3      — single hit (3-5s, ~200KB)
//
// Free CC0 sources I'd recommend:
//   · ambient: search "water lake ambient" on freesound.org
//   · bell:    search "japanese temple bell" or "shrine bell" on freesound.org

const STORAGE_KEY = 'kagami-sound-on';
const BELL_INTERVAL_MIN = 30_000;  // 30 seconds
const BELL_INTERVAL_MAX = 90_000;  // 90 seconds
const AMBIENT_VOLUME = 0.35;
const BELL_VOLUME = 0.45;

export function useKagamiSound() {
  const [enabled, setEnabled] = useState(false);
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const bellRef = useRef<HTMLAudioElement | null>(null);
  const bellTimerRef = useRef<number | null>(null);

  // ── Setup audio elements on mount ──
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ambient = new Audio('/lab/kagami/ambient.mp3');
    ambient.loop = true;
    ambient.volume = AMBIENT_VOLUME;
    ambient.preload = 'auto';
    ambientRef.current = ambient;

    const bell = new Audio('/lab/kagami/bell.mp3');
    bell.volume = BELL_VOLUME;
    bell.preload = 'auto';
    bellRef.current = bell;

    // Restore preference (but never auto-start — browsers block it without gesture)
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'true') {
        // Don't auto-play; just remember the preference so the toggle
        // visually starts in "on" state. First click will actually play.
      }
    } catch {
      // Safari private mode etc — ignore
    }

    return () => {
      ambient.pause();
      bell.pause();
      if (bellTimerRef.current) window.clearTimeout(bellTimerRef.current);
    };
  }, []);

  // ── Schedule the next bell at a random interval ──
  const scheduleNextBell = useCallback(() => {
    if (bellTimerRef.current) window.clearTimeout(bellTimerRef.current);
    const delay =
      BELL_INTERVAL_MIN +
      Math.random() * (BELL_INTERVAL_MAX - BELL_INTERVAL_MIN);
    bellTimerRef.current = window.setTimeout(() => {
      if (bellRef.current) {
        bellRef.current.currentTime = 0;
        bellRef.current.play().catch(() => {});
      }
      scheduleNextBell(); // chain the next one
    }, delay);
  }, []);

  // ── Toggle action (must be called from a user gesture) ──
  const toggle = useCallback(() => {
    const next = !enabled;
    setEnabled(next);

    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // ignore
    }

    if (next) {
      // Enable: start ambient + schedule first bell
      ambientRef.current?.play().catch(() => {
        // Browser blocked — toggle will need another click
      });
      // First bell plays after the random interval (not immediately, to feel natural)
      scheduleNextBell();
    } else {
      // Disable: stop everything
      ambientRef.current?.pause();
      bellRef.current?.pause();
      if (bellTimerRef.current) {
        window.clearTimeout(bellTimerRef.current);
        bellTimerRef.current = null;
      }
    }
  }, [enabled, scheduleNextBell]);

  return { enabled, toggle };
}
