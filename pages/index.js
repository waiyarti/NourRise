import { useState, useEffect } from "react";
import { format } from "date-fns";
import TachesList from "../composants/TachesList";
import Graphiques from "../composants/Graphiques";
import MotivationQuote from "../composants/MotivationQuote";
import Confetti from "../composants/Confetti";

export default function Home() {
  const [taches, setTaches] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [confettiVisible, setConfettiVisible] = useState(false);

  useEffect(() => {
    const tachesSauvegarde = localStorage.getItem("tachesNourRise");
    const historiqueSauvegarde = localStorage.getItem("historiqueNourRise");
    if (tachesSauvegarde) {
      setTaches(JSON.parse(tachesSauvegarde));
    } else {
      // Valeurs par défaut si rien n'est enregistré
      setTaches([
        { nom: "Coran", coef: 5, etat: "" },
        { nom: "Révision", coef: 4, etat: "" },
        { nom: "Entraînement", coef: 3, etat: "" },
      ]);
    }
    if (historiqueSauvegarde) {
      setHistorique(JSON.parse(historiqueSauvegarde));
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
    return totalPossible ? Math.round((totalReussi / totalPossible) * 100) : 0;
  };

  const calculerNote = (taux) => Math.round((taux / 5) * 10) / 10;

  const ajouterJournee = () => {
    const taux = calculerTaux();
    const note = calculerNote(taux);
    const nouvelleJournee = {
      date: format(new Date(), "dd/MM/yyyy"),
      tauxReussite: taux,
      note,
    };
    setHistorique([nouvelleJournee, ...historique]);
    setTaches(taches.map((t) => ({ ...t, etat: "" })));
    lancerConfetti();
    jouerSonValidation();
  };

  const supprimerJournee = (index) => {
    const nouveauHistorique = [...historique];
    nouveauHistorique.splice(index, 1);
    setHistorique(nouveauHistorique);
  };

  const ajouterTache = (nom, coef) => {
    if (nom.trim() === "" || coef <= 0) return;
    setTaches([...taches, { nom, coef, etat: "" }]);
  };

  const supprimerTache = (index) => {
    const nouvellesTaches = [...taches];
    nouvellesTaches.splice(index, 1);
    setTaches(nouvellesTaches);
  };

  const lancerConfetti = () => {
    setConfettiVisible(true);
    setTimeout(() => setConfettiVisible(false), 3000);
  };

  const jouerSonValidation = () => {
    const audio = new Audio("/success.mp3");
    audio.volume = 0.2;
    audio.play();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-blue-800 mb-6 animate-fade-in-up">🚀 NourRise Premium</h1>

        <MotivationQuote />

        <div className="flex flex-col md:flex-row gap-8 mt-8">
          <div className="w-full md:w-1/2">
            <TachesList
              taches={taches}
              setTaches={setTaches}
              ajouterTache={ajouterTache}
              supprimerTache={supprimerTache}
            />
          </div>

          <div className="w-full md:w-1/2">
            <Graphiques historique={historique} />
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center">
          <button
            onClick={ajouterJournee}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300"
          >
            ✅ Valider ma journée
          </button>

          <div className="mt-8 w-full">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">📅 Historique</h2>
            {historique.length === 0 ? (
              <p className="text-gray-500">Aucun jour validé encore.</p>
            ) : (
              historique.map((jour, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-white p-4 rounded-lg mb-4 shadow hover:shadow-md transition"
                >
                  <div>
                    {jour.date} – {jour.tauxReussite}% – {jour.note}/20
                  </div>
                  <button
                    onClick={() => supprimerJournee(index)}
                    className="text-red-500 hover:text-red-700 font-semibold"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {confettiVisible && <Confetti />}
      </div>
    </div>
  );
}