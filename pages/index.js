import { useState, useEffect } from "react";
import { format } from "date-fns";
import AnalyseIA from "../composants/AnalyseIA";
import Graphiques from "../composants/Graphiques";
import TachesList from "../composants/TachesList";

const tachesJournalieresInit = [
  { nom: "Coran", coef: 5 },
  { nom: "Révision", coef: 4 },
  { nom: "Entraînement physique", coef: 3 },
  { nom: "Lecture bénéfique", coef: 3 },
  { nom: "Dou‘a matin et soir", coef: 5 },
  { nom: "Formation IA", coef: 4 },
  { nom: "Tafsir du Coran", coef: 4 },
  { nom: "Business/Projets", coef: 3 }
];

export default function Home() {
  const [taches, setTaches] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [niveau, setNiveau] = useState(1);
  const [experience, setExperience] = useState(0);

  useEffect(() => {
    const data = localStorage.getItem("nourriseData");
    if (data) {
      const { taches, historique, niveau, experience } = JSON.parse(data);
      setTaches(taches);
      setHistorique(historique);
      setNiveau(niveau);
      setExperience(experience);
    } else {
      setTaches(tachesJournalieresInit.map(t => ({ ...t, etat: "" })));
    }
  }, []);

  useEffect(() => {
    const data = { taches, historique, niveau, experience };
    localStorage.setItem("nourriseData", JSON.stringify(data));
  }, [taches, historique, niveau, experience]);

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
    gagnerExperience(100);
  };

  const gagnerExperience = (xp) => {
    let total = experience + xp;
    let newNiveau = niveau;
    while (total >= 500) {
      total -= 500;
      newNiveau += 1;
    }
    setExperience(total);
    setNiveau(newNiveau);
  };

  const supprimerJournee = (index) => {
    const nouveauHistorique = [...historique];
    nouveauHistorique.splice(index, 1);
    setHistorique(nouveauHistorique);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto fade-in">
      <h1 className="text-4xl font-bold text-center mb-6 text-gradient">🚀 NourRise Premium</h1>

      <div className="stats-container mb-10">
        <div className="stat-card">
          <h2>🎯 Taux de réussite</h2>
          <p className="text-xl font-bold">{historique[0]?.tauxReussite || 0}%</p>
        </div>
        <div className="stat-card">
          <h2>⭐ Note</h2>
          <p className="text-xl font-bold">{historique[0]?.note || 0}/20</p>
        </div>
        <div className="stat-card">
          <h2>🧠 Niveau</h2>
          <p className="text-xl font-bold">{niveau}</p>
        </div>
        <div className="stat-card">
          <h2>🔥 Expérience</h2>
          <p className="text-xl font-bold">{experience}/500 XP</p>
        </div>
      </div>

      <TachesList taches={taches} setTaches={setTaches} />

      <button onClick={ajouterJournee} className="btn-primary mt-8">
        ✅ Valider ma journée
      </button>

      {historique.length > 0 && (
        <>
          <Graphiques historique={historique} />
          <AnalyseIA tauxReussite={historique[0].tauxReussite} note={historique[0].note} />
        </>
      )}

      <div className="mt-14">
        <h2 className="text-2xl font-semibold mb-4">📅 Historique des Journées</h2>
        {historique.map((jour, index) => (
          <div key={index} className="history-card">
            {jour.date} — {jour.tauxReussite}% — {jour.note}/20
            <button onClick={() => supprimerJournee(index)} className="delete-btn">Supprimer</button>
          </div>
        ))}
      </div>
    </div>
  );
}