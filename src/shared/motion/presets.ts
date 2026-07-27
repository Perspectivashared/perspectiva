import type { Variants } from 'framer-motion';

/** Cubic-bezier tuples mirroring the CSS --ease-* tokens so JS and CSS agree. */
type Bezier = [number, number, number, number];

export const EASE = {
  standard: [0.4, 0, 0.2, 1] as Bezier,
  outExpo: [0.22, 1, 0.36, 1] as Bezier,
  outSoft: [0.16, 1, 0.3, 1] as Bezier,
};

/** Seconds, mirroring the CSS --duration-* tokens. */
export const DURATION = { fast: 0.15, base: 0.25, slow: 0.45 };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.slow, ease: EASE.outExpo } },
};

export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export const reveal: Variants = {
  hidden: { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
  visible: {
    opacity: 1,
    clipPath: 'inset(0 0% 0 0)',
    transition: { duration: DURATION.slow, ease: EASE.outSoft },
  },
};
