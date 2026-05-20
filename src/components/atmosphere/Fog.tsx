import styles from './Fog.module.scss';

// Two drifting noise layers to suggest soft atmosphere over the hero video.
// Pure CSS — no JS cost.
export default function Fog() {
  return (
    <div className={styles.fog} aria-hidden>
      <svg className={styles.layer} preserveAspectRatio="none">
        <filter id="fog-a">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="3" />
          <feColorMatrix
            values="0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 0.55 0"
          />
        </filter>
        <rect width="200%" height="100%" filter="url(#fog-a)" />
      </svg>

      <svg className={`${styles.layer} ${styles.layerB}`} preserveAspectRatio="none">
        <filter id="fog-b">
          <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves="2" seed="11" />
          <feColorMatrix
            values="0 0 0 0 0.95
                    0 0 0 0 0.92
                    0 0 0 0 0.88
                    0 0 0 0.4 0"
          />
        </filter>
        <rect width="200%" height="100%" filter="url(#fog-b)" />
      </svg>
    </div>
  );
}
