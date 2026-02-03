import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  output: 'standalone',
  poweredByHeader: false,
  devIndicators: {
    position: 'bottom-right'
  },
  experimental: {
    turbopackFileSystemCacheForDev: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'c.1password.com'
      }
    ]
  }
};

export default nextConfig;
