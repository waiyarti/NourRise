import { useEffect, useState } from "react";
import AnalyseIA from "../composants/AnalyseIA";

export default function AnalysePage() {
  const [historique, setHistorique] = useState([]);

  useEffect(() => {
    const historiqueSauvegarde = localStorage.getItem("historiqueNourRise");
    if (historiqueSauvegarde) {
      setHistorique(JSON.parse(historiqueSauvegarde));
    }
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6 text-purple-700">🧠 Analyse IA Personnalisée</h1>
      {historique.length > 0 ? (
        <AnalyseIA
          tauxReussite={historique[0].tauxReussite}
          note={historique[0].note}
        />
      ) : (
        <p className="text-gray-500">Aucune donnée analysable pour l’instant. Valide une journée pour lancer ton analyse IA.</p>
      )}
    </div>
  );
}