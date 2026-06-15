import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  /* config options here */
  images: {
    remotePatterns: [
      // ✅ LOCAL DEV (Laravel)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },

      // ✅ Production domains
      {
        protocol: 'https',
        hostname: 'backend.valokichu.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mohasagor.com.bd',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'valokichu.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
