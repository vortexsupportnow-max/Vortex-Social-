/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'localhost' },
    ],
  },
  transpilePackages: ['@vortex/ui', '@vortex/types'],
  async rewrites() {
    const apiDestination =
      process.env.INTERNAL_API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      'http://localhost:4000';
    return [
      {
        source: '/api-proxy/:path*',
        destination: `${apiDestination}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
