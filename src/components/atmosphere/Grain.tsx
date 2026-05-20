import styles from './Grain.module.scss';

// Fixed full-viewport film grain. SVG turbulence → no asset needed.
// Animated via CSS keyframes for that flickering analog feel.
export default function Grain() {
  return (
    <div className={styles.grain} aria-hidden>
      <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  );
}
