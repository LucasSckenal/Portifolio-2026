'use client';

// Page-to-page morph with the View Transitions API.
//
// Elements that share a `view-transition-name` on both pages (the opened
// card's picture and title, the case page's hero frame and title) are
// carried across by the browser: the card grows into the case page instead
// of the page swapping. Without the API, or with reduced motion, it is a
// plain client navigation.

type Router = { push: (href: string) => void };

let arrive: (() => void) | null = null;

// The destination calls this once its first frame is in the DOM.
export function pageArrived() {
  const done = arrive;
  arrive = null;
  done?.();
}

export function morphTo(router: Router, href: string) {
  const doc = document as Document & {
    startViewTransition?: (cb: () => Promise<void>) => unknown;
  };
  // ?motion forces full motion, as on the home page (for testing)
  const calm =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    !new URLSearchParams(window.location.search).has('motion');
  if (!doc.startViewTransition || calm) {
    router.push(href);
    return;
  }
  document.documentElement.classList.toggle('force-motion', !calm);
  doc.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        arrive = resolve;
        router.push(href);
        // never hold the page frozen if the destination is slow to mount
        window.setTimeout(pageArrived, 1200);
      })
  );
}

// view-transition-name values shared by both pages
export const MORPH = { media: 'case-media', title: 'case-title' } as const;
