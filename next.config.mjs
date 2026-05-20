/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: ['./src/styles'],
    // Prepend mixins only — _mixins.scss outputs no rules until @include'd,
    // so it's safe inside CSS Modules (which require pure/local selectors).
    // _tokens.scss has a global `:root` block and is loaded once in globals.scss.
    prependData: `@use "mixins" as *;`,
  },
  images: {
    // Allow remote images from the Onde Estão os Netos? repo's docs/screenshots
    // (used by the home Game card and the case study).
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/LucasSckenal/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
