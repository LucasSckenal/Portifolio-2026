'use client';

import React from 'react';
import SplitText from '@/components/ui/SplitText';
import Reveal from '@/components/ui/Reveal';
import { useTheme } from '@/components/providers/ThemeProvider';
import ProjectScene from './ProjectScene';
import { GameMedia, ChatbotMedia, PhantomMedia } from './ProjectMedia';
import NightMedia from './NightMedia';
import GameWorlds from './GameWorlds';
import NightReading from './NightReading';
import { nightProjects } from '@/content/projects';
import styles from './Projects.module.scss';

// Two parallel portfolios:
//   Day   → commercial work (Game, Chatbot, Phantom) with rich custom media
//   Night → personal experiments (Yōkai, Tsuki, Ame) with atmospheric placeholders
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
// DAY — three commercial projects
// ─────────────────────────────────────────
function DayBlock() {
  return (
    <>
      {/* ── Section header ─────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLabelRow}>
            <span className={styles.headerLabel}>003 — Selected work</span>
            <span className={styles.headerDivider} aria-hidden />
            <span className={styles.headerJp}>作 · Sakuhin</span>
          </div>

          <h2 className={styles.headerTitle}>
            <span className={styles.headerTitleLine}>
              <SplitText text="Three worlds" by="word" delay={0.1} />
            </span>
            <span className={styles.headerTitleLine}>
              <SplitText text="from the practice." by="word" delay={0.3} />
            </span>
          </h2>

          <Reveal delay={0.5} amount={0.4}>
            <p className={styles.headerBody}>
              A selection from across game UI, conversational AI, and ecommerce —
              each treated as its own atmosphere rather than a product spec.
            </p>
          </Reveal>
        </div>
      </header>

      {/* ── Scene 01 — Game ─────────────────── */}
      <ProjectScene
        index="01"
        title="Onde Estão os Netos?"
        status="v1.0 · In development · PI-4"
        year="2025"
        roles={['Game UI', 'Tower Defense', 'Roguelike', 'Accessibility']}
        tech={['Godot 4.6', 'GDScript', 'CSV-driven balancing']}
        team="Team of 4 · SENAC · UI / Frontend systems"
        description="A Tower Defense game where grandparents Afonso and Berta — pulled into an antique board game — must cross six themed worlds to rescue their grandchildren. Day-and-night loop with roguelike power-ups and an in-game AI advisor. Built in Godot 4.6 and designed from the start around accessibility for elderly players."
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

      {/* ── Scene 02 — Chatbot ──────────────── */}
      <ProjectScene
        index="02"
        title="Medical AI Chatbot"
        status="Live · Production"
        year="2025"
        roles={['Conversational UX', 'Voice + Text', 'Medical Triage', 'Multilingual']}
        tech={['React', 'Vite', 'Node + Express', 'Firebase']}
        team="Team of 3 · Unijui · Front-End lead"
        description="A multilingual medical assistant that turns patient symptoms — spoken or typed — into structured reports for faster clinical triage. Persistent medical profiles, diagnostic history, voice + text input, and full UI theming. React + Vite frontend, Node + Express backend, Firebase Auth + Firestore."
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

      {/* ── Scene 03 — Phantom ──────────────── */}
      <ProjectScene
        index="03"
        title="Phantom Commerce"
        status="Live · Concept"
        year="2025"
        roles={['Ecommerce', 'Motion Design', 'Full-Stack', 'Brand']}
        tech={['Next.js', 'Firebase', 'SCSS', 'Lucide']}
        team="Team of 3 · Unijui"
        description="A gaming-focused commerce platform built around premium product presentation, animated interactions, and a glass-deep visual language. The store as exhibit, not as catalogue. Full-stack Next.js with Firebase for auth and Firestore for the product / user data."
        jp="幻"
        mood="glass"
        align="left"
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

      {/* ── Closing line ────────────────────── */}
      <footer className={styles.footer}>
        <Reveal>
          <p className={styles.footerNote}>
            More work, case studies and process notes —
            <a href="/work" className={styles.footerLink} data-cursor data-cursor-label="See all work →">
              {' '}all work →
            </a>
          </p>
        </Reveal>
      </footer>
    </>
  );
}

// ─────────────────────────────────────────
// NIGHT — three personal experiments
// ─────────────────────────────────────────
const nightVariants: Array<'spirit' | 'moon' | 'rain'> = ['spirit', 'moon', 'rain'];

function NightBlock() {
  return (
    <>
      {/* ── Section header ─── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLabelRow}>
            <span className={styles.headerLabel}>003 — Night work</span>
            <span className={styles.headerDivider} aria-hidden />
            <span className={styles.headerJp}>夜行 · Yakō</span>
          </div>

          <h2 className={styles.headerTitle}>
            <span className={styles.headerTitleLine}>
              <SplitText text="Three studies" by="word" delay={0.1} />
            </span>
            <span className={styles.headerTitleLine}>
              <SplitText text="from after-hours." by="word" delay={0.3} />
            </span>
          </h2>

          <Reveal delay={0.5} amount={0.4}>
            <p className={styles.headerBody}>
              When the briefs are answered and the clients are asleep, this is
              what I make instead — shaders, type, sound. Experiments without
              specifications, nothing to ship.
            </p>
          </Reveal>
        </div>
      </header>

      {nightProjects.map((p, i) => (
        <React.Fragment key={p.slug}>
          <ProjectScene
            index={p.index}
            title={p.title}
            status={p.status}
            year={p.year}
            roles={p.roles}
            tech={p.tech}
            description={p.description}
            jp={p.jp}
            mood={p.mood}
            align={i % 2 === 0 ? 'left' : 'right'}
            href={p.href}
            caseSlug={p.slug}
          >
            <NightMedia jp={p.jp} jpLabel={p.jpLabel} variant={nightVariants[i] ?? 'spirit'} />
          </ProjectScene>

          {/* After the first Night project (Yōkai), drop the Reading
              interstitial — same structural role as GameWorlds plays in Day */}
          {i === 0 && <NightReading />}
        </React.Fragment>
      ))}

      <footer className={styles.footer}>
        <Reveal>
          <p className={styles.footerNote}>
            These pieces don&apos;t ship — they accumulate.
            <a href="#contact" className={styles.footerLink} data-cursor>
              {' '}Ask for a process walk-through ↗
            </a>
          </p>
        </Reveal>
      </footer>
    </>
  );
}
