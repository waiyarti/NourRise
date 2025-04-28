import { useState } from "react";

export default function TachesList({ taches, setTaches, ajouterTache, supprimerTache }) {
  const [nouvelleTache, setNouvelleTache] = useState("");
  const [nouveauCoef, setNouveauCoef] = useState(1);

  const handleChangeEtat = (index, etat) => {
    const updated = [...taches];
    updated[index].etat = etat;
    setTaches(updated);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in-up">
      <h2 className="text-2xl font-semibold mb-4 text-blue-700">✅ Tes missions</h2>

      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
        {taches.map((tache, index) => (
          <div key={index} className="flex justify-between items-center border-b pb-2">
            <span>{tache.nom}</span>
            <select
              className="border rounded p-2"
              value={tache.etat}
              onChange={(e) => handleChangeEtat(index, e.target.value)}
            >
              <option value="">Statut</option>
              <option value="Terminé">Fait</option>
              <option value="En cours">En cours</option>
              <option value="Non fait">Pas fait</option>
            </select>
            <button
              onClick={() => supprimerTache(index)}
              className="text-red-500 hover:text-red-700 text-sm ml-2"
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">➕ Ajouter une tâche</h3>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            className="border p-2 rounded"
            placeholder="Nom de la tâche"
            value={nouvelleTache}
            onChange={(e) => setNouvelleTache(e.target.value)}
          />
          <input
            type="number"
            className="border p-2 rounded"
            placeholder="Coefficient (importance)"
            min="1"
            value={nouveauCoef}
            onChange={(e) => setNouveauCoef(parseInt(e.target.value))}
          />
          <button
            onClick={() => {
              ajouterTache(nouvelleTache, nouveauCoef);
              setNouvelleTache("");
              setNouveauCoef(1);
            }}
            className="bg-green-500 hover:bg-green-600 text-white py-2 rounded font-semibold"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}