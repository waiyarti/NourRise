import { useEffect, useState } from "react";
import AnalyseIA from "../../components/AnalyseIA";

export default function AnalysePage() {
  const [historique, setHistorique] = useState([]);

  useEffect(() => {
    const historiqueSauvegarde = localStorage.getItem("historiqueNourRise");
    if (historiqueSauvegarde) {
      setHistorique(JSON.parse(historiqueSauvegarde));
    }
  }, []);

  const tauxReussite = historique[0]?.tauxReussite || 0;
  const note = historique[0]?.note || 0;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6 text-green-700">🧠 Analyse de ta progression</h1>
      {historique.length > 0 ? (
        <AnalyseIA tauxReussite={tauxReussite} note={note} />
      ) : (
        <p className="text-gray-500">Aucune donnée disponible pour aujourd'hui. Valide une journée pour voir l'analyse.</p>
      )}
    </div>
  );
}