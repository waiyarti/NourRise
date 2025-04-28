import React from "react";
import GraphiqueEvolution from "./GraphiqueEvolution";
import GraphiqueNote from "./GraphiqueNote";

export default function Graphiques({ historique }) {
  if (!historique.length) {
    return (
      <p className="text-center text-gray-500">
        Aucun graphique disponible. Commence par valider une journée !
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <GraphiqueEvolution historique={historique} />
      <GraphiqueNote historique={historique} />
    </div>
  );
}