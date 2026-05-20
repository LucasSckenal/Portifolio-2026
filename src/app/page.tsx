import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Projects from '@/components/sections/Projects';
import Stack from '@/components/sections/Stack';
import Contact from '@/components/sections/Contact';
import ThemeOnScroll from '@/components/effects/ThemeOnScroll';
import HeroBodyBridge from '@/components/effects/HeroBodyBridge';
import SideIndex from '@/components/nav/SideIndex';

export default function Page() {
  return (
    <>
      <Hero />
      <About />
      <Projects />
      <Stack />
      <Contact />

      {/* Fixed vertical chapter indicator (desktop only) */}
      <SideIndex />

      {/* Body bg: dark by default → paper when leaving Hero */}
      <HeroBodyBridge />

      {/* Body bg: returns to ink when entering Contact */}
      <ThemeOnScroll selector="#contact" theme="dark" />
    </>
  );
}
