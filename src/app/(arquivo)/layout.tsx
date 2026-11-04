import LenisProvider from '@/components/providers/LenisProvider';
import Grain from '@/components/atmosphere/Grain';
import Header from '@/components/nav/Header';
import ConsoleEasterEgg from '@/components/effects/ConsoleEasterEgg';
import RouteTransition from '@/components/effects/RouteTransition';
import ScrollProgress from '@/components/effects/ScrollProgress';
import ThemeTransitionOverlay from '@/components/effects/ThemeTransitionOverlay';
import Particles from '@/components/atmosphere/Particles';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import ArchiveBadge from '@/components/archive/ArchiveBadge';

// The 2026 edition of the portfolio, preserved as it shipped (tags
// v1.0-original / v1.1-correcoes). Its home lives at /2026; its case
// studies and Lab keep their original URLs.
export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LenisProvider>
        <ScrollProgress />
        <Particles />
        <Header />
        <main id="main">{children}</main>
        <Grain />
        <ThemeTransitionOverlay />
        <RouteTransition />
        <ConsoleEasterEgg />
        <ArchiveBadge />
      </LenisProvider>
    </ThemeProvider>
  );
}
