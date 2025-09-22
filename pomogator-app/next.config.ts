import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse'],
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    optimizePackageImports: ['@tma.js/sdk', '@telegram-apps/sdk']
  },
  transpilePackages: ['@tma.js/sdk', '@telegram-apps/sdk'],
  // Добавляем поддержку для Railway
  output: 'standalone',
  // Отключаем строгую проверку типов во время сборки
  typescript: {
    ignoreBuildErrors: false
  }
};

export default nextConfig;
