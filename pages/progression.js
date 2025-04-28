import { useEffect, useState } from "react";
import GraphiqueEvolution from "../components/GraphiqueEvolution";
import GraphiqueNote from "../components/GraphiqueNote";

export default function Progression() {
  const [historique, setHistorique] = useState([]);

  useEffect(() => {
    const historiqueSauvegarde = localStorage.getItem("historiqueNourRise");
    if (historiqueSauvegarde) {
      setHistorique(JSON.parse(historiqueSauvegarde));
    }
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6 text-blue-600">📈 Progression quotidienne</h1>

      <GraphiqueEvolution historique={historique} />
      <GraphiqueNote historique={historique} />
    </div>
  );
}