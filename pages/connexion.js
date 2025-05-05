// --- Importations principales ---
import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../supabaseClient";

// --- Composant de champ de formulaire réutilisable ---
function ChampInput({ label, type, valeur, onChange, placeholder }) {
  return (
    <div className="mb-4">
      <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={valeur}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full px-3 py-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-400 transition"
      />
    </div>
  );
}

// --- Composant de feedback utilisateur ---
function MessageFeedback({ message, type }) {
  const color = type === "erreur" ? "text-red-600" : "text-green-600";
  return <p className={`text-sm ${color} mb-3`}>{message}</p>;
}

// --- Composant du switch mode Connexion/Inscription ---
function ToggleMode({ mode, setMode }) {
  return (
    <p className="mt-4 text-center text-sm">
      {mode === "connexion" ? "Pas encore inscrit ? " : "Déjà un compte ? "}
      <span
        onClick={() => setMode(mode === "connexion" ? "inscription" : "connexion")}
        className="text-blue-600 font-semibold hover:underline cursor-pointer"
      >
        {mode === "connexion" ? "Inscris-toi" : "Connecte-toi"}
      </span>
    </p>
  );
}

// --- Composant principal de Connexion ---
export default function Connexion() {
  const [email, setEmail] = useState("");
  const [motdepasse, setMotdepasse] = useState("");
  const [message, setMessage] = useState("");
  const [typeMessage, setTypeMessage] = useState("erreur");
  const [chargement, setChargement] = useState(false);
  const [mode, setMode] = useState("connexion");
  const router = useRouter();

  const validerEmail = (email) => {
    const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    return regex.test(email);
  };

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-white px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg border border-blue-200 animate-fadeIn">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
          {mode === "connexion" ? "Connexion à NourRise" : "Créer un compte"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ChampInput
            label="Adresse e-mail"
            type="email"
            valeur={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="exemple@mail.com"
          />
          <ChampInput
            label="Mot de passe"
            type="password"
            valeur={motdepasse}
            onChange={(e) => setMotdepasse(e.target.value)}
            placeholder="••••••••"
          />

          {message && <MessageFeedback message={message} type={typeMessage} />}

          <button
            type="submit"
            disabled={chargement}
            className={`w-full py-2 px-4 text-white font-semibold rounded transition duration-200 ${
              chargement ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {chargement ? "Chargement..." : mode === "connexion" ? "Connexion" : "Créer un compte"}
          </button>
        </form>

        <ToggleMode mode={mode} setMode={setMode} />

        <p className="text-xs text-gray-400 mt-6 text-center">
          NourRise – Propulsé par Supabase | Auth sécurisée | 2025
        </p>
      </div>
    </div>
  );
}