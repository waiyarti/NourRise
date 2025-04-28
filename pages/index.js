import { useState, useEffect } from "react";
import { format } from "date-fns";
import AnalyseIA from "../components/AnalyseIA";
import GraphiqueEvolution from "../components/GraphiqueEvolution";
import Navbar from "../components/Navbar";

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
  const [taches, setTaches] = useState(tachesJournalieres.map((t) => ({ ...t, etat: "" })));
  const [historique, setHistorique] = useState([]);

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
    const taux = calculerTaux();
    const note = calculerNote(taux);
    const nouvelleJournee = {
      date: format(new Date(), "dd/MM/yyyy"),
      tauxReussite: taux,
      note
    };
    setHistorique([nouvelleJournee, ...historique]);
    setTaches(tachesJournalieres.map((t) => ({ ...t, etat: "" })));
  };

  const supprimerJournee = (index) => {
    const nouveauHistorique = [...historique];
    nouveauHistorique.splice(index, 1);
    setHistorique(nouveauHistorique);
  };

  const getBadgeAndMessage = (taux) => {
    if (taux >= 85) {
      return {
        badge: "🏆 OR",
        message: "Excellence ! Continue de viser haut, persévère et Allah t’élèvera bi idhnillah."
      };
    } else if (taux >= 60) {
      return {
        badge: "⚡ ARGENT",
        message: "Bien joué, continue d'améliorer ton sérieux chaque jour !"
      };
    } else {
      return {
        badge: "⏳ BRONZE",
        message: "Courage ! Les meilleurs sont ceux qui ne lâchent jamais. Allah est avec les patients."
      };
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-8 max-w-6xl mx-auto fade-in">
        <h1 className="text-3xl font-extrabold mb-6 text-blue-600">🚀 NourRise Premium</h1>

        <div className="card p-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 mb-6">
          <h2 className="text-2xl font-bold">
            % de réussite aujourd'hui : {historique[0]?.tauxReussite || 0}%
          </h2>
          <h3 className="text-xl mt-2">
            Note sur 20 : {historique[0]?.note || 0}/20
          </h3>
        </div>

        {/* Badge motivation IA */}
        {historique.length > 0 && (
          <div className="card p-6 mb-6 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-2">🎯 Ton badge aujourd'hui</h2>
            <div className="text-4xl">{getBadgeAndMessage(historique[0].tauxReussite).badge}</div>
            <p className="mt-4 text-center text-gray-700">{getBadgeAndMessage(historique[0].tauxReussite).message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {taches.map((tache, index) => (
              <div key={index} className="flex justify-between items-center card border-b pb-2 hover:bg-gray-100 transition-all duration-300">
                <span>{tache.nom}</span>
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
                  <option value="Terminé">✅ Terminé</option>
                  <option value="En cours">🕒 En cours</option>
                  <option value="Non fait">❌ Non fait</option>
                </select>
              </div>
            ))}
          </div>

          <div>
            {historique.length > 0 && (
              <GraphiqueEvolution historique={historique} />
            )}
          </div>
        </div>

        <button
          onClick={ajouterJournee}
          className="button-primary mt-8 w-full"
        >
          Valider ma journée 🚀
        </button>

        <div className="card p-6 mt-10">
          <h2 className="text-xl font-semibold mb-4">📅 Historique</h2>
          {historique.map((jour, index) => (
            <div key={index} className="flex justify-between items-center card p-3 mb-2 bg-gray-50 hover:shadow-lg transition-all duration-300">
              <div>
                {jour.date} - {jour.tauxReussite}% - {jour.note}/20
              </div>
              <button
                onClick={() => supprimerJournee(index)}
                className="text-red-600 hover:underline ml-4"
              >
                🗑️ Supprimer
              </button>
            </div>
          ))}
        </div>

        {historique.length > 0 && (
          <AnalyseIA
            tauxReussite={historique[0].tauxReussite}
            note={historique[0].note}
          />
        )}
      </div>
    </>
  );
}