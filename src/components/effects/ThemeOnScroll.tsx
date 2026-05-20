'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Swaps body[data-theme] as the user scrolls into the target section,
// allowing a slow background-color transition from paper to ink.
export default function ThemeOnScroll({
  selector,
  theme = 'dark',
}: {
  selector: string;
  theme?: 'dark' | 'light';
}) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);
    const el = document.querySelector(selector);
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      // Engage as soon as the section enters from the bottom of the viewport
      start: 'top bottom-=15%',
      // Only release if the section scrolls completely above the viewport.
      // For the last section this never fires — so the dark theme persists
      // all the way to the page bottom.
      end: 'bottom top',
      onEnter:      () => document.body.setAttribute('data-theme', theme),
      onEnterBack:  () => document.body.setAttribute('data-theme', theme),
      onLeave:      () => document.body.removeAttribute('data-theme'),
      onLeaveBack:  () => document.body.removeAttribute('data-theme'),
    });

    return () => {
      trigger.kill();
      document.body.removeAttribute('data-theme');
    };
  }, [selector, theme]);

  return null;
}
