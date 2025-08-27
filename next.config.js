/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors during build for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  // Webpack configuration for handling Node.js modules
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Handle certificate issues in development
      if (process.env.NODE_ENV === 'development') {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      }
    }
    return config;
  },
};

module.exports = nextConfig;