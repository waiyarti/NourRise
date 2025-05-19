import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { FiMail, FiLock, FiLogIn, FiUserPlus, FiAlertCircle } from 'react-icons/fi';

/**
 * Page de connexion/inscription à l'application
 */
export default function Connexion() {
  const router = useRouter();
  
  // États pour gérer le formulaire et les erreurs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [mode, setMode] = useState('connexion'); // 'connexion' ou 'inscription'
  
  /**
   * Gestion de la connexion utilisateur
   */
  const handleConnexion = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErreur(null);
    
    try {
      // Validation basique des champs
      if (!email.trim() || !password.trim()) {
        throw new Error('Veuillez remplir tous les champs');
      }
      
      if (mode === 'connexion') {
        // Tentative de connexion avec Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        // Redirection vers la page d'accueil en cas de succès
        router.push('/');
      } else {
        // Inscription avec Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        // Affichage d'un message de confirmation
        setErreur({
          type: 'success',
          message: 'Votre compte a été créé! Vérifiez votre email pour confirmer votre inscription.'
        });
        
        // Redirection vers l'accueil si pas de confirmation nécessaire
        if (data?.session) {
          router.push('/');
        }
      }
    } catch (error) {
      // Traduction des erreurs Supabase en français
      let message = 'Une erreur est survenue';
      
      if (error.message.includes('Invalid login credentials')) {
        message = 'Identifiants invalides';
      } else if (error.message.includes('Email not confirmed')) {
        message = 'Email non confirmé. Vérifiez votre boîte mail';
      } else if (error.message.includes('User already registered')) {
        message = 'Cet email est déjà utilisé';
      } else if (error.message.includes('Password should be at least')) {
        message = 'Le mot de passe doit contenir au moins 6 caractères';
      } else {
        message = error.message;
      }
      
      setErreur({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center px-4 py-12">
      <Head>
        <title>{mode === 'connexion' ? 'Connexion' : 'Inscription'} | NourRise</title>
        <meta name="description" content="Connectez-vous à NourRise pour suivre votre progression personnelle" />
      </Head>
      
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8 text-white">
          <h1 className="text-3xl font-bold mb-1">NourRise</h1>
          <p className="text-indigo-100">
            {mode === 'connexion' 
              ? 'Connectez-vous pour accéder à votre tableau de bord' 
              : 'Inscrivez-vous pour commencer votre parcours'}
          </p>
        </div>
        
        <div className="p-6">
          {/* Affichage des erreurs ou messages de succès */}
          {erreur && (
            <div className={`p-3 mb-4 rounded-lg flex items-start ${
              erreur.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <FiAlertCircle className="mt-0.5 mr-2 flex-shrink-0" />
              <span>{erreur.message}</span>
            </div>
          )}
          
          <form onSubmit={handleConnexion} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@email.com"
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'connexion' ? '••••••••' : 'Minimum 6 caractères'}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                  {mode === 'connexion' ? "Connexion en cours..." : "Inscription en cours..."}
                </>
              ) : (
                <>
                  {mode === 'connexion' ? <FiLogIn className="mr-2" /> : <FiUserPlus className="mr-2" />}
                  {mode === 'connexion' ? 'Se connecter' : 'S\'inscrire'}
                </>
              )}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            {mode === 'connexion' ? (
              <p className="text-sm text-gray-600">
                Pas encore de compte ? {' '}
                <button
                  onClick={() => {
                    setMode('inscription');
                    setErreur(null);
                  }}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  S'inscrire
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Déjà un compte ? {' '}
                <button
                  onClick={() => {
                    setMode('connexion');
                    setErreur(null);
                  }}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Se connecter
                </button>
              </p>
            )}
          </div>
          
          {/* Aide pour la récupération de mot de passe */}
          {mode === 'connexion' && (
            <div className="mt-2 text-center">
              <button 
                onClick={async () => {
                  if (!email.trim()) {
                    setErreur({ type: 'error', message: 'Veuillez saisir votre email' });
                    return;
                  }
                  
                  setLoading(true);
                  try {
                    const { error } = await supabase.auth.resetPasswordForEmail(email, {
                      redirectTo: `${window.location.origin}/reset-password`,
                    });
                    
                    if (error) throw error;
                    
                    setErreur({ 
                      type: 'success', 
                      message: 'Instructions envoyées par email pour réinitialiser votre mot de passe' 
                    });
                  } catch (error) {
                    setErreur({ type: 'error', message: error.message });
                  }
                  setLoading(false);
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                Mot de passe oublié ?
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
