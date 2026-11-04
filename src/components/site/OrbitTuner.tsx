'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ORBIT, ORBIT_DEFAULTS, type OrbitTuning } from './orbitTuning';
import styles from './tuner.module.scss';

// Live sliders for the halo, shown only with ?ajustar in the address.
// The scene reads ORBIT every frame, so moving a slider moves the ring.
// "Copiar valores" gives the line to paste into orbitTuning.ts.

const STORE = 'orbit-tuning';

const FIELDS: Array<{ key: keyof OrbitTuning; label: string; min: number; max: number; step: number; unit?: string }> = [
  { key: 'roll', label: 'Inclinação lateral', min: -35, max: 35, step: 1, unit: '°' },
  { key: 'pitch', label: 'Inclinação pra frente', min: -35, max: 35, step: 1, unit: '°' },
  { key: 'height', label: 'Altura', min: -0.1, max: 0.45, step: 0.01 },
  { key: 'radius', label: 'Tamanho do anel', min: 0.28, max: 0.75, step: 0.01 },
];

export default function OrbitTuner() {
  const [values, setValues] = useState<OrbitTuning>({ ...ORBIT });
  const [copied, setCopied] = useState(false);

  // Restore the last session's values while tuning
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) ?? 'null') as OrbitTuning | null;
      if (saved) {
        Object.assign(ORBIT, saved);
        setValues({ ...ORBIT });
      }
    } catch {
      // storage unavailable: start from the defaults
    }
  }, []);

  const set = (key: keyof OrbitTuning, v: number) => {
    ORBIT[key] = v;
    const next = { ...ORBIT };
    setValues(next);
    try {
      localStorage.setItem(STORE, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const reset = () => {
    Object.assign(ORBIT, ORBIT_DEFAULTS);
    setValues({ ...ORBIT });
    try {
      localStorage.removeItem(STORE);
    } catch {
      // ignore
    }
  };

  const line = `roll: ${values.roll}, pitch: ${values.pitch}, height: ${values.height}, radius: ${values.radius}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(line);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt('Copie os valores:', line);
    }
  };

  // Portaled to <body> so no hero layer can sit on top of it
  return createPortal(
    <div className={styles.tuner} role="group" aria-label="Ajustar o anel">
      <p className={styles.title}>Ajustar o anel</p>
      {FIELDS.map((f) => (
        <label key={f.key} className={styles.row}>
          <span className={styles.label}>
            {f.label}
            <b>
              {values[f.key]}
              {f.unit ?? ''}
            </b>
          </span>
          <input
            type="range"
            min={f.min}
            max={f.max}
            step={f.step}
            value={values[f.key]}
            onChange={(e) => set(f.key, parseFloat(e.target.value))}
          />
        </label>
      ))}
      <code className={styles.code}>{line}</code>
      <div className={styles.actions}>
        <button type="button" onClick={copy} className={styles.primary}>
          {copied ? 'Copiado' : 'Copiar valores'}
        </button>
        <button type="button" onClick={reset}>
          Restaurar
        </button>
      </div>
    </div>,
    document.body
  );
}
