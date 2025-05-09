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
  FiZap,
  FiUser,
} from "react-icons/fi";

// Importation dynamique de composants lourds
const GraphiqueEvolution = dynamic(() => import("../composants/GraphiqueEvolution"), { ssr: false });
const GraphiqueNote = dynamic(() => import("../composants/GraphiqueNote"), { ssr: false });
const confetti = dynamic(() => import("canvas-confetti"), { ssr: false });

/** Définition des paliers de niveau */
const NIVEAUX = [
  { niveau: 1, nom: "Débutant", requis: 0, icone: "🌱", couleur: "from-blue-400 to-blue-600", motivation: "Le début d'un beau voyage..." },
  { niveau: 2, nom: "Apprenti", requis: 100, icone: "🌿", couleur: "from-green-400 to-green-600", motivation: "Tu progresses bien !" },
  { niveau: 3, nom: "Initié", requis: 300, icone: "⭐", couleur: "from-yellow-400 to-yellow-600", motivation: "Ta persévérance paie !" },
  { niveau: 4, nom: "Expert", requis: 600, icone: "🔥", couleur: "from-orange-500 to-red-600", motivation: "Tu inspires les autres." },
];

/** Fonction utilitaire pour déterminer le niveau selon les points */
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
  const [journal, setJournal] = useState([]); // Données des journées précédentes

  /** Initialisation : vérifie session + charge données Supabase */
  useEffect(() => {
    const init = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!session) return router.push("/connexion");

      setUser(session.user);

      // Charger les données de l'utilisateur
      const { data: entrees, error: errJours } = await supabase
        .from("votre_nom_table") // À remplacer par le nom réel de la table
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (!errJours) {
        setJournal(entrees);
        if (entrees.length > 0) {
          const dernier = entrees[0];
          setPoints(dernier.points || 0);
          setStreak(dernier.streak || 0);
        }
      }

      // Exemple de tâches du jour
      setTaches([
        { nom: "Réveil tôt", description: "Avant 6h", fait: false },
        { nom: "Sport", description: "15 min minimum", fait: false },
        { nom: "Lecture", description: "10 pages", fait: false },
      ]);

      setLoading(false);
    };
    init();
  }, [router]);
    /** Gestion de la validation de journée */
  const validerJournee = async () => {
    try {
      // Calcul de la réussite
      const total = taches.length;
      const accomplies = taches.filter((t) => t.fait).length;
      const taux = total > 0 ? Math.round((accomplies / total) * 100) : 0;
      const note = taux >= 80 ? 10 : taux >= 50 ? 7 : 5;

      // Gestion du streak (vérifie la date précédente)
      let nouveauStreak = 1;
      if (journal.length > 0) {
        const hier = new Date(journal[0].created_at);
        const aujourdhui = new Date();
        const diff = Math.floor((aujourdhui - hier) / (1000 * 60 * 60 * 24));
        if (diff === 1) nouveauStreak = journal[0].streak + 1;
        else if (diff === 0) return afficherNotification("Tu as déjà validé aujourd’hui !", "info");
        else nouveauStreak = 1;
      }

      // Mise à jour des points
      const nouveauxPoints = points + note * 10;
      const nouveauNiveau = calculerNiveau(nouveauxPoints);

      // Enregistrement dans Supabase
      const { error } = await supabase.from("votre_nom_table").insert([
        {
          user_id: user.id,
          note: note,
          taux_reussite: taux,
          taches: JSON.stringify(taches),
          created_at: new Date().toISOString(),
          nom_utilisateur: user.email,
          streak: nouveauStreak,
          points: nouveauxPoints,
        },
      ]);

      if (error) throw error;

      // Mise à jour des états locaux
      setPoints(nouveauxPoints);
      setStreak(nouveauStreak);
      setNiveau(nouveauNiveau);
      setNotification({ message: "Journée validée avec succès ! 🎉", type: "success" });

      // Confettis
      if (confetti) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

    } catch (err) {
      console.error("Erreur validation :", err.message);
      setNotification({ message: "Erreur lors de la validation", type: "error" });
    }
  };

  /** Affiche une notification temporaire */
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

      {/* HEADER */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold">Bienvenue, {user?.email || "Invité"}</h1>
          <p className="text-sm text-gray-300">Niveau {niveau.niveau} — {niveau.nom} {niveau.icone}</p>
          <p className="text-xs italic text-gray-200">{niveau.motivation}</p>
        </div>
        <button
          onClick={() => setModeNuit(!modeNuit)}
          className="bg-white/10 p-3 rounded-full shadow hover:scale-105 transition"
        >
          {modeNuit ? <FiSun className="text-yellow-400" /> : <FiMoon />}
        </button>
      </header>

      {/* STATISTIQUES */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Tes Statistiques</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{points}</p>
            <p className="text-sm">Points accumulés</p>
          </div>
          <div className="glass rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{streak}</p>
            <p className="text-sm">Jours consécutifs</p>
          </div>
          <div className="glass rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{niveau.niveau}</p>
            <p className="text-sm">Niveau</p>
          </div>
        </div>
      </section>

      {/* TACHES */}
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
                  className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600"
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
          className="mt-6 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold shadow-lg"
        >
          Valider la journée
        </button>
      </section>

      {/* NOTIFICATION */}
      {notification && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-xl backdrop-blur-sm ${
            notification.type === "success" ? "bg-green-500" : notification.type === "error" ? "bg-red-500" : "bg-blue-500"
          }`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
}