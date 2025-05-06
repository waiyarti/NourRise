import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../supabaseClient";
import { FiMail, FiLock, FiLoader, FiCheckCircle, FiMoon, FiSun } from "react-icons/fi";
import Head from "next/head";

export default function Connexion() {
  const [email, setEmail] = useState("");
  const [motdepasse, setMotdepasse] = useState("");
  const [message, setMessage] = useState("");
  const [chargement, setChargement] = useState(false);
  const [mode, setMode] = useState("connexion");
  const [theme, setTheme] = useState("light");
  const router = useRouter();

  // Animation de fond
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const validerEmail = (email) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setChargement(true);

    if (!validerEmail(email)) {
      setMessage("❌ Adresse email invalide.");
      setChargement(false);
      return;
    }
    if (motdepasse.length < 6) {
      setMessage("❌ Mot de passe trop court (6 caractères minimum).");
      setChargement(false);
      return;
    }

    try {
      if (mode === "inscription") {
        const { error } = await supabase.auth.signUp({
          email,
          password: motdepasse,
        });
        if (error) throw error;
        setMessage("✅ Compte créé avec succès ! Vérifiez vos emails.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: motdepasse,
        });
        if (error) throw error;
        setMessage("✅ Connexion réussie !");
        setTimeout(() => router.push("/auth-check"), 1000);
      }
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setChargement(false);
    }
  };

  return (
    <>
      <Head>
        <title>{mode === "connexion" ? "Connexion" : "Inscription"} | NourRise</title>
        <style jsx global>{`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
          }

          .animate-float {
            animation: float 6s ease-in-out infinite;
          }

          .bg-pattern {
            background-image: radial-gradient(circle at ${mousePosition.x * 100}% ${
              mousePosition.y * 100
            }%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%);
          }
        `}</style>
      </Head>

      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        theme === "light" 
          ? "bg-gradient-to-br from-purple-500 via-pink-500 to-red-500" 
          : "bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900"
      }`}>
        {/* Motif d'arrière-plan dynamique */}
        <div className="absolute inset-0 bg-pattern transition-opacity duration-500" />

        {/* Illustrations flottantes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 animate-float opacity-30">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          <div className="absolute bottom-20 right-20 animate-float opacity-30" style={{animationDelay: "-2s"}}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <rect x="20" y="20" width="40" height="40" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
        </div>

        {/* Card Container */}
        <div className={`relative max-w-md w-full mx-4 transform transition-all duration-700 hover:scale-105 ${
          theme === "light" 
            ? "bg-white" 
            : "bg-gray-800"
        } p-10 rounded-3xl shadow-2xl`}>
          
          {/* Thème Toggle */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === "light" ? (
              <FiMoon className="w-5 h-5 text-gray-600" />
            ) : (
              <FiSun className="w-5 h-5 text-yellow-400" />
            )}
          </button>

          {/* Logo animé */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 animate-pulse">
            <div className={`w-full h-full rounded-full flex items-center justify-center shadow-lg ${
              theme === "light" 
                ? "bg-gradient-to-br from-blue-500 to-blue-700" 
                : "bg-gradient-to-br from-purple-600 to-purple-800"
            }`}>
              <FiCheckCircle className="text-white text-4xl transform hover:rotate-180 transition-transform duration-500" />
            </div>
          </div>

          {/* Titre et signature */}
          <h1 className={`text-4xl font-extrabold text-center mb-2 ${
            theme === "light" ? "text-gray-800" : "text-white"
          }`}>
            {mode === "connexion" ? "Bienvenue !" : "Inscription"}
          </h1>
          
          <div className="text-center mb-2">
            <span className="text-sm italic text-purple-600 dark:text-purple-400 font-light">
              Créé avec passion par Wail
            </span>
          </div>

          <p className={`text-center mb-6 ${
            theme === "light" ? "text-gray-500" : "text-gray-300"
          }`}>
            {mode === "connexion"
              ? "Découvrez votre espace personnel en toute sécurité."
              : "Rejoignez notre communauté dès aujourd'hui !"}
          </p>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <FiMail className={`absolute left-3 top-3.5 group-hover:text-purple-500 transition-colors ${
                theme === "light" ? "text-gray-400" : "text-gray-500"
              }`} />
              <input
                type="email"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full pl-10 pr-4 py-3 rounded-lg transition-all duration-300 ${
                  theme === "light"
                    ? "bg-white border focus:ring-2 focus:ring-purple-500 group-hover:border-purple-300"
                    : "bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-purple-500 group-hover:border-purple-500"
                }`}
              />
            </div>

            <div className="relative group">
              <FiLock className={`absolute left-3 top-3.5 group-hover:text-purple-500 transition-colors ${
                theme === "light" ? "text-gray-400" : "text-gray-500"
              }`} />
              <input
                type="password"
                placeholder="Mot de passe"
                value={motdepasse}
                onChange={(e) => setMotdepasse(e.target.value)}
                required
                className={`w-full pl-10 pr-4 py-3 rounded-lg transition-all duration-300 ${
                  theme === "light"
                    ? "bg-white border focus:ring-2 focus:ring-purple-500 group-hover:border-purple-300"
                    : "bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-purple-500 group-hover:border-purple-500"
                }`}
              />
            </div>

            {/* Message avec animation */}
            {message && (
              <p className={`text-sm text-center animate-bounce ${
                message.startsWith("✅") ? "text-green-600" : "text-red-600"
              }`}>
                {message}
              </p>
            )}

            {/* Bouton amélioré */}
            <button
              type="submit"
              disabled={chargement}
              className={`w-full py-3 rounded-lg font-semibold transform transition-all duration-300 
                hover:scale-105 hover:shadow-lg disabled:opacity-60 relative overflow-hidden
                ${theme === "light"
                  ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white"
                  : "bg-gradient-to-r from-purple-500 to-purple-700 text-white"
                }`}
            >
              {chargement ? (
                <span className="flex items-center justify-center gap-2">
                  <FiLoader className="animate-spin" />
                  Chargement...
                </span>
              ) : (
                <span className="relative z-10">
                  {mode === "connexion" ? "Se connecter" : "Créer un compte"}
                </span>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <p className={`text-center mt-6 text-sm ${
            theme === "light" ? "text-gray-600" : "text-gray-300"
          }`}>
            {mode === "connexion" ? "Pas encore de compte ? " : "Déjà inscrit ? "}
            <span
              className="text-purple-500 font-semibold hover:underline cursor-pointer transition-colors duration-300 hover:text-purple-700"
              onClick={() => setMode(mode === "connexion" ? "inscription" : "connexion")}
            >
              {mode === "connexion" ? "Inscrivez-vous" : "Connectez-vous"}
            </span>
          </p>

          {/* Footer amélioré */}
          <div className={`text-xs mt-6 text-center ${
            theme === "light" ? "text-gray-400" : "text-gray-500"
          }`}>
            <p>© 2025 NourRise | Créé avec ❤️ par Wail</p>
            <p className="mt-1">Sécurité et confiance, propulsé par Supabase</p>
          </div>
        </div>
      </div>
    </>
  );
}