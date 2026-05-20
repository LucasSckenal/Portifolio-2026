import styles from './Particles.module.scss';

// Two atmospheric layers, both rendered always, with opacity controlled by
// `html.theme-inverted` via CSS — so the crossfade happens automatically
// during the 1.5s theme transition without any JS state.
//
//   Day   → solar dust (warm motes drifting upward slowly)
//   Night → stars (cold pinpoints twinkling in place)
//
// Positions are deterministic (computed from the index) to avoid hydration
// mismatches and keep the layout stable across reloads.

const COUNT = 26;

const dust = Array.from({ length: COUNT }, (_, i) => ({
  left: ((i * 37 + 13) % 95) + '%',
  delay: ((i * 0.7) % 8).toFixed(2) + 's',
  duration: 18 + (i % 6) * 4 + 's',
  size: 1.5 + (i % 3) * 0.5 + 'px',
}));

const stars = Array.from({ length: COUNT }, (_, i) => ({
  left: ((i * 47 + 9) % 96) + '%',
  top:  ((i * 73 + 11) % 90) + '%',
  delay: ((i * 0.4) % 5).toFixed(2) + 's',
  duration: 3 + (i % 5) + 's',
  size: 1.2 + (i % 3) * 0.4 + 'px',
}));

export default function Particles() {
  return (
    <div className={styles.particles} aria-hidden>
      <div className={`${styles.layer} ${styles.day}`}>
        {dust.map((p, i) => (
          <span
            key={`d-${i}`}
            className={styles.dust}
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
              width: p.size,
              height: p.size,
            }}
          />
        ))}
      </div>

      <div className={`${styles.layer} ${styles.night}`}>
        {stars.map((p, i) => (
          <span
            key={`s-${i}`}
            className={styles.star}
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              animationDuration: p.duration,
              width: p.size,
              height: p.size,
            }}
          />
        ))}
      </div>
    </div>
  );
}
