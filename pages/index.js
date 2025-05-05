import { useState, useEffect } from "react";
import { format } from "date-fns";
import AnalyseIA from "../composants/AnalyseIA";
import GraphiqueEvolution from "../composants/GraphiqueEvolution";
import GraphiqueNote from "../composants/GraphiqueNote";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/router";

const tachesJournalieresInitiales = [
  { nom: "Coran", coef: 5 },
  { nom: "Révision", coef: 4 },
  { nom: "Mémorisation cheikh Houcine", coef: 4 },
  { nom: "Cours religieux", coef: 4 },
  { nom: "Étirement", coef: 2 },
  { nom: "Mobilité", coef: 2 },
  { nom: "Renforcement musculaire", coef: 2 },
  { nom: "Respiration", coef: 1 },
  { nom: "Sieste", coef: 1 },
  { nom: "Marche", coef: 1 },
  { nom: "Formation business", coef: 3 },
  { nom: "Formation IA", coef: 4 },
  { nom: "Formation religieux", coef: 3 },
  { nom: "Lecture", coef: 3 },
  { nom: "Entraînement", coef: 3 },
  { nom: "Dou‘a matin et soir", coef: 5 },
  { nom: "Istighfar", coef: 5 },
  { nom: "Tafsir", coef: 4 },
  { nom: "Introspection", coef: 3 },
  { nom: "Planification lendemain", coef: 3 },
  { nom: "Vidéo motivation business", coef: 1 },
  { nom: "Hydratation", coef: 2 },
  { nom: "Geste de bonté", coef: 1 },
  { nom: "Rappel à un proche", coef: 1 },
  { nom: "Motivation religieuse", coef: 2 },
  { nom: "Devoirs BUT GEA", coef: 4 },
  { nom: "Anglais", coef: 3 },
  { nom: "Formation sujet intelligent", coef: 3 }
];

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taches, setTaches] = useState([]);
  const [historique, setHistorique] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const verifierSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/connexion");
      } else {
        setUser(session.user);
        chargerHistorique(session.user.id);
      }
      setLoading(false);
    };
    verifierSession();
  }, []);

  const chargerHistorique = async (userId) => {
    const { data, error } = await supabase
      .from("journal")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (!error) {
      setHistorique(data);
    } else {
      console.error("Erreur chargement historique :", error.message);
    }
  };

  useEffect(() => {
    const sauvegardeTaches = localStorage.getItem("tachesNourRise");
    if (sauvegardeTaches) {
      setTaches(JSON.parse(sauvegardeTaches));
    } else {
      setTaches(tachesJournalieresInitiales.map((t) => ({ ...t, etat: "" })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tachesNourRise", JSON.stringify(taches));
  }, [taches]);

  const calculerTaux = () => {
    const totalPossible = taches.reduce((acc, t) => acc + t.coef, 0);
    const totalReussi = taches.reduce((acc, t) => {
      if (t.etat === "Terminé") return acc + t.coef;
      if (t.etat === "En cours") return acc + t.coef * 0.5;
      return acc;
    }, 0);
    return Math.round((totalReussi / totalPossible) * 100);
  };

  const calculerNote = (taux) => Math.round((taux / 5) * 10) / 10;

  const ajouterJournee = async () => {
    if (!user) return alert("Utilisateur non connecté");

    const taux = calculerTaux();
    const note = calculerNote(taux);

    const nouvelleJournee = {
      user_id: user.id,
      date: format(new Date(), "yyyy-MM-dd"),
      taux_reussite: taux,
      note,
      taches: taches.map(({ nom, coef, etat }) => ({ nom, coef, etat })),
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from("journal").insert([nouvelleJournee]);

    if (error) {
      console.error("Erreur Supabase :", error.message);
    } else {
      setHistorique([nouvelleJournee, ...historique]);
      setTaches(tachesJournalieresInitiales.map((t) => ({ ...t, etat: "" })));
    }
  };

  const supprimerJournee = (index) => {
    const nouveauHistorique = [...historique];
    nouveauHistorique.splice(index, 1);
    setHistorique(nouveauHistorique);
  };

  const ajouterTache = () => {
    const nom = prompt("Nom de la nouvelle tâche :");
    const coef = parseInt(prompt("Coefficient (1 à 5) :"), 10);
    if (nom && coef > 0 && coef <= 5) {
      setTaches([...taches, { nom, coef, etat: "" }]);
    }
  };

  const supprimerTache = (index) => {
    if (confirm("Supprimer cette tâche ?")) {
      const nouvellesTaches = [...taches];
      nouvellesTaches.splice(index, 1);
      setTaches(nouvellesTaches);
    }
  };

  const seDeconnecter = async () => {
    await supabase.auth.signOut();
    router.push("/connexion");
  };

  if (loading) {
    return <p className="text-center mt-20">Chargement...</p>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen rounded-lg shadow-xl animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700">🚀 NourRise - Global View</h1>
        <button
          onClick={seDeconnecter}
          className="text-red-500 hover:text-red-700 font-semibold border border-red-500 px-4 py-2 rounded"
        >
          Se déconnecter
        </button>
      </div>

      <div className="p-6 mb-8 bg-white rounded-xl shadow-md border border-blue-300">
        <h2 className="text-2xl font-bold mb-4 text-blue-600 text-center">🌟 Résumé de ta Journée</h2>
        <p className="text-center text-lg">
          Taux de réussite : <span className="font-bold">{historique[0]?.taux_reussite || 0}%</span>
        </p>
        <p className="text-center text-lg">
          Note sur 20 : <span className="font-bold">{historique[0]?.note || 0}/20</span>
        </p>
      </div>

      <div className="flex justify-between mb-6">
        <button onClick={ajouterTache} className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition">
          ➕ Ajouter une tâche
        </button>
        <button onClick={ajouterJournee} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition">
          ✅ Valider la journée
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {taches.map((tache, index) => (
            <div key={index} className="flex justify-between items-center bg-white p-4 rounded-lg shadow hover:shadow-md transition">
              <span className="font-medium">{tache.nom}</span>
              <select
                className="border rounded p-2"
                value={tache.etat}
                onChange={(e) => {
                  const updated = [...taches];
                  updated[index].etat = e.target.value;
                  setTaches(updated);
                }}
              >
                <option value="">Choisir</option>
                <option value="Terminé">Fait</option>
                <option value="En cours">En cours</option>
                <option value="Non fait">Non fait</option>
              </select>
              <button
                onClick={() => supprimerTache(index)}
                className="ml-4 text-red-500 hover:text-red-700 font-semibold"
              >
                ✖️
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-8">
          {historique.length > 0 && (
            <>
              <GraphiqueEvolution historique={historique} />
              <GraphiqueNote historique={historique} />
            </>
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">📅 Historique</h2>
        {historique.map((jour, index) => (
          <div key={index} className="flex justify-between items-center bg-white p-4 rounded-lg mb-4 shadow hover:shadow-md transition">
            <div>
              {jour.date} – {jour.taux_reussite}% – {jour.note}/20
            </div>
            <button
              onClick={() => supprimerJournee(index)}
              className="text-red-500 hover:underline ml-4"
            >
              🗑️ Supprimer
            </button>
          </div>
        ))}
      </div>

      {historique.length > 0 && (
        <div className="mt-10">
          <AnalyseIA tauxReussite={historique[0].taux_reussite} note={historique[0].note} />
        </div>
      )}
    </div>
  );
}