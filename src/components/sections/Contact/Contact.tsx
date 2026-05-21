'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import SplitText from '@/components/ui/SplitText';
import Reveal from '@/components/ui/Reveal';
import MagneticLink from '@/components/ui/MagneticLink';
import { cinema } from '@/lib/easings';
import { useT, useLocale } from '@/components/providers/LanguageProvider';
import { useTheme } from '@/components/providers/ThemeProvider';
import { LOCALES, localeMeta, type Locale } from '@/lib/i18n';
import styles from './Contact.module.scss';

const EMAIL = 'lucaspsckenal@gmail.com';

const socials = [
  { label: 'GitHub',   href: 'https://github.com/LucasSckenal/lucasSckenal' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/lucassckenal' },
];

export default function Contact() {
  const t = useT();
  const { locale, setLocale } = useLocale();
  const { inverted } = useTheme();
  const [copied, setCopied] = useState(false);

  // Night-mode tone: same invitation, slightly more relaxed about timing
  const signalValue = inverted ? 'Quiet hours' : t.contact.footerSignalValue;

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
          <span className={styles.label}>{t.contact.label}</span>
          <span className={styles.divider} aria-hidden />
          <span className={styles.labelJp}>{t.contact.labelJp}</span>
        </div>

        <h2 className={styles.title}>
          <span className={styles.titleLine}>
            <SplitText text={t.contact.titleLine1} by="word" delay={0.1} />
          </span>
          <span className={styles.titleLine}>
            <SplitText text={t.contact.titleLine2} by="word" delay={0.25} />
          </span>
          <span className={styles.titleLine}>
            <SplitText text={t.contact.titleLine3} by="word" delay={0.4} />
          </span>
        </h2>

        <Reveal delay={0.6} amount={0.4}>
          <p className={styles.body}>
            {t.contact.body}
            {inverted && (
              <>
                <br />
                <span style={{ opacity: 0.7 }}>
                  Night replies may come the next morning.
                </span>
              </>
            )}
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
              data-cursor-label={copied ? t.contact.emailCopied : t.contact.emailHover}
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

          {/* CV — direct download link. Drop your PDF at
              public/cv-lucas-sckenal.pdf when ready. */}
          <motion.li
            variants={{
              hidden: { opacity: 0, y: 12 },
              show:   { opacity: 1, y: 0, transition: { duration: 0.9, ease: cinema } },
            }}
          >
            <a
              href="/cv-lucas-sckenal.pdf"
              download
              className={`${styles.social} ${styles.socialCv}`}
              data-cursor
              data-cursor-label="Download CV ↓"
            >
              <span>CV</span>
              <span className={styles.socialArrow}>↓</span>
            </a>
          </motion.li>
        </motion.ul>

        {/* Languages — now clickable buttons that translate the site */}
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
            <span>{t.contact.languagesLabel}</span>
          </motion.span>

          <ul className={styles.languagesList}>
            {LOCALES.map((code: Locale) => {
              const meta = localeMeta[code];
              const isActive = locale === code;
              return (
                <motion.li
                  key={code}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    show:   { opacity: 1, y: 0, transition: { duration: 0.9, ease: cinema } },
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setLocale(code)}
                    className={`${styles.languagesItem} ${isActive ? styles.languagesItemActive : ''}`}
                    data-cursor
                    data-cursor-label={`→ ${meta.name}`}
                    aria-pressed={isActive}
                    aria-label={`Switch to ${meta.name}`}
                  >
                    <span className={styles.languagesShort}>{meta.short}</span>
                    <span className={styles.languagesName}>{meta.name}</span>
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerCol}>
            <span className={styles.footerLabel}>{t.contact.footerIndexLabel}</span>
            <span className={styles.footerValue}>{t.contact.footerIndexValue}</span>
          </div>
          <div className={styles.footerCol}>
            <span className={styles.footerLabel}>{t.contact.footerDisciplineLabel}</span>
            <span className={styles.footerValue}>{t.contact.footerDisciplineValue}</span>
          </div>
          <div className={styles.footerCol}>
            <span className={styles.footerLabel}>{t.contact.footerSignalLabel}</span>
            <span className={styles.footerValue}>
              <span className={styles.footerDot} aria-hidden /> {signalValue}
            </span>
          </div>
          <div className={styles.footerCol}>
            <span className={styles.footerLabel}>{t.contact.footerMadeWithLabel}</span>
            <span className={styles.footerValue}>{t.contact.footerMadeWithValue}</span>
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
