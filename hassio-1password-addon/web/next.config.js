/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'c.1password.com'
      }
    ]
  }
};

module.exports = nextConfig;
