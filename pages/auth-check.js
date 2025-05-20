/**
 * @file pages/auth-check.js
 * @description Vérification avancée de l'authentification avec gestion des erreurs
 * @version 1.0.0
 * @updated 2025-05-20
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

// Routes accessibles sans authentification
const PUBLIC_ROUTES = ['/login', '/signup', '/reset-password', '/'];

// Composant optimisé de vérification d'authentification
export default function AuthCheck() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Vérifier d'abord si Supabase est correctement configuré
        if (!isSupabaseConfigured()) {
          console.warn('Configuration Supabase incomplète. Mode hors-ligne activé.');
          setIsOffline(true);
          
          // En mode non-configuré, permettre l'accès uniquement aux routes publiques
          if (PUBLIC_ROUTES.includes(router.pathname)) {
            setAuthChecked(true);
          } else {
            router.push('/');
          }
          
          setIsLoading(false);
          return;
        }

        // Récupérer la session utilisateur de manière optimisée
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erreur lors de la vérification de session:', error.message);
          setIsOffline(true);
          
          // Redirection sécurisée en cas d'erreur
          if (!PUBLIC_ROUTES.includes(router.pathname)) {
            router.push('/');
          } else {
            setAuthChecked(true);
          }
          
          setIsLoading(false);
          return;
        }
        
        // Traitement normal selon l'état d'authentification
        if (data?.session) {
          // L'utilisateur est connecté
          if (PUBLIC_ROUTES.includes(router.pathname) && router.pathname !== '/') {
            router.push('/dashboard');
          } else {
            setAuthChecked(true);
          }
        } else {
          // L'utilisateur n'est pas connecté
          if (!PUBLIC_ROUTES.includes(router.pathname)) {
            router.push('/login');
          } else {
            setAuthChecked(true);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Erreur inattendue lors de la vérification d\'authentification:', err);
        
        // Gestion sécurisée des erreurs inattendues
        setIsOffline(true);
        if (!PUBLIC_ROUTES.includes(router.pathname)) {
          router.push('/');
        } else {
          setAuthChecked(true);
        }
        
        setIsLoading(false);
      }
    };

    // Exécuter la vérification seulement si le router est prêt
    if (router.isReady) {
      checkAuth();
    }
  }, [router.isReady, router.pathname, router]);

  // Interface en cas de chargement
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="w-24 h-24 relative animate-pulse mb-6">
          <div className="w-24 h-24 bg-blue-500 rounded-full opacity-75 animate-ping absolute"></div>
          <div className="w-24 h-24 bg-blue-500 rounded-full relative flex items-center justify-center">
            <span className="text-white text-2xl font-bold">NR</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-3">Vérification de l'authentification</h1>
        <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse w-1/2"></div>
        </div>
      </div>
    );
  }

  // Bannière mode hors-ligne
  if (isOffline && authChecked) {
    return (
      <>
        <div className="fixed top-0 left-0 w-full z-50 bg-yellow-500 text-yellow-900 py-2 px-4 text-center">
          <p className="font-medium flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Mode hors-ligne - Certaines fonctionnalités peuvent ne pas être disponibles
          </p>
        </div>
        {null} {/* Ce composant ne rend rien d'autre que la bannière */}
      </>
    );
  }

  // Aucun rendu si la vérification est terminée (comportement transparent)
  return null;
}

// Protection lors du build server-side pour éviter les erreurs Supabase
export async function getStaticProps() {
  return {
    props: {}, // Aucune prop serveur requise
  };
}
