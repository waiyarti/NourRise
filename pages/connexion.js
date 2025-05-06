import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../supabaseClient";
import { FiMail, FiLock, FiLoader, FiCheckCircle } from "react-icons/fi";

export default function Connexion() {
  const [email, setEmail] = useState("");
  const [motdepasse, setMotdepasse] = useState("");
  const [message, setMessage] = useState("");
  const [chargement, setChargement] = useState(false);
  const [mode, setMode] = useState("connexion");
  const router = useRouter();

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 px-4">
      {/* Card Container */}
      <div className="bg-white p-10 rounded-3xl shadow-2xl relative max-w-md w-full transform transition hover:scale-105">
        {/* Branding Header */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
          <FiCheckCircle className="text-white text-4xl" />
        </div>

        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6">
          {mode === "connexion" ? "Bienvenue !" : "Inscription"}
        </h1>
        <p className="text-center text-gray-500 mb-6">
          {mode === "connexion"
            ? "Connectez-vous pour découvrir votre espace personnel."
            : "Créez un compte et commencez dès aujourd'hui !"}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <FiMail className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="relative">
            <FiLock className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type="password"
              placeholder="Mot de passe"
              value={motdepasse}
              onChange={(e) => setMotdepasse(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {message && (
            <p
              className={`text-sm text-center ${
                message.startsWith("✅") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-lg font-semibold hover:scale-105 transition transform disabled:opacity-60"
            disabled={chargement}
          >
            {chargement ? (
              <span className="flex items-center justify-center gap-2">
                <FiLoader className="animate-spin" />
                Chargement...
              </span>
            ) : mode === "connexion" ? "Se connecter" : "Créer un compte"}
          </button>
        </form>

        {/* Toggle Mode */}
        <p className="text-center mt-4 text-sm text-gray-600">
          {mode === "connexion"
            ? "Pas encore de compte ? "
            : "Déjà inscrit ? "}
          <span
            className="text-purple-600 font-semibold hover:underline cursor-pointer"
            onClick={() =>
              setMode(mode === "connexion" ? "inscription" : "connexion")
            }
          >
            {mode === "connexion" ? "Inscrivez-vous" : "Connectez-vous"}
          </span>
        </p>

        {/* Footer */}
        <p className="text-xs text-gray-400 mt-6 text-center">
          © 2025 NourRise | Sécurité et confiance, propulsé par Supabase.
        </p>
      </div>
    </div>
  );
}