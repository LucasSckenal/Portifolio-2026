# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three audiences, all confirmed as targets:

- **Clients looking to hire a freelancer** — small businesses and founders who need a site or app built (the LJ Treinamento Integrado project is the archetype). Their job: judge quickly whether Lucas can deliver something like what they need, then get in touch.
- **Recruiters and companies** — evaluating a software and frontend developer. Their job: understand what Lucas does, at what level, and with which stack, in a few minutes.
- **Designers and developers** — peers looking at the craft itself. Their job: see how it is built and whether it is worth sharing.

## Product Purpose

The personal portfolio of Lucas Sckenal, a software developer and creative frontend developer working as an active freelancer: web apps and sites, and native desktop software (Ilha in Rust, KERN in C++/Qt). It exists to turn a visit into contact: a client inquiry first, a job conversation second, peer recognition third. Success is a visitor reaching out by email or WhatsApp after seeing the work.

## Positioning

Lucas is not only a frontend developer: he ships complete software end to end — web products (Firebase, Gemini, booking flows) and native desktop programs (Rust, C++/Qt) — with a cinematic, motion-led interface sense on top. The portfolio itself is proof of that craft, so its own build quality is part of the pitch.

## Operating Context

- Visitors arrive from LinkedIn, GitHub, direct links sent to clients, and design galleries.
- Clients mostly in Brazil (Ijuí / RS); contact through WhatsApp and email is the norm.
- Deployed on Vercel (live at lucassckenal.vercel.app).

## Capabilities and Constraints

- Stack in place: Next.js 15 (App Router), React 19, TypeScript, SCSS Modules, GSAP, Framer Motion, Lenis, Three.js / React Three Fiber. The redesign stays on this stack.
- **Five languages are required:** EN, PT, ES, IT, JA, with a language picker. Dictionaries live in `src/lib/i18n`; project summaries in `src/content/projects.i18n.ts`.
- **Full case studies are required:** `/work/[slug]` pages with long-form text, images and stats (`src/content/projects.ts`). Case bodies are currently English-only.
- **The current 2026 design must stay viewable inside the new site** as its own page (for example `/2026`), preserved as an archive. Its source is tagged `v1.0-original` and `v1.1-correcoes` on GitHub.
- The home is one screen with no scroll; projects live in the 3D orbit and open as glass panels (decided).
- Every past edition stays reachable through the Versões menu (src/content/editions.ts).
- Not required in the new design (decided): the Day/Night dual portfolio and the Lab (Kagami, Niwa). They remain reachable through the archived 2026 version.
- Ilha and KERN joined as lead work (confirmed). Other GitHub projects (e.g. the CNC/laser site) need confirmation before joining.

## Brand Commitments

- Name: Lucas Sckenal. Contact: lucaspsckenal@gmail.com, github.com/LucasSckenal, linkedin.com/in/lucassckenal.
- Voice in the current site: quiet, precise, slightly poetic, never salesy. Keep unless Lucas changes it.
- No color is standardized across Lucas's projects; each one gets its own.

## Evidence on Hand

- Lead work: Ilha (Windows notch in Rust with the Ayla assistant) and KERN (CAD/CAM in C++/Qt; name about to change, see src/content/names.ts).
- Six real projects with copy, screenshots and videos: Ma Finance OS, Nexo, LJ Treinamento Integrado (client work), Onde Estão os Netos? (game), Medical AI Chatbot, Phantom Commerce. Assets in `public/projects/`.
- Hero videos (`public/video/`), portrait photos, live links and repositories for most projects.
- No client testimonials, metrics, or press exist. Do not invent any.

## Product Principles

1. Contact is the goal: every page leaves a clear, low-friction way to reach Lucas.
2. The site is the proof: its own craft and performance carry as much weight as the case studies.
3. Show finished, real work; never inflate scope, results or clients.
4. Respect every language equally: no section may silently fall back to English.
5. The past stays visible: earlier versions of the portfolio are kept, not erased.

## Project Presentation Rules (Lucas, 2026-11-04)

Every project shown on the site follows these three rules. A project missing one is not finished.

1. **A video to present it.** Each project has a presentation video: the 5 s loop on its carousel panel (`public/projects/<slug>/panel.mp4`, 640×400, 24 fps, H.264, no audio) and a video as its main media (expanded card and case page hero). Recorded from the real app; for private apps, from a demo with invented data.
2. **A favicon (app icon).** Each project has its own icon, cut to the shared tile (`public/icons/app/<slug>.png`, 192 px, 23% corner, glyph centred with the same margin). The site itself keeps its favicon (`src/app/icon.png`, `favicon.ico`, `apple-icon.png`). Use the project's real icon; never invent a logo, and never use a client's or employer's logo without Lucas's OK.
3. **Keep the site's aesthetic.** New pages, sections and assets follow the current edition: light #f3f3f3 ground, ink #0d0d0d, Instrument Serif display with Geist text, glass panels, the shared pill buttons (`--btn-*`), dark #121214 tiles, and the comb's gradient orb as the only accent. No new palettes, fonts or component styles per project.

## Accessibility & Inclusion

- Must work fully with reduced motion (a real bug in the 2026 version came from that path).
- Must work on phones at 375px without clipping or horizontal scroll.
