import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // Ignore ESLint errors during builds so React 19 canary rules don't block
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
