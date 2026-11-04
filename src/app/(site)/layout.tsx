import Nav from '@/components/site/Nav';
import styles from '@/components/site/site.module.scss';

// Current edition of the portfolio. The 2026 edition lives in (arquivo).

// the browser chrome on phones matches the light ground, not the 2026 dark
export const viewport = { themeColor: '#f3f3f3', colorScheme: 'light' };
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${styles.site} site-v3`}>
      <Nav />
      <main id="main">{children}</main>
    </div>
  );
}
