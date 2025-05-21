/**
 * @file supabaseClient.js
 * @description Client Supabase optimisé pour Vercel
 * @version 1.1.0
 */

import { createClient } from '@supabase/supabase-js';

// Récupération des variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Vérification des variables d'environnement
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Variables d\'environnement Supabase manquantes. Les fonctionnalités nécessitant une base de données pourraient ne pas fonctionner correctement.'
  );
}

// Options de configuration optimisées pour Vercel
const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    timeout: 30000,
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: { 'x-application-name': 'NourRise' },
  },
};

// Création et configuration du client
const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  options
);

// Gestion des erreurs de connexion
const originalAuthRequest = supabase.auth.api?.signInWithPassword;
if (originalAuthRequest) {
  supabase.auth.api.signInWithPassword = async (...args) => {
    try {
      return await originalAuthRequest(...args);
    } catch (error) {
      console.error('Erreur d\'authentification Supabase:', error);
      return { error };
    }
  };
}

export { supabase };

// Fonction utilitaire pour vérifier la connexion Supabase
export const verifierConnexionSupabase = async () => {
  try {
    // Requête simple pour tester la connexion
    const { data, error } = await supabase.from('health_check').select('*').limit(1);
    
    if (error) {
      throw error;
    }
    
    return {
      statut: 'connecte',
      timestamp: new Date().toISOString(),
      details: data
    };
  } catch (error) {
    console.error('Erreur de connexion Supabase:', error.message);
    return {
      statut: 'deconnecte',
      erreur: error.message,
      timestamp: new Date().toISOString()
    };
  }
};
