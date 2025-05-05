import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../supabaseClient";
import { FiMail, FiLock } from "react-icons/fi";

export default function Connexion() {
  const [email, setEmail] = useState("");
  const [motdepasse, setMotdepasse] = useState("");
  const [message, setMessage] = useState("");
  const [typeMessage, setTypeMessage] = useState("erreur");
  const [chargement, setChargement] = useState(false);
  const [mode, setMode] = useState("connexion");
  const router = useRouter();

  const validerEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setChargement(true);

    if (!validerEmail(email)) {
      setTypeMessage("erreur");
      setMessage("Adresse email invalide.");
      setChargement(false);
      return;
    }

    if (motdepasse.length < 6) {
      setTypeMessage("erreur");
      setMessage("Le mot de passe doit contenir au moins 6 caractères.");
      setChargement(false);
      return;
    }

    try {
      if (mode === "inscription") {
        const { error } = await supabase.auth.signUp({ email, password: motdepasse });
        if (error) throw error;
        setTypeMessage("valide");
        setMessage("Compte créé. Vérifie ta boîte mail.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: motdepasse });
        if (error) throw error;
        setTypeMessage("valide");
        setMessage("Connexion réussie !");
        setTimeout(() => router.push("/auth-check"), 1000);
      }
    } catch (err) {
      setTypeMessage("erreur");
      setMessage(err.message || "Erreur inconnue.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-blue-100 via-white to-purple-100 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-xl border border-blue-200 animate-fadeIn">
        <h1 className="text-3xl font-extrabold text-center text-blue-700 mb-6">
          {mode === "connexion" ? "Connexion à Wivya" : "Créer un compte"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Adresse e-mail</label>
            <div className="relative">
              <FiMail className="absolute top-3 left-3 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@mail.com"
                className="pl-10 w-full py-2 px-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Mot de passe</label>
            <div className="relative">
              <FiLock className="absolute top-3 left-3 text-gray-400" />
              <input
                type="password"
                value={motdepasse}
                onChange={(e) => setMotdepasse(e.target.value)}
                placeholder="••••••••"
                className="pl-10 w-full py-2 px-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                required
              />
            </div>
          </div>

          {message && (
            <p className={`text-sm ${typeMessage === "erreur" ? "text-red-500" : "text-green-600"} text-center`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={chargement}
            className={`w-full py-2 px-4 text-white font-bold rounded-lg transition duration-200 ${
              chargement ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {chargement
              ? "Chargement..."
              : mode === "connexion"
              ? "Connexion"
              : "Créer mon compte"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          {mode === "connexion" ? "Pas encore inscrit ?" : "Déjà inscrit ?"}{" "}
          <span
            onClick={() => setMode(mode === "connexion" ? "inscription" : "connexion")}
            className="text-blue-600 hover:underline cursor-pointer font-semibold"
          >
            {mode === "connexion" ? "Inscris-toi" : "Connecte-toi"}
          </span>
        </p>

        <p className="text-xs text-gray-400 mt-6 text-center">
          Wivya – Ton compagnon de discipline | Supabase sécurisé | 2025
        </p>
      </div>
    </div>
  );
}