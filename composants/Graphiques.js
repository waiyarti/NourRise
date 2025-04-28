import GraphiqueEvolution from "./GraphiqueEvolution";
import GraphiqueNote from "./GraphiqueNote";

export default function Graphiques({ historique }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in-up">
      <h2 className="text-2xl font-semibold mb-4 text-purple-700">📊 Tes Graphiques</h2>

      {historique.length > 0 ? (
        <div className="space-y-8">
          <GraphiqueEvolution historique={historique} />
          <GraphiqueNote historique={historique} />
        </div>
      ) : (
        <p className="text-gray-500">Pas encore de données. Valide ta première journée !</p>
      )}
    </div>
  );
}