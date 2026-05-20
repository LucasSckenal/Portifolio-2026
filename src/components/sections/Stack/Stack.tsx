'use client';

import { motion } from 'framer-motion';
import SplitText from '@/components/ui/SplitText';
import Reveal from '@/components/ui/Reveal';
import { cinema } from '@/lib/easings';
import styles from './Stack.module.scss';

const stack = [
  {
    name: 'Next.js',
    group: 'Framework',
    detail: 'App Router, static generation, edge runtime for dynamic OG.',
  },
  {
    name: 'React',
    group: 'Framework',
    detail: 'Server + client components, hooks-first state. React 19.',
  },
  {
    name: 'TypeScript',
    group: 'Language',
    detail: 'Strict mode end-to-end. Tokenized design system, typed content.',
  },
  {
    name: 'GSAP',
    group: 'Motion',
    detail: 'ScrollTrigger timelines, route curtains, scrubbed scenes.',
  },
  {
    name: 'Framer Motion',
    group: 'Motion',
    detail: 'Variants, presence, viewport-triggered reveals.',
  },
  {
    name: 'Lenis',
    group: 'Motion',
    detail: 'Buttery smooth scrolling with reduced-motion fallback.',
  },
  {
    name: 'Three.js',
    group: '3D',
    detail: 'Procedural scenes for atmospheric backgrounds.',
  },
  {
    name: 'WebGL',
    group: '3D',
    detail: 'Custom shaders for fog, particles and grain.',
  },
  {
    name: 'SCSS',
    group: 'Styling',
    detail: 'CSS Modules + design tokens with theme inversion.',
  },
  {
    name: 'Godot',
    group: 'Game',
    detail: 'Onde Estão os Netos? — GDScript, CSV balancing, autoloads.',
  },
  {
    name: 'Figma',
    group: 'Design',
    detail: 'Components and design systems before code.',
  },
  {
    name: 'Firebase',
    group: 'Backend',
    detail: 'Auth + Firestore on the chatbot and Phantom Commerce.',
  },
];

const philosophy = [
  { jp: '動', label: 'Motion',      value: 'Slow, intentional, cinematic.' },
  { jp: '間', label: 'Composition', value: 'Negative space as a feature.' },
  { jp: '質', label: 'Craft',       value: 'Polish in the last 10%.' },
];

export default function Stack() {
  return (
    <section id="stack" className={styles.stack}>
      <div className={styles.inner}>
        {/* ── Header ── */}
        <header className={styles.header}>
          <div className={styles.labelRow}>
            <span className={styles.label}>004 — Stack</span>
            <span className={styles.divider} aria-hidden />
            <span className={styles.labelJp}>道具 · Dōgu</span>
          </div>

          <h2 className={styles.title}>
            <span className={styles.titleLine}>
              <SplitText text="Tools, never the" by="word" delay={0.1} />
            </span>
            <span className={styles.titleLine}>
              <SplitText text="point of the work." by="word" delay={0.25} />
            </span>
          </h2>
        </header>

        {/* ── Two-column composition ── */}
        <div className={styles.grid}>
          {/* Left — philosophy */}
          <div className={styles.philosophy}>
            {philosophy.map((p, i) => (
              <Reveal key={p.label} delay={0.1 + i * 0.12}>
                <div className={styles.philosophyItem}>
                  <span className={styles.philosophyJp}>{p.jp}</span>
                  <div>
                    <span className={styles.philosophyLabel}>{p.label}</span>
                    <p className={styles.philosophyValue}>{p.value}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Right — stack inventory */}
          <motion.ul
            className={styles.list}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } },
            }}
          >
            {stack.map((item, i) => (
              <motion.li
                key={item.name}
                className={styles.item}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: cinema } },
                }}
              >
                <div className={styles.itemRow}>
                  <span className={styles.itemIndex}>
                    {(i + 1).toString().padStart(2, '0')}
                  </span>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemDots} aria-hidden />
                  <span className={styles.itemGroup}>{item.group}</span>
                </div>
                <div className={styles.itemDetailWrap} aria-hidden>
                  <p className={styles.itemDetail}>{item.detail}</p>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
