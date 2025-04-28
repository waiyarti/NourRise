import { useState, useEffect } from "react";
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
    <div className="p-10 max-w-7xl mx-auto slide-in-bottom">
      <h1 className="text-4xl font-extrabold text-center mb-10 text-green-600 tracking-wide">
        🧠 Analyse complète
      </h1>

      {historique.length > 0 ? (
        <AnalyseIA tauxReussite={historique[0].tauxReussite} note={historique[0].note} />
      ) : (
        <p className="text-center text-gray-500 text-lg">
          Commence à valider tes journées pour obtenir une analyse intelligente !
        </p>
      )}
    </div>
  );
}