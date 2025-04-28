import { useEffect, useState } from "react";
import GraphiqueProgression from "../components/GraphiqueProgression";
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
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-blue-600">📊 Progression complète</h1>
      {historique.length > 0 ? (
        <>
          <GraphiqueProgression historique={historique} />
          <GraphiqueNote historique={historique} />
        </>
      ) : (
        <p className="text-center text-gray-500">Pas encore d'historique enregistré.</p>
      )}
    </div>
  );
}