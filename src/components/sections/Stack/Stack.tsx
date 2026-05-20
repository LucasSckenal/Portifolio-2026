'use client';

import { motion } from 'framer-motion';
import SplitText from '@/components/ui/SplitText';
import Reveal from '@/components/ui/Reveal';
import { cinema } from '@/lib/easings';
import styles from './Stack.module.scss';

const stack = [
  { name: 'Next.js',       group: 'Framework' },
  { name: 'React',         group: 'Framework' },
  { name: 'TypeScript',    group: 'Language'  },
  { name: 'GSAP',          group: 'Motion'    },
  { name: 'Framer Motion', group: 'Motion'    },
  { name: 'Lenis',         group: 'Motion'    },
  { name: 'Three.js',      group: '3D'        },
  { name: 'WebGL',         group: '3D'        },
  { name: 'SCSS',          group: 'Styling'   },
  { name: 'Tailwind',      group: 'Styling'   },
  { name: 'Figma',         group: 'Design'    },
  { name: 'After Effects', group: 'Motion'    },
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
                <span className={styles.itemIndex}>
                  {(i + 1).toString().padStart(2, '0')}
                </span>
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.itemDots} aria-hidden />
                <span className={styles.itemGroup}>{item.group}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
