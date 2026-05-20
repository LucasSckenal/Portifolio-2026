'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import SplitText from '@/components/ui/SplitText';
import Reveal from '@/components/ui/Reveal';
import { cinema } from '@/lib/easings';
import styles from './GameWorlds.module.scss';

// To add a real screenshot to any world, set `image` to either:
//   · a local path like '/projects/game/worlds/01.jpg' (drop the file in
//     public/projects/game/worlds/), or
//   · a raw GitHub URL while you don't have the asset locally.
// If left undefined, the card renders kanji-only (clean fallback).
type World = {
  idx: string;
  name: string;
  tema: string;
  boss: string | null;
  bossDetail?: string;
  tag: string | null;
  jp: string;
  image?: string;
};

const worlds: World[] = [
  {
    idx: '01',
    name: 'Floresta Medieval',
    tema: 'Medieval · Fantasia',
    boss: 'Golem de Pedra Ancestral',
    tag: 'Tutorial',
    jp: '森',
  },
  {
    idx: '02',
    name: 'Deserto Carmesim',
    tema: 'Egípcio',
    boss: 'Faraó',
    tag: null,
    jp: '砂',
    image: 'https://raw.githubusercontent.com/LucasSckenal/pi-4/main/docs/screenshots/mapa_deserto.png',
  },
  {
    idx: '03',
    name: 'Mansão Assombrada',
    tema: 'Terror',
    boss: 'Bruxa',
    tag: null,
    jp: '幽',
  },
  {
    idx: '04',
    name: 'Fenda dos Piratas',
    tema: 'Oceano',
    boss: 'Holandês Voador',
    tag: null,
    jp: '海',
  },
  {
    idx: '05',
    name: 'Planeta Maluco',
    tema: 'Sci-Fi · Espaço',
    boss: 'Cosmic Kraken',
    tag: null,
    jp: '宙',
  },
  {
    idx: '06',
    name: 'Covil do Dragão',
    tema: 'Vulcão',
    boss: 'Dragão',
    bossDetail: 'evolves per wave',
    tag: 'Final',
    jp: '龍',
  },
];

// Cinematic interstitial between the Game scene and the Chatbot scene —
// a chapter break that shows the breadth of the project.
export default function GameWorlds() {
  return (
    <section className={styles.worlds} aria-label="Six themed worlds">
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.labelRow}>
            <span className={styles.label}>↳ Onde Estão os Netos? · supplementary</span>
            <span className={styles.divider} aria-hidden />
            <span className={styles.labelJp}>世界 · Sekai</span>
          </div>

          <h3 className={styles.title}>
            <span className={styles.titleLine}>
              <SplitText text="Six themed worlds" by="word" delay={0.1} />
            </span>
            <span className={styles.titleLine}>
              <SplitText text="to cross." by="word" delay={0.25} />
            </span>
          </h3>

          <Reveal delay={0.4} amount={0.4}>
            <p className={styles.intro}>
              Each map carries its own visual identity, NavMesh, enemy roster,
              base architecture and soundtrack — six self-contained chambers
              the player moves through in sequence.
            </p>
          </Reveal>
        </header>

        <motion.ol
          className={styles.list}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08, delayChildren: 0.4 } },
          }}
        >
          {worlds.map((w) => (
            <motion.li
              key={w.idx}
              className={`${styles.card} ${w.image ? styles.cardWithImage : ''}`}
              variants={{
                hidden: { opacity: 0, y: 30 },
                show:   { opacity: 1, y: 0, transition: { duration: 1, ease: cinema } },
              }}
            >
              {w.image && (
                <div className={styles.cardImageWrap}>
                  <Image
                    src={w.image}
                    alt={`${w.name} — ${w.tema}`}
                    className={styles.cardImage}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 18vw"
                    loading="lazy"
                  />
                  <div className={styles.cardImageDim} aria-hidden />
                </div>
              )}

              <div className={styles.cardJp} aria-hidden>{w.jp}</div>

              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <span className={styles.cardIdx}>Mundo {w.idx}</span>
                  {w.tag && <span className={styles.cardTag}>{w.tag}</span>}
                </div>

                <h4 className={styles.cardName}>{w.name}</h4>
                <span className={styles.cardTema}>{w.tema}</span>

                <div className={styles.cardFoot}>
                  {w.boss ? (
                    <>
                      <span className={styles.cardBossDot} aria-hidden />
                      <span className={styles.cardBoss}>
                        {w.boss}
                        {w.bossDetail && (
                          <span className={styles.cardBossDetail}> · {w.bossDetail}</span>
                        )}
                      </span>
                    </>
                  ) : (
                    <span className={styles.cardNoBoss}>—</span>
                  )}
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
