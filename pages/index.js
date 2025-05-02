import { useState, useEffect } from "react";
import { format } from "date-fns";
import AnalyseIA from "../composants/AnalyseIA";
import GraphiqueEvolution from "../composants/GraphiqueEvolution";
import GraphiqueNote from "../composants/GraphiqueNote";
import { supabase } from "../supabaseClient"; // ✅ AJOUTÉ

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
  const [taches, setTaches] = useState([]);
  const [historique, setHistorique] = useState([]);

  useEffect(() => {
    const sauvegardeTaches = localStorage.getItem("tachesNourRise");
    const sauvegardeHistorique = localStorage.getItem("historiqueNourRise");

    if (sauvegardeTaches) {
      setTaches(JSON.parse(sauvegardeTaches));
    } else {
      setTaches(tachesJournalieresInitiales.map((t) => ({ ...t, etat: "" })));
    }

    if (sauvegardeHistorique) {
      setHistorique(JSON.parse(sauvegardeHistorique));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tachesNourRise", JSON.stringify(taches));
    localStorage.setItem("historiqueNourRise", JSON.stringify(historique));
  }, [taches, historique]);

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
    const taux = calculerTaux();
    const note = calculerNote(taux);
    const nouvelleJournee = {
      date: format(new Date(), "yyyy-MM-dd"),
      taux_reussite: taux,
      note,
      taches: taches.map(({ nom, coef, etat }) => ({ nom, coef, etat })),
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from("journal").insert([nouvelleJournee]);

    if (error) {
      console.error("❌ Erreur Supabase :", error.message);
    } else {
      console.log("✅ Journée enregistrée dans Supabase !");
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
    const nom = prompt("Entre le nom de la nouvelle tâche :");
    const coef = parseInt(prompt("Entre son coefficient (1 à 5) :"), 10);

    if (nom && coef && coef > 0 && coef <= 5) {
      const nouvelleTache = { nom, coef, etat: "" };
      setTaches([...taches, nouvelleTache]);
    }
  };

  const supprimerTache = (index) => {
    if (confirm("Es-tu sûr de vouloir supprimer cette tâche ?")) {
      const nouvellesTaches = [...taches];
      nouvellesTaches.splice(index, 1);
      setTaches(nouvellesTaches);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen rounded-lg shadow-xl animate-fadeIn">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-700 tracking-wide">🚀 NourRise - Global View</h1>

      <div className="p-6 mb-8 bg-white rounded-xl shadow-md border border-blue-300">
        <h2 className="text-2xl font-bold mb-4 text-blue-600 text-center">🌟 Résumé de ta Journée</h2>
        <p className="text-center text-lg">
          Taux de réussite : <span className="font-bold">{historique[0]?.tauxReussite || 0}%</span>
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
              {jour.date} – {jour.tauxReussite}% – {jour.note}/20
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
          <AnalyseIA tauxReussite={historique[0].tauxReussite} note={historique[0].note} />
        </div>
      )}
    </div>
  );
}
