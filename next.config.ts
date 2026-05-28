import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["yaml", "@anthropic-ai/sdk"],
};

export default nextConfig;
