'use client';

import SplitText from '@/components/ui/SplitText';
import Reveal from '@/components/ui/Reveal';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useT } from '@/components/providers/LanguageProvider';
import { useProjectCopy } from '@/lib/hooks/useProjectCopy';
import ProjectScene from './ProjectScene';
import { GameMedia, ChatbotMedia, PhantomMedia, NexoMedia, LJMedia, MaFinanceMedia } from './ProjectMedia';
import GameWorlds from './GameWorlds';
import NightReading from './NightReading';
import styles from './Projects.module.scss';

// Two parallel portfolios:
//   Day   → professional / showcase work (Game, Nexo, LJ)
//   Night → academic university work     (Chatbot, Phantom)
//
// The eclipse toggle swaps between them with the same cinematic 1.5s transition.
// The home <section id="projects"> stays in place; only its inner content
// rerenders based on `inverted`.

export default function Projects() {
  const { inverted } = useTheme();

  return (
    <section id="projects" className={styles.projects}>
      {inverted ? <NightBlock /> : <DayBlock />}
    </section>
  );
}

// ─────────────────────────────────────────
// DAY — three showcase pieces
// ─────────────────────────────────────────
function DayBlock() {
  const t = useT();
  const ma = useProjectCopy('ma-finance-os');
  const nexo = useProjectCopy('nexo');
  const lj = useProjectCopy('lj-treinamento-integrado');
  return (
    <>
      {/* ── Section header ─────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLabelRow}>
            <span className={styles.headerLabel}>{t.projects.label}</span>
            <span className={styles.headerDivider} aria-hidden />
            <span className={styles.headerJp}>{t.projects.labelJp}</span>
          </div>

          <h2 className={styles.headerTitle}>
            <span className={styles.headerTitleLine}>
              <SplitText text={t.projects.titleLine1} by="word" delay={0.1} />
            </span>
            <span className={styles.headerTitleLine}>
              <SplitText text={t.projects.titleLine2} by="word" delay={0.3} />
            </span>
          </h2>

          <Reveal delay={0.5} amount={0.4}>
            <p className={styles.headerBody}>{t.projects.intro}</p>
          </Reveal>
        </div>
      </header>

      {/* ── Scene 01 — Ma Finance OS ─────────── */}
      <ProjectScene
        index="01"
        title="Ma Finance OS"
        status={ma.status}
        year="2026"
        roles={['Product Design', 'Full-Stack', 'AI Integration', 'SaaS']}
        tech={['Next.js 16', 'React 19', 'TypeScript', 'SCSS Modules', 'Firebase', 'Gemini']}
        description={ma.summary}
        jp="間"
        mood="dark"
        align="left"
        href="https://github.com/LucasSckenal/Project-Organization-finaces"
        live="https://project-organization-finaces.vercel.app/"
        caseSlug="ma-finance-os"
      >
        <MaFinanceMedia
          video={[
            { src: '/projects/ma-finance-os/Preview.webm', type: 'video/webm' },
            { src: '/projects/ma-finance-os/Preview.mp4',  type: 'video/mp4'  },
          ]}
          videoAlt="Ma Finance OS — AI assistant creating a budget in real time"
        />
      </ProjectScene>

      {/* ── Scene 02 — Nexo ─────────────────── */}
      <ProjectScene
        index="02"
        title="Nexo"
        status={nexo.status}
        year="2026"
        roles={['Product Design', 'Full-Stack', 'AI Integration', 'SaaS']}
        tech={['Next.js 16', 'React 19', 'TypeScript', 'Tailwind v4', 'Firebase', 'Gemini']}
        description={nexo.summary}
        jp="繋"
        mood="dark"
        align="right"
        href="https://github.com/LucasSckenal/nexo"
        live="https://nexo-8yq8.vercel.app/"
        caseSlug="nexo"
      >
        {/* Video preview takes priority — leads with the Gemini AI in action.
            Screenshots are kept as a fallback in case the video fails to load
            (e.g. CSP, codec). Add a preview.webm next to preview.mp4 later for
            smaller payload on Chrome/Firefox/Edge. */}
        <NexoMedia
          video={[
            { src: '/projects/nexo/preview.mp4',  type: 'video/mp4'  },
          ]}
          videoAlt="Nexo — Gemini AI generating tasks from a sprint goal"
          screenshots={[
            { src: '/projects/nexo/Kanbam.png',    alt: 'Nexo — Kanban board with AI-generated cards' },
            { src: '/projects/nexo/analytics.png', alt: 'Nexo — throughput and cycle-time dashboards' },
            { src: '/projects/nexo/CrateTask.png', alt: 'Nexo — Gemini assistant generating tasks' },
          ]}
        />
      </ProjectScene>

      {/* ── Scene 03 — LJ ───────────────────── */}
      <ProjectScene
        index="03"
        title="LJ Treinamento Integrado"
        status={lj.status}
        year="2026"
        roles={['Brand Web', 'Booking UX', 'Client Work', 'Responsive']}
        tech={['Next.js', 'TypeScript', 'TailwindCSS']}
        team={lj.team}
        description={lj.summary}
        jp="体"
        mood="light"
        align="left"
        live="https://lj-nu.vercel.app/"
        caseSlug="lj-treinamento-integrado"
      >
        {/* Video preview takes priority. Drop preview.webm + preview.mp4 into
            /public/projects/lj/ — the device frame autoloops them, muted, with
            offscreen-pause to save battery. Screenshots and the synthetic
            fallback are kept here for graceful degradation. */}
        <LJMedia
          video={[
            { src: '/projects/lj/preview.webm', type: 'video/webm' },
            { src: '/projects/lj/preview.mp4',  type: 'video/mp4'  },
          ]}
          videoAlt="LJ Treinamento Integrado — scrolling tour of the site"
          // screenshots={[
          //   { src: '/projects/lj/hero.png',     alt: 'LJ — homepage hero with method' },
          //   { src: '/projects/lj/schedule.png', alt: 'LJ — weekly schedule with WhatsApp links' },
          // ]}
        />
      </ProjectScene>

      {/* ── Closing line — phrase + explicit CTA button ─── */}
      <footer className={styles.footer}>
        <Reveal>
          <p className={styles.footerNote}>{t.projects.moreLine}</p>
          <a
            href="/2026/work"
            className={styles.footerCta}
            data-cursor
            data-cursor-label={t.projects.moreLink}
          >
            <span className={styles.footerCtaLabel}>{t.projects.moreLink}</span>
            <span className={styles.footerCtaArrow} aria-hidden>↗</span>
          </a>
        </Reveal>
      </footer>
    </>
  );
}

