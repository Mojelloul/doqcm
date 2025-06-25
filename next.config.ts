import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    domains: ['localhost'],
  },
  // Configuration pour les polices
  optimizeFonts: true,
};

export default nextConfig;
