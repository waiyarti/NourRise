/**
 * @file pages/_app.js
 * @description Composant racine de l'application NourRise avec configuration globale
 * @version 1.0.0
 * @updated 2025-05-20
 */

import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setupOfflineSyncHook, isSupabaseConfigured, checkSupabaseConnection } from '../lib/supabaseClient';
import Head from 'next/head';
import '../styles/globals.css';

/**
 * Composant racine de l'application avec gestion d'état global
 */
function NourRiseApp({ Component, pageProps }) {
  const [appState, setAppState] = useState({
    isOnline: true,
    supabaseStatus: 'checking',
    theme: 'light',
    isInitialized: false,
  });
  
  // Initialisation de l'application et vérification de la connexion
  useEffect(() => {
    // Configuration du thème
    const savedTheme = localStorage.getItem('nourrise-theme') || 'light';
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    
    // Configurer la synchronisation des données hors-ligne
    const unsubscribe = setupOfflineSyncHook();
    
    // Vérifier l'état de la connexion
    const checkConnection = async () => {
      // Vérifier si Supabase est configuré correctement
      if (!isSupabaseConfigured()) {
        setAppState(prev => ({ 
          ...prev, 
          supabaseStatus: 'not_configured',
          isInitialized: true,
        }));
        return;
      }
      
      // Vérifier si la connexion est active
      const isConnected = await checkSupabaseConnection();
      setAppState(prev => ({ 
        ...prev, 
        supabaseStatus: isConnected ? 'connected' : 'offline',
        isInitialized: true,
      }));
      
      // Afficher une notification si hors-ligne
      if (!isConnected) {
        toast.warn("Mode hors-ligne actif. Certaines fonctionnalités peuvent être limitées.", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    };
    
    // Surveillant l'état de la connexion
    const handleOnline = () => {
      setAppState(prev => ({ ...prev, isOnline: true }));
      toast.success("Connexion internet rétablie!");
      checkConnection();
    };
    
    const handleOffline = () => {
      setAppState(prev => ({ ...prev, isOnline: false }));
      toast.error("Connexion internet perdue. Mode hors-ligne activé.");
    };
    
    // Ajouter les écouteurs d'événements
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Vérification initiale
    checkConnection();
    
    // Nettoyage lors du démontage
    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Changer le thème de l'application
  const toggleTheme = () => {
    const newTheme = appState.theme === 'light' ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('nourrise-theme', newTheme);
    setAppState(prev => ({ ...prev, theme: newTheme }));
  };
  
  // Si l'application n'est pas encore initialisée, afficher un écran de chargement
  if (!appState.isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="w-24 h-24 relative animate-pulse mb-6">
          {/* Logo ici */}
          <div className="w-24 h-24 bg-blue-500 rounded-full opacity-75 animate-ping absolute"></div>
          <div className="w-24 h-24 bg-blue-500 rounded-full relative flex items-center justify-center">
            <span className="text-white text-2xl font-bold">NR</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-3">Chargement de NourRise</h1>
        <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>NourRise - Votre compagnon nutritionnel</title>
        <meta name="description" content="Suivez votre alimentation, gérez vos repas et atteignez vos objectifs nutritionnels avec NourRise" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Barre d'état de connexion (affichée seulement si hors-ligne) */}
      {(!appState.isOnline || appState.supabaseStatus !== 'connected') && (
        <div className={`fixed top-0 left-0 w-full z-50 py-2 px-4 text-center transition-all ${
          !appState.isOnline 
            ? 'bg-red-500 text-white' 
            : appState.supabaseStatus === 'not_configured'
              ? 'bg-orange-500 text-white'
              : 'bg-yellow-500 text-yellow-900'
        }`}>
          <p className="font-medium flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {!appState.isOnline 
              ? 'Vous êtes hors-ligne. Mode de fonctionnement limité activé.' 
              : appState.supabaseStatus === 'not_configured'
                ? 'Configuration Supabase incomplète. Certaines fonctionnalités sont désactivées.'
                : 'Mode hors-ligne Supabase activé. Synchronisation automatique à la reconnexion.'}
          </p>
        </div>
      )}

      {/* Conteneur principal avec état de connexion et thème */}
      <div className={`min-h-screen ${appState.theme === 'dark' ? 'dark' : ''}`}>
        <Component 
          {...pageProps} 
          appState={appState}
          toggleTheme={toggleTheme}
        />
      </div>

      {/* Conteneur de notifications */}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={appState.theme}
      />
    </>
  );
}

export default NourRiseApp;
