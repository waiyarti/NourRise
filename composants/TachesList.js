import React from "react";

export default function TachesList({ taches, setTaches }) {
  const handleChangeEtat = (index, nouvelEtat) => {
    const updatedTaches = [...taches];
    updatedTaches[index].etat = nouvelEtat;
    setTaches(updatedTaches);
  };

  return (
    <div className="space-y-6">
      {taches.map((tache, index) => (
        <div
          key={index}
          className="flex justify-between items-center bg-white p-4 rounded shadow hover:bg-blue-50 transition"
        >
          <span className="font-medium">{tache.nom}</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleChangeEtat(index, "Terminé")}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Terminé
            </button>
            <button
              onClick={() => handleChangeEtat(index, "En cours")}
              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
            >
              En cours
            </button>
            <button
              onClick={() => handleChangeEtat(index, "Non fait")}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Non fait
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}