import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Every Link uses prefetch={false}, so enabling this brings no benefit yet.
  // Next 17 removes the option: `new Date()` in the layout's I18nProvider must
  // move to the client first, or every route logs a prerender error.
  partialPrefetching: false,
  output: 'standalone',
  // Relative asset paths are required in production addon UI, but break dev runtime.
  assetPrefix: isProd ? '.' : undefined,
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
    path: isProd ? './_next/image' : '/_next/image',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'c.1password.com'
      }
    ]
  }
};

export default withNextIntl(nextConfig);
