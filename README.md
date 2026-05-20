<div align="center">

# 静寂

### Lucas Sckenal · Portfolio 2026

**Six worlds. Three projects. One quiet practice.**

_A cinematic Japanese minimalist portfolio crafted in Next.js, GSAP and Framer Motion._

<br/>

[![Next.js 15](https://img.shields.io/badge/Next.js-15-000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![GSAP](https://img.shields.io/badge/GSAP-3-88ce02?style=for-the-badge&logo=greensock&logoColor=black)](https://gsap.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-ff0080?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion)
[![Lenis](https://img.shields.io/badge/Lenis-smooth-0a0a0a?style=for-the-badge)](https://lenis.darkroom.engineering)
[![SCSS Modules](https://img.shields.io/badge/SCSS-modules-cc6699?style=for-the-badge&logo=sass&logoColor=white)](https://sass-lang.com)
[![Vercel](https://img.shields.io/badge/Vercel-edge-000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

<br/>

[**Live →**](https://lucassckenal.vercel.app) &nbsp;·&nbsp; [**Repository**](https://github.com/LucasSckenal/portfolio-2026) &nbsp;·&nbsp; [**LinkedIn**](https://www.linkedin.com/in/lucassckenal) &nbsp;·&nbsp; [**GitHub**](https://github.com/LucasSckenal)

</div>

---

## 📑 Index

<details>
<summary>Click to expand</summary>

| § | Section |
| :- | :- |
| 序 | [About](#-about) |
| 機 | [Features](#-features) |
| 工 | [Stack](#-stack) |
| 構 | [Architecture](#-architecture) |
| 色 | [Design System](#-design-system) |
| 動 | [Motion Philosophy](#-motion-philosophy) |
| 階 | [Project Structure](#-project-structure) |
| 始 | [Getting Started](#-getting-started) |
| 雲 | [Deployment](#-deployment) |
| 速 | [Performance](#-performance) |
| 作 | [Featured Work](#-featured-work) |
| 礼 | [Acknowledgments](#-acknowledgments) |
| 人 | [Author](#-author) |
| 印 | [License](#-license) |

</details>

---

## 序 About

A personal portfolio designed around restraint, atmosphere, and motion. Built as a single-page cinematic experience with dedicated case study pages at `/work/[slug]` for selected work.

The aesthetic draws from three places:

- **Japanese minimalism** — _ma_ (negative space), washi paper tones, kanji as graphic identity rather than translated UI
- **Cinematic film language** — 24fps scroll reveals, ink-wipe route transitions, scroll-linked camera moves on the Hero
- **Apple / Awwwards school** — premium typography, patient interactions, atmospheric depth

The tagline — _"Six worlds. Three projects. One quiet practice."_ — alludes literally to the work showcased:

- **six worlds** → the six themed maps in [Onde Estão os Netos?](https://github.com/LucasSckenal/pi-4)
- **three projects** → the case studies featured on the home
- **one quiet practice** → the underlying filosofia of calm interface design

---

## 機 Features

### Cinematic UI

- **Hero with scroll-driven reveals** — CSS `position: sticky` instead of GSAP pin (avoids DOM mutation across route transitions), title rises line by line as the user scrolls
- **Custom cursor** — dot + lagging ring + contextual label that reads `data-cursor-label` from any hovered element
- **Pointer-follow highlight** on project cards (Vercel / Linear style)
- **Ink-wipe route transition** between pages — black curtain sweeps up with kanji `静` glowing in the middle
- **Scroll progress indicator** — thin shu-iro line at top, spring-smoothed for organic feel
- **Glass header** — backdrop-blur panel + `mix-blend-mode: difference` text for adaptive contrast on any background
- **Cinematic Hero → About ink-wash transition** — gradient bleed at section boundary

### Theme System

- **Day / Night toggle** with two distinct layers of tokens:
  - _Body-themed tokens_ (`--bg`, `--ink`, `--on-dark`) invert with user preference → About / Stack / Contact follow the theme
  - _Mood-locked tokens_ (`--mood-text-light`, `--mood-text-dark`) stay constant → Hero / project scenes / GameWorlds keep brand identity
- **Pre-hydration sync** via inline script — no flash between SSR and the user's saved preference

### Performance & SEO

- **Static generation** for all case study pages via `generateStaticParams`
- **Edge runtime OG images** — unique per case study via `next/og` ImageResponse
- **Image optimization** — `next/image` with AVIF/WebP, srcset, lazy loading
- **`FadeImage` wrapper** — crossfade on load to avoid the "pop"
- **Schema.org JSON-LD** — Person + WebSite + CreativeWork structured data injected per page
- **Sitemap + robots.txt** auto-generated from project data
- **Per-route metadata** with title template

### Accessibility

- **Skip-to-content** link (keyboard-only, focusable)
- **`prefers-reduced-motion`** respected throughout — disables parallax, scrub timelines, float animations
- **Focus-visible rings** in shu-iro accent (only on keyboard nav, hidden on mouse)
- **Semantic landmarks** — `<main id="main">`, `<article>`, `<section>`, `<nav>`
- **Mobile menu** — full-screen overlay with proper `aria-modal` and focus trap
- **Custom cursor** disabled automatically on coarse pointers (touch)

### Easter Eggs

- **Console signature** — visitors who open DevTools see a styled invitation to get in touch
- **Email copy-to-clipboard** — click copies the address AND opens the mail client, with a `Copied ✓` cursor label flash
- **Stack hover details** — each technology reveals a short note on how it's actually used in this portfolio

---

## 工 Stack

<table>
  <tr>
    <th width="200">Layer</th>
    <th>Tools</th>
  </tr>
  <tr>
    <td><b>Framework</b></td>
    <td>Next.js 15 (App Router) · React 19</td>
  </tr>
  <tr>
    <td><b>Language</b></td>
    <td>TypeScript (strict mode)</td>
  </tr>
  <tr>
    <td><b>Motion</b></td>
    <td>GSAP 3 (ScrollTrigger) · Framer Motion 11 · Lenis</td>
  </tr>
  <tr>
    <td><b>Styling</b></td>
    <td>SCSS Modules · Design tokens · CSS custom properties</td>
  </tr>
  <tr>
    <td><b>Fonts</b></td>
    <td>Geist Sans · Geist Mono · Noto Serif JP (via <code>next/font</code>)</td>
  </tr>
  <tr>
    <td><b>Images</b></td>
    <td><code>next/image</code> · <code>next/og</code> (edge runtime ImageResponse)</td>
  </tr>
  <tr>
    <td><b>SEO</b></td>
    <td>Schema.org JSON-LD · sitemap · robots · per-route OG</td>
  </tr>
  <tr>
    <td><b>Deployment</b></td>
    <td>Vercel (edge runtime for OG images)</td>
  </tr>
</table>

---

## 構 Architecture

<details open>
<summary><b>Top-level structure</b></summary>

```
src/
├── app/                          ← Next.js App Router
│   ├── layout.tsx                ← Fonts, providers, Schema.org JSON-LD
│   ├── page.tsx                  ← Home composition
│   ├── opengraph-image.tsx       ← Dynamic OG for home (edge runtime)
│   ├── apple-icon.tsx            ← Apple touch icon
│   ├── icon.svg                  ← Favicon (kanji 静)
│   ├── sitemap.ts                ← Auto-generated sitemap.xml
│   ├── robots.ts                 ← robots.txt
│   ├── not-found.tsx             ← Cinematic 404 (kanji 迷)
│   ├── globals.scss
│   └── work/[slug]/
│       ├── page.tsx              ← Case study route
│       └── opengraph-image.tsx   ← Per-case dynamic OG
│
├── components/
│   ├── atmosphere/               ← Grain · Fog · Vignette (ambient layers)
│   ├── case-study/               ← CaseStudy template + SectionRenderer
│   ├── effects/                  ← Route transitions, scroll progress,
│   │                                theme bridges, console easter egg
│   ├── nav/                      ← Header (glass) · MobileMenu · SideIndex
│   ├── providers/                ← LenisProvider (smooth scroll + GSAP sync)
│   ├── sections/                 ← Hero · About · Projects · Stack · Contact
│   └── ui/                       ← Cursor · FadeImage · Reveal · SplitText
│                                    MagneticLink · ThemeToggle
│
├── content/
│   └── projects.ts               ← Single source of truth for project data
│                                    (drives home cards + case studies + OG + sitemap + schema)
│
├── lib/
│   ├── easings.ts                ← Shared cubic-bezier curves
│   ├── motion.ts                 ← Framer Motion variant library
│   └── structured-data.ts        ← Schema.org JSON-LD generators
│
└── styles/
    ├── _tokens.scss              ← Design tokens (colors, type, spacing, motion)
    ├── _typography.scss          ← Typography primitives
    └── _mixins.scss              ← Reusable SCSS mixins
```

</details>

### Design decisions worth highlighting

| Decision | Why |
| :- | :- |
| **`src/content/projects.ts` as single source of truth** | One data file drives the home cards, case study pages, dynamic OG images, sitemap entries, and JSON-LD schemas. Edit once, propagates everywhere. |
| **Two-layer token system (body + mood)** | Project scenes have brand identity that shouldn't follow user theme. Body sections should. The split keeps both behaviors clean. |
| **CSS sticky over GSAP pin** | GSAP `pin: true` wraps elements in a pin-spacer (DOM mutation). When the user navigates away, React's reconciliation conflicts with the mutated tree. CSS sticky achieves the same visual effect without touching the DOM. |
| **Glass panel separated from Header element** | The header text uses `mix-blend-mode: difference` for adaptive contrast. Adding `backdrop-filter` to the same element broke the blend. Splitting into two sibling elements lets each do its job. |
| **Edge runtime for OG images** | Generated at the edge per request via `next/og` — no static asset bloat, always fresh, no build step. |

---

## 色 Design System

### Token Architecture

**Body-themed tokens** (invert with user's theme toggle):

```scss
--bg          → page background (paper ⇄ ink)
--bg-deep     → dark-zone background (ink ⇄ paper)
--ink         → primary text
--on-dark     → text on dark zones (with -soft / -subtle / -mute / -faded / -line variants)
--line        → hairlines and dividers
--accent      → muted shu-iro red (constant in both modes)
```

**Mood-locked tokens** (constant, regardless of user theme):

```scss
--mood-text-light       → locked white for dark moods
--mood-text-light-soft  → 0.85 alpha
--mood-text-light-mute  → 0.55 alpha
--mood-text-dark        → locked black for light moods
--mood-text-dark-soft   → 0.85 alpha
--mood-text-dark-mute   → 0.55 alpha
```

The split is intentional. Sections with **brand identity** (project scenes, GameWorlds, Mobile menu) shouldn't follow user preference — they're part of the storytelling. Sections that are **page content** (About, Stack, Contact) adapt to the user's pick.

### Palette

| Token | Value | Purpose |
| :- | :- | :- |
| `--bg` | `#EEEAE3` | Washi paper |
| `--bg-deep` | `#1A1816` | Ink night |
| `--ink` | `#0E0D0B` | Primary text |
| `--on-dark` | `#F2EFE9` | Text on dark zones |
| `--accent` | `#8C2A1F` | Muted shu-iro red — used 1–2× per scene max |

### Typography

Three families chained via `next/font`:

- **Geist Sans** — body, UI elements
- **Geist Mono** — labels, indexes, technical readouts (`UPPERCASE / WIDE TRACKING`)
- **Noto Serif JP** — titles, kanji, atmospheric markers

Modular scale (1.333 perfect fourth): `--t-xs` (0.75rem) → `--t-hero` (clamp 4.5rem–11rem responsive).

---

## 動 Motion Philosophy

> _Slow cinematic motion. Smooth parallax. Atmospheric transitions._

### Easing vocabulary

```ts
// src/lib/easings.ts
cinema = [0.22, 1, 0.36, 1]   // soft out — hero reveals, title rises
drift  = [0.65, 0, 0.35, 1]   // parallax — section backgrounds
settle = [0.16, 1, 0.30, 1]   // text rise — split-text staggers
out    = [0.33, 1, 0.68, 1]   // hovers, micro-interactions
```

### Duration scale

| Token | ms | Use |
| :- | :- | :- |
| `--dur-fast` | 400ms | Hover transitions |
| `--dur` | 900ms | Component reveals |
| `--dur-slow` | 1600ms | Scene changes |
| `--dur-epic` | 2400ms | Curtain reveals, ink-wipes |

### Rules

- **No animation under 0.4s** for component-level transitions
- **`whileInView` with `once: true`** — text reveals fire once, not on every scroll
- **`prefers-reduced-motion` respected globally** — parallax disabled, scrub timelines disabled, float animations stopped
- **`mix-blend-mode: difference` for adaptive elements** (Header, SideIndex)
- **CSS sticky over GSAP pin** — avoids DOM mutation conflicts during route transitions
- **One easing family** — three named curves used everywhere for consistency

---

## 階 Project Structure

```
portfolio-2026/
├── public/
│   ├── video/
│   │   ├── hero.mp4              ← Hero background (Pagoda · Mount Fuji)
│   │   └── hero-poster.jpg       ← First-frame poster
│   └── projects/
│       ├── portrait.png          ← Author portrait
│       ├── chatbot/              ← Medical Chatbot screenshots
│       │   ├── Chat.png
│       │   ├── Home.png
│       │   ├── Profile.png
│       │   └── Settings.png
│       └── PhantomComerce/       ← Phantom Commerce screenshots
│           ├── homepage.png
│           └── example_productpage.png
├── src/                          ← See Architecture section above
├── next.config.mjs               ← Sass options · remote image patterns
├── package.json
├── tsconfig.json
└── README.md
```

---

## 始 Getting Started

### Requirements

- **Node.js** ≥ 18.17
- **npm** ≥ 9
- A modern browser supporting CSS `backdrop-filter`, `position: sticky`, and `view-transition`

### Setup

```bash
# 1. Clone
git clone https://github.com/LucasSckenal/portfolio-2026.git
cd portfolio-2026

# 2. Install
npm install

# 3. Dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available scripts

```bash
npm run dev      # Dev server with HMR
npm run build    # Production build
npm start        # Run production build locally
npm run lint     # ESLint check
```

---

## 雲 Deployment

Optimized for **Vercel** (zero-config):

1. Connect the repository on [vercel.com/new](https://vercel.com/new)
2. Next.js 15 auto-detected · Edge runtime for OG images
3. _(optional)_ Set `NEXT_PUBLIC_SITE_URL` env var for a custom domain
4. Deploy

The `next.config.mjs` already configures:

- **Remote image patterns** — `raw.githubusercontent.com` for project repository screenshots
- **AVIF / WebP formats** — automatic responsive format negotiation
- **SCSS module options** — prepends `_mixins.scss` to every module file

`getSiteUrl()` in `layout.tsx` resolves the canonical URL automatically across:

| Priority | Variable | Used when |
| :-: | :- | :- |
| 1 | `NEXT_PUBLIC_SITE_URL` | Custom domain configured |
| 2 | `VERCEL_PROJECT_PRODUCTION_URL` | Vercel production |
| 3 | `VERCEL_URL` | Vercel preview / branch |
| 4 | `http://localhost:3000` | Local dev |

---

## 速 Performance

Built with Core Web Vitals in mind:

- **LCP** — Hero video has poster fallback; opening curtain waits for the video's `canplay` event with a 4s safety timeout
- **CLS** — All images use `next/image` with explicit dimensions or `fill` inside an aspect-ratio container
- **FID / INP** — Lenis smooth scroll throttled, GSAP runs in `gsap.context()` for clean cleanup across route transitions
- **Bundle** — Static generation for all 3 case study routes, ~100KB shared JS, ~210KB home First Load
- **Edge runtime** for OG images (instant generation at the edge, no static asset bloat)

---

## 作 Featured Work

Three projects showcased in the home and detailed at `/work/[slug]`:

<table>
  <tr>
    <th width="33%">01 · Onde Estão os Netos?</th>
    <th width="33%">02 · Medical AI Chatbot</th>
    <th width="33%">03 · Phantom Commerce</th>
  </tr>
  <tr>
    <td>
      A Tower Defense game built in Godot 4.6. Grandparents Afonso and Berta pulled into an antique board game must cross six themed worlds. Designed from day one for elderly players.
      <br/><br/>
      <a href="https://github.com/LucasSckenal/pi-4">Repository →</a>
    </td>
    <td>
      A multilingual medical assistant (PT / ES / EN). Voice or text input translated into structured triage reports. React + Vite frontend, Node + Express backend, Firebase Auth + Firestore.
      <br/><br/>
      <a href="https://fourl-aplicativocov.onrender.com/login">Live ↗</a> · <a href="https://github.com/LucasSckenal/PI3-4l">Repository →</a>
    </td>
    <td>
      A gaming-focused commerce platform built around premium product presentation. Next.js full-stack with Firebase for auth and Firestore for data. The store as exhibit, not as catalogue.
      <br/><br/>
      <a href="https://github.com/LucasSckenal/PhantomCommercee">Repository →</a>
    </td>
  </tr>
</table>

---

## 礼 Acknowledgments

This portfolio borrows heavily from a small set of inspirations:

- **Awwwards SOTD archive** — for the pacing of cinematic scroll experiences
- **Apple product pages** — for patient typography and intentional negative space
- **Linear, Vercel, Read.cv** — for the cursor-follow highlight and glass headers
- **Studio Ghibli films** — for the atmospheric quietness that informs the whole aesthetic
- **The work of [Locomotive](https://locomotive.ca), [North Kingdom](https://northkingdom.com), [Resn](https://resn.co.nz)** — for the broader cinematic web school

Built on top of brilliant open-source work:
[Next.js](https://nextjs.org) · [React](https://react.dev) · [GSAP](https://gsap.com) · [Framer Motion](https://www.framer.com/motion) · [Lenis](https://lenis.darkroom.engineering) · [Geist](https://vercel.com/font) · [Noto Serif JP](https://fonts.google.com/noto/specimen/Noto+Serif+JP)

---

## 人 Author

<table>
  <tr>
    <td align="center" width="240">
      <a href="https://www.linkedin.com/in/lucassckenal">
        <img src="./public/projects/portrait.png" width="140" height="140" alt="Lucas Sckenal" style="border-radius: 50%; object-fit: cover;"/>
      </a>
      <br/><br/>
      <b>Lucas Sckenal</b><br/>
      <sub>Creative Frontend Developer</sub><br/>
      <sub><i>Brazil · MMXXVI</i></sub>
    </td>
    <td>
      <b>Languages spoken</b><br/>
      Português · English · Español · Italiano · 日本語
      <br/><br/>
      <b>Get in touch</b><br/>
      📧 <a href="mailto:lucaspsckenal@gmail.com">lucaspsckenal@gmail.com</a><br/>
      💼 <a href="https://www.linkedin.com/in/lucassckenal">linkedin.com/in/lucassckenal</a><br/>
      💻 <a href="https://github.com/LucasSckenal">github.com/LucasSckenal</a>
      <br/><br/>
      <b>Focus</b><br/>
      Frontend engineering · Motion design · Game UI · Cinematic web · Premium product interfaces
    </td>
  </tr>
</table>

---

## 印 License

MIT © 2026 Lucas Sckenal

Code is open source — feel free to learn from it, fork it, or remix it. Just don't copy it wholesale as your own portfolio.

The hero video (Pagoda · Mount Fuji) and the project screenshots remain the property of their respective sources.

---

<div align="center">

<sub>静寂 — _Quiet practice._</sub>

<sub>Designed and built in Brazil · MMXXVI</sub>

</div>
