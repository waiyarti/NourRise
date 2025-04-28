import { useState, useEffect } from "react";
import { format } from "date-fns";
import AnalyseIA from "../composants/AnalyseIA";
import GraphiqueEvolution from "../composants/GraphiqueEvolution";
import GraphiqueNote from "../composants/GraphiqueNote";

const tachesJournalieres = [
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
  { nom: "Formation religieuse", coef: 3 },
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
  const [taches, setTaches] = useState(tachesJournalieres.map((t) => ({ ...t, etat: "" })));
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const historiqueSauvegarde = localStorage.getItem("historiqueNourRise");
    if (historiqueSauvegarde) {
      setHistorique(JSON.parse(historiqueSauvegarde));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("historiqueNourRise", JSON.stringify(historique));
  }, [historique]);

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
    setLoading(true);
    setTimeout(() => {
      const taux = calculerTaux();
      const note = calculerNote(taux);
      const nouvelleJournee = {
        date: format(new Date(), "dd/MM/yyyy"),
        tauxReussite: taux,
        note
      };
      setHistorique([nouvelleJournee, ...historique]);
      setTaches(tachesJournalieres.map((t) => ({ ...t, etat: "" })));
      setLoading(false);
    }, 1200);
  };

  const supprimerJournee = (index) => {
    const nouveauHistorique = [...historique];
    nouveauHistorique.splice(index, 1);
    setHistorique(nouveauHistorique);
  };

  const niveau = Math.floor((historique[0]?.tauxReussite || 0) / 10);

  return (
    <div className="p-8 max-w-6xl mx-auto fade-in">
      <h1 className="title-main">🚀 NourRise Premium</h1>

      <div className="card glass">
        <h2 className="title-section">Résumé du jour</h2>
        <p className="text-lg">🎯 % de réussite : <span className="font-bold">{historique[0]?.tauxReussite || 0}%</span></p>
        <p className="text-lg">⭐ Note : <span className="font-bold">{historique[0]?.note || 0}/20</span></p>
      </div>

      <div className="mb-6 text-center font-bold text-green-600">
        Niveau {niveau}
        <div className="w-full bg-gray-200 rounded-full mt-2">
          <div className="progress-bar" style={{ width: `${historique[0]?.tauxReussite || 0}%` }}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {taches.map((tache, index) => (
            <div key={index} className="card flex justify-between items-center">
              <span>{tache.nom}</span>
              <select
                className="select-tache"
                value={tache.etat}
                onChange={(e) => {
                  const updated = [...taches];
                  updated[index].etat = e.target.value;
                  setTaches(updated);
                }}
              >
                <option value="">Choisir</option>
                <option value="Terminé">Terminé</option>
                <option value="En cours">En cours</option>
                <option value="Non fait">Non fait</option>
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

      {loading ? (
        <div className="loader mt-8"></div>
      ) : (
        <button onClick={ajouterJournee} className="button-primary mt-8 w-full">
          Valider ma journée 🚀
        </button>
      )}

      <div className="mt-12">
        <h2 className="title-section">📅 Historique</h2>
        {historique.map((jour, index) => (
          <div key={index} className="historique-card">
            <div>
              {jour.date} — {jour.tauxReussite}% — {jour.note}/20
            </div>
            <button
              onClick={() => supprimerJournee(index)}
              className="text-red-500 hover:text-red-700"
            >
              🗑️ Supprimer
            </button>
          </div>
        ))}
      </div>

      {historique.length > 0 && (
        <div className="mt-12">
          <AnalyseIA tauxReussite={historique[0].tauxReussite} note={historique[0].note} />
        </div>
      )}
    </div>
  );
}