import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  FiPlus,
  FiCheck,
  FiFire,
  FiCalendar,
  FiSun,
  FiMoon,
} from "react-icons/fi";

// Importation dynamique de composants lourds
const GraphiqueEvolution = dynamic(() => import("../composants/GraphiqueEvolution"), { ssr: false });
const GraphiqueNote = dynamic(() => import("../composants/GraphiqueNote"), { ssr: false });
const confetti = dynamic(() => import("canvas-confetti"), { ssr: false });

/**
 * Niveaux de progression
 */
const NIVEAUX = [
  {
    niveau: 1,
    nom: "Débutant",
    requis: 0,
    icone: "🌱",
    couleur: "from-blue-400 to-blue-600",
    motivation: "Le début d'un beau voyage...",
  },
  {
    niveau: 2,
    nom: "Apprenti",
    requis: 100,
    icone: "🌿",
    couleur: "from-green-400 to-green-600",
    motivation: "Tu progresses bien !",
  },
  {
    niveau: 3,
    nom: "Initié",
    requis: 300,
    icone: "⭐",
    couleur: "from-yellow-400 to-yellow-600",
    motivation: "Ta persévérance paie !",
  },
];
export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [niveau, setNiveau] = useState(1);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [taches, setTaches] = useState([]);
  const [modeNuit, setModeNuit] = useState(false);
  const [notification, setNotification] = useState(null);
  const router = useRouter();

  // Effet d'initialisation
  useEffect(() => {
    const verifierSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/connexion");
      } else {
        setUser(session.user);
        setTaches([{ nom: "Exemple de tâche", description: "Description de la tâche" }]);
      }
      setLoading(false);
    };
    verifierSession();
  }, [router]);

  // Effet pour déclencher les confettis
  useEffect(() => {
    if (notification?.type === "success" && confetti) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }, [notification]);

  // Validation d'une journée
  const validerJournee = () => {
    setPoints((prev) => prev + 50);
    setStreak((prev) => prev + 1);
    setNotification({ message: "Journée validée avec succès ! 🎉", type: "success" });
  };

  // Gestion des notifications
  const afficherNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
    return (
    <div className={`min-h-screen bg-gradient-to-br ${modeNuit ? "from-gray-900 via-gray-800 to-gray-700" : "from-indigo-500 via-purple-500 to-pink-500"} text-white`}>
      <Head>
        <title>NourRise - Développez vos habitudes</title>
      </Head>

      <header className="p-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Bienvenue, {user?.email || "Invité"}</h1>
          <p className="text-sm text-gray-300">Niveau {niveau}</p>
        </div>
        <button
          onClick={() => setModeNuit((prev) => !prev)}
          className="bg-white/10 p-2 rounded-full"
        >
          {modeNuit ? <FiSun className="text-yellow-400" /> : <FiMoon />}
        </button>
      </header>

      <main className="p-6">
        <section className="mb-6">
          <h2 className="text-xl font-bold">Statistiques</h2>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-white/10 rounded-lg text-center">
              <p className="text-2xl font-bold">{points}</p>
              <p className="text-sm">Points</p>
            </div>
            <div className="p-4 bg-white/10 rounded-lg text-center">
              <p className="text-2xl font-bold">{streak}</p>
              <p className="text-sm">Jours consécutifs</p>
            </div>
            <div className="p-4 bg-white/10 rounded-lg text-center">
              <p className="text-2xl font-bold">{niveau}</p>
              <p className="text-sm">Niveau</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold">Tâches du jour</h2>
          <div className="mt-4">
            {taches.length > 0 ? (
              taches.map((tache, index) => (
                <div key={index} className="p-4 bg-white/10 rounded-lg mb-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold">{tache.nom}</h3>
                    <p className="text-sm">{tache.description}</p>
                  </div>
                  <button
                    onClick={validerJournee}
                    className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600"
                  >
                    Valider
                  </button>
                </div>
              ))
            ) : (
              <p>Aucune tâche pour aujourd'hui.</p>
            )}
          </div>
        </section>
      </main>

      {notification && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${notification.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}
