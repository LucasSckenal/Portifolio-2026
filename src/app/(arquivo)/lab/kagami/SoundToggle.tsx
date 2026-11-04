'use client';

import { useKagamiSound } from './hooks/useKagamiSound';
import styles from './KagamiScene.module.scss';

// Sound on/off pill — lives in the overlay UI of the Kagami page.
// First click enables audio (browsers require a user gesture before playing
// any sound). The bell schedules itself at random intervals afterward.

export default function SoundToggle() {
  const { enabled, toggle } = useKagamiSound();

  return (
    <button
      type="button"
      className={styles.soundToggle}
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? 'Mute ambient sound' : 'Enable ambient sound'}
    >
      <span className={styles.soundIcon} aria-hidden>
        {enabled ? '◉' : '○'}
      </span>
      <span>{enabled ? 'Sound on' : 'Sound off'}</span>
    </button>
  );
}
