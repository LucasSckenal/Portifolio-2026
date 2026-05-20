'use client';

import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './SideIndex.module.scss';

const sections = [
  { id: 'top',      label: 'Hero',     index: '01' },
  { id: 'about',    label: 'About',    index: '02' },
  { id: 'projects', label: 'Work',     index: '03' },
  { id: 'stack',    label: 'Stack',    index: '04' },
  { id: 'contact',  label: 'Contact',  index: '05' },
];

export default function SideIndex() {
  const [active, setActive] = useState('top');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const triggers = sections.map((s) =>
      ScrollTrigger.create({
        trigger: `#${s.id}`,
        // Hero is pinned and tall — use 70% so it reads as "active" while pinned
        start: 'top 70%',
        end: 'bottom 30%',
        onEnter:     () => setActive(s.id),
        onEnterBack: () => setActive(s.id),
      })
    );

    return () => triggers.forEach((t) => t.kill());
  }, []);

  return (
    <aside className={styles.sideIndex} aria-label="Section index">
      <ol className={styles.list}>
        {sections.map((s) => {
          const isActive = active === s.id;
          return (
            <li key={s.id} className={styles.item}>
              <a
                href={`#${s.id}`}
                className={`${styles.link} ${isActive ? styles.linkActive : ''}`}
                data-cursor
              >
                <span className={styles.dot} aria-hidden />
                <span className={styles.indexNum}>{s.index}</span>
                <span className={styles.label}>{s.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
