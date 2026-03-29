import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker standalone build - reduces image size by ~90%
  output: 'standalone',

  // Fix Turbopack workspace root detection (multiple lockfiles in monorepo)
  turbopack: {
    root: __dirname,
  },

  // Prevent webpack/turbopack from bundling native Node.js modules
  serverExternalPackages: ["@grpc/grpc-js", "@grpc/proto-loader"],

  // Image optimization settings
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.mutugading.com' },
      { protocol: 'http', hostname: 'localhost', port: '9000' },
      { protocol: 'http', hostname: '127.0.0.1', port: '9000' },
    ],
  },
};

export default nextConfig;
