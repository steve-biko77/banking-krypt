import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopack: false,   // ← désactive Turbopack
  },
};

export default nextConfig;
