// Schema.org JSON-LD generators — fed into <script type="application/ld+json">
// to help Google build a knowledge panel and rich snippets.
// Spec: https://schema.org

import type { ProjectCase } from '@/content/projects';

const PERSON_NAME = 'Lucas Sckenal';
const PERSON_FULL = 'Lucas Panenbecker Sckenal';
const EMAIL = 'lucaspsckenal@gmail.com';

export function personSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: PERSON_NAME,
    alternateName: PERSON_FULL,
    url: siteUrl,
    image: `${siteUrl}/projects/portrait.png`,
    jobTitle: 'Creative Frontend Developer',
    description:
      'Creative frontend developer crafting immersive, cinematic interfaces. Game UI, motion design, and premium digital products.',
    knowsAbout: [
      'Frontend Development',
      'Motion Design',
      'Game UI',
      'Cinematic Web Experiences',
      'React',
      'Next.js',
      'TypeScript',
      'GSAP',
      'Framer Motion',
      'Three.js',
      'WebGL',
      'SCSS',
      'Godot',
    ],
    knowsLanguage: ['pt', 'en', 'es', 'it', 'ja'],
    sameAs: [
      'https://github.com/LucasSckenal',
      'https://www.linkedin.com/in/lucassckenal',
    ],
    email: `mailto:${EMAIL}`,
  };
}

export function websiteSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Lucas Sckenal · Portfolio',
    url: siteUrl,
    description:
      'A quiet, cinematic frontend portfolio. Game UI, motion design, premium interfaces.',
    inLanguage: 'en',
    author: {
      '@type': 'Person',
      name: PERSON_NAME,
      url: siteUrl,
    },
  };
}

export function creativeWorkSchema(siteUrl: string, project: ProjectCase) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    alternateName: project.tagline,
    description: project.description,
    headline: project.tagline,
    creator: {
      '@type': 'Person',
      name: PERSON_NAME,
      url: siteUrl,
    },
    dateCreated: project.year,
    url: `${siteUrl}/work/${project.slug}`,
    image: `${siteUrl}/work/${project.slug}/opengraph-image`,
    keywords: project.roles.join(', '),
    inLanguage: 'en',
  };
}
