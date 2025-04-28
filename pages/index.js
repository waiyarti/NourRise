import { useState, useEffect } from "react";
import { format } from "date-fns";
import AnalyseIA from "../composants/AnalyseIA";
import GraphiqueEvolution from "../composants/GraphiqueEvolution";
import GraphiqueNote from "../composants/GraphiqueNote";

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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const historiqueSauvegarde = localStorage.getItem("historiqueNourRise");
    if (historiqueSauvegarde) {
      setHistorique(JSON.parse(historiqueSauvegarde));
    }

    const tachesSauvegarde = localStorage.getItem("tachesNourRise");
    if (tachesSauvegarde) {
      setTaches(JSON.parse(tachesSauvegarde));
    } else {
      setTaches(tachesJournalieresInitiales);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("historiqueNourRise", JSON.stringify(historique));
  }, [historique]);

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

  const ajouterJournee = () => {
    setIsLoading(true);
    setTimeout(() => {
      const taux = calculerTaux();
      const note = calculerNote(taux);
      const nouvelleJournee = {
        date: format(new Date(), "dd/MM/yyyy"),
        tauxReussite: taux,
        note
      };
      setHistorique([nouvelleJournee, ...historique]);
      setTaches(tachesJournalieresInitiales.map((t) => ({ ...t, etat: "" })));
      setIsLoading(false);
    }, 2000); // 2 secondes de "suspens"
  };

  const supprimerJournee = (index) => {
    const nouveauHistorique = [...historique];
    nouveauHistorique.splice(index, 1);
    setHistorique(nouveauHistorique);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gradient-to-tr from-blue-50 to-white min-h-screen rounded-lg shadow-xl fade-in">
      <h1 className="text-4xl font-bold mb-10 text-center text-blue-700 tracking-wide animate-pulse">🚀 NourRise Premium</h1>

      <div className="p-6 mb-8 bg-white rounded-lg shadow-md border border-blue-300 slide-in">
        <h2 className="text-2xl font-semibold mb-4 text-center text-blue-600">Résumé du jour</h2>
        <p className="text-center text-lg">
          🎯 Taux de réussite : <span className="font-bold">{historique[0]?.tauxReussite || 0}%</span>
        </p>
        <p className="text-center text-lg">
          ⭐ Note : <span className="font-bold">{historique[0]?.note || 0}/20</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          {taches.map((tache, index) => (
            <div key={index} className="flex justify-between items-center bg-white p-4 rounded-lg shadow hover:bg-blue-50 transition">
              <span className="font-semibold">{tache.nom}</span>
              <select
                className="border border-gray-300 rounded p-2"
                value={tache.etat || ""}
                onChange={(e) => {
                  const updated = [...taches];
                  updated[index].etat = e.target.value;
                  setTaches(updated);
                }}
              >
                <option value="">Choisir</option>
                <option value="Terminé">Fait</option>
                <option value="En cours">En cours</option>
                <option value="Non fait">Pas fait</option>
              </select>
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

      <button
        onClick={ajouterJournee}
        className="mt-12 w-full p-5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition text-xl font-bold tracking-wide"
      >
        {isLoading ? "Validation en cours..." : "✅ Valider ma journée"}
      </button>

      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6 text-gray-700">📅 Historique</h2>
        {historique.map((jour, index) => (
          <div key={index} className="flex justify-between items-center bg-white p-4 rounded-lg shadow mb-4 hover:shadow-lg transition-all">
            <div>
              {jour.date} – {jour.tauxReussite}% – {jour.note}/20
            </div>
            <button
              onClick={() => supprimerJournee(index)}
              className="text-red-500 hover:text-red-700 font-bold"
            >
              🗑️ Supprimer
            </button>
          </div>
        ))}
      </div>

      {historique.length > 0 && (
        <div className="mt-12">
          <AnalyseIA tauxReussite={historique[0]?.tauxReussite} note={historique[0]?.note} />
        </div>
      )}
    </div>
  );
}