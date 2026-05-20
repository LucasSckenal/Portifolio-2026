'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Body starts dark (matches Hero video). When the user crosses into About,
// body bg transitions to warm paper via the CSS transition on <body>.
// Mirrored on scroll-back-up.
export default function HeroBodyBridge() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // Make sure dark theme is set on mount in case SSR didn't render it
    if (!document.body.hasAttribute('data-theme')) {
      document.body.setAttribute('data-theme', 'dark');
    }

    const trigger = ScrollTrigger.create({
      trigger: '#about',
      start: 'top 70%',
      // No explicit end — we manage state via enter/leaveBack only
      onEnter:     () => document.body.removeAttribute('data-theme'),
      onLeaveBack: () => document.body.setAttribute('data-theme', 'dark'),
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return null;
}
