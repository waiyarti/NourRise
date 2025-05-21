/**
 * @file middleware.js
 * @description Middleware Next.js pour optimiser les performances et la sécurité
 * @version 1.0.0
 */

import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();

  // Ajout d'en-têtes de sécurité
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  // Protection contre le clickjacking
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: blob: https://images.unsplash.com; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co;"
  );
  
  return response;
}

// Configuration des chemins à intercepter
export const config = {
  matcher: [
    /*
     * Intercepte toutes les requêtes sauf:
     * - Les requêtes vers l'API
     * - Les requêtes vers les fichiers statiques
     * - Les requêtes vers les images optimisées Next.js
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
