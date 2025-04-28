import { useState, useEffect } from "react";
import { format } from "date-fns";
import TachesList from "../composants/TachesList";
import Graphiques from "../composants/Graphiques";
import AnalyseIA from "../composants/AnalyseIA";

const tachesInitiales = [
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
  const [taches, setTaches] = useState([]);
  const [historique, setHistorique] = useState([]);

  useEffect(() => {
    const sauvegardeTaches = localStorage.getItem("tachesNourRise");
    const sauvegardeHistorique = localStorage.getItem("historiqueNourRise");
    setTaches(sauvegardeTaches ? JSON.parse(sauvegardeTaches) : tachesInitiales.map(t => ({ ...t, etat: "" })));
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

  const ajouterJournee = () => {
    const taux = calculerTaux();
    const note = calculerNote(taux);
    const nouvelleJournee = {
      date: format(new Date(), "dd/MM/yyyy"),
      tauxReussite: taux,
      note
    };
    setHistorique([nouvelleJournee, ...historique]);
    setTaches(taches.map(t => ({ ...t, etat: "" })));
  };

  const supprimerJournee = (index) => {
    const nouvelHistorique = [...historique];
    nouvelHistorique.splice(index, 1);
    setHistorique(nouvelHistorique);
  };

  const ajouterTache = (nom, coef) => {
    setTaches([...taches, { nom, coef: parseInt(coef), etat: "" }]);
  };

  const supprimerTache = (index) => {
    const nouvellesTaches = [...taches];
    nouvellesTaches.splice(index, 1);
    setTaches(nouvellesTaches);
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-700">🚀 NourRise Premium</h1>

      <div className="bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-100 border border-yellow-400 rounded-lg p-6 mb-8 text-center shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          % de réussite aujourd'hui : {historique[0]?.tauxReussite || 0}%
        </h2>
        <h3 className="text-xl text-gray-700">
          Note sur 20 : {historique[0]?.note || 0}/20
        </h3>
      </div>

      <TachesList taches={taches} setTaches={setTaches} ajouterTache={ajouterTache} supprimerTache={supprimerTache} />

      <button
        onClick={ajouterJournee}
        className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg w-full transition-all"
      >
        ✅ Valider ma journée
      </button>

      {historique.length > 0 && (
        <>
          <div className="my-12">
            <Graphiques historique={historique} />
          </div>

          <div className="mt-10 bg-gray-100 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">📅 Historique des Journées</h2>
            {historique.map((jour, index) => (
              <div key={index} className="flex justify-between items-center mb-4 p-4 bg-white rounded shadow-sm">
                <div>
                  {jour.date} - {jour.tauxReussite}% - {jour.note}/20
                </div>
                <button
                  onClick={() => supprimerJournee(index)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <AnalyseIA tauxReussite={historique[0].tauxReussite} note={historique[0].note} />
          </div>
        </>
      )}
    </div>
  );
}