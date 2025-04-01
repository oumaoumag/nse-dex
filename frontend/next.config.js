/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
    domains: ['images.unsplash.com', 'localhost', 'tajiri.app'],
  },
  // Ensure markdown tables are properly rendered
  webpack: (config, { isServer }) => {
    // We don't want to bundle the @hashgraph/sdk in the browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false
      };
    }
    return config;
  },
};

module.exports = nextConfig;