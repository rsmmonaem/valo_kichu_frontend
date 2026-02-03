import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'backend.valokichu.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
