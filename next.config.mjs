/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return [
      { source: '/', destination: '/demo' },
    ];
  },
};

export default nextConfig;
