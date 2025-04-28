import { useState, useEffect } from "react";
import GraphiqueEvolution from "../composants/GraphiqueEvolution";
import GraphiqueNote from "../composants/GraphiqueNote";

export default function ProgressionPage() {
  const [historique, setHistorique] = useState([]);

  useEffect(() => {
    const historiqueSauvegarde = localStorage.getItem("historiqueNourRise");
    if (historiqueSauvegarde) {
      setHistorique(JSON.parse(historiqueSauvegarde));
    }
  }, []);

  return (
    <div className="p-10 max-w-7xl mx-auto fade-in">
      <h1 className="text-4xl font-extrabold text-center mb-10 text-purple-600 tracking-wide">
        📈 Suivi de ta progression
      </h1>

      {historique.length > 0 ? (
        <div className="space-y-12">
          <GraphiqueEvolution historique={historique} />
          <GraphiqueNote historique={historique} />
        </div>
      ) : (
        <p className="text-center text-gray-500 text-lg mt-10">
          Aucune donnée disponible pour générer un graphique.<br />
          Valide une journée pour commencer ton suivi !
        </p>
      )}
    </div>
  );
}