// ─────────────────────────────────────────
// NIGHT — academic university work
// ─────────────────────────────────────────
function NightBlock() {
  const t = useT();
  const game = useProjectCopy('onde-estao-os-netos');
  const chat = useProjectCopy('medical-chatbot');
  const phantom = useProjectCopy('phantom-commerce');
  return (
    <>
      {/* ── Section header ─── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLabelRow}>
            <span className={styles.headerLabel}>{t.projectsNight.label}</span>
            <span className={styles.headerDivider} aria-hidden />
            {/* Kanji label stays in JP as decorative element (per design system) */}
            <span className={styles.headerJp}>夜行 · Yakō</span>
          </div>

          <h2 className={styles.headerTitle}>
            <span className={styles.headerTitleLine}>
              <SplitText text={t.projectsNight.titleLine1} by="word" delay={0.1} />
            </span>
            <span className={styles.headerTitleLine}>
              <SplitText text={t.projectsNight.titleLine2} by="word" delay={0.3} />
            </span>
          </h2>

          <Reveal delay={0.5} amount={0.4}>
            <p className={styles.headerBody}>{t.projectsNight.intro}</p>
          </Reveal>
        </div>
      </header>

      {/* ── Scene 01 — Onde Estão os Netos? ── */}
      <ProjectScene
        index="01"
        title="Onde Estão os Netos?"
        status={game.status}
        year="2025"
        roles={['Game UI', 'Tower Defense', 'Roguelike', 'Accessibility']}
        tech={['Godot 4.6', 'GDScript', 'CSV-driven balancing']}
        team={game.team}
        description={game.summary}
        jp="戦"
        mood="dark"
        align="left"
        href="https://github.com/LucasSckenal/pi-4"
        caseSlug="onde-estao-os-netos"
      >
        <GameMedia
          screenshot="https://raw.githubusercontent.com/LucasSckenal/pi-4/main/docs/screenshots/gameplay_noite.png"
          screenshotAlt="Gameplay screenshot — night phase combat"
        />
      </ProjectScene>

      {/* ── Interstitial — the 6 worlds of the game ── */}
      <GameWorlds />

      {/* ── Scene 02 — Medical Chatbot (PI-3) ── */}
      <ProjectScene
        index="02"
        title="Medical AI Chatbot"
        status={chat.status}
        year="2025"
        roles={['Conversational UX', 'Voice + Text', 'Medical Triage', 'Multilingual']}
        tech={['React', 'Vite', 'Node + Express', 'Firebase']}
        team={chat.team}
        description={chat.summary}
        jp="話"
        mood="light"
        align="right"
        href="https://github.com/LucasSckenal/PI3-4l"
        live="https://fourl-aplicativocov.onrender.com/login"
        caseSlug="medical-chatbot"
      >
        <ChatbotMedia
          screenshots={[
            { src: '/projects/chatbot/Chat.png',     alt: 'Chat — voice and text assistant with AI orb' },
            { src: '/projects/chatbot/Home.png',     alt: 'Home — diagnostics, symptoms, history' },
            { src: '/projects/chatbot/Settings.png', alt: 'Settings — theming and multilingual options' },
          ]}
        />
      </ProjectScene>

      {/* ── Interstitial — the library behind the work ── */}
      <NightReading />

      {/* ── Scene 03 — Phantom Commerce ─────── */}
      <ProjectScene
        index="03"
        title="Phantom Commerce"
        status={phantom.status}
        year="2025"
        roles={['Ecommerce', 'Motion Design', 'Full-Stack', 'Brand']}
        tech={['Next.js', 'Firebase', 'SCSS', 'Lucide']}
        team={phantom.team}
        description={phantom.summary}
        jp="幻"
        mood="glass"
        align="right"
        href="https://github.com/LucasSckenal/PhantomCommercee"
        caseSlug="phantom-commerce"
      >
        <PhantomMedia
          screenshots={[
            { src: '/projects/PhantomComerce/example_productpage.png', alt: 'Phantom Commerce — product detail page' },
            { src: '/projects/PhantomComerce/homepage.png',            alt: 'Phantom Commerce — store homepage' },
          ]}
        />
      </ProjectScene>

      <footer className={styles.footer}>
        <Reveal>
          <p className={styles.footerNote}>{t.projectsNight.moreLine}</p>
          <a
            href="/2026/work"
            className={styles.footerCta}
            data-cursor
            data-cursor-label={t.projectsNight.moreLink}
          >
            <span className={styles.footerCtaLabel}>{t.projectsNight.moreLink}</span>
            <span className={styles.footerCtaArrow} aria-hidden>↗</span>
          </a>
        </Reveal>
      </footer>
    </>
  );
}
