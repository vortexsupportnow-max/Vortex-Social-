/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'localhost' },
    ],
  },
  transpilePackages: ['@vortex/ui', '@vortex/types'],
};

module.exports = nextConfig;
