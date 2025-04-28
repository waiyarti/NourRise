import { useEffect, useState } from "react";
import AnalyseIA from "../components/AnalyseIA";

export default function Analyse() {
  const [historique, setHistorique] = useState([]);

  useEffect(() => {
    const historiqueSauvegarde = localStorage.getItem("historiqueNourRise");
    if (historiqueSauvegarde) {
      setHistorique(JSON.parse(historiqueSauvegarde));
    }
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-green-600">🤖 Analyse IA Complète</h1>
      {historique.length > 0 ? (
        <AnalyseIA tauxReussite={historique[0].tauxReussite} note={historique[0].note} />
      ) : (
        <p className="text-center text-gray-500">Pas assez de données pour analyser.</p>
      )}
    </div>
  );
}