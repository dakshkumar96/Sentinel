import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["yaml", "@anthropic-ai/sdk"],
  // Avoid corrupted webpack packs (Cannot find module './873.js') during HMR
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
