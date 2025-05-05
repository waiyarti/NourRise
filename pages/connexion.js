import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../supabaseClient";
import { FiMail, FiLock, FiLoader } from "react-icons/fi";

export default function Connexion() {
  const [email, setEmail] = useState("");
  const [motdepasse, setMotdepasse] = useState("");
  const [message, setMessage] = useState("");
  const [chargement, setChargement] = useState(false);
  const [mode, setMode] = useState("connexion"); // "connexion" ou "inscription"
  const router = useRouter();

  const validerEmail = (email) =>
    /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setChargement(true);

    if (!validerEmail(email)) {
      setMessage("Adresse email invalide.");
      setChargement(false);
      return;
    }
    if (motdepasse.length < 6) {
      setMessage("Mot de passe trop court.");
      setChargement(false);
      return;
    }

    try {
      if (mode === "inscription") {
        const { error } = await supabase.auth.signUp({ email, password: motdepasse });
        if (error) throw error;
        setMessage("✅ Compte créé ! Vérifie tes mails.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: motdepasse });
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="bg-white p-8 md:p-10 w-full max-w-md rounded-2xl shadow-xl border border-blue-100 animate-fadeIn">
        <h1 className="text-3xl font-bold text-center text-primary mb-6 tracking-wide">
          {mode === "connexion" ? "Connexion à Wivya" : "Créer un compte"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <FiMail className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-primary transition"
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
              className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-primary transition"
            />
          </div>

          {message && (
            <p
              className={`text-sm ${
                message.startsWith("✅") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
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

        <p className="text-center mt-4 text-sm text-gray-600">
          {mode === "connexion" ? "Pas encore de compte ? " : "Déjà inscrit ? "}
          <span
            className="text-primary font-semibold hover:underline cursor-pointer"
            onClick={() =>
              setMode(mode === "connexion" ? "inscription" : "connexion")
            }
          >
            {mode === "connexion" ? "Inscris-toi" : "Connecte-toi"}
          </span>
        </p>

        <p className="text-xs text-gray-400 mt-6 text-center">
          Wivya – Propulsé par Supabase | Auth sécurisée | 2025
        </p>
      </div>
    </div>
  );
}