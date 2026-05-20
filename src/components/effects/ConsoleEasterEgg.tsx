'use client';

import { useEffect } from 'react';

// Prints a styled signature in the console for devs who open inspect.
// Cheap delight; high signal-to-noise.
export default function ConsoleEasterEgg() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as Window & { __egg__?: boolean }).__egg__) return;
    (window as Window & { __egg__?: boolean }).__egg__ = true;

    const heading = [
      '%c静寂',
      'font-family: serif; font-size: 36px; color: #8C2A1F; line-height: 1; padding: 4px 0;',
    ];
    const tagline = [
      '%cInterfaces that move like cinema.',
      'font-family: serif; font-style: italic; font-size: 14px; color: #EEEAE3; padding: 0 0 8px 0;',
    ];
    const body = [
      [
        '%cCurious about how this is built?',
        'font-family: monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #6B6660;',
      ],
      [
        '%cLet\'s talk — lucaspsckenal@gmail.com',
        'font-family: monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #EEEAE3;',
      ],
      [
        '%cgithub.com/LucasSckenal · linkedin.com/in/lucassckenal',
        'font-family: monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #6B6660;',
      ],
    ];

    console.log(...heading);
    console.log(...tagline);
    body.forEach((line) => console.log(...line));
  }, []);

  return null;
}
