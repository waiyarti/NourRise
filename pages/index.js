import { useState, useEffect } from "react";
import { format } from "date-fns";
import AnalyseIA from "../composants/AnalyseIA";
import GraphiqueEvolution from "../composants/GraphiqueEvolution";
import GraphiqueNote from "../composants/GraphiqueNote";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/router";
import Head from "next/head";

// Vos constantes, tâches, niveaux, catégories, etc. restent inchangés ici
// ...

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taches, setTaches] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [niveau, setNiveau] = useState(1);
  const [points, setPoints] = useState(0);
  const [pointsJour, setPointsJour] = useState(0);
  const [streak, setStreak] = useState(0);
  const [notification, setNotification] = useState(null);
  const [citationDuJour, setCitationDuJour] = useState(null);
  const [categorieActive, setCategorieActive] = useState("TOUS");
  const [achievements, setAchievements] = useState([]);
  const [modeNuit, setModeNuit] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const verifierSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/connexion");
          return;
        }
        setUser(session.user);
        await initialiserJournee(session.user.id);
      } catch (error) {
        console.error("Erreur de session:", error);
        router.push("/connexion");
      } finally {
        setLoading(false);
      }
    };
    verifierSession();
  }, []);

  const initialiserJournee = async (userId) => {
    try {
      setLoading(true);
      await chargerHistorique(userId);
      setTaches(tachesJournalieresInitiales);
    } catch (error) {
      console.error("Erreur lors de l'initialisation:", error);
    } finally {
      setLoading(false);
    }
  };

  const chargerHistorique = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("historique")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (error) throw error;
      setHistorique(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
      setHistorique([]);
    }
  };

  const ajouterPoints = (pointsAjoutes) => {
    setPoints((prevPoints) => prevPoints + pointsAjoutes);
  };

  const validerJournee = async () => {
    try {
      const nouvelleJournee = {
        user_id: user.id,
        date: new Date().toISOString(),
        points,
        taches: taches.map((tache) => ({
          nom: tache.nom,
          etat: tache.etat,
        })),
      };

      const { error } = await supabase.from("historique").insert([nouvelleJournee]);
      if (error) throw error;

      setNotification({ message: "Journée validée avec succès !", type: "success" });
      setTaches([]);
    } catch (error) {
      console.error("Erreur lors de la validation de la journée:", error);
      setNotification({ message: "Erreur lors de la validation", type: "error" });
    }
  };

  const supprimerTache = (index) => {
    const nouvellesTaches = taches.filter((_, i) => i !== index);
    setTaches(nouvellesTaches);
  };

  const deconnexion = async () => {
    await supabase.auth.signOut();
    router.push("/connexion");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>NourRise - Votre Voyage</title>
      </Head>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="p-6 bg-blue-500 text-white flex justify-between items-center">
          <h1 className="text-xl font-bold">NourRise</h1>
          <button onClick={deconnexion} className="bg-red-500 px-4 py-2 rounded">
            Déconnexion
          </button>
        </header>

        {/* Corps principal */}
        <main className="p-6">
          <h2 className="text-2xl font-bold mb-4">Tâches du jour</h2>
          <div className="space-y-4">
            {taches.map((tache, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-gray-200 p-4 rounded"
              >
                <div>
                  <h3 className="font-bold">{tache.nom}</h3>
                  <p>{tache.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => supprimerTache(index)}
                    className="bg-red-500 px-2 py-1 text-white rounded"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={validerJournee}
            className="mt-6 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Valider la journée
          </button>
        </main>
      </div>
    </>
  );
}
