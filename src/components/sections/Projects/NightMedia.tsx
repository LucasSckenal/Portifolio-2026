import styles from './NightMedia.module.scss';

// Generic atmospheric placeholder for night-portfolio projects.
// Each one is an experiment without screenshots yet — instead of synthetic
// HUDs, we render the project's signature kanji over a mood-specific
// gradient. When real visuals exist, swap the inner content per project.

type NightMediaProps = {
  jp: string;
  jpLabel: string;
  variant: 'spirit' | 'moon' | 'rain';
};

const variantClass: Record<NightMediaProps['variant'], string> = {
  spirit: 'variantSpirit',
  moon:   'variantMoon',
  rain:   'variantRain',
};

export default function NightMedia({ jp, jpLabel, variant }: NightMediaProps) {
  return (
    <div className={`${styles.media} ${styles[variantClass[variant]]}`}>
      <div className={styles.backdrop} aria-hidden />
      <div className={styles.grain} aria-hidden />
      <div className={styles.glow} aria-hidden />

      {/* Top-left meta */}
      <div className={styles.topMeta}>
        <span className={styles.topDot} aria-hidden />
        <span>{jpLabel}</span>
      </div>

      {/* Top-right "study" tag */}
      <span className={styles.experimentTag}>Experiment</span>

      {/* Center kanji */}
      <div className={styles.kanjiWrap} aria-hidden>
        <span className={styles.kanji}>{jp}</span>
      </div>

      {/* Bottom corner brackets */}
      <span className={`${styles.bracket} ${styles.bracketBL}`} aria-hidden />
      <span className={`${styles.bracket} ${styles.bracketBR}`} aria-hidden />

      {/* Bottom label strip */}
      <div className={styles.bottomStrip}>
        <span>夜行 · Yakō</span>
        <span className={styles.bottomStripJp}>Night work</span>
      </div>
    </div>
  );
}
