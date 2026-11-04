import Nav from '@/components/site/Nav';
import styles from '@/components/site/site.module.scss';

// Current edition of the portfolio. The 2026 edition lives in (arquivo).
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${styles.site} site-v3`}>
      <Nav />
      <main id="main">{children}</main>
    </div>
  );
}
