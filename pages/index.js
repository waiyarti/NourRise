// Fichier : pages/index.js
import { useState, useEffect } from "react";
import { format } from "date-fns";
import TachesList from "../composants/TachesList";
import Graphiques from "../composants/Graphiques";

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
  const [niveau, setNiveau] = useState(1);
  const [xp, setXp] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const historiqueSauvegarde = localStorage.getItem("historiqueNourRise");
    if (historiqueSauvegarde) {
      setHistorique(JSON.parse(historiqueSauvegarde));
    }
    setTimeout(() => setIsLoading(false), 1000);
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
    setTaches(tachesJournalieres.map((t) => ({ ...t, etat: "" })));

    // Animation XP + Son
    let gainedXp = 10 + Math.floor(taux / 10);
    const newXp = xp + gainedXp;
    if (newXp >= 100) {
      setNiveau(niveau + 1);
      setXp(newXp - 100);
    } else {
      setXp(newXp);
    }

    if (typeof window !== "undefined") {
      const audio = new Audio("/success.mp3");
      audio.play().catch(() => {});
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto fade-in">
      {isLoading ? (
        <div className="loader mt-40"></div>
      ) : (
        <>
          <h1 className="text-4xl font-bold mb-8 text-center text-blue-700 tracking-wide">🚀 NourRise Premium</h1>

          <div className="p-6 mb-8 bg-white rounded-lg shadow-sm border border-blue-300 slide-in-bottom">
            <h2 className="text-2xl font-semibold mb-2 text-center">Résumé du jour</h2>
            <p className="text-center text-lg">🎯 % de réussite : <span className="font-bold">{historique[0]?.tauxReussite || 0}%</span></p>
            <p className="text-center text-lg">⭐ Note : <span className="font-bold">{historique[0]?.note || 0}/20</span></p>
          </div>

          <TachesList taches={taches} setTaches={setTaches} />

          <button onClick={ajouterJournee} className="mt-10 w-full p-4 bg-green-500 hover:bg-green-600 text-white rounded transition text-lg font-semibold">
            🎯 Valider ma journée
          </button>

          <div className="mt-10">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Niveau {niveau}</h2>
              <div className="w-full bg-gray-300 rounded-full h-3">
                <div className="progress-bar" style={{ width: `${xp}%` }}></div>
              </div>
            </div>

            {historique.length > 0 && (
              <Graphiques historique={historique} />
            )}
          </div>
        </>
      )}
    </div>
  );
}