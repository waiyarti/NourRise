/**
 * @file pages/auth-check.js
 * @description Vérification intelligente de l'authentification avec gestion d'erreurs
 * @version 1.0.0
 * 
 * Fonctionnalités:
 * - Vérification robuste de la session utilisateur
 * - Gestion des erreurs de configuration Supabase
 * - Protection des routes privées
 * - Redirection intelligente des utilisateurs
 * - Optimisation pour Next.js
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

// Routes accessibles sans authentification
const PUBLIC_ROUTES = ['/login', '/signup', '/reset-password', '/'];

export default function AuthCheck() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Vérification de l'authentification uniquement côté client
    if (typeof window === 'undefined') return;
    
    const checkAuth = async () => {
      try {
        // Vérification sécurisée de l'existence des variables d'environnement
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          console.warn('Configuration Supabase incomplète');
          
          // Rediriger vers la page d'accueil si on n'est pas sur une route publique
          if (!PUBLIC_ROUTES.includes(router.pathname)) {
            router.push('/');
          } else {
            setAuthChecked(true);
          }
          
          setIsLoading(false);
          return;
        }

        // Récupération de la session utilisateur
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (data?.session) {
          // Utilisateur connecté
          if (PUBLIC_ROUTES.includes(router.pathname) && router.pathname !== '/') {
            // Si on est sur une page publique (sauf accueil), rediriger vers le dashboard
            router.push('/dashboard');
          } else {
            // Autoriser l'accès à la page demandée
            setAuthChecked(true);
          }
        } else {
          // Utilisateur non connecté
          if (!PUBLIC_ROUTES.includes(router.pathname)) {
            // Si la page demandée nécessite une authentification, rediriger vers login
            router.push('/login');
          } else {
            // Autoriser l'accès à une page publique
            setAuthChecked(true);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Erreur lors de la vérification d\'authentification:', err.message);
        setError(err);
        setIsLoading(false);
        
        // En cas d'erreur, rediriger vers l'accueil si on n'est pas sur une route publique
        if (!PUBLIC_ROUTES.includes(router.pathname)) {
          router.push('/');
        } else {
          setAuthChecked(true);
        }
      }
    };

    if (router.isReady) {
      checkAuth();
    }
  }, [router.isReady, router.pathname]);

  // Le composant ne rend rien, c'est juste un contrôleur d'authentification
  return null;
}

// Génération statique pour optimiser les performances
export async function getStaticProps() {
  return { props: {} };
}
