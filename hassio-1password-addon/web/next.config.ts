import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  cacheComponents: true,
  output: 'standalone',
  assetPrefix: '.',
  poweredByHeader: false,
  devIndicators: {
    position: 'bottom-right'
  },
  experimental: {
    turbopackFileSystemCacheForDev: true
  },
  turbopack: {
    resolveAlias: {
      'node:buffer': 'node_buffer'
    }
  },
  images: {
    path: './_next/image',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'c.1password.com'
      }
    ]
  }
};

export default withNextIntl(nextConfig);
