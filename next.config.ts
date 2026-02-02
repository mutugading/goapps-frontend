import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker standalone build - reduces image size by ~90%
  output: 'standalone',

  // Image optimization settings
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.mutugading.com' },
    ],
  },
};

export default nextConfig;
