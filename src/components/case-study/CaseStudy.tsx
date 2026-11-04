'use client';

import Link from 'next/link';
import SplitText from '@/components/ui/SplitText';
import { type ProjectCase, getAdjacentProjects } from '@/content/projects';
import SectionRenderer from './SectionRenderer';
import { useT, useLocale } from '@/components/providers/LanguageProvider';
import { useProjectCopy } from '@/lib/hooks/useProjectCopy';
import styles from './CaseStudy.module.scss';

const moodClass: Record<ProjectCase['mood'], string> = {
  dark: styles.moodDark,
  light: styles.moodLight,
  glass: styles.moodGlass,
};

export default function CaseStudy({ project }: { project: ProjectCase }) {
  const adjacents = getAdjacentProjects(project.slug);
  const t = useT();
  const { locale } = useLocale();
  const copy = useProjectCopy(project.slug);

  return (
    <article className={`${styles.caseStudy} ${moodClass[project.mood]}`}>
      {/* Back to home is now handled by the header logo, which gains a ← arrow
          on subpages. Avoids the overlap of two top-left back affordances. */}

      {/* ── Hero ── */}
      <header className={styles.hero}>
        <div className={styles.heroKanji} aria-hidden>
          {project.jp}
        </div>

        <div className={styles.heroInner}>
          <div className={styles.heroMeta}>
            <span>{project.index} / 03</span>
            <span className={styles.heroDot} aria-hidden />
            <span>{copy.status}</span>
            <span className={styles.heroDot} aria-hidden />
            <span>{project.year}</span>
          </div>

          <h1 className={styles.heroTitle}>
            <SplitText text={project.title} by="word" delay={0.2} />
          </h1>

          <p className={styles.heroTagline}>{copy.tagline}</p>

          <ul className={styles.chips}>
            {project.roles.map((r) => (
              <li key={r} className={styles.chip}>
                {r}
              </li>
            ))}
          </ul>

          <div className={styles.heroTech}>
            <span className={styles.heroTechLabel}>{t.caseStudy.builtWith}</span>
            <span>{project.tech.join(' · ')}</span>
          </div>

          {project.team && (
            <div className={styles.heroTeam}>
              <span className={styles.heroTeamMark} aria-hidden>
                ↳
              </span>
              <span>{locale === 'en' ? project.team : copy.team ?? project.team}</span>
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
                <span>{project.liveKind === 'download' ? t.caseStudy.download : t.caseStudy.live}</span>
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
                <span>{t.caseStudy.repo}</span>
                <span className={styles.heroCtaArrow}>↗</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <div className={styles.content}>
        {t.caseStudy.bodyNote && (
          <p className={styles.bodyNote}>{t.caseStudy.bodyNote}</p>
        )}
        {/* Case bodies are English-only for now; lang keeps screen readers right */}
        <div lang="en" className={styles.contentBody}>
          {project.sections.map((section, i) => (
            <SectionRenderer key={i} section={section} />
          ))}
        </div>
      </div>

      {/* ── Footer nav ── */}
      {adjacents && (
        <nav className={styles.footerNav} aria-label="Adjacent projects">
          <Link
            href={`/2026/work/${adjacents.prev.slug}`}
            className={styles.navLink}
            data-cursor
            data-cursor-label="Previous case →"
          >
            <span className={styles.navLabel}>{t.caseStudy.previous}</span>
            <span className={styles.navTitle}>{adjacents.prev.title}</span>
          </Link>
          <Link
            href={`/2026/work/${adjacents.next.slug}`}
            className={`${styles.navLink} ${styles.navLinkRight}`}
            data-cursor
            data-cursor-label="Next case →"
          >
            <span className={styles.navLabel}>{t.caseStudy.next}</span>
            <span className={styles.navTitle}>{adjacents.next.title}</span>
          </Link>
        </nav>
      )}
    </article>
  );
}
