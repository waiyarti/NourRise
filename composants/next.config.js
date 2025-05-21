/**
 * @file next.config.js
 * @description Configuration optimisée pour le déploiement sur Vercel
 * @version 2.0.0
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Activation du mode strict React pour une meilleure qualité de code
  reactStrictMode: true,
  
  // Compilateur SWC pour des performances optimales
  swcMinify: true,
  
  // Optimisation des images
  images: {
    domains: ['vercel.app', 'images.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Configuration pour Vercel
  target: 'serverless',
  
  // Optimisations pour la production
  compiler: {
    // Suppression des console.log en production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Polyfills et transpilation
  transpilePackages: ['recharts', 'canvas-confetti'],
  
  // Optimisations expérimentales
  experimental: {
    // Optimisation CSS
    optimizeCss: true,
    // Amélioration de l'expérience de navigation
    scrollRestoration: true,
    // Optimisation des imports pour les packages volumineux
    optimizePackageImports: ['recharts'],
  },
  
  // Configurations webpack personnalisées
  webpack: (config, { isServer }) => {
    // Résolution des problèmes de compatibilité côté client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
