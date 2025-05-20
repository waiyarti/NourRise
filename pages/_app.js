/**
 * @file pages/_app.js
 * @description Composant racine de l'application avec fonctionnalités globales
 * @version 1.0.0
 * 
 * Fonctionnalités:
 * - Intégration de react-toastify pour les notifications
 * - Configuration globale des styles
 * - Gestion du thème clair/sombre
 * - Surveillance de l'état de la connexion
 */

import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  // État pour suivre le mode sombre/clair et la connectivité
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Initialisation des préférences utilisateur et surveillance de la connectivité
  useEffect(() => {
    // Charger le thème depuis localStorage s'il existe
    const savedTheme = localStorage.getItem('nourrise-theme');
    setIsDarkMode(savedTheme === 'dark');
    
    // Appliquer le thème au document
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    
    // Surveiller l'état de la connexion
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connexion internet rétablie!');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Connexion internet perdue!');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fonction pour basculer le thème
  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    localStorage.setItem('nourrise-theme', newTheme);
    document.documentElement.classList.toggle('dark');
    setIsDarkMode(!isDarkMode);
  };

  return (
    <>
      {/* Composant principal avec props additionnels */}
      <div className={isDarkMode ? 'dark' : ''}>
        <Component 
          {...pageProps} 
          isDarkMode={isDarkMode} 
          toggleTheme={toggleTheme}
          isOnline={isOnline}
        />
      </div>
      
      {/* Bannière mode hors-ligne */}
      {!isOnline && (
        <div className="fixed top-0 left-0 w-full bg-red-500 text-white py-2 px-4 text-center z-50">
          <p className="font-medium">
            Vous êtes actuellement hors-ligne. Certaines fonctionnalités peuvent être limitées.
          </p>
        </div>
      )}
      
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
        theme={isDarkMode ? 'dark' : 'light'}
      />
    </>
  );
}

export default MyApp;
