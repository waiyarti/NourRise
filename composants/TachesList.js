// Fichier : composants/TachesList.js
export default function TachesList({ taches, setTaches }) {
  return (
    <div className="space-y-4">
      {taches.map((tache, index) => (
        <div key={index} className="flex justify-between items-center bg-white p-4 rounded shadow hover:bg-blue-50 transition">
          <span className="font-medium">{tache.nom}</span>
          <select
            className="border border-gray-300 rounded p-2"
            value={tache.etat}
            onChange={(e) => {
              const updated = [...taches];
              updated[index].etat = e.target.value;
              setTaches(updated);
            }}
          >
            <option value="">Choisir</option>
            <option value="Terminé">Terminé</option>
            <option value="En cours">En cours</option>
            <option value="Non fait">Non fait</option>
          </select>
        </div>
      ))}
    </div>
  );
}