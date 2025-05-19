/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configuration pour l'optimisation des images
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
    formats: ['image/avif', 'image/webp'],
  },
  // Compression Gzip pour optimiser les performances
  compress: true,
  // Analyse des bundles en mode production
  productionBrowserSourceMaps: false,
  experimental: {
    // Optimisations expérimentales
    optimizeCss: true,
    scrollRestoration: true,
  },
}

module.exports = nextConfig
