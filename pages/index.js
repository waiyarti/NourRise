// ./pages/index.js

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { format } from "date-fns";
import confetti from "canvas-confetti";
import { supabase } from "../supabaseClient";
import GraphiqueEvolution from "../composants/GraphiqueEvolution";
import GraphiqueNote from "../composants/GraphiqueNote";

// NIVEAUX SIMPLIFIÉS (exemple)
const NIVEAUX = [
  { niveau: 1, requis: 0, couleur: "from-blue-400 to-blue-600", icone: "🌱", nom: "Débutant" },
  { niveau: 2, requis: 100, couleur: "from-green-400 to-green-600", icone: "🌿", nom: "Apprenti" },
  { niveau: 3, requis: 300, couleur: "from-yellow-400 to-yellow-600", icone: "⭐", nom: "Initié" },
];

// CITATIONS
const CITATIONS = [
  { texte: "Chaque petit progrès te rapproche de tes objectifs", auteur: "Wivya" },
  { texte: "La constance est la clé du succès", auteur: "Wivya" },
];

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [niveau, setNiveau] = useState(1);
  const [citation, setCitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taches, setTaches] = useState([]);
  const [historique, setHistorique] = useState([]);

  useEffect(() => {
    const verifierSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/connexion");
      } else {
        setUser(session.user);
        await chargerTaches(session.user.id);
        chargerCitation();
        setLoading(false);
      }
    };
    verifierSession();
  }, []);

  const chargerCitation = () => {
    const random = Math.floor(Math.random() * CITATIONS.length);
    setCitation(CITATIONS[random]);
  };

  const chargerTaches = async (userId) => {
    const { data, error } = await supabase
      .from("taches")
      .select("*")
      .eq("user_id", userId);
    if (!error && data) {
      setTaches(data);
    }
  };

  const ajouterPoints = (nb) => {
    const total = points + nb;
    setPoints(total);
    const nouveauNiveau = NIVEAUX.findLast(n => total >= n.requis)?.niveau || 1;
    if (nouveauNiveau > niveau) {
      setNiveau(nouveauNiveau);
      confetti();
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white bg-gradient-to-br from-blue-500 to-purple-500">
        Chargement en cours...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Wivya - Discipline au quotidien</title>
      </Head>

      <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <header className="text-white mb-8">
          <h1 className="text-3xl font-bold">Bienvenue sur Wivya</h1>
          <p>Niveau {niveau} - {points} points</p>
        </header>

        {citation && (
          <div className="glassmorphism p-4 mb-6 rounded-lg text-white text-center">
            <p className="text-lg italic">"{citation.texte}"</p>
            <p className="text-sm mt-2">- {citation.auteur}</p>
          </div>
        )}

        <div className="space-y-4">
          {taches.map((tache, index) => (
            <div
              key={index}
              className="glassmorphism p-4 rounded-lg text-white flex justify-between items-center"
            >
              <span>{tache.nom}</span>
              <button
                onClick={() => ajouterPoints(tache.points || 10)}
                className="bg-green-500 px-4 py-1 rounded hover:bg-green-600"
              >
                Terminer
              </button>
            </div>
          ))}
        </div>

        <div className="mt-10 glassmorphism rounded-xl p-6 text-white">
          <h2 className="text-xl font-bold mb-4">Historique</h2>
          {historique.map((h, i) => (
            <div key={i} className="mb-2">
              {format(new Date(h.date), "dd/MM/yyyy")} – {h.note}/20
            </div>
          ))}
        </div>

        <div className="mt-10">
          <GraphiqueEvolution historique={historique} />
          <GraphiqueNote historique={historique} />
        </div>
      </div>
    </>
  );
}