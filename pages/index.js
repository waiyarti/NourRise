import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/router";
import Head from "next/head";
import { FiPlus, FiCheck, FiSun, FiMoon } from "react-icons/fi";

const GraphiqueEvolution = dynamic(() => import("../composants/GraphiqueEvolution"), { ssr: false });
const GraphiqueNote = dynamic(() => import("../composants/GraphiqueNote"), { ssr: false });
const confetti = dynamic(() => import("canvas-confetti"), { ssr: false });

const NIVEAUX = [
  { niveau: 1, nom: "Débutant", requis: 0, icone: "🌱", couleur: "from-blue-400 to-blue-600", motivation: "Le début d'un beau voyage..." },
  { niveau: 2, nom: "Apprenti", requis: 100, icone: "🌿", couleur: "from-green-400 to-green-600", motivation: "Tu progresses bien !" },
  { niveau: 3, nom: "Initié", requis: 300, icone: "⭐", couleur: "from-yellow-400 to-yellow-600", motivation: "Ta persévérance paie !" },
  { niveau: 4, nom: "Expert", requis: 600, icone: "🔥", couleur: "from-orange-500 to-red-600", motivation: "Tu inspires les autres." },
];

const calculerNiveau = (points) => {
  for (let i = NIVEAUX.length - 1; i >= 0; i--) {
    if (points >= NIVEAUX[i].requis) return NIVEAUX[i];
  }
  return NIVEAUX[0];
};

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [niveau, setNiveau] = useState(NIVEAUX[0]);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [taches, setTaches] = useState([]);
  const [modeNuit, setModeNuit] = useState(false);
  const [notification, setNotification] = useState(null);
  const [journal, setJournal] = useState([]);

  useEffect(() => {
    const init = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!session) return router.push("/connexion");

      setUser(session.user);

      const { data: entrees, error: errJours } = await supabase
        .from("journal")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (!errJours && entrees) {
        setJournal(entrees);
        if (entrees.length > 0) {
          const dernier = entrees[0];
          setPoints(dernier.points || 0);
          setStreak(dernier.streak || 0);
        }
      }

      setTaches([
        { nom: "Réveil tôt", description: "Avant 6h", fait: false },
        { nom: "Sport", description: "15 min minimum", fait: false },
        { nom: "Lecture", description: "10 pages", fait: false },
      ]);

      setLoading(false);
    };
    init();
  }, [router]);

  const validerJournee = async () => {
    try {
      const total = taches.length;
      const accomplies = taches.filter((t) => t.fait).length;
      const taux = total > 0 ? Math.round((accomplies / total) * 100) : 0;
      const note = taux >= 80 ? 10 : taux >= 50 ? 7 : 5;

      let nouveauStreak = 1;
      if (journal.length > 0) {
        const dernierJour = new Date(journal[0].created_at);
        const aujourdHui = new Date();
        const diff = Math.floor((aujourdHui - dernierJour) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          nouveauStreak = journal[0].streak + 1;
        } else if (diff === 0) {
          return afficherNotification("Tu as déjà validé aujourd’hui !", "info");
        }
      }

      const nouveauxPoints = points + note * 10;
      const nouveauNiveau = calculerNiveau(nouveauxPoints);

      const { error } = await supabase.from("journal").insert([
        {
          user_id: user.id,
          note,
          taux_reussite: taux,
          taches: taches,
          created_at: new Date().toISOString(),
          nom_utilisateur: user.email,
          streak: nouveauStreak,
          points: nouveauxPoints,
        },
      ]);

      if (error) {
        console.error("❌ Erreur Supabase :", error.message || error);
        return setNotification({ message: "Erreur d'enregistrement dans Supabase", type: "error" });
      }

      setPoints(nouveauxPoints);
      setStreak(nouveauStreak);
      setNiveau(nouveauNiveau);
      setNotification({ message: "Journée validée avec succès !", type: "success" });

      if (confetti) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error("❌ Erreur validation :", err);
      setNotification({ message: "Erreur inattendue", type: "error" });
    }
  };

  const afficherNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div
      className={`min-h-screen px-4 py-6 transition-all duration-300 ${
        modeNuit
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white"
          : "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white"
      }`}
    >
      <Head>
        <title>Weyzen - Discipline personnelle</title>
      </Head>

      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold">Bienvenue, {user?.email || "Invité"}</h1>
          <p className="text-sm text-gray-300">
            Niveau {niveau.niveau} — {niveau.nom} {niveau.icone}
          </p>
          <p className="text-xs italic text-gray-200">{niveau.motivation}</p>
        </div>
        <button
          onClick={() => setModeNuit(!modeNuit)}
          className="bg-white/10 p-3 rounded-full shadow hover:scale-105 transition"
        >
          {modeNuit ? <FiSun className="text-yellow-400" /> : <FiMoon />}
        </button>
      </header>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Tes Statistiques</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{points}</p>
            <p className="text-sm">Points</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{streak}</p>
            <p className="text-sm">Streak</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{niveau.niveau}</p>
            <p className="text-sm">Niveau</p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Tâches du jour</h2>
        {taches.length > 0 ? (
          <div className="space-y-4">
            {taches.map((tache, index) => (
              <div
                key={index}
                className="bg-white/10 rounded-lg p-4 flex justify-between items-center backdrop-blur-sm"
              >
                <div>
                  <h3 className="text-lg font-bold">{tache.nom}</h3>
                  <p className="text-sm">{tache.description}</p>
                </div>
                <button
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    tache.fait ? "bg-green-600" : "bg-gray-300 text-black"
                  }`}
                  onClick={() => {
                    const maj = [...taches];
                    maj[index].fait = !maj[index].fait;
                    setTaches(maj);
                  }}
                >
                  {tache.fait ? <FiCheck /> : <FiPlus />}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm">Aucune tâche pour aujourd'hui.</p>
        )}
        <button
          onClick={validerJournee}
          className="mt-6 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold shadow-lg w-full"
        >
          Valider la journée
        </button>
      </section>

      {notification && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-xl backdrop-blur-sm ${
            notification.type === "success"
              ? "bg-green-500"
              : notification.type === "error"
              ? "bg-red-500"
              : "bg-blue-500"
          }`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
}
