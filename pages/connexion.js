import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/router";

export default function Connexion() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [motdepasse, setMotdepasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [success, setSuccess] = useState("");
  const [chargement, setChargement] = useState(false);
  const [mode, setMode] = useState("connexion");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    setSuccess("");
    setChargement(true);

    if (!email || !motdepasse) {
      setErreur("Merci de remplir tous les champs.");
      setChargement(false);
      return;
    }

    try {
      if (mode === "inscription") {
        const { error } = await supabase.auth.signUp({ email, password: motdepasse });
        if (error) throw error;
        setSuccess("Compte créé ! Vérifie ta boîte mail.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: motdepasse });
        if (error) throw error;
        router.push("/");
      }
    } catch (err) {
      setErreur(err.message || "Une erreur est survenue.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-white px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg animate-fadeIn border border-blue-200">
        <h1 className="text-3xl font-extrabold text-center text-blue-700 mb-6 tracking-wide">
          {mode === "connexion" ? "Se connecter à NourRise" : "Créer un compte"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse e-mail</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@mail.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={motdepasse}
              onChange={(e) => setMotdepasse(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {erreur && <p className="text-sm text-red-600 mt-2">{erreur}</p>}
          {success && <p className="text-sm text-green-600 mt-2">{success}</p>}

          <button
            type="submit"
            disabled={chargement}
            className={`w-full py-2 px-4 text-white font-semibold rounded ${
              chargement ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
            } transition duration-200`}
          >
            {chargement ? "Chargement..." : mode === "connexion" ? "Connexion" : "Créer un compte"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          {mode === "connexion" ? "Pas encore de compte ? " : "Déjà un compte ? "}
          <span
            onClick={() => setMode(mode === "connexion" ? "inscription" : "connexion")}
            className="text-blue-600 font-semibold hover:underline cursor-pointer"
          >
            {mode === "connexion" ? "Inscris-toi ici" : "Connecte-toi ici"}
          </span>
        </div>

        <p className="text-xs text-gray-400 mt-6 text-center">
          NourRise - Propulsé par Supabase | Version test
        </p>
      </div>
    </div>
  );
}