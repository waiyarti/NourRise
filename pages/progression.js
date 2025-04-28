import { useEffect, useState } from "react";
import GraphiqueEvolution from "../../components/GraphiqueEvolution";

export default function ProgressionPage() {
  const [historique, setHistorique] = useState([]);

  useEffect(() => {
    const historiqueSauvegarde = localStorage.getItem("historiqueNourRise");
    if (historiqueSauvegarde) {
      setHistorique(JSON.parse(historiqueSauvegarde));
    }
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6 text-blue-700">📈 Suivi de ta progression</h1>
      {historique.length > 0 ? (
        <GraphiqueEvolution historique={historique} />
      ) : (
        <p className="text-gray-500">Aucune donnée pour générer un graphique. Valide une journée pour commencer.</p>
      )}
    </div>
  );
}