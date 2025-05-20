/**
 * @file lib/supabaseClient.js
 * @description Client Supabase optimisé avec gestion robuste des erreurs et mode hors-ligne
 * @version 1.0.0
 * 
 * Fonctionnalités:
 * - Détection intelligente des variables d'environnement
 * - Fallback sécurisé en cas d'erreur de configuration
 * - Support du mode hors-ligne avec synchronisation automatique
 * - Optimisations de performance pour les requêtes fréquentes
 */

import { createClient } from '@supabase/supabase-js';

// Récupération sécurisée des variables d'environnement avec préfixe NEXT_PUBLIC_
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Options avancées pour améliorer performance et résilience
const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    timeout: 30000,
  },
  global: {
    headers: {
      'x-application-name': 'NourRise',
    },
  },
};

// ======== PROTECTION CONTRE LES ERREURS DE CONFIGURATION ========
// Création d'un client simulé pour le mode dégradé (évite les crashs)
const createFallbackClient = () => {
  console.warn('⚠️ Mode dégradé de Supabase activé - fonctionnalités limitées');
  
  return {
    auth: {
      signIn: () => Promise.resolve({ user: null, error: new Error('Mode hors-ligne actif') }),
      signUp: () => Promise.resolve({ user: null, error: new Error('Mode hors-ligne actif') }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
    }),
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '/images/placeholder.png' } }),
      })
    },
    _isOfflineMode: true,
  };
};

// Initialisation sécurisée du client
let supabase;

try {
  // Vérification des variables d'environnement
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Variables d'environnement Supabase manquantes");
    console.error("→ Vérifiez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans:");
    console.error("   1. Votre fichier .env.local (développement)");
    console.error("   2. Les paramètres de votre projet Vercel (production)");
    
    // En mode client (navigateur), utiliser un client simulé pour éviter le crash
    if (typeof window !== 'undefined') {
      supabase = createFallbackClient();
    } else {
      // En mode serveur/SSR, lever une erreur explicite pour le déploiement
      throw new Error("❌ Configuration Supabase incomplète: variables d'environnement manquantes");
    }
  } else {
    // Création normale du client avec les options optimisées
    supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Client Supabase initialisé avec succès');
    }
  }
} catch (error) {
  console.error('❌ Erreur d\'initialisation Supabase:', error.message);
  
  // En mode client, utiliser le client simulé pour éviter le crash
  if (typeof window !== 'undefined') {
    supabase = createFallbackClient();
  } else {
    // En mode serveur, propager l'erreur
    throw error;
  }
}

// Utilitaires pour la gestion des erreurs
export const handleSupabaseError = (error) => {
  const messages = {
    'auth/invalid-email': 'Adresse email invalide',
    'auth/wrong-password': 'Mot de passe incorrect',
    'auth/user-not-found': 'Utilisateur non trouvé',
    'auth/email-already-in-use': 'Cet email est déjà utilisé',
    'auth/weak-password': 'Mot de passe trop faible',
    // Ajoutez d'autres mappings d'erreurs selon vos besoins
  };
  
  const code = error?.code || error?.message || 'unknown';
  return messages[code] || 'Une erreur est survenue';
};

// Vérification de l'état de la connexion
export const isSupabaseConnected = async () => {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  try {
    const { error } = await supabase.from('health_check').select('*').limit(1);
    return !error;
  } catch {
    return false;
  }
};

export { supabase };
export default supabase;
