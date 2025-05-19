import { createClient } from '@supabase/supabase-js';

// Récupération des variables d'environnement Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Création du client Supabase avec configuration enrichie
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configuration de stockage persistant pour la session
    persistSession: true,
    // Auto-refresh du token après expiration
    autoRefreshToken: true,
  },
  // Configuration des temps de requête
  global: {
    // Timeout par défaut en millisecondse
    fetch: {
      headers: { 'x-application-name': 'nourrise' },
    },
  },
  // Activation des réaltime subscriptions pour les mises à jour en direct
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/**
 * Hook utilitaire pour accéder facilement à la session utilisateur courante
 * @returns Session utilisateur courante ou null
 */
export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Erreur lors de la récupération de la session:", error.message);
    return null;
  }
  return data?.session;
};

/**
 * Récupère l'utilisateur authentifié courant
 * @returns Utilisateur courant ou null
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error.message);
    return null;
  }
  return user;
};
