'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useT } from '@/components/providers/LanguageProvider';
import Nav from '@/components/site/Nav';
import { SHOWCASE } from '@/components/site/panels';
import site from '@/components/site/site.module.scss';
import styles from './not-found.module.scss';

// 404 in the current edition: same ground, nav and type as the home page,
// a way back, and every project one click away.
export default function NotFound() {
  const t = useT();
  const n = t.site.notFound;
  return (
    <div className={`${site.site} site-v3`}>
      <Nav />
      <main id="main" className={styles.page}>
        <p className={styles.label}>{n.label}</p>
        <h1 className={styles.title}>{n.title}</h1>
        <p className={styles.body}>{n.body}</p>
        <Link href="/" className={styles.home}>
          {n.home}
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
            <path d="M2 7h10M8 3l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </Link>

        <p className={styles.or}>{n.projects}</p>
        <ul className={styles.projects}>
          {SHOWCASE.map((p) => {
            return (
              <li key={p.slug}>
                <Link href={`/work/${p.slug}`}>
                  {p.icon ? (
                    <span className={styles.icon}>
                      <Image src={p.icon} alt="" fill sizes="22px" />
                    </span>
                  ) : (
                    <span className={styles.mono} aria-hidden>
                      {p.title.charAt(0)}
                    </span>
                  )}
                  {p.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
