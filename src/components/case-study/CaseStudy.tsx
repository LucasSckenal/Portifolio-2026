'use client';

import Link from 'next/link';
import SplitText from '@/components/ui/SplitText';
import { type ProjectCase, getAdjacentProjects } from '@/content/projects';
import SectionRenderer from './SectionRenderer';
import styles from './CaseStudy.module.scss';

const moodClass: Record<ProjectCase['mood'], string> = {
  dark: styles.moodDark,
  light: styles.moodLight,
  glass: styles.moodGlass,
};

export default function CaseStudy({ project }: { project: ProjectCase }) {
  const adjacents = getAdjacentProjects(project.slug);

  return (
    <article className={`${styles.caseStudy} ${moodClass[project.mood]}`}>
      {/* ── Back link (fixed) ── */}
      <Link href="/#projects" className={styles.backLink} data-cursor>
        <span className={styles.backArrow}>←</span>
        <span>Index</span>
      </Link>

      {/* ── Hero ── */}
      <header className={styles.hero}>
        <div className={styles.heroKanji} aria-hidden>
          {project.jp}
        </div>

        <div className={styles.heroInner}>
          <div className={styles.heroMeta}>
            <span>{project.index} / 03</span>
            <span className={styles.heroDot} aria-hidden />
            <span>{project.status}</span>
            <span className={styles.heroDot} aria-hidden />
            <span>{project.year}</span>
          </div>

          <h1 className={styles.heroTitle}>
            <SplitText text={project.title} by="word" delay={0.2} />
          </h1>

          <p className={styles.heroTagline}>{project.tagline}</p>

          <ul className={styles.chips}>
            {project.roles.map((r) => (
              <li key={r} className={styles.chip}>
                {r}
              </li>
            ))}
          </ul>

          <div className={styles.heroTech}>
            <span className={styles.heroTechLabel}>Built with</span>
            <span>{project.tech.join(' · ')}</span>
          </div>

          {project.team && (
            <div className={styles.heroTeam}>
              <span className={styles.heroTeamMark} aria-hidden>
                ↳
              </span>
              <span>{project.team}</span>
            </div>
          )}

          <div className={styles.heroActions}>
            {project.live && (
              <a
                className={`${styles.heroCta} ${styles.heroCtaLive}`}
                href={project.live}
                target="_blank"
                rel="noreferrer"
                data-cursor
                data-cursor-label="Open Live ↗"
              >
                <span className={styles.heroCtaDot} aria-hidden />
                <span>Live</span>
                <span className={styles.heroCtaArrow}>↗</span>
              </a>
            )}
            {project.href && (
              <a
                className={styles.heroCta}
                href={project.href}
                target="_blank"
                rel="noreferrer"
                data-cursor
                data-cursor-label="View source ↗"
              >
                <span>Repository</span>
                <span className={styles.heroCtaArrow}>↗</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <div className={styles.content}>
        {project.sections.map((section, i) => (
          <SectionRenderer key={i} section={section} />
        ))}
      </div>

      {/* ── Footer nav ── */}
      {adjacents && (
        <nav className={styles.footerNav} aria-label="Adjacent projects">
          <Link
            href={`/work/${adjacents.prev.slug}`}
            className={styles.navLink}
            data-cursor
            data-cursor-label="Previous case →"
          >
            <span className={styles.navLabel}>← Previous</span>
            <span className={styles.navTitle}>{adjacents.prev.title}</span>
          </Link>
          <Link
            href={`/work/${adjacents.next.slug}`}
            className={`${styles.navLink} ${styles.navLinkRight}`}
            data-cursor
            data-cursor-label="Next case →"
          >
            <span className={styles.navLabel}>Next →</span>
            <span className={styles.navTitle}>{adjacents.next.title}</span>
          </Link>
        </nav>
      )}
    </article>
  );
}
