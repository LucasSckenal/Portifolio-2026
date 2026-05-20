// Framer Motion variant library — all sections share this vocabulary.
import type { Variants } from 'framer-motion';
import { cinema, settle } from './easings';

export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 40 },
  show:   { opacity: 1, y: 0, transition: { duration: 1.2, ease: cinema } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 1.6, ease: cinema } },
};

export const maskUp: Variants = {
  hidden: { clipPath: 'inset(0 0 100% 0)', y: 30 },
  show:   {
    clipPath: 'inset(0 0 0% 0)',
    y: 0,
    transition: { duration: 1.4, ease: cinema },
  },
};

export const charStagger: Variants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.1 },
  },
};

export const charChild: Variants = {
  hidden: { y: '110%', opacity: 0 },
  show:   {
    y: '0%',
    opacity: 1,
    transition: { duration: 0.9, ease: settle },
  },
};

export const groupStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};
