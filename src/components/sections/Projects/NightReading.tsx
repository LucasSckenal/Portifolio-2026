'use client';

import { motion } from 'framer-motion';
import SplitText from '@/components/ui/SplitText';
import Reveal from '@/components/ui/Reveal';
import { useT } from '@/components/providers/LanguageProvider';
import { cinema } from '@/lib/easings';
import styles from './NightReading.module.scss';

// The Night portfolio's interstitial. Plays the role GameWorlds plays in the
// Day flow — sits between the Chatbot scene and the Phantom scene, offering a
// curated library of references that shape the work shown after it.
//
// Each entry: author, title, kind (book/film/talk/album/essay/practice), year,
// one-line note. Edit / extend this array freely as you read more.

type Reading = {
  author: string;
  title: string;
  kind: string;
  year: string;
  note: string;
  jp: string;
};

const readings: Reading[] = [
  {
    author: 'Studio Ghibli',
    title: 'Spirited Away',
    kind: 'Film',
    year: '2001',
    note: 'The patience of frame-by-frame ambient detail.',
    jp: '映',
  },
  {
    author: 'Bret Victor',
    title: 'Inventing on Principle',
    kind: 'Talk',
    year: '2012',
    note: 'Interfaces should respond to the principles behind them.',
    jp: '思',
  },
  {
    author: 'Brian Eno',
    title: 'Music for Airports',
    kind: 'Album',
    year: '1978',
    note: 'Ambient as architecture, not background.',
    jp: '音',
  },
  {
    author: 'Christopher Alexander',
    title: 'A Pattern Language',
    kind: 'Book',
    year: '1977',
    note: 'Living structures are made of small reusable principles.',
    jp: '構',
  },
  {
    author: 'Jiro Yoshihara',
    title: 'Gutai Manifesto',
    kind: 'Essay',
    year: '1956',
    note: 'Let the material speak — never force it.',
    jp: '具',
  },
  {
    author: 'Naoto Fukasawa',
    title: 'Without Thought',
    kind: 'Practice',
    year: 'ongoing',
    note: 'Design that disappears into use.',
    jp: '想',
  },
];

export default function NightReading() {
  const t = useT();
  return (
    <section className={styles.reading} aria-label="Night reading list">
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.labelRow}>
            <span className={styles.label}>{t.nightReading.label}</span>
            <span className={styles.divider} aria-hidden />
            {/* Kanji decorative label stays in JP per design system */}
            <span className={styles.labelJp}>読 · Yomu</span>
          </div>

          <h3 className={styles.title}>
            <span className={styles.titleLine}>
              <SplitText text={t.nightReading.titleLine1} by="word" delay={0.1} />
            </span>
            <span className={styles.titleLine}>
              <SplitText text={t.nightReading.titleLine2} by="word" delay={0.25} />
            </span>
          </h3>

          <Reveal delay={0.4} amount={0.4}>
            <p className={styles.intro}>{t.nightReading.intro}</p>
          </Reveal>
        </header>

        <motion.ol
          className={styles.list}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
          }}
        >
          {readings.map((r, i) => (
            <motion.li
              key={r.title}
              className={styles.entry}
              variants={{
                hidden: { opacity: 0, y: 24 },
                show:   { opacity: 1, y: 0, transition: { duration: 1, ease: cinema } },
              }}
            >
              <span className={styles.entryJp} aria-hidden>{r.jp}</span>
              <span className={styles.entryIndex}>
                {(i + 1).toString().padStart(2, '0')}
              </span>

              <div className={styles.entryHead}>
                <span className={styles.entryAuthor}>{r.author}</span>
                <span className={styles.entryKind}>· {r.kind} · {r.year}</span>
              </div>

              <h4 className={styles.entryTitle}>{r.title}</h4>
              <p className={styles.entryNote}>{r.note}</p>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
