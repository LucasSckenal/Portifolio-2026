'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import SplitText from '@/components/ui/SplitText';
import Reveal from '@/components/ui/Reveal';
import MagneticLink from '@/components/ui/MagneticLink';
import { cinema } from '@/lib/easings';
import styles from './Contact.module.scss';

const EMAIL = 'lucaspsckenal@gmail.com';

const socials = [
  { label: 'GitHub',   href: 'https://github.com/LucasSckenal/lucasSckenal' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/lucassckenal' },
];

const languages = [
  { name: 'Português',  short: 'PT' },
  { name: 'English',    short: 'EN' },
  { name: 'Español',    short: 'ES' },
  { name: 'Italiano',   short: 'IT' },
  { name: '日本語',     short: 'JP' },
];

export default function Contact() {
  // Click on the email copies to clipboard AND opens the user's mail client.
  // Cursor label flashes "Copied ✓" for ~2s as visual feedback.
  const [copied, setCopied] = useState(false);

  const handleEmailClick = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Browsers without clipboard access still get the mailto behavior
    }
  };

  return (
    <section id="contact" className={styles.contact}>
      {/* Drifting watermark */}
      <div className={styles.watermark} aria-hidden>終</div>

      <div className={styles.inner}>
        <div className={styles.labelRow}>
          <span className={styles.label}>005 — Contact</span>
          <span className={styles.divider} aria-hidden />
          <span className={styles.labelJp}>終 · Owari</span>
        </div>

        <h2 className={styles.title}>
          <span className={styles.titleLine}>
            <SplitText text="Let's make" by="word" delay={0.1} />
          </span>
          <span className={styles.titleLine}>
            <SplitText text="something quiet," by="word" delay={0.25} />
          </span>
          <span className={styles.titleLine}>
            <SplitText text="and memorable." by="word" delay={0.4} />
          </span>
        </h2>

        <Reveal delay={0.6} amount={0.4}>
          <p className={styles.body}>
            Available for select frontend, motion and visual-design collaborations
            in 2026. Game UI, cinematic web, premium product interfaces.
          </p>
        </Reveal>

        {/* Big magnetic email CTA */}
        <motion.div
          className={styles.emailWrap}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.4, delay: 0.7, ease: cinema }}
        >
          <MagneticLink
            href={`mailto:${EMAIL}`}
            className={styles.email}
            strength={0.18}
          >
            <span
              onClick={handleEmailClick}
              data-cursor-label={copied ? 'Copied ✓' : 'Click — copies & opens'}
            >
              {EMAIL}
            </span>
          </MagneticLink>
          <span className={styles.emailUnderline} aria-hidden />
        </motion.div>

        {/* Socials */}
        <motion.ul
          className={styles.socials}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08, delayChildren: 0.9 } },
          }}
        >
          {socials.map((s) => (
            <motion.li
              key={s.label}
              variants={{
                hidden: { opacity: 0, y: 12 },
                show:   { opacity: 1, y: 0, transition: { duration: 0.9, ease: cinema } },
              }}
            >
              <a href={s.href} target="_blank" rel="noreferrer" className={styles.social} data-cursor>
                <span>{s.label}</span>
                <span className={styles.socialArrow}>↗</span>
              </a>
            </motion.li>
          ))}
        </motion.ul>

        {/* Languages — quiet inventory of spoken tongues */}
        <motion.div
          className={styles.languages}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08, delayChildren: 1.1 } },
          }}
        >
          <motion.span
            className={styles.languagesLabel}
            variants={{
              hidden: { opacity: 0, y: 8 },
              show:   { opacity: 1, y: 0, transition: { duration: 0.9, ease: cinema } },
            }}
          >
            <span className={styles.languagesJp}>言語</span>
            <span>Languages</span>
          </motion.span>

          <ul className={styles.languagesList}>
            {languages.map((l) => (
              <motion.li
                key={l.short}
                className={styles.languagesItem}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show:   { opacity: 1, y: 0, transition: { duration: 0.9, ease: cinema } },
                }}
              >
                <span className={styles.languagesShort}>{l.short}</span>
                <span className={styles.languagesName}>{l.name}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerCol}>
            <span className={styles.footerLabel}>Index</span>
            <span className={styles.footerValue}>Lucas Sckenal / MMXXVI</span>
          </div>
          <div className={styles.footerCol}>
            <span className={styles.footerLabel}>Discipline</span>
            <span className={styles.footerValue}>Frontend · Motion · UI</span>
          </div>
          <div className={styles.footerCol}>
            <span className={styles.footerLabel}>Signal</span>
            <span className={styles.footerValue}>
              <span className={styles.footerDot} aria-hidden /> Open to work
            </span>
          </div>
          <div className={styles.footerCol}>
            <span className={styles.footerLabel}>Made with</span>
            <span className={styles.footerValue}>Next · GSAP · Lenis</span>
          </div>
        </footer>

        <div className={styles.signature} aria-hidden>
          <span className={styles.signatureJp}>静寂</span>
          <span className={styles.signatureLine} />
          <span className={styles.signatureYear}>2026</span>
        </div>
      </div>
    </section>
  );
}
