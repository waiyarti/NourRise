// --- Importations principales ---
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../supabaseClient";
import { FiMail, FiLock } from "react-icons/fi"; // Icônes

// --- Champ de formulaire réutilisable ---
function ChampInput({ label, type, valeur, onChange, placeholder, Icone }) {
  return (
    <div className="mb-4">
      <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        {Icone && <Icone className="absolute top-3 left-3 text-gray-400" />}
        <input
          type={type}
          value={valeur}
          onChange={onChange}
          placeholder={placeholder}
          required
          className="w-full px-10 py-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-400 transition"
        />
      </div>
    </div>
  );
}

// --- Message d'erreur ou succès ---
function MessageFeedback({ message, type }) {
  const color = type === "erreur" ? "text-red-600" : "text-green-600";
  return <p className={`text-sm ${color} mb-3 text-center`}>{message}</p>;
}

// --- Changement mode Connexion/Inscription ---
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

// --- Composant principal ---
export default function Connexion() {
  const [email, setEmail] = useState("");
  const [motdepasse, setMotdepasse] = useState("");
  const [message, setMessage] = useState("");
  const [typeMessage, setTypeMessage] = useState("erreur");
  const [chargement, setChargement] = useState(false);
  const [mode, setMode] = useState("connexion");
  const router = useRouter();

  // Redirection automatique si déjà connecté
  useEffect(() => {
    const verifierSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/");
      }
    };
    verifierSession();
  }, []);

  const validerEmail = (email) => /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);

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
        setMessage("Compte créé ! Vérifie tes e-mails.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: motdepasse });
        if (error) throw error;
        setTypeMessage("valide");
        setMessage("Connexion réussie !");
        setTimeout(() => router.push("/"), 1500);
      }
    } catch (err) {
      setTypeMessage("erreur");
      setMessage(err.message || "Erreur inconnue.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-blue-50 px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl border border-blue-300 animate-fadeIn">
        <h1 className="text-3xl font-extrabold text-center text-blue-800 mb-6 tracking-tight">
          {mode === "connexion" ? "Connexion à Wivya" : "Créer mon compte"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ChampInput
            label="Adresse e-mail"
            type="email"
            valeur={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="exemple@mail.com"
            Icone={FiMail}
          />
          <ChampInput
            label="Mot de passe"
            type="password"
            valeur={motdepasse}
            onChange={(e) => setMotdepasse(e.target.value)}
            placeholder="••••••••"
            Icone={FiLock}
          />

          {message && <MessageFeedback message={message} type={typeMessage} />}

          <button
            type="submit"
            disabled={chargement}
            className={`w-full py-2 px-4 text-white font-semibold rounded-lg transition duration-200 ${
              chargement ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {chargement ? "Chargement..." : mode === "connexion" ? "Connexion" : "Créer un compte"}
          </button>
        </form>

        <ToggleMode mode={mode} setMode={setMode} />

        <div className="mt-6 text-xs text-center text-gray-400">
          Wivya – Ton compagnon de discipline | Supabase sécurisé | 2025
        </div>
      </div>
    </div>
  );
}