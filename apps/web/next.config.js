/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  transpilePackages: ['@vortex/ui', '@vortex/types'],
};

module.exports = nextConfig;
