import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/router";

export default function Connexion() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [motdepasse, setMotdepasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [mode, setMode] = useState("connexion"); // ou "inscription"

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");

    if (mode === "inscription") {
      const { error } = await supabase.auth.signUp({
        email,
        password: motdepasse,
      });
      if (error) return setErreur(error.message);
      alert("Compte créé avec succès !");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: motdepasse,
      });
      if (error) return setErreur("Email ou mot de passe incorrect");
      router.push("/"); // redirige vers la page d’accueil (Home)
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-blue-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">
          {mode === "connexion" ? "Connexion" : "Inscription"}
        </h1>

        <input
          type="email"
          placeholder="Ton e-mail"
          className="w-full p-2 mb-4 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          className="w-full p-2 mb-4 border rounded"
          value={motdepasse}
          onChange={(e) => setMotdepasse(e.target.value)}
          required
        />

        {erreur && <p className="text-red-500 text-sm mb-4">{erreur}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {mode === "connexion" ? "Se connecter" : "Créer un compte"}
        </button>

        <p
          onClick={() => setMode(mode === "connexion" ? "inscription" : "connexion")}
          className="mt-4 text-sm text-center text-blue-500 hover:underline cursor-pointer"
        >
          {mode === "connexion"
            ? "Pas encore de compte ? Inscris-toi"
            : "Déjà un compte ? Connecte-toi"}
        </p>
      </form>
    </div>
  );
}