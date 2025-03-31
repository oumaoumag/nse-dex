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
    domains: ['images.unsplash.com'],
  },
  // Ensure markdown tables are properly rendered
  webpack: (config) => {
    // Customize webpack config if needed
    return config;
  },
};

module.exports = nextConfig;