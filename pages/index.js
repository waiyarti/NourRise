import { useState, useEffect } from "react";
import { format } from "date-fns";
import TachesList from "../composants/TachesList";
import Graphiques from "../composants/Graphiques";
import AnalyseIA from "../composants/AnalyseIA";

const tachesDeBase = [
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
  const [taches, setTaches] = useState(tachesDeBase.map((t) => ({ ...t, etat: "" })));
  const [historique, setHistorique] = useState([]);

  useEffect(() => {
    const data = localStorage.getItem("historiqueNourRise");
    if (data) {
      setHistorique(JSON.parse(data));
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
    const taux = calculerTaux();
    const note = calculerNote(taux);
    const nouvelleJournee = {
      date: format(new Date(), "dd/MM/yyyy"),
      tauxReussite: taux,
      note
    };
    setHistorique([nouvelleJournee, ...historique]);
    setTaches(tachesDeBase.map((t) => ({ ...t, etat: "" })));
  };

  return (
    <div className="p-10 max-w-7xl mx-auto bg-gray-50 min-h-screen rounded-lg shadow-md">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-700 tracking-wide">🚀 NourRise Premium</h1>

      <div className="p-6 mb-8 bg-white rounded-lg shadow-sm border border-blue-300">
        <h2 className="text-2xl font-semibold mb-2 text-blue-600 text-center">Résumé du jour</h2>
        <p className="text-center text-lg">🎯 % de réussite : <span className="font-bold">{historique[0]?.tauxReussite || 0}%</span></p>
        <p className="text-center text-lg">⭐ Note sur 20 : <span className="font-bold">{historique[0]?.note || 0}/20</span></p>
      </div>

      <TachesList taches={taches} setTaches={setTaches} />
      
      <button
        onClick={ajouterJournee}
        className="mt-10 w-full p-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-lg font-semibold"
      >
        ✅ Valider ma journée
      </button>

      {historique.length > 0 && (
        <>
          <Graphiques historique={historique} />
          <AnalyseIA tauxReussite={historique[0].tauxReussite} note={historique[0].note} />
        </>
      )}
    </div>
  );
}