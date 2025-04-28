import React from "react";

export default function AnalyseIA({ tauxReussite, note }) {
  let message = "";

  if (tauxReussite >= 85) {
    message = "Excellent travail ! Reste constant, la persévérance mène au succès.";
  } else if (tauxReussite >= 60) {
    message = "Bon début ! Renforce ta rigueur pour aller encore plus loin.";
  } else {
    message = "Ne lâche pas ! Travaille un peu plus chaque jour, tu es capable !";
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md text-center mt-12">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">📊 Analyse IA du jour</h2>
      <p className="text-lg text-gray-700">{message}</p>
      <p className="text-sm text-gray-500 mt-2">
        Taux de réussite : {tauxReussite}% — Note : {note}/20
      </p>
    </div>
  );
}