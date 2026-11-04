'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useT } from '@/components/providers/LanguageProvider';
import { EDITIONS } from '@/content/editions';

// Shown on an archived edition's home so a visitor always knows where
// they are in the portfolio's history and how to get back.
export default function ArchiveBadge() {
  const pathname = usePathname();
  const t = useT();
  const edition = EDITIONS.find((e) => !e.current && (pathname === e.href || pathname?.startsWith(`${e.href}/`)));
  if (!edition) return null;

  return (
    <Link
      href="/"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 20,
        zIndex: 120,
        transform: 'translateX(-50%)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 18px',
        borderRadius: 999,
        background: 'rgba(245,245,243,0.82)',
        color: '#0d0d0d',
        border: '1px solid rgba(255,255,255,0.9)',
        boxShadow: '0 16px 40px -18px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        font: '500 13px/1.2 var(--font-geist), system-ui, sans-serif',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <b style={{ fontWeight: 600 }}>{edition.id}</b>
      <span style={{ opacity: 0.6 }}>{t.site.versions.archived}</span>
      <span>· {t.site.versions.backToCurrent} →</span>
    </Link>
  );
}
